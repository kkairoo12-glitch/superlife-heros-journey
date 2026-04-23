import { NPC, Archetype, Power, POWERS_LIST, PersonStats, Gender, Relationship } from '../types';

const MALE_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'];
const FEMALE_NAMES = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'];
const NEUTRAL_NAMES = ['Alex', 'Jordan', 'Skyler', 'Morgan', 'Casey', 'Robin', 'Taylor', 'Quinn', 'Avery', 'Reese'];
const SURNAMES = ['Thorne', 'Vance', 'Black', 'Steel', 'Frost', 'Storm', 'Shadow', 'Light', 'Power', 'Strong', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

export const generateGender = (): Gender => {
  const roll = Math.random();
  if (roll < 0.48) return 'Male';
  if (roll < 0.96) return 'Female';
  return 'Non-binary';
};

export const generatePersonStats = (age: number, isStudent: boolean = false): PersonStats => {
  const happiness = Math.floor(Math.random() * 60) + 40;
  const health = Math.floor(Math.random() * 60) + 40;
  const intelligence = Math.floor(Math.random() * 80) + 20;
  const attractiveness = Math.floor(Math.random() * 80) + 20;
  const craziness = Math.floor(Math.random() * 100);
  
  const maritalPool: PersonStats['maritalStatus'][] = age < 18 ? ['Single'] : ['Single', 'Dating', 'Married', 'Divorced', 'Widowed'];
  const maritalStatus = age < 18 ? 'Single' : maritalPool[Math.floor(Math.random() * maritalPool.length)];
  
  const hasChildren = age > 18 && Math.random() > 0.7;
  const childrenCount = hasChildren ? Math.floor(Math.random() * 3) + 1 : 0;

  let wealth = 0;
  if (age >= 18) {
    wealth = Math.floor(Math.random() * 50000);
    if (Math.random() > 0.95) wealth *= 10; // Rare high wealth
  }

  return {
    happiness,
    health,
    intelligence,
    attractiveness,
    wealth,
    craziness,
    maritalStatus,
    education: isStudent ? 'In Progress' : (age < 18 ? 'None' : 'High School'),
    occupation: isStudent ? 'Student' : (age < 18 ? 'None' : 'Unemployed'),
    hasChildren,
    childrenCount
  };
};

export const generateNpcName = (gender: Gender) => {
  let firstName = '';
  if (gender === 'Male') {
    firstName = MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
  } else if (gender === 'Female') {
    firstName = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
  } else {
    firstName = NEUTRAL_NAMES[Math.floor(Math.random() * NEUTRAL_NAMES.length)];
  }
  return `${firstName} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`;
};

export const generateNPC = (age: number): NPC => {
  const gender = generateGender();
  const name = generateNpcName(gender);
  const archetypePool: Archetype[] = ['Hero', 'Villain', 'Anti-Hero', 'Anti-Villain', 'Civilian'];
  const archetype = archetypePool[Math.floor(Math.random() * archetypePool.length)];
  
  const numPowers = archetype === 'Civilian' ? 0 : Math.floor(Math.random() * 3) + 1;
  const powers: Power[] = [];
  
  const availablePowers = [...POWERS_LIST];
  for (let i = 0; i < numPowers; i++) {
    const pIndex = Math.floor(Math.random() * availablePowers.length);
    const pName = availablePowers.splice(pIndex, 1)[0];
    powers.push({
      id: pName.toLowerCase().replace(/\s+/g, '-'),
      name: pName,
      level: Math.floor(Math.random() * 10) + 1,
      maxLevel: 10,
      description: `NPC power.`
    });
  }

  return {
    id: Math.random().toString(36).substring(7),
    name,
    gender,
    age,
    archetype,
    powers,
    relationship: 0,
    isPlayerMet: false,
    stats: generatePersonStats(age)
  };
};

export const generateInitialRelationships = (characterName: string): Relationship[] => {
  const surname = characterName.split(' ')[1] || SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const relationships: Relationship[] = [];

  // Mother
  const motherGender = 'Female';
  const motherFirstName = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
  const mother: Relationship = {
    ...generateNPC(Math.floor(Math.random() * 20) + 20),
    id: 'mother',
    name: `${motherFirstName} ${surname}`,
    gender: motherGender,
    relationship: 100,
    type: 'Parent'
  };
  relationships.push(mother);

  // Father
  const fatherGender = 'Male';
  const fatherFirstName = MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
  const father: Relationship = {
    ...generateNPC(Math.floor(Math.random() * 20) + 20),
    id: 'father',
    name: `${fatherFirstName} ${surname}`,
    gender: fatherGender,
    relationship: 100,
    type: 'Parent'
  };
  relationships.push(father);

  // Sibling (50% chance)
  if (Math.random() > 0.5) {
    const sibGender = generateGender();
    const sibFirstName = generateNpcName(sibGender).split(' ')[0];
    const sibling: Relationship = {
      ...generateNPC(Math.floor(Math.random() * 10) + 5),
      id: 'sibling-0',
      name: `${sibFirstName} ${surname}`,
      gender: sibGender,
      relationship: 80,
      type: 'Sibling'
    };
    relationships.push(sibling);
  }

  // A couple of starting friends
  for (let i = 0; i < 2; i++) {
    const friend: Relationship = {
      ...generateNPC(Math.floor(Math.random() * 5) + 5),
      id: `friend-${i}`,
      relationship: Math.floor(Math.random() * 30) + 40,
      type: 'Friend',
      isPlayerMet: true
    };
    relationships.push(friend);
  }

  return relationships;
};

export const generateInitialNPCs = (count: number): NPC[] => {
  return Array.from({ length: count }, () => generateNPC(Math.floor(Math.random() * 60) + 18));
};
