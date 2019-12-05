
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

  constructor() {
    this.isAnonymous = true;
    this.displayName = "Anonymous";
  }
}

export interface AppSession {
  uid: string;
  sessionToken: string;
}
