import {AfterViewInit, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-htm-editor-modal',
  templateUrl: './html-editor-modal.component.html',
  styleUrls: ['./html-editor-modal.component.scss']
})
export class HtmlEditorModalComponent implements AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<HtmlEditorModalComponent>) {
  }

  ngAfterViewInit(): void {

    if (this.data && this.data.htmlString) {
      this.htmlValue = this.sanitizeHtml(this.data.htmlString);
    }
  }
  public htmlValue: string;
  public isValidHtml: boolean = false;
  public config: any = {

  };
  public sanitizeHtml = (dirtyValue: string) => {
    // clean incoming values
    let cleanValue = dirtyValue;
    return cleanValue;
  }

  public saveHtml = () => {
    if (!this.isValidHtml) {
      this.matDialogRef.close(this.sanitizeHtml(this.htmlValue));
    }
  }
}
