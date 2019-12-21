import { Component, OnInit } from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {AppMember} from "../../core/models/data-objects";
import {MembersProxyService} from "../../core/services/member-proxy.service";

@Component({
  selector: 'app-member-page',
  templateUrl: './member-page.component.html',
  styleUrls: ['../shared-page.scss',
    './member-page.component.scss']
})
export class MemberPageComponent implements OnInit {

  constructor(private memberService: MembersProxyService) { }

  ngOnInit() {
    this.memberService.PublicMembers.subscribe((allMembers: AppMember[]) => {
      this.memberRows = allMembers;
    });
    this.memberService.getAllMembers();
  }
  public memberRows: AppMember[] = [];
  public memberColumns: TableColumn[] = [
    TableColumn.fromConfig({fieldName: 'name', title: 'Name', type: 'string', displayType: 'long-string'}),
    new TableColumn('yearOfBirth', 'Year of Birth', 'number'),
    TableColumn.fromConfig({fieldName: 'competeGender', title: 'Competition Gender', type: 'string', displayType: 'number'}),
    new TableColumn('membershipStart', 'Joined', 'date'),
    new TableColumn('license', 'License #', 'number')
  ];

}
