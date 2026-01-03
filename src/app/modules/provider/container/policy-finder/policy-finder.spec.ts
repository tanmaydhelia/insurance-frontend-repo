import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyFinder } from './policy-finder';

describe('PolicyFinder', () => {
  let component: PolicyFinder;
  let fixture: ComponentFixture<PolicyFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyFinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyFinder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
