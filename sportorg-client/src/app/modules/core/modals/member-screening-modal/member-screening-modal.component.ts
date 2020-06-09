import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
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
  public selectedMember: MemberAttendance;

  public columns: TableColumn[] = [
    new TableColumn('checkedIn', 'Checked In', 'boolean'),
    new TableColumn('checkedOut', 'Checked Out', 'boolean'),
    new TableColumn('lastName', 'Last Name', 'string'),
    new TableColumn('firstName', 'First Name', 'string'),
    new TableColumn('isFlagged', 'Followup required', 'boolean'),
    new TableColumn('checkInTime', 'In (time)', 'string'),
    new TableColumn('checkOutTime', 'Out (time)', 'string')
  ];
  public selectMember = (row: MemberAttendance, isSelected: boolean) => {
    if (isSelected) {
      this.selectedMember = row;
      // determine if this member can be checked in or out
      // not checked in, or checked and then checked out
      if ((!row.checkedIn && !row.checkedOut) ||
        (row.checkedIn && row.checkedOut && row.checkOutTime > row.checkInTime)){
        this.canCheckIn = true;
      } else {
        this.canCheckIn = false;
      }

      // checked in but not checked out, or both but checked in again after checking out
      if ((row.checkedIn && !row.checkedOut) ||
        (row.checkedIn && row.checkedOut && row.checkOutTime < row.checkInTime)){
        this.canCheckOut = true;
      } else {
        this.canCheckOut = false;
      }
    } else {
      this.selectedMember = null;
      this.canCheckOut = false;
      this.canCheckIn = false;
    }
  }

  public canCheckIn: boolean = false;
  public canCheckOut: boolean = false;
  public checkinMember = () => {
    if (this.selectedMember && this.canCheckIn) {
      this.selectedMember.checkingOut = false;
      this.matDialogRef.close(this.selectedMember);
    }
  }
  public checkoutMember = () => {
    if (this.selectedMember && this.canCheckOut) {
      this.selectedMember.checkingOut = true;
      this.matDialogRef.close(this.selectedMember);
    }
  }
}
