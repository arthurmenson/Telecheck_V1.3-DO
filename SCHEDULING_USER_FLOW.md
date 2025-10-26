# Appointment Scheduling User Flow

## Visual Journey Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APPOINTMENT SCHEDULING                        │
│                     8-Step Healthcare Journey                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: VISIT TYPE SELECTION                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  What type of visit do you need?                                    │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │  🩺 Primary Care   │  │  🔄 Follow-up      │                    │
│  │  General health    │  │  Continue care     │                    │
│  └────────────────────┘  └────────────────────┘                    │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │  🚨 Urgent Care    │  │  👨‍⚕️ Specialist     │                    │
│  │  Same day needed   │  │  Expert consult    │                    │
│  └────────────────────┘  └────────────────────┘                    │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │  📋 Second Opinion │  │  💊 Medication     │                    │
│  │  Review diagnosis  │  │  Refill needed     │                    │
│  └────────────────────┘  └────────────────────┘                    │
│                                                                      │
│  ⚠️ For emergencies, call 911 immediately                           │
│                                                                      │
│                              [Continue →]                            │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: CHIEF COMPLAINT                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  What is the main reason for your visit?                            │
│                                                                      │
│  ○ New symptoms or health concern                                   │
│  ○ Existing condition management                                    │
│  ○ Preventive care / wellness check                                 │
│  ○ Mental health / counseling                                       │
│  ○ Test result review                                               │
│  ● Other (please specify)                                           │
│                                                                      │
│  ┌──────────────────────────────────────────────┐                  │
│  │ Please describe your concern in detail...    │                  │
│  │                                               │                  │
│  │                                               │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│  Note: Options change based on visit type from Step 1               │
│                                                                      │
│                [← Back]              [Continue →]                   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: SYMPTOM DETAILS                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tell us more about your symptoms                                   │
│                                                                      │
│  📅 When did your symptoms start?                                   │
│  └─ [Date Picker: ____-__-__]                                      │
│                                                                      │
│  ⏱️ How long have you been experiencing symptoms?                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │  Hours   │ │ Days 1-7 │ │ Weeks 1-4│ │ Months+  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                      │
│  📊 Severity of symptoms?                                           │
│  ┌────────────────────────────────────────────────┐                │
│  │ ○ Mild - Not interfering with activities      │                │
│  │ ● Moderate - Some interference                 │                │
│  │ ○ Severe - Significantly limiting              │                │
│  │ ○ Critical - Unable to function normally       │                │
│  └────────────────────────────────────────────────┘                │
│                                                                      │
│  💊 Any previous treatments tried?                                  │
│  ┌──────────────────────────────────────────────┐                  │
│  │ Ibuprofen 200mg, helped a little...          │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│  💉 Current medications for this issue?                             │
│  ┌──────────────────────────────────────────────┐                  │
│  │ None currently                                │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│                [← Back]              [Continue →]                   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: MEDICAL HISTORY                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Help us understand your medical background                         │
│                                                                      │
│  📋 Have you been seen for this issue before?                       │
│  ● No, this is the first time                                       │
│  ○ Yes, I've been seen before                                       │
│  ○ I'm not sure                                                      │
│                                                                      │
│  ⚠️ Do you have any allergies we should know about?                 │
│  ○ No known allergies                                                │
│  ● Yes, I have allergies                                             │
│                                                                      │
│    ┌──────────────────────────────────────────────┐                │
│    │ Penicillin (causes rash)                     │                │
│    │ Peanuts (anaphylaxis)                        │                │
│    └──────────────────────────────────────────────┘                │
│                                                                      │
│  💊 Current medications?                                            │
│  ┌──────────────────────────────────────────────┐                  │
│  │ Lisinopril 10mg daily                        │                  │
│  │ Vitamin D 1000IU                             │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│  🏥 Recent hospitalizations or surgeries? (6 months)                │
│  ┌──────────────────────────────────────────────┐                  │
│  │ None                                          │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│  🔒 Your privacy is protected (HIPAA compliant)                     │
│                                                                      │
│                [← Back]              [Continue →]                   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: CHOOSE PROVIDER                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Choose Your Doctor                     [Primary Care Visit]        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  👨‍⚕️  Dr. Sarah Johnson                        ⭐ 4.8       │   │
│  │      Family Medicine                          15+ years     │   │
│  │      New York, NY                                           │   │
│  │                                                              │   │
│  │      🕐 Next available: Today at 2:00 PM                    │   │
│  │      🚨 3 slots available today                             │   │
│  │                                                              │   │
│  │      [📹 Video] [📍 In-Person]                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  👨‍⚕️  Dr. Michael Chen                         ⭐ 4.9       │   │
│  │      Internal Medicine                        12+ years     │   │
│  │      New York, NY                                           │   │
│  │                                                              │   │
│  │      🕐 Next available: Tomorrow at 9:00 AM                 │   │
│  │                                                              │   │
│  │      [📹 Video] [📍 In-Person]                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│                [← Back]              [Continue to Scheduling →]     │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: DATE & TIME SELECTION                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Select Date & Time                                                  │
│  Dr. Sarah Johnson - Family Medicine                                │
│                                                                      │
│  📅 Available Dates                                                 │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │   Today      │  │  Tomorrow    │                               │
│  │ 10/26/2025   │  │ 10/27/2025   │                               │
│  │  [🚨 Urgent] │  │  [Regular]   │                               │
│  └──────────────┘  └──────────────┘                               │
│                                                                      │
│  🕐 Available Times (Today selected)                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ 2:00 PM │ │ 2:30 PM │ │ 4:30 PM │ │ 5:00 PM │ │ 5:30 PM │    │
│  │🚨Same Day│ │🚨Same Day│ │🚨Same Day│ │📹 Video │ │📹 Video │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│                                                                      │
│                [← Back]              [Continue →]                   │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: PRE-VISIT INFORMATION & CONSENTS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Prepare for Your Visit                                             │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📄 WHAT TO HAVE READY                                        │  │
│  │                                                               │  │
│  │ ✓ List of Current Medications (with dosages)                 │  │
│  │ ✓ Recent Test Results (if applicable)                        │  │
│  │ ✓ Insurance Card (both sides)                                │  │
│  │ ✓ Photo ID                                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📹 VIDEO CONSULTATION TIPS                                    │  │
│  │                                                               │  │
│  │ 📶 Stable Internet  │  💡 Good Lighting                      │  │
│  │ 🔇 Quiet Location   │  ⏰ Join 5 Min Early                   │  │
│  │                                                               │  │
│  │ ⏱️ Typical Duration: 15-30 minutes                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ✓ WHAT TO EXPECT                                             │  │
│  │                                                               │  │
│  │ • Provider reviews your intake info beforehand               │  │
│  │ • Standard medical visit format                              │  │
│  │ • Prescriptions sent to your pharmacy if needed              │  │
│  │ • Visit summary via patient portal                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ⚠️ REQUIRED ACKNOWLEDGEMENTS                                  │  │
│  │                                                               │  │
│  │ ☑ Telehealth Consent: I consent to receive healthcare       │  │
│  │   services via telehealth technology...                      │  │
│  │                                                               │  │
│  │ ☑ Emergency Understanding: I understand telehealth is NOT   │  │
│  │   for medical emergencies. Call 911 for emergencies...      │  │
│  │                                                               │  │
│  │ ☑ Billing Authorization: I authorize billing my insurance   │  │
│  │   and accept responsibility for copays/deductibles...        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ APPOINTMENT SUMMARY                                          │  │
│  │                                                               │  │
│  │ Visit Type: Primary Care     │  Provider: Dr. Sarah Johnson │  │
│  │ Reason: New symptoms         │  Date: Today (10/26/2025)    │  │
│  │ Type: Video Consultation     │  Time: 2:00 PM               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                [← Back]      [Confirm & Book Appointment →]         │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 8: CONFIRMATION                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                   ✅ Appointment Confirmed!                          │
│           Your appointment has been successfully scheduled           │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ APPOINTMENT DETAILS                                          │  │
│  │                                                               │  │
│  │ VISIT INFORMATION        │  APPOINTMENT TIME                 │  │
│  │ Visit Type: Primary Care │  Provider: Dr. Sarah Johnson     │  │
│  │ Reason: New symptoms     │  Date: Today (10/26/2025)        │  │
│  │ Type: Video Call         │  Time: 2:00 PM                   │  │
│  │                                                               │  │
│  │ ─────────────────────────────────────────────────────────── │  │
│  │                                                               │  │
│  │ Confirmation Number: CONF-ABC12345                           │  │
│  │ Save this number for your records                            │  │
│  │                                                               │  │
│  │ ─────────────────────────────────────────────────────────── │  │
│  │                                                               │  │
│  │ Video Consultation Link:                                     │  │
│  │ 📹 Join Video Call                                           │  │
│  │ (Link also sent via email)                                   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ ℹ️ BEFORE YOUR APPOINTMENT                                    │  │
│  │                                                               │  │
│  │ ✓ Have your list of current medications ready               │  │
│  │ ✓ Prepare any questions for your provider                   │  │
│  │ ✓ Test camera and microphone 5 minutes early                │  │
│  │ ✓ Find a quiet, private location with good lighting         │  │
│  │ ✓ Have insurance card and photo ID available                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│              [Back to Dashboard]  [Add to Calendar]                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Progress Indicator (Visible Throughout)

