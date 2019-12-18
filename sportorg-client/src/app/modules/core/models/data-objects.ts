
export interface Class {
  classId: number;
  year: number;
  seasonId: number;
  levelId: number;
  minAge: number;
  maxAge: number;
  location: string;
  season: string;
  levelName: string;
  startDate: string;
  endDate: string;
  schedule: ClassDateTime[]
}

export interface ClassDateTime {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ClassRecord {
  colorId: number;
  dayOfWeek: string;
  dayId: number;
  endDate: string;
  endTime: string;
  programName: string;
  locationId: number;
  locationName: string;
  maxAge: number;
  minAge: number;
  programId: number;
  scheduleId: number;
  seasonId: number;
  seasonName: string;
  startDate: string;
  startTime: string;
  duration: number;

  year?: number;
  feeId: number;
  feeValue: number;
}

export interface ProgramRecord {
  programId: number;
  programName: string;
  locationId: number;
  locationName: string;
  feeId: number;
  feeValue: number;
  registrationMethod: string;
  programDescription: string;
  colorId: number;
  isActive: 'Y' | 'N';
  expanded?: boolean;
  colorValue?: string;
}

export interface ProgramSchedule {
  scheduleId: number;
  programId: number;
  locationName: string;
  startDate: Date;
  endDate: Date;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration?: number;
  levelName: string;
  locationId: number;
  sessionId: number;
  minAge: number;
  maxAge: number;
  colorId: number;
}

export interface FeeStructure {
  feeId: number;
  feeValue: number;
  feePeriod: string;
  feeName: string;
  feeDescription: string;
  registrationLink: string;
  expanded?: boolean;
}
