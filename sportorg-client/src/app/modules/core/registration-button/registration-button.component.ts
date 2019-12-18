import {Component, Input, OnInit} from "@angular/core";
import {ClassRecord} from "../models/data-objects";
import {Router} from "@angular/router";


@Component({
  selector: 'org-registration-button',
  templateUrl: './registration-button.component.html',
  styleUrls: ['./registration-button.component.scss']
})
export class RegistrationButtonComponent implements OnInit {
  @Input() program: ClassRecord;

  public openRegistrationModal = (ev: Event) => {
    this.appRouter.navigate(['register'], { queryParams: {programId: this.program.programId} });
  };

  constructor (private appRouter: Router) { }

  ngOnInit(): void {

  }

}
