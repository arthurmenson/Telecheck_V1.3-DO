# WCAG 2.1 AA Accessibility Testing Guide

## Telecheck Patient Portal - Complete Testing Procedures

---

## Table of Contents

1. [Automated Testing Setup](#automated-testing-setup)
2. [Manual Keyboard Testing](#manual-keyboard-testing)
3. [Screen Reader Testing](#screen-reader-testing)
4. [Color Contrast Validation](#color-contrast-validation)
5. [Testing Checklists by Page](#testing-checklists-by-page)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Reporting Template](#reporting-template)

---

## Automated Testing Setup

### Install Testing Tools

```bash
# Install axe-core for automated accessibility testing
npm install --save-dev @axe-core/react jest-axe @testing-library/react @testing-library/jest-dom

# Install Playwright for browser-based testing
npm install --save-dev @playwright/test
```

### Configure axe-core in Development

Add to `client/main.tsx`:

```typescript
// Only in development mode
if (import.meta.env.DEV) {
  import("@axe-core/react").then((axe) => {
    axe.default(React, ReactDOM, 1000, {
      rules: [
        { id: "color-contrast", enabled: true },
        { id: "label", enabled: true },
        { id: "button-name", enabled: true },
        { id: "link-name", enabled: true },
        { id: "image-alt", enabled: true },
        { id: "aria-roles", enabled: true },
      ],
    });
  });
}
```

### Create Test Suite

Create `client/__tests__/accessibility.test.tsx`:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Schedule } from '../pages/Schedule';
import { Medications } from '../pages/Medications';
import { Televisit } from '../pages/ehr/Televisit';

expect.extend(toHaveNoViolations);

// Wrapper for components needing Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('WCAG 2.1 AA Accessibility Tests', () => {
  it('Dashboard has no accessibility violations', async () => {
    const { container } = render(
      <RouterWrapper>
        <Dashboard />
      </RouterWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Schedule has no accessibility violations', async () => {
    const { container } = render(
      <RouterWrapper>
        <Schedule />
      </RouterWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Medications has no accessibility violations', async () => {
    const { container } = render(
      <RouterWrapper>
        <Medications />
      </RouterWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Televisit has no accessibility violations', async () => {
    const { container } = render(
      <RouterWrapper>
        <Televisit />
      </RouterWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Keyboard Navigation Tests', () => {
  it('Dashboard Quick Actions are keyboard accessible', () => {
    const { getByText } = render(
      <RouterWrapper>
        <Dashboard />
      </RouterWrapper>
    );

    const uploadLabsButton = getByText('Upload Labs');
    uploadLabsButton.focus();
    expect(uploadLabsButton).toHaveFocus();
  });

  it('Schedule doctor selection is keyboard accessible', () => {
    const { getAllByRole } = render(
      <RouterWrapper>
        <Schedule />
      </RouterWrapper>
    );

    const doctorCards = getAllByRole('button', { pressed: false });
    expect(doctorCards.length).toBeGreaterThan(0);

    doctorCards[0].focus();
    expect(doctorCards[0]).toHaveFocus();
  });
});

describe('ARIA Label Tests', () => {
  it('Charts have proper ARIA labels', () => {
    const { container } = render(
      <RouterWrapper>
        <Dashboard />
      </RouterWrapper>
    );

    // Check for chart containers with role="img"
    const charts = container.querySelectorAll('[role="img"]');
    expect(charts.length).toBeGreaterThan(0);

    charts.forEach(chart => {
      // Each chart should have aria-labelledby or aria-label
      expect(
        chart.hasAttribute('aria-labelledby') || chart.hasAttribute('aria-label')
      ).toBe(true);
    });
  });

  it('Form inputs have associated labels', () => {
    const { container } = render(
      <RouterWrapper>
        <Schedule />
      </RouterWrapper>
    );

    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    });
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Run accessibility tests only
npm test -- --testPathPattern=accessibility

# Run with coverage
npm test -- --coverage
```

---

## Manual Keyboard Testing

### Keyboard Navigation Checklist

#### Universal Keys

- **Tab**: Move forward through interactive elements
- **Shift + Tab**: Move backward
- **Enter**: Activate buttons, links, submit forms
- **Space**: Toggle checkboxes, activate buttons
- **Escape**: Close modals, dropdowns, cancel actions
- **Arrow Keys**: Navigate within components (tabs, dropdowns, radio groups)

### Dashboard Page Testing

```
Test Procedure:
1. Load http://localhost:5173/dashboard
2. Disconnect mouse/trackpad
3. Test navigation:

□ Tab through entire page - verify logical order
□ Filter dropdown opens with keyboard (Enter/Space)
□ Filter options navigable with Arrow keys
□ AI Assistant button activates with Enter
□ AI chat input receives focus
□ AI message can be submitted with Enter
□ Quick action buttons are in tab order
□ All buttons have visible focus indicators (2px outline)
□ Can navigate to linked pages (Schedule, Labs, Medications)
□ No keyboard traps - can Tab away from all elements

Expected Tab Order:
1. Skip to main content (if implemented)
2. Date filter dropdown
3. AI Assistant button
4. Schedule Visit button
5. Health Score widget
6. Medications widget
7. Lab Results filter buttons
8. Individual lab result cards
9. AI Insights cards
10. Quick Action buttons
```

### Schedule Page Testing

```
Test Procedure:
1. Load http://localhost:5173/schedule
2. Test multi-step flow:

Step 1: Choose Doctor
□ Tab to first doctor card
□ Enter/Space selects doctor
□ Selected state visually indicated
□ Tab to next doctor card
□ Continue button in tab order
□ Continue button disabled until selection

Step 2: Select Date & Time
□ Date buttons are keyboard accessible
□ Enter/Space selects date
□ Time slots appear after date selection
□ Tab through all time slots
□ Enter/Space selects time slot
□ Back button works with keyboard
□ Continue button works with keyboard

Step 3: Appointment Details
□ Reason textarea receives focus
□ Can type in textarea
□ Tab moves to Book Appointment button
□ Enter submits form
□ Loading state announced (check with screen reader)
□ Success/error messages appear and are announced

Confirmation Screen:
□ Tab to Add to Calendar button
□ Tab to Return to Dashboard button
□ Both buttons activate with Enter/Space
```

### Medications Page Testing

```
Test Procedure:
1. Load http://localhost:5173/medications
2. Test interactions:

□ Search input receives focus on Tab
□ Can type in search field
□ Tab moves through filter tabs
□ Arrow keys navigate between tabs (Overview, Interactions, Analytics, AI)
□ Filter buttons are keyboard accessible
□ Medication cards are in tab order (if interactive)
□ Action buttons (View, Bell) are keyboard accessible
□ All interactive elements have visible focus
□ No keyboard traps in any tab section
```

### Televisit Page Testing

```
Test Procedure:
1. Load http://localhost:5173/televisit/:appointmentId
2. Test video interface:

□ Loading state is announced
□ End Consultation button receives focus
□ Enter/Space activates End Consultation
□ Confirmation dialog (if any) is keyboard accessible
□ Can Tab within iframe content
□ Can Escape from iframe back to main page
□ Error messages (if any) are keyboard accessible
```

---

## Screen Reader Testing

### NVDA Testing (Windows - Free)

#### Setup

```
1. Download NVDA from https://www.nvaccess.org/download/
2. Install and start NVDA
3. Familiarize with basic commands:
   - Ctrl: Stop speaking
   - Insert + Down Arrow: Start reading from cursor
   - Insert + Space: Turn on browse mode
   - H: Jump to next heading
   - Tab: Navigate interactive elements
```

#### Dashboard Testing Script

```
1. Start NVDA
2. Navigate to http://localhost:5173/dashboard
3. Press Insert + Down Arrow to read page

Expected Announcements:
□ Page title: "Dashboard - Telecheck"
□ Main heading: "Good [morning/afternoon/evening], [Name]"
□ Health Score widget:
  - "Health Score"
  - "85"
  - "Trending up by 3%"
  - "Health Score Trend Chart, line chart showing..."

□ Medications widget:
  - "Medications"
  - "8 total"
  - "5 on track"
  - "Medication Distribution Chart, doughnut chart showing..."

□ Lab Results section:
  - "Lab Results"
  - Each result announces: "[Test Name], [Value] [Unit], [Status]"
  - Status includes icons: "High - Abnormal result" or "Normal - Within range"

□ AI Insights:
  - Each insight type announced: "Alert: [message]" or "Success: [message]"

4. Test interactive elements:
□ Filter dropdown announces: "Date filter, combobox, Last 7 days"
□ AI Assistant button announces: "AI Assistant, button"
□ Schedule Visit announces: "Schedule Visit, button, navigate to Schedule page"
□ Lab result cards announce status without relying on color

5. Test dynamic content:
□ Open AI chat
□ Type message
□ Submit
□ Verify loading announcement: "Analyzing your question..."
□ Verify response is announced when received
```

#### Schedule Page Testing Script

```
1. Navigate to http://localhost:5173/schedule
2. Test with NVDA:

□ Progress indicator announces:
  "Appointment booking progress, navigation, Step 1: Choose Doctor (current step)"

□ Doctor card announces:
  "Select Dr. Sarah Johnson, Cardiologist. Rating: 4.9 stars.
   Next available: Today 2:00 PM. 3 urgent slots available today. Button, not pressed."

□ When doctor selected:
  "Select Dr. Sarah Johnson, Cardiologist... Button, pressed."

□ Date selection announces:
  "Select appointment date, radio group"
  "Today, [date], urgent availability, radio button, not checked"

□ Time slot announces:
  "2:00 PM, Same day urgent appointment, button, not pressed"

□ Reason field announces:
  "Reason for Visit, required, edit text"
  Help text: "Please describe your symptoms or concerns..."

□ Booking status announces:
  "Booking your appointment, please wait..."
  "Status: Appointment confirmed for [date] at [time]"

□ Errors announce:
  "Alert: Booking Failed. [Error message]"
```

### VoiceOver Testing (macOS)

#### Setup

```
1. Enable VoiceOver: Cmd + F5
2. Basic commands:
   - VO = Control + Option
   - VO + Right Arrow: Next item
   - VO + Left Arrow: Previous item
   - VO + Spacebar: Activate button/link
   - VO + Shift + Down: Enter interactive element
   - VO + Shift + Up: Exit interactive element
```

#### Testing Procedure

```
Same as NVDA testing, but use VoiceOver commands
Verify same announcements occur
Test navigation with VO + Arrow keys
```

---

## Color Contrast Validation

### Tools

1. **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
2. **Chrome DevTools**: Inspect > Accessibility > Contrast
3. **axe DevTools Extension**: https://www.deque.com/axe/devtools/

### Elements to Test

#### Dashboard

```
Text Element                          | Foreground      | Background      | Ratio Required | Pass/Fail
--------------------------------------|-----------------|-----------------|----------------|----------
Body text                             | --foreground    | --background    | 4.5:1          |
Muted text (small labels)             | --muted-foreground | --background | 4.5:1          |
Lab result "High" text                | #dc2626 (red)   | #fef2f2 (bg)    | 4.5:1          |
Lab result "Normal" text              | #16a34a (green) | #f0fdf4 (bg)    | 4.5:1          |
Badge text (secondary)                | --secondary-foreground | --secondary | 3:1     |
Chart date labels                     | --muted-foreground | --background | 4.5:1          |
Button text on primary                | --primary-foreground | --primary   | 4.5:1          |
Placeholder text                      | --muted-foreground | --background | 4.5:1          |
```

### Testing Procedure

```bash
# For each element:
1. Open WebAIM Contrast Checker
2. Get foreground color (text):
   - Inspect element in DevTools
   - Copy computed color value

3. Get background color:
   - Inspect parent element
   - Copy computed background-color

4. Input colors in WebAIM tool
5. Check ratio against requirements:
   - Normal text (< 18pt or < 14pt bold): 4.5:1
   - Large text (≥ 18pt or ≥ 14pt bold): 3:1
   - UI components (buttons, borders): 3:1

6. If failing:
   - Darken text color OR lighten background
   - Increase font weight
   - Add border for definition
   - Re-test until passing
```

### Common Failing Combinations & Fixes

```css
/* BEFORE (Failing) */
.muted-text {
  color: hsl(215.4 16.3% 46.9%); /* Too light */
  background: hsl(0 0% 100%);
}

/* AFTER (Passing) */
.muted-text {
  color: hsl(215.4 16.3% 38%); /* Darkened */
  background: hsl(0 0% 100%);
}

/* BEFORE (Failing) */
.secondary-badge {
  color: hsl(222.2 47.4% 11.2%);
  background: hsl(210 40% 96.1%); /* Too light background */
}

/* AFTER (Passing) */
.secondary-badge {
  color: hsl(222.2 47.4% 11.2%);
  background: hsl(210 40% 92%); /* Darkened background */
}
```

---

## Testing Checklists by Page

### Dashboard Accessibility Checklist

#### Visual Structure

- [ ] Heading hierarchy is logical (h1 > h2 > h3)
- [ ] All charts have descriptive text alternatives
- [ ] Color is not the only way to distinguish status
- [ ] Focus indicators are visible (2px minimum)
- [ ] All text meets contrast requirements

#### Semantic HTML

- [ ] Main content wrapped in `<main>` landmark
- [ ] Navigation wrapped in `<nav>` landmark
- [ ] Proper use of lists (`<ul>`, `<ol>`)
- [ ] Forms use fieldsets and legends where appropriate
- [ ] Buttons use `<button>` element, not styled divs

#### ARIA Attributes

- [ ] Charts have `role="img"` with `aria-labelledby`
- [ ] Interactive regions have appropriate ARIA roles
- [ ] Dynamic content has `aria-live` regions
- [ ] Error messages have `role="alert"`
- [ ] Loading states announced with `aria-busy` or `role="status"`

#### Keyboard Navigation

- [ ] All interactive elements in logical tab order
- [ ] No keyboard traps
- [ ] Dropdown menus navigable with arrow keys
- [ ] Modals closable with Escape key
- [ ] Skip to main content link present

#### Screen Reader

- [ ] Page title is descriptive
- [ ] All images have alt text or aria-label
- [ ] Status changes are announced
- [ ] Form validation errors are announced
- [ ] Chart data described in text

### Schedule Accessibility Checklist

#### Forms

- [ ] All inputs have associated `<label>` elements
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked with `aria-describedby`
- [ ] Validation errors have `aria-invalid="true"`
- [ ] Help text provided where needed

#### Interactive Elements

- [ ] Doctor cards are `<button>` elements
- [ ] Selection state indicated with `aria-pressed`
- [ ] Date/time selectors are keyboard accessible
- [ ] Progress indicator uses proper ARIA roles
- [ ] Radio button groups use `role="radiogroup"`

#### Status Updates

- [ ] Booking confirmation has `role="status"` `aria-live="polite"`
- [ ] Error messages have `role="alert"` `aria-live="assertive"`
- [ ] Loading state announced to screen readers
- [ ] Success confirmation fully described

### Medications Accessibility Checklist

#### Navigation

- [ ] Tab navigation uses proper ARIA roles
- [ ] Active tab indicated with `aria-selected="true"`
- [ ] Tab panels have `role="tabpanel"`
- [ ] Arrow keys navigate between tabs
- [ ] Search input has visible label

#### Data Display

- [ ] Medication status uses icons + text (not color alone)
- [ ] Interaction warnings clearly labeled
- [ ] Charts have text alternatives
- [ ] Tables use proper semantic markup (`<table>`, `<th>`, `<td>`)
- [ ] Sort controls are keyboard accessible

### Televisit Accessibility Checklist

#### Video Interface

- [ ] iframe has descriptive `title` attribute
- [ ] Loading state announced to screen readers
- [ ] End Consultation button keyboard accessible
- [ ] Error messages properly formatted and announced
- [ ] Controls (mic, camera) are labeled

---

## Common Issues and Solutions

### Issue 1: Charts Not Accessible

**Problem**: Charts are visual only, no text alternative

**WCAG Violation**: 1.1.1 Non-text Content (Level A)

**Solution**:

```typescript
<div role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
  <h3 id="chart-title" className="sr-only">Blood Pressure Trend</h3>
  <p id="chart-desc" className="sr-only">
    Line chart showing blood pressure from May 1 to May 31.
    Readings range from 120/80 to 140/90.
    Latest: 135/85 on May 31 (High).
  </p>
  <svg aria-hidden="true">
    {/* Chart visualization */}
  </svg>
</div>
```

### Issue 2: Color-Only Status Indicators

**Problem**: Lab results use only red/green/yellow colors

**WCAG Violation**: 1.4.1 Use of Color (Level A)

**Solution**:

```typescript
<div className="flex items-center gap-2">
  <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
  <span className="sr-only">High - Abnormal: </span>
  <span className="text-red-600">245 mg/dL</span>
</div>
```

### Issue 3: Missing Form Labels

**Problem**: Inputs only have placeholders, no labels

**WCAG Violation**: 3.3.2 Labels or Instructions (Level A)

**Solution**:

```typescript
<label htmlFor="reason" className="block text-sm font-medium mb-2">
  Reason for Visit <span className="text-red-500" aria-label="required">*</span>
</label>
<textarea
  id="reason"
  placeholder="Describe your symptoms..."
  aria-required="true"
/>
```

### Issue 4: Dynamic Content Not Announced

**Problem**: Loading/success/error states not announced to screen readers

**WCAG Violation**: 4.1.3 Status Messages (Level AA)

**Solution**:

```typescript
{isLoading && (
  <div role="status" aria-live="polite">
    <span className="sr-only">Loading appointment details...</span>
    <Loader2 className="animate-spin" aria-hidden="true" />
  </div>
)}

{error && (
  <div role="alert" aria-live="assertive">
    <AlertTriangle aria-hidden="true" />
    <span>Error: {error}</span>
  </div>
)}
```

### Issue 5: Keyboard Traps

**Problem**: Can Tab into dropdown but not out

**WCAG Violation**: 2.1.2 No Keyboard Trap (Level A)

**Solution**:

```typescript
// Ensure Escape key closes dropdown
<div
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus(); // Return focus to trigger
    }
  }}
>
  {/* Dropdown content */}
</div>
```

### Issue 6: Low Color Contrast

**Problem**: Text has insufficient contrast against background

**WCAG Violation**: 1.4.3 Contrast (Minimum) (Level AA)

**Solution**:

```css
/* Test with WebAIM Contrast Checker */
/* Failing: 3.2:1 ratio */
.muted-text {
  color: #999;
  background: #fff;
}

/* Passing: 4.6:1 ratio */
.muted-text {
  color: #666;
  background: #fff;
}
```

---

## Reporting Template

### Accessibility Test Report

**Project**: Telecheck Patient Portal
**Test Date**: [Date]
**Tester**: [Name]
**WCAG Version**: 2.1 Level AA

#### Test Environment

- **Browser**: Chrome 120 / Firefox 121 / Safari 17
- **Screen Reader**: NVDA 2024.1 / VoiceOver (macOS 14)
- **Testing Tool**: axe DevTools 4.8 / WAVE 3.2

#### Summary

- **Total Issues Found**: [Number]
- **Critical (Level A)**: [Number]
- **Serious (Level AA)**: [Number]
- **Moderate**: [Number]
- **Minor**: [Number]

#### Issues by Page

##### Dashboard

| Issue                      | WCAG Criterion | Severity | Status      | Notes                              |
| -------------------------- | -------------- | -------- | ----------- | ---------------------------------- |
| Charts lack ARIA labels    | 1.1.1          | Critical | Fixed       | Added role="img" with descriptions |
| Color-only status          | 1.4.1          | Critical | In Progress | Adding icons                       |
| Low contrast on muted text | 1.4.3          | Serious  | Fixed       | Darkened color from 46.9% to 38%   |

##### Schedule

| Issue                  | WCAG Criterion | Severity | Status | Notes                |
| ---------------------- | -------------- | -------- | ------ | -------------------- |
| Form missing labels    | 3.3.2          | Critical | Fixed  | Added label elements |
| Progress not announced | 4.1.3          | Serious  | Fixed  | Added aria-current   |

##### Medications

| Issue                 | WCAG Criterion | Severity | Status | Notes               |
| --------------------- | -------------- | -------- | ------ | ------------------- |
| Search input no label | 4.1.2          | Critical | Fixed  | Added sr-only label |

##### Televisit

| Issue                 | WCAG Criterion | Severity | Status | Notes               |
| --------------------- | -------------- | -------- | ------ | ------------------- |
| Loading not announced | 4.1.3          | Serious  | Fixed  | Added role="status" |

#### Automated Test Results

```
axe-core violations: 0
WAVE errors: 0
Lighthouse Accessibility Score: 100
```

#### Manual Test Results

- [x] Keyboard navigation: Pass
- [x] Screen reader (NVDA): Pass
- [x] Screen reader (VoiceOver): Pass
- [x] Color contrast: Pass (all elements ≥ 4.5:1)
- [x] Form accessibility: Pass
- [x] Dynamic content: Pass

#### Recommendations

1. Continue to run automated tests in CI/CD pipeline
2. Perform quarterly manual screen reader audits
3. Include accessibility review in code review process
4. Provide accessibility training for developers

#### Sign-off

**Tested by**: [Name]
**Approved by**: [Manager]
**Date**: [Date]

---

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/accessibility.yml`:

```yaml
name: Accessibility Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  a11y-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run accessibility tests
        run: npm test -- --testPathPattern=accessibility

      - name: Build application
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: "./lighthouserc.json"
          uploadArtifacts: true

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            // Post accessibility test results as PR comment
```

### Lighthouse CI Configuration

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "color-contrast": ["error", { "minScore": 1 }],
        "button-name": ["error", { "minScore": 1 }],
        "link-name": ["error", { "minScore": 1 }],
        "image-alt": ["error", { "minScore": 1 }]
      }
    }
  }
}
```

---

## Resources

### WCAG Guidelines

- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- Understanding WCAG 2.1: https://www.w3.org/WAI/WCAG21/Understanding/

### Testing Tools

- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- NVDA Screen Reader: https://www.nvaccess.org/

### Learning Resources

- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Inclusive Components: https://inclusive-components.design/
- A11y Project: https://www.a11yproject.com/
- WebAIM Articles: https://webaim.org/articles/

### Support

For questions or issues with accessibility testing, contact:

- Email: accessibility@telecheck.com
- Slack: #accessibility-support
