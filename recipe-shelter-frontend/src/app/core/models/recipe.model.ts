export interface RecipeSummary {
    id: number;
    title: string;
    status: RecipeStatus;
    category?: string | null;
    updatedAt?: string;
    createdAt?: string;
    submittedAt?: string | null;
    publishedAt?: string | null;
    archivedAt?: string | null;
    rejectionReason?: string | null;
};

export interface PublicRecipeListItem {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    coverImageUrl: string | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    restTimeMinutes: number | null;
    servings: number | null;
    authorUsername: string;
    publishedAt: string;
    isFavorite: boolean;
    averageRating?: number | null;
    ratingsCount?: number;
}

export interface PublicAuthorDto {
    id: number;
    username: string;
}

export type PublicRecipeDetail = Omit<PublicRecipeListItem, 'authorUsername'> & {
    author: PublicAuthorDto;
    ingredients: RecipeDetailIngredient[];
    steps: RecipeDetailStep[];
    equipments: RecipeDetailEquipment[];
    tags: RecipeDetailTag[];
    comments: RecipeDetailComment[];
    commentsCount: number;
    averageRating: number | null;
    ratingsCount: number;
};

export interface RecipeDetailComment {
    id: number;
    isModerated: boolean;
    isDeleted: boolean;
    author: PublicAuthorDto;
    parentCommentId: number | null;
    moderatedAt: string | null;
    rating: number | null;
    comment: string;
    createdAt: string;
    updatedAt: string;
    children: RecipeDetailComment[];
}

export interface RecipeDetailIngredient {
    id: number;
    name: string;
    slug: string;
    quantity: number;
    unit: string | null;
    note: string | null;
    sortOrder: number;
}

export interface RecipeDetailStep {
    stepNumber: number;
    description: string;
}

export interface RecipeDetailEquipment {
    id: number;
    name: string;
    slug: string;
}

export interface RecipeDetailTag {
    id: number;
    name: string;
    slug: string;
}

export type RecipeStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface RecipeIngredient {
    ingredientId: number;
    quantity: number;
    unit: string;
    note: string | null;
    sortOrder: number;
}

export interface RecipeStep {
    stepNumber: number;
    description: string;
}

export interface RecipeEquipment {
    equipmentId: number;
}

export interface RecipeTag {
    id: number;
    name: string;
}

export interface Recipe {
    id: number;
    userId: number;
    categoryId: number | null;
    title: string;
    slug: string;
    description: string;
    coverImageUrl?: string | null;
    prepTimeMinutes: number;
    restTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    servings: number;
    status: RecipeStatus;
    createdAt: string;
    submittedAt: string | null;
    moderatedAt: string | null;
    moderatedByUserId: number | null;
    publishedAt: string | null;
    archivedAt: string | null;
    rejectionReason: string | null;
    updatedAt: string;
    tagIds?: number[];
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    equipments: RecipeEquipment[];
}

export interface AdminRecipe {
    id: number;
    user: string;
    category: string | null;
    title: string;
    slug: string;
    description: string;
    coverImageUrl?: string | null;
    prepTimeMinutes: number;
    restTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    servings: number;
    status: string;
    createdAt: string;
    submittedAt: string | null;
    moderatedAt: string | null;
    moderatedByUserId: number | null;
    publishedAt: string | null;
    archivedAt: string | null;
    rejectionReason: string | null;
    updatedAt: string;
    tags?: RecipeTag[];
    ingredients: AdminRecipeIngredient[];
    steps: AdminRecipeStep[];
    equipments: AdminRecipeEquipment[];
}

export interface AdminRecipeIngredient {
    id: number;
    name: string;
    quantity: number;
    unit: string | null;
    note: string | null;
    sortOrder: number;
}

export interface AdminRecipeStep {
    stepNumber: number;
    description: string;
}

export interface AdminRecipeEquipment {
    id: number;
    name: string;
}

export interface RecipePending {
    id: number;
    user: string;
    category: string | null;
    title: string;
    slug: string;
    description: string;
    submittedAt: string | null;
}
