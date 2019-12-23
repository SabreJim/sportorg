import {Component, Input, OnInit} from '@angular/core';
import {AdminConfig, TableColumn} from "../../core/models/ui-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {AppMember, AppMemberUser} from "../../core/models/data-objects";
import {UserData} from "../../core/models/authentication";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  public classConfig: AdminConfig = {
    entityType: 'Class',
    columns: [
      TableColumn.fromConfig({fieldName: 'programId', title: 'Program', type: 'select',
        displayField: 'programName', lookupField: 'programs', displayType: 'long-string'}),
      TableColumn.fromConfig({fieldName: 'seasonId', title: 'Season', type: 'select',
        displayField: 'seasonName', lookupField: 'seasons'}),
      TableColumn.fromConfig({ fieldName: 'dayId', title: 'Week Day', type: 'select', displayField: 'dayOfWeek',
        lookupStatic: StaticValuesService.WEEK_DAYS }),
      new TableColumn('startTime', 'Start Time', 'time'),
      new TableColumn('endTime', 'End Time', 'time'),
      new TableColumn('startDate', 'Start Date', 'date'),
      new TableColumn('endDate', 'End Date', 'date'),
      new TableColumn('minAge', 'Min Age', 'number'),
      new TableColumn('maxAge', 'Max Age', 'number'),
    ],
    getter: () => this.classService.getAllClasses(true),
    setter: this.classService.upsertClass,
    delete: this.classService.deleteClass
  };

  public programConfig: AdminConfig = {
    entityType: 'Program',
    columns: [
      new TableColumn('programName', 'Name', 'string'),
      TableColumn.fromConfig({ fieldName: 'feeId', title: 'Fees', type: 'select', displayField: 'feeValue',
        lookupField: 'fees' }),
      TableColumn.fromConfig({ fieldName: 'locationId', title: 'Location', type: 'select', displayField: 'locationName',
        lookupField: 'locations' }),
      new TableColumn('registrationMethod', 'Registration', 'string'),
      new TableColumn('colorId', 'Color', 'number'),
      new TableColumn('isActive', 'Active', 'boolean'),
      new TableColumn('programDescription', 'Description', 'html')
    ],
    getter: this.programService.getAllPrograms,
    setter: this.programService.upsertPrograms,
    delete: this.programService.deletePrograms
  };

  public userConfig: AdminConfig = {
    entityType: 'User',
    columns: [
      new TableColumn('userId', 'Id', 'number'),
      TableColumn.fromConfig({ fieldName: 'email', title: 'Email', type:'string', displayType: 'long-string' }),
      new TableColumn('isAdmin', 'Admin Access', 'boolean'),
      TableColumn.fromConfig({ fieldName: 'googleId', title: 'Google', type:'string', displayType: 'long-string' }),
      TableColumn.fromConfig({ fieldName: 'fbId', title: 'Facebook', type:'string', displayType: 'long-string' }),
      TableColumn.fromConfig({ fieldName: 'twitterId', title: 'Twitter', type:'string', displayType: 'long-string' })
    ],
    getter: this.authService.getUsers,
    setter: this.authService.upsertUser,
    delete: this.authService.deleteUser
  };
  public memberConfig: AdminConfig = {
    entityType: 'Member',
    getter: this.memberService.getMyMembers,
    setter: this.memberService.upsertMember,
    delete: this.memberService.deleteMember,
    columns: [
      TableColumn.fromConfig({fieldName: 'lastName', title: 'Last Name', type: 'string', }),
      TableColumn.fromConfig({fieldName: 'middleName', title: 'Middle Name', type: 'string'}),
      TableColumn.fromConfig({fieldName: 'firstName', title: 'First Name', type: 'string'}),
      new TableColumn('yearOfBirth', 'Year of Birth', 'number'),
      new TableColumn('competeGender', 'Competition Gender', 'string'),
      new TableColumn('membershipStart', 'Joined', 'date'),
      TableColumn.fromConfig({fieldName: 'email', title: 'Contact Email', type: 'string', displayType: 'long-string'}),
      new TableColumn('license', 'License #', 'number'),
      TableColumn.fromConfig({fieldName: 'streetAddress', title: 'Address', type: 'string', displayType: 'long-string' }),
      new TableColumn('city', 'City', 'string'),
      TableColumn.fromConfig({ fieldName: 'provinceId', title: 'Province', type: 'select', displayField: 'provinceName',
        lookupField: 'regions' }),
      new TableColumn('postalCode', 'Postal Code', 'string'),
      new TableColumn('cellPhone', 'Cell #', 'string'),
      new TableColumn('isActive', 'Active', 'boolean'),
      new TableColumn('isAthlete', 'Athlete', 'boolean'),
      new TableColumn('confirmed', 'Confirmed', 'boolean')
    ]
  };

  protected memberSub: Subscription;
  protected userSub: Subscription;
    public memberLinkColumns: TableColumn[] = [
      new TableColumn('userId', 'User Id', 'number'),
      TableColumn.fromConfig({fieldName: 'email', title: 'Email', type: 'string', displayType: 'long-string'}),
      new TableColumn('memberId', 'MemberId', 'number'),
      TableColumn.fromConfig({fieldName: 'memberName', title: 'Member', type: 'string', displayType: 'long-string'})
    ];
    public memberUserRows: AppMemberUser[] = [];
    public memberRows: AppMember[] = [];
    public userRows: UserData[] = [];
    public linkUserId: number;
    public linkMemberId: number;
    public unlinkMemberUser: AppMemberUser;
    public getMemberUsers = () => {
      this.authService.getMemberUsers().subscribe((memberUsers: AppMemberUser[]) => {
        this.memberUserRows = memberUsers;
      });
      this.memberService.getMyMembers().subscribe();
      this.authService.getUsers().subscribe();
    };
    public selectMemberUser = (memberUsers: AppMemberUser[]) => {
      if (memberUsers.length) {
        this.unlinkMemberUser = memberUsers[0];
      }
    };
    public linkMembers = (memberId: number, userId: number, setLinked: boolean) => {
      this.authService.setMemberLink(memberId, userId, setLinked).subscribe((completed: boolean) => {
        // clear out the selections
        this.unlinkMemberUser = null;
        this.linkUserId = null;
        this.linkMemberId = null;
        this.getMemberUsers();
      });
    };

  constructor(private lookupService: LookupProxyService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, private authService: FirebaseAuthService,
              private memberService: MembersProxyService) { }

  ngOnInit() {
    this.memberSub = this.memberService.PublicMembers.subscribe((members: AppMember[]) => {
      this.memberRows = members;
    });
    this.userSub = this.authService.Users.subscribe((users: UserData[]) => {
      this.userRows = users;
    });
  }

}
