
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

export interface ProgramDescription {
  year: number;
  seasonId: number;
  levelId: number;
  seasonName: string;
  levelName: string;
  startDate: Date;
  endDate: Date;
  levelDescription: string;
  registrationMethod: string;
  feeId: number;
  feeValue: number;
  registrationLink: string;
  schedule: ProgramSchedule[];
  expanded?: boolean;
  colorId: number;
  colorValue?: string;
  daysText?: string;
}

export interface ProgramSeason {
  seasonId: number;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
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
