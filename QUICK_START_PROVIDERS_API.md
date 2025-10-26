# Quick Start Guide: Telemedicine Providers API

## Overview

This guide provides quick setup instructions for the new Telemedicine Providers API that replaces hardcoded mock data in the Schedule page.

## Quick Setup (3 Steps)

### Step 1: Generate Prisma Client

```bash
npm run prisma:generate
```

### Step 2: Apply Database Migration

```bash
# Option A: If you have DATABASE_URL configured
npx prisma migrate deploy

# Option B: Apply migration manually to your database
psql -U postgres -d telecheck -f prisma/migrations/20251026120000_add_doctor_profiles/migration.sql
```

### Step 3: Seed Sample Doctors

```bash
npm run seed:doctors
```

## Verify Setup

### Check Database

```bash
# Open Prisma Studio to view data
npm run prisma:studio
```

Navigate to the `doctor_profiles` table to verify 5 sample doctors were created.

### Test API Endpoint

```bash
# Get all providers
curl -X GET http://localhost:3000/api/telemedicine/providers \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Get video-enabled providers
curl -X GET "http://localhost:3000/api/telemedicine/providers?videoEnabled=true" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Get cardiologists
curl -X GET "http://localhost:3000/api/telemedicine/providers?specialty=Cardiology" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Run Automated Tests

```bash
# Set auth token (replace with valid token)
export TEST_AUTH_TOKEN="your-jwt-token-here"

# Run API tests
tsx scripts/test-providers-api.ts
```

## Sample Doctors Seeded

1. **Dr. Sarah Johnson** - Cardiology (4.9⭐, 15 years)
2. **Dr. Michael Chen** - Internal Medicine (4.8⭐, 12 years)
3. **Dr. Emily Rodriguez** - Endocrinology (4.9⭐, 18 years)
4. **Dr. James Williams** - Primary Care (4.7⭐, 10 years)
5. **Dr. Lisa Patel** - Nephrology (4.8⭐, 14 years)

All doctors have:

- Video consultation enabled
- Default password: `Doctor123!` (hashed)
- Working hours: 9 AM - 5 PM
- 30-minute appointment slots

## Frontend Changes

The Schedule page (`client/pages/Schedule.tsx`) now:

- ✅ Fetches real doctors from API
- ✅ Shows loading skeleton while fetching
- ✅ Displays error message on failure
- ✅ Shows empty state if no doctors available
- ✅ Displays real availability data
- ✅ Calculates urgent slots dynamically

## API Endpoint Details

**URL**: `GET /api/telemedicine/providers`

**Query Parameters**:

- `specialty` - Filter by specialty (e.g., "Cardiology")
- `videoEnabled` - Filter by video capability (true/false)
- `available` - Filter by date availability (ISO date)

**Response**:

```json
{
  "success": true,
  "providers": [
    {
      "id": "clw123",
      "name": "Dr. Sarah Johnson",
      "specialty": "Cardiology",
      "rating": 4.9,
      "videoEnabled": true,
      "availability": [
        {
          "date": "2025-10-26",
          "slots": ["09:00", "09:30", "10:00"]
        }
      ]
    }
  ]
}
```

## Troubleshooting

### "No doctors found"

- Run: `npm run seed:doctors`
- Check: `npm run prisma:studio` to verify data

### "Authentication required"

- Ensure you're logged in
- Check localStorage for `authToken`
- Verify token is not expired

### "Database error"

- Check DATABASE_URL in .env
- Verify database is running
- Run: `npx prisma migrate status`

### Migration errors

- Check if migration already applied
- Verify database connection
- Check PostgreSQL logs

## Next Steps

1. **Test the UI**: Navigate to `/schedule` in your browser
2. **Select a doctor**: Click on any doctor card
3. **Check availability**: View time slots for today/tomorrow
4. **Book appointment**: Complete the booking flow

## Files Reference

- **Schema**: `prisma/schema.prisma`
- **Migration**: `prisma/migrations/20251026120000_add_doctor_profiles/migration.sql`
- **Seed Script**: `prisma/seed-doctors.ts`
- **API Route**: `server/routes/telemedicine-providers.ts`
- **Frontend**: `client/pages/Schedule.tsx`
- **Types**: `client/types/telemedicine.ts`
- **Tests**: `scripts/test-providers-api.ts`

## Full Documentation

For comprehensive documentation, see:
📄 **PROVIDERS_API_IMPLEMENTATION.md**

This includes:

- Detailed implementation notes
- API documentation
- Performance considerations
- Security considerations
- Known limitations
- Future enhancements

## Support

If you encounter issues:

1. Check the detailed documentation
2. Review server logs
3. Run the test script
4. Verify database connection
5. Check authentication setup
