import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {AppMember} from "../../models/data-objects";
import {LookupItem} from "../../models/rest-objects";
import {StaticValuesService} from "../../services/static-values.service";
import {FirebaseAuthService} from "../../services/firebase-auth.service";
import {AppUser} from "../../models/authentication";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-member-modal',
  templateUrl: './member-modal.component.html',
  styleUrls: ['./member-modal.component.scss']
})
export class MemberModalComponent implements OnInit, AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AppMember,
              public matDialogRef: MatDialogRef<MemberModalComponent>,
              private authService: FirebaseAuthService) {
  }
  public currentUser: AppUser;
  private userSub: Subscription;
  ngAfterViewInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      this.currentUser = user;
    });
    this.authService.getSession();
  };
  ngOnInit() {
    if (this.data.memberId) {
      setTimeout(()=> {
        this.member = this.data; // allow lookups to load first
      });
    } else { // a new member object
      setTimeout(() => {
        this.member.email = this.data.email || '';
        this.member.provinceId = 4;
      });
    }
  }

  public member: AppMember = {
    memberId: null,
    firstName: null,
    middleName: null,
    lastName: null,
    name: null,
    yearOfBirth: null,
    competeGenderId: 3,
    isActive: 'Y',
    isAthlete: 'Y',
    membershipStart: null,
    streetAddress: null,
    city: null,
    provinceId: null,
    provinceName: null,
    postalCode: null,
    email: '',
    cellPhone: null,
    homePhone: null,
    license: null
  };

  public invalid: string[] = [];
  public checkValid = (isValid: boolean, fieldName: string) => {
    if (isValid && this.invalid.includes(fieldName)) {
     this.invalid = this.invalid.filter(item => item !== fieldName);
    }
    if (!isValid && !(this.invalid.includes(fieldName))) {
      this.invalid.push(fieldName);
    }
  }
  public composedAddress = '';
  public genderLookup: LookupItem[] = [
    {id: 1, lookup: 'gender', name: 'Male', description: 'M'},
    {id: 2, lookup: 'gender', name: 'Female', description: 'F'},
    {id: 3, lookup: 'gender', name: 'Other', description: 'X'},

  ];

  // public decodeLookup = (value: string, lookup: LookupItem[]) => {
  //   const foundItem = lookup.find((item: LookupItem) => {
  //     return item.description === value;
  //   });
  //   return (foundItem) ? foundItem.id : null;
  // };
  // public selectGender = (newValue: LookupItem) => {
  //   this.member.competeGender = (newValue.description === 'M') ? 'M' : 'F';
  // };
  public selectGender = (newValue: LookupItem) => {
    this.member.competeGenderId = newValue.id;
  };
  public selectClub = (newValue: LookupItem) => {
    this.member.clubId = newValue.id;
  };

  public updatePhone = (newValue: string, position: string) => {
    // validate phone numbers
    const isValidPhone = StaticValuesService.validatePhone(newValue);
    this.checkValid(isValidPhone, position);
    if (isValidPhone) {
      this.member[position] = StaticValuesService.formatPhone(newValue);
    } else {
      this.member[position] = newValue;
    }
  };


  // validate the input and send the data to be saved
  public saveForm = () => {
    if (this.invalid.length) return;
    // if nothing is missing, send the request
    this.matDialogRef.close(this.member);
  }
}
