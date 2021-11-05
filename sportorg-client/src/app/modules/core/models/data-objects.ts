
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
  enrolled?: number;

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
  classes?: any;
  daysText?: string;
  seasonName?: string;
  loyaltyDiscount?: string;
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
  memberName?: string;
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
  isLoyaltyMember?: string;
  seasons?: string;
  seasonEnrollments?: MemberSeasonEnrollment[];
}
export interface MemberSeasonEnrollment {
  seasonId: number;
  enrolled: string;
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
  signingConsent?: boolean;
  isFlagged: boolean;
  consentSigned?: boolean;
  signedInBy?: string;
  activeScreenRequired?: boolean;
  screeningAnswers?: ScreeningAnswer[];
  buttonColor?: string;
  buttonText?: string;
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
export interface EnrolledMember {
  memberId: number;
  firstName: string;
  lastName: string;
  isActive: string;
  isAthlete: string;
  isEnrolled: string;
  isLoyaltyMember: string;
}

export interface Invoice {
  invoiceId: number;
  fromId: number;
  fromType: string;
  toId: number;
  toType: string;
  fromName?: string;
  companyName?: string;
  lineItemsJson?: string;
  lineItems?: InvoiceItem[];
  invoiceAmount: string;
  paidAmount?: string;
  updateDate?: string;
  dueDate?: string;
  balance?: string;
  status?: string;
  invoiceValue?: number;
  paidValue?: number;
}
export interface InvoiceItem {
  itemId: number;
  description: string;
  units: number;
  unitPrice: number,
  updateDate?: string;
  isEditing?: boolean;
}

export interface NewInvoice {
  fromId: number;
  fromType: string;
  toId: number;
  toType: string;
  dueDate?: string;
}

export interface Payment {
  paymentId: number;
  fromId: number;
  fromType: string;
  toId: number;
  toType: string;
  invoiceId?: number;
  amount: number;
  paymentMethod?: string;
}

export interface Company {
  companyId: number;
  companyName: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  regionId?: number;
  email?: string;
  regionName?: string;
  regionCode?: string;
}

export interface Season {
  seasonId: number;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  isActive: 'Y' | 'N';
}
export interface Event {
  eventId: number;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  baseCost?: number;
}
export interface EventItem {
  eventId: number;
  eventItemName: string;
  // TBD
}
export interface NewsPost {
  postId: number;
  linkTemplateType: string;
  templateType: string;
  htmlContent?: string;
  headerContent: string;
  headerBackground?: string;
  headerTextColor?: string;
  subHeader?: string;
  headerColor?: string;
  location?: string;
  bannerImageId?: number;
  linkImageId?: number;
  p1?: string;
  p2?: string;
  p3?: string;
  eventId?: number;
  publishDate: string;
  tagIds?: number[];
}
