import {Component, Input, OnInit} from "@angular/core";


@Component({
  selector: 'org-header',
  templateUrl: './org-header.component.html',
  styleUrls: ['./org-header.component.scss']
})
export class OrgHeaderComponent implements OnInit {

  @Input() appLogoId: number;
  ngOnInit(): void {
  }



 }
