import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppMember, ClassRecord, ProgramRecord, RegistrationConfig} from "../../core/models/data-objects";
import {Subscription} from "rxjs";
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";
import {LookupItem} from "../../core/models/rest-objects";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {TableColumn} from "../../core/models/ui-objects";
import {StaticValuesService} from "../../core/services/static-values.service";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {MatDialog} from "@angular/material";
import {MemberModalComponent} from "../../core/modals/member-modal/member-modal.component";
import {EnrollmentProxyService} from "../../core/services/enrollment-proxy.service";


@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './register-page.component.scss'
  ]
})
export class RegisterPageComponent implements OnInit, OnDestroy {

  public currentUser: AppUser;
  protected userSub: Subscription;
  protected programSub: Subscription;
  public currentRegistration: RegistrationConfig = {
    seasonId: null,
    programId: null,
    scheduleIds: [],
    memberId: null
  };
  public allPrograms: LookupItem[] = [];
  protected programInfo: ProgramRecord[];
  public currentProgram: LookupItem;
  public currentSeason: LookupItem;
  public currentClasses: ClassRecord[];
  public myMembers: AppMember[] = [];
  public currentMember: AppMember;
  public availableClasses: ClassRecord[] = [];
  protected allClasses: ClassRecord[] = [];

  public classColumns: TableColumn[] = [
      TableColumn.fromConfig({ fieldName: 'dayId', title: 'Week Day', type: 'select', displayField: 'dayOfWeek',
        lookupStatic: StaticValuesService.WEEK_DAYS }),
      new TableColumn('startTime', 'Start Time', 'time'),
      new TableColumn('endTime', 'End Time', 'time'),
      new TableColumn('startDate', 'Start Date', 'date'),
      new TableColumn('endDate', 'End Date', 'date'),
      new TableColumn('minAge', 'Min Age', 'number'),
      new TableColumn('maxAge', 'Max Age', 'number'),
    ];
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

  public classDescription: string;
  public programFeeDescription: string = '';
  public seasonExpanded = false;
  public programExpanded = false;
  public classExpanded = false;
  public memberExpanded = false;

  constructor(private authService: FirebaseAuthService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, private memberService: MembersProxyService,
              public dialog: MatDialog, private enrollmentService: EnrollmentProxyService) {
  }

  protected filterClasses = () => {
    this.availableClasses = this.allClasses.filter((item: ClassRecord) => {
      return (!this.currentRegistration.programId || item.programId === this.currentRegistration.programId) &&
        (!this.currentRegistration.seasonId || item.seasonId === this.currentRegistration.seasonId);
    });
  }
  public selectSeason = (season: LookupItem) => {
    this.currentRegistration.seasonId = season.id;
    this.currentSeason = season;
    if (!this.currentProgram) {
      this.programExpanded = true;
    }
    this.seasonExpanded = false;
    this.filterClasses();
  };

  public selectProgram = (program: LookupItem) => {
    this.currentRegistration.programId = program.id;
    this.currentProgram = program;
    this.classExpanded = true;
    this.filterClasses();
    this.programInfo.map((programInfo: ProgramRecord) => {
      if (programInfo.programId === program.id) {
        this.programFeeDescription = `$${programInfo.feeValue}`;
      }
    });
  };

  public selectClasses = (classes: ClassRecord[]) => {
    const descriptions = [];
    this.currentRegistration.scheduleIds = [];
    this.currentClasses = classes || [];
    classes.map((item: ClassRecord) => {
      this.currentRegistration.scheduleIds.push(item.scheduleId);
      descriptions.push(`${item.dayOfWeek} ${item.startTime}`);
    });
    this.classDescription = descriptions.join(', ');
  };

  public selectMembers = (members: AppMember[]) => {
    if (members.length) {
      this.currentMember = members[0];
      this.currentRegistration.memberId = this.currentMember.memberId;
    }
  };

  public openAddMember = () => {
    // open a modal to create a new member
    const dialogRef = this.dialog.open(MemberModalComponent,
      { width: '80vw', height: '80vh', data: { email: this.currentUser.email } })
    dialogRef.afterClosed().subscribe((result: AppMember) => {
      if (result && result.firstName && result.lastName && result.email) {
        result.membershipStart = StaticValuesService.cleanDate((new Date()).toISOString());
        this.memberService.upsertMember(result).subscribe((saveResult: boolean) => {
          this.getMembers();
        });
      }
    });
  };

  public registrationComplete = () => {
    return (!this.currentUser || !this.currentUser.isAnonymous)
    && this.currentRegistration.memberId !== null
    && this.currentRegistration.scheduleIds.length > 0;
  };
  public submitRegistration = () => {
    if (!this.registrationComplete()) return;

    this.enrollmentService.enrollClass(this.currentRegistration).subscribe((result: boolean) => {
      // TODO reset page selections
    });

  };

  protected getMembers = () => {
    this.memberService.getMyMembers().subscribe((myMembers: AppMember[]) => {
      this.myMembers = myMembers;
    });
  };
  ngOnInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.currentUser = user;
      this.getMembers(); // get members after being authenticated
    });
    this.authService.getSession();

    this.programService.Programs.subscribe((programs: ProgramRecord[]) => {
      this.allPrograms = programs.map((program: ProgramRecord) => {
        return {
          id: program.programId,
          name: program.programName,
          moreInfo: `$${program.feeValue}`,
          lookup: 'programs',
          description: program.programDescription
        }
      });
      this.programInfo = programs;
    });
    this.programService.getPrograms();

    this.classService.getAllClasses().subscribe((classes: ClassRecord[]) => {
      this.allClasses = classes;
      this.availableClasses = classes;
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

}
