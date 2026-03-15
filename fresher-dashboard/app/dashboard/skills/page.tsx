"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { Plus, Code2, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { useRef } from "react";
import { createPortal } from "react-dom";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const levelColor: Record<string, string> = {
  Beginner:     "text-muted bg-muted/10",
  Intermediate: "text-info bg-info/10",
  Advanced:     "text-warning bg-warning/10",
  Expert:       "text-accent bg-accent/10",
};
const levelBar: Record<string, number> = {
  Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100,
};

function LevelDropdown({ skill }: { skill: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const update = useMutation({
    mutationFn: (level: string) =>
      api.patch(`/skills/${skill.id}/level?level=${encodeURIComponent(level)}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skills"] }); setOpen(false); },
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
        className={`badge flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ${levelColor[skill.level] || "text-muted bg-muted/10"}`}
      >
        {update.isPending ? <Loader2 size={10} className="animate-spin" /> : skill.level}
        <ChevronDown size={11} />
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
            className="w-36 rounded-xl overflow-hidden"
          >
            <div className="bg-[#1C1C28] border-2 border-[#3a3a55] rounded-xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.9)]">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => update.mutate(l)}
                  disabled={l === skill.level}
                  className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors flex items-center gap-2
                    ${l === skill.level
                      ? "bg-white/5 text-muted cursor-default"
                      : "text-[#E8E8F0] hover:bg-[#2a2a40] cursor-pointer"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    l === "Beginner"     ? "bg-gray-400" :
                    l === "Intermediate" ? "bg-blue-400" :
                    l === "Advanced"     ? "bg-yellow-400" :
                                          "bg-emerald-400"
                  }`} />
                  {l}
                  {l === skill.level && <span className="ml-auto text-muted">✓</span>}
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

export default function SkillsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "Beginner" });

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api.get("/skills/").then((r) => r.data),
  });

  const add = useMutation({
    mutationFn: (body: typeof form) => api.post("/skills/", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skills"] }); setOpen(false); setForm({ name: "", level: "Beginner" }); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/skills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skills"] }),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-muted font-mono text-sm mb-1">// your toolkit</p>
          <h1 className="font-display font-bold text-3xl text-text">Skills</h1>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      ) : skills.length === 0 ? (
        <div className="card p-12 text-center">
          <Code2 size={32} className="text-muted mx-auto mb-3" />
          <p className="text-muted font-body text-sm">No skills added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill: any, i: number) => (
            <div
              key={skill.id}
              className="card p-5 hover:border-accent/20 transition-all duration-300 animate-fade-up group"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display font-semibold text-text text-base">{skill.name}</h3>
                <div className="flex items-center gap-2">
                  {/* ✅ Level dropdown */}
                  <LevelDropdown skill={skill} />
                  {/* ✅ Delete button */}
                  <button
                    onClick={() => remove.mutate(skill.id)}
                    disabled={remove.isPending}
                    className="text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-700"
                  style={{ width: `${levelBar[skill.level] || 25}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title="Add Skill" onClose={() => setOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); add.mutate(form); }} className="space-y-4">
            <div>
              <label className="label">Skill Name</label>
              <input className="input" placeholder="e.g. React, Python, Docker" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={add.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {add.isPending ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add Skill"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}