import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SportorgCalendarComponent } from './sportorg-calendar.component';

describe('SportorgCalendarComponent', () => {
  let component: SportorgCalendarComponent;
  let fixture: ComponentFixture<SportorgCalendarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SportorgCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportorgCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
