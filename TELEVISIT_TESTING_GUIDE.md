# Complete TeleVisit Journey - Step-by-Step Testing Guide

**Date**: October 27, 2025
**Purpose**: Test the full patient televisit flow from registration to video call
**Duration**: ~30-45 minutes
**Environment**: https://whale-app-bs3xa.ondigitalocean.app

---

## Prerequisites

### System Setup

- [ ] Internet browser (Chrome, Firefox, Safari, Edge)
- [ ] Stable internet connection
- [ ] Camera and microphone permissions enabled
- [ ] Test email address accessible
- [ ] Test phone number for SMS (optional)

### Database Setup (Backend - Run Once)

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Run migrations
npx prisma migrate deploy

# 3. Seed doctors
npm run seed:doctors

# 4. Verify doctor records
npx prisma studio
# Navigate to DoctorProfile table and verify 5 doctors exist
```

---

## Part 1: User Registration & Login (5 minutes)

### Step 1: Access the Application

1. Open browser and navigate to: https://whale-app-bs3xa.ondigitalocean.app
2. You should see the TeleCheck homepage

**✅ Expected**: Homepage loads with "TeleCheck - AI Healthcare" branding

### Step 2: Create Patient Account

1. Click **"Sign Up"** or **"Register"** button
2. Fill in registration form:
   - **Email**: your-test-email@example.com
   - **Password**: TestPassword123!
   - **Confirm Password**: TestPassword123!
   - **Full Name**: John Doe (or your test name)
   - **Date of Birth**: 01/15/1990
   - **Phone**: +1 (555) 123-4567
3. Click **"Create Account"** or **"Register"**

**✅ Expected**: Account created successfully, automatic login or redirect to login

### Step 3: Login (If Not Automatic)

1. Navigate to login page
2. Enter credentials:
   - **Email**: your-test-email@example.com
   - **Password**: TestPassword123!
3. Click **"Sign In"** or **"Login"**

**✅ Expected**: Redirected to Patient Dashboard

### Step 4: Verify Dashboard Access

1. Confirm you're on the Dashboard page
2. Check for these elements:
   - Welcome message with your name
   - Upcoming appointments section
   - Recent lab results (may be empty)
   - Medications list (may be empty)
   - Navigation menu (Dashboard, Schedule, Labs, Medications, etc.)

**✅ Expected**: Dashboard displays with navigation and empty states

**📝 Note Your Credentials**:

- Email: \***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***
- Password: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***
- User ID (from browser console if visible): **\*\***\_\_\_**\*\***

---

## Part 2: Schedule Appointment (8-12 minutes)

### Step 5: Navigate to Scheduling

1. Click **"Schedule Appointment"** button or link
2. You should see: **"Schedule Appointment"** page header
3. Verify 8-step progress indicator shows at top

**✅ Expected**: Step 1 of 8 - Visit Type Selection

### Step 6: Choose Visit Type (Step 1)

1. Review available visit type options:
   - 🩺 Primary Care
   - 🚨 Urgent Care
   - 🔄 Follow-up
   - 👨‍⚕️ Specialist
   - 📋 Second Opinion
   - 💊 Medication Refill
2. **Select**: "Primary Care"
3. Click **"Continue"**

**✅ Expected**: Progress to Step 2 - Chief Complaint

**⏱️ Time Check**: ~30 seconds

### Step 7: Select Chief Complaint (Step 2)

1. Review complaint options (changes based on visit type)
2. **Select one**:
   - Example: "New symptoms or health concern"
   - Or: "Other" (requires text input)
3. If "Other" selected, type in text area:
   - Example: "Persistent headaches for 3 days"
4. Click **"Continue"**

**✅ Expected**: Progress to Step 3 - Symptom Details

**⏱️ Time Check**: ~45 seconds

### Step 8: Provide Symptom Details (Step 3)

1. Fill in symptom information:

   **When did symptoms start?**
   - Select date: 3 days ago (use date picker)

   **Duration?**
   - Select: "Days 1-7"

   **Severity?**
   - Select: "Moderate - Some interference"

   **Previous treatments?**
   - Type: "Tried ibuprofen 200mg, helped temporarily"

   **Current medications for this issue?**
   - Type: "None" or "Ibuprofen as needed"

2. Click **"Continue"**

**✅ Expected**: Progress to Step 4 - Medical History

**⏱️ Time Check**: ~2 minutes

### Step 9: Complete Medical History (Step 4)

1. Fill in medical background:

   **Been seen for this before?**
   - Select: "No, this is the first time"

   **Allergies?**
   - Select: "Yes, I have allergies" or "No known allergies"
   - If Yes, type: "Penicillin (causes rash)"

   **Current medications?**
   - Type: "Lisinopril 10mg daily, Vitamin D 1000IU" (or "None")

   **Recent hospitalizations?**
   - Type: "None" or relevant information

2. Note the 🔒 HIPAA compliance message
3. Click **"Continue"**

**✅ Expected**: Progress to Step 5 - Choose Provider

**⏱️ Time Check**: ~2 minutes

### Step 10: Select Healthcare Provider (Step 5)

**🔍 CRITICAL TEST POINT**: The authentication error fix we deployed should work here!

1. Wait for doctors to load (should show loading skeletons)
2. Verify doctors list appears:
   - Should see 3-5 doctor cards
   - Each card shows:
     - Doctor name
     - Specialty
     - Location
     - Rating (⭐ 4.7-4.9)
     - Experience years
     - Next available time
     - Video/In-Person badges

3. **Select a doctor** by clicking their card:
   - Example: Dr. Sarah Johnson - Family Medicine
   - Card should highlight with blue border

4. Click **"Continue to Scheduling"**

**✅ Expected**:

- No "Authentication required" error
- Doctors load successfully
- Selection works smoothly
- Progress to Step 6

**⏱️ Time Check**: ~1 minute

**🐛 If Error Appears**:

- Take screenshot
- Note exact error message
- Check browser console (F12) for errors
- Verify you're logged in (check for auth token)

### Step 11: Choose Date & Time (Step 6)

1. Select appointment date:
   - Choose: **"Today"** (for urgent) or **"Tomorrow"** (for regular)

2. Select time slot:
   - Review available slots (5-6 options typically)
   - Example slots: 2:00 PM, 2:30 PM, 4:30 PM, 5:00 PM
   - Icons indicate: 🚨 Same Day, 📹 Video
   - **Select**: Any available time slot (e.g., "2:00 PM")

3. Click **"Continue"**

**✅ Expected**: Progress to Step 7 - Pre-Visit Information

**⏱️ Time Check**: ~30 seconds

### Step 12: Review Pre-Visit Info & Consents (Step 7)

1. Review preparation checklist:
   - ✓ List of Current Medications
   - ✓ Recent Test Results
   - ✓ Insurance Card
   - ✓ Photo ID

2. Review video consultation tips:
   - Stable Internet, Good Lighting, Quiet Location

3. **Check all required consents** (REQUIRED):
   - ☑ **Telehealth Consent**: "I consent to receive healthcare services via telehealth..."
   - ☑ **Emergency Understanding**: "I understand telehealth is NOT for medical emergencies..."
   - ☑ **Billing Authorization**: "I authorize billing my insurance..."

4. Review Appointment Summary box:
   - Visit Type: Primary Care
   - Reason: [Your complaint]
   - Provider: [Selected doctor]
   - Date: [Selected date]
   - Time: [Selected time]
   - Type: Video Consultation

5. Click **"Confirm & Book Appointment"**

**✅ Expected**:

- Button shows loading spinner: "Booking Appointment..."
- After 2-5 seconds, progress to Step 8

**⏱️ Time Check**: ~1-2 minutes

**🐛 If Booking Fails**:

- Note error message shown
- Check if all consents are checked
- Verify internet connection
- Check browser console for API errors

### Step 13: Confirmation Screen (Step 8)

1. Verify confirmation page displays:
   - ✅ **"Appointment Confirmed!"** message
   - Green checkmark icon

2. **Verify Appointment Details** card shows:
   - Visit Type, Reason, Provider
   - Date, Time
   - **Confirmation Number**: Save this! (e.g., CONF-ABC12345)
   - **Video Consultation Link**: 📹 Join Video Call

3. Review **"Before Your Appointment"** checklist:
   - ✓ Have medications list ready
   - ✓ Prepare questions
   - ✓ Test camera/microphone
   - ✓ Find quiet location
   - ✓ Have insurance card

4. **Copy the meeting link** (right-click, copy link address)

5. Click **"Back to Dashboard"**

**✅ Expected**: Return to Dashboard showing new appointment

**⏱️ Time Check**: ~30 seconds

**📝 Record**:

- Confirmation Number: \***\*\*\*\*\***\_\_\_\***\*\*\*\*\***
- Video Link: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***
- Appointment Time: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

---

## Part 3: Verify Appointment in Dashboard (2 minutes)

### Step 14: Check Dashboard Appointment

1. On Dashboard, locate **"Upcoming Appointments"** section
2. Verify your new appointment appears:
   - Doctor name
   - Date and time
   - Visit type
   - Status: "Scheduled" or "Confirmed"

3. Check for **"Join Call"** or **"View Details"** button

**✅ Expected**: Appointment shows in dashboard

**🐛 If Appointment Missing**:

- This indicates the mock data disconnect issue
- Check browser Network tab (F12 > Network)
- Look for POST to `/api/appointments`
- Verify 200/201 response
- If 200 but no data, check database

### Step 15: Test Notifications (Optional)

1. Check email inbox for confirmation email
2. Look for:
   - Subject: "Appointment Confirmed" or similar
   - Confirmation number
   - Meeting link
   - Appointment details

**✅ Expected**: Email received within 1-2 minutes

**⚠️ Known Issue**: Email/SMS may not be configured yet

---

## Part 4: Pre-Appointment Preparation (5 minutes)

### Step 16: Test Video Link (Before Appointment Time)

1. **5 minutes before appointment**, click video link:
   - From Dashboard "Join Call" button
   - Or from confirmation email
   - Or from saved confirmation link

2. Browser should navigate to video consultation page

3. **Grant permissions**:
   - Allow camera access
   - Allow microphone access

4. Test devices:
   - Video preview should show your camera
   - Test microphone (speak and check audio indicator)
   - Test speakers (play test sound if available)

**✅ Expected**:

- Video preview works
- Audio levels detected
- "Waiting for doctor" or "Join Room" button appears

**⏱️ Time Check**: ~2-3 minutes

---

## Part 5: Join Video Consultation (15-20 minutes)

### Step 17: Enter Waiting Room

1. At appointment time (or test time), click **"Join Room"**
2. You should enter the consultation room interface

**✅ Expected**: Video call interface loads with:

- Your video feed (self view)
- Placeholder for doctor video
- Controls: Mute, Camera, End Call
- Chat panel (optional)

### Step 18: Test Video Controls

**🔇 Mute/Unmute Audio**:

1. Click microphone button
2. Verify icon changes (muted/unmuted)
3. Speak and watch audio indicator

**📹 Toggle Camera**:

1. Click camera button
2. Verify video turns off/on
3. Check self-view updates

**💬 Chat (if available)**:

1. Type a test message
2. Verify message appears in chat panel

**✅ Expected**: All controls function correctly

### Step 19: Simulate Doctor Join (Testing Solo)

Since this is a test without a real doctor:

**Option A: Solo Testing**

1. Stay in call for 2-3 minutes
2. Verify connection is stable
3. Check no errors in console
4. Test screen sharing (if button available)

**Option B: Two-Device Testing**

1. Open doctor interface in another browser/device
2. Use doctor test account (if available)
3. Join same consultation ID
4. Verify two-way video/audio

**✅ Expected**: Stable connection for duration

### Step 20: End Consultation

1. Click **"End Call"** or **"Leave"** button
2. Confirm exit if prompted
3. Should return to dashboard or post-visit page

**✅ Expected**: Clean exit, return to app

---

## Part 6: Post-Visit Verification (3 minutes)

### Step 21: Check Appointment Status

1. Return to Dashboard
2. Check appointment status changed:
   - From: "Scheduled"
   - To: "Completed" or "In Progress" or "Finished"

**✅ Expected**: Status reflects visit completion

### Step 22: Look for Visit Summary (May Not Exist Yet)

1. Click on completed appointment
2. Check for:
   - Visit notes (from doctor)
   - Prescriptions (if issued)
   - Follow-up instructions
   - Lab orders

**⚠️ May Not Be Implemented**: This is post-visit EHR functionality

---

## Testing Checklist Summary

### ✅ Registration & Login

- [ ] Homepage loads
- [ ] Registration form works
- [ ] Login successful
- [ ] Dashboard accessible

### ✅ Appointment Scheduling (8 Steps)

- [ ] Step 1: Visit type selected
- [ ] Step 2: Chief complaint entered
- [ ] Step 3: Symptom details provided
- [ ] Step 4: Medical history completed
- [ ] **Step 5: Doctors loaded (NO AUTH ERROR!)** ⭐ CRITICAL
- [ ] Step 6: Date and time selected
- [ ] Step 7: Consents checked and confirmed
- [ ] Step 8: Confirmation received with meeting link

### ✅ Dashboard Integration

- [ ] Appointment appears in dashboard
- [ ] Confirmation email received (optional)
- [ ] Join call button works

### ✅ Video Consultation

- [ ] Video link accessible
- [ ] Camera permissions granted
- [ ] Microphone works
- [ ] Video preview displays
- [ ] Controls function (mute, camera, chat)
- [ ] Connection stable
- [ ] Clean exit from call

### ✅ Post-Visit

- [ ] Status updated
- [ ] Can access appointment details

---

## Common Issues & Troubleshooting

### Issue 1: "Authentication required. Please log in." at Step 5

**Status**: ✅ **FIXED** (Deployed 10/27/2025)
**If Still Occurs**:

1. Clear browser cache (Ctrl+Shift+Del)
2. Log out and log back in
3. Check authToken in localStorage (F12 > Application > Local Storage)
4. Report issue with screenshot

### Issue 2: No Doctors Appear

**Possible Causes**:

- Database not seeded
- API endpoint returning empty array
- Network error

**Solution**:

```bash
# Backend
npm run seed:doctors
npx prisma studio
# Verify DoctorProfile table has records
```

### Issue 3: Appointment Not Saved

**Possible Causes**:

- Mock data disconnect (known issue)
- Database connection error
- API validation failure

**Check**:

1. Browser Network tab: Look for POST `/api/appointments`
2. Check response: Should be 200/201 with appointmentId
3. Query database directly to verify record

### Issue 4: Video Call Won't Connect

**Possible Causes**:

- HCW service not running
- Firewall blocking WebRTC
- Browser permissions denied

**Solution**:

1. Check HCW service status: http://143.198.2.224:3005/health
2. Check browser permissions (camera/mic)
3. Try different browser
4. Verify network allows WebRTC

### Issue 5: Email Not Received

**Possible Causes**:

- Email service not configured
- SMTP credentials missing
- Email in spam folder

**Solution**:

1. Check spam/junk folder
2. Verify SMTP config in .env
3. Check server logs for email errors

---

## Test Results Template

### Test Session Information

- **Date**: **\*\*\*\***\_\_\_**\*\*\*\***
- **Tester**: **\*\*\*\***\_\_\_**\*\*\*\***
- **Browser**: **\*\*\*\***\_\_\_**\*\*\*\***
- **Environment**: Production / Staging

### Results

- **Registration**: ✅ Pass / ❌ Fail
- **Login**: ✅ Pass / ❌ Fail
- **Scheduling (Steps 1-8)**: ✅ Pass / ❌ Fail
  - **Step 5 (Critical)**: ✅ Pass / ❌ Fail
- **Dashboard Integration**: ✅ Pass / ❌ Fail
- **Video Consultation**: ✅ Pass / ❌ Fail
- **Overall Journey**: ✅ Pass / ❌ Fail

### Bugs Found

1. ***
2. ***
3. ***

### Notes

---

---

---

---

## Success Criteria

### ✅ Minimum Viable Journey

- User can register and login
- User can complete all 8 scheduling steps
- Appointment is saved to database
- User receives confirmation with video link
- User can join video call

### ⭐ Optimal Journey

- All minimum criteria met
- No errors or warnings during flow
- Confirmation email received
- Video call stable for 5+ minutes
- Post-visit data accessible

---

## Next Steps After Testing

### If Tests Pass ✅

1. Document successful test results
2. Test with multiple user accounts
3. Test on different browsers/devices
4. Conduct accessibility testing
5. Prepare for production load testing

### If Tests Fail ❌

1. Document exact error messages
2. Record steps to reproduce
3. Check server logs
4. Review database state
5. Create bug report with:
   - Screenshot
   - Console errors
   - Network requests
   - Steps to reproduce

---

## Support Resources

- **Documentation**: See 100_PERCENT_COMPLETION_SUMMARY.md
- **API Docs**: See PROVIDERS_API_IMPLEMENTATION.md
- **Scheduling Flow**: See SCHEDULING_USER_FLOW.md
- **GitHub Issues**: https://github.com/arthurmenson/Telecheck_V1.3-DO/issues

---

**Good luck with your testing!** 🚀

This comprehensive journey should take 30-45 minutes to complete fully. The most critical test point is **Step 5 (Choose Provider)** where the authentication fix we just deployed should prevent the error from appearing.
