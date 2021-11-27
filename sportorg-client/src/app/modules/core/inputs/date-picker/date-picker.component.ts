import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StaticValuesService} from "../../services/static-values.service";
import {FormControl, ValidatorFn, Validators} from "@angular/forms";
import {OrgFormControl} from "../../modals/validating-modal/validating-modal.component";

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {

  @Input() set dateValue (incomingDate: string) { // external setter
    this.dateControl.setValue(StaticValuesService.localizeDate(incomingDate));
  }
  @Input() title = 'Date';
  @Input() minDate: Date;
  @Input() maxDate: Date;
  @Input() set isRequired (newValue: boolean) {
    this._isRequired = newValue;
    if (newValue) {
      this.dateControl.setValidators([Validators.required]);
    } else {
      this.dateControl.clearValidators();
    }
    this.dateControl.updateValueAndValidity();
  } get isRequired() {
    return this._isRequired;
  }
  protected _isRequired = false;
  @Output() dateValueChanged = new EventEmitter<string>();
  constructor() { }
  @Input() dateControl = new OrgFormControl('date',{value: null, disabled: false, specialFormat: 'date'});
  public updateValues = () => {
    if (this.dateControl.value) {
      this.dateValueChanged.emit(StaticValuesService.cleanDate(this.dateControl.value));
    } else {
      this.clearDate();
    }
  };
  public clearDate = () => {
    this.dateControl.setValue('');
    this.dateValueChanged.emit(this.dateValue);
  };
  ngOnInit() {
  }

}
