import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseClaims } from './raise-claims';

describe('RaiseClaims', () => {
  let component: RaiseClaims;
  let fixture: ComponentFixture<RaiseClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseClaims]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
