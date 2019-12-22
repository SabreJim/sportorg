
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
  isActive?: boolean;

  constructor() {
    this.isAnonymous = true;
    this.displayName = "Anonymous";
  }
}

export interface AppSession {
  uid: string;
  sessionToken: string;
  isAdmin: string;
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
