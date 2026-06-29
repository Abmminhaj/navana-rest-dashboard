import { createFileRoute } from "@tanstack/react-router";
import { Card, Field, PageHeader, SectionTitle, buttonPrimary, inputClass, selectClass } from "@/components/ui-kit";
import { Building2, Users, Bell, Shield } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Navana Rest House" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage hotel profile, users and system preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Hotel Profile" action={<Building2 className="h-4 w-4 text-muted-foreground" />} />
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <Field label="Hotel Name"><input className={inputClass} defaultValue="Navana Rest House" /></Field>
            <Field label="Contact Phone"><input className={inputClass} defaultValue="+880 1711-000000" /></Field>
            <div className="md:col-span-2"><Field label="Address"><input className={inputClass} defaultValue="House 14, Road 7, Banani, Dhaka" /></Field></div>
            <Field label="Currency"><select className={selectClass}><option>BDT (৳)</option><option>USD ($)</option></select></Field>
            <Field label="Timezone"><select className={selectClass}><option>Asia/Dhaka (GMT+6)</option></select></Field>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Notifications" action={<Bell className="h-4 w-4 text-muted-foreground" />} />
          <ul className="divide-y divide-border">
            {[
              { l: "Pending checkout alerts", d: "Notify 1 hour before expected checkout" },
              { l: "Low occupancy alerts", d: "Daily summary at 9:00 AM" },
              { l: "Payment received alerts", d: "Instant notification" },
              { l: "Maintenance reminders", d: "Weekly room maintenance checklist" },
            ].map((n, i) => (
              <li key={i} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">{n.l}</div>
                  <div className="text-[11px] text-muted-foreground">{n.d}</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked={i < 3} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle title="Users & Roles" action={<Users className="h-4 w-4 text-muted-foreground" />} />
          <ul className="divide-y divide-border">
            {[
              { n: "Arif Rahman", r: "Administrator", e: "arif@navana.com" },
              { n: "Sumaiya Khan", r: "Manager", e: "sumaiya@navana.com" },
              { n: "Rakib Hossain", r: "Receptionist", e: "rakib@navana.com" },
            ].map((u, i) => (
              <li key={i} className="flex items-center gap-3 px-6 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {u.n.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{u.n}</div>
                  <div className="text-[11px] text-muted-foreground">{u.e}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">{u.r}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-4">
            <button className={buttonPrimary + " w-full"}>Invite Team Member</button>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Security" action={<Shield className="h-4 w-4 text-muted-foreground" />} />
          <div className="space-y-4 p-6">
            <Field label="Change Password"><input type="password" className={inputClass} placeholder="New password" /></Field>
            <Field label="Confirm Password"><input type="password" className={inputClass} placeholder="Confirm new password" /></Field>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <div className="text-sm font-semibold text-foreground">Two-factor authentication</div>
                <div className="text-[11px] text-muted-foreground">Add an extra layer of security</div>
              </div>
              <button className={buttonPrimary + " h-8 px-3 text-xs"}>Enable</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
