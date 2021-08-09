import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, ValidatorFn, Validators} from "@angular/forms";
import {debounceTime, distinctUntilChanged, filter} from "rxjs/operators";
import {StaticValuesService} from "../../services/static-values.service";

@Component({
  selector: 'app-string-input',
  templateUrl: './string-input.component.html',
  styleUrls: ['./string-input.component.scss']
})
export class StringInputComponent implements OnInit {

  @Input() set value (newValue: string) {
    if (this.textFormControl) {
      this.textFormControl.setValue(newValue);
    }
  }
  @Input() useTextArea: boolean = false;
  @Input() hint: string;
  @Input() title: string;
  @Input() set isRequired (newValue: boolean) {
    this._isRequired = newValue;
    this.updateValidators();
  } get isRequired() {
    return this._isRequired;
  }
  protected _isRequired = false;
  @Input() set validationType (newValue: string) {
    this._validationType = newValue;
    this.updateValidators();
  } get validationType() {
    return this._validationType;
  }
  protected _validationType = '';
  @Input() set disabled (setDisabled: boolean) {
    if (setDisabled) {
      this.textFormControl.enable();
    } else {
      this.textFormControl.disable()
    }
  }
  @Output() valueChange = new EventEmitter<string>();
  @Output() valid = new EventEmitter<boolean>();

  public textFormControl = new FormControl();
  public clearString = () => {
    this.textFormControl.setValue(null);
    this.valueChange.emit(null);
  }

  protected updateValidators = () => {
    const validators: ValidatorFn[] = [];
    if (this.isRequired) {
      validators.push(Validators.required);
    }
    if (this.validationType && this.validationType === 'email'){
      validators.push(Validators.email);
    }
    this.textFormControl.setValidators(validators);
    this.textFormControl.updateValueAndValidity();
  }

  public updateValue =(event: Event) => {
    const newValue = (event.srcElement as HTMLInputElement).value || null;
    // TODO: input sanitization
    this.valueChange.emit(newValue);
  }
  constructor() { }

  ngOnInit() {
    this.textFormControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newText) => {
        if (newText && newText.length) {
          this.valueChange.emit(newText);
        } else {
          this.valueChange.emit(null);
          this.textFormControl.setValue(null);
        }
      });

    this.textFormControl.statusChanges
      .pipe().subscribe((status: string) => {
      this.valid.emit(status === 'VALID');
    });
  }

}
