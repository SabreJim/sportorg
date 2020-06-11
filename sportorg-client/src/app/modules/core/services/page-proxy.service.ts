import {RestProxyService} from "./rest-proxy.service";

import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {Injectable} from "@angular/core";
import {SnackbarService} from "./snackbar.service";
import {AppStatus, MenuItem, PageContent} from "../models/ui-objects";
import {ScreeningQuestion} from "../models/data-objects";


@Injectable({providedIn: 'root'})
export class PageProxyService extends RestProxyService {

  ////////////////////////////////////////////////////
  // Page admin endpoints and content getter
  ///////////////////////////////////////////////////
  public getPageContent = (pageName: string): Observable<PageContent> => {
    return new Observable<PageContent>((subscription) => {
      this.get(`page-content/${pageName}` ).subscribe((response: ApiResponse<PageContent>) => {
        if (response.hasErrors()) {
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }
  public getAllPages = (): Observable<PageContent[]> => {
    return new Observable<PageContent[]>((subscription) => {
      this.get(`all-pages/` ).subscribe((response: ApiResponse<PageContent[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public upsertPageContent = (pageContent: PageContent): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('page-content', pageContent).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Page could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          if (pageContent.pageId > 0) {
            SnackbarService.notify(`Page updated for: ${pageContent.pageName}`);
          } else {
            SnackbarService.notify(`Page created for: ${pageContent.pageName}`);
          }
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public deletePageContent = (pageContent: PageContent): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`page-content/${pageContent.pageId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Page was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  ////////////////////////////////////////////////////
  // Menus admin endpoints
  ///////////////////////////////////////////////////
  public getMenuList = (): Observable<MenuItem[]> => {
    return new Observable<MenuItem[]>((subscription) => {
      this.get(`menu-list/` ).subscribe((response: ApiResponse<MenuItem[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public upsertMenu = (menu: MenuItem): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put('menus', menu).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Menu could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          if (menu.menuId > 0) {
            SnackbarService.notify(`Menu updated for: ${menu.title}`);
          } else {
            SnackbarService.notify(`Menu created for: ${menu.title}`);
          }
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public deleteMenu = (menu: MenuItem): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`menus/${menu.menuId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Menu was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  ////////////////////////////////////////////////////
  // Banners admin endpoints
  ///////////////////////////////////////////////////
  public getBanners = (): Observable<AppStatus[]> => {
    return new Observable<AppStatus[]>((subscription) => {
      this.get(`all-banners/` ).subscribe((response: ApiResponse<AppStatus[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public upsertBanner = (banner: AppStatus): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put('banners', banner).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Banner could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          if (banner.statusId > 0) {
            SnackbarService.notify(`Banner updated for: ${banner.appName}`);
          } else {
            SnackbarService.notify(`Banner created for: ${banner.appName}`);
          }
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public deleteBanner = (banner: AppStatus): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`banners/${banner.statusId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Banner was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  ////////////////////////////////////////////////////
  // Questions admin endpoints
  ///////////////////////////////////////////////////
  public getAllQuestions = (): Observable<ScreeningQuestion[]> => {
    return new Observable<ScreeningQuestion[]>((subscription) => {
      this.get(`all-questions/` ).subscribe((response: ApiResponse<ScreeningQuestion[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public upsertQuestion = (question: ScreeningQuestion): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put('questions', question).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Question could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          if (question.questionId > 0) {
            SnackbarService.notify(`Question updated for: ${question.questionText}`);
          } else {
            SnackbarService.notify(`Question created for: ${question.questionText}`);
          }
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public deleteQuestion = (question: ScreeningQuestion): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`questions/${question.questionId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Question was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}
