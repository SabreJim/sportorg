import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../core/services/static-values.service";
import {NewsPost} from "../../core/models/data-objects";
import {PostsProxyService} from "../../core/services/posts-proxy.service";

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrls: ['../shared-page.scss', './post-page.component.scss']
})
export class PostPageComponent implements OnInit, OnDestroy {
  constructor(protected appRouter: Router, protected route: ActivatedRoute,
              protected postProxy: PostsProxyService) {
  }
  protected navSub: Subscription;
  protected pageSub: Subscription;
  public pagePost: NewsPost = {
    postId: null,
    linkTemplateType: 'headerOverText',
    templateType: 'html',
    headerContent: 'Page not Found',
    bannerImageId: null,
    linkImageId: null,
    publishDate: null,
    htmlContent: `<p>The article you requested could not be found. Try navigating to it again from the home page.</p>`,
    tagIds: []
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.pageSub]);
  }

  ngOnInit(): void {
    this.navSub =  this.route.paramMap.subscribe((params: ParamMap) => {
      const postId = Number(params.get('postId'));
      if (postId && postId > 0) { // request post content
        this.pageSub = this.postProxy.getPostRecord(postId).subscribe((post: NewsPost) => {
          this.pagePost = post;
        });
      }
    });
  }

}
