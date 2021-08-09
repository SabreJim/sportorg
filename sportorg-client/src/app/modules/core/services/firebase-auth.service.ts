import {Injectable} from "@angular/core";
import {AngularFireAuth} from "@angular/fire/auth";
import firebase from 'firebase/app';
// import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
// import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import {AppSession, AppUser, UserData, UserProfile} from "../models/authentication";
import {Observable, Subject} from "rxjs";
import {RestProxyService} from "./rest-proxy.service";
import {ApiResponse} from "../models/rest-objects";
import {StaticValuesService} from "./static-values.service";
import {SnackbarService} from "./snackbar.service";
import {AppMemberUser} from "../models/data-objects";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Injectable({providedIn: 'root'})
export class FirebaseAuthService extends RestProxyService {
  // protected GProvider: GoogleAuthProvider;
  // protected FProvider: FacebookAuthProvider;
  protected currentUser = new AppUser();

  constructor (public auth: AngularFireAuth, protected _http: HttpClient, protected appRouter: Router) {
    super(_http, appRouter);
  }

  public CurrentUser = new Subject<AppUser>();
  public Users = new Subject<UserData[]>();
  public enableAuthentication = () => {
    // Initialize Firebase
    // this.auth.initializeApp(FirebaseAuthService.firebaseConfig);
    // analytics();
    // this.GProvider = new firebase.auth.GoogleAuthProvider();
    // this.FProvider = new firebase.auth.FacebookAuthProvider();
    this.auth.onAuthStateChanged((user: firebase.User) => {
      if (user) { // User is signed in.
       this.currentUser.displayName = user.displayName;
        this.currentUser.email = user.email;
        this.currentUser.isAnonymous = false;
        this.currentUser.photoURL = user.photoURL;
        this.currentUser.userId = user.uid;
        this.currentUser.providerId = 'google.com';
        this.getSession();
      } else {
        this.logout(true);
      }
    });
  };

  protected authErrorHandler = (error, serviceName) => {
    if (!error || !error.code) return; // can't parse error type
    if (error.code.indexOf('account-exists-with-different-credential') !== -1) {
      // Firebase only allows one login per email, regardless of platform
      SnackbarService.errorWithAction(`${error.message} Email: ${error.email}`, 'Okay');
    } else {
      SnackbarService.error(`Sorry, there was a problem logging you in with the ${serviceName} authentication service. Please try again later.`);
    }
    this.logout(); // clean up session
  }

  public toggleLogin = (authName: string) => {
    if (this.currentUser.isAnonymous) {
      switch (authName) {
        case 'fb':
          this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then((result) => {
          }).catch(err => this.authErrorHandler(err, 'Facebook'));
          break;
        case 'twitter':
          this.logout();
          break;
        case 'google': // default to google
        default:
          this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
          }).catch(err => this.authErrorHandler(err, 'Google'));
          break;
      }

    } else {
      this.logout();
    }
  };

  public getSession = (): void => {
    if (this.currentUser && !this.currentUser.isAnonymous) {
      this.auth.currentUser.then((user: firebase.User) => {
        user.getIdToken().then((actualToken) => {
          this.get('session-token', {token: actualToken} ).subscribe((response: ApiResponse<AppSession>) => {
            if (response.hasErrors()) {
              this.currentUser = new AppUser();
              this.CurrentUser.next(this.currentUser);
              return;
            }
            // update the token so subsequent requests can be authenticated
            StaticValuesService.setToken(response.data.sessionToken);
            this.currentUser.isAdmin = response.data.isAdmin === 'Y';
            this.currentUser.isFitnessAdmin = response.data.isFitnessAdmin === 'Y';
            this.currentUser.isActive = response.data.isActive === 'Y';
            this.CurrentUser.next(this.currentUser);
          });
        });
      });

    } else {
      this.CurrentUser.next(this.currentUser);
    }
  };

  public getMyProfile = (): Observable<UserProfile> => {
    return new Observable((subscription) => {
      this.get('my-user-profile/').subscribe((response: ApiResponse<UserProfile>) => {
        if (response.hasErrors()) {
          SnackbarService.error('Your profile could not be loaded at this time');
          subscription.next(null);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {
      });
    });
  };

  public isAdmin = (): boolean => {
    return (this.currentUser && !this.currentUser.isAnonymous && this.currentUser.isAdmin);
  }

  public logout = (skipRedirect: boolean = false): void => {
    const purgeSession = () => {
      StaticValuesService.setToken(''); // clear the header token
      this.currentUser = new AppUser(); // reset the user state
      this.CurrentUser.next(this.currentUser); // notify any listeners
      this.auth.signOut(); // end the firebase session client-side
      if (!skipRedirect) {
        this.appRouter.navigate(['/']);
      }
    }
    if (StaticValuesService.getToken()) {
      // send a signal to the app server to clear the session
      this.put('end-session', {token: StaticValuesService.getToken()} ).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Error logging out user`);
          purgeSession();
        }
       purgeSession();
      });
    } else {
      purgeSession();
    }
  }

  // users endpoints for admin access
  public getUsers = (): Observable<UserData[]> => {
    return new Observable((subscription) => {
      this.get('users/').subscribe((response: ApiResponse<UserData[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('There was an error getting users');
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
          this.Users.next(response.data || []);
        }
      }, (error: any) => {});
    });
  };

  public upsertUser = (userBody: UserData): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('user', userBody).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error updating this user: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify('User updated successfully');
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
  public deleteUser = (userBody: UserData): Observable<boolean> => {
    return new Observable((subscription) => {
      const userId = userBody.userId;
      if (!userId) { // no ID to delete on
        subscription.next(false);
      }
      this.delete(`users/${userId}`).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error deleting this user: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify('User deleted successfully');
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public getMemberUsers = (): Observable<AppMemberUser[]> => {
    return new Observable((subscription) => {
      this.get('member-users/').subscribe((response: ApiResponse<AppMemberUser[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('There was an error getting users');
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  };
  public setMemberLink = (memberId: number, userId: number, setLinked: boolean): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`/member-users/member/${memberId}/user/${userId}/link/${setLinked}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error updating this user: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify('User updated successfully');
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}
