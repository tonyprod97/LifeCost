import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseContentComponent } from './expense-content.component';

describe('ExpenseContentComponent', () => {
  let component: ExpenseContentComponent;
  let fixture: ComponentFixture<ExpenseContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
