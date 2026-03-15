"use client";
import { useState, useRef } from "react";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

type Status = "idle" | "uploading" | "success" | "error";

export default function ResumePage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [drag, setDrag] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setMessage("Please upload a PDF file."); setStatus("error"); return; }
    setFile(f);
    setStatus("idle");
    setMessage("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("success");
      setMessage(data.msg || "Resume processed successfully!");
      qc.invalidateQueries({ queryKey: ["skills"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch {
      setStatus("error");
      setMessage("Failed to process resume. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <p className="text-muted font-mono text-sm mb-1">// ai-powered</p>
        <h1 className="font-display font-bold text-3xl text-text">Resume Parser</h1>
        <p className="text-muted text-sm font-body mt-2">
          Upload your resume and Gemini AI will automatically extract your skills and projects.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`card p-10 text-center border-2 border-dashed transition-all duration-300 cursor-pointer animate-fade-up
          ${drag ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 hover:bg-accent/2"}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{ animationDelay: "80ms", animationFillMode: "both" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors duration-300 ${drag ? "bg-accent/20" : "bg-card"}`}>
          <FileText size={28} className={drag ? "text-accent" : "text-muted"} />
        </div>

        {file ? (
          <div>
            <p className="font-display font-semibold text-text mb-1">{file.name}</p>
            <p className="text-muted text-sm font-mono">{(file.size / 1024).toFixed(1)} KB · PDF</p>
          </div>
        ) : (
          <div>
            <p className="font-display font-semibold text-text mb-1">
              {drag ? "Drop it here!" : "Drag & drop your resume"}
            </p>
            <p className="text-muted text-sm font-body">or click to browse · PDF only</p>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="card p-5 mt-4 animate-fade-up flex items-start gap-3" style={{ animationDelay: "160ms", animationFillMode: "both" }}>
        <Sparkles size={16} className="text-accent mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-display font-semibold text-sm text-text mb-0.5">What gets extracted?</p>
          <p className="text-muted text-sm font-body">Gemini AI reads your resume and automatically adds your <span className="text-accent">skills</span> and <span className="text-info">projects</span> to your dashboard.</p>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body animate-fade-in
          ${status === "success" ? "bg-accent/10 border-accent/30 text-accent" : "bg-danger/10 border-danger/30 text-danger"}`}>
          {status === "success"
            ? <CheckCircle2 size={16} className="flex-shrink-0" />
            : <XCircle size={16} className="flex-shrink-0" />}
          {message}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "uploading" ? (
          <><Loader2 size={16} className="animate-spin" /> Processing with Gemini AI...</>
        ) : (
          <><Upload size={16} /> Upload & Parse Resume</>
        )}
      </button>

      {status === "success" && (
        <button
          onClick={() => { setFile(null); setStatus("idle"); setMessage(""); }}
          className="btn-ghost w-full mt-3"
        >
          Upload another resume
        </button>
      )}
    </div>
  );
}
