import {Component, OnInit} from "@angular/core";
import {MenuItem} from "../models/ui-objects";
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
  public isAnon = true;
  public currentUser: AppUser;
  public appMenus: MenuItem[] = [];

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
  public dontClose = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  public login = this.authService.toggleLogin;
  public logout = this.authService.logout;
}
