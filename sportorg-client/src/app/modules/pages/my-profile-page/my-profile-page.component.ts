import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {AppMember, Enrollment} from "../../core/models/data-objects";
import {MemberModalComponent} from "../../core/modals/member-modal/member-modal.component";
import {MatDialog} from "@angular/material";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppUser} from "../../core/models/authentication";
import {Subscription} from "rxjs";
import {EnrollmentProxyService} from "../../core/services/enrollment-proxy.service";

@Component({
  selector: 'app-my-profile-page',
  templateUrl: './my-profile-page.component.html',
  styleUrls: [ '../shared-page.scss',
    './my-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyProfilePageComponent implements OnInit {

  constructor(public dialog: MatDialog, private memberService: MembersProxyService,
              private authService: FirebaseAuthService, private enrollService: EnrollmentProxyService,
              private detector: ChangeDetectorRef) { }

  ngOnInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.currentUser = user;
      this.getMembers(); // get members after being authenticated
      this.getEnrollments();
    });
    this.authService.getSession();
  }
  protected userSub: Subscription;
  protected currentUser: AppUser;

  public myMembers: AppMember[] = [];
  protected selectedMember: AppMember;
  public memberColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'name', title: 'Name', type: 'string', displayType: 'long-string'}),
    new TableColumn('yearOfBirth', 'Year of Birth', 'number'),
    new TableColumn('competeGender', 'Competition Gender', 'string'),
    new TableColumn('membershipStart', 'Joined', 'date'),
    TableColumn.fromConfig({fieldName: 'email', title: 'Contact Email', type: 'string', displayType: 'long-string'}),
    new TableColumn('license', 'License #', 'number'),
    TableColumn.fromConfig({fieldName: 'streetAddress', title: 'Address', type: 'string', displayType: 'long-string'}),
    new TableColumn('cellPhone', 'Cell #', 'string'),
    new TableColumn('homePhone', 'Home #', 'string')
  ];
  public getMembers = () => {
    this.memberService.getMyMembers().subscribe((myMembers: AppMember[]) => {
      this.myMembers = myMembers;
      this.detector.detectChanges();
    });
  };
  public selectMembers = (selectedMembers: AppMember[]) => {
    if (selectedMembers.length) {
      this.selectedMember = selectedMembers[0];
      this.detector.detectChanges();
    }
  };
  public editMyMember = () => {
    if (!this.selectedMember || !this.selectedMember.memberId) return;

    // open a modal and pass in the member
    // open a modal to create a new member
    const dialogRef = this.dialog.open(MemberModalComponent,
      { width: '80vw', height: '80vh', data: this.selectedMember })
    dialogRef.afterClosed().subscribe((result: AppMember) => {
      if (result && result.firstName && result.lastName && result.email) {
        this.memberService.upsertMember(result).subscribe((saveResult: boolean) => {
          this.getMembers();
        });
      }
    });
  }

  // Enrollments configuration
  public myEnrollments: Enrollment[] = [];
  protected selectedEnrollment: Enrollment;
  public enrollColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Member', type: 'string', displayType: 'long-string'}),
    TableColumn.fromConfig({fieldName: 'programName', title: 'Program', type: 'string', displayType: 'long-string'}),
    new TableColumn('dayName', 'Day', 'string'),
    new TableColumn('times', 'Times', 'string'),
    new TableColumn('ages', 'Ages', 'string'),
    new TableColumn('startDate', 'Start date', 'date'),
    new TableColumn('endDate', 'End date', 'date'),
    new TableColumn('seasonName', 'Season', 'string'),
    new TableColumn('programFees', 'Fees', 'number'),
    new TableColumn('enrolledCost', 'Amount Charged', 'number')
  ];

  public getEnrollments = () => {
    this.enrollService.getMyEnrollments().subscribe((myEnrollments: Enrollment[]) => {
      this.myEnrollments = myEnrollments;
      this.detector.detectChanges();
    });
  }
  public selectEnrollments = (selectedEnrollment: Enrollment[]) => {
    if (selectedEnrollment.length) {
      this.selectedEnrollment = selectedEnrollment[0];
      this.detector.detectChanges();
    }
  };
  public withdrawFromClass = () => {
    if (!this.selectedEnrollment || !this.selectedEnrollment.enrollId) return;
  }
}
