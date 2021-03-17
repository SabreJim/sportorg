import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FitnessProfileModalComponent } from './fitness-profile-modal.component';

describe('FitnessProfileModalComponent', () => {
  let component: FitnessProfileModalComponent;
  let fixture: ComponentFixture<FitnessProfileModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessProfileModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
