"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { Plus, Briefcase, Loader2, Building2, ChevronDown, Trash2 } from "lucide-react";
import { useRef } from "react";
import { createPortal } from "react-dom";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Ghosted"];

const statusStyle: Record<string, string> = {
  Applied:   "text-info bg-info/10 border-info/20",
  Interview: "text-warning bg-warning/10 border-warning/20",
  Offer:     "text-accent bg-accent/10 border-accent/20",
  Rejected:  "text-danger bg-danger/10 border-danger/20",
  Ghosted:   "text-muted bg-muted/10 border-muted/20",
};

function StatusDropdown({ job }: { job: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const update = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/jobs/${job.id}/status?status=${encodeURIComponent(status)}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); setOpen(false); },
  });

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={`badge border flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ${statusStyle[job.status] || "text-muted bg-muted/10 border-muted/20"}`}
      >
        {update.isPending ? <Loader2 size={10} className="animate-spin" /> : job.status}
        <ChevronDown size={11} />
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div
            style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
            className="w-36 rounded-xl overflow-hidden"
          >
            <div className="bg-[#1C1C28] border-2 border-[#3a3a55] rounded-xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.9)]">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update.mutate(s)}
                  disabled={s === job.status}
                  className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors flex items-center gap-2
                    ${s === job.status
                      ? "bg-white/5 text-muted cursor-default"
                      : "text-[#E8E8F0] hover:bg-[#2a2a40] cursor-pointer"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    s === "Applied"   ? "bg-blue-400" :
                    s === "Interview" ? "bg-yellow-400" :
                    s === "Offer"     ? "bg-emerald-400" :
                    s === "Rejected"  ? "bg-red-400" : "bg-gray-500"
                  }`} />
                  {s}
                  {s === job.status && <span className="ml-auto text-muted">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function JobsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", status: "Applied", applied_date: "" });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.get("/jobs/").then((r) => r.data),
  });

  const add = useMutation({
    mutationFn: (body: typeof form) => api.post("/jobs/", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      setOpen(false);
      setForm({ company: "", role: "", status: "Applied", applied_date: "" });
    },
  });

  // ✅ NEW
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/jobs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-muted font-mono text-sm mb-1">// application tracker</p>
          <h1 className="font-display font-bold text-3xl text-text">Jobs</h1>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Application
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase size={32} className="text-muted mx-auto mb-3" />
          <p className="text-muted font-body text-sm">No applications yet. Start tracking!</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fade-up">
          {/* ✅ Added extra column for delete */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border">
            <span className="label mb-0">Company</span>
            <span className="label mb-0">Role</span>
            <span className="label mb-0">Status</span>
            <span className="label mb-0">Date</span>
            <span className="label mb-0"></span>
          </div>
          <div className="divide-y divide-border">
            {jobs.map((job: any, i: number) => (
              <div
                key={job.id}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-slate/50 transition-colors group animate-fade-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-border flex items-center justify-center flex-shrink-0">
                    <Building2 size={12} className="text-muted" />
                  </div>
                  <span className="font-body font-medium text-text text-sm">{job.company}</span>
                </div>
                <span className="text-muted text-sm font-body">{job.role}</span>
                <StatusDropdown job={job} />
                <span className="text-muted text-xs font-mono">{job.applied_date}</span>
                {/* ✅ Delete button — appears on row hover */}
                <button
                  onClick={() => remove.mutate(job.id)}
                  disabled={remove.isPending}
                  className="text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {open && (
        <Modal title="Add Application" onClose={() => setOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); add.mutate(form); }} className="space-y-4">
            <div>
              <label className="label">Company</label>
              <input className="input" placeholder="Google, Infosys, Startup..." value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
            <div>
              <label className="label">Role</label>
              <input className="input" placeholder="Software Engineer, SDE-1..." value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Applied Date</label>
              <input type="date" className="input" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} required />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={add.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {add.isPending ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add Application"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}