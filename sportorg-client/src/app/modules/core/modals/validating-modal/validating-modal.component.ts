import {AfterViewInit, Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LookupItem} from "../../models/rest-objects";
import {AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn} from "@angular/forms";
import { debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import { equals, clone } from 'ramda';
import {MatCheckboxChange} from "@angular/material/checkbox";
import {StaticValuesService} from "../../services/static-values.service";

export class OrgFormControl extends FormControl {
  public fieldName: string;
  public specialFormat: string;
  constructor(fieldName: string, formState?: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
              asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    super(formState, validatorOrOpts, asyncValidator);
    this.fieldName = fieldName;
    if (formState?.specialFormat?.length) {
      this.specialFormat = formState.specialFormat;
    }
  }
}
@Component({
  selector: 'app-validating-modal',
  template: '<div></div>'
})
export class ValidatingModalComponent<T> implements AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<ValidatingModalComponent<T>>) {
  }

  public record: T;
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
    setTimeout(() => { // wait for lookups
      if (this.data && this.data[this.primaryKeyField]) {
        // use the provided record if editing an existing record and no REST function provided
        if (!this.getRecord) {
          this.record = clone(this.data);
          this.defaultRecord = clone(this.data);
          this.dataLoaded.next(true);
        } else {
          this.getRecord(this.data[this.primaryKeyField]).subscribe((record: T) => {
            if (!record) {
              this.record = clone(this.defaultRecord);
              this.dataLoaded.next(true);
            } else {
              this.record = record;
              this.defaultRecord = clone(this.data);
              this.dataLoaded.next(true);
            }
          });
        }
      } else {
        this.record = this.defaultRecord ? clone(this.defaultRecord) : {} as T;
        this.dataLoaded.next(true);
      }
    });
  }
  public getRecord: (id: number) => Observable<T>

  protected dataLoaded = new Subject<boolean>();
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
  protected saveRecord = (record: any): Observable<number> => {
    return new Observable<number>();
  }
  public saveAndClose = () => {
    if (!this.canSave) return;
    this.saveRecord(this.record).subscribe((recordId: number) => {
      if (recordId > 0) {
        this.matDialogRef.close({ success: true });
      }
    });
  }

  public resetRecord = () => {
    this.record = clone(this.defaultRecord);
    this.didOnePass = false;
    this.updateModelToForm();
    // for (const control of this.formControls) {
    //   control.markAsPristine();
    // }
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
  public setValue(event: string | number, fieldName: string) {
    this.record[fieldName] = event;
    this.checkFormState();
  }

}
