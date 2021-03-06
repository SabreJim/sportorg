import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit, Renderer2,
  TemplateRef, ViewContainerRef
} from "@angular/core";
import {TooltipComponent} from "./tooltip.component";
import Timer = NodeJS.Timer;
import {Observable, Subscription} from "rxjs";
import {SnackbarService} from "../services/snackbar.service";
import {StaticValuesService} from "../services/static-values.service";
import {TooltipIconComponent} from "./tooltip-icon/tooltip-icon.component";


@Directive({selector: '[appTooltip]'})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() tooltipData: any;
  @Input() tooltipDataFn: Observable<any>;
  @Input() showTooltip: boolean;
  @Input() hangBelow: boolean = false;
  @Input() hangRight: boolean = false;
  @Input() tooltipPanelClass: string = 'w400';
  @Input() delayClose: number = 1000; // milliseconds
  @Input() delayOpen: number = 500; // milliseconds

  protected timeoutRef: Timer;
  protected ignoreClose = false;
  protected stillInSource = false;
  protected static tipCreated = false;
  protected static tooltipComponent: ComponentRef<TooltipComponent>;
  protected tipIconComponent: ComponentRef<TooltipIconComponent>;
  protected enterListener: Subscription;
  protected exitListener: Subscription;
  protected createdListener: Subscription;
  protected iconClickListener: Subscription;
  protected tipClickListener: Subscription;
  protected revertCursor: string;
  protected mobileMode: boolean = false;

  constructor (private elementRef: ElementRef,
               private componentFactoryResolver: ComponentFactoryResolver,
               private viewContainer: ViewContainerRef) {}

  @HostListener('mouseenter', ['$event']) show(event: MouseEvent) {
    this.stillInSource = true;
    if (this.showTooltip === false || TooltipDirective.tipCreated === true) {
      return; // nothing to do
    }
    if (this.delayOpen && this.delayOpen > 0) {
      // delay creating the tooltip so we don't spam the UI
      this.revertCursor = this.elementRef.nativeElement.style.cursor;
      this.elementRef.nativeElement.style.cursor = 'help';
      setTimeout(() => {
        if (this.stillInSource) {
          this.createTipComponent(event);
        }
      }, this.delayOpen);
    } else {
      this.createTipComponent(event);
    }
  }

  @HostListener('mouseleave') hideLeave() {
    this.stillInSource = false;
    this.beginClosing();
  }

  protected createTipComponent = (event: MouseEvent) => {
    try {
      // Create a component reference from the component
      const factory: ComponentFactory<TooltipComponent> = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent);

      if (TooltipDirective.tipCreated) {
        this.destroyAndDetach();
      }
      // Attach component to the appRef so that it's inside the ng component tree
      TooltipDirective.tooltipComponent = this.viewContainer.createComponent(factory);

      let dataGetter: Observable<any>;
      if (this.tooltipDataFn) {
        dataGetter = this.tooltipDataFn;
      } else if (this.tooltipData) {
        dataGetter = new Observable<any>((subscription) => { subscription.next(this.tooltipData); });
      } else {
        dataGetter = new Observable<any>((subscription) => {subscription.next(null); });
      }
      dataGetter.subscribe((value: any) => {
        if (value) {
          TooltipDirective.tooltipComponent.instance.dataContent = { data: value };
        }
      });

      try {
        const tipWidth = parseInt(this.tooltipPanelClass.substring(1, this.tooltipPanelClass.length));
        if (this.hangRight || (event.clientX - tipWidth) < 200) { // align top right position
          TooltipDirective.tooltipComponent.instance.sourceLeft = `${this.elementRef.nativeElement.offsetLeft + tipWidth}px`;
        } else { // regular top left position
          TooltipDirective.tooltipComponent.instance.sourceLeft = `${this.elementRef.nativeElement.offsetLeft}px`;
        }
      } catch (err) { // fallback to just top left position
        TooltipDirective.tooltipComponent.instance.sourceLeft = `${this.elementRef.nativeElement.offsetLeft}px`;
      }

      // total height is harder to determine. Only position below the target element if requested that way
      if (this.hangBelow) {
        // TODO: render as opacity 0, measure height, then add that to offsetTop
        TooltipDirective.tooltipComponent.instance.sourceTop = `${this.elementRef.nativeElement.offsetTop + 400}px`;
      } else {
        TooltipDirective.tooltipComponent.instance.sourceTop = `${this.elementRef.nativeElement.offsetTop}px`;
      }

      TooltipDirective.tooltipComponent.instance.panelClass = this.tooltipPanelClass;
      TooltipDirective.tooltipComponent.instance.contentTemplate = this.tooltipTemplate;
      this.exitListener = TooltipDirective.tooltipComponent.instance.userLeft.subscribe(this.destroyAndDetach);
      this.tipClickListener = TooltipDirective.tooltipComponent.instance.userClicked.subscribe((status: boolean) => {
        if (this.mobileMode) {
          this.destroyAndDetach();
        }
      });
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
    if (!this.stillInSource && TooltipDirective.tipCreated && !this.mobileMode) {
      this.timeoutRef = setTimeout(() => {
        if (!this.ignoreClose) {
          this.destroyAndDetach();
        }
      }, this.delayClose);
    }
  }

  protected destroyAndDetach = () => {
    try {
      if (!this.mobileMode) {
        this.viewContainer.clear();
      }
      this.stillInSource = false;
      if (TooltipDirective.tooltipComponent) TooltipDirective.tooltipComponent.destroy();

      TooltipDirective.tipCreated = false;
      if (this.revertCursor) this.elementRef.nativeElement.style.curor = this.revertCursor;
      if (this.exitListener && this.exitListener.unsubscribe) this.exitListener.unsubscribe();
      if (this.enterListener && this.enterListener.unsubscribe) this.enterListener.unsubscribe();
      if (this.tipClickListener && this.tipClickListener.unsubscribe) this.tipClickListener.unsubscribe();
    }catch (err) {
      TooltipDirective.tipCreated = false;
    }
  };

  ngOnDestroy(): void {
    this.destroyAndDetach();
    // destroy the icon if one was created dynamically
    if (this.tipIconComponent) this.tipIconComponent.destroy();
    if (this.iconClickListener && this.iconClickListener.unsubscribe) this.iconClickListener.unsubscribe();
  }

  ngOnInit(): void {
    // check if the view is mobile and append a (?) link
    // if (window.hasOwnProperty('ontouchstart') || navigator.maxTouchPoints > 0) {
      if (window.innerWidth <= StaticValuesService.MAX_MOBILE_WIDTH_WIDE) {
        this.mobileMode = true;
        // Create a component reference from the component
        const iconFactory: ComponentFactory<TooltipIconComponent> = this.componentFactoryResolver.resolveComponentFactory(TooltipIconComponent);

        // Attach component to the appRef so that it's inside the ng component tree
        this.tipIconComponent = this.viewContainer.createComponent(iconFactory);
        this.iconClickListener = this.tipIconComponent.instance.clicked.subscribe((ev: MouseEvent) => {
          if (TooltipDirective.tipCreated) {
            this.destroyAndDetach();
          } else {
            this.createTipComponent(ev);
          }
        });
    }
  }

}
