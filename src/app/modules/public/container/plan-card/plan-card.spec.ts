import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCard } from './plan-card';

describe('PlanCard', () => {
  let component: PlanCard;
  let fixture: ComponentFixture<PlanCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
