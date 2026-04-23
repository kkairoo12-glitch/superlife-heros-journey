import { SchoolState, EducationTier, Teacher, Student, SchoolSubject, SchoolActivity, CLUBS, SPORTS, CLIQUES } from '../types';
import { generatePersonStats, generateGender, generateNpcName } from './npcs';

const TEACHER_PERSONALITIES: Teacher['personality'][] = [
  'Strict', 'Chill', 'Creepy', 'Inspiring', 'Unprofessional', 'Boundary Issues', 'Manipulative'
];

const SCHOOL_SUBJECTS = ['Math', 'English', 'Science', 'Social Studies', 'PE', 'Music', 'Art', 'History'];

export function generateSchool(tier: EducationTier): SchoolState {
  const subjects: SchoolSubject[] = (tier === 'Elementary' ? SCHOOL_SUBJECTS.slice(0, 5) : SCHOOL_SUBJECTS).map(name => ({
    name,
    grade: 70 + Math.floor(Math.random() * 20)
  }));

  const minStudentAge = tier === 'Elementary' ? 5 : 14;
  const maxStudentAge = tier === 'Elementary' ? 11 : 18;

  const teachers: Teacher[] = Array.from({ length: 10 }).map((_, i) => {
    const gender = generateGender();
    const fullName = generateNpcName(gender);
    const lastName = fullName.split(' ')[1];
    const prefix = gender === 'Male' ? 'Mr.' : gender === 'Female' ? 'Ms.' : 'Mx.';
    const age = 22 + Math.floor(Math.random() * 45); // 22 to 66
    
    return {
      id: `teacher-${i}`,
      name: `${prefix} ${lastName}`,
      fullName,
      gender,
      age,
      subject: SCHOOL_SUBJECTS[Math.floor(Math.random() * SCHOOL_SUBJECTS.length)],
      personality: TEACHER_PERSONALITIES[Math.floor(Math.random() * TEACHER_PERSONALITIES.length)],
      relationship: 50,
      isTeachingPlayer: i < 5,
      strictness: Math.floor(Math.random() * 100),
      favoritism: Math.floor(Math.random() * 100),
      stats: {
        ...generatePersonStats(age),
        occupation: 'Teacher',
        education: 'University' // Fixed type: enum string instead of University Degree which isn't standard
      }
    };
  });

  const classmates: Student[] = Array.from({ length: 20 }).map((_, i) => {
    const gender = generateGender();
    const fullName = generateNpcName(gender);
    const age = minStudentAge + Math.floor(Math.random() * (maxStudentAge - minStudentAge + 1));

    return {
      id: `student-${i}`,
      name: fullName,
      fullName: fullName,
      gender,
      age,
      clique: CLIQUES[Math.floor(Math.random() * CLIQUES.length)],
      relationship: 50,
      popularity: Math.floor(Math.random() * 100),
      isFriend: false,
      isDating: false,
      stats: generatePersonStats(age, true)
    };
  });

  const activities: SchoolActivity[] = [
    ...CLUBS.map(name => ({ id: `club-${name}`, name, type: 'Club' as const, performance: 0, isMember: false, isCaptain: false })),
    ...SPORTS.map(name => ({ id: `team-${name}`, name, type: 'Team' as const, performance: 0, isMember: false, isCaptain: false }))
  ];

  return {
    name: `${tier} School`,
    tier,
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
    attendance: 100
  };
}
