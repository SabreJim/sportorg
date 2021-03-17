import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HtmlEditorModalComponent} from "../../modals/htm-editor-modal/html-editor-modal.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-html-input',
  templateUrl: './html-input.component.html',
  styleUrls: ['./html-input.component.scss']
})
export class HtmlInputComponent implements OnInit {

  @Input() set htmlString (newValue: string) {
    this.htmlValue = newValue;
  }
  @Input() disabled: boolean = false;
  @Output() updateHtml = new EventEmitter<string>();

  public editHtml = () => {
    // open a modal and pass in the member
    const dialogRef = this.dialog.open(HtmlEditorModalComponent,
      { minWidth: '400px', maxWidth: '80vw', minHeight: '600px',  maxHeight: '80vh', data: { htmlString: this.htmlValue } });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result && result.length) {
        this.htmlValue = result;
        this.updateHtml.emit(this.htmlValue);
      }
    });
  }
  public htmlValue: string;
  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }


}
