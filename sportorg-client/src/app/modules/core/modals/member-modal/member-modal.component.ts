import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {AppMember} from "../../models/data-objects";
import {LookupItem} from "../../models/rest-objects";
import {StaticValuesService} from "../../services/static-values.service";

@Component({
  selector: 'app-member-modal',
  templateUrl: './member-modal.component.html',
  styleUrls: ['./member-modal.component.scss']
})
export class MemberModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AppMember,
              public matDialogRef: MatDialogRef<MemberModalComponent>) {
  }

  ngOnInit() {
    if (this.data.memberId) {
      setTimeout(()=> {
        this.member = this.data; // allow lookups to load first
      });
    } else { // a new member object
      this.member.email = this.data.email || '';
    }
  }

  public member: AppMember = {
    memberId: null,
    firstName: null,
    middleName: null,
    lastName: null,
    name: null,
    yearOfBirth: null,
    competeGender: 'M',
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
    license: null,
    confirmed: 'N'
  };

  public invalid: any = {};
  public composedAddress = '';
  public genderLookup: LookupItem[] = [
    {id: 1, lookup: 'gender', name: 'Male', description: 'M'},
    {id: 2, lookup: 'gender', name: 'Female', description: 'F'}
  ];

  public decodeLookup = (value: string, lookup: LookupItem[]) => {
    const foundItem = lookup.find((item: LookupItem) => {
      return item.description === value;
    });
    return (foundItem) ? foundItem.id : null;
  };
  public selectGender = (newValue: LookupItem) => {
    this.member.competeGender = (newValue.description === 'M') ? 'M' : 'F';
  };

  public selectProvince = (newId: number) => {
    this.member.provinceId = newId;
  };

  public updateLicense = (newValue: string) => {
    this.member.license = newValue;
    // format to CFF license
  };
  public updateEmail = (newValue: string) => {
    this.member.email = newValue;
    // validate email format
    this.invalid.email = !(StaticValuesService.validateEmail(newValue, true));
  };

  public updatePhone = (newValue: string, position: string) => {
    // validate phone numbers
    this.invalid[position] = !(StaticValuesService.validatePhone(newValue));
    if (!this.invalid[position]) {
      this.member[position] = StaticValuesService.formatPhone(newValue);
    } else {
      this.member[position] = newValue;
    }
  };

  public updateName = (newValue: string, position: string, isRequired = false) => {
    this.invalid[position] = isRequired && !newValue;
    this.member[position] = newValue;
    this.member.name = `${this.member.lastName || ''}, ${this.member.firstName || ''} ${this.member.middleName || ''}`;
  };
  public updateAddress = (newValue: string, position: string) => {
    this.composedAddress = `${this.member.streetAddress || ''}, ${this.member.city || ''} ${this.member.provinceName || ''}, ${this.member.postalCode || ''}`;
    this.member[position] = newValue;
  };

  // validate the input and send the data to be saved
  public saveForm = () => {
    let anyInvalid = false;
    let requiredFields = ['firstName', 'lastName', 'email'];
    // check required fields are filled in
    requiredFields.map((fieldName: string) => {
      if (!this.member[fieldName]) {
        anyInvalid = true;
        this.invalid[fieldName] = true;
      }
    });

    // check the validation of existing fields
    Object.values(this.invalid).map((value: boolean) => {
      if (value) anyInvalid = true;
    });
    // if nothing is missing, send the request
    if (!anyInvalid) {
      this.matDialogRef.close(this.member);
    }
  }
}
