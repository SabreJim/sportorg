import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-string-input',
  templateUrl: './string-input.component.html',
  styleUrls: ['./string-input.component.scss']
})
export class StringInputComponent implements OnInit {

  @Input() set value (newValue: string) {
    this.stringValue = newValue;
  }
  @Input() minWidth: string = '200px';
  @Input() useTextArea: boolean = false;
  @Output() stringChanged = new EventEmitter<string>();

  public clearString = () => {
    this.stringValue = null;
    this.stringChanged.emit(this.stringValue);
  }

  public updateValue =(event: Event) => {
    const newValue = (event.srcElement as HTMLInputElement).value || null;
    // TODO: input sanitization
    this.stringChanged.emit(newValue);
  }
  public stringValue: string;
  constructor() { }

  ngOnInit() {
  }

}
