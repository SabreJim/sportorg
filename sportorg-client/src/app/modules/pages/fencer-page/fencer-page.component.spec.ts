import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FencerPageComponent } from './fencer-page.component';

describe('FencerPageComponent', () => {
  let component: FencerPageComponent;
  let fixture: ComponentFixture<FencerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FencerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FencerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
