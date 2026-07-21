const STORAGE_KEY = "navana_expense_categories";

const DEFAULT_CATEGORIES = [
  "Rent",
  "Utilities",
  "Maintenance",
  "Supplies",
  "Salary",
  "Food & Beverage",
  "Marketing",
  "Other",
];

export function getExpenseCategories(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));

  return [...DEFAULT_CATEGORIES];
}

function saveExpenseCategories(categories: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

// Returns the updated list. Throws CATEGORY_EXISTS if it (case-insensitively) already exists.
export function addExpenseCategory(name: string): string[] {
  const trimmed = name.trim();
  const categories = getExpenseCategories();

  if (!trimmed) {
    throw new Error("CATEGORY_EMPTY");
  }

  if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("CATEGORY_EXISTS");
  }

  const updated = [...categories, trimmed];
  saveExpenseCategories(updated);
  refreshExpenseCategories();

  return updated;
}

export function deleteExpenseCategory(name: string): string[] {
  const updated = getExpenseCategories().filter((c) => c !== name);
  saveExpenseCategories(updated);
  refreshExpenseCategories();

  return updated;
}

export function resetExpenseCategoriesToDefault(): string[] {
  saveExpenseCategories(DEFAULT_CATEGORIES);
  refreshExpenseCategories();

  return [...DEFAULT_CATEGORIES];
}

export function refreshExpenseCategories() {
  window.dispatchEvent(new Event("expenseCategoriesUpdated"));
}
