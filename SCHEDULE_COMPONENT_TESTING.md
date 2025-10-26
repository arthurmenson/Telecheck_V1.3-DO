# Schedule Component Testing Guide

## Overview

The Schedule component has been updated to integrate with the backend API for creating appointments instead of just showing an alert.

## Changes Made

### 1. TypeScript Interfaces Added

```typescript
- ScheduleAppointmentResponse: Type definition for /api/telemedicine/schedule response
- HcwConsultationResponse: Type definition for /api/consultations/:appointmentId/hcw-session response
- AppointmentData: Type definition for appointment request payload
```

### 2. New State Variables

```typescript
- isLoading: boolean - Tracks API call loading state
- error: string | null - Stores error messages for display
- appointmentDetails: Object | null - Stores confirmation data (appointmentId, confirmationNumber, meetingLink)
```

### 3. Updated handleBookAppointment Function

The function now performs the following steps:

#### Step 1: Create Appointment

- **Endpoint**: `POST /api/telemedicine/schedule`
- **Headers**: Authorization with Bearer token from localStorage
- **Payload**:
  ```json
  {
    "providerId": "1",
    "userId": "user-1",
    "dateTime": "2025-10-26T14:00:00.000Z",
    "type": "video",
    "reason": "Video consultation",
    "duration": 30
  }
  ```
- **Response**: Returns appointmentId, confirmationNumber, meetingLink, instructions

#### Step 2: Create HCW Consultation Session (Non-blocking)

- **Endpoint**: `POST /api/consultations/:appointmentId/hcw-session`
- **Headers**: Authorization with Bearer token
- **Purpose**: Creates HCW@Home video consultation room
- **Response**: Returns consultationId, hcwUrl, status, scheduledTime
- **Error Handling**: If this fails, appointment is still valid with fallback meeting link

#### Step 3: Send Confirmation Notification (Optional)

- **Endpoint**: `POST /api/messaging/send`
- **Purpose**: Sends SMS confirmation to patient
- **Error Handling**: Non-blocking, logs error but doesn't fail booking

### 4. UI Updates

#### Error Display (Step 3)

- Red alert card with XCircle icon
- Shows clear error message
- Positioned above the appointment details card

#### Loading State

- "Book Appointment" button shows spinner when loading
- Button text changes to "Booking..."
- Back button is disabled during loading
- Button is disabled if reason field is empty

#### Confirmation Screen Updates

- Shows confirmation number in monospace font
- Displays clickable meeting link if available
- Link opens in new tab with security attributes

### 5. Error Handling

#### Error Types

1. **Authentication Errors**: "Session expired. Please log in again..."
2. **Network Errors**: "Network error. Please check your internet connection..."
3. **API Errors**: Shows specific error message from API
4. **Validation Errors**: "Please complete all required fields"
5. **Generic Errors**: "An unexpected error occurred. Please try again."

## Testing Steps

### Prerequisites

1. Ensure backend server is running
2. User must be logged in (authToken in localStorage)
3. API endpoints must be accessible:
   - `/api/telemedicine/schedule`
   - `/api/consultations/:appointmentId/hcw-session`
   - `/api/messaging/send`

### Test Case 1: Successful Appointment Booking

**Steps:**

1. Navigate to Schedule page
2. Select a doctor from the list
3. Click "Continue to Scheduling"
4. Select "Today" or "Tomorrow"
5. Select an available time slot
6. Click "Continue"
7. Enter reason for visit in textarea (required)
8. Click "Book Appointment"

**Expected Result:**

- Loading spinner appears on button
- Button text changes to "Booking..."
- After 1-2 seconds, confirmation screen appears
- Shows doctor name, date, time, confirmation number
- Shows video consultation link (clickable)
- No errors displayed

### Test Case 2: Missing Authentication Token

**Steps:**

1. Clear localStorage: `localStorage.removeItem('authToken')`
2. Follow Test Case 1 steps

**Expected Result:**

- Error message: "Session expired. Please log in again to book an appointment."
- Red error card appears above appointment details
- User remains on Step 3
- Can click "Back" to modify selections

### Test Case 3: Empty Reason Field

**Steps:**

1. Follow Test Case 1 steps 1-6
2. Leave reason textarea empty
3. Try to click "Book Appointment"

**Expected Result:**

- Button is disabled (grayed out)
- Cannot submit without entering reason

### Test Case 4: Network Error Simulation

