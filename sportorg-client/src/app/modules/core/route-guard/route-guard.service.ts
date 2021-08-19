import { Injectable } from '@angular/core';
import {Router, CanActivate, CanLoad, ActivatedRouteSnapshot, Route} from '@angular/router';
import {FirebaseAuthService} from "../services/firebase-auth.service";
import {Observable} from "rxjs";
@Injectable()
export class RouteGuardService implements CanActivate, CanLoad {
  constructor(public auth: FirebaseAuthService, public router: Router) {}
  // for disabling components
  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean>  {
    return new Observable((subscription) => {
      this.auth.CurrentUser.subscribe((user: any) => {
        // after session is established
        if (!this.auth.isAdmin()) {
          this.router.navigate(['/']);
          subscription.next( false);
        }
        subscription.next( true);
      });
      this.auth.getSession(); // kick off the request
    });
  }

  // cannot load admin resources
  public canLoad(route: Route): Observable<boolean> {
    return new Observable((subscription) => {
      this.auth.CurrentUser.subscribe((user: any) => {
        // after session is established
        if (!this.auth.isAdmin()) {
          this.router.navigate(['/']);
          subscription.next( false);
        }
        subscription.next( true);
      });
      this.auth.getSession(); // kick off the request
    });
  }
}
