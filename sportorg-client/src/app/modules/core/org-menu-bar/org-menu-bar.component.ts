import {Component, OnInit} from "@angular/core";
import {RecentItem} from "../models/ui-objects";


@Component({
  selector: 'org-menu-bar',
  templateUrl: './org-menu-bar.component.html',
  styleUrls: ['./org-menu-bar.component.scss']
})
export class OrgMenuBarComponent implements OnInit {
  public isStuck: false;

  public recentItems: RecentItem[] = [
    {title: 'CFF Registration', link: 'http://www.fencing.ca', type: 'external'},
    {title: 'Beaches Renovations', link: '/about-us', type: 'internal'},
    {title: 'New Class Structure', link: '/classes', type: 'internal'}
  ];

  public exampleClick = (value: RecentItem) => {
    console.log('got click', value);
  }
  ngOnInit(): void {

  }

}
