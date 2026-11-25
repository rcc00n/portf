# Inquiry privacy operations

Owner decisions, 25 November 2026: RACCN Code is operated personally by Vadim
Rudenko; the existing published contact remains `vadrud2016@gmail.com`. Closed
inquiries and related correspondence are to be removed 12 months after the last
communication, with earlier deletion on request. Active projects, disputes and
legally required records require an individual review. This is an operational
procedure, not a legal compliance certification.

## Verified implementation

- Public form: name, email, message; project definition is optional and opt-in.
  Compatibility API can also retain an optional company field. Source, IP,
  browser information and timestamps are stored with the accepted inquiry.
- Durable acceptance precedes notifications. Telegram is configured in the
  production worker with two active recipients; identities and tokens are private.
  Its notification contains contact/source/definition/message, not the stored
  IP or user agent. Long notification messages are explicitly shortened.
- The host identifies as Vultr. The published email address is a Gmail address.
  Exact provider regions, onward processors and account-level export/retention
  settings have not been verified. Do not claim Canadian-only storage.
- nginx request/error logs are enabled. Its active logrotate timer uses daily
  rotation and 14 retained rotations; Dokku logs use seven. Application containers
  use the json-file driver with three 10 MB files. These are configured limits,
  not proof of deletion from provider snapshots or external backups.
- Local rollback backups are restricted and retained. There is no automatic
  whole-system erasure job and no demonstrated provider-wide deletion guarantee.

## Monthly owner review

1. In the authenticated inquiry admin, review `Done` inquiries and identify the
   last actual communication in the mailbox/conversation. `updated_at` includes
   admin edits and is **not** a reliable last-communication date. Do not delete
   solely because a lead was created more than 12 months ago.
2. Check for an active project, dispute or required retention. Keep only the
   relevant record with a recorded reason; do not retain all unrelated copies.
3. For an expired closed inquiry, remove the database lead and its cascading
   notification record through the protected admin. Check the notification is
   not being processed before deletion. Remove corresponding Telegram copies
   from authorized recipients and the email thread/trash as the services permit.
4. Review restricted database exports and rollback snapshots that can contain
   the lead. Remove expired copies or replace them with a freshly verified backup
   of current retained data. Preserve a tested current recovery point. Do not
   delete unrelated application backups or assume a filesystem removal erases
   a provider snapshot.
5. Keep a minimal private deletion record (internal identifier, completion date,
   any remaining restricted backup/exception and its next review). Never commit
   names, messages, provider identifiers or deletion logs to this repository.
6. On restore, apply the deletion record before resuming public access or the
   notification worker. Review restored outbox state to avoid duplicate delivery.

## Earlier access, correction or deletion requests

Receive requests at the published email. Verify identity proportionately, avoid
requesting unrelated sensitive documents, and identify the relevant inquiry and
copies. Follow the same cross-system review and record any legal/operational
exception. Confirm what was completed and what remains, without promising instant
removal from third-party backups. No request or historical lead was deleted during
this implementation.

## Still requires operator/legal verification

- Provider account regions, authorized recipient ownership and onward processing.
- Off-host/provider backup inventory and actual expiry configuration.
- Rights to client/project evidence and accuracy of each personal contribution.
- Review of the public terms/privacy wording for applicable obligations.

The public policy now states the confirmed operator, manual retention procedure
and actual data path. Internal implementation checklists belong here, not in the
public legal pages. Changes in provider or data handling require a policy review.
