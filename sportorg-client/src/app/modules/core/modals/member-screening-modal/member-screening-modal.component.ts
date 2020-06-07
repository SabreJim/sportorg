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
    new TableColumn('lastName', 'Last Name', 'string'),
    new TableColumn('firstName', 'First Name', 'string'),
    new TableColumn('flagged', 'Followup required', 'boolean'),
  ];
  public selectMember = (row: MemberAttendance, isSelected: boolean) => {
    if (isSelected) {
      this.selectedMember = row;
    } else {
      this.selectedMember = null;
    }
  }

  public checkinMember = () => {
    if (this.selectedMember && this.selectedMember.memberId) {
      this.matDialogRef.close(this.selectedMember);
    }
  }
}
