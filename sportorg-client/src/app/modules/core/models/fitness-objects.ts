export interface FitnessProfile {
  athleteId: number;
  firstName: string;
  lastName: string;
  yearOfBirth: number;
  competeGenderId: number;
  stats: FitnessProfileStat[];
  typeIds?: number[];
  isEpee?: string;
  isFoil?: string;
  isSabre?: string;
  lastWorkout?: string;
  generatedFromMember?: boolean; // when a member exists for the user, but no fitness profile yet
  memberId?: number;
  createNewPlaceholder?: boolean;
  fitnessLevel?: number;
  fitnessLevelProgress?: number;
  weeklyFitness?: number;

}
export interface FitnessProfileStat {
  name: string;
  value: number;
  icon?: string;
  progress?: number;
  weeklyProgress?: number;
}

export interface FitnessCompareResponse {
  participants: number;
  stats: FitnessCompareStat[];
}
export interface FitnessCompareStat {
  name: string;
  maxGains: number;
  maxLevel: number;
  averageGains: number;
  averageLevel: number;
  myLevel?: number;
  myGains?: number;
  icon?: string;
}

export interface ExerciseLogResults {
  athleteId: number;
  changes?: FitnessProfileStat[];
  levelUps: string[];
}

export interface FitnessLogItem {
  eventId?: number;
  athleteId: number;
  exerciseId: number;
  eventDate?: string;
  exerciseQuantity: number;
}

export interface Exercise {
  exerciseId: number;
  ownerGroupId?: number; // group that created the exercise
  name: string;
  description: string;
  iconType: string;
  iconName: string;
  fileId: number;
  showFullImage?: boolean;
  measurementUnit: string;
  measurementUnitQuantity: number; // how many counts as "1"
  balanceValue?: number;
  flexibilityValue?: number;
  powerValue?: number;
  enduranceValue?: number;
  footSpeedValue?: number;
  handSpeedValue?: number;
  quantityDone?: number; // tracking value from user
  statValues?: FitnessProfileStat[]; // UI for icons
}

export interface FitnessGroup {
  groupId: number;
  name: string;
  description: string;
  isClosed: boolean;
  isAdmin?: boolean;
  groupMembers?: number;
  invitePending?: boolean;
  isSelected?: boolean;
  athleteTypeIds?: number[];
  ageCategoryIds?: number[];
  athleteIds?: number[];
}
export interface FitnessGroupType {
  athleteTypeId: number;
  typeName: string;
  isSelected?: boolean;
}
export interface FitnessAgeCategory {
  ageId: number;
  label: string;
  min: number;
  max: number;
  isSelected?: boolean;
}
export interface FitnessGroupAthlete {
  athleteId: number;
  athleteName: string;
  yearOfBirth: number;
  competeGender: string;
  fitnessLevel: number;
  isSelected?: boolean;
}
