import {RestProxyService} from "./rest-proxy.service";
import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {Injectable} from "@angular/core";
import {SnackbarService} from "./snackbar.service";
import {NewsPost} from "../models/data-objects";


@Injectable({providedIn: 'root'})
export class PostsProxyService extends RestProxyService {

  // get a single news post for editing or displaying on a page
  public getPostRecord = (postId: number): Observable<NewsPost> => {
    return new Observable<NewsPost>((subscription) => {
      this.get(`news-post/${postId}`).subscribe((response: ApiResponse<NewsPost>) => {
        if (response.hasErrors() || !response?.data?.postId) {
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }
  // get a set of matching news posts
  public searchPosts = (tagIds: number[] = []) => {
    return new Observable((subscription) => {
      // send the request
      this.get(`news/`, {tagIds: tagIds}).subscribe((response: ApiResponse<NewsPost[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);

      });
    });
  }

  public upsertNewsPost = (post: NewsPost): Observable<number> => {
    return new Observable((subscription) => {
      this.put('news-post', post).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.postId < 0) {
          SnackbarService.error(`News Post could not be update or inserted: ${response.message}`);
          subscription.next(-1);
        } else {
          if (response?.data?.postId > 0) {
            SnackbarService.notify(`Page updated for: ${post.headerContent}`);
          } else {
            SnackbarService.notify(`Page created for: ${post.headerContent}`);
          }
          subscription.next(response?.data?.postId);
        }
      }, (error: any) => {
      });
    });
  }

  public unpublishPost = (postId: number): Observable<number> => {
    return new Observable((subscription) => {
      this.put(`news-post/unpublish/${postId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.postId < 0) {
          SnackbarService.error(`News Post could not be unpublished: ${response.message}`);
          subscription.next(-1);
        } else {
          if (response?.data?.postId > 0) {
            SnackbarService.notify(`Page unpublished for: ${response.data.postId}`);
          }
          subscription.next(response?.data?.postId);
        }
      }, (error: any) => {
      });
    });
  }
}
