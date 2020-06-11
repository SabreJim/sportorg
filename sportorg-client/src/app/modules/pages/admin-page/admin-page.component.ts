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
import {LookupItem} from "../../core/models/rest-objects";
import {PageProxyService} from "../../core/services/page-proxy.service";
import {TipsProxyService} from "../../core/services/tips-proxy.service";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  public classConfig: AdminConfig = {
    entityType: 'Class',
    identityField: 'scheduleId',
    filterBarFields: ['seasonName', 'programName', 'dayOfWeek'],
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
    identityField: 'programId',
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

  public feesConfig: AdminConfig = {
    entityType: 'Fees',
    identityField: 'feeId',
    columns: [
      new TableColumn('feeValue', '$ value', 'number'),
      new TableColumn('feePeriod', 'Period', 'string'),
      new TableColumn('feeName', 'Name', 'string'),
      new TableColumn('registrationLink', 'Link', 'string'),
    ],
    getter: this.lookupService.getFeesAdmin,
    setter: this.lookupService.upsertFee,
    delete: this.lookupService.deleteFee
  };

  public userConfig: AdminConfig = {
    entityType: 'User',
    identityField: 'userId',
    columns: [
      new TableColumn('userId', 'Id', 'number'),
      TableColumn.fromConfig({ fieldName: 'email', title: 'Email', type:'string', displayType: 'long-string' }),
      new TableColumn('isAdmin', 'Admin Access', 'boolean'),
      new TableColumn('fileAdmin', 'File Upload Access', 'boolean'),
      new TableColumn('eventAdmin', 'Admin Events', 'boolean'),
      new TableColumn('displayName', 'Display Name', 'long-string'),
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
    identityField: 'memberId',
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
      TableColumn.fromConfig({fieldName: 'license', title: 'CFF License', type: 'string', displayType: 'number'}),
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
    public memberRows: LookupItem[] = [];
    public userRows: LookupItem[] = [];
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


    // page content admins
  public pageConfig: AdminConfig = {
    entityType: 'Page',
    identityField: 'pageId',
    columns: [
      new TableColumn('pageName', 'Name', 'string'),
      new TableColumn('title', 'Title', 'string'),
      new TableColumn('htmlContent', 'Content', 'html')
    ],
    getter: this.pageService.getAllPages,
    setter: this.pageService.upsertPageContent,
    delete: this.pageService.deletePageContent
  };
  // TODO: convert references like parentMenuId and link to selections from the actual value lookups
  public menuConfig: AdminConfig = {
    entityType: 'Menu',
    identityField: 'menuId',
    columns: [
      new TableColumn('menuId', 'Id', 'number'),
      new TableColumn('title', 'Title', 'string'),
      new TableColumn('altTitle', 'French Title', 'string'),
      new TableColumn('link', 'Internal Url', 'string'),
      new TableColumn('parentMenuId', 'Parent Menu', 'number'),
      new TableColumn('orderNumber', 'Ordering', 'number')
    ],
    getter: this.pageService.getMenuList,
    setter: this.pageService.upsertMenu,
    delete: this.pageService.deleteMenu
  };

  public bannerConfig: AdminConfig = {
    entityType: 'Banner',
    identityField: 'statusId',
    columns: [
      new TableColumn('statusId', 'Id', 'number'),
      new TableColumn('appName', 'App to use', 'string'),
      new TableColumn('bannerText', 'Content', 'string'),
      new TableColumn('bannerLink', 'More Info Link', 'string'),
      new TableColumn('bannerActive', 'Active', 'string')
    ],
    getter: this.pageService.getBanners,
    setter: this.pageService.upsertBanner,
    delete: this.pageService.deleteBanner
  };

  public toolTipConfig: AdminConfig = {
    entityType: 'Tool Tip',
    identityField: 'tipId',
    columns: [
      new TableColumn('tipName', 'Name (search)', 'string'),
      new TableColumn('enTitle', 'Title (EN)', 'string'),
      new TableColumn('enText', 'Text (EN)', 'html'),
      new TableColumn('frTitle', 'Title (FR)', 'string'),
      new TableColumn('frText', 'Text (FR)', 'html')
    ],
    getter: this.tipService.getAllToolTips,
    setter: this.tipService.upsertToolTip,
    delete: this.tipService.deleteToolTip
  };

  public questionConfig: AdminConfig = {
    entityType: 'Question',
    identityField: 'questionId',
    columns: [
      new TableColumn('questionId', 'Id', 'number'),
      new TableColumn('questionGroup', 'Group of Questions', 'string'),
      new TableColumn('enText', 'Question (EN)', 'string'),
      new TableColumn('frText', 'Question (FR)', 'string'),
      new TableColumn('answerGroupId', 'Answer Set Id', 'number'),
      new TableColumn('parentQuestionId', 'Parent Question', 'number'),
      new TableColumn('allowedInvalid', 'Allow # Incorrect', 'number'),
      new TableColumn('expectedAnswer', 'Correct Answer Id', 'number')
    ],
    getter: this.pageService.getAllQuestions,
    setter: this.pageService.upsertQuestion,
    delete: this.pageService.deleteQuestion
  };

  constructor(private lookupService: LookupProxyService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, private authService: FirebaseAuthService,
              private memberService: MembersProxyService, private pageService: PageProxyService,
              private tipService: TipsProxyService) { }

  ngOnInit() {
    this.memberSub = this.memberService.PublicMembers.subscribe((members: AppMember[]) => {
      this.memberRows = members.map((item: AppMember) => {
        return { id: item.memberId, name: `${item.lastName}, ${item.firstName}`, lookup: 'member'};
      });
    });
    this.userSub = this.authService.Users.subscribe((users: UserData[]) => {
      this.userRows = users.map((item: UserData) => {
        return { id: item.userId, name: item.email, lookup: 'user'};
      });
    });
  }

}
