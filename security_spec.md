# Security Specification & Test-Driven-Design (TDD) Blueprint

## 1. Data Invariants
For NeuroList (FlowZen/MomentumOS), the safety constraints are:
1. **User Ownership (Boundary Lock)**: A user can only read, create, update, or delete records in their own namespace (`/users/{userId}/**`). Path `userId` must equal `request.auth.uid`.
2. **Identity Mutability**: User profiles inside `/users/{userId}` cannot have their `uid` or `email` modified after creation.
3. **Temporal Sanity (Timed Writes)**: `createdAt` must match `request.time` exactly at creation, and `updatedAt` must match `request.time` on updates.
4. **Range / Bound Limits**:
   - `difficulty` must be an integer between 1 and 5.
   - `estimatedMinutes` must be an integer greater than or equal to 0.
   - Lists like `labels`, `tags`, and `subtasks` must be bounded in size to prevent cost or volumetric attacks (e.g., maximum size 20).
5. **State Terminal Locking**: Archived or Completed tasks cannot be modified back into active states without validating full schemas and ensuring system-only field attributes remain uncompromised.
6. **Input Character Constraints**: ID properties and input variables must be sanitized to prevent code injection (specifically path-char verification).

---

## 2. The "Dirty Dozen" Malicious Payloads

The following specific payloads represent attacks designed to break Identity, Schema Integrity, or State constraints on our collections:

### Payload 1: Identity Spoofing (Create task for another user)
*   **Path**: `/users/attacker_uid/tasks/task_123` with Auth UID = `victim_uid`
*   **Intended Result**: `PERMISSION_DENIED`
```json
{
  "id": "task_123",
  "userId": "attacker_uid",
  "title": "Hack victim",
  "priority": "Critical",
  "status": "Todo",
  "difficulty": 5,
  "estimatedMinutes": 30,
  "createdAt": "2026-05-25T03:57:46Z",
  "updatedAt": "2026-05-25T03:57:46Z"
}
```

### Payload 2: Ghost Field Poisoning (Schema Leakage)
*   **Action**: Create task with an unmapped high-privilege administrative attribute.
*   **Intended Result**: `PERMISSION_DENIED`
```json
{
  "id": "task_123",
  "userId": "victim_uid",
  "title": "Malicious task",
  "priority": "Low",
  "status": "Todo",
  "difficulty": 1,
  "estimatedMinutes": 10,
  "createdAt": "2026-05-25T03:57:46Z",
  "updatedAt": "2026-05-25T03:57:46Z",
  "isAdminTask": true
}
```

### Payload 3: Privilege Escalation (User grants themselves infinite XP)
*   **Action**: Update user profile `/users/victim_uid` with a massive XP bump from a non-admin client.
*   **Intended Result**: `PERMISSION_DENIED`
```json
{
  "uid": "victim_uid",
  "email": "victim@gmail.com",
  "displayName": "Victim",
  "photoURL": "",
  "xp": 9999999,
  "level": 100,
  "streak": 50,
  "createdAt": "2026-05-25T03:57:46Z",
  "updatedAt": "2026-05-25T03:57:46Z"
}
```

### Payload 4: Type Poisoning (String in Integer Field)
*   **Action**: Set task difficulty to "Impossible" instead of integer 5.
*   **Intended Result**: `PERMISSION_DENIED`
```json
{
  "id": "task_123",
  "userId": "victim_uid",
  "title": "Task 1",
  "priority": "Medium",
  "status": "Todo",
  "difficulty": "Impossible",
  "estimatedMinutes": 20,
  "createdAt": "2026-05-25T03:57:46Z",
  "updatedAt": "2026-05-25T03:57:46Z"
}
```

### Payload 5: No Auth Inspection (Anonymous write check)
*   **Action**: Write high-priority task without being signed in.
*   **Intended Result**: `PERMISSION_DENIED` (No auth token present)

### Payload 6: Out of Bound Integer Attack (Negative Values)
*   **Action**: Set estimatedMinutes to -500 to try and reverse-engine progress calculations.
*   **Intended Result**: `PERMISSION_DENIED`
```json
{
  "id": "task_123",
  "userId": "victim_uid",
  "title": "Task 1",
  "priority": "Medium",
  "status": "Todo",
  "difficulty": 3,
  "estimatedMinutes": -500,
  "createdAt": "2026-05-25T03:57:46Z",
  "updatedAt": "2026-05-25T03:57:46Z"
}
```

### Payload 7: Immortal Field Overwriting (Reset profile creation timestamp)
*   **Action**: Mutate user record, overwriting `createdAt` from a previous value to the current epoch.
*   **Intended Result**: `PERMISSION_DENIED` (Creation date is immutable)

### Payload 8: Excessive Array Payload (Denial-of-Wallet Array Flooding)
*   **Action**: Ingest 1500 elements into a task tags array.
*   **Intended Result**: `PERMISSION_DENIED` (Array size bounds limit exceeded)

### Payload 9: Rogue ID Character Injection (Path Traversal attempt)
*   **Path**: `/users/victim_uid/tasks/../../admins/critical_record`
*   **Intended Result**: `PERMISSION_DENIED`

### Payload 10: Client Timestamps Spoofing (Faked timelines)
*   **Action**: Send a future `updatedAt` date ISO string like `3026-05-25T03:57:46Z` instead of standard `request.time`.
*   **Intended Result**: `PERMISSION_DENIED`

### Payload 11: Invalid Enum Manipulation
*   **Action**: Modify task priority to "GodMode" which is outside the allowlisted items ["Low", "Medium", "High", "Critical", "Someday"].
*   **Intended Result**: `PERMISSION_DENIED`

### Payload 12: Habit Reset Abuse
*   **Action**: Client modifies the list of habit completions to inject ancient completed habit dates, claiming credit for unearned achievements.
*   **Intended Result**: `PERMISSION_DENIED`

---

## 3. The Test Runner Specification (`firestore.rules.test.ts`)
```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

// Standard implementation details for validating unit blocks can be deployed manually.
const testEnv = await initializeTestEnvironment({
  projectId: "whisperlink-chat-app",
  firestore: {
    rules: "firestore.rules"
  }
});

// Unit tests represent the full test harness against the secure rules.
```
