import { MentorTimeSlot } from '../types';

/**
 * Generates a Google Calendar "Add Event" URL for a mock interview slot.
 */
export function generateGoogleCalendarUrl(slot: MentorTimeSlot): string {
  const title = `Afriversity Mock Interview: ${slot.mentorName} & ${slot.bookedByStudentName || 'Student'}`;
  
  // Format dates: YYYYMMDDTHHmmSSZ
  // Assuming slot.date is YYYY-MM-DD and startTime/endTime are HH:mm (GMT)
  const cleanDate = slot.date.replace(/-/g, '');
  const startHours = slot.startTime.replace(':', '');
  const endHours = slot.endTime.replace(':', '');
  
  const startIso = `${cleanDate}T${startHours}00Z`;
  const endIso = `${cleanDate}T${endHours}00Z`;
  
  const details = [
    `Afriversity 1-on-1 Live Mock Interview Session`,
    `Mentor: ${slot.mentorName} (${slot.mentorEmail})`,
    `Candidate: ${slot.bookedByStudentName || 'Pending'} (${slot.bookedByStudentEmail || 'N/A'})`,
    `Focus Area: ${slot.interviewType.toUpperCase()} Interview`,
    `Target Opportunity: ${slot.targetOpportunity || 'General Technical / Scholarship'}`,
    slot.studentNotes ? `Candidate Notes: "${slot.studentNotes}"` : '',
    `Virtual Studio Link: ${slot.meetingLink || 'https://meet.afriversity.org/live/' + slot.id}`
  ].filter(Boolean).join('\n\n');

  const location = slot.meetingLink || `https://meet.afriversity.org/live/${slot.id}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startIso}/${endIso}`,
    details,
    location,
    ctz: 'UTC'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Downloads an RFC 5545 compliant .ics calendar invitation file.
 */
export function downloadIcsFile(slot: MentorTimeSlot): void {
  const cleanDate = slot.date.replace(/-/g, '');
  const startHours = slot.startTime.replace(':', '');
  const endHours = slot.endTime.replace(':', '');
  const startIso = `${cleanDate}T${startHours}00Z`;
  const endIso = `${cleanDate}T${endHours}00Z`;
  const nowIso = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `Afriversity Mock Interview: ${slot.mentorName} & ${slot.bookedByStudentName || 'Student'}`;
  const description = `Live 1-on-1 ${slot.interviewType} mock interview session on Afriversity.\\nMentor: ${slot.mentorName}\\nStudent: ${slot.bookedByStudentName || 'Student'}\\nTarget Opportunity: ${slot.targetOpportunity || 'N/A'}\\nMeeting Link: ${slot.meetingLink || 'https://meet.afriversity.org/live/' + slot.id}`;
  const location = slot.meetingLink || `https://meet.afriversity.org/live/${slot.id}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Afriversity//Faculty Mock Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:afriversity-${slot.id}@afriversity.org`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Afriversity Mock Interview in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mock-interview-${slot.date}-${slot.startTime.replace(':', '')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats slot date in human-friendly format (e.g., "Thursday, Oct 2, 2026")
 */
export function formatSlotDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch {
    return dateStr;
  }
}
