import {AfterViewInit, Component, Input} from "@angular/core";
import { debounceTime, distinctUntilChanged} from "rxjs/operators";
import { equals, clone } from 'ramda';
import {MatCheckboxChange} from "@angular/material/checkbox";
import {OrgFormControl} from "../modals/validating-modal/validating-modal.component";
import {StaticValuesService} from "../services/static-values.service";
import {LookupItem} from "../models/rest-objects";

@Component({
  selector: 'app-validating-panel',
  template: '<div></div>'
})
export class ValidatingPanelComponent<T> implements AfterViewInit {

  constructor() {
  }

  @Input() get record () {
    return this._record;
  } set record(newValue: T) {
    this._record = newValue;
    this.defaultRecord = clone(newValue);
    this.updateModelToForm();
  }
  protected _record: T;
  public defaultRecord: T;
  protected primaryKeyField = 'id';
  public formControls: OrgFormControl[] = [];
  public editAllowed = true;
  public saveInProgress = false;
  public disableSaveMessage = 'Not all fields have been filled in';
  public canSave = false;
  public canReset = false;
  public isValid = true;
  protected didOnePass = false;

  ngAfterViewInit(): void {
  }

  protected connectFormControls = () => {
    // check validity and status of form controls and update the modal state
    for (const control of this.formControls) {
      control.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
        .subscribe((event: any) => {
          if (control?.specialFormat === 'date') {
            this.record[control.fieldName] = StaticValuesService.cleanDate(event);
          } else {
            this.record[control.fieldName] = event;
          }
          this.checkFormState();
        });
      control.statusChanges.pipe(debounceTime(100), distinctUntilChanged())
        .subscribe((event: any) => {
          this.checkFormState();
        });
    }
    this.updateModelToForm();
  }

  // take any values from the record and apply them to the UI
  protected updateModelToForm = () => {
    for (const control of this.formControls) {
      if (this.record && this.record.hasOwnProperty(control.fieldName)) {
        if (control?.specialFormat === 'date') {
          control.setValue(StaticValuesService.localizeDate(this.record[control.fieldName]));
        } else {
          control.setValue(this.record[control.fieldName]);
        }
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    }
    this.didOnePass = true;
    this.checkFormState();
  }

  protected checkRequiredFields = () => {
    let allRequiredAreSet = true;
    for (const control of this.formControls) {
      if (!control.valid) {
        allRequiredAreSet = false;
      }
      if (!this.editAllowed) { // automate disabling/enabling
        control.disable();
      } else {
        control.enable();
      }
    }
    if (this.customValidation) {
      allRequiredAreSet = allRequiredAreSet && this.customValidation();
    }
    this.isValid = allRequiredAreSet;
    this.checkDisableMessage();
  }

  protected checkFormState = () => {
    let stateChanged = !equals(this.record, this.defaultRecord);
    if (this.customDirtyCheck) {
      stateChanged = stateChanged || this.customDirtyCheck();
    }
    this.canReset = this.didOnePass && stateChanged;
    this.checkRequiredFields();
    this.canSave = this.checkCanSave();
  }
  protected checkDisableMessage = () => {
    let message = '';
    if (!this.editAllowed) {
      message = 'Not permitted to save changes';
    } else if (!this.isValid) {
      message = 'One or more fields have not been filled in correctly';
    } else if (!this.canReset) {
      message = 'No changes have been made yet';
    }
    this.disableSaveMessage = message;
  }

  public checkCanSave = (): boolean => {
    return this.editAllowed && !this.saveInProgress && this.isValid && this.canReset;
  }

  // this should be overridden to point to the correct endpoint to save the record
  protected saveRecord = (record: any): void => {
  }
  public saveAndClose = () => {
    if (!this.canSave) return;
    this.saveRecord(this.record);
  }

  public resetRecord = () => {
    this.record = clone(this.defaultRecord);
    this.didOnePass = false;
    this.updateModelToForm();
  }

  protected customValidation: () => boolean = () => { return true };
  protected customDirtyCheck: () => boolean = () => { return false };
  /////////////////////////////////////
  // custom handlers for field types
  /////////////////////////////////////
  public selectValue = (event: LookupItem, fieldName) => {
    if (!event || !event.id) return;
    this.record[fieldName] = event.name;
  }
  public setChecked(event: MatCheckboxChange, fieldName: string) {
    this.record[fieldName] = event.checked ? 'Y' : 'N';
    this.checkFormState();
  }
  public setCheckedInSet(event: MatCheckboxChange, arrayName: string, id: number) {
    if (!this.record[arrayName]?.length) {
      this.record[arrayName] = [];
    }
    if (event.checked) { // add to the set of selected circuits
      this.record[arrayName].push(id);
    } else {
      this.record[arrayName] = this.record[arrayName].filter((rowId: number) => {
        return rowId !== id;
      });
    }
    this.checkFormState();
  }

  public setValue(event: string | number, fieldName: string) {
    this.record[fieldName] = event;
    this.checkFormState();
  }

}
