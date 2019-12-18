import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-time-input',
  templateUrl: './time-input.component.html',
  styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent implements OnInit {

  @Input() set value (newValue: string) {
    this.timeValue = newValue;
  }
  @Output() timeChanged = new EventEmitter<string>();

  public clearTime = () => {
    this.timeValue = null;
    this.timeChanged.emit(this.timeValue);
  }

  public updateValue =(event: Event) => {
    const newValue = (event.srcElement as HTMLInputElement).value || null;
    this.timeChanged.emit(newValue);
  }
  public timeValue: string;
  constructor() { }

  ngOnInit() {
  }

}
