import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupProfileModalComponent } from './group-profile-modal.component';

describe('GroupProfileModalComponent', () => {
  let component: GroupProfileModalComponent;
  let fixture: ComponentFixture<GroupProfileModalComponent>;

  beforeEach(async(() => {
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
