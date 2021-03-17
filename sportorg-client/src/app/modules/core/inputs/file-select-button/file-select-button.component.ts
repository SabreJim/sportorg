import {AfterViewInit, Component, Input, EventEmitter, Output} from "@angular/core";
import {MenuPositionX, MenuPositionY} from "@angular/material/menu";
import {FileProxyService, FileResponse} from "../../services/file-proxy.service";
import {TableColumn} from "../../models/ui-objects";
import {MatDialog} from "@angular/material/dialog";
import {ImagePreviewModalComponent} from "../../modals/image-preview-modal/image-preview-modal.component";

export interface FileSelectItem {
  fileId: number;
  fileName: string;

}
@Component({
  selector: 'file-select-button',
  templateUrl: './file-select-button.component.html',
  styleUrls: ['./file-select-button.component.scss']
})
export class FileSelectButtonComponent implements AfterViewInit {
  public ngAfterViewInit(): void {
  }
  constructor(protected fileProxy: FileProxyService, protected dialog: MatDialog){
  }

  @Output() updatedId = new EventEmitter<number>();
  @Input() customClass: string = '';
  @Input() xPosition: MenuPositionX = 'after';
  @Input() yPosition: MenuPositionY = 'below';
  @Input() fileType : 'image' | 'document' | 'all';
  @Input() category: string = 'all';

  public fileObject: any = null;

  public buttonTextFn = () => 'preview';
  public showPreview = (row: any, event: MouseEvent) => {
    const dialogRef = this.dialog.open(ImagePreviewModalComponent,
      { data: { imageId: row.fileId, trigger: event.target } });
  }
  public fileColumns: TableColumn[] = [
    new TableColumn('fileId', 'Id', 'number'),
    new TableColumn( 'fileName', 'File Name', 'long-string'),
    TableColumn.fromConfig({fieldName: 'editButton', title: 'Preview', type: 'button', buttonClass: '',
      buttonTextFn: this.buttonTextFn, buttonFn: this.showPreview }),
  ];
  public fileRows: any[] = [];

  public getSelectedFile = (fileRow: any) => {
    if (fileRow) {
      this.fileObject = fileRow;
    }
    this.updatedId.emit(this.fileObject.fileId);
  }
  public clearSelections = () => {
    this.fileObject = null;
  }

  public getFileInfo = () => {
    // when the menu opens, get the available files
    this.fileProxy.getFilesList(this.fileType, this.category).subscribe((rows: FileResponse[]) => {
      this.fileRows = rows.map((r) => {
        r.preview = `<button >preview</button>`;
        return r;
      });
    })
  }
}
