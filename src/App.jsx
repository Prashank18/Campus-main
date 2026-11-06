import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, Building2,
  CalendarDays, CalendarRange, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, CloudUpload, Command, Download, FileJson2, FileSpreadsheet, Filter,
  GraduationCap, LayoutDashboard, MapPin, Menu, MessageSquareText, MoreHorizontal,
  PanelLeftClose, Pencil, Plus, Search, Settings2, ShieldCheck, Sparkles, Trash2, Users, X,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField,
} from "@mui/material";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import AccountRegistrationApprovals from "./components/AccountRegistrationApprovals.jsx";
import StatCard from "./components/DashboardCard.jsx";
import TimetableManagement, { initialSubjects } from "./pages/TimetableManagement.jsx";
import ExamScheduler, { initialExamSchedule } from "./pages/ExamScheduler.jsx";
import VenueManagement from "./pages/VenueManagement.jsx";
import VenueBookingManagement from "./pages/VenueBookingManagement.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import PageTitle from "./components/PageHeader.jsx";
import MainContent from "./components/MainContent.jsx";

const navGroups = [
  {
    title: "Workspace",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard },
      { to: "/timetable", label: "Timetable Management", icon: CalendarRange, count: "2" },
      { to: "/exams", label: "Exams", icon: BookOpen },
      { to: "/venue-management", label: "Venue Management", icon: Building2 },
      { to: "/venues", label: "Venue Booking Management", icon: MapPin },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/approvals", label: "Approvals", icon: ShieldCheck, count: "4" },
      { to: "/registration-approvals", label: "Registration approvals", icon: Users },
      { to: "/conflicts", label: "Conflicts", icon: AlertTriangle },
      { to: "/faculty", label: "Faculty", icon: GraduationCap },
      { to: "/analytics", label: "Reports & analytics", icon: Activity },
      { to: "/datasets", label: "Dataset management", icon: FileSpreadsheet },
    ],
  },
];

const initialBookings = [
  { id: "BK-2408", event: "Spectra 2026", eventType: "Spectra Event", venue: "Main Auditorium", eventDate: "2026-11-09", start: "10:00", end: "16:00", date: "Mon, Nov 9", time: "10:00 AM - 4:00 PM", people: 300, owner: "Cultural Committee", priority: "Not configured", status: "Pending", requiredFacilities: ["Projector", "Microphone"], purpose: "Annual campus technology and culture festival.", decisionReason: "Awaiting review. Spectra priority rules are not configured.", history: [{ status: "Pending", by: "Cultural Committee", at: "Nov 6, 2026", note: "Booking request submitted." }], initials: "CC", color: "peach" },
  { id: "BK-2407", event: "Design thinking workshop", eventType: "Workshop", venue: "Seminar Hall B", eventDate: "2026-11-10", start: "14:00", end: "17:00", date: "Tue, Nov 10", time: "2:00 PM - 5:00 PM", people: 72, owner: "Prof. Ananya Rao", priority: "Not configured", status: "Pending", requiredFacilities: ["Projector", "Wi-Fi"], purpose: "Faculty and student design workshop.", decisionReason: "Awaiting review.", history: [{ status: "Pending", by: "Prof. Ananya Rao", at: "Nov 5, 2026", note: "Booking request submitted." }], initials: "AR", color: "blue" },
  { id: "BK-2406", event: "Robotics club showcase", eventType: "Technical Event", venue: "Innovation Lab", eventDate: "2026-11-11", start: "11:00", end: "13:00", date: "Wed, Nov 11", time: "11:00 AM - 1:00 PM", people: 45, owner: "Prof. K. Suresh", priority: "Not configured", status: "Approved", requiredFacilities: ["Computers", "Wi-Fi"], purpose: "Robotics club project showcase.", decisionReason: "Approved in the frontend demo.", history: [{ status: "Pending", by: "Prof. K. Suresh", at: "Nov 2, 2026", note: "Booking request submitted." }, { status: "Approved", by: "Administrator", at: "Nov 3, 2026", note: "Approved in the frontend demo." }], initials: "KS", color: "mint" },
  { id: "BK-2405", event: "Alumni town hall", eventType: "Meeting", venue: "Open-air Theatre", eventDate: "2026-11-13", start: "16:00", end: "19:00", date: "Fri, Nov 13", time: "4:00 PM - 7:00 PM", people: 240, owner: "Alumni Office", priority: "Not configured", status: "Rejected", requiredFacilities: ["Microphone"], purpose: "Annual alumni discussion and campus update.", decisionReason: "Requested venue is not available for the selected time.", history: [{ status: "Pending", by: "Alumni Office", at: "Oct 28, 2026", note: "Booking request submitted." }, { status: "Rejected", by: "Administrator", at: "Oct 29, 2026", note: "Requested venue is not available for the selected time." }], initials: "AO", color: "lavender" },
  { id: "BK-2404", event: "Faculty leadership seminar", eventType: "Seminar", venue: "Seminar Hall A", alternativeVenue: "Main Auditorium", eventDate: "2026-11-12", start: "09:00", end: "12:00", date: "Thu, Nov 12", time: "9:00 AM - 12:00 PM", people: 95, owner: "Dr. Meera Nair", priority: "Not configured", status: "Alternative Suggested", requiredFacilities: ["Projector", "Microphone"], purpose: "Faculty leadership and planning seminar.", decisionReason: "Seminar Hall A was unavailable in the sample data; Main Auditorium was suggested.", history: [{ status: "Pending", by: "Dr. Meera Nair", at: "Nov 4, 2026", note: "Booking request submitted." }, { status: "Alternative Suggested", by: "Administrator", at: "Nov 5, 2026", note: "Seminar Hall A was unavailable in the sample data; Main Auditorium was suggested." }], initials: "MN", color: "lavender" },
];

const schedule = [
  { day: "Monday", date: "09", items: [{ time: "09:00", title: "Data structures", meta: "CS · Sem 3 · 80 students", room: "B-204", color: "green" }, { time: "11:00", title: "Design studio", meta: "Design · Sem 5 · 32 students", room: "Design Lab", color: "orange" }, { time: "14:00", title: "Circuit theory", meta: "ECE · Sem 3 · 64 students", room: "A-118", color: "blue" }] },
  { day: "Tuesday", date: "10", items: [{ time: "09:00", title: "Database systems", meta: "CS · Sem 5 · 72 students", room: "B-201", color: "blue" }, { time: "12:00", title: "Physics practical", meta: "Science · Sem 1 · 28 students", room: "Physics Lab", color: "purple" }, { time: "15:00", title: "Design studio", meta: "Design · Sem 5 · 32 students", room: "Design Lab", color: "orange" }] },
  { day: "Wednesday", date: "11", items: [{ time: "10:00", title: "Applied mathematics", meta: "CS · Sem 3 · 80 students", room: "B-204", color: "green" }, { time: "13:00", title: "Digital electronics", meta: "ECE · Sem 3 · 64 students", room: "A-118", color: "purple" }, { time: "15:00", title: "Tutorial · DBMS", meta: "CS · Sem 5 · 24 students", room: "C-106", color: "blue" }] },
  { day: "Thursday", date: "12", items: [{ time: "09:00", title: "Operating systems", meta: "CS · Sem 5 · 72 students", room: "B-201", color: "green" }, { time: "11:00", title: "Communication skills", meta: "Common · Sem 1 · 90 students", room: "A-102", color: "orange" }, { time: "14:00", title: "Electronics lab", meta: "ECE · Sem 3 · 32 students", room: "ECE Lab", color: "purple" }] },
  { day: "Friday", date: "13", items: [{ time: "10:00", title: "Computer networks", meta: "CS · Sem 5 · 72 students", room: "B-201", color: "blue" }, { time: "12:00", title: "Project workshop", meta: "Design · Sem 5 · 32 students", room: "Design Lab", color: "orange" }, { time: "14:00", title: "Data structures", meta: "CS · Sem 3 · 80 students", room: "B-204", color: "green" }] },
];

const roomData = [
  { name: "Classrooms", value: 58, color: "#176b4d" },
  { name: "Labs", value: 24, color: "#7fb59a" },
  { name: "Venues", value: 18, color: "#f0b56b" },
];

