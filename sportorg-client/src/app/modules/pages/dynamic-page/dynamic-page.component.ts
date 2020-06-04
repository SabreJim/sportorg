import {Component, OnDestroy, OnInit} from '@angular/core';
import {Event, NavigationEnd, Router} from "@angular/router";
import {StaticValuesService} from "../../core/services/static-values.service";
import {Subscription} from "rxjs";
import {PageProxyService} from "../../core/services/page-proxy.service";
import {PageContent} from "../../core/models/ui-objects";

@Component({
  selector: 'app-about-page',
  templateUrl: './dynamic-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './dynamic-page.component.scss'
  ]
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  protected navSub: Subscription;
  protected pageSub: Subscription;
  protected getPageName = (url: string) => {
    // get the last part of the url as a unique name to search on
    try {
      let parts = url.split('/');
      parts = parts.filter(item => item.length);
      return parts[parts.length -1];
    } catch (err) {
      return '';
    }
  }
  public titleContent: string = '';
  public bodyContent: string = '';

  constructor(private appRouter: Router, private pageService: PageProxyService) {
    this.navSub = appRouter.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        // request the page content
        let pageName = this.getPageName(event.url);
        if (!pageName || pageName === '') {
          pageName = 'home';
        }
        this.pageSub = this.pageService.getPageContent(pageName).subscribe((page: PageContent) => {
          if (page.pageId === -1) {
            // no content was found, possibly due to content fishing
            this.titleContent = 'No Content Found';
            this.bodyContent = `<p>Sorry, we could not find the page you were looking for. This might be an error on our end
                                 (sorry!), or you might be looking for a page that doesn't exist. Try navigating with the menu.</p>`;
          } else {
            this.titleContent = page.title;
            this.bodyContent = page.htmlContent;
          }
        })
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.pageSub]);
  }

}
