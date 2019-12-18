import { Injectable } from '@angular/core';
import {Router, CanActivate, CanLoad, ActivatedRouteSnapshot, Route} from '@angular/router';
import {FirebaseAuthService} from "../services/firebase-auth.service";
@Injectable()
export class RouteGuardService implements CanActivate, CanLoad {
  constructor(public auth: FirebaseAuthService, public router: Router) {}
  // for disabling components
  public canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/'])
      return false;
    }
    return true;
  }

  // cannot load admin resources
  public canLoad(route: Route): boolean {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
