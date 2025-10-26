# Accessibility QA Testing Checklist

## WCAG 2.1 AA Compliance Validation

---

## Purpose

This checklist is for QA testers to validate that all accessibility fixes have been properly implemented and the Telecheck patient portal achieves 100% WCAG 2.1 AA compliance.

**Estimated Testing Time**: 4-6 hours for complete validation

---

## Pre-Testing Setup

### Install Required Tools

#### 1. Browser Extensions

- [ ] Install **axe DevTools** for Chrome/Firefox
  - URL: https://www.deque.com/axe/devtools/
  - Purpose: Automated accessibility scanning

- [ ] Install **WAVE** extension
  - URL: https://wave.webaim.org/extension/
  - Purpose: Visual accessibility evaluation

#### 2. Screen Readers

- [ ] **Windows Users**: Install NVDA (Free)
  - URL: https://www.nvaccess.org/download/
  - Basic Controls:
    - Insert + Down Arrow: Start reading
    - Ctrl: Stop speaking
    - Tab: Navigate interactive elements
    - H: Jump to headings

- [ ] **Mac Users**: Enable VoiceOver (Built-in)
  - Enable: Cmd + F5
  - Basic Controls:
    - VO + Right Arrow: Next item (VO = Ctrl + Option)
    - VO + Spacebar: Activate
    - VO + Shift + Down: Enter element

#### 3. Color Contrast Tools

- [ ] Bookmark **WebAIM Contrast Checker**
  - URL: https://webaim.org/resources/contrastchecker/
  - Purpose: Validate text contrast ratios

### Test Environment Setup

- [ ] Test in Chrome (latest version)
- [ ] Test in Firefox (latest version)
- [ ] Test in Safari (latest version) if on Mac
- [ ] Test in Edge (latest version) if on Windows
- [ ] Screen resolution: 1920x1080 (standard desktop)
- [ ] Also test at 1366x768 (common laptop resolution)

---

## Automated Testing (30 minutes)

### axe DevTools Scan

Test each page with axe DevTools:

#### Dashboard

- [ ] Navigate to http://localhost:5173/dashboard
- [ ] Open DevTools (F12)
- [ ] Click "axe DevTools" tab
- [ ] Click "Scan ALL of my page"
- [ ] **Expected Result**: 0 violations
- [ ] Screenshot violations if any found
- [ ] Document in bug report

#### Schedule

- [ ] Navigate to http://localhost:5173/schedule
- [ ] Run axe scan
- [ ] **Expected Result**: 0 violations
- [ ] Test all 3 steps of scheduling flow
- [ ] Document any issues

#### Medications

- [ ] Navigate to http://localhost:5173/medications
- [ ] Run axe scan
- [ ] **Expected Result**: 0 violations
- [ ] Test all tabs (Overview, Interactions, Analytics, AI)
- [ ] Document any issues

#### Televisit

- [ ] Navigate to http://localhost:5173/televisit/:appointmentId
- [ ] Run axe scan
- [ ] **Expected Result**: 0 violations
- [ ] Document any issues

### WAVE Evaluation

Repeat for each page:

- [ ] Click WAVE extension icon
- [ ] Review summary:
  - **Errors**: Must be 0
  - **Contrast Errors**: Must be 0
  - **Alerts**: Review and verify false positives
  - **Features**: Should show ARIA labels, landmarks
- [ ] Screenshot results
- [ ] Document issues

---

## Manual Keyboard Testing (60 minutes)

### Setup

- [ ] Disconnect mouse/trackpad
- [ ] Use only keyboard for navigation

### Dashboard Testing

#### Navigation

- [ ] Press Tab - focus should move to first interactive element
- [ ] Continue Tab - verify logical tab order:
  1. Date filter dropdown
  2. AI Assistant button
  3. Schedule Visit button
  4. Health metrics widgets
  5. Lab results filters
  6. Quick action buttons
- [ ] **All elements must have visible focus indicator (2px outline)**
- [ ] Press Shift + Tab - verify reverse navigation works

#### Interactive Elements

- [ ] Date filter dropdown:
  - [ ] Press Enter or Space to open
  - [ ] Press Arrow Down/Up to navigate options
  - [ ] Press Enter to select
  - [ ] Press Escape to close without selecting
- [ ] AI Assistant button:
  - [ ] Press Enter to activate
  - [ ] Chat input receives focus
  - [ ] Type message and press Enter to submit
  - [ ] Verify can Tab away from chat
