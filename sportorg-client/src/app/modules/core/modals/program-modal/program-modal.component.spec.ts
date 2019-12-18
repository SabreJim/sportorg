import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramModalComponent } from './program-modal.component';

describe('ProgramModalComponent', () => {
  let component: ProgramModalComponent;
  let fixture: ComponentFixture<ProgramModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
