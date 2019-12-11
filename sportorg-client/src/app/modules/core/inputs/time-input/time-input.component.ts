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

  }

  public updateValue =(event: Event) => {
    console.log('got new time', event);
  }
  public timeValue: string;
  constructor() { }

  ngOnInit() {
  }

}
