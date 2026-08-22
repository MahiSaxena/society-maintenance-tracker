# System Design — Society Maintenance Tracker

## Complaint History Model

Every complaint needs an auditable record of its lifecycle — not just its current status, but who changed it, when, and why. There were two ways to model this: a separate `ComplaintHistory` collection referencing each complaint, or an embedded array inside the complaint document itself. I chose the embedded approach.

The reasoning is access pattern, not just simplicity. History is never queried independently of its complaint — a resident or admin always wants "this complaint's timeline," never "all history entries across all complaints." Embedding means the entire timeline arrives in a single `findById` or `find` query, with no join, no extra round trip, and no risk of the history and the complaint's current state drifting out of sync. A separate collection would only pay off if history needed independent querying (e.g. "show me all status changes made by admin X across every complaint"), which isn't a requirement here.

Each history entry stores `status`, `note`, `changedBy` (a reference to the user), `changedByName` (a denormalized snapshot), and `changedAt`. The denormalized name is a deliberate small tradeoff: it means the UI can render "Resolved by Admin" without a second lookup, at the cost of that name becoming stale if the admin later changes their display name — an acceptable tradeoff for a field that's essentially a historical log entry, where showing the name *as it was at the time* is arguably more correct than showing it retroactively updated.

A complaint is created with an initial history entry ("Open — Complaint raised"), and every subsequent `PATCH /status` call appends a new entry rather than overwriting the previous one. Once a complaint reaches `Resolved`, the backend rejects further status changes — resolved complaints are closed, matching the assignment's requirement, and this is enforced server-side, not just hidden in the UI, so it can't be bypassed by a direct API call.

## Overdue Detection

Overdue status is intentionally **not** a stored field. It's a derived value, computed at read time as: `!resolved && (now - createdAt) > thresholdDays`.

Storing it as a boolean field would require either a scheduled job to periodically recompute and update every open complaint, or accepting that the field could silently go stale between updates. Neither is necessary here, since the underlying formula only depends on two things that are already known at read time: the complaint's creation date and the current moment. Computing it on every read guarantees correctness with zero extra infrastructure — no cron job, no background worker, nothing that can fail silently.

The threshold itself is configurable via `OVERDUE_THRESHOLD_DAYS` in the environment, rather than hardcoded, since different societies may reasonably want different SLAs for what counts as "taking too long." On the admin complaints view, overdue complaints are sorted to the top of the list (overdue first, then newest-first within each group), directly surfacing what needs attention without requiring the admin to scan the full list or apply a manual filter. The same computation powers the dashboard's overdue count, so the two numbers can never disagree.

## Photo Handling

Complaint photos are handled with Multer using disk storage rather than storing image data directly in MongoDB. MongoDB documents have a 16MB size limit and are not designed to efficiently serve binary blobs; storing a *path* to a file on disk (or, in production, a hosted storage bucket) keeps the database lean and lets Express serve the actual image via a simple static file route.

Each upload is renamed with a timestamp + random suffix to avoid collisions between residents uploading files with the same original name, and the upload is filtered to image MIME types only, capped at 5MB, to prevent abuse. The complaint document stores only `photoUrl` — a relative path like `/uploads/complaint-<id>.jpg` — which the frontend resolves against the API's base URL. A complaint can be raised without a photo at all, since it's explicitly optional in the requirements.

## Notification Flow

Two events trigger email: a complaint's status changing, and an important notice being posted. Both go through a single `sendEmail` utility built on Nodemailer, which is deliberately fault-tolerant: if SMTP credentials aren't configured (as during early development), it logs what would have been sent instead of throwing. This means a misconfigured or absent email provider never blocks the actual feature it's attached to — an admin can still update a complaint's status even if the notification email fails to send, since the email call is fired asynchronously and its failure is caught and swallowed rather than propagated back to the request. Status-change emails go to the one resident who owns that complaint; important-notice emails are sent to every resident, fetched fresh at post time rather than cached, so the recipient list is always current.