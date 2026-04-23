import { Briefcase, Activity, Shield, Code, BookOpen, Hammer, ChefHat, Plane, Microscope, Scale, Heart, Brain, GraduationCap, Laptop, Terminal } from 'lucide-react';

export interface Career {
  id: string;
  name: string;
  category: 'Full-time' | 'Part-time' | 'Military' | 'Special' | 'Freelance';
  icon: any;
  stages: CareerStage[];
}

export interface CareerStage {
  title: string;
  salary: number;
  requirements: {
    education?: string;
    experienceYears?: number;
    hours?: number;
    skills?: string[];
  };
}

export const CAREERS: Career[] = [
  {
    id: 'doctor',
    name: 'Doctor',
    category: 'Full-time',
    icon: Heart,
    stages: [
      { title: 'Medical Student', salary: 0, requirements: { education: 'University' } },
      { title: 'Intern', salary: 45000, requirements: { education: 'Medical School' } },
      { title: 'Resident', salary: 65000, requirements: { experienceYears: 1 } },
      { title: 'General Doctor', salary: 150000, requirements: { experienceYears: 3 } },
      { title: 'Specialist', salary: 250000, requirements: { experienceYears: 5 } },
      { title: 'Senior Specialist', salary: 350000, requirements: { experienceYears: 8 } },
      { title: 'Chief of Medicine', salary: 500000, requirements: { experienceYears: 12 } },
    ]
  },
  {
    id: 'pilot',
    name: 'Pilot',
    category: 'Full-time',
    icon: Plane,
    stages: [
      { title: 'Trainee Pilot', salary: 20000, requirements: { education: 'Flight School' } },
      { title: 'Co-Pilot', salary: 80000, requirements: { hours: 250 } },
      { title: 'Pilot', salary: 140000, requirements: { hours: 1000 } },
      { title: 'Senior Pilot', salary: 210000, requirements: { hours: 3000 } },
      { title: 'Captain', salary: 320000, requirements: { hours: 5000 } },
      { title: 'Chief Pilot', salary: 450000, requirements: { hours: 10000 } },
    ]
  },
  {
    id: 'software_dev',
    name: 'Software Developer',
    category: 'Full-time',
    icon: Code,
    stages: [
      { title: 'Intern', salary: 35000, requirements: { education: 'University' } },
      { title: 'Junior Developer', salary: 75000, requirements: { experienceYears: 0 } },
      { title: 'Developer', salary: 120000, requirements: { experienceYears: 2 } },
      { title: 'Senior Developer', salary: 180000, requirements: { experienceYears: 5 } },
      { title: 'Tech Lead', salary: 240000, requirements: { experienceYears: 8 } },
      { title: 'Engineering Manager', salary: 300000, requirements: { experienceYears: 10 } },
      { title: 'CTO', salary: 500000, requirements: { experienceYears: 15 } },
    ]
  },
  {
    id: 'army',
    name: 'Army',
    category: 'Military',
    icon: Shield,
    stages: [
      { title: 'Recruit', salary: 22000, requirements: {} },
      { title: 'Private', salary: 28000, requirements: { experienceYears: 1 } },
      { title: 'Corporal', salary: 35000, requirements: { experienceYears: 2 } },
      { title: 'Sergeant', salary: 45000, requirements: { experienceYears: 4 } },
      { title: 'Lieutenant', salary: 65000, requirements: { education: 'Military Academy' } },
      { title: 'Captain', salary: 85000, requirements: { experienceYears: 4 } },
      { title: 'Major', salary: 110000, requirements: { experienceYears: 7 } },
      { title: 'Colonel', salary: 160000, requirements: { experienceYears: 10 } },
      { title: 'General', salary: 220000, requirements: { experienceYears: 15 } },
    ]
  }
];

export const FREELANCE_JOBS = [
  { id: 'handyman', name: 'Handyman', minRate: 5, maxRate: 20 },
  { id: 'tutor', name: 'Tutor', minRate: 4, maxRate: 15 },
  { id: 'caretaker', name: 'Caretaker', minRate: 2, maxRate: 13 },
  { id: 'babysitter', name: 'Babysitter', minRate: 3, maxRate: 12 },
  { id: 'dog_walker', name: 'Dog Walker', minRate: 3, maxRate: 12 },
  { id: 'pet_sitter', name: 'Pet Sitter', minRate: 3, maxRate: 12 },
];

export const PART_TIME_JOBS = [
  'Mall Stant', 'Dance Instructor', 'Mover', 'Product Tester', 'Camp Counselor',
  'Mall Worker', 'Movie Theater Cashier', 'Valet', 'Yoga Receptionist', 'Video Game Tester'
];
