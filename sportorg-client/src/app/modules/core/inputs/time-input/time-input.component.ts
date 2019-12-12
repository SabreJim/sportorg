import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {

  @Input() set value (newValue: string) {
    console.log('incoming value', newValue);
    this.timeValue = newValue;
  }
  @Output() timeChanged = new EventEmitter<string>();

  public clearTime = () => {
    this.timeValue = null;
    this.timeChanged.emit(this.timeValue);
  }

  public updateValue =(event: Event) => {
    console.log('got new time', event, (event.srcElement as HTMLInputElement).value);
    const newValue = (event.srcElement as HTMLInputElement).value || null;
    this.timeChanged.emit(newValue);
    // if (this.timeValue.length > 3) {
    //   this.timeChanged.emit(`${this.timeValue.slice(0,2)}:${this.timeValue.slice(-2)}`);
    // } else {
    //   this.timeChanged.emit(`0${this.timeValue.slice(0,1)}:${this.timeValue.slice(-2)}`);
    // }
  }
  public timeValue: string;
  constructor() { }

  ngOnInit() {
  }

}
