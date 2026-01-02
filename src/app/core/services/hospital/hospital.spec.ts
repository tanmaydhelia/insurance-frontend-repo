import { TestBed } from '@angular/core/testing';

import { Hospital } from './hospital';

describe('Hospital', () => {
  let service: Hospital;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hospital);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
