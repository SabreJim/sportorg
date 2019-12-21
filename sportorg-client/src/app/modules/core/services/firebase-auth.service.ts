import {Injectable} from "@angular/core";
import {auth, initializeApp, User} from "firebase";
import GoogleAuthProvider = auth.GoogleAuthProvider;
import {AppSession, AppUser} from "../models/authentication";
import {Subject} from "rxjs";
import {RestProxyService} from "./rest-proxy.service";
import {ApiResponse} from "../models/rest-objects";
import {StaticValuesService} from "./static-values.service";


@Injectable({providedIn: 'root'})
export class FirebaseAuthService extends RestProxyService {
  protected GProvider: GoogleAuthProvider;
  protected currentUser = new AppUser();

  protected static firebaseConfig = {
    apiKey: "AIzaSyCBp6KkOqUzviAPsp_SN8kNCuvjxOtRXTU",
    authDomain: "beaches-sportorg.firebaseapp.com",
    databaseURL: "https://beaches-sportorg.firebaseio.com",
    projectId: "beaches-sportorg",
    storageBucket: "beaches-sportorg.appspot.com",
    messagingSenderId: "956479771755",
    appId: "1:956479771755:web:3e4fa425cbeb936c1c4d2e",
    measurementId: "G-1LSQT1661Y"
  };

  public CurrentUser = new Subject<AppUser>();
  public enableAuthentication = () => {
    // Initialize Firebase
    initializeApp(FirebaseAuthService.firebaseConfig);
    // analytics();
    this.GProvider = new auth.GoogleAuthProvider();
    auth().onAuthStateChanged((user: User) => {
      if (user) { // User is signed in.
       this.currentUser.displayName = user.displayName;
        this.currentUser.email = user.email;
        this.currentUser.isAnonymous = false;
        this.currentUser.photoURL = user.photoURL;
        this.currentUser.userId = user.uid;
        this.currentUser.providerId = 'google.com';
        this.getSession();
      } else {
        this.logout();
      }
    });
  };

  public toggleLogin = (authName: string) => {
    if (this.currentUser.isAnonymous) {
      auth().signInWithPopup(this.GProvider).then((result) => {
      }).catch(function(error) {
        // Handle Errors here.
      });
    } else {
      this.logout();
    }
  };

  public getSession = (): void => {
    if (this.currentUser && !this.currentUser.isAnonymous) {
      auth().currentUser.getIdToken().then((actualToken) => {
        this.get('session-token', {token: actualToken} ).subscribe((response: ApiResponse<AppSession>) => {
          if (response.hasErrors()) {
            this.currentUser = new AppUser();
            this.CurrentUser.next(this.currentUser);
          }
          // update the token so subsequent requests can be authenticated
          StaticValuesService.setToken(response.data.sessionToken);
          this.currentUser.isAdmin = response.data.isAdmin === 'Y';
          this.currentUser.isActive = response.data.isActive === 'Y';
          this.CurrentUser.next(this.currentUser);
        });
      });
    } else {
      this.CurrentUser.next(this.currentUser);
    }
  };

  public isAdmin = (): boolean => {
    return (this.currentUser && !this.currentUser.isAnonymous && this.currentUser.isAdmin);
  }

  public logout = (): void => {
    const purgeSession = () => {
      StaticValuesService.setToken(''); // clear the header token
      this.currentUser = new AppUser(); // reset the user state
      this.CurrentUser.next(this.currentUser); // notify any listeners
      auth().signOut(); // end the firebase session client-side
      this.appRouter.navigate(['/']);
    }
    if (StaticValuesService.getToken()) {
      // send a signal to the app server to clear the session
      this.put('end-session', {token: StaticValuesService.getToken()} ).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors()) {
          console.log('Error logging out user', response.message);
          purgeSession();
        }
       purgeSession();
      });
    } else {
      purgeSession();
    }
  }
}
