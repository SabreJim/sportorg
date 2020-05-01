import {Injectable} from "@angular/core";
import {EventColor} from "calendar-utils";
import {LookupItem} from "../models/rest-objects";
import {Subscription} from "rxjs";

@Injectable({providedIn: 'root'})
export class StaticValuesService {
  protected static SessionToken = '';
  public static getToken = () => StaticValuesService.SessionToken;
  public static setToken = (token: string) => {
    StaticValuesService.SessionToken = token;
  };

  public static cleanSubs = (subs: Subscription[]) => {
    if (subs && subs.length){
      subs.map((sub: Subscription) => {
        if (sub && sub.unsubscribe) sub.unsubscribe();
      });
    }
  }
  public static cleanDate = (dateInput: string) => {
    try {
      return (new Date(dateInput)).toISOString().slice(0, 10);
    }catch (err) {
       return (new Date()).toISOString().slice(0, 10);
    }
  };
  public static localizeDate = (dateInput: string) => {
    if (!dateInput) return '';
    try {
      const temp = new Date(dateInput);
      const offset = temp.getTimezoneOffset() / 60;
      temp.setHours(temp.getHours() - offset);
      return temp.toISOString();
    }catch (err) {
      return new Date().toISOString();
    }
  };

  public static validateEmail = (email: string, required: boolean = false) => {
    if (!email || !email.length) {
      return !required; // handle simplest cases
    }
    const emailPattern =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailPattern.test(email);
  };

  public static validatePhone = (phoneNum: string, required: boolean = false) => {
  if (!phoneNum || !phoneNum.length) {
    return !required; // handle simplest cases
  }
    const phonePattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phonePattern.test(phoneNum);
  };
  public static formatPhone = (phoneNum: string) => {
    if (!phoneNum || !phoneNum.length) {
      return phoneNum; // handle simplest cases
    }
    const cleanNumbers = phoneNum.toString().replace(/\D/g, '');
    return `(${cleanNumbers.slice(0, 3)} )${cleanNumbers.slice(3, 6)}-${cleanNumbers.slice(6,10)}`;
  };

  public static getUITime = (time: string) => {
    let hours = parseInt(time.slice(0, time.indexOf(':')));
    if (isNaN(hours)) return time;
    if (hours > 23) hours = hours - 24;
    let minutes = parseInt(time.slice(time.indexOf(':') + 1));
    if (isNaN(minutes)) return time;
    if (minutes > 59) minutes = minutes - 60;
    const minuteString = (minutes < 10) ? `0${minutes}` : `${minutes}`;

    if (hours === 12) {
      return `${hours}:${minuteString}PM`;
    }
    if (hours > 12) {
      return `${hours - 12}:${minuteString}PM`;
    }
    if (hours === 0) {
      return `12:${minuteString}AM`;
    }
    return `${hours}:${minuteString}AM`;
  }

  public static COMPETITION_YEAR = 2019;
  public static ICON_MAP: any = {
    balance: 'fas fa-balance-scale',
    flexibility: 'fas fa-bacon',
    power: 'fas fa-dumbbell',
    endurance: 'fas fa-lungs',
    footSpeed: 'fas fa-bolt',
    handSpeed: 'fas fa-hand-sparkles'
  };

  public static MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  public static ORG_COLORS: EventColor[] = [
    // reds: border / background 0 - 5
    { primary: '#1a237e', secondary: '#e53935'},
    { primary: '#1a237e', secondary: '#f44336'},
    { primary: '#1a237e', secondary: '#ef5350'},
    { primary: '#1a237e', secondary: '#e57373'},
    { primary: '#1a237e', secondary: '#ef9a9a'},
    { primary: '#1a237e', secondary: '#ffcdd2'},
    { primary: '#1a237e', secondary: '#ffcdd2'},
    // purples 6 - 11
    { primary: '#1a237e', secondary: '#8e24aa'},
    { primary: '#1a237e', secondary: '#9c27b0'},
    { primary: '#1a237e', secondary: '#ab47bc'},
    { primary: '#1a237e', secondary: '#ba68c8'},
    { primary: '#1a237e', secondary: '#ce93d8'},
    { primary: '#1a237e', secondary: '#e1bee7'},
    // blues 12 - 17
    { primary: '#1a237e', secondary: '#1e88e5'},
    { primary: '#1a237e', secondary: '#2196f3'},
    { primary: '#1a237e', secondary: '#42a5f5'},
    { primary: '#1a237e', secondary: '#64b5f6'},
    { primary: '#1a237e', secondary: '#90caf9'},
    { primary: '#1a237e', secondary: '#bbdefb'},
    // teals 18 - 23
    { primary: '#1a237e', secondary: '#00897b'},
    { primary: '#1a237e', secondary: '#009688'},
    { primary: '#1a237e', secondary: '#26a69a'},
    { primary: '#1a237e', secondary: '#4db6ac'},
    { primary: '#1a237e', secondary: '#80cbc4'},
    { primary: '#1a237e', secondary: '#b2dfdb'},
    // greens 24 - 29
    { primary: '#1a237e', secondary: '#43a047'},
    { primary: '#1a237e', secondary: '#4caf50'},
    { primary: '#1a237e', secondary: '#66bb6a'},
    { primary: '#1a237e', secondary: '#81c784'},
    { primary: '#1a237e', secondary: '#a5d6a7'},
    { primary: '#1a237e', secondary: '#c8e6c9'},
  ];

  public static WEEK_DAYS: LookupItem[] = [
    { id: 0, name: 'Monday', lookup: 'weekday' },
    { id: 1, name: 'Tuesday', lookup: 'weekday' },
    { id: 2, name: 'Wednesday', lookup: 'weekday' },
    { id: 3, name: 'Thursday', lookup: 'weekday' },
    { id: 4, name: 'Friday', lookup: 'weekday' },
    { id: 5, name: 'Saturday', lookup: 'weekday' },
    { id: 6, name: 'Sunday', lookup: 'weekday' },
  ];
}
