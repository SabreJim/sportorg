import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FitnessProfilePageComponent } from './fitness-profile-page.component';

describe('FitnessProfilePageComponent', () => {
  let component: FitnessProfilePageComponent;
  let fixture: ComponentFixture<FitnessProfilePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessProfilePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
