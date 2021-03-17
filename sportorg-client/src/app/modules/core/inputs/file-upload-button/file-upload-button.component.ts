import {AfterViewInit, Component, ElementRef, Input, EventEmitter, OnInit, Output, ViewChild} from "@angular/core";
import {MenuPositionX} from "@angular/material/menu";
import {FileProxyService} from "../../services/file-proxy.service";
import {FormControl} from "@angular/forms";


@Component({
  selector: 'file-upload-button',
  templateUrl: './file-upload-button.component.html',
  styleUrls: ['./file-upload-button.component.scss']
})
export class FileUploadButtonComponent implements AfterViewInit {
  public ngAfterViewInit(): void {
  }
  constructor(protected fileProxy: FileProxyService){

  }

  @Output() updatedId = new EventEmitter<number>();
  @Input() customClass: string = '';
  @Input() category: string = 'all';
  @Input() requestType: string;
  @Input() fileId: number;
  @Input() hideProgress: boolean = false;
  @Input() position: MenuPositionX = 'before';
  @Input() set fileType (typeName: 'image' | 'document' | 'all') {
    this._fileType = typeName;
    if (typeName === 'image') {
      this.accepts = ['.jpg', '.jpeg', '.img', '.png', '.gif'];
    } else if (typeName === 'document') {
      this.accepts = ['.pdf', '.txt'];
    } else {
      this.accepts = ['.pdf', '.jpg', '.jpeg', '.img', '.png', '.gif', '.txt'];
    }
  } get fileType() {
    return this._fileType;
  }
  protected _fileType: 'image' | 'document' | 'all';

  public accepts: string[] = ['.pdf', '.jpg', '.jpeg', '.img', '.png', '.gif', '.txt'];
  @ViewChild('fileInputElement') fileInputElement: ElementRef;
  public fileInputControl = new FormControl();

  public fileObject: File = null;
  public inProgress: boolean = false;
  public wasCancelled: boolean = false;
  public completed: boolean = false;
  public failed: boolean = false;

  public selectFile = (event: MouseEvent) => {
    this.fileInputElement.nativeElement.click();
  }

  public fileChanged = () => {
    if (this.fileInputElement && this.fileInputElement.nativeElement.files && this.fileInputElement.nativeElement.files.length) {
      this.fileObject = this.fileInputElement.nativeElement.files[0];
      this.wasCancelled = false;
    } else {
      this.fileObject = null;
    }
    this.failed = false;
  }

  public cancel() {
    this.fileObject = null;
    this.inProgress = false;
    this.completed = false;
    this.fileInputControl.setValue('');
    this.wasCancelled = true;
  }
  public uploadFiles(event: MouseEvent) {
    this.inProgress = true;
    this.fileProxy.uploadFile(this.fileObject, this.category, this.requestType, this.fileId).subscribe((newId: number) => {
      if (newId > 0) {
        this.inProgress = false;
        this.completed = true;
        this.updatedId.emit(newId);
      } else {
        this.cancel();
        this.wasCancelled = false;
        this.failed = true;
        this.updatedId.emit(newId);
      }
    })
  }
}