- [ ] Lab results filters:
  - [ ] Tab to filter buttons
  - [ ] Press Enter or Space to activate
  - [ ] Verify selected filter is indicated
- [ ] Quick action buttons:
  - [ ] Tab to each button
  - [ ] Press Enter to navigate to linked page
  - [ ] Verify navigation occurs

#### Charts

- [ ] Charts should NOT be in tab order (decorative)
- [ ] Verify charts are announced by screen reader (test later)

**Expected Results**:

- [ ] ALL interactive elements reachable with keyboard only
- [ ] Focus indicators visible on ALL elements
- [ ] No keyboard traps (can always Tab away)
- [ ] Logical tab order follows visual layout

### Schedule Testing

#### Step 1: Choose Doctor

- [ ] Tab to first doctor card
- [ ] Press Enter or Space to select
- [ ] Verify visual selection indicator
- [ ] Tab to next doctor card
- [ ] Press Enter to select different doctor
- [ ] Tab to Continue button
- [ ] Press Enter to proceed to Step 2

#### Step 2: Select Date & Time

- [ ] Tab to Today button
- [ ] Press Enter to select
- [ ] Verify time slots appear
- [ ] Tab through time slots
- [ ] Press Enter to select time
- [ ] Tab to Back button (verify it works)
- [ ] Tab to Continue button
- [ ] Press Enter to proceed to Step 3

#### Step 3: Appointment Details

- [ ] Tab to Reason textarea
- [ ] Type reason for visit
- [ ] Tab to Book Appointment button
- [ ] Press Enter to submit
- [ ] Verify loading state appears
- [ ] Verify success/error message appears

#### Confirmation Screen

- [ ] Tab to Add to Calendar button
- [ ] Tab to Return to Dashboard button
- [ ] Both buttons must activate with Enter

**Expected Results**:

- [ ] All steps completable with keyboard only
- [ ] Selection states clearly indicated
- [ ] Progress indicator shows current step
- [ ] Form submission works

### Medications Testing

#### Search and Filters

- [ ] Tab to search input
- [ ] Type search query
- [ ] Verify medication list filters
- [ ] Tab to filter tabs (Overview, Interactions, etc.)
- [ ] Press Arrow Right/Left to navigate tabs
- [ ] Verify tab content changes

#### Medication Cards

- [ ] Tab to View button on medication card
- [ ] Press Enter to activate
- [ ] Tab to Bell icon
- [ ] Press Enter to activate
- [ ] Verify no keyboard traps in any tab

**Expected Results**:

- [ ] Search functional with keyboard
- [ ] Tabs navigable with Arrow keys
- [ ] All actions keyboard accessible

### Televisit Testing

- [ ] Tab to End Consultation button
- [ ] Press Enter to activate
- [ ] Verify confirmation or navigation occurs
- [ ] Test keyboard navigation within iframe (if applicable)
- [ ] Press Escape to exit iframe focus

**Expected Results**:

- [ ] Controls accessible
- [ ] Can exit iframe with keyboard

---

## Screen Reader Testing (90 minutes)

### NVDA Testing (Windows)

#### Setup

- [ ] Start NVDA (desktop shortcut or Start menu)
- [ ] Navigate to http://localhost:5173/dashboard
- [ ] Press Insert + Down Arrow to start reading

#### Dashboard Validation

##### Page Structure

- [ ] Page title announced: "Dashboard - Telecheck"
- [ ] Main heading announced: "Good [morning/afternoon/evening], [Name]"
- [ ] Landmarks announced: navigation, main, etc.

##### Charts

- [ ] Health Score chart announced:
  - [ ] "Health Score Trend Chart"
  - [ ] Description includes data points
  - [ ] Current value announced
  - [ ] Trend direction announced (increasing/decreasing)
- [ ] Medications chart announced:
  - [ ] "Medication Distribution Chart"
  - [ ] Breakdown of values announced
- [ ] Lab results chart announced:
  - [ ] Time series description
  - [ ] Date range announced
  - [ ] Normal range announced
  - [ ] Current value announced

##### Status Indicators

- [ ] Lab result status announced with BOTH:
  - [ ] Text: "High - Abnormal result, above normal range"
  - [ ] Value: "245 mg/dL"
- [ ] NOT just "High" or color alone
- [ ] Icons marked aria-hidden (not announced)

##### Interactive Elements