function readStoredList(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function Status({ children }) {
  return <span className={`status status-${children.toLowerCase().replaceAll(" ", "-")}`}><i />{children}</span>;
}

function App() {
  const location = useLocation();
  const [account, setAccount] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bookings, setBookings] = useState(() => readStoredList("campusOSVenueBookings", initialBookings));
  const [subjects, setSubjects] = useState(() => readStoredList("campusOSSubjects", initialSubjects));
  const [exams, setExams] = useState(() => readStoredList("campusOSExams", initialExamSchedule));
  const [enrollmentRequests, setEnrollmentRequests] = useState(() => readStoredList("campusOSEnrollmentRequests", []));
  const [approvedEnrollments, setApprovedEnrollments] = useState(() => readStoredList("campusOSApprovedEnrollments", []));
  const [subjectRequests, setSubjectRequests] = useState(() => readStoredList("campusOSSubjectRequests", []));
  const [toast, setToast] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [campus, setCampus] = useState("Main campus");
  const [quickItems, setQuickItems] = useState([]);
  const [quickForm, setQuickForm] = useState({ title: "", room: "B-204", date: "2026-11-09", type: "Lecture" });

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then(async (response) => {
        const result = await response.json();
        if (active) setAccount(response.ok ? result.account : null);
      })
      .catch(() => {
        if (active) setAccount(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("campusOSSubjects", JSON.stringify(subjects));
      localStorage.setItem("campusOSExams", JSON.stringify(exams));
      localStorage.setItem("campusOSVenueBookings", JSON.stringify(bookings));
      localStorage.setItem("campusOSEnrollmentRequests", JSON.stringify(enrollmentRequests));
      localStorage.setItem("campusOSApprovedEnrollments", JSON.stringify(approvedEnrollments));
      localStorage.setItem("campusOSSubjectRequests", JSON.stringify(subjectRequests));
    } catch {
      notify("Browser storage is unavailable; academic changes will last until this page is closed.");
    }
  }, [subjects, exams, bookings, enrollmentRequests, approvedEnrollments, subjectRequests]);

  const currentPage = useMemo(() => {
    const path = location.pathname;
    return [...navGroups.flatMap((group) => group.items)].find((item) => item.to === path)?.label || "Overview";
  }, [location.pathname]);
  const visibleNavGroups = useMemo(
    () => navGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => (
        item.to !== "/registration-approvals" || account?.role === "administrator"
      )),
    })),
    [account?.role],
  );

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function updateBooking(id, status, reason = "", updates = {}) {
    setBookings((current) => current.map((booking) => {
      if (booking.id !== id) return booking;
      const explanation = reason || `Booking ${status.toLowerCase()} in the frontend demo.`;
      const historyEntry = {
        status,
        by: account?.name || "Campus user",
        at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        note: explanation,
      };
      return {
        ...booking,
        ...updates,
        status,
        decisionReason: explanation,
        history: [...(booking.history || []), historyEntry],
      };
    }));
    notify(`Booking ${status.toLowerCase()}.`);
  }

  function addBooking(details) {
    const date = details.date ? new Date(`${details.date}T12:00:00`) : new Date();
    const dateLabel = `${date.toLocaleDateString("en-US", { weekday: "short" })}, ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getDate()}`;
    const toClock = (value) => {
      if (!value) return "";
      const [hours, minutes] = value.split(":").map(Number);
      return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
    };
    const requester = details.requestedBy || account?.name || "Campus user";
    const booking = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      event: details.event,
      eventType: details.eventType || "Meeting",
      venue: details.venue,
      eventDate: details.date,
      start: details.start,
      end: details.end,
      date: dateLabel,
      time: `${toClock(details.start)} – ${toClock(details.end)}`,
      people: Number(details.attendees) || 0,
      owner: requester,
      priority: details.priority || "Not configured",
      status: "Pending",
      purpose: details.purpose || "",
      requiredFacilities: details.requiredFacilities || [],
      decisionReason: "Awaiting review.",
      history: [{
        status: "Pending",
        by: requester,
        at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        note: "Booking request submitted.",
      }],
      initials: requester.slice(0, 2).toUpperCase(),
      color: "mint",
    };
    setBookings((current) => [booking, ...current]);
    notify(`${details.event} submitted for approval.`);
    return booking.id;
  }

  const canManageAcademics = account?.role === "administrator" || account?.role === "teacher";

  function addSubject(subject) {
    if (!canManageAcademics) return false;
    if (subjects.some((item) => item.code.toLowerCase() === subject.code.toLowerCase())) {
      notify(`Subject code ${subject.code} already exists.`);
      return false;
    }
    setSubjects((current) => [...current, subject]);
    notify(`${subject.code} added to the subject catalog.`);
    return true;
  }

  function saveExam(exam) {
    if (!canManageAcademics) return;
    setExams((current) => current.some((item) => item.id === exam.id)
      ? current.map((item) => item.id === exam.id ? exam : item)
      : [...current, exam]);
  }

  function deleteExam(id) {
    if (!canManageAcademics) return;
    setExams((current) => current.filter((exam) => exam.id !== id));
  }

  function requestEnrollment(details) {
    if (account?.role !== "student") return;
    const exists = [
      ...enrollmentRequests.filter((item) => item.status === "Pending"),
      ...approvedEnrollments,
    ].some((item) => (
      item.studentId.toLowerCase() === account.name.toLowerCase()
      && item.code === details.code
      && item.branch === details.branch
      && item.year === details.year
      && item.section === details.section
      && item.semester === details.semester
    ));
    if (exists) {
      notify("You already have a pending or approved registration for this subject and group.");
      return false;
    }
    setEnrollmentRequests((current) => [{ ...details, id: `enrollment-${Date.now()}`, studentId: account.name, status: "Pending" }, ...current]);
    notify("Subject registration request sent to the academic approvers.");
    return true;
  }

  function requestNewSubject(details) {
    if (account?.role !== "student") return;
    const code = details.code.trim().toUpperCase();
    if (subjects.some((subject) => subject.code.toLowerCase() === code.toLowerCase())
      || subjectRequests.some((request) => request.code.toLowerCase() === code.toLowerCase() && request.status === "Pending")) {
      notify(`Subject code ${code} already exists or is awaiting review.`);
      return false;
    }
    setSubjectRequests((current) => [{
      ...details,
      code,
      name: details.name.trim(),
      id: `subject-request-${Date.now()}`,
      studentId: account.name,
      status: "Pending",
    }, ...current]);
    notify("New subject proposal sent to the academic approvers.");
    return true;
  }

  function reviewEnrollment(id, status) {
    if (!canManageAcademics) return;
    const request = enrollmentRequests.find((item) => item.id === id);
    if (!request) return;
    setEnrollmentRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    if (status === "Approved") {
      setApprovedEnrollments((current) => current.some((item) => item.id === id) ? current : [{ ...request, status }, ...current]);
    } else {
      setApprovedEnrollments((current) => current.filter((item) => item.id !== id));
    }
    notify(`Student registration ${status.toLowerCase()}.`);
  }

  function reviewSubject(id, status) {
    if (!canManageAcademics) return;
    const request = subjectRequests.find((item) => item.id === id);
    if (!request) return;
    if (status === "Approved") {
      if (subjects.some((subject) => subject.code.toLowerCase() === request.code.toLowerCase())) {
        setSubjectRequests((current) => current.map((item) => item.id === id ? { ...item, status: "Rejected" } : item));
        notify(`Could not approve ${request.code}: that subject code already exists.`);
        return;
      }
      setSubjects((current) => [...current, {
        code: request.code,
        name: request.name,
        branch: request.branch,
        year: request.year,
        semester: request.semester,
      }]);
    }
    setSubjectRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    notify(`Subject proposal ${status.toLowerCase()}.`);
  }

  const shared = {
    bookings,
    updateBooking,
    addBooking,
    notify,
    search,
    account,
    canManage: canManageAcademics,
    subjects,
    onAddSubject: addSubject,
    exams,
    onSaveExam: saveExam,
    onDeleteExam: deleteExam,
    enrollmentRequests,
    approvedEnrollments,
    subjectRequests,
    onRequestEnrollment: requestEnrollment,
    onRequestSubject: requestNewSubject,
    onReviewEnrollment: reviewEnrollment,
    onReviewSubject: reviewSubject,
  };

  if (location.pathname.startsWith("/login")) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>;
  }

  if (authLoading) return <main className="auth-loading">Checking your campus account...</main>;

  if (!account?.role || !account?.name) {
    return <Navigate to="/login" replace />;
  }

  const roleLabels = { administrator: "Administrator", teacher: "Teacher", student: "Student" };
  const accountRole = roleLabels[account.role] || "Campus member";

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        navGroups={visibleNavGroups}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        campus={campus}
        onCampusOpen={() => setCampusOpen(true)}
        onHelpOpen={() => setHelpOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="main-column">
        <TopNavbar
          currentPage={currentPage}
          search={search}
          onSearchChange={setSearch}
          onMobileMenu={() => setMobileOpen(true)}
          onSidebarToggle={() => setCollapsed((value) => !value)}
          collapsed={collapsed}
          bookings={bookings}
          onViewBooking={setSelectedBooking}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
            window.location.assign("/login");
          }}
          account={account}
          accountRole={accountRole}
        />
        <MainContent>
          <Routes>
            <Route path="/" element={<Dashboard account={account} bookings={bookings} notify={notify} search={search} onQuickAdd={() => setQuickAddOpen(true)} onViewBooking={setSelectedBooking} />} />
            <Route path="/timetable" element={<TimetableManagement {...shared} />} />
            <Route path="/exams" element={<ExamScheduler {...shared} />} />
            <Route path="/venue-management" element={<VenueManagement {...shared} />} />
            <Route path="/venues" element={<VenueBookingManagement {...shared} />} />
            <Route path="/approvals" element={<Approvals {...shared} />} />
            <Route
              path="/registration-approvals"
              element={account.role === "administrator"
                ? <AccountRegistrationApprovals />
                : <Navigate to="/" replace />}
            />
            <Route path="/conflicts" element={<Conflicts {...shared} />} />
            <Route path="/faculty" element={<Faculty {...shared} />} />
            <Route path="/analytics" element={<Analytics {...shared} />} />
            <Route path="/datasets" element={<Datasets {...shared} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </div>
      <Dialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Add a campus event</DialogTitle><DialogContent><div className="dialog-fields"><TextField label="Event title" value={quickForm.title} onChange={(event) => setQuickForm({ ...quickForm, title: event.target.value })} fullWidth required /><TextField label="Venue" fullWidth select value={quickForm.room} onChange={(event) => setQuickForm({ ...quickForm, room: event.target.value })}><MenuItem value="B-204">Room B-204</MenuItem><MenuItem value="Seminar Hall B">Seminar Hall B</MenuItem><MenuItem value="Main Auditorium">Main Auditorium</MenuItem></TextField><TextField label="Date" type="date" value={quickForm.date} onChange={(event) => setQuickForm({ ...quickForm, date: event.target.value })} fullWidth InputLabelProps={{ shrink: true }} /><TextField label="Event type" fullWidth select value={quickForm.type} onChange={(event) => setQuickForm({ ...quickForm, type: event.target.value })}><MenuItem value="Lecture">Lecture</MenuItem><MenuItem value="Tutorial">Tutorial</MenuItem><MenuItem value="Practical">Practical lab</MenuItem><MenuItem value="Event">Campus event</MenuItem></TextField></div></DialogContent><DialogActions><Button onClick={() => setQuickAddOpen(false)}>Cancel</Button><Button variant="contained" disabled={!quickForm.title.trim()} onClick={() => { setQuickItems((current) => [{ ...quickForm }, ...current]); setQuickAddOpen(false); notify(`${quickForm.title} added to your upcoming list.`); setQuickForm({ title: "", room: "B-204", date: "2026-11-09", type: "Lecture" }); }}>Add to schedule</Button></DialogActions></Dialog>
      <Dialog open={campusOpen} onClose={() => setCampusOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Choose campus</DialogTitle><DialogContent><div className="campus-options">{["Main campus", "City campus", "Innovation campus"].map((item) => <button key={item} className={campus === item ? "selected" : ""} onClick={() => { setCampus(item); setCampusOpen(false); }}>{item}{campus === item && <Check size={16} />}</button>)}</div></DialogContent></Dialog>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Workspace settings</DialogTitle><DialogContent><div className="settings-form"><TextField label="Campus" select defaultValue={campus} onChange={(event) => setCampus(event.target.value)}>{["Main campus", "City campus", "Innovation campus"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField><TextField label="Time zone" select defaultValue="Asia/Kolkata"><MenuItem value="Asia/Kolkata">India Standard Time (UTC+5:30)</MenuItem><MenuItem value="UTC">UTC</MenuItem></TextField><p>These preferences are stored for this prototype session only.</p></div></DialogContent><DialogActions><Button onClick={() => setSettingsOpen(false)}>Close</Button><Button variant="contained" onClick={() => { setSettingsOpen(false); notify("Workspace preferences updated."); }}>Save preferences</Button></DialogActions></Dialog>
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} fullWidth maxWidth="sm"><DialogTitle>CampusOS help center</DialogTitle><DialogContent><div className="help-topics"><Link to="/timetable" onClick={() => setHelpOpen(false)}><CalendarRange size={18} /><span><b>Timetables</b><small>Filter schedules and manage teaching sessions.</small></span><ArrowRight size={15} /></Link><Link to="/venues" onClick={() => setHelpOpen(false)}><MapPin size={18} /><span><b>Venue bookings</b><small>Find a space, create a request, and track its approval.</small></span><ArrowRight size={15} /></Link><Link to="/conflicts" onClick={() => setHelpOpen(false)}><AlertTriangle size={18} /><span><b>Resolve conflicts</b><small>Review schedule issues and proposed changes.</small></span><ArrowRight size={15} /></Link></div></DialogContent></Dialog>
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} fullWidth maxWidth="xs"><DialogTitle>{accountRole} profile</DialogTitle><DialogContent><div className="profile-details"><span className="avatar avatar-profile">{account.name.slice(0, 2).toUpperCase()}</span><div><b>{account.name}</b><small>{accountRole} · {campus}</small></div></div></DialogContent><DialogActions><Button onClick={() => setProfileOpen(false)}>Close</Button><Button variant="outlined" onClick={() => { setProfileOpen(false); setSettingsOpen(true); }}>Workspace settings</Button></DialogActions></Dialog>
      <Dialog open={Boolean(selectedBooking)} onClose={() => setSelectedBooking(null)} fullWidth maxWidth="sm"><DialogTitle>Booking request details</DialogTitle>{selectedBooking && <DialogContent><div className="request-detail"><b>{selectedBooking.event}</b><span>{selectedBooking.venue} · {selectedBooking.date} · {selectedBooking.time}</span><span>{selectedBooking.people} participants · Requested by {selectedBooking.owner}</span><Status>{selectedBooking.status}</Status><p>Review the event details and choose the approval queue to make a decision.</p></div></DialogContent>}<DialogActions><Button onClick={() => setSelectedBooking(null)}>Close</Button>{selectedBooking && <Button onClick={() => { setSelectedBooking(null); window.location.assign("/approvals"); }}>Open approvals</Button>}</DialogActions></Dialog>
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}<button onClick={() => setToast("")}><X size={14} /></button></div>}
    </div>
  );
}

