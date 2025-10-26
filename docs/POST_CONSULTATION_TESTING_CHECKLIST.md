# Post-Consultation Workflow - Testing Checklist

## Pre-Testing Setup

### Environment Setup

- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Medical templates seeded (`npx ts-node prisma/seed-templates.ts`)
- [ ] SMTP credentials configured in `.env`
- [ ] Test email account accessible
- [ ] Server running without errors
- [ ] Frontend build successful

### Test Data Setup

- [ ] Create test doctor account
- [ ] Create test patient account
- [ ] Create test appointment
- [ ] Create test video consultation
- [ ] Verify eRx integration is available

## Unit Tests

### Consultation Notes Service

#### Create Note

- [ ] Create new consultation note with all fields
- [ ] Create note with minimal fields
- [ ] Verify auto-generated fields (id, timestamps, version)
- [ ] Verify default values (isDraft=true, status='draft')
- [ ] Create note with invalid appointmentId (should fail)
- [ ] Create note with invalid doctorId (should fail)

#### Update Note

- [ ] Update existing note
- [ ] Update individual fields
- [ ] Verify version increments on update
- [ ] Update non-existent note (should fail)
- [ ] Update signed note (should fail)

#### Auto-save

- [ ] Auto-save creates new note if none exists
- [ ] Auto-save updates existing note
- [ ] Auto-save maintains isDraft=true
- [ ] Auto-save doesn't affect version number (or minimal increment)

#### Sign Note

- [ ] Sign draft note successfully
- [ ] Verify signedAt timestamp set
- [ ] Verify isDraft changed to false
- [ ] Verify status changed to 'signed'
- [ ] Sign already signed note (should fail)
- [ ] Non-author tries to sign note (should fail)

#### Retrieve Note

- [ ] Get note by appointmentId
- [ ] Get non-existent note (returns null)
- [ ] Get patient consultation history
- [ ] Limit patient history results

### Audit Service

#### Audit Log Creation

- [ ] Create audit log on note creation
- [ ] Create audit log on note update
- [ ] Create audit log on note sign
- [ ] Create audit log on note view
- [ ] Verify all required fields populated
- [ ] Verify IP address captured
- [ ] Verify user agent captured

#### Audit Log Retrieval

- [ ] Get audit trail for note
- [ ] Verify chronological order
- [ ] Verify field-level change tracking
- [ ] Get audit trail for non-existent note (empty array)

### Summary Service

#### Summary Generation

- [ ] Generate summary with all fields populated
- [ ] Generate summary with minimal fields
- [ ] Verify HTML format is valid
- [ ] Verify plain text format
- [ ] Verify all diagnosis codes included
- [ ] Verify prescription information included
- [ ] Verify follow-up information included
- [ ] Generate summary for non-existent appointment (should fail)

#### Summary Creation and Sending

- [ ] Create and send summary successfully
- [ ] Verify summary saved to database
- [ ] Verify email sent flag updated
- [ ] Verify email sent timestamp
- [ ] Attempt to resend already sent summary (should fail)
- [ ] Handle email send failure gracefully

#### Summary Retrieval

- [ ] Get summary by appointmentId
- [ ] Patient views own summary (authorized)
- [ ] Patient tries to view other's summary (should fail)
- [ ] Doctor views summary (authorized)
- [ ] Verify viewed flag updated on first patient view

### Email Service

#### Email Sending

- [ ] Send basic email
- [ ] Send email with HTML content
- [ ] Send email with attachments
- [ ] Send to multiple recipients (CC, BCC)
- [ ] Handle invalid email address
- [ ] Handle SMTP connection failure

#### Consultation Summary Email

- [ ] Send summary email to patient
- [ ] Verify email content matches template
- [ ] Verify all patient data included
- [ ] Verify email audit log created

#### Email Service Verification

- [ ] Verify email configuration
- [ ] Handle missing SMTP credentials gracefully
- [ ] Development mode (no SMTP) works

## API Integration Tests

### POST /api/consultation-notes/:appointmentId

#### Success Cases

- [ ] Create new note (201 response)
- [ ] Update existing note (200 response)
- [ ] Response includes note data
- [ ] Response includes success flag

#### Authorization

