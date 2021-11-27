import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {AppMember, Circuit} from "../../core/models/data-objects";
import {MembersProxyService} from "../../core/services/member-proxy.service";
import {FilterBarConfig, FilterConfig, FilterRequest} from "../../core/filter-bar/filter-bar.component";
import {LookupItem} from "../../core/models/rest-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {Subscription} from "rxjs";
import {RankingProxyService} from "../../core/services/events/ranking-proxy.service";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppUser} from "../../core/models/authentication";

@Component({
  selector: 'app-ranking-page',
  templateUrl: './ranking-page.component.html',
  styleUrls: ['../shared-page.scss']
})
export class RankingPageComponent implements AfterViewInit, OnDestroy {

  constructor(private rankingProxy: RankingProxyService, protected userProxy: FirebaseAuthService) { }

  @ViewChild('rankingLinkTemplate') rankingLinkTemplate: TemplateRef<any>;
  ngAfterViewInit() {
  this.rankingColumns = [
      TableColumn.fromConfig({fieldName: 'circuitName', title: 'Name', type: 'template', setWidth: '250px', templateRef: this.rankingLinkTemplate}),
      new TableColumn('weapon', 'Weapon', 'number'),
      TableColumn.fromConfig({fieldName: 'gender', title: 'Gender', type: 'string', displayType: 'number'}),
      TableColumn.fromConfig({fieldName: 'ageCategory', title: 'Age Category', type: 'string', displayType: 'number'}),
    ];
    this.filterRankings({ search: '', filters: {}}); // fire the default request

    this.userProxy.CurrentUser.subscribe((user: AppUser) => {
      this.isAdmin = (user && user.isAdmin);
    });
    this.userProxy.getSession();
  }

  public requestRankingUpdate = () => {
    this.rankingProxy.requestRankingUpdate().subscribe();
  }
  protected rankingSub: Subscription;
  public isAdmin = false;
  public updateOptions: FilterConfig = null;
  public filterConfig: FilterBarConfig = {
    hasSearch: true,
    searchTitle: 'Search',
    searchPlaceholder: 'Search by name ...',
    options: [
      { title: 'By weapon', fieldName: 'athleteType', singleSelect: false, value: '', options: [], lookupName: 'athleteTypes' , showHint: true },
      { title: 'By gender', fieldName: 'gender', singleSelect: false, value: '', options: [], lookupName: 'genders', showHint: true },
      { title: 'By age', fieldName: 'age', singleSelect: false, value: '', options: [], lookupName: 'ageCategories', showHint: true }
    ]
  }

  public filterRankings = (request: FilterRequest) => {
    this.rankingSub = this.rankingProxy.getRankingsList(request).subscribe((circuits: Circuit[]) => {
      this.rankingRows = circuits;
    });
  }

  public rankingRows: Circuit[] = [];
  public rankingColumns: TableColumn[] = [];
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.rankingSub]);
  }
}
