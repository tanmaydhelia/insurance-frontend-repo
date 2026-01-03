import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFinder } from './customer-finder';

describe('CustomerFinder', () => {
  let component: CustomerFinder;
  let fixture: ComponentFixture<CustomerFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFinder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
