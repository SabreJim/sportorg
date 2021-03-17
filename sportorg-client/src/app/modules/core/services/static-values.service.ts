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

  public static checkMobile = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})
      (navigator.userAgent||navigator.vendor||(window as any).opera);
    return check;
  }

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

  public static MAX_MOBILE_WIDTH = 425;
  public static MAX_MOBILE_WIDTH_WIDE = 800;
  public static MAX_TABLET_WIDTH = 1024;
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
