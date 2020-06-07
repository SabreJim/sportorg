import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberScreeningModalComponent } from './member-screening-modal.component';

describe('MemberScreeningModalComponent', () => {
  let component: MemberScreeningModalComponent;
  let fixture: ComponentFixture<MemberScreeningModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberScreeningModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberScreeningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
