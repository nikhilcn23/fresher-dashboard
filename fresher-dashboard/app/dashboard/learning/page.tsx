"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { Plus, BookOpen, Loader2, ExternalLink, Trash2, Check } from "lucide-react";

const PLATFORMS = ["Coursera", "Udemy", "YouTube", "edX", "LinkedIn Learning", "Pluralsight", "Other"];

// ✅ Inline progress editor
function ProgressEditor({ course }: { course: any }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<number>(course.progress);

  const update = useMutation({
    mutationFn: (progress: number) =>
      api.patch(`/learning/${course.id}/progress?progress=${progress}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["learning"] }); setEditing(false); },
  });

  if (!editing) {
    return (
      <button
        onClick={() => { setVal(course.progress); setEditing(true); }}
        className="font-display font-bold text-2xl text-[#c084fc] hover:opacity-70 transition-opacity cursor-pointer"
        title="Click to edit"
      >
        {course.progress}%
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        value={val}
        onChange={(e) => setVal(Math.min(100, Math.max(0, Number(e.target.value))))}
        className="w-16 bg-slate border border-[#2A2A3D] rounded-lg px-2 py-1 text-sm font-mono text-[#c084fc] text-center focus:outline-none focus:border-[#c084fc]/50"
      />
      <button
        onClick={() => update.mutate(val)}
        disabled={update.isPending}
        className="w-7 h-7 rounded-lg bg-[#c084fc]/10 hover:bg-[#c084fc]/20 flex items-center justify-center transition-colors"
      >
        {update.isPending ? <Loader2 size={12} className="animate-spin text-[#c084fc]" /> : <Check size={12} className="text-[#c084fc]" />}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-muted hover:text-text transition-colors font-mono"
      >
        ✕
      </button>
    </div>
  );
}

export default function LearningPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ course: "", platform: "Udemy", progress: 0, certificate_url: "" });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["learning"],
    queryFn: () => api.get("/learning/").then((r) => r.data),
  });

  const add = useMutation({
    mutationFn: (body: any) => api.post("/learning/", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["learning"] }); setOpen(false); setForm({ course: "", platform: "Udemy", progress: 0, certificate_url: "" }); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/learning/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learning"] }),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-muted font-mono text-sm mb-1">// stay curious</p>
          <h1 className="font-display font-bold text-3xl text-text">Learning</h1>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={32} className="text-muted mx-auto mb-3" />
          <p className="text-muted font-body text-sm">No courses tracked yet. Keep learning!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any, i: number) => (
            <div
              key={course.id}
              className="card p-6 hover:border-[#c084fc]/20 transition-all duration-300 animate-fade-up group"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-text text-base mb-1">{course.course}</h3>
                  <span className="text-xs font-mono text-muted">{course.platform}</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* ✅ Clickable progress number */}
                  <ProgressEditor course={course} />
                  {course.certificate_url && (
                    <a href={course.certificate_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors font-mono px-2.5 py-1 border border-border rounded-lg hover:border-accent/30">
                      <ExternalLink size={11} /> Cert
                    </a>
                  )}
                  {/* ✅ Delete button */}
                  <button
                    onClick={() => remove.mutate(course.id)}
                    disabled={remove.isPending}
                    className="text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c084fc] rounded-full transition-all duration-700"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title="Add Course" onClose={() => setOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); add.mutate({ ...form, progress: Number(form.progress) }); }} className="space-y-4">
            <div>
              <label className="label">Course Name</label>
              <input className="input" placeholder="e.g. Full Stack Web Development" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required />
            </div>
            <div>
              <label className="label">Platform</label>
              <select className="input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Progress ({form.progress}%)</label>
              <input
                type="range" min="0" max="100" step="5"
                className="w-full accent-[#c084fc] cursor-pointer"
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              />
              <div className="flex justify-between text-xs font-mono text-muted mt-1">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div>
              <label className="label">Certificate URL <span className="normal-case font-body text-muted/70">(optional)</span></label>
              <input className="input" placeholder="https://..." value={form.certificate_url} onChange={(e) => setForm({ ...form, certificate_url: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={add.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {add.isPending ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add Course"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}