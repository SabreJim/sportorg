import {Component, OnInit} from "@angular/core";


@Component({
  selector: 'org-menu-bar',
  templateUrl: './org-menu-bar.component.html',
  styleUrls: ['./org-menu-bar.component.scss']
})
export class OrgMenuBarComponent implements OnInit {
  public isStuck: false;

  public version = '0.0.1';
  public availableVersions = ['0.0.1', '1.0.0', '2.e'];

  public exampleClick = (value: string) => {
    console.log('got click', value, this.version);
    this.version = value;
  }
  ngOnInit(): void {

  }

}
