import { EducationTier, SchoolState, MajorType, CLUBS, SPORTS } from '../types';
import { generateNpcName, generatePersonStats } from './npcs';

export const MAJORS: MajorType[] = [
  'Accounting', 'Biology', 'Business Administration', 'Communications', 'Computer Science',
  'Criminal Justice', 'Dance', 'Economics', 'Education', 'English', 'Finance',
  'History', 'Information Systems', 'Journalism', 'Marketing', 'Mathematics',
  'Music', 'Nursing', 'Philosophy', 'Physics', 'Political Science', 'Psychology',
  'Social Work', 'Sociology', 'Theatre'
];

export const generateHigherEd = (tier: EducationTier, major?: MajorType): SchoolState => {
  const schoolNames: Record<EducationTier, string[]> = {
    'None': [],
    'Elementary': [],
    'High School': [],
    'College': ['Oakwood Community College', 'Riverfront Technical Institute', 'Northside College'],
    'University': ['Ivy League University', 'State Metropolitan University', 'Prestigious Institute of Technology'],
    'Graduate': ['Global Graduate School', 'Advanced Research Institute'],
    'Business': ['Wharton-Style School of Business', 'Executive Business Academy'],
    'Dental': ['City Dental Center', 'Modern Dentistry University'],
    'Law': ['Scalia Law School', 'High Court University'],
    'Medical': ['General Hospital University', 'Medical Science Academy'],
    'Nursing': ['Florence Nursing College', 'HealthCare Training Institute'],
    'Pharmacy': ['Apothecary University', 'Pharmaceutical Research School'],
    'Veterinary': ['Animal Care University', 'Veterinary Science Institute']
  };

  const names = schoolNames[tier] || ['Generic Institution'];
  const name = names[Math.floor(Math.random() * names.length)];

  const subjects = major ? [
    { name: `${major} 101`, grade: 75 },
    { name: `${major} Advanced`, grade: 70 },
    { name: 'General Studies', grade: 80 }
  ] : [
    { name: 'Core Subject A', grade: 75 },
    { name: 'Core Subject B', grade: 75 }
  ];

  const teachers = Array.from({ length: 4 }, (_, i) => {
    const gender = (Math.random() > 0.5 ? 'Male' : 'Female') as 'Male' | 'Female' | 'Non-binary';
    const fullName = generateNpcName(gender);
    const age = 30 + Math.floor(Math.random() * 40); // 30 to 70

    return {
      id: `prof-${i}-${Math.random()}`,
      fullName,
      gender,
      age,
      name: `Professor ${fullName.split(' ')[1]}`,
      subject: i === 0 && major ? major : 'General Study',
      personality: ['Strict', 'Chill', 'Inspiring', 'Unprofessional'][Math.floor(Math.random() * 4)] as any,
      relationship: 50,
      isTeachingPlayer: true,
      strictness: Math.floor(Math.random() * 100),
      favoritism: Math.floor(Math.random() * 100),
      stats: generatePersonStats(age)
    };
  });

  const classmates = Array.from({ length: 8 }, (_, i) => {
    const gender = (Math.random() > 0.5 ? 'Male' : 'Female') as 'Male' | 'Female' | 'Non-binary';
    const fullName = generateNpcName(gender);
    const age = 18 + Math.floor(Math.random() * 8); // 18 to 25

    return {
      id: `peer-${i}-${Math.random()}`,
      fullName,
      gender,
      age,
      name: fullName,
      clique: 'Normals',
      relationship: 50,
      popularity: 50,
      isFriend: false,
      isDating: false,
      stats: generatePersonStats(age)
    };
  });

  const activities = [
    { id: 'council', name: 'Student Council', type: 'Club' as const, performance: 0, isMember: false, isCaptain: false },
    { id: 'sports', name: SPORTS[Math.floor(Math.random() * SPORTS.length)], type: 'Team' as const, performance: 0, isMember: false, isCaptain: false },
    { id: 'club', name: CLUBS[Math.floor(Math.random() * CLUBS.length)], type: 'Club' as const, performance: 0, isMember: false, isCaptain: false }
  ];

  let yearsRemaining = 4;
  if (tier === 'College') yearsRemaining = 2;
  if (tier === 'Graduate') yearsRemaining = 2;
  if (tier === 'Business') yearsRemaining = 2;
  if (tier === 'Medical') yearsRemaining = 4;
  if (tier === 'Law') yearsRemaining = 3;

  return {
    name,
    tier,
    major,
    overallGrade: 80,
    popularity: 50,
    subjects,
    teachers,
    classmates,
    activities,
    clique: null,
    cliqueRank: 0,
    studyLevel: 'Normal',
    disciplineScore: 0,
    behavior: 100,
    stress: 0,
    reputation: 0,
    punishmentLevel: 'None',
    attendance: 100,
    tuition: tier === 'College' ? 0 : 25000,
    loanBalance: 0,
    yearsRemaining
  };
};
