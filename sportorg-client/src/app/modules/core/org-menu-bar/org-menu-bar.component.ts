import {Component, OnDestroy, OnInit} from "@angular/core";
import {MenuItem} from "../models/ui-objects";
import {FirebaseAuthService} from "../services/firebase-auth.service";
import {Subscription} from "rxjs";
import {AppUser} from "../models/authentication";
import {LookupProxyService} from "../services/lookup-proxy.service";
import {StaticValuesService} from "../services/static-values.service";
import {MembersProxyService} from "../services/member-proxy.service";
import {MemberAttendance} from "../models/data-objects";
import { MatDialog } from "@angular/material/dialog";
import {CheckinModalComponent} from "../modals/checkin-modal/checkin-modal.component";
import {MemberScreeningModalComponent} from "../modals/member-screening-modal/member-screening-modal.component";
import {SnackbarService} from "../services/snackbar.service";


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

  public loadCheckin = () => {
    this.attendanceSub = this.memberService.getMemberAttendance().subscribe(this.openAttendanceDialog);
  }

  public openScreeningDialog = (member: MemberAttendance) => {
    if (member.activeScreenRequired) {
      // open a dialog to ask active screening questions
      const dialogRef = this.dialog.open(CheckinModalComponent,
        { maxHeight: '80vh', maxWidth: '80vw', minWidth: '60vw', data:
            {member: member, questions: 'active-screening', title: `COVID-19 Active Screening for ${member.firstName}`} });
      dialogRef.afterClosed().subscribe((result: MemberAttendance) => {
        if (result && result.screeningAnswers) {
          this.memberService.logAttendance(result).subscribe((saveResult: any) => {
            if (saveResult && saveResult.flagged){
              SnackbarService.errorWithAction(`Checked in, the athlete should not be allowed entry: ${result.firstName}`, 'Okay');
            } else {
              SnackbarService.notify(`Checked in ${result.firstName}`);
            }
          });
        } else {
          SnackbarService.notify('No members were checked in');
        }
      });
    } else {
      this.memberService.logAttendance(member).subscribe((saveResult: any) => {
        if (saveResult && saveResult.flagged){
          SnackbarService.errorWithAction(`Checked in, the athlete should not be allowed entry: ${member.firstName}`, 'Okay');
        } else {
          SnackbarService.notify(`Checked in ${member.firstName}`);
        }
      });
    }
  }

  public signConsentForm = (member: MemberAttendance) => {
    // open a dialog to ask informed consent questions
    const dialogRef = this.dialog.open(CheckinModalComponent,
      { maxHeight: '80vh', maxWidth: '80vw', minWidth: '60vw', data:
          {member: member, questions: 'club-consent-form', title: `Beaches East Informed Consent`} });
    dialogRef.afterClosed().subscribe((result: MemberAttendance) => {
      if (result && result.screeningAnswers) {
        // update the member records as having signed the consent form
        this.memberService.recordConsent(result).subscribe((saveResult: any) => {
          if (saveResult.accepted) {
            SnackbarService.notify(`Consent form has been signed for: ${member.firstName} ${member.lastName}`);
          } else {
            SnackbarService.notify(`Consent form not completed.`);
          }
        });
      }
    });
  }
  public openAttendanceDialog = (members: MemberAttendance[]) => {
    const dialogRef = this.dialog.open(MemberScreeningModalComponent,
      { maxHeight: '80vh', maxWidth: '80vw', minWidth: '60vw', data: members });
    dialogRef.afterClosed().subscribe((result: MemberAttendance) => {
      if (result && result.memberId) {
        if (result.checkingOut) { // log that the member is leaving the facility
          this.memberService.logAttendance(result).subscribe((saveResult: any) => {
            SnackbarService.notify(`Checked out ${result.firstName}`);
          });
          return;
        }
        if (result.signingConsent) {
          this.signConsentForm(result);
          return;
        }
       // otherwise, go through signin procedure
        this.openScreeningDialog(result);
      }
    });
  }

  public login = this.authService.toggleLogin;
  public logout = this.authService.logout;
}
