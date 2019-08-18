
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

export interface ProgramLevel {
  levelId: number;
  levelName: string;
  levelValue: number;
  levelDescription: string;
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
  levelName: string;
  locationId: number;
  sessionId: number;
  minAge: number;
  maxAge: number;
}
