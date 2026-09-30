import { University } from '../types';

export const VERIFIED_UNIVERSITIES: University[] = [
  {
    id: 'uni-knust',
    name: 'Kwame Nkrumah University of Science and Technology',
    shortName: 'KNUST',
    country: 'Ghana',
    city: 'Kumasi',
    overview: 'Ghana’s premier science and technology university, established in 1951 by Osagyefo Dr. Kwame Nkrumah. Renowned globally for Engineering, Pharmacy, Renewable Energy, Computer Science, and Built Environment.',
    rankingText: '#1 in Ghana · Top 15 in Sub-Saharan Africa (THE Impact Rankings)',
    verifiedStatus: 'verified',
    officialWebsite: 'https://www.knust.edu.gh/',
    admissionsPortalUrl: 'https://apps.knust.edu.gh/admissions/',
    campusType: 'Public',
    establishedYear: 1951,
    featuredProgrammes: [
      {
        id: 'prog-knust-ce',
        name: 'BSc Computer Engineering',
        degreeLevel: 'Undergraduate',
        faculty: 'College of Engineering',
        duration: '4 Years',
        tuitionEstimate: 'GHS 2,850 / year (Regular Ghanaian) · $4,500 / year (International)',
        admissionRequirements: ['WASSCE Core: English (A1-C6), Core Math (A1-C6), Integrated Science (A1-C6)', 'Electives: Elective Mathematics (A1-B3), Physics (A1-B3), Chemistry or Applied Electricity'],
        applicationDeadline: '2026-11-30',
        officialProgrammeUrl: 'https://coe.knust.edu.gh/academics/departments/computer-engineering'
      },
      {
        id: 'prog-knust-cs',
        name: 'BSc Computer Science',
        degreeLevel: 'Undergraduate',
        faculty: 'College of Science',
        duration: '4 Years',
        tuitionEstimate: 'GHS 2,420 / year (Regular Ghanaian) · $3,800 / year (International)',
        admissionRequirements: ['WASSCE Aggregate 6 to 12', 'Elective Maths, Physics, Chemistry'],
        applicationDeadline: '2026-11-30',
        officialProgrammeUrl: 'https://cos.knust.edu.gh/programmes/computer-science'
      },
      {
        id: 'prog-knust-mphil-ce',
        name: 'MPhil Computer Engineering',
        degreeLevel: 'Postgraduate',
        faculty: 'School of Graduate Studies',
        duration: '2 Years (Research)',
        tuitionEstimate: 'GHS 8,900 / year (Ghanaian) · $5,500 / year (International)',
        admissionRequirements: ['First Class or Second Class Upper Honours in Computer/Electrical Engineering or CS', 'Formal research proposal', '2 Academic References'],
        applicationDeadline: '2026-11-30',
        officialProgrammeUrl: 'https://apps.knust.edu.gh/admissions/postgraduate'
      }
    ],
    availableScholarships: [
      'Mastercard Foundation Scholars Program (Full Ride)',
      'KNUST Bursary Fund (Need-based)',
      'Ghana National Petroleum Corporation (GNPC) Foundation Scholarship',
      'MTN Ghana Foundation Bright Scholarship'
    ],
    applicationTimeline: {
      undergradDeadline: '2026-11-30',
      postgradDeadline: '2026-11-30',
      internationalDeadline: '2026-10-31'
    },
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'uni-ug-legon',
    name: 'University of Ghana',
    shortName: 'UG Legon',
    country: 'Ghana',
    city: 'Accra (Legon)',
    overview: 'The oldest and largest public university in Ghana, founded in 1948. A hub of scholarship in Social Sciences, Law, Business Administration, Medical Sciences, and Computing.',
    rankingText: 'Premier University in Ghana · World Bank African Centre of Excellence',
    verifiedStatus: 'verified',
    officialWebsite: 'https://www.ug.edu.gh/',
    admissionsPortalUrl: 'https://admission.ug.edu.gh/',
    campusType: 'Public',
    establishedYear: 1948,
    featuredProgrammes: [
      {
        id: 'prog-ug-cs',
        name: 'BSc Information Technology & Computer Science',
        degreeLevel: 'Undergraduate',
        faculty: 'School of Physical and Mathematical Sciences',
        duration: '4 Years',
        tuitionEstimate: 'GHS 2,600 / year (Ghanaian)',
        admissionRequirements: ['WASSCE Aggregate 6-13', 'Distinctions in English, Core Maths, Elective Maths'],
        applicationDeadline: '2026-11-25',
        officialProgrammeUrl: 'https://dcs.ug.edu.gh/'
      },
      {
        id: 'prog-ug-law',
        name: 'Bachelor of Laws (LLB)',
        degreeLevel: 'Undergraduate',
        faculty: 'School of Law',
        duration: '4 Years',
        tuitionEstimate: 'GHS 3,900 / year',
        admissionRequirements: ['WASSCE Aggregate 6-8 or First Degree for Post-First Degree LLB', 'Entrance Examination & Oral Interview'],
        applicationDeadline: '2026-10-31',
        officialProgrammeUrl: 'https://law.ug.edu.gh/'
      }
    ],
    availableScholarships: [
      'University of Ghana Students Financial Aid Office (SFAO) Grant',
      'Standard Chartered Bank Bursary',
      'Mastercard Foundation Scholars Program at UG'
    ],
    applicationTimeline: {
      undergradDeadline: '2026-11-25',
      postgradDeadline: '2026-11-15',
      internationalDeadline: '2026-10-15'
    },
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'uni-ashesi',
    name: 'Ashesi University',
    shortName: 'Ashesi',
    country: 'Ghana',
    city: 'Berekuso, Eastern Region',
    overview: 'Pioneering private, non-profit liberal arts and engineering university committed to educating ethical, entrepreneurial leaders in Africa. Renowned for its strict Honor Code and world-class career placement.',
    rankingText: 'Ranked #1 in Ghana for Quality Education (THE Impact Rankings)',
    verifiedStatus: 'verified',
    officialWebsite: 'https://www.ashesi.edu.gh/',
    admissionsPortalUrl: 'https://ashesi.web.elluciancrmrecruit.com/Apply/',
    campusType: 'Private',
    establishedYear: 2002,
    featuredProgrammes: [
      {
        id: 'prog-ashesi-cs',
        name: 'BSc Computer Science',
        degreeLevel: 'Undergraduate',
        faculty: 'Department of Computer Science & Information Systems',
        duration: '4 Years',
        tuitionEstimate: '$4,100 / semester (Comprehensive with high financial aid coverage)',
        admissionRequirements: ['WASSCE: 6 subjects with C6 or better; strong Elective Math', 'Personal Essay', 'Letters of recommendation'],
        applicationDeadline: '2026-06-30',
        officialProgrammeUrl: 'https://www.ashesi.edu.gh/academics/computer-science.html'
      },
      {
        id: 'prog-ashesi-meche',
        name: 'BSc Mechanical & Mechatronics Engineering',
        degreeLevel: 'Undergraduate',
        faculty: 'Engineering Department',
        duration: '4 Years',
        tuitionEstimate: '$4,500 / semester',
        admissionRequirements: ['WASSCE A1-B3 in Elective Maths and Physics', 'Design thinking portfolio or interest'],
        applicationDeadline: '2026-06-30',
        officialProgrammeUrl: 'https://www.ashesi.edu.gh/academics/engineering.html'
      }
    ],
    availableScholarships: [
      'Mastercard Foundation Scholars Program at Ashesi (Full Ride for 50%+ of students)',
      'Ashesi University Endowed Scholarship Fund'
    ],
    applicationTimeline: {
      undergradDeadline: '2026-06-30',
      postgradDeadline: '2026-07-31',
      internationalDeadline: '2026-05-31'
    },
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'uni-uct',
    name: 'University of Cape Town',
    shortName: 'UCT',
    country: 'South Africa',
    city: 'Cape Town',
    overview: 'Africa’s top-ranked research university, situated on the slopes of Devil’s Peak. Global powerhouse in Climate Sciences, AI & Data Science, Global Health, and Commercial Law.',
    rankingText: '#1 University in Africa (QS World Rankings 2026)',
    verifiedStatus: 'verified',
    officialWebsite: 'https://www.uct.ac.za/',
    admissionsPortalUrl: 'https://applyonline.uct.ac.za/',
    campusType: 'Public',
    establishedYear: 1829,
    featuredProgrammes: [
      {
        id: 'prog-uct-datascience',
        name: 'BSc Data Science & Computer Science',
        degreeLevel: 'Undergraduate',
        faculty: 'Faculty of Science',
        duration: '3 Years',
        tuitionEstimate: 'ZAR 75,000 / year (SADC) · ZAR 120,000 (International)',
        admissionRequirements: ['National Senior Certificate or international equivalent (A-Levels / WASSCE)', 'Maths rating 7 (80%+)', 'Physical Science rating 6 (70%+)'],
        applicationDeadline: '2026-07-31',
        officialProgrammeUrl: 'https://science.uct.ac.za/'
      }
    ],
    availableScholarships: [
      'Mastercard Foundation Scholars Program at UCT',
      'Mandela Rhodes Scholarship',
      'National Research Foundation (NRF) Postgraduate Bursaries'
    ],
    applicationTimeline: {
      undergradDeadline: '2026-07-31',
      postgradDeadline: '2026-09-30',
      internationalDeadline: '2026-07-31'
    },
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'uni-alu',
    name: 'African Leadership University',
    shortName: 'ALU',
    country: 'Rwanda',
    city: 'Kigali (Kigali Innovation City)',
    overview: 'Revolutionary higher education institution training the next generation of ethical and entrepreneurial African leaders through challenge-based learning and direct internship integration.',
    rankingText: 'Ranked Most Innovative Company in Education in Africa (Fast Company)',
    verifiedStatus: 'verified',
    officialWebsite: 'https://www.alueducation.com/',
    admissionsPortalUrl: 'https://apply.alueducation.com/',
    campusType: 'Private',
    establishedYear: 2015,
    featuredProgrammes: [
      {
        id: 'prog-alu-swe',
        name: 'BSc (Hons) Software Engineering',
        degreeLevel: 'Undergraduate',
        faculty: 'School of Technology',
        duration: '3 Years',
        tuitionEstimate: '$3,000 / year (Income Share Agreement & Grants available)',
        admissionRequirements: ['High school diploma / WASSCE / KCSE / Baccalauréat', 'Online Leadership & Problem Solving Assessment'],
        applicationDeadline: '2026-08-31',
        officialProgrammeUrl: 'https://www.alueducation.com/programmes/'
      }
    ],
    availableScholarships: [
      'ALU Financial Grant Program',
      'Mastercard Foundation Scholars at ALU'
    ],
    applicationTimeline: {
      undergradDeadline: '2026-08-31',
      postgradDeadline: '2026-09-30',
      internationalDeadline: '2026-08-31'
    },
    image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1200&q=80'
  }
];
