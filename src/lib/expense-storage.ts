import type { Expense } from "./mock-data";

const STORAGE_KEY = "navana_expenses";

export function getExpenses(): Expense[] {
  const savedExpenses = localStorage.getItem(STORAGE_KEY);

  if (savedExpenses) {
    return JSON.parse(savedExpenses);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

  return [];
}

export function saveExpenses(updatedExpenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
}

// Generates EXP-YYYYMMDD-0001, EXP-YYYYMMDD-0002... resets every day,
// same pattern as the Booking ID (NRH-YYYYMMDD-0001).
function generateExpenseId(existingExpenses: Expense[]): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const todaysNumbers = existingExpenses
    .filter((e) => e.id.startsWith(`EXP-${datePart}-`))
    .map((e) => parseInt(e.id.split("-")[2], 10))
    .filter((n) => !isNaN(n));

  const nextNumber = todaysNumbers.length > 0 ? Math.max(...todaysNumbers) + 1 : 1;

  return `EXP-${datePart}-${String(nextNumber).padStart(4, "0")}`;
}

export function addExpense(newExpense: Omit<Expense, "id">): Expense {
  const allExpenses = getExpenses();

  const expenseWithId: Expense = {
    ...newExpense,
    id: generateExpenseId(allExpenses),
  };

  const updated = [expenseWithId, ...allExpenses];

  saveExpenses(updated);
  refreshExpenses();

  return expenseWithId;
}

export function updateExpense(id: string, updates: Partial<Expense>) {
  const allExpenses = getExpenses();

  const updatedExpenses = allExpenses.map((expense: Expense) => {
    if (expense.id === id) {
      return {
        ...expense,
        ...updates,
      };
    }

    return expense;
  });

  saveExpenses(updatedExpenses);
  refreshExpenses();
}

export function deleteExpense(id: string) {
  const allExpenses = getExpenses();
  const updated = allExpenses.filter((e) => e.id !== id);

  saveExpenses(updated);
  refreshExpenses();
}

// --- Helpers the Dashboard can use for real Today's Expense / Profit ---

export function getTodayExpenseTotal(): number {
  const today = new Date().toISOString().slice(0, 10);

  return getExpenses()
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
}

// month is 1-12
export function getMonthExpenseTotal(year: number, month: number): number {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  return getExpenses()
    .filter((e) => e.date.startsWith(prefix))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function refreshExpenses() {
  window.dispatchEvent(new Event("expensesUpdated"));
}
