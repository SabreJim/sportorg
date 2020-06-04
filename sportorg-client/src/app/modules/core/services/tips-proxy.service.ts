import {RestProxyService} from "./rest-proxy.service";
import {Observable} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {Injectable} from "@angular/core";
import {AppToolTip} from "../models/ui-objects";
import {SnackbarService} from "./snackbar.service";


@Injectable({providedIn: 'root'})
export class TipsProxyService extends RestProxyService {

  protected TipCache = {};

  public getToolTip = (tipName: string, lang: string = 'EN'): Observable<AppToolTip> => {
    return new Observable<AppToolTip>((subscription) => {
      if (this.TipCache[tipName] && this.TipCache[tipName].language === lang) {
        subscription.next(this.TipCache[tipName]);
        return;
      }
      this.get(`tool-tip/${tipName}?lang=${lang}`).subscribe((response: ApiResponse<AppToolTip>) => {
        if (response.hasErrors() || response.data['tipId'] < 1) {
          subscription.next({
            tipId: -1,
            tipName: 'notFound',
            title: 'tip not found',
            text: `Sorry, we couldn't find the right tooltip for this feature.`
          });
        } else {
          response.data.language = lang;
          this.TipCache[tipName] = response.data;
          subscription.next(this.TipCache[tipName]);
        }
      });
    });
  }

  public getAllToolTips = (): Observable<AppToolTip[]> => {
    return new Observable<AppToolTip[]>((subscription) => {
      this.get(`all-tool-tips/` ).subscribe((response: ApiResponse<AppToolTip[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public upsertToolTip = (tip: AppToolTip): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('tool-tip', tip).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Page could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          if (tip.tipId > 0) {
            SnackbarService.notify(`Tip updated for: ${tip.tipName}`);
          } else {
            SnackbarService.notify(`Tip created for: ${tip.tipName}`);
          }
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public deleteToolTip = (tip: AppToolTip): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`tool-tip/${tip.tipId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Tip was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}
