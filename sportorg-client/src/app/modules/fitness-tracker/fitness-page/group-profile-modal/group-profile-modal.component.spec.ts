import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupProfileModalComponent } from './group-profile-modal.component';

describe('GroupProfileModalComponent', () => {
  let component: GroupProfileModalComponent;
  let fixture: ComponentFixture<GroupProfileModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupProfileModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
