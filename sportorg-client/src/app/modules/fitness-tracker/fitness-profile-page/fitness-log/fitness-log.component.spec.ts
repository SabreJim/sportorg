import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessLogComponent } from './fitness-log.component';

describe('FitnessLogComponent', () => {
  let component: FitnessLogComponent;
  let fixture: ComponentFixture<FitnessLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FitnessLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
