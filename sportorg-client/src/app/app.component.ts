import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Router, Event, NavigationStart} from "@angular/router";
import {FirebaseAuthService} from "./modules/core/services/firebase-auth.service";
import {LookupProxyService} from "./modules/core/services/lookup-proxy.service";
import {AppStatus} from "./modules/core/models/ui-objects";
import {Subscription} from "rxjs";
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import {StaticValuesService} from "./modules/core/services/static-values.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  // app names
  public readonly SPORT_ORG = 'beachesEast';
  public readonly FITNESS = 'fitnessTracker';
  public isMobile = false;
  public appInUse: string = this.SPORT_ORG;
  protected statusSub: Subscription;
  protected bannerRef: MatSnackBarRef<SimpleSnackBar>;
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.statusSub]);
  }

  ngOnInit(): void {
    // subscribe to the user's logged in state
    this.authService.enableAuthentication();
    this.isMobile = StaticValuesService.checkMobile();
  }
  ngAfterViewInit(): void {

    this.statusSub = this.lookupService.getAppStatus().subscribe((banners: AppStatus[]) => {
      const firstMatch = banners.find((banner) => {
        return banner.bannerActive === 'Y' && banner.appName === this.appInUse;
      });
      if (firstMatch && firstMatch.statusId) {
        this.dismissBannerFn = this.dismissBanner;
        this.bannerRef = this.matSnackBar.open(firstMatch.bannerText, 'read more',
          { duration: 0,
            panelClass: 'banner-panel',
            horizontalPosition: 'center',
            verticalPosition: 'top',
            data: { message: firstMatch.bannerText, moreText: 'read more', link: firstMatch.bannerLink }
          });
          this.bannerRef.onAction().subscribe(() => {
            this.dismissBannerFn = () => {};
            // redirect to the page listed in the banner
            this.appRouter.navigate([firstMatch.bannerLink]);
        });
      }
    });
  }

  protected dismissBanner = () => {
    if (this.bannerRef && this.bannerRef.dismiss) {
      this.bannerRef.dismiss();
    }
  }
  public dismissBannerFn = () => {}
  constructor (private appRouter: Router, private authService: FirebaseAuthService,
               private lookupService: LookupProxyService, protected matSnackBar: MatSnackBar) {
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
