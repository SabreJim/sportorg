import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckinModalComponent } from './checkin-modal.component';

describe('CheckinModalComponent', () => {
  let component: CheckinModalComponent;
  let fixture: ComponentFixture<CheckinModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckinModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckinModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
