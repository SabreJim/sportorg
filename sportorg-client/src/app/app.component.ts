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
  // app names
  public readonly SPORT_ORG = 'sportOrg';
  public readonly FITNESS = 'fitnessTracker';
  public appInUse: string = this.SPORT_ORG;
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
        if (event.url && event.url.toLowerCase && (event.url.toLowerCase()).includes('fitness-tracker')){
          this.appInUse = this.FITNESS;
        } else {
          this.appInUse = this.SPORT_ORG;
        }
      }
    });
    this.lookupService.refreshLookups(true); // populate lookups initially
  }
  public sidebarExpanded = false;
  public toggleExpand = (doExpand: boolean) => {
    this.sidebarExpanded = doExpand;
  }


}
