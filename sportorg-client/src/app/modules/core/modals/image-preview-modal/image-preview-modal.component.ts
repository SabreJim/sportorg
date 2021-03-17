import {OnInit, Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styleUrls: ['./image-preview-modal.component.scss']
})
export class ImagePreviewModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<ImagePreviewModalComponent>) {
    console.log('modal got data', data);
    if (data && data.isPreview === false) {
      this.isPreview = false;
    }
    console.log('modal got data', data, this.isPreview);
    if (data && data.imageId) {
      setTimeout(() => {
        this.imageId = this.data.imageId;
      });
    }
    if (data && data.trigger) {
      this.triggerElementRef = data.trigger;
    }
  }

  public imageId: number;
  public triggerElementRef: any;
  public isPreview = true;

  ngOnInit(): void {
    // repositions the modal to below where the click occurred
    // const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    // const rect = this.triggerElementRef.getBoundingClientRect();
    // matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom - 50}px` };
    // matDialogConfig.width = '300px';
    // matDialogConfig.height = '400px';
    // this.matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    // this.matDialogRef.updatePosition(matDialogConfig.position);
  }
}
