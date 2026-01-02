import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegitserForm } from './regitser-form';

describe('RegitserForm', () => {
  let component: RegitserForm;
  let fixture: ComponentFixture<RegitserForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegitserForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegitserForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
