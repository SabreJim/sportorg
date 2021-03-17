import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MemberScreeningModalComponent } from './member-screening-modal.component';

describe('MemberScreeningModalComponent', () => {
  let component: MemberScreeningModalComponent;
  let fixture: ComponentFixture<MemberScreeningModalComponent>;

  beforeEach(waitForAsync(() => {
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
