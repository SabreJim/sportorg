import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {MemberAttendance} from "../../models/data-objects";
import {MembersProxyService} from "../../services/member-proxy.service";
import {TableColumn} from "../../models/ui-objects";

@Component({
  selector: 'app-member-screening-modal',
  templateUrl: './member-screening-modal.component.html',
  styleUrls: ['./member-screening-modal.component.scss']
})
export class MemberScreeningModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: MemberAttendance[],
              public matDialogRef: MatDialogRef<MemberScreeningModalComponent>,
              public memberService: MembersProxyService) {
  }
  ngOnInit() {
    if (this.data && this.data.length) {
      this.myMembers = this.data;
    }
  }

  public myMembers: MemberAttendance[];
  public checkinFn = (row: MemberAttendance) => {
    if (!row) return;
    if (!row.consentSigned) {
      row.signingConsent = true;
      row.checkingOut = false;
      this.matDialogRef.close(row);
      return;
    }
    if (!row.checkedIn){
      row.checkingOut = false;
      row.signingConsent = false;
      this.matDialogRef.close(row);
      return;
    }
    // must be checking out then
    row.checkingOut = true;
    row.signingConsent = false;
    this.matDialogRef.close(row);
  }
  public buttonTextFn = (row: MemberAttendance) => {
    if (!row.consentSigned) {
      row.buttonColor = 'red';
      return 'Consent';
    }
    if (row.checkedIn) {
      row.buttonColor = 'green';
      return 'Check Out';
    }
    return 'Check In';
  }
  public columns: TableColumn[] = [
    new TableColumn('checkedIn', 'Checked In', 'boolean'),
    TableColumn.fromConfig({fieldName: 'checkIn', title: 'Check In/Out', type: 'button', buttonClass: 'buttonColor',
      buttonTextFn: this.buttonTextFn, buttonFn: this.checkinFn}),
    new TableColumn('firstName', 'First Name', 'string'),
    new TableColumn('lastName', 'Last Name', 'string')
  ];
}
