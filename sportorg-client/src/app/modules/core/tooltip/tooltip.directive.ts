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
  @Input() delayClose: number = 1000; // milliseconds

  protected timeoutRef: Timer;
  protected ignoreClose = false;
  protected stillInSource = false;
  protected static tipCreated = false;
  protected static tooltipComponent: ComponentRef<TooltipComponent>;
  protected enterListener: Subscription;
  protected exitListener: Subscription;
  protected createdListener: Subscription;

  constructor (private elementRef: ElementRef,
               private componentFactoryResolver: ComponentFactoryResolver,
               private viewContainer: ViewContainerRef) {}

  @HostListener('mouseenter') show() {
    // delay creating the tooltip so we don't spam the UI
    this.stillInSource = true;
    if (this.showTooltip === false || TooltipDirective.tipCreated === true) {
      return; // nothing to do
    }
    this.createTipComponent();
  }

  @HostListener('mouseleave') hideLeave() {
    this.stillInSource = false;
    this.beginClosing();
  }

  protected createTipComponent = () => {
    try {
      // Create a component reference from the component
      const factory: ComponentFactory<TooltipComponent> = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent);

      // Attach component to the appRef so that it's inside the ng component tree
      TooltipDirective.tooltipComponent = this.viewContainer.createComponent(factory);
      if (this.tooltipData) {
        TooltipDirective.tooltipComponent.instance.dataContent = { data: this.tooltipData };
      }
      TooltipDirective.tooltipComponent.instance.sourceLeft = `${this.elementRef.nativeElement.offsetLeft}px`;
      TooltipDirective.tooltipComponent.instance.sourceTop = `${this.elementRef.nativeElement.offsetTop}px`;
      TooltipDirective.tooltipComponent.instance.panelClass = this.tooltipPanelClass;
      TooltipDirective.tooltipComponent.instance.contentTemplate = this.tooltipTemplate;
      this.exitListener = TooltipDirective.tooltipComponent.instance.userLeft.subscribe(this.destroyAndDetach);
      this.enterListener = TooltipDirective.tooltipComponent.instance.userEntered.subscribe((status: boolean) => {
        if (this.timeoutRef) {
          clearTimeout(this.timeoutRef);
        }
        this.ignoreClose = status;
      });
      this.createdListener = TooltipDirective.tooltipComponent.instance.tipCreated.subscribe((isCreated: boolean) => {
        TooltipDirective.tipCreated = isCreated === true;
        this.beginClosing();
      });

    } catch (error) {
    }
  }

  // when both the element has been created, and the user leaves the source component, begin counting down
  // to closing the tooltip. This gives the user some time to enter the tooltip or stay open forever if they
  // stay in the source component
  protected beginClosing = () => {
    if (!this.stillInSource && TooltipDirective.tipCreated) {
      this.timeoutRef = setTimeout(() => {
        if (!this.ignoreClose) {
          this.destroyAndDetach();
        }
      }, this.delayClose);
    }
  }

  protected destroyAndDetach = () => {
    try {
      this.viewContainer.clear();
      if (TooltipDirective.tooltipComponent) TooltipDirective.tooltipComponent.destroy();
      TooltipDirective.tipCreated = false;
      if (this.exitListener && this.exitListener.unsubscribe) this.exitListener.unsubscribe();
      if (this.enterListener && this.enterListener.unsubscribe) this.enterListener.unsubscribe();
    }catch (err) {
      TooltipDirective.tipCreated = false;
    }
  };

  ngOnDestroy(): void {
    this.destroyAndDetach();
  }

  ngOnInit(): void {
  }

}
