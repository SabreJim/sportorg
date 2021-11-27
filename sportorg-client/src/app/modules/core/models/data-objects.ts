import {LookupItem} from "./rest-objects";

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

export interface Circuit {
  circuitId: number;
  circuitName: string;
  athleteTypeId: number;
  ageCategoryId: number;
  eventRegionId?: number;
  maxEventNum?: number;
  genderId: number;
}
export interface CircuitRanking {
  circuitId: number;
  athleteId: number;
  rank: number;
}

export interface ScheduledEvent {
  scheduledEventId: number;
  scheduledEventName: string;
  hostClubName?: string;
  hostClubId?: number;
  eventLogoId?: number;
  locationName?: string;
  locationAddress?: string;
  mapLinkUrl?: string;
  contactEmail?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadlineDate?: string;
  externalRegistrationLink?: string;
  ages?: string;
  ageOptions?: string[];
  eventTypes?: string;
  eventTypeOptions?: string[];
  descriptionHtml?: string;
  registrationOpen?: string;
  events?: EventItem[];
}


export interface EventItem {
  eventId: number;
  eventName: string;
  primaryAgeCategoryId?: number;
  primaryAgeCategory?: string;
  gender?: string;
  genderId?: number;
  athleteTypeId?: number;
  athleteType?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  scheduledEventId?: number;
  circuitId?: number;
  circuitName?: string;
}
export interface EventConfiguration {
  eventId: number;
  eventName: string;
  scheduledEventId?: number;
  primaryAgeCategoryId?: number;
  eventAgeCategory?: string;
  athleteTypeId?: number;
  athleteType?: string;
  genderId?: number;
  gender?: string;
  eventDate?: string;
  startTime?: string;
  circuitId?: number;
  eventRankCircuitIds?: number[];
  eventRankCircuits?: string[];
  eventStatusId?: number;
  eventStatus: string;
  consentRequired?: string;
  registeredNum?: number;
  checkedInNum?: number;
  rankedNum?: number;
  rounds?: EventRound[];
  athletes?: EventAthlete[];
}

export interface EventRound {
  eventId: number;
  eventRoundId: number;
  roundTypeId: number;
  eventRoundStatusId: number;
  athletesInRound?: number;
  athletesReady?: number;
  athletesPromoted?: number;
  promotedPercent?: number;
  rankedAthletes: EventAthleteRank[];
  roundDescription?: string;
  roundName?: string;
  preferredPoolSize: number;
  poolSizes?: string;
  numberOfPools?: number;
  completedPools?: number;
  tableauSize?: number;
  poolRoundsUsed?: number[];
  poolRoundOptions?: LookupItem[];
  rankFromPoolsJson?: string;
  selectionCriteria?: string;
  selectedDeLevel?: number;
  refreshFlag?: boolean;
  relatedRoundStatusId?: number;
}

export interface EventAthleteRank {
  athleteId: number;
  rank: number;
}
export interface EventAthlete {
  athleteId: number;
  firstName: string;
  lastName: string;
  competeGender: string;
  competeAge?: number;
  isRegistered?: string;
  eventMinAge?: number;
  eventMaxAge?: number;
  eventGender?: string;
  registrationMessage?: string;
  club?: string;

}
export interface EventPoolAthlete extends EventAthlete {
  poolOrder?: number;
  roundRank?: number;
  poolScores?: PoolAthleteScore[];
  poolVictories?: number;
  poolMatches?: number;
  poolVictoryPercent?: number;
  poolHitsScored?: number;
  poolHitsReceived?: number;
  poolDiff?: number;
  poolRank?: number;
}
export interface PoolOrderItem {
  athlete1Id: number;
  athlete1FirstName?: string;
  athlete1LastName?: string;
  athlete1Score?: number;
  athlete2Id: number;
  athlete2FirstName?: string;
  athlete2LastName?: string;
  athlete2Score?: number;
  completed: string;
  orderText: string;
  scoreOrderNum: number;
}

export interface EventAthleteStatus {
  eventId?: number;
  athleteId?: number;
  registered?: boolean;
  consentSigned?: boolean;
  checkedIn?: boolean;
  withdrawn?: boolean;
  excluded?: boolean;
  paid?: boolean;
}

export interface EventPool {
  poolId: number;
  poolName: string;
  poolNumber?: number;
  refereeId?: number;
  assignedPiste?: string;
  lastUpdateIndex: number;
  currentMatch?: number;
  completedMatches?: number;
  matchesNum?: number;
  athletes: EventPoolAthlete[];
  eventId: number;
  eventRoundStatusId?: number;
  boutOrders?: PoolOrderItem[];
}

export interface PoolAthleteScore {
  poolId: number;
  athleteId: number;
  score: number;
  vsAthlete: number;
  vsScore: number;
  scoreOrderNum: number;
  vsOrder: number;
  completed: string;
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
