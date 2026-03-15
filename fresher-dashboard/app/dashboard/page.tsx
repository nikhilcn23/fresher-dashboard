"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Code2, FolderGit2, Briefcase, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const statCards = [
  { label: "Skills", key: "skills", icon: Code2, href: "/dashboard/skills", color: "text-accent", bg: "bg-accent/10" },
  { label: "Projects", key: "projects", icon: FolderGit2, href: "/dashboard/projects", color: "text-info", bg: "bg-info/10" },
  { label: "Applications", key: "jobs", icon: Briefcase, href: "/dashboard/jobs", color: "text-warning", bg: "bg-warning/10" },
  { label: "Courses", key: "learning", icon: BookOpen, href: "/dashboard/learning", color: "text-[#c084fc]", bg: "bg-[#c084fc]/10" },
];

function useCount(endpoint: string) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(`/${endpoint}/`).then((r) => r.data),
  });
}

export default function DashboardPage() {
  const skills = useCount("skills");
  const projects = useCount("projects");
  const jobs = useCount("jobs");
  const learning = useCount("learning");

  const counts: Record<string, number> = {
    skills: skills.data?.length ?? 0,
    projects: projects.data?.length ?? 0,
    jobs: jobs.data?.length ?? 0,
    learning: learning.data?.length ?? 0,
  };

  // Calculate job statuses
  const jobData: any[] = jobs.data ?? [];
  const statusCounts = jobData.reduce((acc: Record<string, number>, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  // Average learning progress
  const learningData: any[] = learning.data ?? [];
  const avgProgress = learningData.length
    ? Math.round(learningData.reduce((s, c) => s + c.progress, 0) / learningData.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <p className="text-muted font-mono text-sm mb-1">// career tracker</p>
        <h1 className="font-display font-bold text-3xl text-text">
          Your Dashboard
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, key, icon: Icon, href, color, bg }, i) => (
          <Link
            key={key}
            href={href}
            className="card p-5 hover:border-accent/30 transition-all duration-300 group animate-fade-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={18} className={color} />
            </div>
            <div className="font-display font-bold text-3xl text-text mb-0.5">
              {counts[key]}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm font-body">{label}</span>
              <ArrowRight size={14} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Breakdown */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-accent" />
            <h2 className="font-display font-semibold text-base text-text">Job Status</h2>
          </div>
          {jobData.length === 0 ? (
            <p className="text-muted text-sm font-body">No applications tracked yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const pct = Math.round((count / jobData.length) * 100);
                const color =
                  status === "Applied" ? "bg-info" :
                  status === "Interview" ? "bg-warning" :
                  status === "Rejected" ? "bg-danger" :
                  status === "Offer" ? "bg-accent" : "bg-muted";
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-text">{status}</span>
                      <span className="text-muted">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Learning Progress */}
        <div className="card p-6 animate-fade-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={16} className="text-[#c084fc]" />
            <h2 className="font-display font-semibold text-base text-text">Learning Progress</h2>
          </div>
          {learningData.length === 0 ? (
            <p className="text-muted text-sm font-body">No courses tracked yet.</p>
          ) : (
            <>
              <div className="flex items-end gap-2 mb-4">
                <span className="font-display font-bold text-4xl text-text">{avgProgress}</span>
                <span className="text-muted font-mono text-sm mb-1">% avg completion</span>
              </div>
              <div className="space-y-2.5">
                {learningData.slice(0, 3).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-xs font-body text-text/70 w-32 truncate">{c.course}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c084fc] rounded-full"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted w-8 text-right">{c.progress}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
