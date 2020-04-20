import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessProfileModalComponent } from './fitness-profile-modal.component';

describe('FitnessProfileModalComponent', () => {
  let component: FitnessProfileModalComponent;
  let fixture: ComponentFixture<FitnessProfileModalComponent>;

  beforeEach(async(() => {
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