- [ ] Doctor creates note for own appointment
- [ ] Doctor updates own note
- [ ] Doctor cannot edit other doctor's note (403)
- [ ] Patient cannot create/edit notes (403)
- [ ] Admin can edit any note

#### Validation

- [ ] Invalid appointmentId (404)
- [ ] Missing required fields handled gracefully
- [ ] Invalid data types rejected
- [ ] Malformed JSON rejected (400)

### POST /api/consultation-notes/:appointmentId/auto-save

#### Success Cases

- [ ] Auto-save creates note if none exists
- [ ] Auto-save updates existing note
- [ ] Returns success message

#### Edge Cases

- [ ] Auto-save on signed note (should fail)
- [ ] Rapid consecutive auto-saves handled
- [ ] Auto-save with minimal data

### GET /api/consultation-notes/:appointmentId

#### Success Cases

- [ ] Retrieve existing note
- [ ] Doctor retrieves own note
- [ ] Patient retrieves own consultation note
- [ ] Admin retrieves any note

#### Authorization

- [ ] Unauthorized user gets 401
- [ ] User without access gets 403
- [ ] Patient can only view own notes

#### Not Found

- [ ] Non-existent appointmentId returns 404
- [ ] No note for appointment returns 404

### POST /api/consultation-notes/:noteId/sign

#### Success Cases

- [ ] Sign draft note successfully
- [ ] Response includes signed note data
- [ ] signedAt timestamp present

#### Validation

- [ ] Cannot sign already signed note
- [ ] Only author can sign note
- [ ] Invalid noteId returns 404

### GET /api/consultation-notes/:noteId/audit

#### Success Cases

- [ ] Retrieve complete audit trail
- [ ] Audit entries in chronological order
- [ ] All fields present

#### Authorization

- [ ] Only author and admin can view audit
- [ ] Unauthorized access returns 403

### POST /api/consultation-notes/:appointmentId/prescription

#### Success Cases

- [ ] Create prescription and link to note
- [ ] Prescription ID added to note
- [ ] eRx integration called
- [ ] Response includes both prescription and note data

#### Validation

- [ ] Missing medication returns 400
- [ ] Invalid appointment returns 404
- [ ] Only doctor can create prescription

### POST /api/consultation-notes/:appointmentId/summary

#### Success Cases

- [ ] Generate and send summary
- [ ] Summary saved to database
- [ ] Email sent to patient
- [ ] Response includes summary data

#### Validation

- [ ] Cannot send summary without signed note
- [ ] Cannot resend already sent summary
- [ ] Invalid appointment returns 404

### GET /api/consultation-notes/:appointmentId/summary

#### Success Cases

- [ ] Patient retrieves own summary
- [ ] Doctor retrieves summary
- [ ] Admin retrieves summary
- [ ] Viewed flag updated on patient view

#### Authorization

- [ ] Patient can only view own summary
- [ ] Unauthorized access returns 403

### GET /api/consultation-notes/templates

#### Success Cases

- [ ] Retrieve all active templates
- [ ] Filter by category works
- [ ] Filter by specialty works
- [ ] Templates sorted by usage count

#### Response Format

- [ ] Returns array of templates
- [ ] All template fields present
- [ ] Success flag included

### POST /api/consultation-notes/templates/:templateId/use

#### Success Cases

- [ ] Usage count incremented
- [ ] Returns updated template

#### Validation

- [ ] Invalid templateId returns 404

## Frontend Component Tests

### Component Rendering

- [ ] Component renders without errors
- [ ] All tabs render correctly
- [ ] Header displays patient name and date
- [ ] Action buttons visible
- [ ] Close button works

### Clinical Notes Tab

- [ ] Chief complaint field works
- [ ] History field works
- [ ] Assessment field works
- [ ] Additional notes field works
- [ ] Fields disabled when signed
- [ ] Character limits enforced (if any)

### Diagnosis Tab

- [ ] Diagnosis list renders
- [ ] Add diagnosis button works
- [ ] Search modal opens
- [ ] Search filters diagnosis codes
- [ ] Add diagnosis code works
- [ ] Remove diagnosis code works
- [ ] Duplicate codes prevented
- [ ] Empty state displays

### Treatment Tab

- [ ] Treatment plan field works
- [ ] Text area resizes appropriately
- [ ] Field disabled when signed

