import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject} from "@angular/core";
import {RegistrationDialogData} from "../../models/ui-objects";

@Component({
  selector: 'org-registration-dialog',
  templateUrl: 'registration-dialog.component.html',
  styleUrls: ['../registration-button.component.scss']
})
export class RegistrationDialogComponent {
  public mailTo = 'mailto:capitalyfencing@gmail.com';
  public mailToName = 'CapitalYFencing@gmail.com';

  constructor(
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RegistrationDialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
