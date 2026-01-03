import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimForm } from './claim-form';

describe('ClaimForm', () => {
  let component: ClaimForm;
  let fixture: ComponentFixture<ClaimForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
