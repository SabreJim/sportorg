import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent implements OnInit {

  @Input() set value (newValue: number) {
    this.numberValue = newValue;
  }
  @Input() numberType: 'int' | 'float' = 'int';
  @Output() numberChanged = new EventEmitter<number>();

  public clearNumber = () => {
    this.numberValue = null;
    this.numberChanged.emit(this.numberValue);
  }

  public updateValue =(event: Event) => {
    console.log('got new time', event, (event.srcElement as HTMLInputElement).value);
    const newValue = (event.srcElement as HTMLInputElement).value || null;
    let num: number;
    if (this.numberType === 'float') {
      num = parseFloat(newValue);
    } else {
      num = parseInt(newValue);
    }
    if (!isNaN(num) && newValue === num.toString()){
      this.numberChanged.emit(num);
    }
  }
  public numberValue: number;
  constructor() { }

  ngOnInit() {
  }

}
