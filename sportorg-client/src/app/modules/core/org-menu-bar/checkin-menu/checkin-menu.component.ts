import {Component, OnDestroy, OnInit} from "@angular/core";
import {MembersProxyService} from "../../services/member-proxy.service";
import {MemberAttendance} from "../../models/data-objects";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../services/static-values.service";
import {CheckinModalComponent} from "../../modals/checkin-modal/checkin-modal.component";
import {SnackbarService} from "../../services/snackbar.service";
import {MemberScreeningModalComponent} from "../../modals/member-screening-modal/member-screening-modal.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'checkin-menu',
  templateUrl: './checkin-menu.component.html',
  styleUrls: ['./checkin-menu.component.scss']
})
export class CheckinMenuComponent implements OnDestroy {
  constructor (protected memberService: MembersProxyService, protected dialog: MatDialog) {

  }

  protected memberSub: Subscription;
  public myMembers: MemberAttendance[] = [];
  public getMembers = () => {
    this.memberSub =this.memberService.getMemberAttendance().subscribe((members: MemberAttendance[]) => {
      this.myMembers = members.map((row: MemberAttendance) => {
        if (!row.consentSigned) {
          row.buttonColor = 'red';
          row.buttonText = 'Consent';
        } else {
          if (row.checkedIn) {
            row.buttonColor = 'green';
            row.buttonText = 'Check Out';
          } else {
            row.buttonText = 'Check In';
          }
        }
        return row;
      });
    });
  }

  public doCheckinAction = (row: MemberAttendance) => {
    if (!row) return;
    if (!row.consentSigned) { // open the consent dialog
      return this.signConsentForm(row);
    }
    if (!row.checkedIn) { // check the member in, and optionally fire the screening dialog
      return this.openScreeningDialog(row);
    }
    // must be checking out then
    row.checkingOut = true;
    this.memberService.logAttendance(row).subscribe((saveResult: any) => {
      SnackbarService.notify(`Checked out ${row.firstName}`);
    });
  }

  protected openScreeningDialog = (member: MemberAttendance) => {
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

  protected signConsentForm = (member: MemberAttendance) => {
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

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.memberSub]);
  }
}
