import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OrgFormControl} from "../../modals/validating-modal/validating-modal.component";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {ValidatorFn, Validators} from "@angular/forms";

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {

  @Input() set value (newValue: string) {
    this.timeControl.setValue(newValue);
    this.timeChanged.emit(newValue);
  }
  @Output() timeChanged = new EventEmitter<string>();
  @Input() timeControl = new OrgFormControl('time');
  public clearTime = () => {
    this.timeControl.setValue(null);
    this.timeChanged.emit(null);
  }
  @Input() title = 'Time';
  @Input() set isRequired (newValue: boolean) {
    this._isRequired = newValue;
    const validators: ValidatorFn[] = [];
    if (newValue) {
      validators.push(Validators.required);
    }
    this.timeControl.setValidators(validators);
    this.timeControl.updateValueAndValidity();
  } get isRequired() {
    return this._isRequired;
  }
  protected _isRequired = false;

  constructor() { }

  ngOnInit() {
    this.timeControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newText) => {
        if (newText && newText.length) {
          this.timeChanged.emit(newText);
        } else {
          this.timeChanged.emit(null);
          this.timeControl.setValue(null);
        }
      });
  }

}
