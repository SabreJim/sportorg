
export class AppUser {
  isAnonymous: boolean;
  displayName: string;
  email: string;
  photoURL: string;
  userId: string;
  idToken: string;
  providerId?: string;
  sessionToken?: string;
  isAdmin?: boolean;
  isFitnessAdmin?: boolean;
  isActive?: boolean;

  constructor() {
    this.isAnonymous = true;
    this.displayName = "Anonymous";
    this.isAdmin = false;
    this.isFitnessAdmin = false;
  }
}

export interface AppSession {
  uid: string;
  sessionToken: string;
  isAdmin: string;
  isFitnessAdmin?: string;
  memberId: string;
  isActive: string;
}
export interface UserData { // for managing other users
  userId: number;
  email: string;
  isAdmin: 'Y' | 'N';
  googleId?: string;
  fbId?: string;
  twitterId?: string;
}

export interface UserProfile {
  userId: number;
  displayName: string;
  loginMethod: string;
  hasMember?: string;
  myEmail?: string;
  myAddress?: string;
  myFencers?: string;
}
