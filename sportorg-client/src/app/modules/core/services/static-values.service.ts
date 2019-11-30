import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class StaticValuesService {
  protected static SessionToken = '';
  public static getToken = () => StaticValuesService.SessionToken;
  public static setToken = (token: string) => {
    StaticValuesService.SessionToken = token;
  }
}
