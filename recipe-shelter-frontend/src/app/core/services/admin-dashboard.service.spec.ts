import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  it('should map the pending recipes count response', () => {
    TestBed.configureTestingModule({
      providers: [AdminDashboardService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(AdminDashboardService).getCountPendingRecipes().subscribe((count) => expect(count).toBe(5));

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/admin/recipes/pending/count`);
    req.flush({ pendingRecipes: 5 });
    TestBed.inject(HttpTestingController).verify();
  });
});
