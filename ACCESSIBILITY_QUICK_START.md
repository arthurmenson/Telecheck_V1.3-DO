# WCAG 2.1 AA Accessibility - Quick Start Guide

## For Developers: Immediate Action Items

---

## 🚀 What You Need to Know

Your Telecheck patient portal currently has **65% WCAG AA compliance**. This guide shows you exactly how to reach **100% compliance** using the components and utilities already created for you.

---

## ✅ Already Done For You

1. **Global CSS utilities added** (`client/global.css`)
   - `.sr-only` class for screen reader text
   - Visible focus indicators
   - Skip to main content styling

2. **Accessible components created**
   - `DASHBOARD_ACCESSIBILITY_FIXES.tsx` - Charts, status indicators, forms
   - `SCHEDULE_ACCESSIBILITY_FIXES.tsx` - Scheduling workflow components

3. **Testing procedures documented**
   - `ACCESSIBILITY_TESTING_GUIDE.md` - How to test
   - `ACCESSIBILITY_FIXES.md` - What needs fixing
   - `ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md` - Complete overview

---

## ⚡ 3-Step Quick Start

### Step 1: Copy Components (5 minutes)

Move the accessible components to your component library:

```bash
# Create new directory for accessible components
mkdir -p client/components/accessible

# Move the accessible component files
cp DASHBOARD_ACCESSIBILITY_FIXES.tsx client/components/accessible/DashboardComponents.tsx
cp SCHEDULE_ACCESSIBILITY_FIXES.tsx client/components/accessible/ScheduleComponents.tsx
```

### Step 2: Replace Charts in Dashboard (15 minutes)

**File**: `client/pages/Dashboard.tsx`

**Find and replace** the chart components:

```typescript
// ADD AT TOP OF FILE
import {
  AccessibleMiniLineChart,
  AccessibleLabStatus,
  AccessibleTrendIndicator,
} from '../components/accessible/DashboardComponents';

// FIND (around line 492):
<MiniLineChart data={chart} color={color} />

// REPLACE WITH:
<AccessibleMiniLineChart
  data={chart}
  color={color}
  metricName={title} // Use the metric title
/>

// FIND (around line 683):
<p className={`text-sm font-medium ${statusColor}`}>{status}</p>

// REPLACE WITH:
<AccessibleLabStatus
  status={status.toLowerCase()}
  value={mostRecent}
  unit={unit}
/>

// FIND (around line 484-487):
<div className={`flex items-center gap-1 ${changeColors[changeType]}`}>
  {changeIcons[changeType]}
  <span className="text-sm font-medium">{change}</span>
</div>

// REPLACE WITH:
<AccessibleTrendIndicator
  trend={changeType}
  value={change}
/>
```

### Step 3: Fix Form Labels (10 minutes)

**File**: `client/pages/Schedule.tsx`

**Find and replace** the reason textarea:

```typescript
// ADD AT TOP OF FILE
import {
  AccessibleAppointmentReasonField,
} from '../components/accessible/ScheduleComponents';

// FIND (around line 729-734):
<Textarea
  placeholder="Describe your symptoms or concerns..."
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  className="h-32"
/>

// REPLACE WITH:
<AccessibleAppointmentReasonField
  value={reason}
  onChange={setReason}
  error={!reason.trim() ? "Please provide a reason for your visit" : undefined}
/>
```

**File**: `client/pages/Medications.tsx`

**Find and replace** the search input:

```typescript
// FIND (around line 323-330):
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input
    placeholder="Search medications..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10"
  />
</div>

// REPLACE WITH:
<div className="relative flex-1">
  <label htmlFor="medication-search" className="sr-only">
    Search medications
  </label>
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
  <Input
    id="medication-search"
    type="search"
    placeholder="Search medications..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10"
    aria-label="Search medications by name or brand"
  />
</div>
```

---

## 🎯 Priority Fixes by File

### Dashboard.tsx - HIGH PRIORITY

#### 1. Replace All Charts (30 minutes)

```typescript
// MiniLineChart → AccessibleMiniLineChart
// DoughnutChart → AccessibleDoughnutChart
// TimeSeriesChart → AccessibleTimeSeriesChart

// Each chart needs a metricName prop:
<AccessibleMiniLineChart
  data={healthScoreData}
  color="#10b981"
  metricName="Health Score" // ADD THIS
/>
```

#### 2. Replace Status Indicators (20 minutes)

```typescript
// OLD: Color-only text
<span className="text-red-600">High</span>

// NEW: Icon + Text + Color
<AccessibleLabStatus
  status="high"
  value="245"
  unit="mg/dL"
/>
```

#### 3. Add aria-live for AI Chat (10 minutes)

