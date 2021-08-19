import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {NewsPost} from "../../core/models/data-objects";
import {PostsProxyService} from "../../core/services/posts-proxy.service";
import {Subscription} from "rxjs";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppUser} from "../../core/models/authentication";
import {LookupItem} from "../../core/models/rest-objects";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";

@Component({
  selector: 'app-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './news-page.component.scss'
  ]
})
export class NewsPageComponent implements OnInit, OnDestroy {
  constructor(protected newsProxy: PostsProxyService, protected auth: FirebaseAuthService,
              protected route: ActivatedRoute, protected router: Router, protected lookupService: LookupProxyService) {}
  public currentNews: NewsPost[] = [];
  protected newsSub: Subscription;
  public isAdmin = false;
  public currentTags: LookupItem[] = [];
  public allTags: LookupItem[] = [];
  public params: number[] = [];

  ngOnInit(): void {
    this.lookupService.getTags().subscribe((tags: LookupItem[]) => {
      this.allTags = tags;
      this.convertToTags();
    });
    // check for url parameters
    this.route.queryParams.subscribe((params: ParamMap) => {
      try {  // save params in case the lookup hasn't arrived yet
        this.params =  (params['tagIds'].split(',')).map(parseInt);
      } catch (err) {
        this.params = [];
      }
      this.convertToTags();
      this.runSearch();
    });

    this.auth.CurrentUser.subscribe((user: AppUser) => {
      if (user?.isAdmin === true) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
    this.auth.getSession();
  }

  protected convertToTags = () => {
    if (this.params.length && !this.currentTags.length) { // update the UI
      this.currentTags = this.allTags.filter(t => this.params.includes(t.id));
    }
  }
  public runSearch = () => {
    const currentTagIds = this.currentTags.map(t => t.id);
    this.newsSub = this.newsProxy.searchPosts(currentTagIds).subscribe((posts: NewsPost[]) => {
      this.currentNews = posts;
    });
  }
  public applyTag = (tag: LookupItem) => {
    // update the set of tags
    const foundTag = this.currentTags.find(t => t?.id === tag?.id);
    if (foundTag) { // remove this tag
      this.currentTags = this.currentTags.filter(t => t?.name.toUpperCase() !== tag?.name.toUpperCase());
    } else {
      this.currentTags.push(tag);
    }
    const currentTagIds = this.currentTags.map(t => t.id);
    this.router.navigate(['/home'], { queryParams: {tagIds: currentTagIds}}); // update params which runs the search
  }


  ngOnDestroy(): void {
  }

}
