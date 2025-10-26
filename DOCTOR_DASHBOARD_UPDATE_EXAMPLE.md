# Doctor Dashboard Update Example

This file shows how to add a link to the Video Consultations dashboard in the existing Doctor Dashboard.

## Option 1: Add as Quick Action Button

Update `client/pages/DoctorDashboard.tsx` in the Quick Actions section:

```tsx
// Add this import at the top
import { Link } from "react-router-dom";

// Find the Quick Actions Card (around line 436)
<Card className="glass-morphism border border-border/20">
  <CardHeader>
    <CardTitle className="text-lg font-bold text-foreground">
      Quick Actions
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* ADD THIS NEW BUTTON */}
    <Button variant="outline" className="w-full justify-start" asChild>
      <Link to="/doctor/video-consultations">
        <Video className="w-4 h-4 mr-2" />
        Video Consultations
      </Link>
    </Button>

    {/* Existing buttons */}
    <Button variant="outline" className="w-full justify-start" asChild>
      <Link to="/ehr/ai-scribe">
        <Brain className="w-4 h-4 mr-2" />
        AI Medical Scribe
      </Link>
    </Button>
    {/* ... rest of buttons ... */}
  </CardContent>
</Card>;
```

## Option 2: Add as Featured Action in Header

Update the header section (around line 188):

```tsx
<div className="flex items-center space-x-3">
  <Button variant="outline" size="sm">
    <Calendar className="w-4 h-4 mr-2" />
    Schedule
  </Button>

  {/* ADD THIS NEW BUTTON */}
  <Button variant="outline" size="sm" asChild>
    <Link to="/doctor/video-consultations">
      <Video className="w-4 h-4 mr-2" />
      Video Consults
    </Link>
  </Button>

  <Button className="gradient-bg text-white border-0" asChild>
    <Link to="/consultation/new">
      <Video className="w-4 h-4 mr-2" />
      Start Consultation
    </Link>
  </Button>
</div>
```

## Option 3: Embed Component Directly in Dashboard

For a more integrated approach, embed the component directly:

```tsx
// Add import at top
import { DoctorVideoConsultations } from "../components/DoctorVideoConsultations";

// Add new section after existing content (around line 473, before floating widget)
<div className="mt-8">
  <DoctorVideoConsultations
    showStats={false} // Hide stats since dashboard already has stats
    autoRefresh={true}
    refreshInterval={30000}
  />
</div>;
```

## Option 4: Replace Today's Schedule Section

If you want to replace the existing schedule section with the video consultations component:

```tsx
// Find the "Today's Schedule" Card (around line 270)
// Replace the entire Card with:
<DoctorVideoConsultations
  showStats={true}
  autoRefresh={true}
  refreshInterval={30000}
  className="lg:col-span-2"
/>
```

## Recommended Implementation

I recommend **Option 1** (Quick Actions) because:

- Non-invasive - doesn't change existing layout
- Easy to find for doctors
- Consistent with other quick action buttons
- Minimal code changes

## Complete Code Example for Option 1

Here's the exact code change needed:

### Before (current code):

```tsx
<CardContent className="space-y-3">
  <Button variant="outline" className="w-full justify-start" asChild>
    <Link to="/ehr/ai-scribe">
      <Brain className="w-4 h-4 mr-2" />
      AI Medical Scribe
    </Link>
  </Button>
  <Button variant="outline" className="w-full justify-start">
    <Plus className="w-4 h-4 mr-2" />
    New Prescription
  </Button>
  {/* ... other buttons ... */}
</CardContent>
```

### After (with video consultations):

```tsx
<CardContent className="space-y-3">
  <Button
    variant="outline"
    className="w-full justify-start gradient-bg text-white border-0"
    asChild
  >
    <Link to="/doctor/video-consultations">
      <Video className="w-4 h-4 mr-2" />
      Video Consultations
    </Link>
  </Button>
  <Button variant="outline" className="w-full justify-start" asChild>
    <Link to="/ehr/ai-scribe">
      <Brain className="w-4 h-4 mr-2" />
      AI Medical Scribe
    </Link>
  </Button>
  <Button variant="outline" className="w-full justify-start">
    <Plus className="w-4 h-4 mr-2" />
    New Prescription
  </Button>
  {/* ... other buttons ... */}
</CardContent>
```

Note: I added `gradient-bg text-white border-0` to make it stand out as the primary action.

## Testing After Update

1. Login as doctor: `doctor@telecheck.com`
2. Navigate to `/doctor-dashboard`
3. Look for the new "Video Consultations" button
4. Click it and verify navigation works
5. Verify the video consultations page loads correctly

## Visual Result

The Quick Actions sidebar will now look like this:

```
┌──────────────────────────┐
│ Quick Actions            │
├──────────────────────────┤
│ [Video Consultations]    │ ← New (gradient background)
│ [AI Medical Scribe]      │
│ [New Prescription]       │
│ [AI Diagnosis]           │
│ [Lab Orders]             │
│ [Patient Messages]       │
└──────────────────────────┘
```

## Alternative: Add to Main Stats Section

You could also add a clickable stat card:

```tsx
{
  /* Add as a new stat card */
}
<Card
  className="glass-morphism border border-border/20 cursor-pointer hover-lift"
  asChild
>
  <Link to="/doctor/video-consultations">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Video Consults</p>
          <p className="text-3xl font-bold text-foreground">8</p>
        </div>
        <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Link>
</Card>;
```

This would add a fifth stat card specifically for video consultations that's clickable.
