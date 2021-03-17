import {Component, OnDestroy, OnInit} from "@angular/core";
import {MenuItem} from "../models/ui-objects";
import {FirebaseAuthService} from "../services/firebase-auth.service";
import {Subscription} from "rxjs";
import {AppUser} from "../models/authentication";
import {LookupProxyService} from "../services/lookup-proxy.service";
import {StaticValuesService} from "../services/static-values.service";
import {MembersProxyService} from "../services/member-proxy.service";
import { MatDialog } from "@angular/material/dialog";


@Component({
  selector: 'org-menu-bar',
  templateUrl: './org-menu-bar.component.html',
  styleUrls: ['./org-menu-bar.component.scss']
})
export class OrgMenuBarComponent implements OnInit, OnDestroy {
  constructor(private authService: FirebaseAuthService, private lookupService: LookupProxyService,
              private memberService: MembersProxyService, public dialog: MatDialog) { }
  protected userSub: Subscription;
  protected attendanceSub: Subscription;
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
    StaticValuesService.cleanSubs([this.userSub, this.attendanceSub]);
  }
  public dontClose = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  public login = this.authService.toggleLogin;
  public logout = this.authService.logout;
}
