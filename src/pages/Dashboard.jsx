import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, CalendarDays, Clock3,
  GraduationCap, MapPin, MoreHorizontal, Plus, ShieldCheck, Users,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Button, MenuItem, TextField } from "@mui/material";
import DashboardCard from "../components/DashboardCard.jsx";
import PageTitle from "../components/PageHeader.jsx";

const utilisationByDay = [
  { day: "Mon", rooms: 62, venues: 34 },
  { day: "Tue", rooms: 76, venues: 48 },
  { day: "Wed", rooms: 68, venues: 42 },
  { day: "Thu", rooms: 84, venues: 55 },
  { day: "Fri", rooms: 72, venues: 62 },
  { day: "Sat", rooms: 35, venues: 78 },
  { day: "Sun", rooms: 18, venues: 30 },
];

export default function Dashboard({ account, bookings, notify, search, onQuickAdd, onViewBooking }) {
  const [period, setPeriod] = useState("This week");
  const visibleBookings = bookings
    .filter((item) => `${item.event} ${item.owner} ${item.venue}`.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 4);

  return <>
    <PageTitle
      eyebrow="THURSDAY, NOVEMBER 5, 2026"
      title={`Good morning, ${account?.name || "there"}`}
      subtitle="Here’s what’s happening across campus today."
      action={<Button variant="contained" startIcon={<Plus size={17} />} onClick={onQuickAdd}>Quick add</Button>}
    />
    <section className="stat-grid" aria-label="Campus summary">
      <DashboardCard label="Total students" value="4,286" change="8.2%" detail="vs. last semester" icon={Users} tone="blue" />
      <DashboardCard label="Faculty members" value="218" change="3 new" detail="this semester" icon={GraduationCap} tone="green" />
      <DashboardCard label="Rooms & venues" value="64" change="82%" detail="average utilisation" icon={MapPin} tone="orange" />
      <DashboardCard label="Pending approvals" value={bookings.filter((item) => item.status === "Pending").length} change="2 urgent" detail="need attention" icon={ShieldCheck} tone="red" />
    </section>
    <section className="dashboard-main-grid">
      <article className="panel utilisation-panel">
        <div className="panel-heading">
          <div><h2>Room utilisation</h2><p>Space usage across campus</p></div>
          <TextField className="compact-select" size="small" select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <MenuItem value="This week">This week</MenuItem>
            <MenuItem value="This month">This month</MenuItem>
          </TextField>
        </div>
        <div className="chart-legend">
          <span><i className="legend-dot dark" />Classrooms &amp; labs</span>
          <span><i className="legend-dot soft" />Event venues</span>
        </div>
        <div className="area-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={utilisationByDay} margin={{ top: 12, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="roomFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#142c43" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#142c43" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="venueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#73b6ac" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#73b6ac" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#dce7e4" strokeDasharray="3 5" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#657986", fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} tick={{ fill: "#657986", fontSize: 11 }} />
              <Tooltip contentStyle={{ border: "1px solid #dce7e4", borderRadius: 10, fontSize: 12, background: "#fbfdfc" }} />
              <Area type="monotone" dataKey="rooms" name="Rooms" stroke="#142c43" strokeWidth={2.5} fill="url(#roomFill)" />
              <Area type="monotone" dataKey="venues" name="Venues" stroke="#73b6ac" strokeWidth={2} fill="url(#venueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-summary">
          <span><b>68%</b><small>Average room usage</small></span>
          <span><b>42%</b><small>Venue bookings</small></span>
          <span className="chart-insight"><Activity size={14} /> 6% from last week</span>
        </div>
      </article>
      <article className="panel today-panel">
        <div className="panel-heading">
          <div><h2>Today at a glance</h2><p>Thursday, November 5</p></div>
          <Link to="/timetable" className="text-link">Full schedule <ArrowRight size={14} /></Link>
        </div>
        <div className="today-stats">
          <div><span className="tiny-icon blue"><CalendarDays size={15} /></span><span><b>24</b><small>Classes scheduled</small></span></div>
          <div><span className="tiny-icon orange"><MapPin size={15} /></span><span><b>3</b><small>Venue bookings</small></span></div>
          <div><span className="tiny-icon red"><AlertTriangle size={15} /></span><span><b>2</b><small>Need attention</small></span></div>
        </div>
        <div className="today-divider" />
        <div className="next-event-label">UP NEXT</div>
        <div className="next-event">
          <div className="event-time">10:30<small>AM</small></div><div className="event-line" />
          <div className="next-event-copy"><b>Database systems</b><span>CS · Semester 5 · Section A</span><small><MapPin size={12} /> Room B-201 <i /> <Users size={12} /> 72 students</small></div>
        </div>
        <div className="next-event">
          <div className="event-time">11:00<small>AM</small></div><div className="event-line muted" />
          <div className="next-event-copy"><b>Design studio workshop</b><span>Design · Semester 5</span><small><MapPin size={12} /> Design Lab <i /> <Users size={12} /> 32 students</small></div>
        </div>
      </article>
    </section>
    <section className="dashboard-lower-grid">
      <article className="panel requests-panel">
        <div className="panel-heading">
          <div><h2>Booking requests</h2><p>Recent requests that need a decision</p></div>
          <Link to="/approvals" className="text-link">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>EVENT</th><th>REQUESTED BY</th><th>DATE &amp; TIME</th><th>STATUS</th><th /></tr></thead>
            <tbody>{visibleBookings.map((item) => <tr key={item.id}>
              <td><div className="event-cell">
                <span className={`avatar avatar-${item.color}`}>{item.initials}</span>
                <span><button className="event-open" onClick={() => onViewBooking(item)}><b>{item.event}</b></button><small>{item.venue}</small></span>
              </div></td>
              <td>{item.owner}</td>
              <td><span>{item.date}</span><small className="table-subline">{item.time}</small></td>
              <td><span className={`status status-${item.status.toLowerCase()}`}><i />{item.status}</span></td>
              <td><button className="row-more" aria-label={`View ${item.event}`} onClick={() => onViewBooking(item)}><MoreHorizontal size={17} /></button></td>
            </tr>)}</tbody>
          </table>
          {!visibleBookings.length && <p className="empty-table">No booking requests match “{search}”.</p>}
        </div>
      </article>
      <article className="panel agenda-panel">
        <div className="panel-heading"><div><h2>Coming up</h2><p>Events &amp; examinations</p></div><button className="icon-button mini" aria-label="Show more upcoming items" onClick={() => notify("Showing the next two weeks.")}><MoreHorizontal size={18} /></button></div>
        <div className="agenda-list">
          <div className="agenda-item"><span className="agenda-date"><b>09</b><small>NOV</small></span><div><b>Spectra 2026</b><small><MapPin size={12} /> Main Auditorium <i /> <Clock3 size={12} /> 10:00 AM</small></div><span className="agenda-kind event-kind">EVENT</span></div>
          <div className="agenda-item"><span className="agenda-date exam-date"><b>12</b><small>NOV</small></span><div><b>Mid-sem exams begin</b><small><BookOpen size={12} /> Semester 3 &amp; 5 <i /> <Clock3 size={12} /> 9:00 AM</small></div><span className="agenda-kind exam-kind">EXAM</span></div>
          <div className="agenda-item"><span className="agenda-date"><b>16</b><small>NOV</small></span><div><b>Innovation week</b><small><MapPin size={12} /> Open-air Theatre <i /> <Clock3 size={12} /> All day</small></div><span className="agenda-kind event-kind">EVENT</span></div>
        </div>
        <Link to="/exams" className="agenda-footer">View calendar <ArrowRight size={14} /></Link>
      </article>
    </section>
  </>;
}
