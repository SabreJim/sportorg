import {Component, Input, OnDestroy, OnInit, Output, EventEmitter} from "@angular/core";
import {NewsPost} from "../../../core/models/data-objects";
import {LookupItem} from "../../../core/models/rest-objects";
import {LookupProxyService} from "../../../core/services/lookup-proxy.service";
import {Router} from "@angular/router";
import {PostsProxyService} from "../../../core/services/posts-proxy.service";

@Component({
  selector: 'app-post-link',
  templateUrl: './post-link.component.html',
  styleUrls: ['./post-link.component.scss']
})
export class PostLinkComponent implements OnInit, OnDestroy {
  constructor(protected lookupProxy: LookupProxyService, protected router: Router,
              protected postsProxy: PostsProxyService) {}

  @Input() set postRecord (newRecord: NewsPost) {
    if (newRecord) {
      // populate tags
      this.showTags(newRecord.tagIds || []);
      this._postRecord = newRecord;
    }
  } get postRecord () {
    return this._postRecord;
  }
  private _postRecord: NewsPost;
  @Input() isAdmin = false;
  @Output() tagSelected = new EventEmitter<LookupItem>();

  public myTags: LookupItem[] = [];

  public showTags = (tagIds: number[]) => {
    if (tagIds.length) {
      this.lookupProxy.getTags().subscribe((tags: LookupItem[]) => {
        if (tags) {
          this.myTags = tags.filter(t => tagIds.includes(t.id));
        }
      });
    }
  }
  public editPost = () => {
    this.router.navigate([`/edit-post/${this.postRecord.postId}`]);
  }
  public openPost = () => {
    this.router.navigate([`/news/${this.postRecord.postId}`]);
  }

  public applyFilter = (tag: LookupItem) => {
    this.tagSelected.emit(tag);
  }
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

}
