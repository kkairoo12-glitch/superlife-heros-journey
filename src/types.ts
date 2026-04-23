
export type Sexuality = 'Straight' | 'Bisexual' | 'Gay';
export type Gender = 'Male' | 'Female' | 'Non-binary';
export type Archetype = 'Hero' | 'Villain' | 'Anti-Hero' | 'Anti-Villain' | 'Civilian' | 'Hero-Civilian';
export type PowerAlignment = 'Heroic' | 'Neutral' | 'Villainous';
export type MindControlLayer = 'Nudge' | 'Persuade' | 'Override';
export type TimeInterval = 'Day' | 'Week' | 'Month' | 'Year';

export interface Power {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
}

export interface Appearance {
  eyes: string;
  skin: string;
  brows: string;
  hair: string;
  facialHair: string;
}

export interface Stats {
  happiness: number;
  health: number;
  intelligence: number;
  attractiveness: number;
  powerLevel: number;
  wealth: number;
  karma: number;
  willpower: number;
  discipline: number;
  fertility: number;
  stress: number;
  acting: number;
  athleticism: number;
  popularity: number;
  mentalStrain: number; // 0-100
  exposure: number; // 0-100
  powerControl: number; // 0-100
  suspicion: number; // 0-100
}

export interface Job {
  name: string;
  company: string;
  tier: number;
  salary: number;
  category: 'Full-time' | 'Part-time' | 'Military' | 'Special' | 'Freelance';
  experienceYears: number;
  performance: number; // 0-100
}

export interface PersonStats {
  happiness: number;
  health: number;
  intelligence: number;
  attractiveness: number;
  wealth: number;
  craziness: number; // 0-100
  maritalStatus: 'Single' | 'Dating' | 'Married' | 'Divorced' | 'Widowed';
  occupation?: string;
  education?: string;
  hasChildren?: boolean;
  childrenCount?: number;
}

export interface NPC {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  archetype: Archetype;
  powers: Power[];
  relationship: number; // 0-100
  isPlayerMet: boolean;
  stats: PersonStats;
  country?: string;
}

export type RoyaltyTitle = 
  | 'None' 
  | 'Baron' | 'Baroness' 
  | 'Viscount' | 'Viscountess' 
  | 'Count' | 'Countess' 
  | 'Earl' | 'Countess' // Earl is specific to UK, usually Countess for female
  | 'Marquess' | 'Marchioness' 
  | 'Duke' | 'Duchess' 
  | 'Prince' | 'Princess' 
  | 'King' | 'Queen';

export type EducationTier = 'None' | 'Elementary' | 'High School' | 'College' | 'University' | 'Graduate' | 'Business' | 'Dental' | 'Law' | 'Medical' | 'Nursing' | 'Pharmacy' | 'Veterinary';

export type MajorType = 
  | 'Accounting' | 'Biology' | 'Business Administration' | 'Communications' | 'Computer Science' 
  | 'Criminal Justice' | 'Dance' | 'Economics' | 'Education' | 'English' | 'Finance' 
  | 'History' | 'Information Systems' | 'Journalism' | 'Marketing' | 'Mathematics' 
  | 'Music' | 'Nursing' | 'Philosophy' | 'Physics' | 'Political Science' | 'Psychology' 
  | 'Social Work' | 'Sociology' | 'Theatre';

export interface SchoolSubject {
  name: string;
  grade: number; // 0-100
}

export interface Teacher {
  id: string;
  name: string;
  fullName: string;
  gender: Gender;
  age: number;
  subject: string;
  personality: 'Strict' | 'Chill' | 'Creepy' | 'Inspiring' | 'Unprofessional' | 'Boundary Issues' | 'Manipulative';
  relationship: number;
  isTeachingPlayer: boolean;
  stats: PersonStats;
  sleepingWithPlayer?: boolean;
  strictness: number;
  favoritism: number;
  favoriteStudent?: boolean;
}

export interface Student {
  id: string;
  name: string;
  fullName: string;
  gender: Gender;
  age: number;
  clique: string;
  relationship: number;
  popularity: number;
  isFriend: boolean;
  isDating: boolean;
  stats: PersonStats;
}

export interface SchoolActivity {
  id: string;
  name: string;
  type: 'Club' | 'Team';
  performance: number;
  isMember: boolean;
  isCaptain: boolean;
}

export interface SchoolState {
  name: string;
  tier: EducationTier;
  major?: MajorType;
  overallGrade: number;
  popularity: number;
  subjects: SchoolSubject[];
  teachers: Teacher[];
  classmates: Student[];
  activities: SchoolActivity[];
  clique: string | null;
  cliqueRank: number; // 0-100
  studyLevel: 'None' | 'Light' | 'Normal' | 'Intense';
  disciplineScore: number; // 0-100, high = bad
  behavior: number; // 0-100, high = good
  stress: number; // 0-100, high = bad
  reputation: number; // -100 to 100, hidden
  punishmentLevel: 'None' | 'Warning' | 'Detention' | 'Suspension' | 'Expelled';
  tuition?: number;
  loanBalance?: number;
  yearsRemaining?: number;
  attendance: number; // 0-100
}

