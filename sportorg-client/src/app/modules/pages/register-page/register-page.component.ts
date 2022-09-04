import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {
  AppMember,
  ClassRecord,
  EnrolledMember, MemberSeasonEnrollment,
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
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {clone} from 'ramda';


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './register-page.component.scss'
  ]
})
export class RegisterPageComponent implements AfterViewInit, OnDestroy {
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
  public allPrograms: ProgramRecord[] = [];
  public currentProgram: ProgramRecord;
  public currentSeason: LookupItem;
  public currentClasses: ClassRecord[];
  public seasons: LookupItem[] = [];
  public defaultSeason: LookupItem;
  public currentMember: AppMember;
  public enrolledMembers: EnrolledMember[] = [];
  public availableMembers: AppMember[] = [];
  public finalCost: string = '';
  protected allClasses: ClassRecord[] = [];
  public includedClasses: ClassRecord[] = [];
  public alreadyEnrolled = false;

  constructor(private authService: FirebaseAuthService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, private memberService: MembersProxyService,
              public dialog: MatDialog, private enrollmentService: EnrollmentProxyService,
              protected LookupService: LookupProxyService, protected detector: ChangeDetectorRef) {
  }

  public checkIfLoginRequired = () => {
    return !this.currentUser || this.currentUser?.isAnonymous;
  }

  public selectSeason = (season: LookupItem) => {
    if (season && season.id) {
      this.currentRegistration.seasonId = season.id;
      this.currentSeason = season;
      this.programService.getPrograms(season.id);
      this.currentProgram = null;
      this.includedClasses = [];
    } else {
      this.currentRegistration.seasonId = null;
      this.currentSeason = null;
      this.currentProgram = null;
      this.includedClasses = [];
    }
    this.checkProgramEnrolled();
  };

  public checkProgramEnrolled = () => {
    if (this.currentMember && this.currentSeason) {
      let alreadyEnrolled = false;
      if (this.currentMember.seasonEnrollments) {
        this.currentMember.seasonEnrollments.map((s: MemberSeasonEnrollment) => {
          if (s.seasonId === this.currentSeason.id && s.enrolled === 'Y') {
            alreadyEnrolled = true;
          }
        });
      }
      this.alreadyEnrolled = alreadyEnrolled;
    } else {
      this.alreadyEnrolled = false;
    }
  }

  public selectProgram = (program: ProgramRecord) => {
    if (program && program.programId) {
      this.currentRegistration.programId = program.programId;
      this.currentProgram = program;
      try {
        // const str = program.classes.data.map(String.fromCharCode);
        this.includedClasses = JSON.parse(program.classes);
      } catch (err) {
        this.includedClasses = [];
      }
    } else {
      this.currentRegistration.programId = null;
      this.currentProgram = null;
    }
  };

  public selectMember = (member: AppMember) => {
    if (member) {
      if (member.seasons && member.seasons.length && !member.seasonEnrollments) {
        member.seasonEnrollments = JSON.parse(member.seasons);
      }
      this.currentMember = member;
      this.currentRegistration.memberId = this.currentMember.memberId;
    } else {
      this.currentMember = null;
      this.currentRegistration.memberId = null;
    }
    this.calculateCost();
  };

  // pre-calculate the costs
  protected calculateCost = () => {
    if (this.currentProgram && this.currentMember) {
      let cost = this.currentProgram.feeValue || 0;
      if (this.currentMember.isLoyaltyMember === 'Y' && this.currentProgram.loyaltyDiscount === 'Y') { // loyalty member discount
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
    this.selectSeason(this.defaultSeason);
    this.alreadyEnrolled = false;
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

  ngAfterViewInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.currentUser = user;
      this.memberService.getMyMembers().subscribe((myMembers: AppMember[]) => {
        if (myMembers && myMembers.length) {
          this.availableMembers = myMembers;
          this.detector.detectChanges();
        }
      });
    });
    this.authService.getSession();

    this.programSub = this.programService.Programs.subscribe((programs: ProgramRecord[]) => {
      this.allPrograms = programs;
    });

    this.LookupService.getLookup('seasons').subscribe((items: LookupItem[]) => {
      this.seasons = items;
      const currentSeason = items.find(i => i.id === parseInt(i.otherId));
      this.selectSeason(currentSeason);
      this.defaultSeason = clone(currentSeason);
    });
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.userSub, this.programSub, this.memberSub]);
  }

}
