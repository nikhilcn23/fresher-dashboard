"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { Plus, FolderGit2, Github, ExternalLink, Loader2, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tech_stack: "", github_url: "", live_url: "" });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects/").then((r) => r.data),
  });

  const add = useMutation({
    mutationFn: (body: typeof form) => api.post("/projects/", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); setOpen(false); setForm({ title: "", description: "", tech_stack: "", github_url: "", live_url: "" }); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-muted font-mono text-sm mb-1">// what you've built</p>
          <h1 className="font-display font-bold text-3xl text-text">Projects</h1>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderGit2 size={32} className="text-muted mx-auto mb-3" />
          <p className="text-muted font-body text-sm">No projects yet. Showcase your work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p: any, i: number) => (
            <div
              key={p.id}
              className="card p-6 hover:border-info/20 transition-all duration-300 animate-fade-up group"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-text text-lg mb-2">{p.title}</h3>
                  <p className="text-muted text-sm font-body mb-3 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech_stack?.split(",").map((t: string) => (
                      <span key={t} className="tag">{t.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors font-mono px-3 py-1.5 border border-border rounded-lg hover:border-accent/30">
                      <Github size={13} /> Code
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors font-mono px-3 py-1.5 border border-border rounded-lg hover:border-accent/30">
                      <ExternalLink size={13} /> Live
                    </a>
                  )}
                  {/* ✅ Delete button */}
                  <button
                    onClick={() => remove.mutate(p.id)}
                    disabled={remove.isPending}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-danger transition-colors font-mono px-3 py-1.5 border border-border rounded-lg hover:border-danger/30 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title="Add Project" onClose={() => setOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); add.mutate(form); }} className="space-y-4">
            <div>
              <label className="label">Project Title</label>
              <input className="input" placeholder="e.g. Portfolio Website" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none h-20" placeholder="What does it do?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <label className="label">Tech Stack</label>
              <input className="input" placeholder="React, Node.js, PostgreSQL" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} required />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input className="input" placeholder="https://github.com/..." value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            </div>
            <div>
              <label className="label">Live URL</label>
              <input className="input" placeholder="https://myproject.com" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={add.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {add.isPending ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}