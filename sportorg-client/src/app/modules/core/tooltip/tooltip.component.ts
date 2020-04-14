import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements AfterViewInit {

  @Input() contentTemplate: TemplateRef<any>;
  @Input() dataContent: any;
  @Input() sourceTop: string = '0px';
  @Input() sourceLeft: string = '0px';
  @Input() panelClass: string = '400w';
  @Output() userEntered = new EventEmitter<boolean>();
  @Output() userLeft = new EventEmitter<boolean>();
  @Output() tipCreated = new EventEmitter<boolean>();

  public stealthRender = true;
  public enterTooltip = () => {
    this.userEntered.next(true);
  }
  public leaveTooltip = () => {
    this.userLeft.next(true);
    this.userEntered.next(false);
  }
  constructor() { }

  ngAfterViewInit(): void {
    this.tipCreated.next(true);
  }

}