- [ ] Buttons announce: "AI Assistant, button"
- [ ] Links announce: "Schedule Visit, link"
- [ ] Dropdowns announce: "Date filter, combobox, Last 7 days"
- [ ] Current selection announced

##### Dynamic Content

- [ ] Open AI chat
- [ ] Type message
- [ ] Submit
- [ ] Verify announcement: "Analyzing your question..." (aria-live region)
- [ ] Verify response is announced when received

#### Schedule Validation

##### Progress Indicator

- [ ] Announces: "Appointment booking progress, navigation"
- [ ] Current step announced: "Step 1: Choose Doctor (current step)"
- [ ] Completed steps announced: "Step 1: Choose Doctor (completed)"

##### Doctor Selection

- [ ] Doctor card announced:
  - [ ] "Select Dr. Sarah Johnson, Cardiologist"
  - [ ] "Rating: 4.9 out of 5 stars"
  - [ ] "Next available: Today 2:00 PM"
  - [ ] "3 urgent slots available today"
  - [ ] "Button, not pressed"
- [ ] When selected:
  - [ ] "Button, pressed"

##### Date and Time Selection

- [ ] Date group announced: "Select appointment date, radio group"
- [ ] Date button announced:
  - [ ] "Today, [full date], urgent availability"
  - [ ] "Radio button, not checked"
- [ ] Time slot announced:
  - [ ] "2:00 PM, Same day urgent appointment"
  - [ ] "Button, not pressed"

##### Form Fields

- [ ] Reason field announced:
  - [ ] "Reason for Visit, required"
  - [ ] "Edit text"
  - [ ] Help text announced
- [ ] Errors announced:
  - [ ] "Error: Please provide a reason for your visit"

##### Status Updates

- [ ] Loading announced: "Booking your appointment, please wait..."
- [ ] Success announced: "Appointment confirmed for [date] at [time]"
- [ ] Error announced: "Alert: Booking Failed. [error message]"

#### Medications Validation

##### Search Input

- [ ] Announces: "Search medications, edit text"
- [ ] Placeholder announced: "Search medications..."
- [ ] Type query and verify filter works

##### Tabs

- [ ] Tab list announced: "Tabs"
- [ ] Each tab announced: "Overview, tab, selected" or "not selected"
- [ ] Arrow keys navigate tabs
- [ ] Tab panel content announced

##### Medication Cards

- [ ] Medication name announced
- [ ] Dosage and frequency announced
- [ ] Status announced (if applicable)
- [ ] Action buttons announced

#### Televisit Validation

##### Loading State

- [ ] Announces: "Initializing consultation, please wait..."
- [ ] Status updates announced

##### Controls

- [ ] End Consultation button announced: "End Consultation, button"
- [ ] Iframe title announced when entering iframe

##### Error Handling

- [ ] Errors announced as alerts
- [ ] Error details fully read

### VoiceOver Testing (Mac)

Repeat all NVDA tests using VoiceOver:

- [ ] Enable: Cmd + F5
- [ ] Navigate with VO + Right Arrow
- [ ] Verify same announcements as NVDA
- [ ] Test with Safari (primary Mac browser)

**Expected Results**:

- [ ] ALL visual information has text alternative
- [ ] Charts fully described with data
- [ ] Status uses text, not just color
- [ ] Forms have labels read before inputs
- [ ] Dynamic content announced
- [ ] Loading/success/error states announced
- [ ] No information conveyed by color alone

---

## Color Contrast Testing (45 minutes)

### Tool Setup

- [ ] Open WebAIM Contrast Checker
- [ ] Have browser DevTools ready (F12)

### Elements to Test

For each element:

1. Inspect element in DevTools
2. Copy computed color (foreground)
3. Copy computed background-color
4. Input in WebAIM Contrast Checker
5. Verify ratio meets requirements

#### Dashboard