### Prescriptions Tab

- [ ] Prescription info displayed
- [ ] Add prescription button works
- [ ] Integration with eRx system

### Follow-up Tab

- [ ] Follow-up instructions field works
- [ ] Follow-up date picker works
- [ ] Appointment type selector works
- [ ] Future dates only (validation)

### Templates

- [ ] Template modal opens
- [ ] Templates load and display
- [ ] Template selection works
- [ ] Template content populates fields
- [ ] Template usage tracked
- [ ] Modal closes after selection

### Actions

- [ ] Use Template button works
- [ ] Save Draft button works
- [ ] Sign Note button works
- [ ] Send Summary button works
- [ ] Sign confirmation dialog shows
- [ ] Send confirmation dialog shows

### Auto-save

- [ ] Auto-save triggers every 30 seconds
- [ ] Last saved timestamp updates
- [ ] Auto-save only when content exists
- [ ] Auto-save stops when signed

### State Management

- [ ] Initial state loads correctly
- [ ] Existing note loads on mount
- [ ] Field changes update state
- [ ] Signed state prevents edits
- [ ] Loading states show appropriately

### Error Handling

- [ ] API errors displayed to user
- [ ] Network errors handled gracefully
- [ ] Validation errors shown
- [ ] Failed saves notify user

## End-to-End Tests

### Complete Workflow - New Note

1. [ ] Doctor ends video consultation
2. [ ] Post-consultation modal opens
3. [ ] Doctor selects template
4. [ ] Template populates fields
5. [ ] Doctor modifies template content
6. [ ] Auto-save occurs
7. [ ] Doctor adds diagnosis codes
8. [ ] Doctor completes treatment plan
9. [ ] Doctor adds follow-up instructions
10. [ ] Doctor schedules follow-up appointment
11. [ ] Doctor clicks Save Draft
12. [ ] Doctor clicks Sign Note
13. [ ] Confirmation dialog appears
14. [ ] Note is signed successfully
15. [ ] Doctor clicks Send Summary
16. [ ] Summary confirmation dialog appears
17. [ ] Summary sent successfully
18. [ ] Patient receives email
19. [ ] Patient views summary in portal
20. [ ] Audit trail is complete

### Complete Workflow - Edit Existing Draft

1. [ ] Doctor navigates to appointment
2. [ ] Doctor opens post-consultation workflow
3. [ ] Existing draft loads
4. [ ] Doctor makes changes
5. [ ] Changes auto-save
6. [ ] Doctor signs note
7. [ ] Doctor sends summary

### Complete Workflow - With Prescription

1. [ ] Doctor completes consultation
2. [ ] Doctor adds prescription
3. [ ] Prescription sent via eRx
4. [ ] Prescription ID saved in note
5. [ ] Prescription included in summary
6. [ ] Patient receives prescription notification

### Patient Summary View

1. [ ] Patient logs in to portal
2. [ ] Patient views appointments
3. [ ] Patient clicks view summary
4. [ ] Summary displays correctly
5. [ ] All information present
6. [ ] Viewed flag updated

### Multi-session Editing

1. [ ] Doctor starts note
2. [ ] Auto-save occurs
3. [ ] Doctor closes browser
4. [ ] Doctor reopens later
5. [ ] Draft note loads
6. [ ] Doctor continues editing

## Performance Tests

### Load Testing

- [ ] Create 100 notes simultaneously
- [ ] Auto-save 50 notes simultaneously
- [ ] Generate 20 summaries simultaneously
- [ ] Send 50 emails simultaneously
- [ ] Response times acceptable (<2s for creates)

### Database Performance

- [ ] Note retrieval with large patient history
- [ ] Audit log retrieval with many entries
- [ ] Template loading performance
- [ ] Index usage verified

### Frontend Performance

- [ ] Component renders quickly (<500ms)
- [ ] Large text fields don't lag
- [ ] Template modal loads fast
- [ ] Auto-save doesn't block UI

## Security Tests

### Authentication

- [ ] Unauthenticated requests blocked (401)
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected

### Authorization

- [ ] Role-based access enforced
- [ ] Doctor cannot access other doctor's notes
- [ ] Patient cannot access other patient's summaries
- [ ] Admin has appropriate access

