import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../services/static-values.service";

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent implements OnInit {

  @Input() set value (newValue: number) {
    if (this.numberFormControl) {
      this.numberFormControl.setValue(newValue);
    }
  }
  @Input() numberType: 'int' | 'float' = 'int';
  @Input() title: string;
  @Input() set isRequired (newValue: boolean) {
    this._isRequired = newValue;
    if (this.numberFormControl) {
      this.numberFormControl.setValidators([Validators.required]);
    }
  } get isRequired() {
    return this._isRequired;
  }
  protected _isRequired = false;
  protected changeSub: Subscription;

  @Output() valueChange = new EventEmitter<number>();
  @Output() valid = new EventEmitter<boolean>();

  public numberFormControl = new FormControl();

  public clearNumber = () => {
    this.valueChange.emit(null);
  }

  constructor() { }

  ngOnInit() {
    this.changeSub = this.numberFormControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newNumber: string) => {
        if (typeof newNumber === 'number') {
          this.valueChange.emit(newNumber);
        } else if (newNumber && newNumber.length) {
          let num: number;
          if (this.numberType === 'float') {
            num = parseFloat(newNumber);
          } else {
            num = parseInt(newNumber);
          }
          this.valueChange.emit(num);
        } else {
          this.valueChange.emit(null);
        }
      });
    this.numberFormControl.statusChanges
      .pipe().subscribe((status: string) => {
      this.valid.emit(status === 'VALID');
    });
  }

}
