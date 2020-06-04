import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-tooltip-icon',
  templateUrl: './tooltip-icon.component.html',
  styleUrls: ['./tooltip-icon.component.scss']
})
export class TooltipIconComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Output() clicked: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  public doClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.clicked.next(event);
  }
}
