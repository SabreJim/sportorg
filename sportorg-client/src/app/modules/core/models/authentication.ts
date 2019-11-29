
export class AppUser {
  isAnonymous: boolean;
  displayName: string;
  email: string;
  photoURL: string;
  userId: string;
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  providerId?: string;

  constructor() {
    this.isAnonymous = true;
    this.displayName = "Anonymous";
  }
}
