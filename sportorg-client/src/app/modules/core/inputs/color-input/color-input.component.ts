import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormControl, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {MenuPositionX, MenuPositionY} from "@angular/material/menu";
import {StaticValuesService} from "../../services/static-values.service";

@Component({
  selector: 'app-color-input',
  templateUrl: './color-input.component.html',
  styleUrls: ['./color-input.component.scss']
})
export class ColorInputComponent implements OnInit {

  @Input() set value(newValue: string) {
    if (this.colorFormControl) {
      this.colorFormControl.setValue(newValue);
    }
    this.chosenColor = newValue;
  }
  @Input() title: string;
  @Input() xPosition: MenuPositionX = 'after';
  @Input() yPosition: MenuPositionY = 'below';

  @Input() set isRequired(newValue: boolean) {
    this._isRequired = newValue;
    if (this.colorFormControl) {
      this.colorFormControl.setValidators([Validators.required]);
    }
  } get isRequired() {
    return this._isRequired;
  }
  protected _isRequired = false;
  protected changeSub: Subscription;

  @Output() valueChange = new EventEmitter<string>();
  @Output() valid = new EventEmitter<boolean>();

  public colorFormControl = new FormControl();
  public colorOptions: string[] = [];
  public chosenColor = '#FFFFFF';

  public clearSelections = () => {
    // clear values on menu close
  }
  public pickColor = (colorString: string) => {
    this.chosenColor = colorString;
    this.valueChange.emit(this.chosenColor);
  }
  ngOnInit(): void {
    this.colorOptions = StaticValuesService.ORG_COLORS.map(c => c.secondary);
  }
}
