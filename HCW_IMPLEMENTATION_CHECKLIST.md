# HCW Database Integration - Implementation Checklist

Quick reference for implementing the HCW database integration.

## Pre-Implementation Verification

### 1. Check if HCW Tables Exist in Production

```bash
# Connect to production database
psql "postgresql://doadmin:PASSWORD@telecheck-postgres-cluster-do-user-24735686-0.d.db.ondigitalocean.com:25060/telecheck?sslmode=require"

# Run verification query
\dt hcw_*

# Expected output: 9 tables
# hcw_assignments
# hcw_care_plan_tasks
# hcw_care_plans
# hcw_caregivers
# hcw_data_sharing_preferences
# hcw_documents
# hcw_messages
# hcw_task_comments
# hcw_visits
```

### 2. If Tables Don't Exist, Apply Migration

```bash
# Apply main migration
psql "connection_string" -f hcw_migration.sql

# Apply fixes migration
psql "connection_string" -f hcw_fixes_migration.sql
```

## Critical Fixes Required

### Fix 1: Update Prisma Schema for Messages

**File:** `prisma/schema.prisma`

**Change HCWMessage model from:**

```prisma
model HCWMessage {
  sender    HCWCaregiver @relation("SentMessages", fields: [senderId], references: [id])
  recipient HCWCaregiver @relation("ReceivedMessages", fields: [recipientId], references: [id])
}
```

**To:**

```prisma
model HCWMessage {
  id            String   @id @default(cuid())
  senderId      String   @map("sender_id")
  recipientId   String   @map("recipient_id")
  senderType    String   @default("patient") @map("sender_type") // NEW FIELD
  content       String   @db.Text
  attachments   Json?
  isRead        Boolean  @default(false) @map("is_read")
  readAt        DateTime? @map("read_at") @db.Timestamptz(6)
  threadId      String?  @map("thread_id")
  messageType   String   @default("text") @map("message_type")
  priority      String   @default("normal")

  sender        User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  recipient     User     @relation("ReceivedMessages", fields: [recipientId], references: [id], onDelete: Cascade)

  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([senderId])
  @@index([recipientId])
  @@index([threadId])
  @@index([isRead])
  @@index([createdAt])
  @@map("hcw_messages")
}
```

**Also update User model to add message relations:**

```prisma
model User {
  // ... existing fields ...

  sentMessages     HCWMessage[] @relation("SentMessages")
  receivedMessages HCWMessage[] @relation("ReceivedMessages")

  // ... rest of model ...
}
```

Then run:

```bash
npm run prisma:generate
```

### Fix 2: Fix Prisma Client Import in HCW Routes

**File:** `server/routes/hcw.ts`

**Change line 10 from:**

```typescript
const prisma = new PrismaClient();
```

**To:**

```typescript
import { prisma } from "../config/prisma";
```

## Implementation Tasks

### Phase 1: Replace Mock Data (Priority: CRITICAL)

#### Task 1.1: GET /api/hcw/assigned-caregivers

**File:** `server/routes/hcw.ts` (lines 25-73)

Replace mock data with:

```typescript
router.get("/assigned-caregivers", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const assignments = await prisma.hCWAssignment.findMany({
      where: {
        patientId: userId,
        status: "active",
      },
      include: {
        caregiver: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: [{ isPrimary: "desc" }, { assignedAt: "desc" }],
    });

    const caregivers = assignments.map((a) => ({
      id: a.caregiver.id,
      userId: a.caregiver.userId,
      firstName: a.caregiver.user.firstName,
      lastName: a.caregiver.user.lastName,
      specialty: a.caregiver.specialty,
      credentials: a.caregiver.credentials,
      bio: a.caregiver.bio,
      phoneNumber: a.caregiver.phoneNumber || a.caregiver.user.phone,
      email: a.caregiver.email || a.caregiver.user.email,
      isActive: a.caregiver.isActive,
      isPrimary: a.isPrimary,
      assignmentType: a.assignmentType,
      rating: null, // TODO: Implement ratings system
      reviewCount: 0,
    }));

    res.json({ caregivers });
  } catch (error) {
    console.error("Error fetching caregivers:", error);
    res.status(500).json({ error: "Failed to fetch caregivers" });
  }
});
```

#### Task 1.2: GET /api/hcw/messages

**File:** `server/routes/hcw.ts` (lines 79-111)

Replace with proper query (see full example in HCW_DATABASE_INTEGRATION_ANALYSIS.md section 9.2)

#### Task 1.3: GET /api/hcw/messages/thread/:caregiverId

**File:** `server/routes/hcw.ts` (lines 117-181)

Replace mock data with:

