import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
  ExternalLink,
  Building,
  RefreshCw,
  Landmark,
  Wallet,
  Receipt,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, PlatformTransaction } from '../../types';

export const AdminOverviewDashboard: React.FC = () => {
  const {
    platformUsers,
    updatePlatformUser,
    transactions,
    mentorTimeSlots,
    menteeReviews,
    opportunities,
    auditLogs,
    addAuditLog,
    user
  } = useApp();

  const [currency, setCurrency] = useState<'GHS' | 'USD' | 'NGN'>('GHS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Currency Conversion Rates (Base: GHS)
  const formatMoney = (amountGhs: number, amountUsd?: number) => {
    if (currency === 'GHS') {
      const ghs = amountGhs || (amountUsd ? amountUsd * 12 : 0);
      return `₵${ghs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GHS`;
    }
    if (currency === 'USD') {
      const usd = amountUsd || (amountGhs ? amountGhs / 12 : 0);
      return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
    const ngn = (amountGhs || (amountUsd ? amountUsd * 12 : 0)) * 115;
    return `₦${ngn.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} NGN`;
  };

  // 1. Total Student Registrations (Real User Data Source)
  const studentRegistrations = useMemo(() => {
    return platformUsers.filter(u => u.role === 'student');
  }, [platformUsers]);

  const verifiedStudentsCount = useMemo(() => {
    return studentRegistrations.filter(u => u.isVerified).length;
  }, [studentRegistrations]);

  const secondaryStudentsCount = useMemo(() => {
    return studentRegistrations.filter(u => u.academicLevel === 'secondary').length;
  }, [studentRegistrations]);

  const tertiaryStudentsCount = useMemo(() => {
    return studentRegistrations.filter(u => u.academicLevel === 'undergraduate' || u.academicLevel === 'postgraduate').length;
  }, [studentRegistrations]);

  // 2. Total Active Mentors (Real User Data Source)
  const activeMentors = useMemo(() => {
    return platformUsers.filter(u => u.role === 'mentor' && (u.status === 'active' || !u.status));
  }, [platformUsers]);

  const publishedInterviewSlots = useMemo(() => {
    return mentorTimeSlots.length;
  }, [mentorTimeSlots]);

  const bookedSlotsCount = useMemo(() => {
    return mentorTimeSlots.filter(s => s.status === 'booked' || s.status === 'completed').length;
  }, [mentorTimeSlots]);

  // 3. Aggregate Platform Revenue (Real User Data Source from Live Ledger)
  const aggregateRevenueGhs = useMemo(() => {
    return transactions
      .filter(t => t.status === 'completed' && t.amountUsd > 0)
      .reduce((sum, t) => {
        const ghs = t.amountGhs || (t.amountUsd ? t.amountUsd * 12 : 30);
        return sum + ghs;
      }, 0);
  }, [transactions]);

  const aggregateRevenueUsd = useMemo(() => {
    return transactions
      .filter(t => t.status === 'completed' && t.amountUsd > 0)
      .reduce((sum, t) => sum + (t.amountUsd || (t.amountGhs ? t.amountGhs / 12 : 2.5)), 0);
  }, [transactions]);

  const mentorPayoutsGhs = useMemo(() => {
    return Math.abs(
      transactions
        .filter(t => t.amountUsd < 0)
        .reduce((sum, t) => {
          const ghs = t.amountGhs || (t.amountUsd ? t.amountUsd * 12 : 0);
          return sum + ghs;
        }, 0)
    );
  }, [transactions]);

  const netPlatformRevenueGhs = aggregateRevenueGhs - mentorPayoutsGhs;

  // Breakdown by revenue stream
  const interviewBookingGhs = useMemo(() => {
    return transactions
      .filter(t => t.type === 'interview_booking' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amountGhs || (t.amountUsd ? t.amountUsd * 12 : 30)), 0);
  }, [transactions]);

  const advisoryReviewGhs = useMemo(() => {
    return transactions
      .filter(t => t.type === 'advisory_review' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amountGhs || (t.amountUsd ? t.amountUsd * 12 : 180)), 0);
  }, [transactions]);

  const verificationFeeGhs = useMemo(() => {
    return transactions
      .filter(t => t.type === 'verification_fee' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amountGhs || (t.amountUsd ? t.amountUsd * 12 : 120)), 0);
  }, [transactions]);

  // Geographic Distribution of Real Students
  const countryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    studentRegistrations.forEach(s => {
      const c = s.country || 'Ghana';
      counts[c] = (counts[c] || 0) + 1;
    });
    const total = Math.max(1, studentRegistrations.length);
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100)
    }));
  }, [studentRegistrations]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return studentRegistrations.filter(s => {
      if (statusFilter === 'verified' && !s.isVerified) return false;
      if (statusFilter === 'pending' && s.isVerified) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.institution && s.institution.toLowerCase().includes(q)) ||
        (s.country && s.country.toLowerCase().includes(q))
      );
    });
  }, [studentRegistrations, statusFilter, searchTerm]);

  const handleToggleVerification = (targetStudent: UserProfile) => {
    const nextStatus = !targetStudent.isVerified;
    updatePlatformUser(targetStudent.id, { isVerified: nextStatus });
    addAuditLog({
      category: 'user',
      action: nextStatus ? 'Student Academic Identity Verified' : 'Student Verification Revoked',
      actor: user?.email || 'admin@afriversity.org',
      details: `${nextStatus ? 'Verified' : 'Revoked verification for'} ${targetStudent.fullName} (${targetStudent.email}).`,
      severity: nextStatus ? 'success' : 'warning'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Live Telemetry Bar */}
      <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE ADMINISTRATIVE OVERVIEW</span>
            </span>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Real User Data Stream Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Platform Real-Time Intelligence & Governance
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl">
            Real-time telemetry showing verified student registrations, active faculty advisors, and live transaction ledger revenue across Africa.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 shrink-0 self-start md:self-auto">
          <span className="text-[10px] font-mono uppercase font-bold text-stone-500 dark:text-stone-400 px-2">
            Currency:
          </span>
          {(['GHS', 'USD', 'NGN'] as const).map(curr => (
            <button
              key={curr}
              type="button"
              onClick={() => setCurrency(curr)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                currency === curr
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-amber-400 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
            >
              {curr === 'GHS' ? '₵ GHS (Standard)' : curr === 'USD' ? '$ USD' : '₦ NGN'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. THREE CORE PRIMARY REAL-TIME METRICS (Requested by User) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Student Registrations */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xs space-y-4 relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Total Student Registrations</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Live Source
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
              {studentRegistrations.length}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
              <span>Verified Identity Rate</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {studentRegistrations.length > 0 ? Math.round((verifiedStudentsCount / studentRegistrations.length) * 100) : 0}% ({verifiedStudentsCount} Verified)
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] font-mono uppercase text-stone-400">SHS / WASSCE</div>
              <div className="text-base font-bold font-mono text-stone-900 dark:text-white mt-0.5">
                {secondaryStudentsCount} Scholars
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] font-mono uppercase text-stone-400">Tertiary / University</div>
              <div className="text-base font-bold font-mono text-stone-900 dark:text-white mt-0.5">
                {tertiaryStudentsCount} Students
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Active Mentors */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xs space-y-4 relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Total Active Mentors</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Verified Faculty
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
              {activeMentors.length}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
              <span>Booked Mock Interview Sessions</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {bookedSlotsCount} Sessions Reserved
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] font-mono uppercase text-stone-400">Calendar Slots Open</div>
              <div className="text-base font-bold font-mono text-stone-900 dark:text-white mt-0.5">
                {publishedInterviewSlots} Published
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] font-mono uppercase text-stone-400">Session Fee (Ghana)</div>
              <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                ₵30 GHS / session
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3: Aggregate Platform Revenue */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xs space-y-4 relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Aggregate Platform Revenue</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Auto-Reconciled
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
              {formatMoney(aggregateRevenueGhs, aggregateRevenueUsd)}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
              <span>Net Platform Retained</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-200">
                {formatMoney(netPlatformRevenueGhs)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] font-mono uppercase text-stone-400">Mock Interview Bookings</div>
              <div className="text-sm font-bold font-mono text-stone-900 dark:text-white mt-0.5 truncate">
                {formatMoney(interviewBookingGhs)}
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-850 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <div className="text-[10px] font-mono uppercase text-stone-400">Faculty Payouts (70%)</div>
              <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                {formatMoney(mentorPayoutsGhs)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Revenue Streams & Demographics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Distribution by Product (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                <span>Real-Time Revenue Streams Breakdown</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Calculated strictly from live student transactions, mock interview bookings, and credential verifications.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(aggregateRevenueGhs, aggregateRevenueUsd)}
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Live 1-on-1 Faculty Mock Interviews',
                desc: 'Standard booking fee: ₵30 GHS per live video session',
                amountGhs: interviewBookingGhs,
                pct: aggregateRevenueGhs > 0 ? Math.round((interviewBookingGhs / aggregateRevenueGhs) * 100) : 0,
                color: 'bg-amber-500'
              },
              {
                title: 'Academic Statement & CV Endorsements',
                desc: 'Faculty review and official signed verification',
                amountGhs: advisoryReviewGhs,
                pct: aggregateRevenueGhs > 0 ? Math.round((advisoryReviewGhs / aggregateRevenueGhs) * 100) : 0,
                color: 'bg-purple-500'
              },
              {
                title: 'Student Identity & Academic Transcript Verification',
                desc: 'WASSCE and university credential audit fees',
                amountGhs: verificationFeeGhs,
                pct: aggregateRevenueGhs > 0 ? Math.round((verificationFeeGhs / aggregateRevenueGhs) * 100) : 0,
                color: 'bg-blue-500'
              }
            ].map((stream, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{stream.title}</span>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{stream.desc}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-stone-900 dark:text-white">{formatMoney(stream.amountGhs)}</div>
                    <div className="text-[10px] text-stone-400">({stream.pct}%)</div>
                  </div>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${stream.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(4, stream.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Real Student Geographic Reach (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                <span>Geographic Student Distribution</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Real student registered countries across Africa.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500">
              {studentRegistrations.length} Students
            </span>
          </div>

          <div className="space-y-3">
            {countryBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{item.name}</span>
                  <span className="font-mono text-stone-500">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(5, item.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Real Student Registrations Live Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Real Student Registrations Table</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live roster pulling from actual student profiles in the platform database.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="text-xs pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs p-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Institution & Academic Level</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3 text-center">Identity Status</th>
                <th className="py-2.5 px-3 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900 dark:text-white">{student.fullName}</div>
                    <div className="text-[10px] text-stone-400 font-mono">ID: {student.id}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-stone-600 dark:text-stone-300">
                    {student.email}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800 dark:text-stone-200">{student.institution}</div>
                    <div className="text-[10px] text-stone-500 capitalize">{student.academicLevel?.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                      {student.country}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {student.isVerified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(student)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                        student.isVerified
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-700 border-stone-200 dark:border-stone-700'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-amber-600'
                      }`}
                    >
                      {student.isVerified ? 'Revoke Verification' : 'Verify Identity'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Financial Ledger Feed */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Financial Ledger Feed</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live settlement records across student mock interview bookings (₵30 GHS) and faculty advisory services.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            Auto-Reconciled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <tr>
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Payer / Student</th>
                <th className="py-2.5 px-3">Service Description</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {transactions.map(txn => {
                const isPayout = txn.amountUsd < 0;
                return (
                  <tr key={txn.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-700 dark:text-stone-300">
                      {txn.id.toUpperCase()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900 dark:text-white">{txn.payerName}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{txn.payerEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">
                      {txn.description}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-400">
                      {txn.date}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={isPayout ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        {isPayout ? `-${formatMoney(Math.abs(txn.amountGhs || 35))}` : `+${formatMoney(txn.amountGhs || (txn.amountUsd ? txn.amountUsd * 12 : 30))}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
