import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StaticValuesService} from "../../services/static-values.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  @Input() set dateValue (incomingDate: string) { // external setter
    this.formValue = StaticValuesService.localizeDate(incomingDate);
  }
  @Output() dateValueChanged = new EventEmitter<string>();
  constructor() { }
  public dateControl = new FormControl({value: null, disabled: false});
  public formValue: string;
  public updateValues = () => {
    console.log('update triggered', this.dateValue, this.dateControl.value);
    if (this.dateControl.value) {
      this.dateValue = this.dateControl.value;
      console.log('after update', this.dateValue, this.dateControl.value);
      this.dateValueChanged.emit(StaticValuesService.cleanDate(this.dateControl.value));
    } else {
      this.clearDate();
    }
  };
  public clearDate = () => {
    console.log('clear date');
    this.dateControl.setValue('');
    this.formValue = null;
    this.dateValueChanged.emit(this.dateValue);
  };

  ngOnInit() {
  }

}