### Desktop View

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ ─── ✓ ─── ✓ ─── ✓ ─── ● ─── ○ ─── ○ ─── ○                      │
│  1     2     3     4     5     6     7     8                        │
│ Visit Chief Symptom Med  Doctor Date  Pre-  Confirm                │
│ Type  Comp. Details Hist        Time  Visit                         │
│                                                                      │
│        Step 5 of 8: Select your healthcare provider                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile View

```
┌─────────────────────────────────────┐
│  ● 5                                │
│    Choose Provider                  │
│    Step 5 of 8                      │
│                                     │
│  ████████████░░░░░░░░ 62%          │
└─────────────────────────────────────┘
```

---

## Data Flow

```
User Input (Steps 1-7)
        ↓
Frontend State Management
        ↓
API Payload Assembly
        ↓
POST /api/appointments
        ↓
Database Storage
        ↓
POST /api/consultations/{id}/hcw-session
        ↓
HCW Integration
        ↓
POST /api/notifications/appointment
        ↓
Email/SMS Notification
        ↓
Confirmation Screen (Step 8)
```

---

## Validation Gates

```
Step 1 → 2:  ✓ Visit type selected
Step 2 → 3:  ✓ Chief complaint selected
             ✓ Custom reason if "Other" selected
Step 3 → 4:  ✓ No validation (optional details)
Step 4 → 5:  ✓ Allergy details if allergies indicated
Step 5 → 6:  ✓ Doctor selected
             ✓ Doctors loaded successfully
Step 6 → 7:  ✓ Date selected
             ✓ Time selected
Step 7 → 8:  ✓ Telehealth consent checked
             ✓ Emergency understanding checked
             ✓ Billing authorization checked
```

