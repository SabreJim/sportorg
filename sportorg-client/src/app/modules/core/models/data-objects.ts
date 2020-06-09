
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

export interface AppMember {
  memberId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  name: string;
  yearOfBirth: number;
  competeGender: 'M' | 'F',
  isActive: 'Y' | 'N';
  isAthlete: 'Y' | 'N';
  membershipStart: string;
  streetAddress? : string;
  city? : string;
  provinceId?: number;
  provinceName?: string;
  postalCode? : string;
  email?: string;
  cellPhone?: string;
  homePhone?: string;
  license: string;
  confirmed?: 'Y' | 'N';
}
export interface MemberAttendance {
  memberId: number;
  lastName: string;
  firstName: string;
  checkedIn: boolean;
  checkInTime?: string;
  checkedOut?: boolean;
  checkOutTime?: string;
  checkingOut?: boolean;
  isFlagged: boolean;
  signedInBy?: string;
  activeScreenRequired?: boolean;
  screeningAnswers?: ScreeningAnswer[];
}
export interface ScreeningAnswer {
  questionId: number;
  answerId: number;
  answerText?: string;
  answerValue?: string;
}
export interface ScreeningQuestion {
  questionId: number;
  parentQuestionId?: number;
  questionText: string;
  answerValue?: number;
  answers: ScreeningAnswer[];
  childQuestions?: ScreeningQuestion[];
}
export interface AppMemberUser {
  userId: number;
  email: string;
  memberId: number;
  memberName: string;
}
export interface RegistrationConfig {
  seasonId: number;
  programId: number;
  scheduleIds: number[];
  memberId: number;
}

export interface Enrollment {
  enrollId: number;
  memberId: number;
  memberName: string;
  scheduleId: number;
  programName: string;
  dayName: string;
  times: string;
  ages: string;
  startDate: string;
  endDate: string;
  seasonId: number;
  seasonName: string;
  programFee: number;
  enrolledCost: number;
}
