import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-boolean-input',
  templateUrl: './boolean-input.component.html',
  styleUrls: ['./boolean-input.component.scss']
})
export class BooleanInputComponent implements OnInit {

  @Input() set value (newValue: string) {
    this.stringValue = newValue;
    this.booleanValue = (newValue === this.valueMask[0]);
    this.updateValue();
  }
  @Input() set boolean (newValue: boolean) {
    this.booleanValue = newValue;
    this.updateValue();
  }
  @Input() valueMask: string[] = ['Y', 'N'];
  @Input() useBoolean: boolean = false;
  @Output() valueChanged = new EventEmitter<string>();
  @Output() booleanChanged = new EventEmitter<boolean>();
  public stringValue: string;
  public booleanValue = false;

  public updateValue =() => {
    if (this.valueMask && this.valueMask.length > 1) {
      this.stringValue = this.booleanValue ? this.valueMask[0] : this.valueMask[1];
    }
    this.booleanChanged.emit(this.booleanValue);
    this.valueChanged.emit(this.stringValue);
  };

  constructor() { }

  ngOnInit() {
  }

}
