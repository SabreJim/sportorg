import {AfterViewInit, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {AngularEditorConfig} from "@kolkov/angular-editor/lib/config";

export interface HtmlEditorModalConfig {
  htmlString: string;
  title?: string;
}

@Component({
  selector: 'app-htm-editor-modal',
  templateUrl: './html-editor-modal.component.html',
  styleUrls: ['./html-editor-modal.component.scss']
})
export class HtmlEditorModalComponent implements AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: HtmlEditorModalConfig,
              public matDialogRef: MatDialogRef<HtmlEditorModalComponent>) {
  }

  ngAfterViewInit(): void {
    if (this.data && this.data.htmlString) {
      setTimeout(() => { // third-party plugin not handling changeDetection when injecting immediately
        this.htmlValue = this.sanitizeHtml(this.data.htmlString);
      });

    }
    this.title = this.data.title;
  }
  public title: string;
  public htmlValue: string = '';
  public isValidHtml: boolean = false;
    public sanitizeHtml = (dirtyValue: string) => {
      // clean incoming values
      try {
        let cleanValue = dirtyValue.replace(/<b>/g, '<strong>').replace(/<\/b>/, '</strong>');
        cleanValue = cleanValue.replace(/<i>/g, '<em>').replace(/<\/i>/, '</em>');

        this.isValidHtml = true;
        return cleanValue;
      } catch (cleanError) {
        console.log('error clearing HTML content', cleanError);
        this.isValidHtml = false;
        return dirtyValue;
      }
    }

    public saveHtml = () => {
      // check HTML value
      let cleanText = this.sanitizeHtml(this.htmlValue);
      if (this.isValidHtml) {
        this.matDialogRef.close(cleanText);
      }
    }

    public editorConfig: AngularEditorConfig = {
      editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'}
      ],
      customClasses: [
        // {
        //   name: 'titleText',
        //   class: 'titleText',
        //   tag: 'h1',
        // },
      ],
      sanitize: true,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
        ['undo', 'redo'],
        [ 'insertImage',
          'insertVideo',]
      ]
    };
}