| Element               | Foreground             | Background   | Minimum Ratio | Actual Ratio | Pass/Fail |
| --------------------- | ---------------------- | ------------ | ------------- | ------------ | --------- |
| Body text             | --foreground           | --background | 4.5:1         | \_\_\_       | [ ]       |
| Muted text            | --muted-foreground     | --background | 4.5:1         | \_\_\_       | [ ]       |
| Lab "High" text       | #dc2626                | #fef2f2      | 4.5:1         | \_\_\_       | [ ]       |
| Lab "Normal" text     | #16a34a                | #f0fdf4      | 4.5:1         | \_\_\_       | [ ]       |
| Lab "Low" text        | #2563eb                | #eff6ff      | 4.5:1         | \_\_\_       | [ ]       |
| Button primary text   | --primary-foreground   | --primary    | 4.5:1         | \_\_\_       | [ ]       |
| Button secondary text | --secondary-foreground | --secondary  | 4.5:1         | \_\_\_       | [ ]       |
| Badge text            | \_\_\_                 | \_\_\_       | 3:1           | \_\_\_       | [ ]       |
| Chart date labels     | --muted-foreground     | --background | 4.5:1         | \_\_\_       | [ ]       |
| Link text             | --primary              | --background | 4.5:1         | \_\_\_       | [ ]       |
| Placeholder text      | --muted-foreground     | --background | 4.5:1         | \_\_\_       | [ ]       |

#### Schedule

| Element           | Foreground         | Background   | Minimum Ratio | Actual Ratio | Pass/Fail |
| ----------------- | ------------------ | ------------ | ------------- | ------------ | --------- |
| Doctor card text  | --foreground       | --card       | 4.5:1         | \_\_\_       | [ ]       |
| Time slot text    | \_\_\_             | \_\_\_       | 4.5:1         | \_\_\_       | [ ]       |
| Urgent badge text | \_\_\_             | \_\_\_       | 3:1           | \_\_\_       | [ ]       |
| Error text        | #dc2626            | #fef2f2      | 4.5:1         | \_\_\_       | [ ]       |
| Help text         | --muted-foreground | --background | 4.5:1         | \_\_\_       | [ ]       |

#### Medications

| Element           | Foreground         | Background | Minimum Ratio | Actual Ratio | Pass/Fail |
| ----------------- | ------------------ | ---------- | ------------- | ------------ | --------- |
| Medication name   | --foreground       | --card     | 4.5:1         | \_\_\_       | [ ]       |
| Dosage text       | --muted-foreground | --card     | 4.5:1         | \_\_\_       | [ ]       |
| Adherence text    | \_\_\_             | \_\_\_     | 4.5:1         | \_\_\_       | [ ]       |
| Tab text          | \_\_\_             | \_\_\_     | 4.5:1         | \_\_\_       | [ ]       |
| Selected tab text | \_\_\_             | \_\_\_     | 4.5:1         | \_\_\_       | [ ]       |

### Common Failing Combinations

If any test fails, document:

- [ ] Element description
- [ ] Current foreground color
- [ ] Current background color
- [ ] Current ratio
- [ ] Required ratio
- [ ] Screenshot
- [ ] Recommendation (darken text or lighten background)

**Expected Results**:

- [ ] ALL normal text ≥ 4.5:1 ratio
- [ ] ALL large text (18pt+) ≥ 3:1 ratio
- [ ] ALL UI components ≥ 3:1 ratio
- [ ] No exceptions

---

## Zoom and Reflow Testing (15 minutes)

### Zoom Test

For each page:

- [ ] Dashboard at 100% zoom
- [ ] Zoom to 200% (Ctrl + +)
- [ ] Verify:
  - [ ] All content visible
  - [ ] No horizontal scrolling required
  - [ ] Text remains readable
  - [ ] Layout doesn't break
  - [ ] Interactive elements still accessible

- [ ] Schedule at 200% zoom
- [ ] Medications at 200% zoom
- [ ] Televisit at 200% zoom

### Reflow Test

- [ ] Resize browser window to 320px wide (mobile minimum)
- [ ] Verify:
  - [ ] Content reflows (doesn't require horizontal scroll)
  - [ ] All information visible
  - [ ] All functionality available

**Expected Results**:

- [ ] Content readable at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] Content reflows at 320px width
- [ ] All functionality maintained

---

## Forms and Error Handling (30 minutes)

### Schedule Form Testing

#### Label Association

- [ ] All inputs have associated labels
- [ ] Labels visible (not just placeholders)
- [ ] Required fields marked with asterisk
- [ ] Asterisk has aria-label="required"

#### Error Handling

- [ ] Submit form without selecting doctor
- [ ] Verify error message appears
- [ ] Verify error announced to screen reader
- [ ] Verify error has role="alert"
- [ ] Verify input has aria-invalid="true"

- [ ] Submit form without reason
- [ ] Verify error message appears
- [ ] Verify error linked with aria-describedby
- [ ] Verify focus moves to error or first invalid field

