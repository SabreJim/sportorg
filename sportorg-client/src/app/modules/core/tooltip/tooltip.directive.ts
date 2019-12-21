import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef, ViewContainerRef
} from "@angular/core";
import {TooltipComponent} from "./tooltip.component";
import Timer = NodeJS.Timer;
import {Subscription} from "rxjs";


@Directive({selector: '[appTooltip]'})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() tooltipData: any;
  @Input() showTooltip: boolean;
  @Input() tooltipPanelClass: string;

  protected timeoutRef: Timer;
  protected ignoreClose = false;
  protected stillInSource = false;
  protected tooltipComponent: ComponentRef<TooltipComponent>;
  protected enterListener: Subscription;
  protected exitListener: Subscription;

  constructor (private elementRef: ElementRef,
               private componentFactoryResolver: ComponentFactoryResolver,
               private viewContainer: ViewContainerRef) {}

  @HostListener('mouseenter') show() {
    // delay creating the tooltip so we don't spam the UI
    this.stillInSource = true;
    setTimeout(() => {
      if (this.showTooltip === false || !this.stillInSource) {
        return; // disabled
      }
      try {
        // Create a component reference from the component
        const factory: ComponentFactory<TooltipComponent> = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent);

        // Attach component to the appRef so that it's inside the ng component tree
        this.tooltipComponent = this.viewContainer.createComponent(factory);
        if (this.tooltipData){
          this.tooltipComponent.instance.dataContent = { data: this.tooltipData };
        }
        this.tooltipComponent.instance.sourceLeft = `${this.elementRef.nativeElement.offsetLeft}px`;
        this.tooltipComponent.instance.sourceTop = `${this.elementRef.nativeElement.offsetTop}px`;
        this.tooltipComponent.instance.panelClass = this.tooltipPanelClass;
        this.tooltipComponent.instance.contentTemplate = this.tooltipTemplate;
        this.exitListener = this.tooltipComponent.instance.userLeft.subscribe(this.destroyAndDetach);
        this.enterListener = this.tooltipComponent.instance.userEntered.subscribe((status: boolean) => {
          if (this.timeoutRef) {
            clearTimeout(this.timeoutRef);
          }
          this.ignoreClose = status;
        });

      } catch (error) {
        console.log('directive error', error);
      }
    },400);

  }

  @HostListener('mouseleave') hideLeave() {
    this.stillInSource = false;
    this.timeoutRef = setTimeout(() => {
      if (!this.ignoreClose) {
        this.destroyAndDetach();
      }
    }, 500);
  }

  protected destroyAndDetach = () => {
    try {
      this.viewContainer.clear();
      if (this.tooltipComponent) this.tooltipComponent.destroy();
      if (this.exitListener && this.exitListener.unsubscribe) this.exitListener.unsubscribe();
      if (this.enterListener && this.enterListener.unsubscribe) this.enterListener.unsubscribe();
    }catch (err) {
    }
  };

  ngOnDestroy(): void {
    this.destroyAndDetach();
  }

  ngOnInit(): void {
  }

}
