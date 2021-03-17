import {Directive, Input, OnInit, ViewContainerRef} from "@angular/core";
import {FileProxyService} from "../services/file-proxy.service";
import {maxWorkers} from "@angular-devkit/build-angular/src/utils";

@Directive({
  selector: '[restImage]'
})
export class RestImageDirective implements  OnInit {
  constructor(protected fileProxy: FileProxyService, private viewContainer: ViewContainerRef) {
  }

  @Input() set restSrcId (newId: number) {
    this._srcId = newId;
    if (newId) {
      this.fileProxy.getImageById(this.restSrcId, this.preview).subscribe((base64String: string) => {
        this.viewContainer.element.nativeElement.style.opacity = 0; // hide while we resize
        this.viewContainer.element.nativeElement.src = base64String;
        this.sizeToFit();
      });
    }
  } get restSrcId () {
    return this._srcId;
  }
  private _srcId: number;

  @Input() maxSize: number = 400;
  @Input() preview = true;

  protected sizeToFit() {
    setTimeout(() => {
      const imageHeight = this.viewContainer.element.nativeElement.height;
      const imageWidth = this.viewContainer.element.nativeElement.width;
      let scaledSize = 0;
      if (imageWidth > imageHeight) {
        scaledSize = (this.maxSize / imageWidth) * imageHeight;
        this.viewContainer.element.nativeElement.style['max-width'] = `${this.maxSize}px`;
        this.viewContainer.element.nativeElement.width = this.maxSize;
        this.viewContainer.element.nativeElement.style['max-height'] = `${scaledSize}px`; // this should be scaled
        this.viewContainer.element.nativeElement.height = scaledSize; // this should be scaled
      } else {
        scaledSize = (this.maxSize / imageHeight) * imageWidth;
        this.viewContainer.element.nativeElement.style['max-height'] = `${this.maxSize}px`;
        this.viewContainer.element.nativeElement.height = this.maxSize;
        this.viewContainer.element.nativeElement.style['max-width'] = `${scaledSize}px`; // this should be scaled
        this.viewContainer.element.nativeElement.width = scaledSize; // this should be scaled
      }
      setTimeout(() => {
        this.viewContainer.element.nativeElement.style.opacity = 1; // show after resizing
      });
    })
  }

  ngOnInit(): void {
  }
}
