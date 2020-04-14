import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

export interface SnackMessage {
  message: string;
  action?: string;
  duration: number;
  type?: string;
}

@Injectable({providedIn: 'root'})
export class SnackbarService {

  protected static readonly DEFAULT_DURATION: number = 2000;
  protected static readonly DEFAULT_ERROR_DURATION: number = 3000;
  public static Notifications = new Subject<SnackMessage>();

  public static notify = (message: string, duration: number = SnackbarService.DEFAULT_DURATION) => {
    SnackbarService.Notifications.next({message, duration, action: ''});
  };

  public static error = (message: string, duration: number = SnackbarService.DEFAULT_ERROR_DURATION) => {
    SnackbarService.Notifications.next({message, duration, action: '', type: 'error'});
  };
  public static errorWithAction = (message: string, actionText: string) => {
    SnackbarService.Notifications.next({message, duration: 0, action: actionText, type: 'error'});
  };
}
