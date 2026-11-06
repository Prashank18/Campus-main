import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, ChevronRight, Menu, PanelLeftClose, Search, X } from "lucide-react";

function NotificationPanel({ bookings, onViewBooking, onClose }) {
  const latestBooking = bookings[0];

  return <div className="notification-popover">
    <div className="popover-head">
      <b>Notifications</b>
      <button aria-label="Close notifications" onClick={onClose}><X size={15} /></button>
    </div>
    {latestBooking && <button className="notification-item" onClick={() => onViewBooking(latestBooking)}>
      <span className="notification-dot amber" />
      <span><b>New booking request</b><small>{latestBooking.event} · just now</small></span>
    </button>}
    <Link to="/conflicts" className="notification-item" onClick={onClose}>
      <span className="notification-dot red" />
      <span><b>Room conflict detected</b><small>Room B-204 · 1 hour ago</small></span>
    </Link>
    <Link to="/timetable" className="notification-item" onClick={onClose}>
      <span className="notification-dot green" />
      <span><b>Schedule published</b><small>CS · Semester 5 · Yesterday</small></span>
    </Link>
  </div>;
}

function ProfileDropdown({ onOpenProfile, onOpenSettings, onLogout, account, accountRole }) {
  const [open, setOpen] = useState(false);
  const closeAndRun = (action) => {
    setOpen(false);
    action();
  };

  return <div className="profile-menu-wrap">
    <button className="profile-button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="avatar avatar-profile">{account.name.slice(0, 2).toUpperCase()}</span>
      <span className="profile-copy"><b>{account.name}</b><small>{accountRole}</small></span>
      <ChevronDown size={14} />
    </button>
    {open && <div className="profile-dropdown">
      <div className="profile-dropdown-heading"><b>{account.name}</b><small>{accountRole}</small></div>
      <button onClick={() => closeAndRun(onOpenProfile)}>View profile</button>
      <button onClick={() => closeAndRun(onOpenSettings)}>Workspace settings</button>
      <button onClick={() => closeAndRun(onLogout)}>Sign out</button>
    </div>}
  </div>;
}

export default function TopNavbar({
  currentPage,
  search,
  onSearchChange,
  onMobileMenu,
  onSidebarToggle,
  collapsed,
  bookings,
  onViewBooking,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  account,
  accountRole,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return <header className="topbar">
    <div className="topbar-left">
      <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={onMobileMenu}>
        <Menu size={20} />
      </button>
      <button className="icon-button collapse-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={onSidebarToggle}>
        <PanelLeftClose className={collapsed ? "is-collapsed" : ""} size={18} />
      </button>
      <span className="breadcrumb">Workspace <ChevronRight size={14} /> <b>{currentPage}</b></span>
    </div>
    <div className="topbar-right">
      <label className="search-box">
        <Search size={16} />
        <input aria-label="Search booking requests" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search requests..." />
        <kbd>⌘ K</kbd>
      </label>
      <div className="notification-wrap">
        <button className="icon-button notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}>
          <Bell size={18} /><i />
        </button>
        {notificationsOpen && <NotificationPanel
          bookings={bookings}
          onViewBooking={(booking) => { setNotificationsOpen(false); onViewBooking(booking); }}
          onClose={() => setNotificationsOpen(false)}
        />}
      </div>
      <div className="top-divider" />
      <ProfileDropdown onOpenProfile={onOpenProfile} onOpenSettings={onOpenSettings} onLogout={onLogout} account={account} accountRole={accountRole} />
    </div>
  </header>;
}
