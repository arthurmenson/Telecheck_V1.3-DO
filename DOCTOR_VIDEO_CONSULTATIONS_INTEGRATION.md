# Doctor Video Consultations Component - Integration Guide

## Overview

The `DoctorVideoConsultations` component provides a comprehensive dashboard for doctors to view and manage their video consultations. It integrates with the Prisma-based appointment API and HCW@Home video consultation platform.

## Files Created

### 1. Type Definitions

**File:** `client/types/consultation.ts`

Defines TypeScript interfaces for:

- `ConsultationAppointment` - Full appointment with patient/doctor details
- `VideoConsultation` - Video consultation metadata
- `AppointmentsListResponse` - API response structure
- `ConsultationFilters` - Filter options
- `ConsultationStats` - Dashboard statistics

### 2. Main Component

**File:** `client/components/DoctorVideoConsultations.tsx`

A fully-featured component with:

- Real-time countdown timers for upcoming consultations
- "Join Now" button (appears 15 minutes before scheduled time)
- Three tabs: Upcoming, Today, Past
- Patient search functionality
- Status filtering
- Pagination support
- Auto-refresh every 30 seconds (configurable)
- Responsive mobile/desktop design
- Loading states and error handling
- Statistics dashboard

### 3. Standalone Page

**File:** `client/pages/DoctorVideoConsultationsPage.tsx`

A dedicated page that wraps the component with:

- Page header and navigation
- Back button to doctor dashboard
- Consistent styling with the rest of the app

## Features

### 1. Real-time Countdown Timer

- Shows time remaining until consultation (e.g., "2h 15m", "45m")
- Updates every second
- Displays "Now" when consultation time arrives
- Shows "Overdue" for missed appointments

### 2. Join Now Button

- Appears when consultation is within 15 minutes of start time
- Remains active for 60 minutes after scheduled time
- Navigates to HCW@Home televisit interface
- Disabled state with countdown for appointments not yet ready

### 3. Tabs and Filtering

- **Upcoming Tab:** Shows future confirmed appointments
- **Today Tab:** Shows all appointments for the current day
- **Past Tab:** Shows completed consultations with duration

### 4. Search and Filters

- Real-time patient name search
- Filter by status (confirmed, completed, cancelled)
- Client-side search for instant results
- Server-side filtering for large datasets

### 5. Statistics Dashboard

- Today's total consultations
- Upcoming consultations count
- Completed consultations count
- Average consultation duration

### 6. Responsive Design

- Mobile-first approach
- Stacks vertically on small screens
- Grid layout on desktop
- Touch-friendly buttons

### 7. Pagination

- 10 items per page (configurable)
- Previous/Next navigation
- Shows current page and total pages
- Displays total results count

## Integration Instructions

### Method 1: Add to Existing Doctor Dashboard

Update `client/pages/DoctorDashboard.tsx`:

```tsx
import { DoctorVideoConsultations } from "../components/DoctorVideoConsultations";

// Inside your DoctorDashboard component, add a new section:
<div className="mt-8">
  <DoctorVideoConsultations
    showStats={true}
    autoRefresh={true}
    refreshInterval={30000}
  />
</div>;
```

### Method 2: Create a Dedicated Route

Update your router configuration (e.g., `client/App.tsx` or routing file):

```tsx
import { DoctorVideoConsultationsPage } from "./pages/DoctorVideoConsultationsPage";

// Add to your routes:
<Route
  path="/doctor/video-consultations"
  element={<DoctorVideoConsultationsPage />}
/>;
```

Then add a navigation link in the doctor dashboard:

```tsx
<Link to="/doctor/video-consultations">
  <Button className="gradient-bg text-white">
    <Video className="w-4 h-4 mr-2" />
    Video Consultations
  </Button>
</Link>
```

### Method 3: Embed with Custom Configuration

```tsx
<DoctorVideoConsultations
  className="custom-class"
  showStats={false} // Hide statistics cards
  autoRefresh={false} // Disable auto-refresh
  refreshInterval={60000} // Refresh every minute (if enabled)
/>
```

## Component Props

```typescript
interface DoctorVideoConsultationsProps {
  className?: string; // Additional CSS classes
  showStats?: boolean; // Show/hide statistics cards (default: true)
  autoRefresh?: boolean; // Enable auto-refresh (default: true)
  refreshInterval?: number; // Refresh interval in ms (default: 30000)
}
```

## API Integration

The component uses the following API endpoints:

### GET /api/appointments

**Query Parameters:**

- `doctorId` - Current doctor's user ID (from auth context)
- `type=video` - Filter to video consultations only
- `status` - Filter by status (pending, confirmed, cancelled, completed)
- `startDate` - Filter appointments after this date
- `endDate` - Filter appointments before this date
- `limit` - Number of results per page (default: 10)
- `offset` - Pagination offset

**Response:**