```typescript
// FIND (around line 997-1037):
<form onSubmit={handleAiSubmit} className="flex gap-3">
  {/* form content */}
</form>

// WRAP IN aria-live region:
<div role="status" aria-live="polite" aria-atomic="true">
  <form onSubmit={handleAiSubmit} className="flex gap-3">
    {/* form content */}
  </form>
  {aiResponse && <div>{aiResponse}</div>}
</div>
```

### Schedule.tsx - HIGH PRIORITY

#### 1. Replace Progress Indicator (10 minutes)

```typescript
// ADD AT TOP
import { AccessibleProgressSteps } from '../components/accessible/ScheduleComponents';

// FIND (around line 511-532):
<div className="flex items-center gap-4 mb-8">
  {[1, 2, 3].map((num) => ( /* ... */ ))}
</div>

// REPLACE WITH:
<AccessibleProgressSteps
  currentStep={step}
  steps={[
    { number: 1, label: "Choose Doctor" },
    { number: 2, label: "Select Date & Time" },
    { number: 3, label: "Appointment Details" }
  ]}
/>
```

#### 2. Replace Doctor Cards (15 minutes)

```typescript
// ADD AT TOP
import { AccessibleDoctorCard } from '../components/accessible/ScheduleComponents';

// FIND (around line 545-552):
<DoctorCard
  key={doctor.id}
  doctor={doctor}
  isSelected={selectedDoctor?.id === doctor.id}
  onSelect={() => setSelectedDoctor(doctor)}
/>

// REPLACE WITH:
<AccessibleDoctorCard
  doctor={doctor}
  isSelected={selectedDoctor?.id === doctor.id}
  onSelect={() => setSelectedDoctor(doctor)}
/>
```

#### 3. Replace Time Slots (15 minutes)

```typescript
// ADD AT TOP
import { AccessibleTimeSlot } from '../components/accessible/ScheduleComponents';

// FIND (around line 631-637):
<TimeSlot
  key={idx}
  time={slot.time}
  type={slot.type}
  isSelected={selectedTime === slot.time}
  onSelect={() => setSelectedTime(slot.time)}
/>

// REPLACE WITH:
<AccessibleTimeSlot
  time={slot.time}
  type={slot.type}
  isSelected={selectedTime === slot.time}
  onSelect={() => setSelectedTime(slot.time)}
/>
```

#### 4. Add Booking Status Announcements (15 minutes)

```typescript
// ADD AT TOP
import { AccessibleBookingStatus } from '../components/accessible/ScheduleComponents';

// FIND (around line 674-690):
{error && (
  <Card className="border-red-200 bg-red-50">
    {/* error display */}
  </Card>
)}

// REPLACE WITH:
<AccessibleBookingStatus
  isLoading={isLoading}
  isSuccess={step === 4}
  error={error}
  appointmentDetails={appointmentDetails ? {
    doctor: selectedDoctor?.name || '',
    date: selectedDate,
    time: selectedTime,
    confirmationNumber: appointmentDetails.confirmationNumber,
  } : undefined}
/>
```

### Medications.tsx - MEDIUM PRIORITY

#### 1. Add Search Label (5 minutes)

Already shown above in Step 3.

#### 2. Verify Tab Accessibility (5 minutes)

```bash
# Manual test:
1. Tab to tab list
2. Use Arrow keys to navigate tabs
3. Verify focus indicators visible
4. Check aria-selected attribute changes

# If issues found, the Radix UI Tabs component should handle this automatically.
# If not, file a bug report with specifics.
```

### Televisit.tsx - LOW PRIORITY

#### 1. Add Loading Announcement (5 minutes)

```typescript
// FIND (around line 118-138):
if (isLoading) {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Video className="w-12 h-12 mx-auto animate-pulse text-cyan-600" />
            <div>
              <h3 className="text-lg font-semibold">
                Initializing Consultation
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting to HCW@Home secure video platform...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// REPLACE WITH:
if (isLoading) {
  return (
    <div className="container mx-auto p-6" role="status" aria-live="polite">
      <span className="sr-only">Initializing consultation, please wait...</span>
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4" aria-hidden="true">
            <Video className="w-12 h-12 mx-auto animate-pulse text-cyan-600" />
            <div>
              <h3 className="text-lg font-semibold">
                Initializing Consultation
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting to HCW@Home secure video platform...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🧪 Quick Test Checklist

After making changes, test with these 3 methods:

### 1. Keyboard Test (5 minutes)

```
✅ Disconnect mouse
✅ Tab through entire page
✅ All interactive elements reachable
✅ Enter/Space activates buttons
✅ Escape closes modals
✅ Focus indicators visible
```

### 2. Screen Reader Test (10 minutes)

```bash
# Windows (NVDA - Free)
1. Download from https://www.nvaccess.org/download/
2. Install and start NVDA (Ctrl to stop speaking)
3. Navigate to your page
4. Press Insert + Down Arrow to read page
5. Verify:
   ✅ Charts described with data
   ✅ Status includes "High - Abnormal" not just "High"
   ✅ Form labels read before inputs
   ✅ Errors announced

