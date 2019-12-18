import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material";
import {ProgramRecord} from "../../models/data-objects";

@Component({
  selector: 'app-program-modal',
  templateUrl: './program-modal.component.html',
  styleUrls: ['./program-modal.component.scss']
})
export class ProgramModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProgramRecord) { }
  public programItem: ProgramRecord;
  ngOnInit() {
    this.programItem = this.data;
  }

}
