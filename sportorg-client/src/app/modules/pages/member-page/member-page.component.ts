import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {AppMember} from "../../core/models/data-objects";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {FilterBarConfig, FilterConfig, FilterRequest} from "../../core/filter-bar/filter-bar.component";
import {LookupItem} from "../../core/models/rest-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-member-page',
  templateUrl: './member-page.component.html',
  styleUrls: ['../shared-page.scss',
    './member-page.component.scss']
})
export class MemberPageComponent implements AfterViewInit, OnDestroy {

  constructor(private memberService: MembersProxyService) { }

  ngAfterViewInit() {
    this.filterMembers({ search: '', filters: {memberTypes: 'isActive'}}); // fire the default request
  }
  protected memberSub: Subscription;
  protected filterOptions: LookupItem[] = [
    { id: -1, stringId: 'isAthlete', lookup: 'memberTypes', name: 'Fencer' },
    { id: -1, stringId: 'isNotAthlete', lookup: 'memberTypes', name: 'Non-fencer' },
    { id: -1, stringId: 'isActive', lookup: 'memberTypes', name: 'Active', checked: true },
    { id: -1, stringId: 'isInactive', lookup: 'memberTypes', name: 'Inactive' },
    { id: -1, stringId: 'enrolled', lookup: 'memberTypes', name: 'Enrolled' },
    { id: -1, stringId: 'notEnrolled', lookup: 'memberTypes', name: 'Not enrolled' },
  ];
  protected genderOptions: LookupItem[] = [
    { id: -1, stringId: '"M"', lookup: 'genderFilter', name: 'Male' },
    { id: -1, stringId: '"F"', lookup: 'genderFilter', name: 'Female'}
  ];

  public updateOptions: FilterConfig = null;
  public filterConfig: FilterBarConfig = {
    hasSearch: true,
    searchTitle: 'Search',
    searchPlaceholder: 'Search by name ...',
    options: [
      { title: 'By status', fieldName: 'memberTypes', singleSelect: false, value: '', options: this.filterOptions, showHint: true },
      { title: 'By gender', fieldName: 'gender', singleSelect: false, value: '', options: this.genderOptions, showHint: true },
      { title: 'By age', fieldName: 'age', singleSelect: false, value: '', options: [], lookupName: 'ageCategories', showHint: true }
    ]
  }

  public filterMembers = (request: FilterRequest) => {
    this.memberSub = this.memberService.searchMembers(request).subscribe((members: AppMember[]) => {
      this.memberRows = members;
    });
  }

  public memberRows: AppMember[] = [];
  public memberColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'memberName', title: 'Name', type: 'string', displayType: 'long-string'}),
    // new TableColumn('yearOfBirth', 'Year of Birth', 'number'),
    new TableColumn('competeAge', 'Age', 'number'),
    TableColumn.fromConfig({fieldName: 'competeGender', title: 'Competition Gender', type: 'string', displayType: 'number'}),
    new TableColumn('membershipStart', 'Joined', 'date'),
    new TableColumn('license', 'License #', 'number')
  ];

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.memberSub]);
  }
}
