import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FitnessGroup, FitnessProfile} from "../../../core/models/fitness-objects";

@Component({
  selector: 'app-group-icon',
  templateUrl: './group-icon.component.html',
  styleUrls: ['./group-icon.component.scss']
})
export class GroupIconComponent implements OnInit {

  @Output() sendCreate: EventEmitter<FitnessGroup> = new EventEmitter<FitnessGroup>();
  @Output() sendNew: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() displayStyle: string;
  @Input() get group(): FitnessGroup {
    return this._group;
  } set group(newGroup: FitnessGroup) {

    this._group = newGroup;
  }

  public maxStatValue = 1;

  protected _group: FitnessGroup;

  public editGroup = () => {
    this.sendCreate.emit(this.group);
  }

  public createNewGroup = () => {
    this.sendNew.emit(true);
    setTimeout(() => {
      this.sendNew.emit(false); // reset listener
    });
  }

  constructor() { }

  ngOnInit() {
  }

}
