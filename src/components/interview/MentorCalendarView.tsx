import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Video,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Filter,
  Check,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MentorTimeSlot } from '../../types';
import {
  generateGoogleCalendarUrl,
  downloadIcsFile,
  formatSlotDate
} from '../../utils/calendarIntegration';

interface MentorCalendarViewProps {
  onLaunchLiveSession?: (studentName: string, targetOpportunity: string, type: 'technical' | 'behavioral' | 'scholarship' | 'leadership') => void;
}

export const MentorCalendarView: React.FC<MentorCalendarViewProps> = ({ onLaunchLiveSession }) => {
  const {
    user,
    mentorTimeSlots,
    addMentorTimeSlot,
    removeMentorTimeSlot,
    interviewRequests
  } = useApp();

  const isMentor = user?.role === 'mentor';
  const mentorEmail = user?.email || 'j.boateng@ashesi.edu.gh';
  const mentorName = user?.fullName || 'Dr. Joseph Boateng';

  // Filter slots for this mentor (or all slots if admin)
  const mySlots = useMemo(() => {
    return mentorTimeSlots.filter(s => s.mentorEmail.toLowerCase() === mentorEmail.toLowerCase() || !s.mentorEmail);
  }, [mentorTimeSlots, mentorEmail]);

  // Current Calendar Month & Year
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // October 2026 default
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'booked' | 'completed'>('all');

  // Add Slot Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('2026-10-09');
  const [newSlotStartTime, setNewSlotStartTime] = useState('16:00');
  const [newSlotDuration, setNewSlotDuration] = useState<number>(45);
  const [newSlotType, setNewSlotType] = useState<'technical' | 'behavioral' | 'scholarship' | 'leadership'>('technical');
  const [newSlotFee, setNewSlotFee] = useState<number>(30);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Calculate End Time automatically based on duration
  const computeEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(':').map(Number);
    const totalMins = h * 60 + m + duration;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate || !newSlotStartTime) return;

    const endTime = computeEndTime(newSlotStartTime, newSlotDuration);

    addMentorTimeSlot({
      mentorId: user?.id || 'usr-mentor-1',
      mentorName,
      mentorEmail,
      date: newSlotDate,
      startTime: newSlotStartTime,
      endTime,
      durationMinutes: newSlotDuration,
      interviewType: newSlotType,
      feeUsd: 2.5,
      feeGhs: newSlotFee || 30
    });

    setIsAddModalOpen(false);
    setNotificationMsg(`Available time slot on ${newSlotDate} at ${newSlotStartTime} GMT (₵${newSlotFee || 30} GHS) published successfully!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Quick Batch Add Slots for next week
  const handleQuickBatchSlots = () => {
    const dates = ['2026-10-12', '2026-10-14', '2026-10-16'];
    dates.forEach(d => {
      addMentorTimeSlot({
        mentorId: user?.id || 'usr-mentor-1',
        mentorName,
        mentorEmail,
        date: d,
        startTime: '15:00',
        endTime: '15:45',
        durationMinutes: 45,
        interviewType: 'technical',
        feeUsd: 2.5,
        feeGhs: 30
      });
    });
    setNotificationMsg('3 new live interview slots (₵30 GHS) for next week added to your calendar!');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // KPI Calculations
  const availableSlotsCount = mySlots.filter(s => s.status === 'available').length;
  const bookedSlotsCount = mySlots.filter(s => s.status === 'booked').length;
  const completedSlotsCount = mySlots.filter(s => s.status === 'completed').length;
  const totalEarnedGhs = mySlots
    .filter(s => s.status === 'booked' || s.status === 'completed')
    .reduce((sum, s) => sum + (s.feeGhs || 30), 0);

  // Month Calendar Grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // First day of month (0 = Sunday, 1 = Monday...)
  const firstDay = new Date(year, month, 1);
  const startingDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayStr(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayStr(null);
  };

  const setMonthToToday = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDayStr(null);
  };

  // Filtered Slots for list view
  const filteredSlots = useMemo(() => {
    return mySlots.filter(s => {
      if (selectedDayStr && s.date !== selectedDayStr) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [mySlots, selectedDayStr, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
              <CalendarIcon className="w-4 h-4" />
              <span>Interactive Calendar & Availability Scheduler</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              Mock Interview Calendar & Time Slots
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
              Publish open 1-on-1 interview slots for assigned African mentees. Once booked, sessions automatically sync to your calendar and live interview studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleQuickBatchSlots}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Quickly generate 3 slots for next week"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Add Next Week</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-stone-950" />
              <span>Add Available Slot</span>
            </button>
          </div>
        </div>

        {notificationMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* 2. KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Total Calendar Slots</div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-white mt-0.5">{mySlots.length}</div>
            <div className="text-[11px] text-stone-400">Published slots</div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Available to Book</div>
            <div className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-0.5">{availableSlotsCount}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Open for students</div>
          </div>

          <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400">Booked by Mentees</div>
            <div className="text-xl font-bold font-mono text-purple-800 dark:text-purple-300 mt-0.5">{bookedSlotsCount}</div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400">Upcoming live sessions</div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">Advisory Revenue</div>
            <div className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-0.5">₵{totalEarnedGhs} GHS</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400">From {bookedSlotsCount + completedSlotsCount} bookings (₵30 GHS/session)</div>
          </div>
        </div>
      </div>

      {/* 3. Main Calendar & Slots Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Visual Calendar (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                {monthName}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={setMonthToToday}
                className="px-2 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded hover:bg-stone-200 cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 text-center font-mono text-[10px] uppercase font-bold text-stone-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-xs">
            {/* Empty slots before month start */}
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-lg bg-stone-50/40 dark:bg-stone-950/20" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const daySlots = mySlots.filter(s => s.date === dateStr);
              const isSelected = selectedDayStr === dateStr;
              const hasAvailable = daySlots.some(s => s.status === 'available');
              const hasBooked = daySlots.some(s => s.status === 'booked');

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayStr(isSelected ? null : dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 shadow-2xs'
                      : daySlots.length > 0
                      ? 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:border-amber-400'
                      : 'border-stone-100 dark:border-stone-800/80 bg-stone-50/30 dark:bg-stone-900/50 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[11px] font-semibold ${isSelected ? 'text-amber-800 dark:text-amber-300 font-bold' : 'text-stone-700 dark:text-stone-300'}`}>
                      {dayNum}
                    </span>
                    {daySlots.length > 0 && (
                      <span className="text-[9px] font-mono px-1 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold">
                        {daySlots.length}
                      </span>
                    )}
                  </div>

                  {/* Slot indicator badges */}
                  <div className="space-y-0.5 overflow-hidden">
                    {hasBooked && (
                      <div className="text-[9px] font-mono truncate px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span className="truncate">Booked</span>
                      </div>
                    )}
                    {hasAvailable && (
                      <div className="text-[9px] font-mono truncate px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">Open</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Available Slot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Student Booked</span>
              </span>
            </div>
            {selectedDayStr && (
              <button
                type="button"
                onClick={() => setSelectedDayStr(null)}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Clear Day Filter ({formatSlotDate(selectedDayStr)})
              </button>
            )}
          </div>
        </div>

        {/* Right: Slot Details & Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <span>Slots ({filteredSlots.length})</span>
            </span>

            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'available', 'booked'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                    statusFilter === f
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Slots List */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredSlots.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
                <CalendarIcon className="w-8 h-8 text-stone-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">No Time Slots Found</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {selectedDayStr
                      ? `No interview slots on ${formatSlotDate(selectedDayStr)}.`
                      : 'You have not added any available interview slots in this view.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDayStr) setNewSlotDate(selectedDayStr);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slot on this Date</span>
                </button>
              </div>
            ) : (
              filteredSlots.map(slot => {
                const isBooked = slot.status === 'booked';
                const isAvailable = slot.status === 'available';

                return (
                  <div
                    key={slot.id}
                    className={`rounded-xl border p-4 space-y-3 transition-all ${
                      isBooked
                        ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/80 shadow-2xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                            {formatSlotDate(slot.date)}
                          </span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                            {slot.startTime} – {slot.endTime} GMT
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                          <span className="capitalize font-semibold text-amber-700 dark:text-amber-400">
                            {slot.interviewType} Interview
                          </span>
                          <span>·</span>
                          <span>{slot.durationMinutes} mins</span>
                          <span>·</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">₵{slot.feeGhs || 30} GHS</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isBooked ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono text-[10px] font-bold uppercase border border-purple-200 dark:border-purple-800">
                            Booked by Student
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-200 dark:border-emerald-800">
                            Available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booked Student Info */}
                    {isBooked && (
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-purple-200/80 dark:border-purple-800/60 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span>{slot.bookedByStudentName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">{slot.bookedByStudentEmail}</span>
                        </div>

                        {slot.targetOpportunity && (
                          <div className="text-[11px] text-stone-600 dark:text-stone-300">
                            Goal: <strong className="text-amber-700 dark:text-amber-400">{slot.targetOpportunity}</strong>
                          </div>
                        )}

                        {slot.studentNotes && (
                          <p className="text-[11px] text-stone-500 italic bg-stone-50 dark:bg-stone-800/60 p-2 rounded border border-stone-100 dark:border-stone-800">
                            "{slot.studentNotes}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Calendar export links */}
                        <a
                          href={generateGoogleCalendarUrl(slot)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded transition-colors flex items-center gap-1"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                          <span>Google Cal</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => downloadIcsFile(slot)}
                          className="px-2 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download .ICS calendar invite file"
                        >
                          <Download className="w-3 h-3 text-stone-400" />
                          <span>.ICS</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isBooked ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onLaunchLiveSession) {
                                onLaunchLiveSession(
                                  slot.bookedByStudentName || 'Student',
                                  slot.targetOpportunity || 'Technical Opportunity',
                                  slot.interviewType
                                );
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-stone-950" />
                            <span>Launch Live Studio</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this available time slot?')) {
                                removeMentorTimeSlot(slot.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove open slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Add Available Mock Interview Slot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Interview Date
                </label>
                <input
                  type="date"
                  required
                  value={newSlotDate}
                  onChange={e => setNewSlotDate(e.target.value)}
                  min="2026-09-30"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Start Time (GMT)
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotStartTime}
                    onChange={e => setNewSlotStartTime(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={newSlotDuration}
                    onChange={e => setNewSlotDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes (Recommended)</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Focus Area
                  </label>
                  <select
                    value={newSlotType}
                    onChange={e => setNewSlotType(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white capitalize"
                  >
                    <option value="technical">Technical Engineering</option>
                    <option value="behavioral">Behavioral / STAR</option>
                    <option value="scholarship">Scholarship & Leadership</option>
                    <option value="leadership">Executive & Fellowship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                    Session Fee (₵ GHS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-400 font-mono font-bold">₵</span>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={newSlotFee}
                      onChange={e => setNewSlotFee(Number(e.target.value))}
                      className="w-full pl-7 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Automatic Synchronization</span>
                </span>
                <p>
                  Once published, students can book this slot directly. A virtual meeting room link will be generated automatically.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg cursor-pointer"
                >
                  Publish Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
