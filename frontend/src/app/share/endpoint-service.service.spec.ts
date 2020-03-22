import { TestBed } from '@angular/core/testing';

import { EndpointServiceService } from './endpoint-service.service';

describe('EndpointServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EndpointServiceService = TestBed.get(EndpointServiceService);
    expect(service).toBeTruthy();
  });
});
