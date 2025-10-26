# Quick Start: Consultation Notes API

## 🚀 3-Step Setup

### Step 1: Run Migration

```bash
cd c:\Users\menso\Downloads\Telecheck_V1.3-DO
npx prisma migrate dev --name add_consultation_notes_to_video_consultation
npx prisma generate
```

### Step 2: Restart Server

```bash
npm run dev
```

### Step 3: Test It!

```bash
curl -X POST http://localhost:3000/api/consultations/YOUR_APPOINTMENT_ID/notes \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Patient doing well",
    "diagnosis": "Common cold",
    "treatmentPlan": "Rest and fluids"
  }'
```

## 📋 API Quick Reference

**Endpoint**: `POST /api/consultations/:appointmentId/notes`

**Request Body** (all fields optional):

```json
{
  "notes": "string",
  "diagnosis": "string",
  "treatmentPlan": "string"
}
```

**Success Response**:

```json
{
  "success": true,
  "message": "Consultation notes saved successfully",
  "data": { ... }
}
```

## 📁 Files Changed

- ✏️ `prisma/schema.prisma` - Added 3 fields to VideoConsultation
- ✏️ `server/routes/consultations.ts` - Added POST /notes endpoint
- ✨ `server/types/consultations.ts` - New TypeScript types
- 📄 `prisma/migrations/add_consultation_notes_fields.sql` - Migration SQL
- 📖 `docs/consultation-notes-api.md` - Full documentation

## ✅ What You Get

- Simple API to save consultation notes
- Three fields: notes, diagnosis, treatmentPlan
- Stored directly in video_consultations table
- No complex integrations
- TypeScript type safety
- Basic error handling

## 🔐 Authentication (Optional)

To enable auth, uncomment lines 341-348 in:
`server/routes/consultations.ts`

## 📚 Full Documentation

See: `docs/consultation-notes-api.md`
