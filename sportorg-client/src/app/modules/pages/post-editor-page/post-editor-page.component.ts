import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../core/services/static-values.service";
import {LookupItem} from "../../core/models/rest-objects";
import {NewsPost} from "../../core/models/data-objects";
import {clone, equals} from 'ramda';
import {PostsProxyService} from "../../core/services/posts-proxy.service";

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor-page.component.html',
  styleUrls: ['../shared-page.scss', './post-editor-page.component.scss']
})
export class PostEditorPageComponent implements OnInit, OnDestroy {
  constructor(protected appRouter: Router, protected activatedRoute: ActivatedRoute,
              protected postProxy: PostsProxyService) {
    this.routeSub = this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      const postId = Number(paramMap.get('postId'));
      if (!postId || postId < 0) {
        this.currentPost = clone(this.defaultRecord);
        this.initialPost = clone(this.defaultRecord);
      } else { // request post to edit
        this.postProxy.getPostRecord(postId).subscribe((post: NewsPost) => {
          this.currentPost = post;
          this.initialPost = clone(post);
        });
      }
    });
  }
  protected navSub: Subscription;
  protected routeSub: Subscription;
  public showLinkPreview = false;
  public showPagePreview = false;
  public previewCopy: NewsPost;
  protected defaultRecord: NewsPost = {
    postId: null,
    linkTemplateType: 'headerOverText',
    templateType: 'html',
    headerContent: '',
    bannerImageId: null,
    linkImageId: null,
    publishDate: null,
    tagIds: []
  };
  public currentPost: NewsPost = clone(this.defaultRecord);
  protected initialPost: NewsPost;

  public linkTemplateOptions: LookupItem[] = [
    { id: 1, name: 'headerOverText', moreInfo: 'Headers/Image', lookup: 'postTemplate' },
    { id: 2, name: 'leftTextBlock', moreInfo: 'Left Text', lookup: 'postTemplate' },
    { id: 3, name: 'rightTextBlock', moreInfo: 'Right Text', lookup: 'postTemplate' },
  ];
  public templateOptions: LookupItem[] = [
    { id: 1, name: 'html', moreInfo: 'Just HTML (custom)', lookup: 'postTemplate' },
    { id: 2, name: 'tournament', moreInfo: 'Tournament', lookup: 'postTemplate' },
    { id: 3, name: 'camp', moreInfo: 'Camp', lookup: 'postTemplate' },
  ];
  public selectTemplate = (templateName: string, templateTypeName: string) => {
    if (templateTypeName === 'link') {
      this.currentPost.linkTemplateType = templateName;
    } else {
      this.currentPost.templateType = templateName;
    }
  }
  public setPublishDate = (value: string) => {
    this.currentPost.publishDate = value;
  }
  public updateString = (newString: string, fieldName: string) => {
    if (this.currentPost && newString !== this.currentPost[fieldName]){
      this.currentPost[fieldName] = newString;
    }
  };
  public updateFileId = (newId: number, fieldName: string) => {
    if (!this.currentPost || newId !== this.currentPost[fieldName]){
      this.currentPost[fieldName] = newId;
    }
  };
  public updateTags = (tagIds: number[]) => {
    if (tagIds) {
      this.currentPost.tagIds = tagIds;
    }
  }

  public isDirty = () => {
    return !equals(this.currentPost, this.initialPost);
  }
  public resetPost = () => {
  }
  public previewPost = (previewType: string) => {
    if (previewType === 'link') {
      if (this.showLinkPreview) { // turn off previews
        this.previewCopy = null;
        this.showLinkPreview = false;
        this.showPagePreview = false;
      } else {
        this.previewCopy = clone(this.currentPost);
        this.showLinkPreview = true;
        this.showPagePreview = false;
      }
    } else {
      if (this.showPagePreview) { // turn off previews
        this.previewCopy = null;
        this.showLinkPreview = false;
        this.showPagePreview = false;
      } else {
        this.previewCopy = clone(this.currentPost);
        this.showLinkPreview = false;
        this.showPagePreview = true;
      }
    }
  }
  public publishPost = () => {
    this.postProxy.upsertNewsPost(this.currentPost).subscribe((postId: number) => {
      if (postId > 0) {
        this.appRouter.navigate([`/edit-post/${postId}`]);
      }
    });
  };
  public unpublishPost = () => {
    this.postProxy.unpublishPost(this.currentPost.postId).subscribe((postId: number) => {
      if (postId > 0) {
        this.appRouter.navigate([`/edit-post/${postId}`]);
      }
    });
  }
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.routeSub]);
  }

  ngOnInit(): void {
  }

}