```typescript
router.get(
  "/messages/thread/:caregiverId",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { caregiverId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Verify the patient has an active assignment with this caregiver
      const assignment = await prisma.hCWAssignment.findFirst({
        where: {
          patientId: userId,
          caregiverId,
          status: "active",
        },
      });

      if (!assignment) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get caregiver's user ID
      const caregiver = await prisma.hCWCaregiver.findUnique({
        where: { id: caregiverId },
        select: { userId: true },
      });

      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }

      const messages = await prisma.hCWMessage.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: caregiver.userId },
            { senderId: caregiver.userId, recipientId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Mark unread messages as read
      await prisma.hCWMessage.updateMany({
        where: {
          senderId: caregiver.userId,
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({ messages });
    } catch (error) {
      console.error("Error fetching thread:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  },
);
```

#### Task 1.4: POST /api/hcw/messages/send

**File:** `server/routes/hcw.ts` (lines 187-221)

Replace with:

```typescript
router.post("/messages/send", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { recipientId, content, messageType = "text" } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!recipientId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Create message
    const message = await prisma.hCWMessage.create({
      data: {
        senderId: userId,
        recipientId,
        senderType: req.user.role === "PATIENT" ? "patient" : "caregiver",
        content,
        messageType,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});
```

#### Task 1.5: GET /api/hcw/visits/upcoming & /api/hcw/visits/history

**File:** `server/routes/hcw.ts` (lines 246-335)

Replace both endpoints with database queries.

### Phase 2: Implement Missing Endpoints

#### Task 2.1: POST /api/hcw/visits/book

```typescript
router.post("/visits/book", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { caregiverId, scheduledTime, visitType, purpose, location } =
      req.body;

    // Validation
    if (!caregiverId || !scheduledTime || !visitType || !purpose) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify caregiver exists and is active
    const caregiver = await prisma.hCWCaregiver.findUnique({
      where: { id: caregiverId },
    });

    if (!caregiver || !caregiver.isActive) {
      return res.status(404).json({ error: "Caregiver not found or inactive" });
    }

    // Check for scheduling conflicts
    const conflict = await prisma.hCWVisit.findFirst({
      where: {
        caregiverId,
        scheduledTime,
        status: { in: ["scheduled", "in_progress"] },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: "Time slot not available" });
    }

    // Create visit
    const visit = await prisma.hCWVisit.create({
      data: {
        patientId: userId,
        caregiverId,
        scheduledTime: new Date(scheduledTime),
        visitType,
        purpose,
        location,
        status: "scheduled",
      },
      include: {
        caregiver: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(201).json({ visit });
  } catch (error) {
    console.error("Error booking visit:", error);
    res.status(500).json({ error: "Failed to book visit" });
  }
});
```

#### Task 2.2: GET /api/hcw/care-plans (all endpoints)

#### Task 2.3: POST /api/hcw/documents/upload

#### Task 2.4: GET /api/hcw/data-sharing/preferences

See full implementation examples in the analysis document.

## Testing Checklist

After implementing each endpoint:

- [ ] Test with Postman/Thunder Client
- [ ] Verify database records are created/updated
- [ ] Test error cases (404, 403, 400)
- [ ] Test with multiple users
- [ ] Verify authorization works correctly
- [ ] Check query performance with EXPLAIN

## Performance Verification

```sql
-- Check query execution plan
EXPLAIN ANALYZE
SELECT * FROM hcw_assignments
WHERE patient_id = 'user-id' AND status = 'active';

-- Should use index: idx_assignments_patient_status_caregiver
```

## Deployment Steps

1. **Apply migrations to production:**

   ```bash
   psql "production-connection-string" -f hcw_migration.sql
   psql "production-connection-string" -f hcw_fixes_migration.sql
   ```

2. **Update Prisma schema** (HCWMessage model)

3. **Generate Prisma client:**

   ```bash
   npm run prisma:generate
   ```

4. **Update server/routes/hcw.ts** with database queries

5. **Test on staging** environment first

6. **Deploy to production**

7. **Verify with production data**

## Quick Test Script

```bash
# Test assigned caregivers endpoint
curl -X GET "https://whale-app-bs3xa.ondigitalocean.app/api/hcw/assigned-caregivers" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test messages endpoint
curl -X GET "https://whale-app-bs3xa.ondigitalocean.app/api/hcw/messages" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test send message
curl -X POST "https://whale-app-bs3xa.ondigitalocean.app/api/hcw/messages/send" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"caregiver-user-id","content":"Test message"}'
```

## Files Modified Summary

- [ ] `prisma/schema.prisma` - Update HCWMessage model
- [ ] `server/routes/hcw.ts` - Replace all mock data
- [ ] `server/config/prisma.ts` - Already correct (no changes)
- [ ] Run `hcw_fixes_migration.sql` on production database

## Estimated Time per Task

- Phase 1 Tasks (5 endpoints): ~8 hours
- Phase 2 Tasks (8 endpoints): ~12 hours
- Testing & Bug Fixes: ~4 hours
- **Total: ~24 hours**

## Support Resources

- Full analysis: `HCW_DATABASE_INTEGRATION_ANALYSIS.md`
- Migration scripts: `hcw_migration.sql`, `hcw_fixes_migration.sql`
- Prisma docs: https://www.prisma.io/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