```typescript
{
  appointments: ConsultationAppointment[];
  total: number;
  limit: number;
  offset: number;
}
```

### POST /api/consultations/:appointmentId/hcw-session

Creates or retrieves HCW@Home video consultation URL (called when joining).

## Authentication

The component uses the `useAuth` hook to:

- Get the current doctor's user ID
- Retrieve authentication token for API calls
- Ensure only authenticated doctors can access

The API client automatically includes the bearer token from `localStorage.getItem("auth_token")`.

## Database Schema

The component expects the following Prisma models:

```prisma
model Appointment {
  id              String             @id @default(cuid())
  patientId       String
  doctorId        String
  scheduledTime   DateTime
  type            AppointmentType
  status          AppointmentStatus
  reason          String?
  notes           String?
  patient         User               @relation("PatientAppointments", fields: [patientId])
  doctor          User               @relation("DoctorAppointments", fields: [doctorId])
  videoConsultation VideoConsultation?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
}

model VideoConsultation {
  id                String    @id @default(cuid())
  appointmentId     String    @unique
  hcwConsultationId String?
  hcwUrl            String?
  status            String
  startedAt         DateTime?
  endedAt           DateTime?
  duration          Int?
  appointment       Appointment @relation(fields: [appointmentId])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

## Styling

The component uses:

- Tailwind CSS utility classes
- shadcn/ui components (Card, Button, Badge, Input, Tabs, etc.)
- Glass morphism effects (`glass-morphism` class)
- Aurora background (`aurora-bg` class)
- Hover lift animations (`hover-lift` class)

Ensure these classes are defined in your global CSS or Tailwind config.

## Error Handling

The component handles errors gracefully:

- Displays error alerts at the top
- Shows empty states when no data is available
- Handles API failures with user-friendly messages
- Logs errors to console for debugging

## Performance Considerations

1. **Auto-refresh:** Set a reasonable refresh interval (default 30s)
2. **Pagination:** Limits results to prevent large data loads
3. **Client-side search:** Filters already-loaded data for instant results
4. **Countdown optimization:** Uses single interval for all timers
5. **Memoized callbacks:** Prevents unnecessary re-renders

## Testing

### Manual Testing Checklist

- [ ] Component loads without errors
- [ ] Statistics cards display correct counts
- [ ] Tabs switch properly (Upcoming, Today, Past)
- [ ] Search filters patients correctly
- [ ] Status filter works
- [ ] Countdown timers update every second
- [ ] "Join Now" button appears at correct time (15 min before)
- [ ] Join button navigates to televisit page
- [ ] Pagination works correctly
- [ ] Refresh button updates data
- [ ] Auto-refresh works (check network tab)
- [ ] Mobile responsive layout works
- [ ] Error states display properly
- [ ] Empty states show correct messages

### Example Test Data

Create test appointments in your database:

```sql
-- Upcoming appointment (15 minutes from now)
INSERT INTO "Appointment" (id, patientId, doctorId, scheduledTime, type, status, reason)
VALUES (
  'test-apt-1',
  'patient-id',
  'doctor-id',
  NOW() + INTERVAL '15 minutes',
  'video',
  'confirmed',
  'Follow-up consultation'
);

-- Past appointment
INSERT INTO "Appointment" (id, patientId, doctorId, scheduledTime, type, status, reason)
VALUES (
  'test-apt-2',
  'patient-id',
  'doctor-id',
  NOW() - INTERVAL '2 hours',
  'video',
  'completed',
  'Initial assessment'
);
```

## Troubleshooting

### Issue: "No auth token available"

**Solution:** Ensure user is logged in and token is stored in localStorage

### Issue: Appointments not loading

**Solution:** Check:

1. API endpoint is correct (`/api/appointments`)
2. Doctor ID is valid in auth context
3. Database has appointments with `type='video'`
4. Network tab shows successful API response

### Issue: Join button not appearing

**Solution:**

1. Check appointment is within 15 minutes of scheduled time
2. Verify appointment status is 'confirmed'
3. Ensure `canJoinConsultation()` logic is correct

### Issue: Countdowns not updating

**Solution:**

1. Check browser console for errors
2. Ensure `updateCountdowns` useEffect is running
3. Verify appointments have valid `scheduledTime`

## Future Enhancements

Potential improvements:

- [ ] WebSocket integration for real-time updates
- [ ] Push notifications for upcoming consultations
- [ ] Calendar integration (export to Google Calendar, iCal)
- [ ] Patient video consultation history
- [ ] Consultation notes/summary integration
- [ ] Screen sharing and recording features
- [ ] Waiting room for patients
- [ ] Multi-doctor consultations
- [ ] Telemetry and analytics tracking

## Support

For issues or questions:

1. Check this documentation
2. Review API logs in server console
3. Check browser console for client-side errors
4. Verify database schema matches expectations
5. Test with example data

## License

Part of the Telecheck platform. See main project license.
