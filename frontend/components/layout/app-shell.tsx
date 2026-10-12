"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  Plus,
  ArrowUpRight,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div
      className={`app-shell ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside
        className="app-sidebar"
        id="workspace-navigation"
        onClick={() => setMobileOpen(false)}
      >
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">
            <BrainCircuit size={23} />
          </span>
          <span>
            genesis<span className="brand-period">.</span>
          </span>
        </Link>
        <div className="workspace-label">
          <span className="workspace-avatar">P</span>
          <div>
            Personal workspace<small>Freelancer workspace</small>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          <Link
            className={`main-nav-item ${pathname === "/dashboard" ? "active" : ""}`}
            href="/dashboard"
          >
            <LayoutDashboard size={18} />
            Projects<span className="nav-shortcut">↗</span>
          </Link>
          <Link
            className={`main-nav-item ${pathname === "/projects/new" ? "active" : ""}`}
            href="/projects/new"
          >
            <Plus size={18} />
            Create project
          </Link>
        </nav>
        <div className="sidebar-note">
          <Layers3 size={23} />
          <h3>From idea to blueprint.</h3>
          <p>Your next project starts with a clear plan.</p>
          <Link href="/projects/new">
            Plan something new <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-footer">
          <span className="user-avatar">ME</span>
          <div>
            Your workspace<small>Project Genesis</small>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div>
            <button
              className="collapse-button desktop-toggle"
              aria-expanded={!collapsed}
              aria-controls="workspace-navigation"
              aria-label={
                collapsed ? "Expand navigation" : "Collapse navigation"
              }
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
            <button
              className="collapse-button mobile-toggle"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              aria-controls="workspace-navigation"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              {pathname.includes("blueprint")
                ? "Blueprint"
                : pathname.includes("analysis")
                  ? "Analysis"
                  : "Projects"}
            </span>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="main-footer">
          <span>PROJECT GENESIS</span>
          <span>Clarity before code.</span>
        </footer>
      </div>
    </div>
  );
}
