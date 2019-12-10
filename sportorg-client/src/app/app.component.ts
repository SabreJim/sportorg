import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, Event, NavigationStart} from "@angular/router";
import {FirebaseAuthService} from "./modules/core/services/firebase-auth.service";
import {LookupProxyService} from "./modules/core/services/lookup-proxy.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    // subscribe to the user's logged in state
    this.authService.enableAuthentication();
  }

  constructor (private appRouter: Router, private authService: FirebaseAuthService,
               private lookupService: LookupProxyService) {
    appRouter.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // if not logged in and required to be, redirect to login
      }
    });
    this.lookupService.refreshLookups(true); // populate lookups initially
  }
}