function SchoolReferenceDashboard({ search, onSearchChange, notify, onQuickAdd, onProfile, onSettings }) {
  const [viewMonth, setViewMonth] = useState(new Date(2019, 9, 1));
  const [selectedDay, setSelectedDay] = useState(17);
  const [focusedDay, setFocusedDay] = useState(2);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const monthName = viewMonth.toLocaleDateString("en-US", { month: "long" });
  const calendarDays = Array.from({ length: 35 }, (_, index) => {
    const firstWeekday = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
    const day = index - firstWeekday + 1;
    const monthLength = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    if (day < 1) return { day: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0).getDate() + day, outside: true };
    if (day > monthLength) return { day: day - monthLength, outside: true };
    return { day, outside: false };
  });
  const activities = [
    { school: "St. Xavier School", date: "02 Oct, 2019", note: "We are planning to celebrate Gandhi Jayanti on 2nd October in our school." },
    { school: "Podar International School", date: "02 Oct, 2019", note: "We will be organising a special assembly and cultural activities." },
  ].filter((item) => `${item.school} ${item.note}`.toLowerCase().includes(search.toLowerCase()));
  const navigation = [
    { label: "Dashboard", to: "/" },
    { label: "Students", to: "/faculty" },
    { label: "Teachers", to: "/faculty" },
    { label: "Parents", to: "/faculty" },
    { label: "Library", to: "/datasets" },
    { label: "Attendance", to: "/timetable" },
    { label: "Exam", to: "/exams" },
    { label: "Hostel", to: "/venues" },
  ];
  function changeMonth(amount) {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setSelectedDay(1);
    setFocusedDay(1);
  }
  return <div className="school-dashboard-stage">
    <aside className="school-rail">
      <Link className="school-emblem" to="/" aria-label="Smart School home"><BookOpen size={22} /><span /></Link>
      <nav className="school-nav" aria-label="School dashboard">
        {navigation.map((item) => <NavLink key={item.label} to={item.to} end={item.to === "/"} className={({ isActive }) => `school-nav-link ${isActive && item.label === "Dashboard" ? "active" : ""}`} onClick={() => setActiveSection(item.label)}>{item.label}</NavLink>)}
        <button className={`school-nav-link ${activeSection === "Account" ? "active" : ""}`} onClick={() => { setActiveSection("Account"); onProfile(); }}>Account</button>
        <button className={`school-nav-link ${activeSection === "Settings" ? "active" : ""}`} onClick={() => { setActiveSection("Settings"); onSettings(); }}>Settings</button>
      </nav>
      <div className="school-art" aria-hidden="true">
        <svg viewBox="0 0 160 245" role="presentation">
          <path d="M15 245c37-46 56-94 68-157m-36 97c-19-5-32-17-39-37 21 1 36 12 44 31m9-34c-3-23 5-42 24-57 7 23 1 43-17 61m-1 17c20-16 42-18 66-6-16 19-37 24-62 13m-20 37c-18-1-33-10-45-28 22-5 41 1 56 20m18-40c18-18 39-24 64-17-12 22-31 32-57 26" fill="none" stroke="#9c8ec8" strokeLinecap="round" strokeWidth="5" />
          <path d="M8 145c18 1 31 11 39 30-20 0-33-10-39-30m42-31c-3-20 4-36 20-48 6 20 1 36-15 52m8 34c18-13 37-15 57-5-14 17-33 21-54 11m-31 40c-16-1-29-9-39-25 20-4 36 2 49 18m28-28c16-16 35-21 56-15-11 19-28 28-51 23" fill="#63a9a0" />
          <path d="M20 200c16-6 30-3 43 9-17 9-32 6-43-9m39-89c1-18 11-31 29-39 1 19-7 33-25 43m20 43c14-12 31-14 49-7-11 16-27 21-47 15m-48 48c-13-4-22-14-27-31 18 1 31 10 38 27m52-44c14-12 31-14 49-6-12 16-28 20-48 14" fill="#e6a45e" />
        </svg>
      </div>
    </aside>
    <main className="school-board">
      <header className="school-topbar">
        <div className="school-welcome">Welcome to <b>Smart</b></div>
        <label className="school-search"><Search size={13} /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search..." aria-label="Search school activities" /></label>
        <div className="school-tools">
          <button className="school-tool-button" aria-label="Notifications" onClick={() => notify("You’re all caught up.")}><Bell size={13} /><i /></button>
          <button className="school-tool-button school-mail" aria-label="Add campus event" onClick={onQuickAdd}><MessageSquareText size={13} /><i /></button>
          <button className="school-profile" aria-label="Administrator profile" onClick={onProfile}>R</button>
        </div>
      </header>

      <section className="school-metrics" aria-label="School statistics">
        <article className="school-metric metric-school"><span className="metric-symbol"><MapPin size={20} /></span><span className="metric-copy"><small>Schools</small><b>6000</b></span></article>
        <article className="school-metric metric-students"><span className="metric-symbol"><Users size={20} /></span><span className="metric-copy"><small>Students</small><b>24542</b></span></article>
        <article className="school-metric metric-teachers"><span className="metric-symbol"><GraduationCap size={20} /></span><span className="metric-copy"><small>Teachers</small><b>5000</b></span></article>
        <article className="school-metric metric-parents"><span className="metric-symbol"><Users size={20} /></span><span className="metric-copy"><small>Parents</small><b>10000</b></span></article>
      </section>

      <section className="school-content-grid">
        <div className="school-left-column">
          <article className="school-card school-calendar-card">
            <div className="school-card-heading"><h2>Calendar &amp; Attendance</h2></div>
            <div className="school-month-control">
              <button aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={12} /></button>
              <b>{String(focusedDay).padStart(2, "0")} {monthName}, {viewMonth.getFullYear()}</b>
              <button aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={12} /></button>
            </div>
            <div className="school-calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span className="school-weekday" key={day}>{day}</span>)}
              {calendarDays.map((item, index) => {
                const isRange = !item.outside && viewMonth.getMonth() === 9 && [27, 28, 29].includes(item.day);
                return <button key={`${index}-${item.day}`} className={`school-calendar-day ${item.outside ? "outside" : ""} ${selectedDay === item.day && !item.outside ? "selected" : ""} ${isRange ? "in-range" : ""}`} onClick={() => { if (!item.outside) { setSelectedDay(item.day); setFocusedDay(item.day); } }}>{item.day}</button>;
              })}
            </div>
          </article>
          <article className="school-card school-activity-card">
            <div className="school-card-heading"><h2>Activities Notification</h2><button onClick={() => notify("Showing all school activities.")}>View All</button></div>
            <div className="school-activity-list">{activities.length ? activities.map((item) => <div className="school-activity" key={item.school}><b>{item.school}</b><small>{item.date}</small><p>{item.note}</p></div>) : <p className="school-empty">No activities match your search.</p>}</div>
          </article>
        </div>

        <div className="school-right-column">
          <article className="school-card school-performance-card">
            <div className="school-card-heading"><h2>School Performance</h2><small>All the data in percentage (%)</small></div>
            <div className="school-performance">
              <div className="school-legend"><span><i className="legend-government" />Govt. School<small>Performance</small></span><span><i className="legend-private" />Private School<small>Performance</small></span><span><i className="legend-average" />Average School<small>Performance</small></span></div>
              <div className="school-chart">
                <div className="school-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                <div className="school-bars"><span className="school-bar bar-government" /><span className="school-bar bar-private" /><span className="school-bar bar-average" /></div>
              </div>
            </div>
          </article>

          <article className="school-card school-scorers-card">
            <div className="school-card-heading"><h2>Top Scorer</h2><button className="school-year-select" onClick={() => notify("Showing the 2018–2019 school year.")}>2018–2019 <ChevronDown size={10} /></button></div>
            <div className="school-scorers">
              <article className="scorer scorer-green"><span className="scorer-avatar">BH</span><b>Branden Harris</b><small>St. Xavier School</small><strong>99.90%</strong><em>1st</em></article>
              <article className="scorer scorer-purple"><span className="scorer-avatar">CJ</span><b>Charles James</b><small>Polar School</small><strong>99.76%</strong><em>2nd</em></article>
              <article className="scorer scorer-yellow"><span className="scorer-avatar">MP</span><b>Mike Peter</b><small>Gipsa Institute</small><strong>99.50%</strong><em>3rd</em></article>
            </div>
          </article>

          <article className="school-card school-fees-card">
            <div className="school-card-heading"><h2>Schools Fees Structure</h2><small>All the data in percentage (%)</small></div>
            <div className="school-fee-chart"><span>Govt. School</span><i /><i /><i /></div>
          </article>
        </div>
      </section>
    </main>
  </div>;
}

