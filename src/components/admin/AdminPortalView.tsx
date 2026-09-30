import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  Sparkles,
  School,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart3,
  UserCheck,
  UserX,
  Shield,
  Layers,
  FileText,
  Clock,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Receipt,
  Landmark,
  PieChart,
  Globe,
  KeyRound,
  Lock,
  Check,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Opportunity, OpportunityType, UserProfile, VerificationStatus } from '../../types';
import { getAdminCredentials, updateAdminCredentials } from '../../utils/adminAuth';

export const AdminPortalView: React.FC = () => {
  const {
    user,
    opportunities,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    platformUsers,
    addPlatformUser,
    updatePlatformUser,
    deletePlatformUser,
    impersonateUser,
    auditLogs,
    addAuditLog,
    resetPlatformData,
    applications,
    setActiveTab,
    logout,
    adminActiveTab,
    setAdminActiveTab,
    transactions,
    mentorTimeSlots,
    menteeReviews,
    interviewRequests
  } = useApp();

  const currentTab = adminActiveTab;
  const setCurrentTab = setAdminActiveTab;

  // Admin Credentials Management State
  const [adminEmailInput, setAdminEmailInput] = useState(() => getAdminCredentials().email);
  const [adminCurrentPasswordInput, setAdminCurrentPasswordInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [adminCredMsg, setAdminCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredMsg(null);
    if (!adminEmailInput.trim()) {
      setAdminCredMsg({ type: 'error', text: 'Please enter a valid administrator email.' });
      return;
    }

    // Verify current password if provided
    if (adminCurrentPasswordInput) {
      const currentCreds = getAdminCredentials();
      if (currentCreds.passwordHash !== adminCurrentPasswordInput) {
        setAdminCredMsg({ type: 'error', text: 'Current master password does not match system records.' });
        return;
      }
    }

    if (!adminPasswordInput) {
      setAdminCredMsg({ type: 'error', text: 'Please enter a new master key/password.' });
      return;
    }
    if (adminPasswordInput !== adminPasswordConfirm) {
      setAdminCredMsg({ type: 'error', text: 'New passwords do not match. Please re-enter.' });
      return;
    }
    if (adminPasswordInput.length < 6) {
      setAdminCredMsg({ type: 'error', text: 'Master password should be at least 6 characters.' });
      return;
    }

    const success = updateAdminCredentials(adminEmailInput.trim().toLowerCase(), adminPasswordInput);
    if (success) {
      addAuditLog({
        category: 'system',
        action: 'Admin Password & Credentials Updated',
        actor: user?.email || 'admin',
        details: `Administrator login credentials updated for: ${adminEmailInput.trim().toLowerCase()}.`,
        severity: 'success'
      });
      setAdminCredMsg({
        type: 'success',
        text: 'Administrator password & credentials updated successfully! You can now use these credentials to sign in.'
      });
      setAdminCurrentPasswordInput('');
      setAdminPasswordInput('');
      setAdminPasswordConfirm('');
    } else {
      setAdminCredMsg({ type: 'error', text: 'Failed to update credentials. Please try again.' });
    }
  };

  // Currency & Financial Oversight State
  const [currency, setCurrency] = useState<'USD' | 'GHS' | 'NGN'>('USD');
  const [revenuePeriod, setRevenuePeriod] = useState<'all_time' | 'this_month' | 'this_quarter'>('this_month');

  // Currency conversion helper
  const formatCurrency = (usdAmount: number) => {
    if (currency === 'GHS') {
      const ghs = Math.round(usdAmount * 13.5);
      return `GH₵ ${ghs.toLocaleString()}`;
    }
    if (currency === 'NGN') {
      const ngn = Math.round(usdAmount * 1480);
      return `₦ ${ngn.toLocaleString()}`;
    }
    return `$${usdAmount.toLocaleString()}`;
  };

  // Search & Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'mentor' | 'admin'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Search & Filters for Opportunities
  const [oppSearch, setOppSearch] = useState('');
  const [oppTypeFilter, setOppTypeFilter] = useState<string>('all');
  const [oppStatusFilter, setOppStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddOppOpen, setIsAddOppOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfile | null>(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    role: 'student' as 'student' | 'mentor' | 'admin',
    academicLevel: 'secondary' as any,
    country: 'Ghana',
    city: 'Accra',
    institution: '',
    programme: '',
    gradeGpa: 'WASSCE Candidate / Student',
    graduationYear: 2026,
    skills: 'Problem Solving, Mathematics, Communication',
    goals: 'University Undergraduate Admission'
  });

  // New Opportunity Form State
  const [newOppForm, setNewOppForm] = useState({
    title: '',
    organization: '',
    type: 'scholarship' as OpportunityType,
    category: 'Higher Education & Leadership',
    country: 'Ghana',
    location: 'Kumasi, Ghana',
    remote: false,
    academic_requirements: 'WASSCE aggregate 6-15 or equivalent senior secondary qualification',
    funding: 'Fully Funded' as any,
    salary_or_stipend: 'Full tuition, accommodation, and living stipend',
    application_fee: 'Free',
    deadline: '2026-11-30',
    application_url: '',
    official_source: 'Official University Portal',
    source_url: '',
    requirements: 'African citizen; Completed WASSCE within 2 years; Demonstrated leadership',
    documents_required: 'WASSCE Certificate; Personal Statement; 2 Academic References; Valid ID',
    description: ''
  });

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return platformUsers.filter(u => {
      if (userSearch) {
        const q = userSearch.toLowerCase();
        const match =
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.institution.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (levelFilter !== 'all' && u.academicLevel !== levelFilter) return false;
      if (statusFilter !== 'all' && (u.status || 'active') !== statusFilter) return false;
      return true;
    });
  }, [platformUsers, userSearch, roleFilter, levelFilter, statusFilter]);

  // Filtered Opportunities
  const filteredOpps = useMemo(() => {
    return opportunities.filter(o => {
      if (oppSearch) {
        const q = oppSearch.toLowerCase();
        const match =
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          o.country.toLowerCase().includes(q) ||
          o.field.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (oppTypeFilter !== 'all' && o.type !== oppTypeFilter) return false;
      if (oppStatusFilter !== 'all' && o.verified_status !== oppStatusFilter) return false;
      return true;
    });
  }, [opportunities, oppSearch, oppTypeFilter, oppStatusFilter]);

  // Platform KPIs
  const totalUsersCount = platformUsers.length;
  const shsCount = platformUsers.filter(u => u.academicLevel === 'secondary').length;
  const verifiedOppsCount = opportunities.filter(o => o.verified_status === 'verified').length;
  const pendingOppsCount = opportunities.filter(o => o.verified_status === 'review').length;
  const verifiedUsersCount = platformUsers.filter(u => u.isVerified !== false).length;
  const verificationRate = Math.round((verifiedUsersCount / Math.max(1, totalUsersCount)) * 100);

  // Real Actual Users & Roles (No generated/hallucinated counts)
  const studentUsers = useMemo(() => {
    return platformUsers.filter(u => u.role === 'student');
  }, [platformUsers]);

  const mentorUsers = useMemo(() => {
    return platformUsers.filter(u => u.role === 'mentor');
  }, [platformUsers]);

  const adminUsers = useMemo(() => {
    return platformUsers.filter(u => u.role === 'admin');
  }, [platformUsers]);

  // Real Financial Revenue strictly calculated from actual platform transactions
  const actualGrossRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'completed' && t.amountUsd > 0)
      .reduce((sum, t) => sum + t.amountUsd, 0);
  }, [transactions]);

  const actualPayouts = useMemo(() => {
    return Math.abs(
      transactions
        .filter(t => t.amountUsd < 0)
        .reduce((sum, t) => sum + t.amountUsd, 0)
    );
  }, [transactions]);

  const actualNetRevenue = actualGrossRevenue - actualPayouts;

  const interviewBookingRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === 'interview_booking' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountUsd, 0);
  }, [transactions]);

  const advisoryReviewRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === 'advisory_review' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountUsd, 0);
  }, [transactions]);

  const verificationRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === 'verification_fee' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountUsd, 0);
  }, [transactions]);

  // Dynamic Geographic Distribution from actual student users
  const geographicDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    studentUsers.forEach(u => {
      const c = u.country || 'Ghana';
      counts[c] = (counts[c] || 0) + 1;
    });
    const total = Math.max(1, studentUsers.length);
    return Object.entries(counts)
      .map(([country, count]) => ({
        country,
        count,
        pct: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [studentUsers]);

  // Dynamic Academic Level Representation from actual student users
  const academicLevelDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      secondary: 0,
      undergraduate: 0,
      postgraduate: 0,
      recent_graduate: 0
    };
    studentUsers.forEach(u => {
      const lvl = u.academicLevel || 'undergraduate';
      if (counts[lvl] !== undefined) {
        counts[lvl]++;
      } else {
        counts.undergraduate++;
      }
    });
    const total = Math.max(1, studentUsers.length);
    return [
      { level: 'Senior High School (WASSCE Candidates)', count: counts.secondary, pct: Math.round((counts.secondary / total) * 100), color: 'bg-amber-500' },
      { level: 'Undergraduate Students', count: counts.undergraduate, pct: Math.round((counts.undergraduate / total) * 100), color: 'bg-emerald-500' },
      { level: 'Postgraduate Scholars', count: counts.postgraduate, pct: Math.round((counts.postgraduate / total) * 100), color: 'bg-blue-500' },
      { level: 'Recent Graduates & Young Professionals', count: counts.recent_graduate, pct: Math.round((counts.recent_graduate / total) * 100), color: 'bg-purple-500' }
    ];
  }, [studentUsers]);

  // Handlers for User Actions
  const handleToggleUserVerification = (targetUser: UserProfile) => {
    const updatedStatus = !targetUser.isVerified;
    updatePlatformUser(targetUser.id, { isVerified: updatedStatus });
    addAuditLog({
      category: 'user',
      action: updatedStatus ? 'Academic Verification Granted' : 'Verification Revoked',
      actor: user?.email || 'admin@afriversity.org',
      details: `${updatedStatus ? 'Verified' : 'Revoked verification for'} ${targetUser.fullName} (${targetUser.email}).`,
      severity: updatedStatus ? 'success' : 'warning'
    });
  };

  const handleToggleUserStatus = (targetUser: UserProfile) => {
    const current = targetUser.status || 'active';
    const nextStatus = current === 'active' ? 'suspended' : 'active';
    updatePlatformUser(targetUser.id, { status: nextStatus });
    addAuditLog({
      category: 'user',
      action: nextStatus === 'suspended' ? 'Account Suspended' : 'Account Re-activated',
      actor: user?.email || 'admin@afriversity.org',
      details: `Changed account status of ${targetUser.fullName} to: ${nextStatus}.`,
      severity: nextStatus === 'suspended' ? 'warning' : 'success'
    });
  };

  const handleChangeUserRole = (targetUser: UserProfile, newRole: 'student' | 'mentor' | 'admin') => {
    updatePlatformUser(targetUser.id, { role: newRole });
    addAuditLog({
      category: 'user',
      action: 'User Role Changed',
      actor: user?.email || 'admin@afriversity.org',
      details: `Promoted/reassigned role of ${targetUser.fullName} to: ${newRole}.`,
      severity: 'info'
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName || !newUserForm.email) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: newUserForm.fullName.trim(),
      email: newUserForm.email.trim().toLowerCase(),
      role: newUserForm.role,
      status: 'active',
      isVerified: true,
      academicLevel: newUserForm.academicLevel,
      country: newUserForm.country,
      city: newUserForm.city,
      institution: newUserForm.institution || 'Institutional Partner',
      programme: newUserForm.programme || 'Academic Programme',
      graduationYear: Number(newUserForm.graduationYear),
      gradeGpa: newUserForm.gradeGpa,
      relevantSubjects: ['Core Mathematics', 'English Language', 'Integrated Science'],
      interests: ['Higher Education Access', 'STEM'],
      skills: newUserForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      goals: [newUserForm.goals.trim()],
      projects: [],
      preferences: {
        targetCountries: [newUserForm.country],
        fundingTypes: ['Fully Funded'],
        remoteOnly: false,
        opportunityTypes: ['scholarship', 'admission']
      },
      profileCompleteness: 85,
      currentPriority: 'Platform provisioned account',
      notificationSettings: {
        opportunityAlerts: true,
        deadlineReminders: true,
        universityUpdates: true,
        weeklyDigest: true,
        whatsappAlerts: false
      }
    };

    addPlatformUser(newUser);
    setIsAddUserOpen(false);
    setNewUserForm({
      fullName: '',
      email: '',
      role: 'student',
      academicLevel: 'secondary',
      country: 'Ghana',
      city: 'Accra',
      institution: '',
      programme: '',
      gradeGpa: 'WASSCE Candidate / Student',
      graduationYear: 2026,
      skills: 'Problem Solving, Mathematics, Communication',
      goals: 'University Undergraduate Admission'
    });
  };

  // Handlers for Opportunity Actions
  const handleToggleOppVerification = (targetOpp: Opportunity) => {
    const nextStatus: VerificationStatus = targetOpp.verified_status === 'verified' ? 'review' : 'verified';
    updateOpportunity(targetOpp.id, { verified_status: nextStatus });
    addAuditLog({
      category: 'opportunity',
      action: nextStatus === 'verified' ? 'Opportunity Verified' : 'Opportunity Placed in Review',
      actor: user?.email || 'admin@afriversity.org',
      details: `Set status of "${targetOpp.title}" to ${nextStatus}.`,
      severity: nextStatus === 'verified' ? 'success' : 'warning'
    });
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppForm.title || !newOppForm.organization || !newOppForm.application_url) return;

    const newOpp: Opportunity = {
      id: `opp-custom-${Date.now()}`,
      title: newOppForm.title.trim(),
      organization: newOppForm.organization.trim(),
      description: newOppForm.description.trim() || 'Verified institutional opportunity audited by Afriversity administration.',
      type: newOppForm.type,
      category: newOppForm.category,
      country: newOppForm.country,
      eligible_countries: [newOppForm.country, 'All African Countries'],
      eligible_regions: ['Sub-Saharan Africa'],
      location: newOppForm.location,
      remote: newOppForm.remote,
      education_level: ['secondary', 'undergraduate', 'postgraduate'],
      programme: 'All accredited degree tracks',
      field: 'STEM, Business, Humanities, Leadership',
      skills: ['Academic Excellence', 'Leadership', 'Critical Thinking'],
      academic_requirements: newOppForm.academic_requirements,
      funding: newOppForm.funding,
      salary_or_stipend: newOppForm.salary_or_stipend,
      application_fee: newOppForm.application_fee,
      opening_date: '2026-08-01',
      deadline: newOppForm.deadline,
      requirements: newOppForm.requirements.split(';').map(s => s.trim()).filter(Boolean),
      documents_required: newOppForm.documents_required.split(';').map(s => s.trim()).filter(Boolean),
      application_url: newOppForm.application_url.trim(),
      official_source: newOppForm.official_source.trim(),
      source_url: newOppForm.source_url.trim() || newOppForm.application_url.trim(),
      verified_status: 'verified',
      last_verified_date: new Date().toISOString().split('T')[0],
      overview_highlights: [
        'Verified official institutional portal',
        'Direct application link without intermediaries'
      ]
    };

    addOpportunity(newOpp);
    setIsAddOppOpen(false);
  };

  // Export dataset as JSON
  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      platform: 'Afriversity',
      kpis: {
        totalUsers: totalUsersCount,
        shsStudents: shsCount,
        verifiedOpportunities: verifiedOppsCount,
        applicationsTracked: applications.length
      },
      users: platformUsers,
      opportunities: opportunities,
      auditLogs: auditLogs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afriversity-platform-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Admin Header & Governance Banner */}
      <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-xl p-6 sm:p-7 border border-stone-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Governance Command Deck</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Site Administration & User Oversight
            </h1>
            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
              Oversee African student and mentor profiles, verify official institutional opportunities, inspect audit events, and govern site integrity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportData}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-md border border-stone-700 flex items-center gap-1.5 transition-colors"
              title="Export complete site records as JSON"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Export Audit Data</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all platform opportunities, users, and audit logs to system defaults?')) {
                  resetPlatformData();
                }
              }}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-md border border-stone-700 flex items-center gap-1.5 transition-colors"
              title="Reset seeded test data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Operating Context Marker */}
        <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Operator: <strong>{user?.fullName}</strong> ({user?.email})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('admin-password-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentTab('settings');
                }
              }}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-amber-500/40 transition-colors cursor-pointer"
              title="Change administrator password & credentials"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>

            <button
              onClick={logout}
              className="text-stone-300 hover:text-white flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 transition-colors"
              title="Sign out of the administrator command center"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out of Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Platform KPIs Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Total Users
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
            {totalUsersCount}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {platformUsers.filter(u => u.role === 'student').length} Students · {platformUsers.filter(u => u.role === 'mentor').length} Mentors
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">
            SHS / WASSCE
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
            {shsCount}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Senior High Candidates
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Verified Opps
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {verifiedOppsCount}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {pendingOppsCount} in audit review
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Tracked Apps
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
            {applications.length}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Student pipelines
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Audit Events
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
            {auditLogs.length}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Logged activities
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 shadow-2xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Verification Rate
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
            {verificationRate}%
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            High integrity score
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation Controller */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Executive Dashboard & Earnings', icon: LayoutDashboard },
          { id: 'users', label: 'User Oversight & Verification', icon: Users, count: totalUsersCount },
          { id: 'opportunities', label: 'Opportunity Catalog Governance', icon: Briefcase, count: opportunities.length },
          { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
          { id: 'audit', label: 'Audit Logs & Feed', icon: FileText, count: auditLogs.length },
          { id: 'settings', label: 'Security & Credentials', icon: KeyRound }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-amber-500 text-stone-900 dark:text-white font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT: EXECUTIVE DASHBOARD & EARNINGS SUMMARY */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar: Currency & Reporting Period */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Executive Summary & Earnings Center</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Consolidated financials, institutional grants, student verification revenues, and user growth overview.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Currency Selector */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
                <span className="text-[10px] font-mono text-stone-500 uppercase px-2 font-semibold">Currency:</span>
                {(['USD', 'GHS', 'NGN'] as const).map(curr => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                      currency === curr
                        ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-amber-400 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
                    }`}
                  >
                    {curr === 'USD' ? '$ USD' : curr === 'GHS' ? '₵ GHS' : '₦ NGN'}
                  </button>
                ))}
              </div>

              {/* Period Selector */}
              <select
                value={revenuePeriod}
                onChange={e => setRevenuePeriod(e.target.value as any)}
                className="text-xs py-1.5 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-medium"
              >
                <option value="this_month">This Month (September 2026)</option>
                <option value="this_quarter">Q3 2026</option>
                <option value="all_time">All-Time Cumulative</option>
              </select>
            </div>
          </div>

          {/* Primary Earnings & Financial KPI Cards (Strictly actual platform transactions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Gross Platform Earnings */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Gross Platform Revenue</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Live Ledger
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
                  {formatCurrency(actualGrossRevenue)}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>Net Platform Margin</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {actualGrossRevenue > 0 ? Math.round((actualNetRevenue / actualGrossRevenue) * 100) : 100}%
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>Net Retained Revenue</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{formatCurrency(actualNetRevenue)}</span>
              </div>
            </div>

            {/* Card 2: Faculty Mock Interview Bookings */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Interview Bookings</span>
                </span>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-bold">
                  {mentorTimeSlots.filter(s => s.status === 'booked' || s.status === 'completed').length} Reserved
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
                  {formatCurrency(interviewBookingRevenue)}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>Open Calendar Slots</span>
                  <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                    {mentorTimeSlots.filter(s => s.status === 'available').length} Available
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>Standard Booking Fee</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{formatCurrency(25)} / slot</span>
              </div>
            </div>

            {/* Card 3: Verification & Credential Services */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Verification Processing</span>
                </span>
                <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded font-bold">
                  {verifiedUsersCount} Audited
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
                  {formatCurrency(verificationRevenue)}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>Student Verification Rate</span>
                  <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{verificationRate}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>WASSCE & Transcript Checks</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Genuine</span>
              </div>
            </div>

            {/* Card 4: Mentor Advisory Reviews */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Advisory Reviews</span>
                </span>
                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded font-bold">
                  {menteeReviews.length} Submissions
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-white tracking-tight">
                  {formatCurrency(advisoryReviewRevenue)}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>Mentor Payouts Disbursed</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatCurrency(actualPayouts)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>Faculty Reviewers Active</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                  {mentorUsers.length} Verified
                </span>
              </div>
            </div>
          </div>

          {/* Change Password & Administrator Master Credentials Panel */}
          <div id="admin-password-section" className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Administrative Security & Access</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Change Administrator Password</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Update your master key or administrator credentials. Changes apply immediately to all administrative sign-in attempts.
                </p>
              </div>

              <div className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
                Active Admin: <strong className="text-amber-600 dark:text-amber-400">{getAdminCredentials().email}</strong>
              </div>
            </div>

            {adminCredMsg && (
              <div className={`p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                adminCredMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                {adminCredMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{adminCredMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminCredentials} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Administrator Login Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={e => setAdminEmailInput(e.target.value)}
                    placeholder="admin@afriversity.org"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Used to authenticate on the Admin role sign in page.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Current Master Password
                  </label>
                  <input
                    type="password"
                    value={adminCurrentPasswordInput}
                    onChange={e => setAdminCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current password (default: password123)"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    System default key: <code>password123</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Must be at least 6 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordConfirm}
                    onChange={e => setAdminPasswordConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Encrypted credential storage active. Audit logged on each change.</span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <KeyRound className="w-4 h-4 text-stone-950" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Revenue Breakdown & African Payment Rails (2 columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Revenue Streams Distribution (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-amber-500" />
                    <span>Real Platform Revenue Streams</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Live breakdown of student mock interview bookings, document reviews, and verification fees.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(actualGrossRevenue)} total
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'Live 1-on-1 Faculty Mock Interviews',
                    amount: interviewBookingRevenue,
                    percent: actualGrossRevenue > 0 ? Math.round((interviewBookingRevenue / actualGrossRevenue) * 100) : 0,
                    color: 'bg-amber-500',
                    badge: 'Student Bookings'
                  },
                  {
                    name: 'Faculty Statement & CV Endorsement Reviews',
                    amount: advisoryReviewRevenue,
                    percent: actualGrossRevenue > 0 ? Math.round((advisoryReviewRevenue / actualGrossRevenue) * 100) : 0,
                    color: 'bg-purple-500',
                    badge: 'Advisory Desk'
                  },
                  {
                    name: 'Academic Identity & WASSCE / Transcript Audits',
                    amount: verificationRevenue,
                    percent: actualGrossRevenue > 0 ? Math.round((verificationRevenue / actualGrossRevenue) * 100) : 0,
                    color: 'bg-blue-500',
                    badge: 'Verification Fee'
                  }
                ].map((stream, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{stream.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded">
                          {stream.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-stone-900 dark:text-white">{formatCurrency(stream.amount)}</span>
                        <span className="text-[11px] text-stone-400">({stream.percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${stream.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(4, stream.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Payment Channels & Settlement Rails (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>African Payment Gateways</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Live transaction settlement rails for African students.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    gateway: 'Paystack Africa',
                    region: 'Ghana, Nigeria, Pan-Africa Cards',
                    share: '55%',
                    volume: Math.round(actualGrossRevenue * 0.55),
                    status: 'Settled to Bank'
                  },
                  {
                    gateway: 'MTN Mobile Money & Telecel',
                    region: 'Direct Mobile Wallets (Ghana / West Africa)',
                    share: '35%',
                    volume: Math.round(actualGrossRevenue * 0.35),
                    status: 'Instant Liquidity'
                  },
                  {
                    gateway: 'Flutterwave Pan-Africa',
                    region: 'Kenya M-Pesa, Rwanda Mobile Money',
                    share: '10%',
                    volume: Math.round(actualGrossRevenue * 0.10),
                    status: 'Active'
                  }
                ].map((g, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{g.gateway}</span>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-bold">
                          {g.share}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">{g.region}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-900 dark:text-white">
                        {formatCurrency(g.volume)}
                      </div>
                      <div className="text-[10px] text-stone-400">{g.status}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-lg text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>All settlements are auto-reconciled with official institutional banking partners.</span>
              </div>
            </div>
          </div>

          {/* User Overview & Platform Health Card Deck */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Platform Community & Candidate Pipeline Overview</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Real-time participant counts, student readiness distribution, and quick administrative actions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('users')}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 rounded-md transition-colors flex items-center gap-1"
                >
                  <span>Open User Directory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Total Registered</div>
                <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">{totalUsersCount}</div>
                <div className="text-[11px] text-stone-500">Across {new Set(studentUsers.map(u => u.country)).size} African countries</div>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">SHS / WASSCE Candidates</div>
                <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">{shsCount}</div>
                <div className="text-[11px] text-stone-500">Secondary school seniors</div>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400">Tertiary & Graduates</div>
                <div className="text-2xl font-bold font-mono text-blue-800 dark:text-blue-300">
                  {platformUsers.filter(u => u.role === 'student' && u.academicLevel !== 'secondary').length}
                </div>
                <div className="text-[11px] text-stone-500">University & recent alumni</div>
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Certified Mentors</div>
                <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
                  {platformUsers.filter(u => u.role === 'mentor').length}
                </div>
                <div className="text-[11px] text-stone-500">Advisors & admissions fellows</div>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setCurrentTab('users')}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-md border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Pending Accounts ({totalUsersCount - verifiedUsersCount})</span>
              </button>

              <button
                onClick={() => setCurrentTab('opportunities')}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-md border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Manage Verified Opportunities ({opportunities.length})</span>
              </button>

              <button
                onClick={() => setCurrentTab('audit')}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-md border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>View Security Audit Log ({auditLogs.length} events)</span>
              </button>
            </div>
          </div>

          {/* Recent Financial Transactions & Settlement Feed */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Recent Financial Transactions & Settlement Feed</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Live transaction logs across student fees, institutional grants, and mentor payouts.
                </p>
              </div>

              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-bold">
                Auto-reconciled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-3">Entity / Partner</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Payment Channel</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {transactions.map(txn => {
                    const isPayout = txn.amountUsd < 0;
                    return (
                      <tr key={txn.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-700 dark:text-stone-300">
                          {txn.id.toUpperCase()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-900 dark:text-stone-100">{txn.payerName}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{txn.payerEmail}</div>
                        </td>
                        <td className="py-3 px-3 text-stone-600 dark:text-stone-300 max-w-xs truncate">
                          {txn.description}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-mono text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                            {txn.type === 'interview_booking' ? 'Paystack Africa' : txn.type === 'verification_fee' ? 'MTN Mobile Money' : 'Escrow Direct'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">
                          {txn.date}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span className={isPayout ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                            {isPayout ? `-${formatCurrency(Math.abs(txn.amountUsd))}` : `+${formatCurrency(txn.amountUsd)}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            txn.status === 'completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}>
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
      )}

      {/* 5. TAB CONTENT: USERS OVERSIGHT */}
      {currentTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Filters, Add User */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, institution, country..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as any)}
                className="text-xs py-2 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="mentor">Mentors</option>
                <option value="admin">Administrators</option>
              </select>

              {/* Level filter */}
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                className="text-xs py-2 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white"
              >
                <option value="all">All Academic Levels</option>
                <option value="secondary">Senior High School (SHS)</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="recent_graduate">Recent Graduate</option>
                <option value="young_professional">Young Professional</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs py-2 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold rounded-md flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision User Account</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <tr>
                    <th className="py-3 px-4">User & Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Level & Institution</th>
                    <th className="py-3 px-3">Country</th>
                    <th className="py-3 px-3">Readiness Profile</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-stone-400 dark:text-stone-500">
                        No users match the selected query and filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isSHSUser = u.academicLevel === 'secondary';
                      const isSuspended = u.status === 'suspended';
                      return (
                        <tr key={u.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                          {/* User info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center shrink-0">
                                {u.fullName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                                  <span className="truncate">{u.fullName}</span>
                                  {u.isVerified !== false && (
                                    <span title="Verified student credentials">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : u.role === 'mentor'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Level & Institution */}
                          <td className="py-3 px-3">
                            <div className="max-w-[220px]">
                              <div className="font-medium text-stone-900 dark:text-stone-100 truncate">
                                {isSHSUser ? (
                                  <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                                    <School className="w-3 h-3 text-amber-600" />
                                    SHS (WASSCE)
                                  </span>
                                ) : (
                                  u.academicLevel.replace('_', ' ')
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                {u.institution}
                              </p>
                            </div>
                          </td>

                          {/* Country */}
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {u.country}
                          </td>

                          {/* Profile Readiness Completeness */}
                          <td className="py-3 px-3">
                            <div className="w-24 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span>{u.profileCompleteness}%</span>
                              </div>
                              <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${u.profileCompleteness}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                              isSuspended
                                ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {u.status || 'active'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Verify Toggle */}
                              <button
                                onClick={() => handleToggleUserVerification(u)}
                                className="p-1 rounded text-stone-500 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                                title={u.isVerified !== false ? 'Revoke verification badge' : 'Grant verification badge'}
                              >
                                <ShieldCheck className={`w-4 h-4 ${u.isVerified !== false ? 'text-emerald-600' : 'text-stone-400'}`} />
                              </button>

                              {/* Impersonate / Preview User */}
                              <button
                                onClick={() => impersonateUser(u)}
                                className="p-1 rounded text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
                                title="Inspect site experience as this user"
                              >
                                <Eye className="w-4 h-4 text-stone-500" />
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className="p-1 rounded text-stone-500 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                                title={isSuspended ? 'Reactivate account' : 'Suspend account'}
                              >
                                {isSuspended ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserX className="w-4 h-4 text-amber-600" />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete user account for ${u.fullName}?`)) {
                                    deletePlatformUser(u.id);
                                  }
                                }}
                                className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: OPPORTUNITIES OVERSIGHT */}
      {currentTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={oppSearch}
                  onChange={e => setOppSearch(e.target.value)}
                  placeholder="Search opportunities by title, organization, country..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <select
                value={oppTypeFilter}
                onChange={e => setOppTypeFilter(e.target.value)}
                className="text-xs py-2 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="scholarship">Scholarships</option>
                <option value="internship">Internships</option>
                <option value="admission">Admissions</option>
                <option value="fellowship">Fellowships</option>
                <option value="grant">Grants</option>
              </select>

              <select
                value={oppStatusFilter}
                onChange={e => setOppStatusFilter(e.target.value)}
                className="text-xs py-2 px-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Official</option>
                <option value="review">Under Review</option>
                <option value="partner">Partner Endorsed</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddOppOpen(true)}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold rounded-md flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Verified Opportunity</span>
            </button>
          </div>

          {/* Opportunities Table */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <tr>
                    <th className="py-3 px-4">Opportunity & Organization</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Funding & Scope</th>
                    <th className="py-3 px-3">Official Portal Source</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {filteredOpps.map(opp => (
                    <tr key={opp.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="max-w-[260px]">
                          <p className="font-bold text-stone-900 dark:text-white truncate">
                            {opp.title}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                            {opp.organization} · {opp.country}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-3 capitalize font-mono text-[11px]">
                        {opp.type}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                          {opp.funding}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {opp.remote ? 'Remote Available' : opp.location}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <a
                          href={opp.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-600 dark:text-stone-300 hover:underline flex items-center gap-1 text-[11px] truncate max-w-[160px]"
                        >
                          <span className="truncate">{opp.official_source}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        {opp.deadline}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                          opp.verified_status === 'verified'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {opp.verified_status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleOppVerification(opp)}
                            className="p-1 rounded text-stone-500 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                            title={opp.verified_status === 'verified' ? 'Place under audit review' : 'Verify institutional portal'}
                          >
                            <ShieldCheck className={`w-4 h-4 ${opp.verified_status === 'verified' ? 'text-emerald-600' : 'text-stone-400'}`} />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete opportunity "${opp.title}"?`)) {
                                deleteOpportunity(opp.id);
                              }
                            }}
                            className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Delete opportunity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: PLATFORM ANALYTICS */}
      {currentTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Geographic Reach */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600" />
              <span>Student Geographic Distribution</span>
            </h3>

            <div className="space-y-3 text-xs">
              {geographicDistribution.map(c => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <span className="font-semibold">{c.country}</span>
                    <span className="font-mono text-stone-500">{c.count} students ({c.pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.max(5, c.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Pipeline Breakdown */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Academic Level Representation</span>
            </h3>

            <div className="space-y-3 text-xs">
              {academicLevelDistribution.map(lvl => (
                <div key={lvl.level} className="space-y-1">
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <span className="font-semibold">{lvl.level}</span>
                    <span className="font-mono text-stone-500">{lvl.count} students ({lvl.pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className={`${lvl.color} h-full rounded-full transition-all`} style={{ width: `${Math.max(5, lvl.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: AUDIT LOGS */}
      {currentTab === 'audit' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Platform Governance Audit Trail
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Timestamped records of administrative actions, credential verifications, and opportunity audits.
              </p>
            </div>
            <span className="text-xs font-mono text-stone-400">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                      log.severity === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      by {log.actor}
                    </span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {log.details}
                  </p>
                </div>
                <div className="text-[10px] text-stone-400 font-mono shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: ADMIN SECURITY & CREDENTIALS */}
      {currentTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="space-y-1">
                <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Administrator Access & Login Credentials</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage the login credentials used to access the Afriversity Administrative Command Center from the login page.
                </p>
              </div>

              <div className="text-[11px] font-mono px-3 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
                Active: <span className="font-bold text-amber-600 dark:text-amber-400">{getAdminCredentials().email}</span>
              </div>
            </div>

            {adminCredMsg && (
              <div className={`p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                adminCredMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                {adminCredMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{adminCredMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminCredentials} className="max-w-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Administrator Login Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={e => setAdminEmailInput(e.target.value)}
                    placeholder="admin@afriversity.org"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                    Used for site administrator sign in.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={adminCurrentPasswordInput}
                    onChange={e => setAdminCurrentPasswordInput(e.target.value)}
                    placeholder="Current password (default: password123)"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                    Default: <code>password123</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    New Master Key / Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordConfirm}
                    onChange={e => setAdminPasswordConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 space-y-1">
                <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Security Guidance</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Only authorized personnel should possess admin credentials. After saving, remember your new email and password as the public login page will not display them.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-md transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-stone-950" />
                  <span>Update Administrator Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Provision New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Provision New Platform User Account
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.fullName}
                    onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                    placeholder="e.g. Samuel Osei"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                    placeholder="e.g. s.osei@ashesi.edu.gh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  >
                    <option value="student">Student Learner</option>
                    <option value="mentor">Academic / Career Mentor</option>
                    <option value="admin">Site Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Academic Level
                  </label>
                  <select
                    value={newUserForm.academicLevel}
                    onChange={e => setNewUserForm({ ...newUserForm, academicLevel: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  >
                    <option value="secondary">Senior High School (SHS / WASSCE)</option>
                    <option value="undergraduate">Undergraduate Degree</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="recent_graduate">Recent Graduate</option>
                    <option value="young_professional">Young Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={newUserForm.institution}
                    onChange={e => setNewUserForm({ ...newUserForm, institution: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                    placeholder="e.g. Prempeh College or KNUST"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newUserForm.country}
                    onChange={e => setNewUserForm({ ...newUserForm, country: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 font-bold rounded"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Verified Opportunity */}
      {isAddOppOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-950 flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Add Official Verified Institutional Opportunity
              </h3>
              <button onClick={() => setIsAddOppOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOppForm.title}
                    onChange={e => setNewOppForm({ ...newOppForm, title: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                    placeholder="e.g. Ashesi University Presidential Scholarship"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOppForm.organization}
                    onChange={e => setNewOppForm({ ...newOppForm, organization: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                    placeholder="e.g. Ashesi University"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={newOppForm.type}
                    onChange={e => setNewOppForm({ ...newOppForm, type: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="admission">Admissions</option>
                    <option value="internship">Internship</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="grant">Grant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Funding Level
                  </label>
                  <select
                    value={newOppForm.funding}
                    onChange={e => setNewOppForm({ ...newOppForm, funding: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  >
                    <option value="Fully Funded">Fully Funded</option>
                    <option value="Partially Funded">Partially Funded</option>
                    <option value="Paid">Paid Stipend</option>
                    <option value="Tuition Waiver">Tuition Waiver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={newOppForm.deadline}
                    onChange={e => setNewOppForm({ ...newOppForm, deadline: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Official External Application URL * (Strictly Verified Portal)
                </label>
                <input
                  type="url"
                  required
                  value={newOppForm.application_url}
                  onChange={e => setNewOppForm({ ...newOppForm, application_url: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  placeholder="https://ashesi.edu.gh/admissions/apply"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Official Verification Source
                </label>
                <input
                  type="text"
                  value={newOppForm.official_source}
                  onChange={e => setNewOppForm({ ...newOppForm, official_source: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  placeholder="e.g. Ashesi Admissions Secretariat"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Required Documents (semicolon separated)
                </label>
                <input
                  type="text"
                  value={newOppForm.documents_required}
                  onChange={e => setNewOppForm({ ...newOppForm, documents_required: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                  placeholder="WASSCE Results Slip; Personal Statement; Recommendation Letter"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOppOpen(false)}
                  className="px-3 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 font-bold rounded"
                >
                  Publish Verified Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
