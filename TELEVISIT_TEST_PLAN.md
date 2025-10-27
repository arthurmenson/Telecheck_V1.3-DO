# TeleVisit End-to-End Test Plan

**Test Plan ID**: TVT-001
**Date Created**: October 27, 2025
**Test Lead**: QA Team
**Environment**: Production (https://whale-app-bs3xa.ondigitalocean.app)
**Objective**: Validate complete televisit journey from patient registration through video consultation

---

## Test Scope

### In Scope

- ✅ User registration (patient and provider)
- ✅ Authentication and authorization
- ✅ 8-step appointment scheduling flow
- ✅ Provider selection (critical - auth fix validation)
- ✅ Database persistence
- ✅ Video consultation integration
- ✅ Dashboard updates
- ✅ Notification system (if configured)

### Out of Scope

- ❌ Payment processing
- ❌ Insurance verification
- ❌ EHR integration beyond HCW
- ❌ Load/performance testing
- ❌ Security penetration testing

---

## Test Environment

### URLs

- **Frontend**: https://whale-app-bs3xa.ondigitalocean.app
- **API**: https://telecheck-api-8jwxq.ondigitalocean.app
- **HCW Video**: http://143.198.2.224:3005

### Database

- **Type**: PostgreSQL on DigitalOcean
- **Access**: Via Prisma Studio or direct connection

### Test Accounts (To Be Created)

- **Test Patient**: testpatient-20251027@telecheck.test
- **Test Provider**: testdoctor-20251027@telecheck.test

---

## Test Data Requirements

### Test Provider Data

```json
{
  "email": "testdoctor-20251027@telecheck.test",
  "password": "TestDoctor123!",
  "role": "DOCTOR",
  "profile": {
    "name": "Dr. Test Provider",
    "specialty": "Family Medicine",
    "credentials": "MD, FAAFP",
    "bio": "Board-certified family medicine physician for testing",
    "experience": 10,
    "rating": 4.8,
    "languages": ["English"],
    "videoEnabled": true,
    "phoneEnabled": true,
    "inPersonEnabled": true,
    "location": "Test City, NY"
  }
}
```

### Test Patient Data

```json
{
  "email": "testpatient-20251027@telecheck.test",
  "password": "TestPatient123!",
  "role": "PATIENT",
  "profile": {
    "name": "Test Patient",
    "dateOfBirth": "1990-01-15",
    "phone": "+1-555-TEST-001",
    "address": {
      "street": "123 Test Street",
      "city": "Test City",
      "state": "NY",
      "zipCode": "10001"
    }
  }
}
```

---

## Test Cases

### TC-001: Provider Account Creation

**Priority**: High
**Prerequisites**: None
**Test Data**: Test Provider Data (above)

| Step | Action                                           | Expected Result                     | Status | Notes    |
| ---- | ------------------------------------------------ | ----------------------------------- | ------ | -------- |
| 1.1  | Navigate to registration page                    | Page loads successfully             | ⏳     |          |
| 1.2  | Select "I'm a Healthcare Provider" or equivalent | Provider registration form shows    | ⏳     |          |
| 1.3  | Fill in provider details                         | Form accepts input                  | ⏳     |          |
| 1.4  | Submit registration                              | Account created, confirmation shown | ⏳     |          |
| 1.5  | Verify email sent (if enabled)                   | Confirmation email received         | ⏳     | Optional |
| 1.6  | Login with provider credentials                  | Successfully logged in              | ⏳     |          |
| 1.7  | Verify provider dashboard access                 | Provider-specific features visible  | ⏳     |          |

**Pass Criteria**: Provider account created and accessible

---

### TC-002: Patient Account Creation

**Priority**: High
**Prerequisites**: None
**Test Data**: Test Patient Data (above)

| Step | Action                               | Expected Result                     | Status | Notes    |
| ---- | ------------------------------------ | ----------------------------------- | ------ | -------- |
| 2.1  | Navigate to registration page        | Page loads successfully             | ⏳     |          |
| 2.2  | Select "I'm a Patient" or equivalent | Patient registration form shows     | ⏳     |          |
| 2.3  | Fill in patient details              | Form accepts input                  | ⏳     |          |
| 2.4  | Submit registration                  | Account created, confirmation shown | ⏳     |          |
| 2.5  | Verify email sent (if enabled)       | Confirmation email received         | ⏳     | Optional |
| 2.6  | Login with patient credentials       | Successfully logged in              | ⏳     |          |
| 2.7  | Verify patient dashboard access      | Patient dashboard visible           | ⏳     |          |

**Pass Criteria**: Patient account created and accessible

---

### TC-003: Scheduling Step 1 - Visit Type Selection

**Priority**: High
**Prerequisites**: TC-002 passed, patient logged in
**Test Data**: Select "Primary Care"

| Step | Action                                        | Expected Result                | Status | Notes |
| ---- | --------------------------------------------- | ------------------------------ | ------ | ----- |
| 3.1  | Click "Schedule Appointment"                  | Scheduling page loads          | ⏳     |       |
| 3.2  | Verify progress indicator shows "Step 1 of 8" | Progress indicator correct     | ⏳     |       |
| 3.3  | View all visit type options                   | 6 options visible with icons   | ⏳     |       |
| 3.4  | Click "Primary Care"                          | Card highlights/selects        | ⏳     |       |
| 3.5  | Click "Continue" without selection            | Button disabled or error shown | ⏳     |       |
| 3.6  | Select "Primary Care" and click "Continue"    | Progress to Step 2             | ⏳     |       |

**Pass Criteria**: Visit type selection works, validation enforced

---

### TC-004: Scheduling Step 2 - Chief Complaint

**Priority**: High
**Prerequisites**: TC-003 passed
**Test Data**: "New symptoms or health concern"

| Step | Action                                         | Expected Result              | Status | Notes |
| ---- | ---------------------------------------------- | ---------------------------- | ------ | ----- |
| 4.1  | Verify Step 2 loaded                           | "Chief Complaint" shown      | ⏳     |       |
| 4.2  | Verify options match visit type                | Contextual options displayed | ⏳     |       |
| 4.3  | Select "New symptoms or health concern"        | Option selected              | ⏳     |       |
| 4.4  | Click "Back" button                            | Return to Step 1             | ⏳     |       |
| 4.5  | Return to Step 2, select "Other"               | Text area appears            | ⏳     |       |
| 4.6  | Leave text empty, click "Continue"             | Error or button disabled     | ⏳     |       |
| 4.7  | Enter "Persistent headaches", click "Continue" | Progress to Step 3           | ⏳     |       |

**Pass Criteria**: Chief complaint selection works with validation

---

### TC-005: Scheduling Step 3 - Symptom Details

**Priority**: Medium
**Prerequisites**: TC-004 passed
**Test Data**: Various symptom details

| Step | Action                        | Expected Result         | Status | Notes |
| ---- | ----------------------------- | ----------------------- | ------ | ----- |
| 5.1  | Verify Step 3 loaded          | "Symptom Details" shown | ⏳     |       |
| 5.2  | Select start date: 3 days ago | Date picker works       | ⏳     |       |
| 5.3  | Select duration: "Days 1-7"   | Option selected         | ⏳     |       |
| 5.4  | Select severity: "Moderate"   | Radio button selected   | ⏳     |       |
| 5.5  | Enter previous treatments     | Text area accepts input | ⏳     |       |
| 5.6  | Enter current medications     | Text area accepts input | ⏳     |       |
| 5.7  | Click "Continue"              | Progress to Step 4      | ⏳     |       |

**Pass Criteria**: Symptom details form works, all fields optional

---

### TC-006: Scheduling Step 4 - Medical History

**Priority**: High
**Prerequisites**: TC-005 passed
**Test Data**: Medical history information

| Step | Action                                        | Expected Result                | Status | Notes |
| ---- | --------------------------------------------- | ------------------------------ | ------ | ----- |
| 6.1  | Verify Step 4 loaded                          | "Medical History" shown        | ⏳     |       |
| 6.2  | Select "No, first time" for previous visit    | Option selected                | ⏳     |       |
| 6.3  | Select "Yes, I have allergies"                | Allergy details field appears  | ⏳     |       |
| 6.4  | Leave allergy details empty, click "Continue" | Error shown or button disabled | ⏳     |       |
| 6.5  | Enter "Penicillin (rash)" in allergy field    | Text accepted                  | ⏳     |       |
| 6.6  | Enter current medications                     | Text area accepts input        | ⏳     |       |
| 6.7  | Enter recent hospitalizations                 | Text area accepts input        | ⏳     |       |
| 6.8  | Verify HIPAA notice visible                   | Notice displayed               | ⏳     |       |
| 6.9  | Click "Continue"                              | Progress to Step 5             | ⏳     |       |

**Pass Criteria**: Medical history form works with validation

---

### TC-007: Scheduling Step 5 - Choose Provider ⭐ CRITICAL

**Priority**: CRITICAL
**Prerequisites**: TC-006 passed, TC-001 passed (provider exists)
**Test Data**: Test Provider created in TC-001

| Step | Action                                           | Expected Result                                   | Status | Notes             |
| ---- | ------------------------------------------------ | ------------------------------------------------- | ------ | ----------------- |
| 7.1  | Verify Step 5 loaded                             | "Choose Your Doctor" shown                        | ⏳     |                   |
| 7.2  | **CRITICAL**: Verify NO auth error appears       | No "Authentication required" error                | ⏳     | **AUTH FIX TEST** |
| 7.3  | Verify loading state shows                       | Skeleton cards display                            | ⏳     |                   |
| 7.4  | Wait for doctors to load                         | List of doctors appears                           | ⏳     |                   |
| 7.5  | Verify test provider in list                     | Test provider card visible                        | ⏳     |                   |
| 7.6  | Verify provider details shown                    | Name, specialty, rating, experience               | ⏳     |                   |
| 7.7  | Verify availability shown                        | "Next available" time displayed                   | ⏳     |                   |
| 7.8  | Verify badges shown                              | Video/In-Person badges present                    | ⏳     |                   |
| 7.9  | Click provider card                              | Card highlights with border                       | ⏳     |                   |
| 7.10 | Click "Continue to Scheduling" without selection | Button disabled                                   | ⏳     |                   |
| 7.11 | Select test provider, click "Continue"           | Progress to Step 6                                | ⏳     |                   |
| 7.12 | Check browser console                            | No JavaScript errors                              | ⏳     |                   |
| 7.13 | Check Network tab                                | API call to /api/telemedicine/providers succeeded | ⏳     |                   |

**Pass Criteria**:

- ✅ No authentication error
- ✅ Doctors load successfully
- ✅ Selection works smoothly
- ✅ Test provider appears in list

**Known Issue**: If this fails, the auth fix didn't deploy correctly

---

### TC-008: Scheduling Step 6 - Date & Time Selection

**Priority**: High
**Prerequisites**: TC-007 passed
**Test Data**: Select today, 2:00 PM

| Step | Action                                | Expected Result                | Status | Notes |
| ---- | ------------------------------------- | ------------------------------ | ------ | ----- |
| 8.1  | Verify Step 6 loaded                  | "Select Date & Time" shown     | ⏳     |       |
| 8.2  | Verify provider name displayed        | Test provider name shown       | ⏳     |       |
| 8.3  | View date options                     | "Today" and "Tomorrow" buttons | ⏳     |       |
| 8.4  | Click "Today"                         | Date selected, highlights      | ⏳     |       |
| 8.5  | Verify time slots appear              | 5-6 time slots shown           | ⏳     |       |
| 8.6  | Verify slot types indicated           | Icons show urgent/video types  | ⏳     |       |
| 8.7  | Click time slot "2:00 PM"             | Slot selected, highlights      | ⏳     |       |
| 8.8  | Click "Tomorrow"                      | Time slots update for tomorrow | ⏳     |       |
| 8.9  | Return to "Today", reselect "2:00 PM" | Selection maintained           | ⏳     |       |
| 8.10 | Click "Continue"                      | Progress to Step 7             | ⏳     |       |

**Pass Criteria**: Date and time selection works correctly

---

### TC-009: Scheduling Step 7 - Pre-Visit & Consents

**Priority**: High
**Prerequisites**: TC-008 passed
**Test Data**: All consents checked

| Step | Action                               | Expected Result               | Status | Notes |
| ---- | ------------------------------------ | ----------------------------- | ------ | ----- |
| 9.1  | Verify Step 7 loaded                 | "Pre-Visit Information" shown | ⏳     |       |
| 9.2  | Verify preparation checklist visible | Checklist items displayed     | ⏳     |       |
| 9.3  | Verify video tips visible            | Video consultation tips shown | ⏳     |       |
| 9.4  | Verify appointment summary card      | All booking details shown     | ⏳     |       |
| 9.5  | Click "Confirm" without consents     | Button disabled               | ⏳     |       |
| 9.6  | Check only 2 of 3 consents           | Button still disabled         | ⏳     |       |
| 9.7  | Check all 3 required consents        | Button enabled                | ⏳     |       |
| 9.8  | Click "Confirm & Book Appointment"   | Loading spinner shows         | ⏳     |       |
| 9.9  | Wait for booking to complete         | Progress to Step 8 (5-10 sec) | ⏳     |       |
| 9.10 | Check for errors                     | No error messages shown       | ⏳     |       |

**Pass Criteria**: Consent validation works, booking succeeds

---

### TC-010: Scheduling Step 8 - Confirmation

**Priority**: High
**Prerequisites**: TC-009 passed
**Test Data**: N/A

| Step | Action                          | Expected Result                | Status | Notes                |
| ---- | ------------------------------- | ------------------------------ | ------ | -------------------- |
| 10.1 | Verify Step 8 loaded            | "Appointment Confirmed!" shown | ⏳     |                      |
| 10.2 | Verify green checkmark icon     | Success icon displayed         | ⏳     |                      |
| 10.3 | Verify appointment details card | All details present            | ⏳     |                      |
| 10.4 | Verify confirmation number      | Format: CONF-XXXXXXXX          | ⏳     | Record: **\_\_\_\_** |
| 10.5 | Verify video link present       | "Join Video Call" link shown   | ⏳     |                      |
| 10.6 | Copy video link                 | Link copied successfully       | ⏳     | Record: **\_\_\_\_** |
| 10.7 | Verify preparation checklist    | Pre-visit checklist shown      | ⏳     |                      |
| 10.8 | Click "Back to Dashboard"       | Navigate to dashboard          | ⏳     |                      |

**Pass Criteria**: Confirmation displayed with all required info

**Record**:

- Confirmation #: **\*\*\*\***\_\_\_**\*\*\*\***
- Video Link: \***\*\*\*\*\***\_\_\***\*\*\*\*\***
- Appointment ID: **\*\*\*\***\_\_**\*\*\*\***

---

### TC-011: Database Persistence Verification

**Priority**: CRITICAL
**Prerequisites**: TC-010 passed
**Test Data**: Confirmation number from TC-010

| Step  | Action                                   | Expected Result          | Status | Notes |
| ----- | ---------------------------------------- | ------------------------ | ------ | ----- |
| 11.1  | Open Prisma Studio or DB client          | Database accessible      | ⏳     |       |
| 11.2  | Navigate to Appointment table            | Table visible            | ⏳     |       |
| 11.3  | Search for appointment by confirmation # | Record found             | ⏳     |       |
| 11.4  | Verify all fields populated              | All data saved correctly | ⏳     |       |
| 11.5  | Verify visitType saved                   | Value: "primary_care"    | ⏳     |       |
| 11.6  | Verify chiefComplaint saved              | Custom text saved        | ⏳     |       |
| 11.7  | Verify symptomDetails JSON saved         | JSON structure correct   | ⏳     |       |
| 11.8  | Verify medicalContext JSON saved         | JSON structure correct   | ⏳     |       |
| 11.9  | Verify consents JSON saved               | All 3 consents = true    | ⏳     |       |
| 11.10 | Verify intakeCompleted = true            | Boolean flag set         | ⏳     |       |
| 11.11 | Verify intakeVersion = "2.0"             | Version string correct   | ⏳     |       |
| 11.12 | Verify doctorId matches test provider    | Foreign key correct      | ⏳     |       |

**Pass Criteria**: All appointment data persisted correctly in database

**Known Issue**: If data missing, mock data disconnect issue exists

---

### TC-012: Dashboard Integration

**Priority**: High
**Prerequisites**: TC-011 passed
**Test Data**: Patient logged in

| Step | Action                                 | Expected Result                | Status | Notes |
| ---- | -------------------------------------- | ------------------------------ | ------ | ----- |
| 12.1 | Navigate to patient dashboard          | Dashboard loads                | ⏳     |       |
| 12.2 | Locate "Upcoming Appointments" section | Section visible                | ⏳     |       |
| 12.3 | Verify appointment in list             | Test appointment displayed     | ⏳     |       |
| 12.4 | Verify appointment details             | Doctor, date, time shown       | ⏳     |       |
| 12.5 | Verify status badge                    | Status: "Scheduled" or similar | ⏳     |       |
| 12.6 | Verify "Join Call" button present      | Button visible                 | ⏳     |       |
| 12.7 | Click appointment card                 | Appointment details page opens | ⏳     |       |
| 12.8 | Verify all details visible             | Full appointment info shown    | ⏳     |       |

**Pass Criteria**: Appointment visible and accessible from dashboard

---

### TC-013: Video Consultation Setup

**Priority**: High
**Prerequisites**: TC-012 passed
**Test Data**: Video link from TC-010

| Step  | Action                                 | Expected Result                | Status | Notes |
| ----- | -------------------------------------- | ------------------------------ | ------ | ----- |
| 13.1  | Click video link or "Join Call" button | Video page loads               | ⏳     |       |
| 13.2  | Browser requests camera permission     | Permission dialog shown        | ⏳     |       |
| 13.3  | Grant camera permission                | Permission granted             | ⏳     |       |
| 13.4  | Browser requests microphone permission | Permission dialog shown        | ⏳     |       |
| 13.5  | Grant microphone permission            | Permission granted             | ⏳     |       |
| 13.6  | Verify video preview appears           | Self-view shows camera feed    | ⏳     |       |
| 13.7  | Verify audio indicator works           | Speaking shows audio levels    | ⏳     |       |
| 13.8  | Verify controls visible                | Mute, camera, end call buttons | ⏳     |       |
| 13.9  | Test mute button                       | Icon toggles, audio mutes      | ⏳     |       |
| 13.10 | Test camera button                     | Video feed toggles on/off      | ⏳     |       |
| 13.11 | Verify waiting state                   | "Waiting for provider" message | ⏳     |       |

**Pass Criteria**: Video interface loads, permissions work, controls functional

---

### TC-014: Video Consultation Connection

**Priority**: High
**Prerequisites**: TC-013 passed, provider account available
**Test Data**: Provider joins from separate browser/device

| Step  | Action                                     | Expected Result             | Status | Notes |
| ----- | ------------------------------------------ | --------------------------- | ------ | ----- |
| 14.1  | Provider logs in (separate session)        | Provider dashboard loads    | ⏳     |       |
| 14.2  | Provider navigates to appointments         | Appointment list visible    | ⏳     |       |
| 14.3  | Provider clicks "Join" on test appointment | Provider video page loads   | ⏳     |       |
| 14.4  | Both parties in call                       | Two video feeds visible     | ⏳     |       |
| 14.5  | Test patient audio                         | Provider hears patient      | ⏳     |       |
| 14.6  | Test provider audio                        | Patient hears provider      | ⏳     |       |
| 14.7  | Test patient video                         | Provider sees patient video | ⏳     |       |
| 14.8  | Test provider video                        | Patient sees provider video | ⏳     |       |
| 14.9  | Test chat (if available)                   | Messages sent/received      | ⏳     |       |
| 14.10 | Test screen share (if available)           | Screen sharing works        | ⏳     |       |
| 14.11 | Maintain connection 5 minutes              | No disconnections           | ⏳     |       |
| 14.12 | Provider ends call                         | Both parties disconnected   | ⏳     |       |

**Pass Criteria**: Two-way audio/video works, stable connection

**Note**: May require two devices or browsers for testing

---

### TC-015: Post-Visit Verification

**Priority**: Medium
**Prerequisites**: TC-014 passed
**Test Data**: Completed appointment

| Step | Action                           | Expected Result                  | Status | Notes    |
| ---- | -------------------------------- | -------------------------------- | ------ | -------- |
| 15.1 | Patient returns to dashboard     | Dashboard loads                  | ⏳     |          |
| 15.2 | Check appointment status         | Status updated to "Completed"    | ⏳     |          |
| 15.3 | Click completed appointment      | Details page opens               | ⏳     |          |
| 15.4 | Look for visit summary           | Summary visible (if implemented) | ⏳     | Optional |
| 15.5 | Check for prescriptions          | Prescriptions shown (if issued)  | ⏳     | Optional |
| 15.6 | Check for follow-up instructions | Instructions visible (if added)  | ⏳     | Optional |
| 15.7 | Verify appointment in history    | Appears in past appointments     | ⏳     |          |

**Pass Criteria**: Appointment status updated correctly

---

### TC-016: Notification Verification (Optional)

**Priority**: Low
**Prerequisites**: TC-010 passed, email/SMS configured
**Test Data**: Test email and phone number

| Step | Action                 | Expected Result                        | Status | Notes        |
| ---- | ---------------------- | -------------------------------------- | ------ | ------------ |
| 16.1 | Check email inbox      | Confirmation email received            | ⏳     | Within 5 min |
| 16.2 | Verify email content   | Contains confirmation #, link, details | ⏳     |              |
| 16.3 | Click email link       | Opens video call page                  | ⏳     |              |
| 16.4 | Check SMS (if enabled) | Confirmation SMS received              | ⏳     | Optional     |
| 16.5 | Verify SMS content     | Contains confirmation # and link       | ⏳     | Optional     |

**Pass Criteria**: Notifications sent and contain correct information

**Known Issue**: Email/SMS may not be configured

---

### TC-017: Error Handling & Edge Cases

**Priority**: Medium
**Prerequisites**: Patient logged in
**Test Data**: Various invalid inputs

| Step | Action                                           | Expected Result                 | Status | Notes |
| ---- | ------------------------------------------------ | ------------------------------- | ------ | ----- |
| 17.1 | Try booking without login                        | Redirect to login or error      | ⏳     |       |
| 17.2 | Try accessing Step 5 directly (URL manipulation) | Redirect to Step 1 or error     | ⏳     |       |
| 17.3 | Try booking same slot twice                      | Second booking fails gracefully | ⏳     |       |
| 17.4 | Try booking in past time                         | Validation error shown          | ⏳     |       |
| 17.5 | Test network interruption during booking         | Error shown, data not lost      | ⏳     |       |
| 17.6 | Test session timeout during booking              | Graceful redirect to login      | ⏳     |       |
| 17.7 | Test with invalid date format                    | Validation catches error        | ⏳     |       |

**Pass Criteria**: All edge cases handled gracefully

---

## Bug Tracking Template

### Bug Report Format

```markdown
**Bug ID**: BUG-TVT-XXX
**Test Case**: TC-XXX
**Severity**: Critical / High / Medium / Low
**Status**: Open / In Progress / Fixed / Verified

**Description**:
[Clear description of the bug]

**Steps to Reproduce**:

1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happens]

**Screenshots**:
[Attach screenshots]

**Console Errors**:
[Browser console errors if any]

**Network Info**:
[API calls, status codes, response data]

**Environment**:

- Browser:
- OS:
- User Account:

**Fix Notes**:
[Notes on the fix]
```

---

## Test Execution Log

### Test Session 1

- **Date**: **\*\*\*\***\_\_\_**\*\*\*\***
- **Tester**: **\*\*\*\***\_\_\_**\*\*\*\***
- **Duration**: **\*\*\*\***\_\_\_**\*\*\*\***
- **Environment**: Production

| Test Case | Status | Pass/Fail | Issues Found | Notes    |
| --------- | ------ | --------- | ------------ | -------- |
| TC-001    | ⏳     | -         | -            |          |
| TC-002    | ⏳     | -         | -            |          |
| TC-003    | ⏳     | -         | -            |          |
| TC-004    | ⏳     | -         | -            |          |
| TC-005    | ⏳     | -         | -            |          |
| TC-006    | ⏳     | -         | -            |          |
| TC-007 ⭐ | ⏳     | -         | -            | CRITICAL |
| TC-008    | ⏳     | -         | -            |          |
| TC-009    | ⏳     | -         | -            |          |
| TC-010    | ⏳     | -         | -            |          |
| TC-011    | ⏳     | -         | -            |          |
| TC-012    | ⏳     | -         | -            |          |
| TC-013    | ⏳     | -         | -            |          |
| TC-014    | ⏳     | -         | -            |          |
| TC-015    | ⏳     | -         | -            |          |
| TC-016    | ⏳     | -         | -            | Optional |
| TC-017    | ⏳     | -         | -            |          |

**Summary**:

- Total: 17 test cases
- Passed: \_\_\_ / 17
- Failed: \_\_\_ / 17
- Blocked: \_\_\_ / 17

---

## Success Criteria

### Must Pass (Critical)

- ✅ TC-001: Provider account created
- ✅ TC-002: Patient account created
- ✅ TC-007: Provider selection (NO AUTH ERROR)
- ✅ TC-009: Appointment booking succeeds
- ✅ TC-011: Database persistence verified
- ✅ TC-013: Video setup works

### Should Pass (High Priority)

- ✅ TC-003 through TC-006: All scheduling steps
- ✅ TC-008: Date/time selection
- ✅ TC-010: Confirmation received
- ✅ TC-012: Dashboard integration
- ✅ TC-014: Video connection works

### Nice to Have (Medium Priority)

- ✅ TC-015: Post-visit status update
- ✅ TC-016: Notifications sent
- ✅ TC-017: Error handling

---

## Next Steps

### After Test Execution

1. ✅ Complete all test cases
2. ✅ Document all bugs found
3. ✅ Create bug reports with screenshots
4. ✅ Prioritize bugs by severity
5. ✅ Fix critical and high-severity bugs
6. ✅ Retest failed test cases
7. ✅ Verify all fixes
8. ✅ Sign off on test completion

### Definition of Done

- [ ] All critical test cases passed
- [ ] All high-priority test cases passed
- [ ] All bugs documented
- [ ] Critical bugs fixed and verified
- [ ] Test execution log completed
- [ ] Sign-off obtained

---

## Test Artifacts

### Documents to Produce

1. ✅ Test Plan (this document)
2. ✅ Test Execution Log (above section)
3. ✅ Bug Reports (as needed)
4. ✅ Test Summary Report (after completion)
5. ✅ Screenshots/Screen recordings
6. ✅ Database verification screenshots

### File Locations

- Test Plan: `TELEVISIT_TEST_PLAN.md`
- Bug Reports: `test-results/bugs/`
- Screenshots: `test-results/screenshots/`
- Logs: `test-results/logs/`

---

**Ready to Begin Testing!**

Start with TC-001 and work through sequentially. Document everything!
