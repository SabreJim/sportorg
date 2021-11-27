import {Directive, EventEmitter, HostListener, Input, Output} from "@angular/core";

@Directive({
  selector: "[keyboard-capture]"
})
export class KeyboardCaptureDirective {
  @Output() customKeyUp: EventEmitter<boolean> = new EventEmitter<false>();
  @Input() keyHandler: (event: KeyboardEvent) => void;

  @HostListener("keyup", ["$event"])
  public onListenerTriggered(event: KeyboardEvent): void {
    console.log('key up', event.key, event);
    this.customKeyUp.emit(true);
  }
}
