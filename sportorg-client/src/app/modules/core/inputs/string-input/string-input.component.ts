import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

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
  @Input() placeholder: string;
  @Output() stringChanged = new EventEmitter<string>();

  public textFormControl = new FormControl();
  public clearString = () => {
    this.stringValue = null;
    this.textFormControl.setValue(null);
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
    this.textFormControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((newText) => {
        if (newText && newText.length) {
          this.stringChanged.emit(newText);
          this.stringValue = newText;
        } else {
          this.stringChanged.emit(null);
          this.stringValue = null;
        }
      });
  }

}
