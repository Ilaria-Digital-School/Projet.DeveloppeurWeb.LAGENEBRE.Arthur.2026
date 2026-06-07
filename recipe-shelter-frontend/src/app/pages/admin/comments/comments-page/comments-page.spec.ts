import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminComment } from '../../../../core/models/admin-comment.model';
import { AdminCommentsService } from '../../../../core/services/admin-comments.service';
import { CommentsPage } from './comments-page';

const comment: AdminComment = {
  id: 12,
  recipeId: 4,
  recipeTitle: 'Soupe de saison',
  recipeSlug: 'soupe-de-saison',
  userId: 7,
  username: 'alice',
  parentCommentId: null,
  moderatedAt: '2026-05-09T10:00:00.000Z',
  moderatedByUserId: 1,
  moderatedByUsername: 'admin',
  deletedAt: '2026-05-09T12:00:00.000Z',
  deletedByUserId: 7,
  deletedByUsername: 'alice',
  rating: 4,
  comment: 'Tres bonne recette.',
  createdAt: '2026-05-08T09:00:00.000Z',
  updatedAt: '2026-05-08T09:00:00.000Z',
};

describe('CommentsPage', () => {
  let fixture: ComponentFixture<CommentsPage>;
  let adminCommentsService: Pick<
    AdminCommentsService,
    'getModerated' | 'getSoftDeleted' | 'unmoderate' | 'restore' | 'delete'
  >;

  async function createComponent(commentsView: 'moderated' | 'softDeleted'): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CommentsPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { commentsView } } } },
        { provide: AdminCommentsService, useValue: adminCommentsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    adminCommentsService = {
      getModerated: () => of([comment]),
      getSoftDeleted: () => of([comment]),
      unmoderate: () => of(true),
      restore: () => of(true),
      delete: () => of(true),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display moderated comments and remove one after unmoderation', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const unmoderateSpy = vi.spyOn(adminCommentsService, 'unmoderate').mockReturnValue(of(true));

    await createComponent('moderated');

    expect(fixture.nativeElement.textContent).toContain('Commentaires mod');
    expect(fixture.nativeElement.textContent).toContain('alice');
    expect(fixture.nativeElement.textContent).toContain('Soupe de saison');

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(unmoderateSpy).toHaveBeenCalledWith(12);
    expect(fixture.nativeElement.textContent).toContain('Aucun commentaire mod');
  });

  it('should display soft deleted comments and call restore', async () => {
    const restoreSpy = vi.spyOn(adminCommentsService, 'restore').mockReturnValue(of(true));
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    await createComponent('softDeleted');

    expect(fixture.nativeElement.textContent).toContain('Commentaires supprim');

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(restoreSpy).toHaveBeenCalledWith(12);
    expect(fixture.nativeElement.textContent).toContain('Aucun commentaire supprim');
  });

  it('should call permanent deletion with an explicit confirmation', async () => {
    const deleteSpy = vi.spyOn(adminCommentsService, 'delete').mockReturnValue(of(true));
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    await createComponent('moderated');

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[1]?.click();
    fixture.detectChanges();

    expect(confirmSpy.mock.calls.at(-1)?.[0]).toContain('irr');
    expect(deleteSpy).toHaveBeenCalledWith(12);
    expect(fixture.nativeElement.textContent).toContain('Aucun commentaire mod');
  });
});