export interface Character {
  name: string;
  gender: string;
  country: string;
  city: string;
  appearance: Appearance;
  stats: Stats;
  sexuality: Sexuality;
  archetype: Archetype;
  royaltyTitle: RoyaltyTitle;
  talents: string[];
  powers: Power[];
  age: number;
  daysLived: number;
  isAlive: boolean;
  job: Job | null;
  educationLevel: EducationTier;
  educationYears: number;
  school: SchoolState | null;
}

export const CLUBS = [
  'Sign Language', 'Rodeo', 'Robotics', 'Puzzle', 'Computer Science', 'Board Games', 
  'Baking', 'Astronomy', 'Concert Band', 'Cycling Club', 'Poetry', 'Cancer Awareness', 
  'Cooking', 'Debate Club', 'Model UN', 'Journalism', 'Photography Club', 
  'Environmental Club', 'Gaming / Esports', 'Anime Club', 'Volunteer Club'
];

export const SPORTS = [
  'Baseball', 'Basketball', 'Cross Country', 'Dance', 'Drama', 'Football', 'Golf', 
  'Ice Hockey', 'Soccer', 'Swim', 'Tennis', 'Track', 'Volleyball', 'Wrestling', 
  'Cheerleading', 'Lacrosse'
];

export const CLIQUES = [
  'Artsy Kids', 'Band Geeks', 'Brainy kids', 'Drama kids', 'Gamers', 'Goths', 
  'Hipsters', 'Jocks', 'Loners', 'Nerds', 'Normals', 'Popular kids', 'Skaters', 
  'Social floaters', 'Talented kids', 'Troublemakers', 'Weebs'
];

export const NOBILITY_RANKS = [
  'Baron', 'Viscount', 'Count', 'Marquess', 'Duke', 'Prince'
];

export const ROYAL_COUNTRIES = ['UK', 'Japan', 'Germany', 'France']; // Germany/France had them historically, let's include for gameplay

export interface Asset {
  id: string;
  type: 'Real Estate' | 'Vehicle' | 'Investment' | 'Jewelry' | 'Other';
  name: string;
  value: number;
  purchasePrice: number;
}

export interface Relationship extends NPC {
  type: 'Parent' | 'Sibling' | 'Friend' | 'Partner' | 'Child' | 'Rival' | 'Ex' | 'Fling' | 'Side Piece';
}

export type SocialPlatform = 'Facebook' | 'InstaLife' | 'OnlyFans' | 'Podcast' | 'TikTok' | 'Twitch' | 'Twitter' | 'YouTube';

export interface SocialMediaAccount {
  platform: SocialPlatform;
  followers: number;
  isVerified: boolean;
  totalPosts: number;
  isDeleted: boolean;
}

export interface GameState {
  character: Character | null;
  logs: string[];
  assets: Asset[];
  relationships: Relationship[];
  npcs: NPC[];
  education: string;
  currentYear: number;
  socialMediaAccounts: SocialMediaAccount[];
}

export const COUNTRIES = [
  { name: 'USA', cities: ['New York', 'Los Angeles', 'Chicago'] },
  { name: 'UK', cities: ['London', 'Manchester', 'Birmingham'] },
  { name: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto'] },
  { name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg'] },
  { name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal'] },
  { name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
  { name: 'France', cities: ['Paris', 'Lyon', 'Marseille'] },
];

export const POWERS_CATEGORIES = [
  {
    title: "Physical & Biological",
    powers: [
      "Super Strength", "Super Speed", "Super Leaping", "Super Durability",
      "Super Stamina", "Superhuman Reflexes", "Superhuman Agility", "Regeneration",
      "Longevity", "Immortality", "Shape Shifting", "Phasing", "Healing",
      "Resurrection", "Self-Sustenance", "Super Breath"
    ]
  },
  {
    title: "Elemental & Nature",
    powers: [
      "Aerokinesis", "Hydrokinesis", "Pyrokinesis", "Cryokinesis", "Geokinesis",
      "Electrokinesis", "Chlorokinesis", "Weather Manipulation", "Ice Breath",
      "Thermokinesis", "Darkness Manipulation", "Photokinesis"
    ]
  },
  {
    title: "Mental & Psychic",
    powers: [
      "Telepathy", "Mind Control", "Empathy", "Fear Projection", "Possession",
      "Oneiromancy", "Precognition", "Telekinesis", "Tactile Telekinesis",
      "Invisibility"
    ]
  },
  {
    title: "Sensory",
    powers: [
      "Super Senses", "X-Ray vision", "Heat Vision", "Telescopic Vision",
      "Microscopic Vision", "Electromagnetic Spectrum Vision", "Infrared Vision",
      "Thermal Vision", "Cosmic Awareness"
    ]
  },
  {
    title: "Energy & Spatiotemporal",
    powers: [
      "Energy Blast", "Energy Projection", "Energy Absorption", 
      "Energy Construct Creation", "Force Field", "Gravity Manipulation", 
      "Probability Manipulation", "Time Travel", "Chronokinesis", "Teleportation",
      "Biokinesis", "Blood Control", "Elemental Control", "Flight"
    ]
  },
  {
    title: "Omni & Meta",
    powers: [
      "Omniscience", "Omnipresence", "Omnipotence", "Power Replication",
      "Power Distribution", "Power Absorption"
    ]
  }
];

export const POWERS_LIST = POWERS_CATEGORIES.flatMap(c => c.powers);

export const TALENTS_LIST = [
  "Acting", "Crime", "Drug Dealing", "Modeling", "Music", "Sports"
];
