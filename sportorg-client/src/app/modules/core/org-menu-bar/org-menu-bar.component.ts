import {Component, OnInit} from "@angular/core";
import {MenuItem, RecentItem} from "../models/ui-objects";
import {FirebaseAuthService} from "../services/firebase-auth.service";
import {Subscription} from "rxjs";
import {AppUser} from "../models/authentication";
import {LookupProxyService} from "../services/lookup-proxy.service";


@Component({
  selector: 'org-menu-bar',
  templateUrl: './org-menu-bar.component.html',
  styleUrls: ['./org-menu-bar.component.scss']
})
export class OrgMenuBarComponent implements OnInit {
  constructor(private authService: FirebaseAuthService, private lookupService: LookupProxyService) { }
  protected userSub: Subscription;
  public isStuck: false;
  public isAnon = true;
  public currentUser: AppUser;
  public appMenus: MenuItem[] = [];

  // TODO: also switch over to REST request
  public recentItems: RecentItem[] = [
    {title: 'CFF Registration', link: 'http://www.fencing.ca', type: 'external'},
    {title: 'Beaches Renovations', link: '/about-us', type: 'internal'},
    {title: 'New Class Structure', link: '/classes', type: 'internal'}
  ];

  public exampleClick = (value: RecentItem) => {

  }
  ngOnInit(): void {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.isAnon = user.isAnonymous;
      this.currentUser = user;
    });
    this.lookupService.getMenus().subscribe((menus: MenuItem[]) => {
      this.appMenus = menus;
    });
  }
  ngOnDestroy(): void {
    if (this.userSub && this.userSub.unsubscribe) {
      this.userSub.unsubscribe();
    }
  }
  public login = this.authService.toggleLogin;
  public logout = this.authService.logout;
}
