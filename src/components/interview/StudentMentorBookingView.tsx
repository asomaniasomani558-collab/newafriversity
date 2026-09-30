import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Video,
  Download,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Building,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MentorTimeSlot } from '../../types';
import {
  generateGoogleCalendarUrl,
  downloadIcsFile,
  formatSlotDate
} from '../../utils/calendarIntegration';

interface StudentMentorBookingViewProps {
  onSwitchToAiMock?: () => void;
  onRequestCustomSlot?: () => void;
}

export const StudentMentorBookingView: React.FC<StudentMentorBookingViewProps> = ({
  onSwitchToAiMock,
  onRequestCustomSlot
}) => {
  const {
    user,
    mentorTimeSlots,
    bookMentorTimeSlot,
    applications,
    opportunities,
    setActiveTab
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<'all' | 'technical' | 'behavioral' | 'scholarship' | 'leadership'>('all');
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<MentorTimeSlot | null>(null);
  const [bookingSuccessSlot, setBookingSuccessSlot] = useState<MentorTimeSlot | null>(null);

  // Booking Form State
  const defaultTargetOpp = applications[0]?.opportunity?.title || 'Google Software Engineering Internship Africa 2026';
  const [targetOpp, setTargetOpp] = useState(defaultTargetOpp);
  const [studentNotes, setStudentNotes] = useState('I would like to focus on technical system design trade-offs and STAR behavioral communication for my engineering project.');

  // Available slots
  const availableSlots = mentorTimeSlots.filter(s => s.status === 'available');
  const filteredAvailableSlots = availableSlots.filter(s => {
    if (typeFilter !== 'all' && s.interviewType !== typeFilter) return false;
    return true;
  });

  // My booked slots
  const myBookedSlots = mentorTimeSlots.filter(
    s => s.status === 'booked' && (s.bookedByStudentEmail?.toLowerCase() === user?.email?.toLowerCase() || s.bookedByStudentId === user?.id)
  );

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForBooking || !user) return;

    bookMentorTimeSlot(selectedSlotForBooking.id, {
      studentId: user.id,
      studentName: user.fullName,
      studentEmail: user.email,
      targetOpportunity: targetOpp.trim(),
      studentNotes: studentNotes.trim()
    });

    const bookedSlotWithDetails: MentorTimeSlot = {
      ...selectedSlotForBooking,
      status: 'booked',
      bookedByStudentId: user.id,
      bookedByStudentName: user.fullName,
      bookedByStudentEmail: user.email,
      targetOpportunity: targetOpp.trim(),
      studentNotes: studentNotes.trim()
    };

    setBookingSuccessSlot(bookedSlotWithDetails);
    setSelectedSlotForBooking(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Hero Booking Header */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
              <CalendarIcon className="w-4 h-4" />
              <span>Verified Faculty Mock Interview Calendar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              Book a Live 1-on-1 Mock Interview with a Faculty Mentor
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
              Schedule a private mock session with accredited university faculty and admissions advisors. Practice real interview questions under timed conditions and receive an official STAR performance evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onSwitchToAiMock && (
              <button
                type="button"
                onClick={onSwitchToAiMock}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Practice with AI Voice Coach</span>
              </button>
            )}

            {onRequestCustomSlot && (
              <button
                type="button"
                onClick={onRequestCustomSlot}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Request Custom Time</span>
              </button>
            )}
          </div>
        </div>

        {/* Mentor Credential Spotlight Card */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 font-bold text-lg flex items-center justify-center border border-amber-500/30 shrink-0">
              JB
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900 dark:text-white">
                  Dr. Joseph Boateng
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Faculty Mentor
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Senior Lecturer & Admissions Committee Advisor · Ashesi University & PhD Computer Science (Cambridge)
              </p>
              <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono pt-0.5">
                <span>⭐ 4.9/5.0 Rating</span>
                <span>·</span>
                <span>50+ Scholars Advised</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{availableSlots.length} Open Slots This Month</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-stone-900 dark:text-white">$25 / Session</div>
              <div className="text-[10px] text-stone-500">Scholarship subsidy eligible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Confirmation Banner */}
      {bookingSuccessSlot && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Interview Slot Confirmed! Virtual Studio Invitation Ready</span>
            </div>
            <button
              type="button"
              onClick={() => setBookingSuccessSlot(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
            Your live mock session with <strong>{bookingSuccessSlot.mentorName}</strong> is locked for{' '}
            <strong>{formatSlotDate(bookingSuccessSlot.date)} at {bookingSuccessSlot.startTime} GMT</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={generateGoogleCalendarUrl(bookingSuccessSlot)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Add to Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={() => downloadIcsFile(bookingSuccessSlot)}
              className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ICS Invitation</span>
            </button>

            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 pl-2">
              Virtual Meeting Link: <code>{bookingSuccessSlot.meetingLink}</code>
            </span>
          </div>
        </div>
      )}

      {/* 2. My Upcoming Booked Sessions (if any) */}
      {myBookedSlots.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-purple-200 dark:border-purple-800/80 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                My Booked Live Interview Sessions ({myBookedSlots.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded font-bold uppercase">
              Confirmed Appointments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myBookedSlots.map(slot => (
              <div
                key={slot.id}
                className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-stone-900 dark:text-white text-sm">
                      {formatSlotDate(slot.date)}
                    </div>
                    <div className="font-mono text-purple-800 dark:text-purple-300 font-semibold">
                      {slot.startTime} – {slot.endTime} GMT · {slot.durationMinutes} mins
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                    Confirmed
                  </span>
                </div>

                <div className="text-stone-600 dark:text-stone-300">
                  Mentor: <strong>{slot.mentorName}</strong> ({slot.mentorEmail})
                </div>

                {slot.targetOpportunity && (
                  <div className="text-[11px] text-stone-500">
                    Target: <strong className="text-amber-700 dark:text-amber-400">{slot.targetOpportunity}</strong>
                  </div>
                )}

                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between gap-2">
                  <a
                    href={generateGoogleCalendarUrl(slot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Google Cal</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadIcsFile(slot)}
                    className="text-stone-600 dark:text-stone-300 hover:text-stone-900 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>.ICS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Available Time Slots Browser */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Available Faculty Interview Slots</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select an open slot to practice for your upcoming scholarship or technical admissions deadline.
            </p>
          </div>

          {/* Focus Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Slots' },
              { id: 'technical', label: 'Technical' },
              { id: 'behavioral', label: 'Behavioral / STAR' },
              { id: 'scholarship', label: 'Scholarship' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  typeFilter === f.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slots Grid */}
        {filteredAvailableSlots.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
            <CalendarIcon className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 dark:text-white text-sm">No Available Slots Found</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                All scheduled slots in this focus category are currently reserved.
              </p>
            </div>
            {onRequestCustomSlot && (
              <button
                type="button"
                onClick={onRequestCustomSlot}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Request Custom Interview Slot</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailableSlots.map(slot => (
              <div
                key={slot.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3 hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-[10px] font-bold uppercase">
                      {slot.interviewType} Interview
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-900 dark:text-white">
                      ${slot.feeUsd || 25}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                      {formatSlotDate(slot.date)}
                    </h4>
                    <div className="text-xs font-mono text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot.startTime} – {slot.endTime} GMT ({slot.durationMinutes} mins)</span>
                    </div>
                  </div>

                  <div className="text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
                    Advisor: <strong className="text-stone-800 dark:text-stone-200">{slot.mentorName}</strong>
                    <div className="text-[11px] text-stone-400">Ashesi University Faculty</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSlotForBooking(slot)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Book This Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Booking Confirmation Modal */}
      {selectedSlotForBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Confirm Mock Interview Reservation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlotForBooking(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            {/* Slot Details Summary Box */}
            <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Selected Appointment:</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {formatSlotDate(selectedSlotForBooking.date)} at {selectedSlotForBooking.startTime} GMT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Faculty Advisor:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedSlotForBooking.mentorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Format & Duration:</span>
                <span className="capitalize font-semibold text-amber-700 dark:text-amber-400">
                  {selectedSlotForBooking.interviewType} Interview ({selectedSlotForBooking.durationMinutes} mins)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                <span className="font-bold text-stone-700 dark:text-stone-300">Session Fee:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ${selectedSlotForBooking.feeUsd || 25} USD
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Target Opportunity
                </label>
                <select
                  value={targetOpp}
                  onChange={e => setTargetOpp(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                >
                  {opportunities.map(o => (
                    <option key={o.id} value={o.title}>
                      {o.organization} — {o.title}
                    </option>
                  ))}
                  <option value="General Technical Software Engineering Interview">General Technical Software Engineering Interview</option>
                  <option value="Pan-African Postgraduate Fellowship Interview">Pan-African Postgraduate Fellowship Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Preparation Notes / Key Focus Areas for Mentor
                </label>
                <textarea
                  rows={3}
                  required
                  value={studentNotes}
                  onChange={e => setStudentNotes(e.target.value)}
                  placeholder="Specify particular topics (e.g. data structures, STAR behavioral answers, research rationale) you'd like the mentor to evaluate..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Immediate Calendar Confirmation</span>
                </span>
                <p>
                  Upon confirmation, the session is reserved on the faculty calendar. You will receive an immediate calendar invitation with the Afriversity Live Studio link.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForBooking(null)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg cursor-pointer"
                >
                  Confirm & Reserve Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