function FilterBar({ children }) {
  const [expanded, setExpanded] = useState(true);
  return <div className={`filter-bar ${expanded ? "" : "filters-collapsed"}`}>
    <div className="filter-controls" hidden={!expanded}>{children}</div>
    <button className="filter-button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      <Filter size={15} />{expanded ? "Hide filters" : "Show filters"}
    </button>
  </div>;
}
function SelectFilter({ label, values }) { return <TextField className="filter-select" select size="small" defaultValue={values[0]} label={label}>{values.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>; }

function Venues({ notify }) {
  const [activeTab, setActiveTab] = useState("AI assistant");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([{ role: "user", text: "I want auditorium for Spectra event on Monday from 10 AM to 4 PM for 300 students." }, { role: "assistant", text: "I’ve picked out the details. Check the booking below and make any changes before sending it in." }]);
  const [booking, setBooking] = useState({ event: "Spectra 2026", venue: "Main Auditorium", date: "2026-11-09", start: "10:00", end: "16:00", attendees: "300" });
  const [confirmed, setConfirmed] = useState(false);
  function sendMessage() {
    if (!message.trim()) return;
    setChat((current) => [...current, { role: "user", text: message }, { role: "assistant", text: "Thanks, I’ve noted that. Here’s your editable booking preview; update any details before submitting." }]);
    setMessage("");
  }
  return <><PageTitle eyebrow="CAMPUS SPACES" title="Venues & bookings" subtitle="Find the right space, then get your event on the calendar." action={<Button variant="contained" startIcon={<Plus size={17} />} onClick={() => setActiveTab("Browse venues")}>Request a venue</Button>} /><div className="venue-tabs">{["AI assistant", "Browse venues", "Booking calendar"].map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab === "AI assistant" && <Sparkles size={15} />}{tab}</button>)}</div>{activeTab === "AI assistant" ? <div className="assistant-layout"><article className="panel assistant-panel"><div className="assistant-head"><span className="assistant-spark"><Sparkles size={17} /></span><div><b>Campus booking assistant</b><small>English · Hinglish · Here to help</small></div><span className="online-dot">Online</span></div><div className="chat-messages">{chat.map((item, index) => <div className={`chat-row ${item.role}`} key={`${item.role}-${index}`}>{item.role === "assistant" && <span className="chat-avatar"><Sparkles size={13} /></span>}<div className="chat-bubble">{item.text}</div></div>)}</div><div className="prompt-chips"><button onClick={() => setMessage("Show me available auditoriums")}>Available auditoriums</button><button onClick={() => setMessage("Find a room for 50 people")}>Room for 50 people</button><button onClick={() => setMessage("Book a computer lab")}>Book a computer lab</button></div><div className="chat-input"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage()} placeholder="Describe what you need, in English or Hinglish..." /><button onClick={sendMessage} aria-label="Send message"><ArrowRight size={17} /></button></div><div className="privacy-note"><ShieldCheck size={13} /> Your booking isn’t submitted until you confirm it.</div></article><article className="panel booking-preview"><div className="preview-heading"><div><span className="preview-kicker"><Sparkles size={13} /> BOOKING PREVIEW</span><h2>Does this look right?</h2><p>Review the details I picked up. You can edit anything.</p></div><button className="icon-button mini" onClick={() => notify("Preview options opened.")}><MoreHorizontal size={18} /></button></div>{confirmed && <div className="inline-success"><CheckCircle2 size={15} />Request submitted for approval</div>}<div className="preview-fields"><TextField label="Event name" value={booking.event} onChange={(event) => setBooking({ ...booking, event: event.target.value })} fullWidth size="small" /><TextField label="Venue" select value={booking.venue} onChange={(event) => setBooking({ ...booking, venue: event.target.value })} fullWidth size="small"><MenuItem value="Main Auditorium">Main Auditorium · 450 capacity</MenuItem><MenuItem value="Seminar Hall A">Seminar Hall A · 150 capacity</MenuItem><MenuItem value="Open-air Theatre">Open-air Theatre · 600 capacity</MenuItem></TextField><div className="field-pair"><TextField label="Event date" type="date" value={booking.date} onChange={(event) => setBooking({ ...booking, date: event.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} /><TextField label="Participants" type="number" value={booking.attendees} onChange={(event) => setBooking({ ...booking, attendees: event.target.value })} fullWidth size="small" /></div><div className="field-pair"><TextField label="From" type="time" value={booking.start} onChange={(event) => setBooking({ ...booking, start: event.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} /><TextField label="Until" type="time" value={booking.end} onChange={(event) => setBooking({ ...booking, end: event.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} /></div></div><div className="venue-fit"><span className="fit-check"><Check size={13} /></span><span><b>Good fit for your event</b><small>Seats 450 · 150 spare seats · AV system included</small></span></div><div className="preview-actions"><Button variant="outlined" fullWidth onClick={() => { setConfirmed(false); notify("Booking request cancelled."); }}>Cancel</Button><Button variant="contained" fullWidth onClick={() => { setConfirmed(true); notify("Spectra booking sent for approval."); }}>Confirm request</Button></div><small className="approval-hint"><Clock3 size={12} /> You’ll hear back from an admin within 1 business day.</small></article></div> : activeTab === "Browse venues" ? <VenueBrowse notify={notify} /> : <BookingCalendar notify={notify} />}</>;
}

function VenueBrowse({ notify }) {
  const venues = [
    ["Main Auditorium", "Auditorium", "450", "Stage · AV system · Green room", "Available", "peach"],
    ["Seminar Hall A", "Seminar hall", "150", "Projector · Video conferencing", "Available", "blue"],
    ["Open-air Theatre", "Outdoor", "600", "Open air · Stage · Lighting", "Available", "mint"],
    ["Innovation Lab", "Computer lab", "48", "48 workstations · High-speed Wi-Fi", "In use", "lavender"],
    ["Seminar Hall B", "Seminar hall", "90", "Projector · Flexible seating", "Available", "blue"],
    ["Computer Lab 2", "Computer lab", "60", "60 workstations · Dual monitors", "Available", "mint"],
  ];
  return <><div className="venue-intro"><div><h2>Find your space</h2><p>64 spaces across campus. Here are a few popular picks.</p></div><SelectFilter label="Venue type" values={["All venue types", "Auditorium", "Seminar hall", "Outdoor", "Computer lab"]} /></div><div className="venue-card-grid">{venues.map((venue) => <article className="panel venue-card" key={venue[0]}><div className={`venue-illustration ${venue[5]}`}><MapPin size={22} /><span>{venue[1]}</span><button className="icon-button mini"><MoreHorizontal size={17} /></button></div><div className="venue-card-body"><div className="venue-name-row"><h3>{venue[0]}</h3><Status>{venue[4]}</Status></div><p><Users size={14} /> Up to {venue[2]} people</p><div className="facility-list">{venue[3].split(" · ").map((facility) => <span key={facility}>{facility}</span>)}</div><button className="venue-request" onClick={() => notify(`${venue[0]} selected. Add your event details to request.`)}>Request this venue <ArrowRight size={14} /></button></div></article>)}</div></>;
}

function BookingCalendar({ notify }) {
  return <article className="panel calendar-panel"><div className="panel-heading"><div><h2>Venue booking calendar</h2><p>November 2026 · Campus-wide availability</p></div><div className="week-control"><button className="icon-button mini"><ChevronLeft size={17} /></button><b>November 2026</b><button className="icon-button mini"><ChevronRight size={17} /></button></div></div><div className="month-calendar">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{Array.from({ length: 35 }, (_, index) => { const day = index - 5; const valid = day > 0 && day <= 30; return <div className={`calendar-cell ${!valid ? "outside" : ""} ${day === 9 ? "selected-date" : ""}`} key={index}><span>{valid ? day : day <= 0 ? 31 + day : day - 30}</span>{day === 9 && <small className="calendar-event-pill">Spectra · Auditorium</small>}{day === 12 && <small className="calendar-event-pill blue-pill">Exam setup</small>}{day === 16 && <small className="calendar-event-pill gold-pill">Innovation week</small>}{day === 18 && <small className="calendar-event-pill blue-pill">Workshop · Hall B</small>}</div>; })}</div><div className="calendar-key"><span><i className="key-dot green" />Approved bookings</span><span><i className="key-dot gold" />Pending approval</span><span><i className="key-dot blue" />Academic events</span><Button size="small" onClick={() => notify("Venue booking request opened.")}>Request a venue</Button></div></article>;
}

function Approvals(props) {
  const [mode, setMode] = useState("Bookings");
  if (!props.canManage) return <StudentAcademicRequests {...props} />;
  const pendingEnrollments = props.enrollmentRequests.filter((item) => item.status === "Pending").length;
  const pendingSubjects = props.subjectRequests.filter((item) => item.status === "Pending").length;
  return <>
    <nav className="academic-approval-tabs" aria-label="Approval categories">
      {[
        ["Bookings", "Booking requests", props.bookings.filter((item) => item.status === "Pending").length],
        ["Enrollments", "Student registrations", pendingEnrollments],
        ["Subjects", "Subject proposals", pendingSubjects],
      ].map(([key, label, count]) => <button type="button" key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key)}>{label}{count !== null && <span>{count}</span>}</button>)}
    </nav>
    {mode === "Bookings" ? <BookingApprovals {...props} /> : <AcademicApprovalQueue {...props} mode={mode} />}
  </>;
}

function StudentAcademicRequests({ account, enrollmentRequests, subjectRequests }) {
  const requests = [
    ...enrollmentRequests.filter((item) => item.studentId.toLowerCase() === account.name.toLowerCase()).map((item) => ({ ...item, label: "Class registration", description: `${item.code} · ${item.branch} · ${item.year} · Section ${item.section} · ${item.semester}` })),
    ...subjectRequests.filter((item) => item.studentId.toLowerCase() === account.name.toLowerCase()).map((item) => ({ ...item, label: "Subject proposal", description: `${item.code} · ${item.name} · ${item.branch} · ${item.semester}` })),
  ];
  return <>
    <PageTitle eyebrow="MY ACADEMIC REQUESTS" title="Registration status" subtitle="Track subject proposals and class registrations sent to administrators and teachers." />
    <article className="panel academic-request-panel">
      {requests.length ? requests.map((request) => <div className="academic-request-row" key={request.id}>
        <span><b>{request.label}</b><small>{request.description}</small></span>
        <Status>{request.status}</Status>
      </div>) : <div className="academic-request-empty"><BookOpen size={20} /><b>No academic requests yet</b><span>Open Timetable Management to request a class registration or propose a subject.</span></div>}
    </article>
  </>;
}

function AcademicApprovalQueue({ mode, enrollmentRequests, subjectRequests, onReviewEnrollment, onReviewSubject }) {
  const isEnrollment = mode === "Enrollments";
  const requests = (isEnrollment ? enrollmentRequests : subjectRequests)
    .slice()
    .sort((left, right) => (left.status === "Pending" ? -1 : 1) - (right.status === "Pending" ? -1 : 1));
  const title = isEnrollment ? "Student registration approvals" : "Subject proposal approvals";
  return <>
    <PageTitle eyebrow="ACADEMIC APPROVALS" title={title} subtitle={isEnrollment ? "Approve or reject student requests to join a specific subject and class group." : "Review student-proposed subjects before adding them to the shared catalog."} />
    <article className="panel academic-request-panel">
      {requests.length ? requests.map((request) => (
        <div className="academic-request-row" key={request.id}>
          <span className="academic-request-main">
            <b>{isEnrollment ? `${request.subject} (${request.code})` : `${request.name} (${request.code})`}</b>
            <small>{isEnrollment
              ? `${request.studentId} · ${request.branch} · ${request.year} · Section ${request.section} · ${request.semester}`
              : `${request.studentId} · ${request.branch} · ${request.year} · ${request.semester}`}</small>
          </span>
          <Status>{request.status}</Status>
          {request.status === "Pending" && <div className="academic-request-actions">
            <Button size="small" variant="contained" startIcon={<Check size={14} />} onClick={() => isEnrollment ? onReviewEnrollment(request.id, "Approved") : onReviewSubject(request.id, "Approved")}>Approve</Button>
            <Button size="small" color="error" variant="outlined" startIcon={<X size={14} />} onClick={() => isEnrollment ? onReviewEnrollment(request.id, "Rejected") : onReviewSubject(request.id, "Rejected")}>Reject</Button>
          </div>}
        </div>
      )) : <div className="academic-request-empty"><CheckCircle2 size={20} /><b>No requests to review</b><span>New student requests will appear here for administrators and teachers.</span></div>}
    </article>
  </>;
}

function BookingApprovals({ bookings, updateBooking, notify, search }) {
  const [tab, setTab] = useState("Pending");
  const [selected, setSelected] = useState(null);
  const filtered = bookings.filter((item) => tab === "All" || item.status === tab).filter((item) => `${item.event} ${item.owner} ${item.venue}`.toLowerCase().includes(search.toLowerCase()));
  const tabs = ["Pending", "Approved", "Rejected", "All"];
  return <><PageTitle eyebrow="OPERATIONS" title="Booking approvals" subtitle="Review venue requests and keep campus events moving." action={<Button variant="outlined" startIcon={<Download size={16} />} onClick={() => notify("Booking report exported.")}>Export report</Button>} /><div className="approval-metrics"><div><span className="metric-icon amber"><Clock3 size={17} /></span><span><b>{bookings.filter((item) => item.status === "Pending").length}</b><small>Awaiting review</small></span></div><div><span className="metric-icon green"><CheckCircle2 size={17} /></span><span><b>{bookings.filter((item) => item.status === "Approved").length}</b><small>Approved this week</small></span></div><div><span className="metric-icon blue"><CalendarDays size={17} /></span><span><b>3</b><small>Events in next 7 days</small></span></div></div><article className="panel approval-panel"><div className="approval-tabs">{tabs.map((item) => <button key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{item}<span>{item === "All" ? bookings.length : bookings.filter((booking) => booking.status === item).length}</span></button>)}</div><div className="table-wrap"><table className="data-table approval-table"><thead><tr><th>REQUEST</th><th>REQUESTED BY</th><th>DATE & TIME</th><th>ATTENDEES</th><th>PRIORITY</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="event-cell"><span className={`avatar avatar-${item.color}`}>{item.initials}</span><span><b>{item.event}</b><small>{item.venue} · {item.id}</small></span></div></td><td>{item.owner}</td><td><span>{item.date}</span><small className="table-subline">{item.time}</small></td><td>{item.people} people</td><td><span className={`priority priority-${item.priority.toLowerCase()}`}><i />{item.priority}</span></td><td><Status>{item.status}</Status></td><td>{item.status === "Pending" ? <div className="approval-actions"><button className="approve-button" onClick={() => updateBooking(item.id, "Approved")} aria-label="Approve"><Check size={15} /></button><button className="reject-button" onClick={() => updateBooking(item.id, "Rejected")} aria-label="Reject"><X size={15} /></button><button className="row-more" onClick={() => setSelected(item)} aria-label="View request"><MoreHorizontal size={17} /></button></div> : <button className="row-more" onClick={() => setSelected(item)} aria-label="View request"><MoreHorizontal size={17} /></button>}</td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing {filtered.length} requests</span><button className="text-link" onClick={() => notify("All booking requests are up to date.")}>Refresh <Activity size={13} /></button></div></article><div className="suggestion-banner"><span className="tiny-icon lavender"><Sparkles size={16} /></span><div><b>Need a venue alternative?</b><small>If a requested room isn’t available, CampusOS can suggest spaces with similar capacity and facilities.</small></div><Button variant="outlined" onClick={() => notify("Alternative venue suggestions are ready to review.")}>Find alternatives</Button></div><Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>Booking request details</DialogTitle>{selected && <DialogContent><div className="request-detail"><b>{selected.event}</b><span>{selected.venue} · {selected.date} · {selected.time}</span><span>{selected.people} expected participants · Requested by {selected.owner}</span><p>Priority: {selected.priority}. The venue has the capacity and facilities requested for this event.</p><TextField label="Decision reason" fullWidth multiline rows={2} placeholder="Add a note for the requester" /></div></DialogContent>}<DialogActions><Button onClick={() => setSelected(null)}>Close</Button>{selected?.status === "Pending" && <Button variant="contained" onClick={() => { updateBooking(selected.id, "Approved"); setSelected(null); }}>Approve request</Button>}</DialogActions></Dialog></>;
}

function Conflicts({ notify }) {
  const [approved, setApproved] = useState([]);
  const [active, setActive] = useState("All conflicts");
  const conflicts = [
    { id: 1, type: "Room booking", severity: "High", title: "Room B-204 is double-booked", meta: "Wednesday, Nov 11 · 10:00 – 11:00 AM", affected: ["Applied mathematics · CS Sem 3", "Project review · Design Sem 5"], room: "Room B-204", solution: "Move Project review to Room C-106 · Faculty and students available", tint: "red" },
    { id: 2, type: "Faculty availability", severity: "Medium", title: "Dr. Mehta has overlapping sessions", meta: "Thursday, Nov 12 · 2:00 – 3:00 PM", affected: ["Electronics lab · ECE Sem 3", "Project supervision · CS Sem 7"], room: "ECE Lab / Faculty office", solution: "Move project supervision to Friday, Nov 13 at 11:00 AM", tint: "orange" },
    { id: 3, type: "Timetable", severity: "Low", title: "Section B has a 4-hour gap", meta: "Monday, Nov 9 · CS Semester 5 · Section B", affected: ["Database systems", "Operating systems"], room: "Schedule optimization", solution: "Shift Database systems to 11:00 AM · No room or faculty conflicts", tint: "blue" },
  ];
  const visible = conflicts.filter((item) => active === "All conflicts" || item.type === active);
  return <><PageTitle eyebrow="OPERATIONS" title="Conflict management" subtitle="Resolve scheduling conflicts with changes you can review and approve." action={<Button variant="outlined" startIcon={<Activity size={16} />} onClick={() => notify("Conflict scan complete. 3 issues found.")}>Run conflict check</Button>} /><div className="conflict-summary"><div><span className="conflict-count red-count">2</span><span><b>Needs attention</b><small>High and medium severity</small></span></div><div><span className="conflict-count blue-count">1</span><span><b>Schedule optimization</b><small>Suggested improvement</small></span></div><div><span className="conflict-count green-count">8</span><span><b>Resolved this week</b><small>Across all departments</small></span></div></div><div className="conflict-filter">{["All conflicts", "Room booking", "Faculty availability", "Timetable"].map((item) => <button key={item} className={active === item ? "selected" : ""} onClick={() => setActive(item)}>{item}</button>)}</div><div className="conflict-list">{visible.map((item) => <article className="panel conflict-card" key={item.id}><div className={`conflict-mark ${item.tint}`}><AlertTriangle size={18} /></div><div className="conflict-content"><div className="conflict-title-line"><div><span className={`severity severity-${item.severity.toLowerCase()}`}>{item.severity} priority</span><span className="conflict-type">{item.type}</span></div>{approved.includes(item.id) && <Status>Approved</Status>}</div><h2>{item.title}</h2><p className="conflict-meta"><CalendarDays size={14} />{item.meta}</p><div className="affected-block"><b>Affected sessions</b>{item.affected.map((session) => <span key={session}><span className="session-bullet" />{session}</span>)}</div><div className="proposed-box"><div className="proposal-heading"><Sparkles size={14} /><b>Proposed change</b></div><p>{item.solution}</p><div className="before-after"><div><small>BEFORE</small><span>{item.affected[1]}</span><b>{item.type === "Timetable" ? "2:00 PM" : item.room}</b></div><ArrowRight size={15} /><div className="after"><small>AFTER</small><span>{item.affected[1]}</span><b>{item.type === "Timetable" ? "11:00 AM · Friday" : item.id === 1 ? "Room C-106" : "Friday · 11:00 AM"}</b></div></div></div><div className="conflict-actions"><Button variant="contained" disabled={approved.includes(item.id)} onClick={() => { setApproved([...approved, item.id]); notify("Proposed schedule change approved."); }}><Check size={15} />{approved.includes(item.id) ? "Change approved" : "Approve proposed change"}</Button><Button variant="text" onClick={() => notify("Edit proposed changes opened.")}>Edit proposal</Button><button className="text-link" onClick={() => notify("No other valid options found. " + item.solution)}><CircleHelp size={14} />Why this change?</button></div></div></article>)}</div></>;
}

function Faculty({ account, notify }) {
  const [prompt, setPrompt] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const facultyName = account?.name || "Faculty member";
  const initials = facultyName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const profileDescription = account?.role === "administrator"
    ? "Administrator · Faculty workspace preview"
    : "Faculty workspace · Department details not assigned";
  return <><PageTitle eyebrow="PEOPLE & TEACHING" title="Faculty dashboard" subtitle="Review teaching schedules, workload, and change requests. The timetable below is preview data until faculty records are connected." action={<Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => { setRequestSent(false); document.getElementById("schedule-request")?.scrollIntoView({ behavior: "smooth" }); }}>Request a change</Button>} /><div className="faculty-profile panel"><span className="faculty-avatar">{initials}</span><div className="faculty-identity"><div className="faculty-name-row"><h2>{facultyName}</h2><Status>Active</Status></div><p>{profileDescription}</p><div className="faculty-meta"><span><BookOpen size={14} /> 4 preview subjects</span><span><MapPin size={14} /> 3 sample rooms</span><span><Users size={14} /> 186 sample students</span></div></div><div className="faculty-id"><small>ACCOUNT EMAIL</small><b>{account?.email || "Not assigned"}</b></div></div><div className="faculty-stats"><StatCard label="Teaching hours" value="16 hrs" change="of 20 hrs" detail="sample weekly allocation" icon={Clock3} tone="green" /><StatCard label="Classes this week" value="12" change="2 today" detail="sample schedule" icon={CalendarDays} tone="blue" /><StatCard label="Schedule requests" value={requestSent ? "1" : "0"} change={requestSent ? "Pending" : "All clear"} detail="local preview" icon={MessageSquareText} tone="orange" /></div><article className="panel faculty-timetable"><div className="panel-heading"><div><h2>Weekly timetable preview</h2><p>Sample week · November 9–13, 2026</p></div><button className="text-link" onClick={() => notify("Preview timetable export is not connected yet.")}>Download <Download size={14} /></button></div><div className="faculty-week">{schedule.map((day) => <div className="faculty-day" key={day.day}><div className="faculty-day-label">{day.day.slice(0, 3)} <b>{day.date}</b></div>{(day.day === "Monday" ? [day.items[0], day.items[2]] : day.day === "Tuesday" ? [day.items[0]] : day.day === "Wednesday" ? [day.items[0]] : day.day === "Thursday" ? [day.items[0], day.items[2]] : [day.items[0]]).map((item, index) => <div className={`faculty-session session-${item.color}`} key={index}><b>{item.title}</b><span>{item.time} · {item.room}</span><small>{item.meta.split(" · ").slice(1).join(" · ")}</small></div>)}</div>)}</div></article><section id="schedule-request" className="faculty-request-grid"><article className="panel request-composer"><div className="panel-heading"><div><h2>Schedule change request</h2><p>Describe what you need in plain language.</p></div><Sparkles size={18} className="composer-spark" /></div><div className="request-prompt"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="e.g. Can I move my Thursday 2 PM session to Friday morning? I have a department meeting." /><div className="prompt-helper"><span><Sparkles size={13} /> We’ll suggest times that work for everyone</span><button onClick={() => { if (prompt.trim()) { setRequestSent(true); setPrompt(""); notify("Schedule request submitted."); } else notify("Add a short description first."); }}><span>Send request</span><ArrowRight size={15} /></button></div></div><div className="request-prompt-examples"><span>Try:</span><button onClick={() => setPrompt("Move my Thursday afternoon session to Friday morning")}>Move a session</button><button onClick={() => setPrompt("I need a substitute for my Monday 9 AM class")}>Request a substitute</button></div></article><article className="panel alternatives-panel"><div className="panel-heading"><div><h2>Suggested alternative</h2><p>For the sample Thursday 2:00 PM session</p></div><span className="match-badge"><Check size={12} /> Sample option</span></div><div className="alternative-row"><div className="alternative-date"><b>13</b><small>FRI</small></div><div><b>Friday, November 13</b><span>11:00 AM – 12:00 PM</span><small>Room C-106 · Sample availability only</small></div></div><div className="alternative-reason"><CheckCircle2 size={15} /> Preview only; live room conflicts are not checked.</div><div className="alternative-actions"><Button variant="contained" onClick={() => notify("Schedule change requests are not connected to the backend yet.")}>Request this time</Button><Button variant="outlined" onClick={() => notify("Alternative search is not connected to the backend yet.")}>See other times</Button></div><div className="request-status"><span>RECENT REQUEST</span><div><span>{requestSent ? "Schedule change request" : "No submitted requests yet"}</span><Status>{requestSent ? "Pending" : "Active"}</Status></div></div></article></section></>;
}

function Analytics({ notify }) {
  const data = [{ month: "Jun", bookings: 34, classes: 62 }, { month: "Jul", bookings: 42, classes: 68 }, { month: "Aug", bookings: 38, classes: 70 }, { month: "Sep", bookings: 57, classes: 77 }, { month: "Oct", bookings: 49, classes: 73 }, { month: "Nov", bookings: 64, classes: 82 }];
  const workload = [{ name: "Computer Science", hours: 82 }, { name: "Electronics", hours: 74 }, { name: "Design", hours: 61 }, { name: "Sciences", hours: 56 }, { name: "Humanities", hours: 42 }];
  return <><PageTitle eyebrow="INSIGHTS" title="Reports & analytics" subtitle="Understand how teaching, rooms, and events use campus resources." action={<Button variant="outlined" startIcon={<Download size={16} />} onClick={() => notify("Analytics report exported.")}>Export report</Button>} /><FilterBar><SelectFilter label="Time period" values={["This semester", "This month", "This academic year"]} /><SelectFilter label="Campus" values={["Main campus", "All campuses"]} /><SelectFilter label="Department" values={["All departments", "Computer Science", "Electronics", "Design"]} /></FilterBar><div className="analytics-kpis"><div><span>Total venue bookings</span><b>248</b><small><ArrowUpRight size={13} /> 14% compared to last semester</small></div><div><span>Room utilisation</span><b>68%</b><small><ArrowUpRight size={13} /> 6% compared to last semester</small></div><div><span>Pending booking requests</span><b>4</b><small><ArrowDownRight size={13} /> 2 fewer than last week</small></div><div><span>Scheduled examinations</span><b>18</b><small><CalendarDays size={13} /> Mid-semester period</small></div></div><div className="analytics-chart-grid"><article className="panel analytics-panel"><div className="panel-heading"><div><h2>Campus activity</h2><p>Monthly bookings and classroom usage</p></div><button className="icon-button mini"><MoreHorizontal size={18} /></button></div><div className="chart-legend"><span><i className="legend-dot dark" />Room utilisation</span><span><i className="legend-dot gold" />Venue bookings</span></div><div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -25 }} barGap={8}><CartesianGrid vertical={false} stroke="#eeede6" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#858982", fontSize: 11 }} dy={9} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#858982", fontSize: 11 }} /><Tooltip contentStyle={{ border: "1px solid #e9e8df", borderRadius: 10, fontSize: 12 }} /><Bar dataKey="classes" name="Room utilisation" fill="#176b4d" radius={[4, 4, 0, 0]} /><Bar dataKey="bookings" name="Venue bookings" fill="#efb66e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></article><article className="panel room-mix-panel"><div className="panel-heading"><div><h2>Space mix</h2><p>Usage by space category</p></div></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={roomData} dataKey="value" nameKey="name" innerRadius={61} outerRadius={84} paddingAngle={4} stroke="none">{roomData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><b>68%</b><small>in use</small></div></div><div className="room-legend">{roomData.map((item) => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><b>{item.value}%</b></div>)}</div></article></div><article className="panel workload-panel"><div className="panel-heading"><div><h2>Faculty workload</h2><p>Teaching hours by department · This week</p></div><button className="text-link" onClick={() => notify("Faculty workload report exported.")}>View detailed report <ArrowRight size={14} /></button></div><div className="workload-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={workload} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 20 }}><CartesianGrid horizontal={false} stroke="#eeede6" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#858982", fontSize: 11 }} /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#565e57", fontSize: 12 }} width={122} /><Tooltip /><Bar dataKey="hours" fill="#7eaf93" radius={[0, 5, 5, 0]} barSize={13} /></BarChart></ResponsiveContainer></div></article></>;
}