### Data Validation

- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF protection active
- [ ] Input length limits enforced

### Audit Logging

- [ ] All access logged
- [ ] All modifications logged
- [ ] Sensitive data redacted in logs
- [ ] Audit logs immutable

### Email Security

- [ ] Email addresses validated
- [ ] No email header injection possible
- [ ] Encrypted transmission (TLS)
- [ ] PHI handled securely

## Compliance Tests

### HIPAA Compliance

- [ ] PHI encrypted at rest
- [ ] PHI encrypted in transit
- [ ] Access controls in place
- [ ] Audit logging complete
- [ ] Minimum necessary access
- [ ] Business associate agreements (if using third-party email)

### Data Retention

- [ ] Notes retained per policy
- [ ] Audit logs retained per policy
- [ ] Summaries retained per policy
- [ ] Old data cleanup process

### Patient Rights

- [ ] Patients can view their summaries
- [ ] Patients receive summaries
- [ ] Summary accuracy
- [ ] Timely delivery

## Accessibility Tests

### Keyboard Navigation

- [ ] All fields accessible via keyboard
- [ ] Tab order logical
- [ ] Enter key submits forms
- [ ] Escape key closes modals

### Screen Reader

- [ ] Labels present and correct
- [ ] ARIA attributes correct
- [ ] Error messages announced
- [ ] Status updates announced

### Visual

- [ ] Sufficient color contrast
- [ ] Text resizable
- [ ] Focus indicators visible
- [ ] No reliance on color alone

## Browser Compatibility

### Desktop Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design works

### Features

- [ ] Auto-save works in all browsers
- [ ] Date picker works in all browsers
- [ ] Modals work in all browsers
- [ ] File uploads work (if implemented)

## Error Scenarios

### Network Issues

- [ ] Handle network timeout gracefully
- [ ] Retry failed auto-saves
- [ ] Show offline indicator
- [ ] Queue failed emails

### Database Issues

- [ ] Handle connection loss
- [ ] Handle query timeout
- [ ] Handle constraint violations
- [ ] Transaction rollback on error

### Email Issues

- [ ] Handle SMTP connection failure
- [ ] Handle invalid email address
- [ ] Handle send quota exceeded
- [ ] Log failed emails for retry

### User Errors

- [ ] Handle empty forms
- [ ] Handle invalid dates
- [ ] Handle duplicate submissions
- [ ] Clear error messages

## Regression Tests

After any code changes, verify:

- [ ] Existing notes still load
- [ ] Auto-save still works
- [ ] Signing still works
- [ ] Summaries still generate
- [ ] Emails still send
- [ ] Templates still load
- [ ] Audit logs still created
- [ ] Authorization still works

## Documentation Tests

- [ ] README accurate
- [ ] API documentation matches implementation
- [ ] Integration guide tested
- [ ] Code comments accurate
- [ ] Environment variables documented
- [ ] Deployment steps verified

## Sign-off

### Developer Testing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code review completed
- [ ] Performance acceptable

### QA Testing

- [ ] All E2E tests pass
- [ ] All security tests pass
- [ ] All compliance tests pass
- [ ] Regression tests pass

### UAT (User Acceptance Testing)

- [ ] Doctors can complete workflow
- [ ] Patients receive summaries
- [ ] Templates are useful
- [ ] Performance acceptable
- [ ] UI/UX acceptable

### Production Readiness

- [ ] Database migrations tested
- [ ] Email service configured
- [ ] Monitoring in place
- [ ] Rollback plan documented
- [ ] Support team trained

---

## Test Execution Log

| Test Category     | Date | Tester | Status        | Notes |
| ----------------- | ---- | ------ | ------------- | ----- |
| Unit Tests        |      |        | ☐ Pass ☐ Fail |       |
| Integration Tests |      |        | ☐ Pass ☐ Fail |       |
| E2E Tests         |      |        | ☐ Pass ☐ Fail |       |
| Security Tests    |      |        | ☐ Pass ☐ Fail |       |
| Performance Tests |      |        | ☐ Pass ☐ Fail |       |
| UAT               |      |        | ☐ Pass ☐ Fail |       |

---

**Version**: 1.0.0
**Last Updated**: January 2025