**Steps:**

1. Disconnect from internet or block API endpoint
2. Follow Test Case 1 steps

**Expected Result:**

- Error message: "Network error. Please check your internet connection and try again."
- Red error card appears
- User can retry after fixing connection

### Test Case 5: Server Error (500)

**Setup:** Mock API to return 500 error

**Expected Result:**

- Error message from API or generic "Failed to schedule appointment (500)"
- User can retry or go back

### Test Case 6: HCW Session Creation Fails (Non-critical)

**Setup:** Mock `/api/consultations/:appointmentId/hcw-session` to fail

**Expected Result:**

- Appointment is still created successfully
- Fallback meeting link is used
- Console warning logged
- User sees confirmation screen

### Test Case 7: Navigation Between Steps

**Steps:**

1. Select doctor and proceed to Step 2
2. Click "Back" to Step 1
3. Select doctor again and proceed
4. Select date/time and proceed to Step 3
5. Click "Back" to Step 2
6. Ensure no error messages carry over

**Expected Result:**

- Error messages are cleared when navigating back
- All selections are preserved
- UI state is correct

### Test Case 8: Multiple Rapid Clicks

**Steps:**

1. Complete all fields on Step 3
2. Rapidly click "Book Appointment" multiple times

**Expected Result:**

- Button becomes disabled after first click
- Only one API call is made
- Loading state prevents duplicate submissions

## API Integration Details

### Required Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token from localStorage>"
}
```

### Date/Time Formatting

The component converts user-friendly date/time selections to ISO 8601 format:

- "Today" + "2:00 PM" → "2025-10-26T14:00:00.000Z"
- "Tomorrow" + "9:30 AM" → "2025-10-27T09:30:00.000Z"

### Authentication Token

- Retrieved from: `localStorage.getItem('authToken')`
- Required for all API calls
- If missing, shows authentication error

## Known Limitations & TODOs

1. **User ID Hardcoded**: Currently uses "user-1" - should get from auth context
2. **Mock Doctors**: Doctors list is static - should fetch from API
3. **Time Parsing**: Assumes 12-hour format with AM/PM - may need internationalization
4. **Toast Notifications**: Could add toast/snackbar for better UX
5. **Retry Logic**: No automatic retry on network failures
6. **Loading States**: Could add skeleton loaders for better perceived performance

## Files Modified

### C:\Users\menso\Downloads\Telecheck_V1.3-DO\client\pages\Schedule.tsx

- Added TypeScript interfaces (lines 34-60)
- Added state variables (lines 189-195)
- Replaced handleBookAppointment function (lines 258-411)
- Added error display UI (lines 657-674)
- Updated booking button with loading state (lines 763-776)
- Added error clearing on navigation (lines 553-555, 643-659, 753-758)
- Updated confirmation screen with meeting link (lines 445-469)

## Error Recovery

### User Can Retry After Error

- Error message is displayed clearly
- Back button allows user to modify selections
- Book button can be clicked again after error
- Error is cleared when navigating back

### Partial Failure Handling

- If HCW session creation fails, appointment still succeeds
- If notification sending fails, appointment still succeeds
- Only critical appointment creation failure prevents booking

## Success Metrics

After successful implementation, verify:

1. Appointments are created in backend system
2. Confirmation numbers are unique
3. Meeting links are valid and accessible
4. Error messages are user-friendly
5. Loading states provide clear feedback
6. No duplicate appointments are created
7. Authentication is properly enforced

## Debugging Tips

### Check Browser Console

- Network tab: Verify API calls are made
- Console log: Check for error messages
- Application tab: Verify authToken exists in localStorage

### Common Issues

1. **CORS errors**: Ensure API server allows requests from client origin
2. **401 Unauthorized**: Check if authToken is valid and not expired
3. **404 Not Found**: Verify API endpoints are correctly configured
4. **Network timeout**: Increase timeout if server is slow

### Useful Console Commands

```javascript
// Check auth token
localStorage.getItem("authToken");

// Manually set token for testing
localStorage.setItem("authToken", "test-token-123");

// Clear all state
localStorage.clear();
```

## Next Steps

1. Test all scenarios outlined above
2. Verify backend receives correct data format
3. Test HCW@Home video consultation integration
4. Add integration tests for critical paths
5. Monitor production for errors
6. Consider adding retry logic for transient failures
7. Add user feedback surveys for UX improvements