---

## Mobile Responsive Breakpoints

```
Mobile (< 768px)
├─ Single column layout
├─ Compact progress indicator
├─ Stack cards vertically
├─ Touch-friendly buttons (44px min)
└─ Collapsible sections

Tablet (768px - 1024px)
├─ 2-column grids where applicable
├─ Full progress indicator
├─ Side-by-side navigation buttons
└─ Optimized card sizes

Desktop (> 1024px)
├─ Full 8-step progress bar
├─ 2-3 column layouts
├─ Expanded information cards
└─ Maximum content width: 1200px
```

---

## Time to Complete

```
Average User Journey: 5-8 minutes

Step 1: Visit Type           ~30 seconds
Step 2: Chief Complaint      ~45 seconds
Step 3: Symptom Details      ~2 minutes
Step 4: Medical History      ~2 minutes
Step 5: Choose Doctor        ~1 minute
Step 6: Date & Time          ~30 seconds
Step 7: Pre-Visit & Consent  ~1-2 minutes
Step 8: Confirmation         ~30 seconds
```

---

## Key Features Summary

✅ 8-step comprehensive intake process
✅ Healthcare industry best practices
✅ HIPAA compliance notices
✅ Informed consent collection
✅ Mobile responsive design
✅ Progress tracking (desktop + mobile)
✅ Contextual help throughout
✅ Pre-visit preparation guidance
✅ Professional medical terminology
✅ Validation at each step
✅ Enhanced confirmation with checklist
✅ Emergency care disclaimers
✅ Video call best practices

---

## User Experience Highlights

🎯 **Clear Navigation** - Back buttons, disabled states, visual feedback
🔒 **Privacy First** - HIPAA notices, secure data handling
📱 **Mobile Optimized** - Touch-friendly, responsive layouts
✨ **Professional** - Medical-grade UI/UX
🚀 **Fast** - Only renders current step, optimized performance
♿ **Accessible** - Semantic HTML, keyboard navigation
📊 **Informative** - Context-aware help, preparation checklists
