import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordForm } from './password-form';

describe('PasswordForm', () => {
  let component: PasswordForm;
  let fixture: ComponentFixture<PasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
