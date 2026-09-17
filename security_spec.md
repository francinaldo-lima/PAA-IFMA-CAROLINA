# Security Specification: PAA IFMA Campus Carolina

## 1. Data Invariants
1. **User Identity & Hierarchy**: Only authenticated users with verified credentials can access or modify system records.
2. **Admin Supremacy**: Institutional Administrators (`ADMIN`, Direção Geral) have governance authority across all sectors, axes, and settings.
3. **Sectoral Isolation**: Gestores de Setor and Responsáveis de Ação can only create and edit actions associated with their designated sector or responsibility.
4. **Validation Integrity**: Only Validators (`VALIDADOR`) and Administrators (`ADMIN`) can approve, return with opinions, or consolidate actions.
5. **Audit Invariance**: Audit logs are append-only; existing log records can never be updated or deleted.
6. **Notification Privacy**: Notifications are strictly readable and acknowledgeable only by the targeted recipient user (`usuario_id == request.auth.uid`) or Admins.
7. **Action State Workflow**: Status progression must obey defined institutional stages (RASCUNHO -> ENVIADA -> APROVADA / DEVOLVIDA -> CONSOLIDADA).

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (Identity Spoofing in Action)**: Non-admin user creates action pretending to be from another sector and setting `responsavel_id` to another user without permissions. Expected: `PERMISSION_DENIED`.
2. **Payload 2 (Unverified Email Write)**: Unauthenticated or unverified token tries to write to `/actions/{actionId}`. Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Arbitrary Role Escalation)**: Regular user updates their own profile `/users/{userId}` to set `"role": "ADMIN"`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Audit Log Tampering)**: User attempts `update` or `delete` on `/audit_logs/{logId}`. Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Oversized Payload / Denial of Wallet)**: Submitting a title longer than 300 characters or description longer than 4000 characters. Expected: `PERMISSION_DENIED`.
6. **Payload 6 (Shadow Field Injection)**: Creating an action with an undeclared field `isHacked: true`. Expected: `PERMISSION_DENIED`.
7. **Payload 7 (Path Injection)**: Trying to write to an invalid ID path like `/actions/..%2Fhack`. Expected: `PERMISSION_DENIED`.
8. **Payload 8 (State Skipping)**: A regular user transitions an action directly from `RASCUNHO` to `CONSOLIDADA`. Expected: `PERMISSION_DENIED`.
9. **Payload 9 (Notification Snoop)**: User A tries to read or mark as read notifications belonging to User B. Expected: `PERMISSION_DENIED`.
10. **Payload 10 (Settings Tampering)**: Non-admin modifies `/institution_settings/default`. Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Sector Deletion by Non-Admin)**: Sector manager deletes `/sectors/{sectorId}`. Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Frozen Action Mutation)**: Modifying an action that is already marked `CONSOLIDADA` or `PUBLICADA` by a non-admin. Expected: `PERMISSION_DENIED`.

## 3. Test Runner Design
Implemented in `firestore.rules.test.ts` using `@firebase/rules-unit-testing`, asserting that all 12 dirty payloads are strictly rejected by security rules.
