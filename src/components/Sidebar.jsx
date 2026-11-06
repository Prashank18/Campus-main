import { Link, NavLink } from "react-router-dom";
import { ArrowRight, ChevronDown, CircleHelp, Command, Settings2 } from "lucide-react";

export default function Sidebar({
  navGroups,
  collapsed,
  mobileOpen,
  campus,
  onCampusOpen,
  onHelpOpen,
  onSettingsOpen,
  onMobileClose,
}) {
  return <>
    {mobileOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={onMobileClose} />}
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <Link to="/" className="brand" onClick={onMobileClose}>
        <span className="brand-mark"><Command size={18} strokeWidth={2.5} /></span>
        <span className="brand-name">campus<span>OS</span><small>OPERATIONS SUITE</small></span>
      </Link>
      <button className="campus-switch" onClick={onCampusOpen}>
        <span className="campus-monogram">IIT</span>
        <span className="campus-copy"><b>IIT BHUBANESWAR</b><small>{campus}</small></span>
        <ChevronDown size={15} />
      </button>
      <nav className="side-nav">
        {navGroups.map((group) => <div className="nav-group" key={group.title}>
          <div className="nav-heading">{group.title}</div>
          {group.items.map(({ to, label, icon, count }) => {
            const Icon = icon;
            return <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={label}
              onClick={onMobileClose}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {count && <em>{count}</em>}
            </NavLink>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-orbit"><CircleHelp size={18} /></div>
          <b>Need a hand?</b>
          <p>Guides for schedules, spaces, and approvals.</p>
          <button onClick={onHelpOpen}>Open help center <ArrowRight size={14} /></button>
        </div>
        <button className="sidebar-settings" onClick={onSettingsOpen}><Settings2 size={17} /><span>Settings</span></button>
        <div className="sidebar-foot"><span>CampusOS v1.0</span><span>© 2026</span></div>
      </div>
    </aside>
  </>;
}