#### Success Handling

- [ ] Complete valid form submission
- [ ] Verify success message appears
- [ ] Verify success announced to screen reader
- [ ] Verify success has role="status" aria-live="polite"

### Medication Search Testing

- [ ] Search input has visible label or aria-label
- [ ] Type in search field
- [ ] Verify results update
- [ ] Verify results announced (if applicable)

**Expected Results**:

- [ ] All inputs labeled
- [ ] Required fields indicated
- [ ] Errors clearly announced
- [ ] Errors linked to inputs
- [ ] Success messages announced
- [ ] Form submission confirmed

---

## Mobile Testing (30 minutes)

### Responsive Design

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Verify all previous tests on mobile:
  - [ ] Touch targets ≥ 44x44px
  - [ ] Content readable without zoom
  - [ ] All functionality available
  - [ ] Orientation changes supported

### Mobile Screen Reader

- [ ] iOS VoiceOver (swipe right to navigate)
- [ ] Android TalkBack (swipe right to navigate)
- [ ] Verify announcements same as desktop

**Expected Results**:

- [ ] Mobile layout accessible
- [ ] Touch targets adequate
- [ ] Mobile screen readers work

---

## Bug Reporting Template

For each issue found, create bug report with:

**Title**: [Page] - [WCAG Criterion] - Brief description

**Example**: Dashboard - 1.4.1 Use of Color - Lab status uses color only

**Description**:

```
Page: Dashboard
Location: Lab Results section
WCAG Criterion: 1.4.1 Use of Color (Level A)
Severity: Critical

Issue:
Lab result status is conveyed by color alone (red for high, green for normal).
Users with color blindness cannot distinguish status.

Steps to Reproduce:
1. Navigate to Dashboard
2. Locate Lab Results section
3. Observe Cholesterol result showing red text "High"
4. No icon or text alternative provided

Expected Behavior:
Status should include icon AND text:
- High results: AlertTriangle icon + "High - Abnormal result"
- Normal results: CheckCircle icon + "Normal - Within range"

Actual Behavior:
Only colored text displayed, no icon or sr-only text

Impact:
Users with color blindness cannot determine lab result status

Screenshots:
[Attach screenshot]

Screen Reader Test:
NVDA announces: "245 mg/dL High"
Should announce: "High - Abnormal result, above normal range: 245 mg/dL"

Recommendation:
Implement AccessibleLabStatus component from DASHBOARD_ACCESSIBILITY_FIXES.tsx
```

---

## Final Validation

### Compliance Scorecard

| Category            | Items Tested | Items Passed | Percentage | Pass/Fail |
| ------------------- | ------------ | ------------ | ---------- | --------- |
| Automated Tests     | 4 pages      | \_\_\_       | \_\_\_%    | [ ]       |
| Keyboard Navigation | 4 pages      | \_\_\_       | \_\_\_%    | [ ]       |
| Screen Reader       | 4 pages      | \_\_\_       | \_\_\_%    | [ ]       |
| Color Contrast      | 30 elements  | \_\_\_       | \_\_\_%    | [ ]       |
| Zoom/Reflow         | 4 pages      | \_\_\_       | \_\_\_%    | [ ]       |
| Forms               | 2 forms      | \_\_\_       | \_\_\_%    | [ ]       |
| Mobile              | 4 pages      | \_\_\_       | \_\_\_%    | [ ]       |

**TOTAL COMPLIANCE**: \_\_\_% (Must be 100% to pass)

### Sign-Off

- [ ] All automated tests pass (0 violations)
- [ ] All manual tests pass
- [ ] All bugs documented
- [ ] Compliance ≥ 95% (if < 100%, critical bugs only)

**Tested By**: **\*\*\*\***\_\_\_**\*\*\*\***
**Date**: **\*\*\*\***\_\_\_**\*\*\*\***
**Status**: [ ] PASS [ ] FAIL
**Notes**:

---

## Resources

- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- NVDA: https://www.nvaccess.org/download/
- VoiceOver Guide: https://www.apple.com/voiceover/info/guide/

## Training Resources

- WebAIM Screen Reader Testing: https://webaim.org/articles/screenreader_testing/
- Keyboard Navigation Guide: https://webaim.org/articles/keyboard/
- Color Contrast Guide: https://webaim.org/articles/contrast/

---

**Document Version**: 1.0
**Last Updated**: 2025-01-26
**Next Review**: After each release
