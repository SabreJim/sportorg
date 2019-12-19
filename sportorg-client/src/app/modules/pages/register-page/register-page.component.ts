import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppMember, ClassRecord, FeeStructure, ProgramRecord} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {Subscription} from "rxjs";
import {map} from 'ramda';
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";
import {LookupItem} from "../../core/models/rest-objects";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {TableColumn} from "../../core/models/ui-objects";
import {StaticValuesService} from "../../core/services/static-values.service";
import {MembersProxyService} from "../../core/services/member-proxy.service";

export interface RegistrationConfig {
  seasonId: number;
  programId: number;
  scheduleIds: number[];
  memberId: number;
}
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
  public currentProgram: LookupItem;
  public currentSeason: LookupItem;
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
    new TableColumn('email', 'Contact Email', 'string'),
    new TableColumn('license', 'License #', 'number'),
    TableColumn.fromConfig({fieldName: 'homeAddress', title: 'Address', type: 'string', displayType: 'long-string'}),
    new TableColumn('cellPhone', 'Cell #', 'string'),
    new TableColumn('homePhone', 'Home #', 'string')
  ];

  public classDescription: string;
  public seasonExpanded = false;
  public programExpanded = false;
  public classExpanded = false;
  public memberExpanded = false;

  constructor(private authService: FirebaseAuthService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, private memberService: MembersProxyService) {
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
  };

  public selectClasses = (classes: ClassRecord[]) => {
    const descriptions = [];
    this.currentRegistration.scheduleIds = [];
    classes.map((item: ClassRecord) => {
      this.currentRegistration.scheduleIds.push(item.scheduleId);
      descriptions.push(`${item.dayOfWeek} ${item.startTime}`);
    });
    this.classDescription = descriptions.join(', ');
  };

  public selectMembers = (members: AppMember[]) => {
    console.log('select members', members);
  };

  public openAddMember = () => {
    this.memberExpanded = false;
  };

  public submitRegistration = () => {

  };
  ngOnInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.currentUser = user;
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
    });
    this.programService.getPrograms();

    this.classService.getAllClasses().subscribe((classes: ClassRecord[]) => {
      this.allClasses = classes;
      this.availableClasses = classes;
    });

    this.memberService.getMyMembers().subscribe((myMembers: AppMember[]) => {
      console.log('got my members', myMembers);
      this.myMembers = myMembers;
    })

  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

}
