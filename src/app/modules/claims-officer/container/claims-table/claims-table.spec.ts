import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsTable } from './claims-table';

describe('ClaimsTable', () => {
  let component: ClaimsTable;
  let fixture: ComponentFixture<ClaimsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