function Datasets({ notify }) {
  const [files, setFiles] = useState([
    { name: "student_enrollment_2026.csv", category: "Student data", rows: "4,286 rows", updated: "Nov 2, 2026", size: "284 KB", icon: "csv" },
    { name: "faculty_assignments_sem5.xlsx", category: "Faculty data", rows: "218 rows", updated: "Oct 28, 2026", size: "96 KB", icon: "xlsx" },
    { name: "campus_rooms_and_venues.csv", category: "Room data", rows: "64 rows", updated: "Oct 26, 2026", size: "18 KB", icon: "csv" },
    { name: "course_catalog_2026.csv", category: "Course data", rows: "132 rows", updated: "Oct 20, 2026", size: "42 KB", icon: "csv" },
  ]);
  const [preview, setPreview] = useState(null);
  function uploadFiles(event) {
    const additions = Array.from(event.target.files || []).map((file) => ({ name: file.name, category: "New dataset", rows: "Ready to preview", updated: "Just now", size: `${Math.max(1, Math.round(file.size / 1024))} KB`, icon: file.name.split(".").pop()?.toLowerCase() || "file" }));
    setFiles((current) => [...additions, ...current]);
    if (additions.length) notify(`${additions.length} dataset${additions.length > 1 ? "s" : ""} uploaded.`);
    event.target.value = "";
  }
  return <><PageTitle eyebrow="DATA & CONFIGURATION" title="Dataset management" subtitle="Manage the files that keep campus schedules accurate and up to date." action={<Button variant="outlined" startIcon={<FileJson2 size={16} />} onClick={() => notify("schedule.json exported.")}>Export schedule.json</Button>} /><div className="dataset-notice"><span className="tiny-icon green"><ShieldCheck size={16} /></span><div><b>Your data stays in this workspace</b><small>This frontend demo keeps changes in browser memory only. No files are sent to a server.</small></div></div><article className="panel upload-panel"><input id="dataset-upload" type="file" multiple accept=".csv,.xlsx,.xls,.json" onChange={uploadFiles} hidden /><label htmlFor="dataset-upload" className="upload-zone"><span className="upload-icon"><CloudUpload size={23} /></span><b>Drop files here, or <u>browse</u></b><small>CSV, XLSX or JSON · Up to 20 MB per file</small></label></article><article className="panel datasets-panel"><div className="panel-heading"><div><h2>Uploaded datasets</h2><p>{files.length} files · Last synced November 2, 2026</p></div><SelectFilter label="File type" values={["All file types", "CSV", "XLSX", "JSON"]} /></div><div className="table-wrap"><table className="data-table dataset-table"><thead><tr><th>FILE</th><th>CATEGORY</th><th>RECORDS</th><th>LAST UPDATED</th><th>SIZE</th><th></th></tr></thead><tbody>{files.map((file, index) => <tr key={`${file.name}-${index}`}><td><div className="dataset-file"><span className={`file-icon ${file.icon === "xlsx" ? "excel-file" : file.icon === "json" ? "json-file" : ""}`}>{file.icon === "xlsx" ? "XLS" : file.icon === "json" ? "{}" : "CSV"}</span><b>{file.name}</b></div></td><td>{file.category}</td><td>{file.rows}</td><td>{file.updated}</td><td>{file.size}</td><td><button className="row-more" onClick={() => setPreview(file)} aria-label={`Preview ${file.name}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div><div className="dataset-footer"><span><i className="sync-dot" /> Datasets are up to date</span><button className="text-link" onClick={() => notify("Dataset sync completed.")}>Sync now <Activity size={13} /></button></div></article><article className="panel export-panel"><span className="export-icon"><FileJson2 size={20} /></span><div><h3>Export your campus schedule</h3><p>Download timetable, examination, and booking decisions in a portable JSON format.</p></div><Button variant="contained" startIcon={<Download size={15} />} onClick={() => notify("Your schedule.json is ready to download.")}>Export schedule.json</Button></article><Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm"><DialogTitle>Dataset preview</DialogTitle><DialogContent>{preview && <div className="dataset-preview"><b>{preview.name}</b><span>{preview.category} · {preview.rows} · Updated {preview.updated}</span><div className="preview-table"><div><b>student_id</b><b>name</b><b>branch</b></div><div><span>STU-1001</span><span>Aarav Shah</span><span>Computer Science</span></div><div><span>STU-1002</span><span>Meera Patel</span><span>Electronics</span></div><div><span>STU-1003</span><span>Rohan Iyer</span><span>Design</span></div></div><small>Sample data preview · 3 rows shown</small></div>}</DialogContent><DialogActions><Button onClick={() => setPreview(null)}>Close preview</Button><Button variant="outlined" onClick={() => { notify("Replace dataset selected."); setPreview(null); }}>Replace file</Button></DialogActions></Dialog></>;
}

export default App;
