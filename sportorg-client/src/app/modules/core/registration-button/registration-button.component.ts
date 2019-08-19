import {Component, Input, OnInit} from "@angular/core";
import {RecentItem, RegistrationDialogData} from "../models/ui-objects";
import {FeeStructure, ProgramDescription, ProgramSchedule} from "../models/data-objects";
import {MatDialog} from "@angular/material";
import {RegistrationDialogComponent} from "./registration-dialog/registration-dialog.component";


@Component({
  selector: 'org-registration-button',
  templateUrl: './registration-button.component.html',
  styleUrls: ['./registration-button.component.scss']
})
export class RegistrationButtonComponent implements OnInit {

  public optionText = 'View Registration Fees';
  public isExternalRegistration = false;
  public showOptions = true;
  public externalRegistrationLink: string;

  protected _program: ProgramDescription;
  @Input() get program(): ProgramDescription {
    return this._program;
  }
  set program(newProgram: ProgramDescription) {
    if (newProgram) {
      this.isExternalRegistration = newProgram.registrationMethod !== 'INTERNAL';
      if (this.isExternalRegistration) {
        this.externalRegistrationLink = newProgram.registrationLink;
        this.optionText = newProgram.registrationMethod;
      }
      this._program = newProgram;
    }
  }

  protected _fees: FeeStructure;
  @Input() get feeStructure(): FeeStructure {
    return this._fees;
  }
  set feeStructure(newFees: FeeStructure) {
    if (newFees) {
      this.isExternalRegistration = newFees.registrationLink && newFees.registrationLink.length > 0;
      if (this.isExternalRegistration) {
        this.externalRegistrationLink = newFees.registrationLink;
        this.optionText = 'Register directly through the YMCA';
      }
      this.showOptions = false;
      this._fees = newFees;
    }
  }

  public noClose = (ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();
  }
  public openRegistrationModal = () => {
    console.log('opening modal', this.program, this.feeStructure);
    // pass in values
    let values: RegistrationDialogData = {
      programName: 'not found',
      programFees: -1,
      season: '',
      year: new Date().getUTCFullYear()
    };
    if (this.program) {
      values = {
        programName: this.program.levelName,
        programFees: this.program.feeValue,
        season: this.program.seasonName,
        year: this.program.year
      };
    } else if (this.feeStructure) {
      values.programName = this.feeStructure.feeName;
      values.programFees = this.feeStructure.feeValue;
    }

    const dialogRef = this.dialog.open(RegistrationDialogComponent, {
      width: '450px',
      height: '500px',
      data: values
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  constructor (public dialog: MatDialog) { }

  ngOnInit(): void {

  }

}
