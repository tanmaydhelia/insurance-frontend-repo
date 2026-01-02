import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSearch } from './plan-search';

describe('PlanSearch', () => {
  let component: PlanSearch;
  let fixture: ComponentFixture<PlanSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
