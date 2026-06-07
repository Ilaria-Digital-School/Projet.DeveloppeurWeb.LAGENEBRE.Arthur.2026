import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let adminDashboardService: Pick<AdminDashboardService, 'getHealth' | 'getCountPendingRecipes' | 'getModeratedCommentsCount' | 'getSoftDeletedCommentsCount' | 'getBannedUsersCount'>;

  beforeEach(async () => {
    adminDashboardService = {
      getHealth: vi.fn().mockReturnValue(of({ ok: true, checks: { db: true } })),
      getCountPendingRecipes: vi.fn().mockReturnValue(of(1)),
      getModeratedCommentsCount: vi.fn().mockReturnValue(of({ moderatedComments: 2 })),
      getSoftDeletedCommentsCount: vi.fn().mockReturnValue(of({ softDeletedComments: 3 })),
      getBannedUsersCount: vi.fn().mockReturnValue(of({ bannedUsers: 4 }))
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AdminDashboardService, useValue: adminDashboardService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dashboard counters', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('OK');
    expect(text).toContain('Base de données');
    expect(text).toContain('Recettes en attente');
    expect(text).toContain('1');
    expect(text).toContain('Commentaires modérés');
    expect(text).toContain('2');
    expect(text).toContain('Voir les commentaires modérés');
    expect(text).toContain('Commentaires supprimés');
    expect(text).toContain('3');
    expect(text).toContain('Voir les commentaires supprimés');
    expect(text).toContain('Utilisateurs suspendus');
    expect(text).toContain('4');
    expect(text).toContain('Voir les utilisateurs suspendus');
  });
});
