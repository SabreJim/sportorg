import {Overlay, OverlayPositionBuilder, OverlayRef} from "@angular/cdk/overlay";
import {ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit} from "@angular/core";
import {ComponentPortal} from "@angular/cdk/portal";
import {ContextMenuComponent} from "./context-menu.component";

export interface ContextMenuItem {
  menuTitle: string;
  menuAction?: (record: any) => void;
  subMenu?: ContextMenuItem[]
}

@Directive({selector: '[orgContextMenu]' })
export class ContextMenuDirective implements OnInit, OnDestroy {
  constructor (private overlayPositionBuilder: OverlayPositionBuilder,
               private elementRef: ElementRef,
               private overlay: Overlay) {

  }
  @Input() contextRecord: any;
  @Input() contextItems: ContextMenuItem[] = [{ menuTitle: 'Default', menuAction: (record:any) => {}}];
  protected menuComponent: ComponentPortal<ContextMenuComponent>;
  protected overlayRef: OverlayRef;

  @HostListener('contextmenu', ['$event']) onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    // attach context-menu to overlay if not already attached
    try {
      this.menuComponent = new ComponentPortal(ContextMenuComponent);
      this.overlayRef.detach();
      const menuRef: ComponentRef<ContextMenuComponent> = this.overlayRef.attach(this.menuComponent);
      const menuHeight = 12 + (50 * this.contextItems.length) + 50;
      const menuWidth = 280 + 50;

      menuRef.instance.menuItems = this.contextItems;
      if (this.contextRecord) {
        menuRef.instance.contextRecord = this.contextRecord;
      }
      // determine best positioning
      menuRef.instance.yPosition = (event.y + menuHeight) > window.innerHeight ? 'above' : 'below';
      menuRef.instance.xPosition = (event.x + menuWidth) > window.innerWidth ? 'before' : 'after';

      menuRef.instance.closeContext.subscribe(() => {
        try {
          this.overlayRef.detach();
        } catch (detachError) {
          // eat this error too
        }
      });
    } catch (err) {
      // eat the error
    }
  }

  ngOnInit() {
    this.elementRef.nativeElement.style.cursor = 'context-menu'; // set the parent element cursor
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'bottom'
      }])
      .withViewportMargin(10);
    this.overlayRef = this.overlay.create({positionStrategy});
  }
  ngOnDestroy() {

  }
}
