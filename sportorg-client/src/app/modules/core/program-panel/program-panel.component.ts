import {Component, Input, OnInit} from '@angular/core';
import {ProgramRecord} from "../models/data-objects";

@Component({
  selector: 'app-program-panel',
  templateUrl: './program-panel.component.html',
  styleUrls: ['./program-panel.component.scss']
})
export class ProgramPanelComponent implements OnInit {

  @Input() programItem: ProgramRecord;
  @Input() expanded: boolean = true;
  constructor() { }

  ngOnInit() {

  }

}
