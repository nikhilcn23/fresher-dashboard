// "use client";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { removeToken } from "@/lib/auth";
// import {
//   LayoutDashboard,
//   Code2,
//   FolderGit2,
//   Briefcase,
//   BookOpen,
//   FileText,
//   LogOut,
//   Terminal,
// } from "lucide-react";

// const nav = [
//   { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
//   { href: "/dashboard/skills", label: "Skills", icon: Code2 },
//   { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
//   { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
//   { href: "/dashboard/learning", label: "Learning", icon: BookOpen },
//   { href: "/dashboard/resume", label: "Resume", icon: FileText },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const logout = () => {
//     removeToken();
//     router.push("/auth/login");
//   };

//   return (
//     <aside className="fixed left-0 top-0 h-screen w-60 bg-slate border-r border-border flex flex-col z-40">
//       {/* Logo */}
//       <div className="p-6 border-b border-border">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
//             <Terminal size={14} className="text-ink" />
//           </div>
//           <span className="font-display font-bold text-lg text-text">
//             fresher<span className="text-accent">.</span>dev
//           </span>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
//         {nav.map(({ href, label, icon: Icon }) => {
//           const active = pathname === href;
//           return (
//             <Link
//               key={href}
//               href={href}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 group
//                 ${active
//                   ? "bg-accent/10 text-accent border border-accent/20"
//                   : "text-muted hover:text-text hover:bg-card"
//                 }`}
//             >
//               <Icon
//                 size={16}
//                 className={`flex-shrink-0 ${active ? "text-accent" : "text-muted group-hover:text-text"} transition-colors`}
//               />
//               {label}
//               {active && (
//                 <span className="ml-auto w-1 h-1 rounded-full bg-accent" />
//               )}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-4 border-t border-border">
//         <button
//           onClick={logout}
//           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 w-full"
//         >
//           <LogOut size={16} className="flex-shrink-0" />
//           Sign out
//         </button>
//       </div>
//     </aside>
//   );
// }
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Code2,
  FolderGit2,
  Briefcase,
  BookOpen,
  FileText,
  LogOut,
  Terminal,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/skills", label: "Skills", icon: Code2 },
  { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/learning", label: "Learning", icon: BookOpen },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = nav.findIndex((item) => item.href === pathname);
    if (activeIndex === -1) return;
  
    const el = navRefs.current[activeIndex];
    const container = el?.closest("nav");
    if (!el || !container) return;
  
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
  
    const top = elRect.top - containerRect.top + container.scrollTop;
    const height = elRect.height;
  
    setIndicatorStyle({ top, height, opacity: 1 });
  }, [pathname]);

  const logout = () => {
    removeToken();
    window.location.href = "/auth/login";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Terminal size={14} className="text-ink" />
          </div>
          <span className="font-display font-bold text-lg text-text">
            fresher<span className="text-accent">.</span>dev
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 relative">
        {/* ✅ Sliding glowing indicator */}
        <div
          className="absolute left-4 right-4 rounded-xl bg-accent/10 border border-accent/25 pointer-events-none"
          style={{
            top: indicatorStyle.top,
            height: indicatorStyle.height,
            opacity: indicatorStyle.opacity,
            transition: "top 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
            boxShadow: "0 0 12px rgba(110, 231, 183, 0.15), inset 0 0 12px rgba(110, 231, 183, 0.05)",
          }}
        />

        <div className="space-y-1 relative">
          {nav.map(({ href, label, icon: Icon }, i) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                ref={(el) => { navRefs.current[i] = el; }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors duration-200 group relative
                  ${active ? "text-accent" : "text-muted hover:text-text"}`}
              >
                <Icon
                  size={16}
                  className={`flex-shrink-0 transition-colors duration-200 ${active ? "text-accent" : "text-muted group-hover:text-text"}`}
                />
                {label}
                {active && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 w-full"
        >
          <LogOut size={16} className="flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}