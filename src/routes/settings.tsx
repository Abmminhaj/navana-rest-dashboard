import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass, selectClass } from "@/components/ui-kit";
import { Building2, Users, Bell, Shield, Pencil, Trash2, Check, X } from "lucide-react";
import {
  getHotelProfile, saveHotelProfile, type HotelProfile,
  getNotificationPrefs, saveNotificationPrefs, type NotificationPrefs,
  getStaff, addStaffMember, updateStaffMember, deleteStaffMember, type StaffMember,
} from "@/lib/settings-storage";
import { getNotificationPermission, requestNotificationPermission } from "@/lib/notification-engine";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Navana Rest House" }] }),
  component: SettingsPage,
});

const NOTIFICATION_ITEMS: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
  { key: "pendingCheckoutAlerts", label: "Pending checkout alerts", desc: "Notify 1 hour before expected checkout" },
  { key: "lowOccupancyAlerts", label: "Low occupancy alerts", desc: "Daily summary at 9:00 AM" },
  { key: "paymentReceivedAlerts", label: "Payment received alerts", desc: "Instant notification" },
  { key: "maintenanceReminders", label: "Maintenance reminders", desc: "Weekly room maintenance checklist" },
];

function SettingsPage() {
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Receptionist");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    setProfile(getHotelProfile());
    setPrefs(getNotificationPrefs());
    setStaff(getStaff());
    setPermission(getNotificationPermission());
  }, []);

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission();
    setPermission(result);
  }

  function handleProfileChange<K extends keyof HotelProfile>(key: K, value: HotelProfile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
    setProfileSaved(false);
  }

  function handleSaveProfile() {
    if (!profile) return;
    saveHotelProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function handleToggle(key: keyof NotificationPrefs) {
    setPrefs((p) => {
      if (!p) return p;
      const turningOn = !p[key];
      const updated = { ...p, [key]: turningOn };
      saveNotificationPrefs(updated);

      if (turningOn && permission === "default") {
        requestNotificationPermission().then(setPermission);
      }

      return updated;
    });
  }

  function startEdit(member: StaffMember) {
    setEditingId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
    setEditEmail(member.email);
  }

  function handleSaveEdit() {
    if (!editingId) return;
    updateStaffMember(editingId, { name: editName.trim(), role: editRole.trim(), email: editEmail.trim() });
    setStaff(getStaff());
    setEditingId(null);
  }

  function handleDeleteStaff(id: string) {
    if (staff.length <= 1) {
      alert("অন্তত একজন Staff Member থাকতেই হবে।");
      return;
    }
    if (window.confirm("এই Staff Member-কে মুছে ফেলতে চান?")) {
      deleteStaffMember(id);
      setStaff(getStaff());
    }
  }

  function handleInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError("নাম আর Email দুটোই দিতে হবে।");
      return;
    }
    addStaffMember({ name: inviteName.trim(), role: inviteRole, email: inviteEmail.trim() });
    setStaff(getStaff());
    setShowInvite(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("Receptionist");
    setInviteError("");
  }

  if (!profile || !prefs) return null;

  return (
    <div>
      <PageHeader title="Settings" description="Manage hotel profile, users and system preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Hotel Profile" action={<Building2 className="h-4 w-4 text-muted-foreground" />} />
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <Field label="Hotel Name">
              <input className={inputClass} value={profile.hotelName} onChange={(e) => handleProfileChange("hotelName", e.target.value)} />
            </Field>
            <Field label="Contact Phone">
              <input className={inputClass} value={profile.contactPhone} onChange={(e) => handleProfileChange("contactPhone", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input className={inputClass} value={profile.address} onChange={(e) => handleProfileChange("address", e.target.value)} />
              </Field>
            </div>
            <Field label="Currency">
              <select className={selectClass} value={profile.currency} onChange={(e) => handleProfileChange("currency", e.target.value)}>
                <option>BDT (৳)</option>
                <option>USD ($)</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select className={selectClass} value={profile.timezone} onChange={(e) => handleProfileChange("timezone", e.target.value)}>
                <option>Asia/Dhaka (GMT+6)</option>
              </select>
            </Field>
            <div className="md:col-span-2 flex items-center gap-3">
              <button className={buttonPrimary} onClick={handleSaveProfile}>Save Changes</button>
              {profileSaved && <span className="text-xs font-semibold text-emerald-600">✓ Saved</span>}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Notifications" action={<Bell className="h-4 w-4 text-muted-foreground" />} />

          <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
            {permission === "granted" ? (
              <span className="text-xs font-semibold text-emerald-600">✓ Browser Notifications চালু আছে</span>
            ) : permission === "denied" ? (
              <span className="text-xs font-semibold text-red-500">Browser-এ Notification Block করা আছে — Browser Settings থেকে Allow করতে হবে</span>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">Real Notification পেতে Browser Permission দরকার</span>
                <button onClick={handleEnableNotifications} className={buttonPrimary + " h-8 px-3 text-xs"}>Enable Notifications</button>
              </>
            )}
          </div>

          <ul className="divide-y divide-border">
            {NOTIFICATION_ITEMS.map((n) => (
              <li key={n.key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">{n.label}</div>
                  <div className="text-[11px] text-muted-foreground">{n.desc}</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={prefs[n.key]}
                    onChange={() => handleToggle(n.key)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
                </label>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle title="Users & Roles" action={<Users className="h-4 w-4 text-muted-foreground" />} />
          <ul className="divide-y divide-border">
            {staff.map((u) => (
              <li key={u.id} className="px-6 py-3">
                {editingId === u.id ? (
                  <div className="space-y-2">
                    <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} value={editRole} onChange={(e) => setEditRole(e.target.value)} placeholder="Role" />
                      <input className={inputClass} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className={buttonGhost + " h-8 px-3 text-xs"}><X className="h-3.5 w-3.5" />Cancel</button>
                      <button onClick={handleSaveEdit} className={buttonPrimary + " h-8 px-3 text-xs"}><Check className="h-3.5 w-3.5" />Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {u.name.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">
                        {u.name} {u.isAdmin && <span className="ml-1 text-[10px] font-semibold text-primary">(You)</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">{u.role}</span>
                    <button onClick={() => startEdit(u)} className="text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeleteStaff(u.id)} className="text-muted-foreground hover:text-red-500" title="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t border-border p-4">
            {showInvite ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <input className={inputClass} placeholder="Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <select className={selectClass} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option>Administrator</option>
                    <option>Manager</option>
                    <option>Receptionist</option>
                  </select>
                  <input className={inputClass} placeholder="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                </div>
                {inviteError && <p className="text-xs font-medium text-red-500">{inviteError}</p>}
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setShowInvite(false); setInviteError(""); }} className={buttonGhost + " h-8 px-3 text-xs"}>Cancel</button>
                  <button onClick={handleInvite} className={buttonPrimary + " h-8 px-3 text-xs"}>Add Member</button>
                </div>
              </div>
            ) : (
              <button className={buttonPrimary + " w-full"} onClick={() => setShowInvite(true)}>Invite Team Member</button>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Security" action={<Shield className="h-4 w-4 text-muted-foreground" />} />
          <div className="space-y-4 p-6">
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              Login/Password System এখনো নেই — SQLite Migration-এর সাথে যোগ হবে।
            </div>
            <Field label="Change Password">
              <input type="password" className={inputClass} placeholder="New password" disabled />
            </Field>
            <Field label="Confirm Password">
              <input type="password" className={inputClass} placeholder="Confirm new password" disabled />
            </Field>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <div className="text-sm font-semibold text-foreground">Two-factor authentication</div>
                <div className="text-[11px] text-muted-foreground">Add an extra layer of security</div>
              </div>
              <button className={buttonGhost + " h-8 px-3 text-xs"} disabled>Coming Soon</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
