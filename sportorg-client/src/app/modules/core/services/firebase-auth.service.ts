import {Injectable} from "@angular/core";
import {auth, initializeApp, User} from "firebase";
import GoogleAuthProvider = auth.GoogleAuthProvider;
import {AppUser} from "../models/authentication";
import {Subject} from "rxjs";
import {RestProxyService} from "./rest-proxy.service";
import {ApiResponse} from "../models/rest-objects";


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
    console.log('made provider', this.GProvider );
    auth().onAuthStateChanged((user: User) => {
      if (user) { // User is signed in.
       this.currentUser.displayName = user.displayName;
        this.currentUser.email = user.email;
        this.currentUser.isAnonymous = false;
        this.currentUser.photoURL = user.photoURL;
        this.currentUser.userId = user.uid;
        this.currentUser.refreshToken = user.refreshToken;
        this.currentUser.providerId = 'google.com';
       console.log('got user?', this.currentUser);
        this.getSession();
        this.CurrentUser.next(this.currentUser);
      } else {
        console.log('no user found');
        this.logout();
      }
    });
  }
  public logout = () => {
    auth().signOut();
    this.currentUser = new AppUser();
    this.CurrentUser.next(this.currentUser);
  }
  public toggleLogin = (authName: string) => {
    if (this.currentUser.isAnonymous) {
      auth().signInWithPopup(this.GProvider).then((result) => {
        console.log('popup result', result);
      }).catch(function(error) {
        // Handle Errors here.
      });
    } else {
      this.logout();
    }
  }

  public getSession = (): void => {
    if (this.currentUser && !this.currentUser.isAnonymous) {
      auth().currentUser.getIdToken().then((actualToken) => {
        console.log('getIDToken worked?', actualToken);
        this.get('session', {token: actualToken} ).subscribe((response: ApiResponse) => {
          if (response.hasErrors()) {
            console.log('Error verifying user', response.message);
          }
          console.log('got back session?', response);
        });
      });
    } else {
      console.log('anonymous use', this.currentUser);
    }
  }
}
