export interface AdminComment {
    id: number;
    recipeId: number;
    recipeTitle: string;
    recipeSlug: string;
    userId: number;
    username: string;
    parentCommentId: number | null;
    moderatedAt: string | null;
    moderatedByUserId: number | null;
    moderatedByUsername: string | null;
    deletedAt: string | null;
    deletedByUserId: number | null;
    deletedByUsername: string | null;
    rating: number | null;
    comment: string;
    createdAt: string;
    updatedAt: string;
}
