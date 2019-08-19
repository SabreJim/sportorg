import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, Event, NavigationStart} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  // app level information about the current user's session

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    // subscribe to the user's logged in state
  }

  constructor (private appRouter: Router) {
    appRouter.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // if not logged in and required to be, redirect to login
      }
    })
  }
}
