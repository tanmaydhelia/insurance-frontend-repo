import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSubmitClaim } from './provider-submit-claim';

describe('ProviderSubmitClaim', () => {
  let component: ProviderSubmitClaim;
  let fixture: ComponentFixture<ProviderSubmitClaim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderSubmitClaim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProviderSubmitClaim);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
