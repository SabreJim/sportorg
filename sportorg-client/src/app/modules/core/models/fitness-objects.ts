export interface FitnessProfile {
  athleteId: number;
  firstName: string;
  lastName: string;
  yearOfBirth: number;
  competeGender: 'M' | 'F';
  stats: FitnessProfileStat[];
  isEpee?: string;
  isFoil?: string;
  isSabre?: string;
  lastWorkout?: string;
  generatedFromMember?: boolean; // when a member exists for the user, but no fitness profile yet
  memberId?: number;
  createNewPlaceholder?: boolean;
  fitnessLevel?: number;
  fitnessLevelProgress?: number;

}
export interface FitnessProfileStat {
  name: string;
  value: number;
  icon?: string;
  progress?: number;
}

export interface ExerciseLogResults {
  athleteId: number;
  changes: FitnessProfileStat[];
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
  name: string;
  description: string;
  iconType: string;
  iconName: string;
  imageId: number;
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
