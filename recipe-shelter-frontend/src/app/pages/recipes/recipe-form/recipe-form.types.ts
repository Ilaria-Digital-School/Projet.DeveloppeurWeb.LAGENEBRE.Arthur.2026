export interface RecipeIngredientFormValue {
  ingredientId: number | null;
  quantity: number | null;
  unit: string;
  note: string;
}

export interface RecipeStepFormValue {
  description: string;
}

export interface RecipeEquipmentFormValue {
  equipmentId: number | null;
}

export interface RecipeFormValue {
  title: string;
  categoryId: number | null;
  description: string;
  coverImageUrl: string;
  prepTimeMinutes: number | null;
  restTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  tagIds: number[];
  ingredients: RecipeIngredientFormValue[];
  steps: RecipeStepFormValue[];
  equipments: RecipeEquipmentFormValue[];
}

export interface RecipeIngredientInput {
  ingredientId: number;
  quantity: number;
  unit: string;
  note?: string | null;
  sortOrder?: number;
}

export interface RecipeStepInput {
  stepNumber?: number;
  description: string;
}

export interface RecipeEquipmentInput {
  equipmentId: number;
}

export interface RecipeInput {
  id: number | null;
  userId: number;
  slug: string;
  title: string;
  categoryId: number | null;
  description: string;
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  prepTimeMinutes: number | null;
  restTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  tagIds?: number[];
  tags?: unknown[];
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
  equipments: RecipeEquipmentInput[];
}
