import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AppMember,
  ClassRecord,
  EnrolledMember,
  ProgramRecord,
  RegistrationConfig
} from "../../core/models/data-objects";
import {Subscription} from "rxjs";
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";
import {LookupItem} from "../../core/models/rest-objects";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import { MatDialog } from "@angular/material/dialog";
import { MatStepper } from "@angular/material/stepper";
import {MemberModalComponent} from "../../core/modals/member-modal/member-modal.component";
import {EnrollmentProxyService} from "../../core/services/enrollment-proxy.service";
import {SnackbarService} from "../../core/services/snackbar.service";


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './register-page.component.scss'
  ]
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  public readonly LOYALTY_DISCOUNT = 50;
  public readonly FAMILY_DISCOUNT = 10;
  public currentUser: AppUser;
  protected userSub: Subscription;
  protected programSub: Subscription;
  protected classesSub: Subscription;
  protected memberSub: Subscription;
  public currentRegistration: RegistrationConfig = {
    seasonId: null,
    programId: null,
    scheduleIds: [],
    memberId: null
  };
  public allPrograms: LookupItem[] = [];
  public currentProgram: LookupItem;
  public currentSeason: LookupItem;
  public currentClasses: ClassRecord[];
  public currentMember: LookupItem;
  public enrolledMembers: EnrolledMember[] = [];
  public availableMembers: LookupItem[] = [];
  public finalCost: string = '';
  protected allClasses: ClassRecord[] = [];
  public includedClasses: ClassRecord[] = [];

  constructor(private authService: FirebaseAuthService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, private memberService: MembersProxyService,
              public dialog: MatDialog, private enrollmentService: EnrollmentProxyService) {
  }

  public selectSeason = (season: LookupItem) => {
    if (season && season.id) {
      this.currentRegistration.seasonId = season.id;
      this.currentSeason = season;
      this.enrollmentService.getMyEnrolledMembers(season.id);
    } else {
      this.currentRegistration.seasonId = null;
      this.currentSeason = null;
    }
  };

  public selectProgram = (program: LookupItem) => {
    if (program && program.id) {
      this.currentRegistration.programId = program.id;
      this.currentProgram = program;
      this.includedClasses = this.allClasses.filter((c: ClassRecord) => {
        return c.seasonId === this.currentRegistration.seasonId && c.programId === this.currentRegistration.programId;
      });
    } else {
      this.currentRegistration.programId = null;
      this.currentProgram = null;
    }
  };

  public selectMember = (member: LookupItem) => {
    if (member) {
      this.currentMember = member;
      this.currentRegistration.memberId = this.currentMember.id;
    } else {
      this.currentMember = null;
      this.currentRegistration.memberId = null;
    }
    this.calculateCost();
  };

  // pre-calculate the costs
  protected calculateCost = () => {
    if (this.currentProgram && this.currentMember) {
      let cost = this.currentProgram.numberValue || 0;
      if (this.currentMember.description === 'Y') { // loyalty member discount
        cost = Math.max(0, cost - this.LOYALTY_DISCOUNT);
      }
      if (this.enrolledMembers.length) { // apply family discount if another member has been signed up by this user
        cost = cost * (100 - this.FAMILY_DISCOUNT) / 100;
      }
      this.finalCost = `$${cost}`;
    } else {
      this.finalCost = '';
    }
  }
  public openAddMember = () => {
    // open a modal to create a new member
    const dialogRef = this.dialog.open(MemberModalComponent,
      { width: '80vw', height: '80vh', data: { email: this.currentUser.email } });
    dialogRef.afterClosed().subscribe((result: AppMember) => {
      if (result && result.firstName && result.lastName && result.email) {
        result.membershipStart = StaticValuesService.cleanDate((new Date()).toISOString());
        this.memberService.upsertMember(result).subscribe((saveResult: boolean) => {
          this.enrollmentService.getMyEnrolledMembers(this.currentRegistration.seasonId);
        });
      }
    });
  };

  public requestMemberAccess = () => {
    // TODO: open a dialog to create an access request
    SnackbarService.notify('This feature is not yet available');
  }

  public resetForm = (stepper: MatStepper) => {
    this.selectMember(null);
    this.selectProgram(null);
    this.selectSeason(null);
    // go back to the first step
    stepper.reset();
  }

  public registrationComplete = () => {
    return (!this.currentUser || !this.currentUser.isAnonymous)
    && this.currentRegistration.memberId !== null
    && this.currentRegistration.programId !== null;
  };
  public submitRegistration = (stepper: MatStepper) => {
    if (!this.registrationComplete()) return;

    this.enrollmentService.enrollClass(this.currentRegistration).subscribe((result: boolean) => {
      if (result === true) {
        this.resetForm(stepper);
      }
    });
  };

  ngOnInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.currentUser = user;
    });
    this.authService.getSession();

    this.programSub = this.programService.Programs.subscribe((programs: ProgramRecord[]) => {
      this.allPrograms = programs.map((program: ProgramRecord) => {
        return {
          id: program.programId,
          name: program.programName,
          moreInfo: `$${program.feeValue}`,
          lookup: 'programs',
          description: program.programDescription,
          numberValue: program.feeValue
        }
      });
    });

    this.classesSub = this.classService.getAllClasses().subscribe((classes: ClassRecord[]) => {
      this.allClasses = classes;
    });

    this.programService.getPrograms();
    this.memberSub = this.enrollmentService.EnrolledMembers.subscribe((members: EnrolledMember[]) => {
      this.enrolledMembers = [];
      this.availableMembers = [];
      members.map((member: EnrolledMember) => {
        const lookupItem: LookupItem = {
          id: member.memberId,
        name: `${member.firstName} ${member.lastName}`,
        description: member.isLoyaltyMember,
        lookup: 'enrolledMember'
        };
        if (member.isEnrolled === 'Y') {
          this.enrolledMembers.push(member);
        } else {
          this.availableMembers.push(lookupItem);
        }
      });
    });
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.userSub, this.programSub, this.memberSub]);
  }

}
