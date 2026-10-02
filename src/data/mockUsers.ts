import { UserProfile } from '../types';

export const INITIAL_PLATFORM_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    fullName: 'Chief Site Administrator',
    email: 'admin@afriversity.org',
    role: 'admin',
    status: 'active',
    isVerified: true,
    country: 'Ghana',
    city: 'Accra',
    academicLevel: 'young_professional',
    institution: 'Afriversity Governance Secretariat',
    programme: 'Platform Operations & Institutional Partnerships',
    graduationYear: 2022,
    gradeGpa: 'Distinction',
    relevantSubjects: ['Education Technology', 'Public Policy', 'Data Systems'],
    interests: ['University Partnerships', 'Higher Education Access', 'Scholarship Verification'],
    skills: ['Platform Governance', 'Audit Oversight', 'Data Verification', 'Community Building'],
    goals: ['Verify 500+ Official African Institutional Opportunities', 'Support 10,000 African Students'],
    projects: [],
    preferences: {
      targetCountries: ['Ghana', 'Nigeria', 'Kenya', 'Rwanda'],
      fundingTypes: ['Fully Funded'],
      remoteOnly: false,
      opportunityTypes: ['scholarship', 'admission', 'internship']
    },
    profileCompleteness: 100,
    currentPriority: 'Oversee student verification queue and official opportunity audits',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: true
    }
  },
  {
    id: 'usr-shs-general-arts',
    fullName: 'Ama Serwaa Osei',
    email: 'ama.osei@achimota.edu.gh',
    role: 'student',
    status: 'active',
    isVerified: true,
    country: 'Ghana',
    city: 'Accra',
    academicLevel: 'secondary',
    institution: 'Achimota Senior High School',
    programme: 'General Arts (Literature in English, Government, History, Economics, French)',
    graduationYear: 2026,
    gradeGpa: 'WASSCE Candidate / Grade A Standing (Aggregate 07)',
    relevantSubjects: [
      'Literature in English',
      'Government',
      'History',
      'Economics',
      'French',
      'Core Mathematics',
      'English Language',
      'Social Studies'
    ],
    interests: [
      'Constitutional Law',
      'African Literature',
      'Governance & Public Policy',
      'Debating',
      'Creative Writing'
    ],
    skills: [
      'Critical Thinking',
      'Analytical Essay Writing',
      'Debating & Public Speaking',
      'Literary Criticism',
      'Historical Research',
      'French Communication'
    ],
    goals: [
      'Mastercard Foundation Scholarship in Arts at Ashesi',
      'African Leadership Academy Pre-University Diploma',
      'Direct Admission into University of Ghana Faculty of Law & College of Humanities',
      'African Union Youth Governance Essay Fellowship'
    ],
    projects: [
      {
        id: 'p-arts-1',
        title: 'Achimota Model African Union & Mock Parliament',
        role: 'President & Chief Delegate',
        description: 'Drafted resolution on intra-African youth trade and human rights protections; awarded Best High School Delegate.'
      },
      {
        id: 'p-arts-2',
        title: 'Inter-Collegiate Literary Critique & Essay Digest',
        role: 'Chief Editor',
        description: 'Published comparative essays analyzing Chinua Achebe and Ama Ata Aidoo literature across 3 secondary schools.'
      }
    ],
    preferences: {
      targetCountries: ['Ghana', 'South Africa', 'United Kingdom', 'Pan-Africa'],
      fundingTypes: ['Fully Funded', 'Tuition Waiver'],
      remoteOnly: false,
      opportunityTypes: ['scholarship', 'admission', 'fellowship', 'competition']
    },
    profileCompleteness: 95,
    currentPriority: 'Prepare for WASSCE General Arts electives and finalize leadership statement for Ashesi Arts Scholarship & ALA Diploma',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: false
    }
  },
  {
    id: 'usr-ug-dance-drama',
    fullName: 'Kofi Mensah Boateng',
    email: 'kofi.mensah@st.ug.edu.gh',
    role: 'student',
    status: 'active',
    isVerified: true,
    country: 'Ghana',
    city: 'Accra',
    academicLevel: 'undergraduate',
    institution: 'University of Ghana (School of Performing Arts, Legon)',
    programme: 'BFA Dance and Drama (Theatre Arts & Choreography)',
    graduationYear: 2027,
    gradeGpa: '3.78 / 4.0 (First Class Honours)',
    relevantSubjects: [
      'African Dance Forms & Rhythms',
      'Dramatic Script Analysis',
      'Choreography & Movement',
      'Stage Acting & Directing',
      'Theatre for Development',
      'Voice & Speech',
      'Contemporary Physical Theatre'
    ],
    interests: [
      'African Contemporary Dance',
      'Physical Theatre',
      'Stage Acting',
      'Film & Drama Production',
      'Choreographic Composition',
      'Cultural Heritage'
    ],
    skills: [
      'Traditional African Dance',
      'Stage Acting',
      'Voice Projection & Diction',
      'Choreographic Composition',
      'Physical Theatre',
      'Script Interpretation',
      'Movement Improvisation'
    ],
    goals: [
      'National Theatre of Ghana Resident Performing Artists Fellowship',
      'MultiChoice Talent Factory West Africa Film & Drama Academy',
      'UNESCO African Cultural Heritage Performing Arts Residency Grant',
      'Juilliard Global African Performing Arts Fellowship'
    ],
    projects: [
      {
        id: 'p-dance-1',
        title: 'Ananse & The River of Masks (Original Dance-Drama)',
        role: 'Lead Actor & Co-Choreographer',
        description: 'Performed in the Legon Drama Studio for an audience of 600 patrons; fused traditional Ga rhythms with contemporary drama.'
      },
      {
        id: 'p-dance-2',
        title: 'Community Theatre for Development (TFD) Health Campaign',
        role: 'Drama Director',
        description: 'Produced educational street theatre performances in rural Central Region communities on preventive maternal healthcare.'
      }
    ],
    preferences: {
      targetCountries: ['Ghana', 'Nigeria', 'Senegal', 'United States', 'Pan-Africa'],
      fundingTypes: ['Fully Funded', 'Paid'],
      remoteOnly: false,
      opportunityTypes: ['fellowship', 'grant', 'training', 'internship']
    },
    profileCompleteness: 95,
    currentPriority: 'Finalize 2-minute theatrical monologue audition reel and submit application packet to National Theatre Resident Troupe & MTF Drama Academy',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: true
    }
  },
  {
    id: 'usr-shs-1',
    fullName: 'Victoria Mensah',
    email: 'victoria.mensah@gmail.com',
    role: 'student',
    status: 'active',
    isVerified: true,
    country: 'Ghana',
    city: 'Kumasi',
    academicLevel: 'secondary',
    institution: 'Wesley Girls’ High School',
    programme: 'General Science (Physics, Chemistry, Elective Math, Biology)',
    graduationYear: 2026,
    gradeGpa: 'WASSCE Candidate / Grade A Standing',
    relevantSubjects: ['Core Mathematics', 'Integrated Science', 'English Language', 'Elective Mathematics', 'Physics'],
    interests: ['Biomedical Engineering', 'Mastercard Foundation Scholars Program', 'University Admissions'],
    skills: ['Problem Solving', 'Mathematics', 'Biology Lab Techniques', 'Peer Tutoring'],
    goals: ['Mastercard Foundation Scholars Program at KNUST', 'Undergraduate Admission 2026/2027'],
    projects: [
      {
        id: 'p-1',
        title: 'Community Science Day Water Testing Project',
        description: 'Led a team of 4 secondary school students testing borehole water alkalinity in Cape Coast villages.'
      }
    ],
    preferences: {
      targetCountries: ['Ghana', 'Rwanda'],
      fundingTypes: ['Fully Funded'],
      remoteOnly: false,
      opportunityTypes: ['scholarship', 'admission', 'training']
    },
    profileCompleteness: 85,
    currentPriority: 'Complete WASSCE certificate verification and draft transformative leadership statement',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: false
    }
  },
  {
    id: 'usr-student-2',
    fullName: 'Kwame Asante',
    email: 'kwame.asante@st.knust.edu.gh',
    role: 'student',
    status: 'active',
    isVerified: true,
    country: 'Ghana',
    city: 'Kumasi',
    academicLevel: 'undergraduate',
    institution: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    programme: 'BSc Computer Engineering',
    graduationYear: 2027,
    gradeGpa: '3.82 / 4.0 (First Class Honours)',
    relevantSubjects: ['Data Structures & Algorithms', 'Operating Systems', 'Embedded Systems', 'Signals & Systems'],
    interests: ['Software Engineering', 'Cloud Infrastructure', 'Google Africa Internship'],
    skills: ['Python', 'C++', 'React', 'Linux', 'Git', 'Data Structures'],
    goals: ['Google Africa SWE Summer Internship', 'MTN Pulse Digital Apprenticeship'],
    projects: [
      {
        id: 'p-2',
        title: 'Campus Shuttle Live Tracking System',
        description: 'Real-time GPS tracker with React frontend and Node.js backend serving 1,200 KNUST students.'
      }
    ],
    preferences: {
      targetCountries: ['Ghana', 'Nigeria', 'Pan-Africa'],
      fundingTypes: ['Fully Funded', 'Paid'],
      remoteOnly: false,
      opportunityTypes: ['internship', 'fellowship']
    },
    profileCompleteness: 90,
    currentPriority: 'Tailor technical CV using Google X-Y-Z formula and complete mock interview',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: true
    }
  },
  {
    id: 'usr-student-3',
    fullName: 'Amina Bello',
    email: 'amina.bello@unilag.edu.ng',
    role: 'student',
    status: 'pending',
    isVerified: false,
    country: 'Nigeria',
    city: 'Lagos',
    academicLevel: 'undergraduate',
    institution: 'University of Lagos (UNILAG)',
    programme: 'BSc Electrical & Electronics Engineering',
    graduationYear: 2026,
    gradeGpa: '4.65 / 5.0 (First Class)',
    relevantSubjects: ['Control Engineering', 'Machine Learning', 'Power Electronics', 'Digital Signal Processing'],
    interests: ['Renewable Energy', 'Scholarships Abroad', 'Tech Fellowships'],
    skills: ['MATLAB', 'Python', 'AutoCAD', 'Circuit Design', 'Technical Writing'],
    goals: ['Rhodes Scholarship for West Africa', 'Commonwealth Masters Scholarship'],
    projects: [],
    preferences: {
      targetCountries: ['Nigeria', 'United Kingdom', 'United States'],
      fundingTypes: ['Fully Funded'],
      remoteOnly: false,
      opportunityTypes: ['scholarship', 'fellowship']
    },
    profileCompleteness: 75,
    currentPriority: 'Upload certified academic transcript for referee endorsement',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: false
    }
  },
  {
    id: 'usr-mentor-1',
    fullName: 'Dr. Joseph Boateng',
    email: 'j.boateng@ashesi.edu.gh',
    role: 'mentor',
    status: 'active',
    isVerified: true,
    country: 'Ghana',
    city: 'Berekuso',
    academicLevel: 'young_professional',
    institution: 'Ashesi University Faculty of Engineering',
    programme: 'Senior Lecturer & Admissions Committee Advisor',
    graduationYear: 2016,
    gradeGpa: 'PhD Computer Science (Cambridge)',
    relevantSubjects: ['Algorithms', 'Software Engineering', 'Admissions Review'],
    interests: ['Undergraduate Research Mentorship', 'Postgraduate Scholarship Preparation'],
    skills: ['Application Review', 'STAR Interview Coaching', 'Recommendation Writing', 'Academic Advising'],
    goals: ['Advise 50+ African Scholars into Top Tier Global Fellowships'],
    projects: [],
    preferences: {
      targetCountries: ['Ghana', 'Nigeria', 'Kenya'],
      fundingTypes: ['Fully Funded'],
      remoteOnly: true,
      opportunityTypes: ['scholarship', 'fellowship']
    },
    profileCompleteness: 100,
    currentPriority: 'Review mentee draft personal statements in review queue',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: true
    }
  },
  {
    id: 'usr-student-4',
    fullName: 'Emmanuel Kiprono',
    email: 'e.kiprono@uonbi.ac.ke',
    role: 'student',
    status: 'active',
    isVerified: true,
    country: 'Kenya',
    city: 'Nairobi',
    academicLevel: 'recent_graduate',
    institution: 'University of Nairobi',
    programme: 'BSc Agricultural Economics & Data Science',
    graduationYear: 2025,
    gradeGpa: 'Upper Second Class Honours',
    relevantSubjects: ['Econometrics', 'Statistical Computing', 'Agri-Fintech'],
    interests: ['Agri-Tech', 'Mastercard Foundation Scholars', 'Early Career Grants'],
    skills: ['R', 'Python', 'Data Analysis', 'Survey Design', 'Financial Modeling'],
    goals: ['African Development Bank Young Professionals Program'],
    projects: [],
    preferences: {
      targetCountries: ['Kenya', 'Rwanda', 'Ghana'],
      fundingTypes: ['Fully Funded', 'Paid'],
      remoteOnly: false,
      opportunityTypes: ['job', 'fellowship', 'grant']
    },
    profileCompleteness: 80,
    currentPriority: 'Request professional reference letter from former supervisor',
    notificationSettings: {
      opportunityAlerts: true,
      deadlineReminders: true,
      universityUpdates: true,
      weeklyDigest: true,
      whatsappAlerts: false
    }
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-1',
    timestamp: 'Today, 09:42 AM',
    category: 'user' as const,
    action: 'Student Account Verified',
    actor: 'admin@afriversity.org',
    details: 'Verified academic credentials and WASSCE results for Victoria Mensah (Wesley Girls High School).',
    severity: 'success' as const
  },
  {
    id: 'audit-2',
    timestamp: 'Today, 08:15 AM',
    category: 'opportunity' as const,
    action: 'Opportunity Verified',
    actor: 'admin@afriversity.org',
    details: 'Verified official institutional application portal for Mastercard Foundation Scholars at KNUST.',
    severity: 'success' as const
  },
  {
    id: 'audit-3',
    timestamp: 'Yesterday, 16:30 PM',
    category: 'interview' as const,
    action: 'Mock Interview Session Completed',
    actor: 'kwame.asante@st.knust.edu.gh',
    details: 'Completed Behavioral Mock Interview for Google SWE Intern Africa (Score: 84%, Pacing: 142 WPM).',
    severity: 'info' as const
  },
  {
    id: 'audit-4',
    timestamp: 'Yesterday, 14:10 PM',
    category: 'application' as const,
    action: 'Portal Redirection Logged',
    actor: 'kwame.asante@st.knust.edu.gh',
    details: 'User redirected to official portal: careers.google.com for SWE Summer Internship 2027.',
    severity: 'info' as const
  },
  {
    id: 'audit-5',
    timestamp: '2 days ago',
    category: 'system' as const,
    action: 'Nightly Verification Sync',
    actor: 'System Daemon',
    details: 'All 8 verified institutional URLs scanned. 100% active HTTP 200 responses verified.',
    severity: 'info' as const
  }
];