# Mac (VoiceOver - Built-in)
1. Enable: Cmd + F5
2. Navigate with VO + Right Arrow (VO = Ctrl + Option)
3. Verify same items as above
```

### 3. Automated Test (2 minutes)

```bash
# Install if not already installed
npm install --save-dev @axe-core/react

# Add to client/main.tsx (development only):
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

# Open browser console
# Look for axe violations (should be 0)
```

---

## 📊 Track Your Progress

Use this checklist to track completion:

### Dashboard.tsx

- [ ] Imported accessible components
- [ ] Replaced MiniLineChart with AccessibleMiniLineChart
- [ ] Replaced status colors with AccessibleLabStatus
- [ ] Replaced trend indicators with AccessibleTrendIndicator
- [ ] Added aria-live region for AI chat
- [ ] Tested with keyboard
- [ ] Tested with screen reader

### Schedule.tsx

- [ ] Imported accessible components
- [ ] Replaced progress indicator with AccessibleProgressSteps
- [ ] Replaced DoctorCard with AccessibleDoctorCard
- [ ] Replaced TimeSlot with AccessibleTimeSlot
- [ ] Replaced reason textarea with AccessibleAppointmentReasonField
- [ ] Added AccessibleBookingStatus
- [ ] Tested with keyboard
- [ ] Tested with screen reader

### Medications.tsx

- [ ] Added label to search input
- [ ] Verified tab keyboard navigation
- [ ] Tested with keyboard
- [ ] Tested with screen reader

### Televisit.tsx

- [ ] Added aria-live to loading state
- [ ] Enhanced iframe title
- [ ] Tested with keyboard
- [ ] Tested with screen reader

### Testing

- [ ] Run automated tests (axe-core)
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast validated
- [ ] All forms have labels
- [ ] All charts described

---

## 🆘 Common Issues & Solutions

### Issue: "Can't find accessible components"

**Solution**: Make sure you copied the files to `client/components/accessible/`

### Issue: "TypeScript errors on import"

**Solution**: Check import paths match your file structure:

```typescript
// Adjust path as needed
import { ... } from '../components/accessible/DashboardComponents';
// or
import { ... } from '@/components/accessible/DashboardComponents';
```

### Issue: "Charts not rendering"

**Solution**: Make sure you're passing the `metricName` prop:

```typescript
<AccessibleMiniLineChart
  data={healthScoreData}
  color="#10b981"
  metricName="Health Score" // REQUIRED
/>
```

### Issue: "Screen reader not announcing"

**Solution**:

1. Check sr-only class exists in global.css (it should after Step 1)
2. Verify aria-live region is present
3. Test with different screen reader (NVDA vs VoiceOver)

### Issue: "Keyboard focus not visible"

**Solution**: Check focus-visible styles in global.css (already added):

```css
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

---

## 📞 Need Help?

### Documentation

- **Full details**: Read `ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md`
- **Testing guide**: Read `ACCESSIBILITY_TESTING_GUIDE.md`
- **Component examples**: See `DASHBOARD_ACCESSIBILITY_FIXES.tsx` and `SCHEDULE_ACCESSIBILITY_FIXES.tsx`

### External Resources

- WCAG Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- NVDA Screen Reader: https://www.nvaccess.org/download/

---

## ⏱️ Time Estimates

- **Step 1 (Copy components)**: 5 minutes
- **Step 2 (Dashboard charts)**: 15 minutes
- **Step 3 (Form labels)**: 10 minutes
- **Dashboard complete**: 1-2 hours
- **Schedule complete**: 1-2 hours
- **Medications complete**: 30 minutes
- **Televisit complete**: 15 minutes
- **Testing all pages**: 2-3 hours

**Total**: 5-10 hours for one developer

---

## 🎉 Success Criteria

You're done when:

- ✅ All components imported and replaced
- ✅ All forms have visible labels
- ✅ All charts have ARIA descriptions
- ✅ All status indicators use icons + text
- ✅ All interactive elements keyboard accessible
- ✅ Screen reader announces everything correctly
- ✅ Automated tests pass (0 axe violations)
- ✅ Color contrast ≥ 4.5:1 on all text

---

## 🚀 Ready to Start?

1. **Read this guide** (you just did!)
2. **Copy the components** (Step 1 above)
3. **Start with Dashboard.tsx** (highest impact)
4. **Test as you go** (keyboard + screen reader)
5. **Move to Schedule.tsx** (second highest impact)
6. **Finish with Medications and Televisit**
7. **Run final tests** (automated + manual)
8. **Celebrate 100% WCAG AA compliance!** 🎊

Good luck! You've got this. All the hard work is already done - you just need to plug in the components.
