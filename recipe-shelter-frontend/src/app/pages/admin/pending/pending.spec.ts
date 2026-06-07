import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminRecipesService } from '../../../core/services/admin-recipes.service';
import { Pending } from './pending';

describe('Pending', () => {
  let component: Pending;
  let fixture: ComponentFixture<Pending>;
  let adminRecipesService: Pick<AdminRecipesService, 'getPending'>;

  beforeEach(async () => {
    history.replaceState({}, '');

    adminRecipesService = {
      getPending: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Pending],
      providers: [
        provideRouter([]),
        { provide: AdminRecipesService, useValue: adminRecipesService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pending);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a navigation success message', async () => {
    fixture.destroy();
    history.replaceState({ successMessage: 'Recette supprimee.' }, '');

    fixture = TestBed.createComponent(Pending);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Recette supprimee.');
    expect(history.state.successMessage).toBeUndefined();
  });
});
