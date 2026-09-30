import { LearningResource } from '../types';

export const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: 'lr-system-design',
    title: 'Systems & API Architecture for Junior Engineers',
    provider: 'Afriversity Engineering Labs & Google Cloud',
    url: 'https://cloud.google.com/training',
    category: 'Software Engineering',
    cost: 'Free',
    duration: '4 hours',
    matchedSkill: 'API Integrations',
    opportunityTieIn: 'Required for Google Africa Software Engineering Internship and MTN FinTech Apprenticeship',
    level: 'Intermediate'
  },
  {
    id: 'lr-dsa-python',
    title: 'Data Structures & Algorithms Interview Mastery in Python',
    provider: 'NeetCode & ALX Technical Prep',
    url: 'https://neetcode.io/',
    category: 'Interview Preparation',
    cost: 'Free',
    duration: '12 hours',
    matchedSkill: 'Data Structures & Algorithms',
    opportunityTieIn: 'Critical screening filter for Google, Microsoft, and global tech internships',
    level: 'Intermediate'
  },
  {
    id: 'lr-statement-of-purpose',
    title: 'Writing Winning Scholarship Personal Statements for African Applicants',
    provider: 'Rhodes Scholars Alumni Network & Afriversity',
    url: 'https://mcf.knust.edu.gh/',
    category: 'Scholarship Application',
    cost: 'Free',
    duration: '2.5 hours',
    matchedSkill: 'Academic Writing',
    opportunityTieIn: 'Directly improves your readiness for Mastercard Foundation and Rhodes Scholarship West Africa',
    level: 'Beginner'
  },
  {
    id: 'lr-ml-fundamentals',
    title: 'Foundations of Machine Learning & PyTorch for Africa',
    provider: 'Deep Learning Indaba & Masakhane NLP',
    url: 'https://deeplearningindaba.com/',
    category: 'Artificial Intelligence',
    cost: 'Free',
    duration: '8 hours',
    matchedSkill: 'PyTorch / TensorFlow',
    opportunityTieIn: 'Prerequisite for Deep Learning Indaba Research Travel Grant and AI4D fellowship',
    level: 'Intermediate'
  },
  {
    id: 'lr-tef-business-plan',
    title: 'Designing a Bankable Lean Business Model in African Markets',
    provider: 'Tony Elumelu Foundation TEFConnect',
    url: 'https://www.tefconnect.net/',
    category: 'Entrepreneurship',
    cost: 'Free',
    duration: '5 hours',
    matchedSkill: 'Business Model Design',
    opportunityTieIn: 'Qualifying milestone for TEF $5,000 non-refundable seed capital grant',
    level: 'Beginner'
  }
];
