import { createFileRoute } from "@tanstack/react-router";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass, selectClass, textareaClass } from "@/components/ui-kit";
import { Plus, Download, Search } from "lucide-react";
import { expenses } from "@/lib/mock-data";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Navana Rest House" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operational spend and reconcile against income."
        actions={<button className={buttonGhost}><Download className="h-4 w-4" />Export</button>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <SectionTitle title="Add New Expense" action={<Plus className="h-4 w-4 text-muted-foreground" />} />
          <div className="space-y-4 p-6">
            <Field label="Date">
              <input type="date" className={inputClass} defaultValue="2026-06-29" />
            </Field>
            <Field label="Category">
              <select className={selectClass}>
                <option>Utilities</option><option>Maintenance</option><option>Supplies</option>
                <option>Salary</option><option>Food & Beverage</option><option>Marketing</option><option>Other</option>
              </select>
            </Field>
            <Field label="Description">
              <input className={inputClass} placeholder="Short description" />
            </Field>
            <Field label="Amount (৳)">
              <input className={inputClass} placeholder="0" />
            </Field>
            <Field label="Payment Method">
              <select className={selectClass}>
                <option>Cash</option><option>bKash</option><option>Nagad</option><option>Card</option><option>Bank Transfer</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea className={textareaClass} placeholder="Optional" />
            </Field>
            <button className={buttonPrimary + " w-full"}>
              <Plus className="h-4 w-4" /> Save Expense
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Expense History</h2>
              <p className="text-[11px] text-muted-foreground">Total this month: <span className="font-bold text-foreground">৳{total.toLocaleString()}</span></p>
            </div>
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input className={inputClass + " pl-9"} placeholder="Search expenses…" />
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
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{e.description}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.method}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">৳{e.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40 text-sm">
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</td>
                  <td className="px-4 py-3 text-right text-base font-bold text-foreground">৳{total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
