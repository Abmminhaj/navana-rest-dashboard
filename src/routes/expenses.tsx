import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass, selectClass, textareaClass } from "@/components/ui-kit";
import { Plus, Download, Search, Trash2, X } from "lucide-react";
import type { Expense } from "@/lib/mock-data";
import { getExpenses, addExpense, deleteExpense } from "@/lib/expense-storage";
import { getExpenseCategories, addExpenseCategory, deleteExpenseCategory } from "@/lib/expense-category-storage";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Navana Rest House" }] }),
  component: ExpensesPage,
});

const METHODS = ["Cash", "bKash", "Nagad", "Card", "Bank Transfer"];

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [date, setDate] = useState(todayDate());
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(METHODS[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    const loadExpenses = () => setExpenses(getExpenses());
    const loadCategories = () => {
      const cats = getExpenseCategories();
      setCategories(cats);
      setCategory((current) => current || cats[0] || "");
    };

    loadExpenses();
    loadCategories();

    window.addEventListener("expensesUpdated", loadExpenses);
    window.addEventListener("expenseCategoriesUpdated", loadCategories);
    return () => {
      window.removeEventListener("expensesUpdated", loadExpenses);
      window.removeEventListener("expenseCategoriesUpdated", loadCategories);
    };
  }, []);

  const filtered = expenses.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.method.toLowerCase().includes(q)
    );
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  function resetForm() {
    setDate(todayDate());
    setCategory(categories[0] || "");
    setDescription("");
    setAmount("");
    setMethod(METHODS[0]);
    setNotes("");
    setError("");
  }

  function handleSave() {
    const amountNum = parseFloat(amount);

    if (!category) {
      setError("একটা Category বেছে নিন।");
      return;
    }
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("সঠিক Amount দিন।");
      return;
    }

    addExpense({
      date,
      category,
      description: description.trim(),
      amount: amountNum,
      method,
      notes: notes.trim() || undefined,
    });

    resetForm();
  }

  function handleDelete(id: string) {
    if (window.confirm("এই Expense-টি মুছে ফেলতে চান?")) {
      deleteExpense(id);
    }
  }

  function handleAddCategory() {
    setCategoryError("");

    try {
      const updated = addExpenseCategory(newCategory);
      setCategory(newCategory.trim());
      setNewCategory("");
      setShowAddCategory(false);
      setCategories(updated);
    } catch (err: any) {
      if (err.message === "CATEGORY_EXISTS") {
        setCategoryError("এই Category আগে থেকেই আছে।");
      } else {
        setCategoryError("Category-র নাম লিখুন।");
      }
    }
  }

  function handleDeleteCategory(cat: string) {
    if (!window.confirm(`"${cat}" Category মুছে ফেলতে চান? (আগের Expense-এ এই Category-র নাম থেকে যাবে)`)) return;

    const updated = deleteExpenseCategory(cat);
    setCategories(updated);
    if (category === cat) {
      setCategory(updated[0] || "");
    }
  }

  function handleExport() {
    const header = ["Date", "Category", "Description", "Method", "Amount"];
    const rows = filtered.map((e) => [e.date, e.category, e.description, e.method, String(e.amount)]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `navana-expenses-${todayDate()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operational spend and reconcile against income."
        actions={
          <button className={buttonGhost} onClick={handleExport}>
            <Download className="h-4 w-4" />Export
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <SectionTitle title="Add New Expense" action={<Plus className="h-4 w-4 text-muted-foreground" />} />
          <div className="space-y-4 p-6">
            <Field label="Date">
              <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>

            <Field label="Category">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={buttonGhost + " shrink-0 px-3"}
                    onClick={() => setShowAddCategory((v) => !v)}
                    title="Add new category"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {showAddCategory && (
                  <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        className={inputClass}
                        placeholder="নতুন Category-র নাম"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      />
                      <button type="button" className={buttonPrimary + " shrink-0 px-3"} onClick={handleAddCategory}>
                        Add
                      </button>
                      <button
                        type="button"
                        className={buttonGhost + " shrink-0 px-2"}
                        onClick={() => { setShowAddCategory(false); setNewCategory(""); setCategoryError(""); }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {categoryError && <p className="text-xs font-medium text-red-500">{categoryError}</p>}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {categories.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c)}
                        className="ml-0.5 text-primary/60 hover:text-red-500"
                        title={`Remove ${c}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Field>

            <Field label="Description">
              <input
                className={inputClass}
                placeholder="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field label="Amount (৳)">
              <input
                className={inputClass}
                placeholder="0"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Payment Method">
              <select className={selectClass} value={method} onChange={(e) => setMethod(e.target.value)}>
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Notes">
              <textarea
                className={textareaClass}
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            {error && <p className="text-xs font-medium text-red-500">{error}</p>}

            <button className={buttonPrimary + " w-full"} onClick={handleSave}>
              <Plus className="h-4 w-4" /> Save Expense
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Expense History</h2>
              <p className="text-[11px] text-muted-foreground">
                Total{search && " (filtered)"}: <span className="font-bold text-foreground">৳{total.toLocaleString()}</span>
              </p>
            </div>
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass + " pl-9"}
                placeholder="Search expenses…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      কোনো Expense পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{e.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.method}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">৳{e.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-muted-foreground transition-colors hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40 text-sm">
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</td>
                  <td className="px-4 py-3 text-right text-base font-bold text-foreground">৳{total.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
