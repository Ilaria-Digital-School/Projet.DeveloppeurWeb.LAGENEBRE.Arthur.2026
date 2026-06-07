import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdminComment } from '../../../../core/models/admin-comment.model';
import { AdminCommentsList } from './admin-comments-list';

describe('AdminCommentsList', () => {
  it('should render comments and emit the selected action', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCommentsList],
      providers: [provideRouter([])]
    }).compileComponents();

    const comment = createComment();
    const fixture: ComponentFixture<AdminCommentsList> = TestBed.createComponent(AdminCommentsList);
    fixture.componentRef.setInput('comments', [comment]);
    fixture.componentRef.setInput('primaryAction', 'unmoderate');
    const emitSpy = vi.spyOn(fixture.componentInstance.action, 'emit');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button').click();

    expect(fixture.nativeElement.textContent).toContain('alice');
    expect(emitSpy).toHaveBeenCalledWith({ type: 'unmoderate', comment });
  });

  function createComment(): AdminComment {
    return {
      id: 12,
      recipeId: 4,
      recipeTitle: 'Soupe de saison',
      recipeSlug: 'soupe-de-saison',
      userId: 7,
      username: 'alice',
      parentCommentId: null,
      moderatedAt: '2026-05-10T10:00:00.000Z',
      moderatedByUserId: 1,
      moderatedByUsername: 'admin',
      deletedAt: null,
      deletedByUserId: null,
      deletedByUsername: null,
      rating: 4,
      comment: 'Commentaire masque',
      createdAt: '2026-05-09T10:00:00.000Z',
      updatedAt: '2026-05-09T10:00:00.000Z'
    };
  }
});
