import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class StaticValuesService {
  protected static SessionToken = '';
  public static getToken = () => StaticValuesService.SessionToken;
  public static setToken = (token: string) => {
    StaticValuesService.SessionToken = token;
  }

  public static cleanDate = (dateInput: string) => {
    try {
      return (new Date(dateInput)).toISOString().slice(0, 10);
    }catch (err) {
       return (new Date()).toISOString().slice(0, 10);
    }
  }
  public static localizeDate = (dateInput: string) => {
    if (!dateInput) return '';
    try {
      const temp = new Date(dateInput);
      temp.setDate((new Date(dateInput)).getUTCDate());
      return temp.toISOString();
    }catch (err) {
      return new Date().toISOString();
    }


  }
}
