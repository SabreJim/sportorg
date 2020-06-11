import {RestProxyService} from "./rest-proxy.service";
import {AppMember, MemberAttendance, ScreeningQuestion} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";


@Injectable({providedIn: 'root'})
export class MembersProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  public PublicMembers = new Subject<AppMember[]>();
  protected memberCache: AppMember[] = [];

  public getMyMembers = (): Observable<AppMember[]> => {
    return new Observable((subscription) => {
      this.get('my-members/').subscribe((response: ApiResponse<AppMember[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('There was an error getting your members');
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
          this.PublicMembers.next(response.data);
        }
      }, (error: any) => {});
    });
  };
  public getAllMembers = () => {
    if (this.memberCache.length > 0) {
      this.PublicMembers.next(this.memberCache);
    } else {
      this.get('members/').subscribe((response: ApiResponse<AppMember[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`There was an error getting all members: ${response.message}`);
          this.PublicMembers.next([]);
        } else {
          this.memberCache = response.data || [];
          this.PublicMembers.next(this.memberCache);
        }
      }, (error: any) => {});
    }
  };

  public upsertMember = (memberBody: AppMember): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('members', memberBody).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error updating this member: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify('Member updated successfully');
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
  public deleteMember = (memberBody: AppMember): Observable<boolean> => {
    return new Observable((subscription) => {
      const memberId = memberBody.memberId;
      if (!memberId) { // no ID to delete on
        subscription.next(false);
      }
      this.delete(`members/${memberId}`).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error deleting this member: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify('Member deleted successfully');
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // attendance endpoints

  // get the list of members you have access to check in. Either a family member, or you are a club admin of their club
  public getMemberAttendance = (): Observable<MemberAttendance[]> => {
    return new Observable((subscription) => {
      this.get('my-members/attendance').subscribe((response: ApiResponse<MemberAttendance[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('There was an error getting your members');
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  };
  public logAttendance = (member: MemberAttendance): Observable<any> => {
    return new Observable((subscription) => {
      this.put('my-members/attendance', member).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error logging your attendance: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {});
    });
  }

  public recordConsent = (member: MemberAttendance): Observable<any> => {
    return new Observable((subscription) => {
      this.put('my-members/consent', member).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error accepting your consent form }`);
          subscription.next(false);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {});
    });
  }

  public getScreeningQuestions = (questionGroupName: string): Observable<ScreeningQuestion[]> => {
    return new Observable((subscription) => {
      this.get(`my-members/screening-questions/${questionGroupName}`).subscribe((response: ApiResponse<ScreeningQuestion[]>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`There was an error getting the screening questions`);
          subscription.next([]);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {});
    });
  }
}
