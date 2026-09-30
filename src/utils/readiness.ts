import { ChecklistItem, Opportunity, OpportunityReadiness, ReadinessStatus, UserProfile } from '../types';

/**
 * Computes deterministic, explainable match score, reasons, readiness state,
 * and actionable missing items for a given opportunity and student profile.
 */
export function calculateOpportunityReadiness(
  opp: Opportunity,
  profile: UserProfile,
  completedChecklistIds: string[] = []
): OpportunityReadiness {
  const matchedReasons: string[] = [];
  const missingItems: ChecklistItem[] = [];

  let matchPoints = 0;
  let maxMatchPoints = 100;

  // 1. Nationality / Country Eligibility Check (25 pts)
  const isPanAfrican = opp.eligible_countries.some(
    c => c.toLowerCase().includes('all') || c.toLowerCase().includes('pan-africa')
  );
  const isCountryEligible =
    isPanAfrican ||
    opp.eligible_countries.some(c => c.toLowerCase() === profile.country.toLowerCase()) ||
    opp.country.toLowerCase() === profile.country.toLowerCase() ||
    opp.country.toLowerCase().includes('pan-africa');

  if (isCountryEligible) {
    matchPoints += 25;
    matchedReasons.push(`Country (${profile.country}) matches eligibility requirements`);
  } else {
    missingItems.push({
      id: `check-country-${opp.id}`,
      label: `Country eligibility verification required (Listed: ${opp.country})`,
      action: `Verify international residency exemptions on official portal`,
      completed: false,
      category: 'profile'
    });
  }

  // 2. Education Level & Academic Standing (25 pts)
  const levelMatch =
    opp.education_level.includes('all') ||
    opp.education_level.includes(profile.academicLevel);

  if (levelMatch) {
    matchPoints += 25;
    matchedReasons.push(`Academic level (${formatAcademicLevel(profile.academicLevel)}) matches target applicant profile`);
  } else {
    missingItems.push({
      id: `check-level-${opp.id}`,
      label: `Target academic level mismatch (Requires: ${opp.education_level.join(', ')})`,
      action: `Review prerequisite degree equivalence`,
      completed: false,
      category: 'profile'
    });
  }

  // 3. Programme & Field Alignment (25 pts)
  const userFieldTokens = [
    profile.programme.toLowerCase(),
    ...profile.interests.map(i => i.toLowerCase()),
    ...profile.goals.map(g => g.toLowerCase())
  ];

  const oppFieldTokens = [
    opp.field.toLowerCase(),
    opp.programme.toLowerCase(),
    opp.category.toLowerCase()
  ].join(' ');

  const hasFieldOverlap = userFieldTokens.some(token => {
    const words = token.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => oppFieldTokens.includes(w));
  });

  if (hasFieldOverlap) {
    matchPoints += 25;
    matchedReasons.push(`Academic discipline (${profile.programme}) aligns with opportunity field`);
  } else {
    matchPoints += 10;
    matchedReasons.push(`Interdisciplinary consideration may apply based on your declared goals`);
  }

  // 4. Skills & Competency Alignment (25 pts)
  const userSkills = profile.skills.map(s => s.toLowerCase());
  const matchedSkillsList = opp.skills.filter(os =>
    userSkills.some(us => us.includes(os.toLowerCase()) || os.toLowerCase().includes(us))
  );

  if (matchedSkillsList.length > 0) {
    const skillBonus = Math.min(25, 10 + matchedSkillsList.length * 5);
    matchPoints += skillBonus;
    matchedReasons.push(`Skills matched: ${matchedSkillsList.slice(0, 3).join(', ')}`);
  } else {
    matchPoints += 5;
    missingItems.push({
      id: `check-skills-${opp.id}`,
      label: `Core technical skills preparation recommended (${opp.skills.slice(0, 2).join(', ')})`,
      action: `Visit Learning Hub to build recommended competency modules`,
      completed: false,
      category: 'test'
    });
  }

  // 5. Document Readiness Checklist (Dynamic based on opp.documents_required)
  opp.documents_required.forEach((doc, idx) => {
    const itemId = `doc-${opp.id}-${idx}`;
    const docLower = doc.toLowerCase();

    // Check if user profile already has this asset satisfied
    let autoCompleted = false;
    let actionTip = 'Prepare and upload for your application packet';

    if (docLower.includes('cv') || docLower.includes('resume')) {
      autoCompleted = !!profile.cvSummary || (profile.projects.length >= 1 && profile.skills.length >= 3);
      actionTip = 'Tailor CV to highlight opportunity keywords';
    } else if (docLower.includes('transcript') || docLower.includes('results') || docLower.includes('wassce')) {
      autoCompleted = !!profile.gradeGpa && profile.gradeGpa.trim().length > 0;
      actionTip = 'Obtain stamped official transcript from academic registrar';
    } else if (docLower.includes('github') || docLower.includes('portfolio')) {
      autoCompleted = profile.projects.length >= 1;
      actionTip = 'Add pinned projects with live demo or repository link';
    } else if (docLower.includes('recommendation') || docLower.includes('reference') || docLower.includes('referee')) {
      autoCompleted = false;
      actionTip = 'Request reference letter from professors or mentors 3 weeks in advance';
    } else if (docLower.includes('statement') || docLower.includes('essay') || docLower.includes('pitch')) {
      autoCompleted = false;
      actionTip = 'Draft personal statement using the Application Assistant';
    }

    const isExplicitlyCompleted = completedChecklistIds.includes(itemId);
    const finalCompleted = isExplicitlyCompleted || autoCompleted;

    missingItems.push({
      id: itemId,
      label: doc,
      action: actionTip,
      completed: finalCompleted,
      category: 'document'
    });
  });

  // Calculate Readiness Score based on checklist completion & base eligibility
  const totalChecklistCount = missingItems.length;
  const completedChecklistCount = missingItems.filter(item => item.completed).length;

  const baseReadiness = totalChecklistCount > 0
    ? Math.round((completedChecklistCount / totalChecklistCount) * 100)
    : 80;

  // Weighted Readiness Score
  const eligibilityRatio = isCountryEligible && levelMatch ? 1 : 0.6;
  const readinessScore = Math.min(100, Math.round(baseReadiness * eligibilityRatio));

  let readinessStatus: ReadinessStatus = 'PARTIALLY_READY';
  if (readinessScore >= 85) {
    readinessStatus = 'READY';
  } else if (readinessScore < 45 || !isCountryEligible) {
    readinessStatus = 'NOT_YET_READY';
  }

  // Recommended next step
  const pendingItems = missingItems.filter(i => !i.completed);
  let recommendedNextStep = 'Review official portal application guidelines and submit before the deadline.';
  if (pendingItems.length > 0) {
    const firstPending = pendingItems[0];
    recommendedNextStep = `${firstPending.action} (${firstPending.label}).`;
  }

  const normalizedMatchScore = Math.min(98, Math.max(52, matchPoints));

  return {
    opportunityId: opp.id,
    readinessStatus,
    readinessScore,
    matchScore: normalizedMatchScore,
    matchedReasons,
    missingItems,
    recommendedNextStep
  };
}

function formatAcademicLevel(level: string): string {
  switch (level) {
    case 'secondary':
      return 'Senior Secondary / High School';
    case 'undergraduate':
      return 'Undergraduate Degree';
    case 'postgraduate':
      return 'Postgraduate (MSc / PhD)';
    case 'recent_graduate':
      return 'Recent Graduate';
    case 'young_professional':
      return 'Young Professional';
    default:
      return level;
  }
}
