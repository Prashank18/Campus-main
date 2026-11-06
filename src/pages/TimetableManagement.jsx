import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Download, MapPin,
  Pencil, Plus, Sparkles, Trash2,
} from "lucide-react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField,
} from "@mui/material";
import PageTitle from "../components/PageHeader.jsx";

const branches = ["CSE", "ECE", "EEE", "Mechanical", "Civil"];
const years = ["First", "Second", "Third"];
const semesters = Array.from({ length: 6 }, (_, index) => `Semester ${index + 1}`);
const facultyMembers = [
  "Dr. Ananya Rao",
  "Dr. K. Suresh",
  "Dr. Meera Nair",
  "Prof. R. Prakash",
  "Dr. Lakshmi Devi",
  "Prof. V. Karthik",
];
const rooms = [
  "CC-201",
  "CC-204",
  "ECE-104",
  "EEE-203",
  "ME-202",
  "CE-301",
  "CSE Lab-1",
  "ECE Lab-2",
  "EEE Lab-1",
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = Array.from({ length: 9 }, (_, index) => index + 8);

function makeSession(id, subject, code, branch, year, section, faculty, room, type, day, start, semester = "Semester 3") {
  const endHour = Number(start.slice(0, 2)) + 1;
  return {
    id, subject, code, branch, year, section, semester, academicYear: "2026–27",
    faculty, room, type, day, start, end: `${String(endHour).padStart(2, "0")}:00`,
  };
}

const initialSessions = [
  makeSession("cit-mon-8", "Programming Fundamentals", "CS101", "CSE", "First", "A", "Dr. K. Suresh", "CC-201", "Lecture", "Monday", "08:00"),
  makeSession("cit-mon-9", "Discrete Mathematics", "MA205", "CSE", "Second", "A", "Dr. K. Suresh", "CC-204", "Tutorial", "Monday", "09:00"),
  makeSession("cit-cse-201", "Data Structures & Algorithms", "CS201", "CSE", "Second", "A", "Dr. Ananya Rao", "CC-201", "Lecture", "Monday", "10:00"),
  makeSession("cit-ece-conflict", "Embedded Systems", "EC201", "ECE", "Second", "B", "Dr. Ananya Rao", "ECE-104", "Lecture", "Monday", "10:00"),
  makeSession("cit-mon-12", "Database Systems Lab", "CS205L", "CSE", "Third", "B", "Dr. K. Suresh", "CSE Lab-1", "Practical lab", "Monday", "12:00"),
  makeSession("cit-mon-14", "Computer Networks", "CS301", "CSE", "Third", "A", "Dr. Ananya Rao", "CC-204", "Lecture", "Monday", "14:00", "Semester 5"),

  makeSession("cit-tue-8", "Circuit Theory", "EC101", "ECE", "Second", "A", "Dr. Meera Nair", "ECE-104", "Lecture", "Tuesday", "08:00"),
  makeSession("cit-tue-9", "Digital Systems Lab", "EC102L", "ECE", "Second", "B", "Dr. Meera Nair", "ECE Lab-2", "Practical lab", "Tuesday", "09:00"),
  makeSession("cit-eee-203", "Electrical Machines I", "EE203", "EEE", "Second", "A", "Prof. V. Karthik", "EEE-203", "Lecture", "Tuesday", "10:00"),
  makeSession("cit-eee-conflict", "Power Electronics", "EE201", "EEE", "Second", "B", "Dr. Lakshmi Devi", "EEE-203", "Lecture", "Tuesday", "10:00"),
  makeSession("cit-tue-12", "Signals & Systems Tutorial", "EC205T", "ECE", "Second", "A", "Dr. Meera Nair", "ECE-104", "Tutorial", "Tuesday", "12:00"),
  makeSession("cit-tue-14", "Electrical Machines Lab", "EE203L", "EEE", "Second", "A", "Prof. V. Karthik", "EEE Lab-1", "Practical lab", "Tuesday", "14:00"),

  makeSession("cit-wed-8", "Engineering Mathematics", "MA101T", "Mechanical", "First", "A", "Dr. Lakshmi Devi", "ME-202", "Tutorial", "Wednesday", "08:00"),
  makeSession("cit-cse-303", "Operating Systems", "CS303", "CSE", "Third", "A", "Dr. K. Suresh", "CC-201", "Lecture", "Wednesday", "09:00", "Semester 5"),
  makeSession("cit-cse-group-clash", "Software Engineering Tutorial", "CS304T", "CSE", "Third", "A", "Dr. Ananya Rao", "CC-204", "Tutorial", "Wednesday", "09:00", "Semester 5"),
  makeSession("cit-wed-10", "Engineering Mechanics", "ME201", "Mechanical", "Second", "A", "Prof. R. Prakash", "ME-202", "Lecture", "Wednesday", "10:00"),
  makeSession("cit-wed-12", "Computer Organization", "CS204", "CSE", "Second", "A", "Dr. Ananya Rao", "CC-204", "Lecture", "Wednesday", "12:00"),
  makeSession("cit-wed-14", "Computer-Aided Design Lab", "ME205L", "Mechanical", "Third", "B", "Prof. R. Prakash", "ME-202", "Practical lab", "Wednesday", "14:00", "Semester 5"),

  makeSession("cit-thu-8", "Structural Analysis", "CE201", "Civil", "Third", "A", "Dr. Lakshmi Devi", "CE-301", "Lecture", "Thursday", "08:00", "Semester 5"),
  makeSession("cit-thu-9", "Electronics I", "EC202", "ECE", "Second", "A", "Dr. Meera Nair", "ECE-104", "Lecture", "Thursday", "09:00"),
  makeSession("cit-ece-lab", "Digital Electronics Lab", "EC205L", "ECE", "Second", "B", "Dr. Meera Nair", "ECE Lab-2", "Practical lab", "Thursday", "10:00"),
  makeSession("cit-thu-12", "Thermodynamics", "ME202", "Mechanical", "Second", "A", "Prof. R. Prakash", "ME-202", "Lecture", "Thursday", "12:00"),
  makeSession("cit-thu-14", "Reinforced Concrete Design", "CE301", "Civil", "Third", "A", "Dr. Lakshmi Devi", "CE-301", "Tutorial", "Thursday", "14:00", "Semester 5"),

  makeSession("cit-me-lab", "Manufacturing Processes Lab", "ME206L", "Mechanical", "Third", "B", "Prof. R. Prakash", "ME-202", "Practical lab", "Friday", "08:00", "Semester 5"),
  makeSession("cit-fri-9", "Computer Networks", "CS301", "CSE", "Third", "B", "Dr. K. Suresh", "CC-201", "Lecture", "Friday", "09:00", "Semester 5"),
  makeSession("cit-fri-10", "Power Systems", "EE302", "EEE", "Third", "A", "Prof. V. Karthik", "EEE-203", "Tutorial", "Friday", "10:00", "Semester 5"),
  makeSession("cit-fri-12", "Software Engineering Lab", "CS305L", "CSE", "Third", "A", "Dr. Ananya Rao", "CSE Lab-1", "Practical lab", "Friday", "12:00", "Semester 5"),
  makeSession("cit-fri-14", "Surveying", "CE202", "Civil", "Second", "A", "Dr. Lakshmi Devi", "CE-301", "Lecture", "Friday", "14:00"),

  makeSession("cit-sat-8", "Introduction to Computing", "CS101", "CSE", "First", "B", "Dr. K. Suresh", "CC-201", "Lecture", "Saturday", "08:00"),
  makeSession("cit-sat-9", "Programming Fundamentals Tutorial", "CS101T", "CSE", "First", "B", "Dr. Ananya Rao", "CC-204", "Tutorial", "Saturday", "09:00"),
  makeSession("cit-sat-10", "Signals & Systems", "EC302", "ECE", "Third", "A", "Dr. Meera Nair", "ECE-104", "Lecture", "Saturday", "10:00", "Semester 5"),
  makeSession("cit-sat-12", "Environmental Engineering", "CE205", "Civil", "Second", "A", "Dr. Lakshmi Devi", "CE-301", "Lecture", "Saturday", "12:00"),
  makeSession("cit-sat-14", "Surveying Practice Lab", "CE202L", "Civil", "Second", "A", "Dr. Lakshmi Devi", "CE-301", "Practical lab", "Saturday", "14:00"),
];

export const initialSubjects = [...new Map(initialSessions.map((session) => [
  session.code,
  {
    code: session.code,
    name: session.subject,
    branch: session.branch,
    year: session.year,
    semester: session.semester,
  },
])).values()];

const sampleConflicts = [
  { type: "Faculty double booking", severity: "high", time: "Mon · 10:00–11:00", affected: "CS201 Data Structures & Algorithms + EC201 Embedded Systems", reason: "Dr. Ananya Rao is assigned to CSE and ECE groups in the same time slot.", sessionIds: ["cit-cse-201", "cit-ece-conflict"] },
  { type: "Room double booking", severity: "high", time: "Tue · 10:00–11:00", affected: "EE203 Electrical Machines I + EE201 Power Electronics", reason: "Both sessions request room EEE-203 at the same time.", sessionIds: ["cit-eee-203", "cit-eee-conflict"] },
  { type: "Student group clash", severity: "medium", time: "Wed · 09:00–10:00", affected: "CS303 Operating Systems + CS304T Software Engineering Tutorial", reason: "CSE · Third year · Section A has two overlapping sessions.", sessionIds: ["cit-cse-303", "cit-cse-group-clash"] },
  { type: "Room closure", severity: "medium", time: "Thu · 10:00–11:00", affected: "EC205L Digital Electronics Lab · ECE Lab-2", reason: "ECE Lab-2 is closed for scheduled maintenance during this session.", sessionId: "cit-ece-lab" },
  { type: "Faculty leave", severity: "low", time: "Fri · 08:00–09:00", affected: "ME205L Manufacturing Processes Lab · Prof. R. Prakash", reason: "Prof. R. Prakash has approved leave during this scheduled session.", sessionId: "cit-me-lab" },
];

function formatGroup(session) {
  return `${session.branch} · ${session.year} · Section ${session.section}`;
}

function displayDuration(start, end) {
  const minutes = toMinutes(end) - toMinutes(start);
  const wholeHours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [wholeHours && `${wholeHours} hr${wholeHours > 1 ? "s" : ""}`, remainder && `${remainder} min`]
    .filter(Boolean)
    .join(" ");
}

function formatSlot(hour) {
  if (hour === 11) return "11 AM–12 PM";
  const endHour = hour + 1;
  const startLabel = hour > 12 ? hour - 12 : hour;
  const endLabel = endHour > 12 ? endHour - 12 : endHour;
  return `${startLabel}–${endLabel} ${hour >= 12 ? "PM" : "AM"}`;
}

const emptyForm = {
  subject: "",
  code: "",
  branch: "CSE",
  year: "Second",
  section: "A",
  semester: "Semester 3",
  academicYear: "2026–27",
  faculty: facultyMembers[0],
  room: rooms[0],
  type: "Lecture",
  day: "Monday",
  start: "09:00",
  end: "10:00",
};

function toMinutes(time) {
  const [hoursValue, minutesValue] = time.split(":").map(Number);
  return hoursValue * 60 + minutesValue;
}

function displayTime(time) {
  const [hoursValue, minutesValue] = time.split(":").map(Number);
  const suffix = hoursValue >= 12 ? "PM" : "AM";
  return `${hoursValue % 12 || 12}:${String(minutesValue).padStart(2, "0")} ${suffix}`;
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function readSavedSessions() {
  try {
    const saved = JSON.parse(localStorage.getItem("campusOSTimetableSessions") || "null");
    return Array.isArray(saved) ? saved : initialSessions;
  } catch {
    return initialSessions;
  }
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <TextField
      className="tm-filter"
      label={label}
      select
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </TextField>
  );
}

export default function TimetableManagement({
  notify,
  canManage,
  account,
  subjects,
  onAddSubject,
  enrollmentRequests,
  approvedEnrollments,
  subjectRequests,
  onRequestEnrollment,
  onRequestSubject,
}) {
  const [sessions, setSessions] = useState(readSavedSessions);
  const [studentForm, setStudentForm] = useState({ semester: "Semester 1", branch: "CSE", year: "First", section: "A" });
  const [subjectProposalOpen, setSubjectProposalOpen] = useState(false);
  const [subjectProposal, setSubjectProposal] = useState({ name: "", code: "", branch: "CSE", year: "First", semester: "Semester 1" });
  const [filters, setFilters] = useState({
    academicYear: "2026–27",
    semester: "All semesters",
    branch: "All branches",
    year: "All years",
    section: "All sections",
    faculty: "All faculty",
    room: "All rooms",
  });
  const [activeView, setActiveView] = useState("Weekly View");
  const [viewSelection, setViewSelection] = useState({
    "Faculty View": facultyMembers[0],
    "Room View": rooms[0],
    "Group View": "CSE · Second · Section A",
  });
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", branch: "CSE", year: "First", semester: "Semester 1" });
  const [editingId, setEditingId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateOptions, setGenerateOptions] = useState({
    semester: "Semester 3",
    academicYear: "2026–27",
    branches: ["CSE", "ECE", "EEE", "Mechanical", "Civil"],
    studentGroup: "All student groups",
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [focusedSession, setFocusedSession] = useState("");
  const isStudent = account?.role === "student";


  useEffect(() => {
    try {
      localStorage.setItem("campusOSTimetableSessions", JSON.stringify(sessions));
    } catch {
      notify("Browser storage is unavailable; timetable changes will last until this page is closed.");
    }
  }, [sessions]);

  const groupOptions = useMemo(() => (
    [...new Set(sessions.map(formatGroup))].sort((left, right) => left.localeCompare(right))
  ), [sessions]);

  const activeConflicts = useMemo(() => sampleConflicts.filter((conflict) => {
    const affectedIds = conflict.sessionIds || [conflict.sessionId];
    return affectedIds.every((id) => sessions.some((session) => session.id === id));
  }), [sessions]);

  const generatedSessions = useMemo(() => sessions.filter((session) => (
    (session.academicYear || "2026–27") === generateOptions.academicYear
    && session.semester === generateOptions.semester
    && generateOptions.branches.includes(session.branch)
    && (generateOptions.studentGroup === "All student groups" || formatGroup(session) === generateOptions.studentGroup)
  )), [generateOptions, sessions]);

  const generatedSessionIds = new Set(generatedSessions.map((session) => session.id));
  const generatedConflicts = activeConflicts.filter((conflict) => (
    (conflict.sessionIds || [conflict.sessionId]).every((id) => generatedSessionIds.has(id))
  ));

  const filteredSessions = useMemo(() => sessions.filter((session) => (
    (filters.academicYear === "All academic years" || !session.academicYear || session.academicYear === filters.academicYear)
    && (filters.semester === "All semesters" || session.semester === filters.semester)
    && (filters.branch === "All branches" || session.branch === filters.branch)
    && (filters.year === "All years" || session.year === filters.year)
    && (filters.section === "All sections" || session.section === filters.section)
    && (filters.faculty === "All faculty" || session.faculty === filters.faculty)
    && (filters.room === "All rooms" || session.room === filters.room)
    && (!isStudent || approvedEnrollments.some((enrollment) => (
      enrollment.studentId.toLowerCase() === account.name.toLowerCase()
      && enrollment.code === session.code
      && enrollment.branch === session.branch
      && enrollment.year === session.year
      && enrollment.section === session.section
      && enrollment.semester === session.semester
    )))
  )), [account?.name, approvedEnrollments, filters, isStudent, sessions]);

  const studentSubjectOptions = subjects.filter((subject) => (
    subject.semester === studentForm.semester
    && subject.branch === studentForm.branch
    && subject.year === studentForm.year
  ));
  const studentRequests = enrollmentRequests.filter((request) => (
    request.studentId.toLowerCase() === account?.name?.toLowerCase()
  ));
  const studentSubjectRequests = subjectRequests.filter((request) => (
    request.studentId.toLowerCase() === account?.name?.toLowerCase()
  ));

  function requestStudentSubject(subject) {
    const added = onRequestEnrollment({
      code: subject.code,
      subject: subject.name,
      branch: studentForm.branch,
      year: studentForm.year,
      section: studentForm.section,
      semester: studentForm.semester,
    });
    if (added) {
      setFilters((current) => ({ ...current, semester: studentForm.semester, branch: studentForm.branch, year: studentForm.year, section: studentForm.section }));
    }
  }

  function submitSubjectProposal(event) {
    event.preventDefault();
    const added = onRequestSubject({
      name: subjectProposal.name.trim(),
      code: subjectProposal.code.trim().toUpperCase(),
      branch: subjectProposal.branch,
      year: subjectProposal.year,
      semester: subjectProposal.semester,
    });
    if (added) {
      setSubjectProposalOpen(false);
      setSubjectProposal({ name: "", code: "", branch: studentForm.branch, year: studentForm.year, semester: studentForm.semester });
    }
  }

  const viewOptions = activeView === "Faculty View"
    ? facultyMembers
    : activeView === "Room View"
      ? rooms
      : groupOptions;
  const currentViewSelection = viewOptions.includes(viewSelection[activeView])
    ? viewSelection[activeView]
    : viewOptions[0] || "";

  const viewSessions = useMemo(() => {
    if (activeView === "Weekly View") return filteredSessions;
    return filteredSessions.filter((session) => (
      activeView === "Faculty View"
        ? session.faculty === currentViewSelection
        : activeView === "Room View"
          ? session.room === currentViewSelection
          : formatGroup(session) === currentViewSelection
    ));
  }, [activeView, currentViewSelection, filteredSessions]);

  const filterOptions = {
    semesters: ["All semesters", ...semesters],
    branches: ["All branches", ...branches],
    years: ["All years", ...years],
    sections: ["All sections", "A", "B", "C"],
    faculty: ["All faculty", ...facultyMembers],
    rooms: ["All rooms", ...rooms],
  };

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function openNewSession() {
    if (!canManage) return;
    setEditingId(null);
    const initialSubject = subjects[0];
    setForm({
      ...emptyForm,
      subject: initialSubject?.name || "",
      code: initialSubject?.code || "",
      branch: filters.branch === "All branches" ? initialSubject?.branch || emptyForm.branch : filters.branch,
      year: filters.year === "All years" ? initialSubject?.year || emptyForm.year : filters.year,
      semester: filters.semester === "All semesters" ? initialSubject?.semester || emptyForm.semester : filters.semester,
      section: filters.section === "All sections" ? emptyForm.section : filters.section,
      faculty: filters.faculty === "All faculty" ? emptyForm.faculty : filters.faculty,
      room: filters.room === "All rooms" ? emptyForm.room : filters.room,
    });
    setSessionDialogOpen(true);
  }

  function openEditSession(session) {
    if (!canManage) return;
    setEditingId(session.id);
    setForm({ ...emptyForm, ...session });
    setSessionDialogOpen(true);
  }

  function saveSubject(event) {
    event.preventDefault();
    const name = subjectForm.name.trim();
    if (!name) return;
    const baseCode = `SUB-${name.replace(/[^a-z0-9]+/gi, "").toUpperCase() || "NEW"}`;
    let code = baseCode;
    let suffix = 2;
    while (subjects.some((item) => item.code.toLowerCase() === code.toLowerCase())) {
      code = `${baseCode}-${suffix}`;
      suffix += 1;
    }
    const subject = {
      ...subjectForm,
      name,
      code,
    };
    if (onAddSubject(subject)) {
      setForm((current) => ({ ...current, subject: subject.name, code: subject.code, branch: subject.branch, year: subject.year, semester: subject.semester }));
      setSubjectDialogOpen(false);
      setSubjectForm({ name: "", code: "", branch: "CSE", year: "First", semester: "Semester 1" });
    }
  }

  function saveSession(event) {
    event.preventDefault();
    if (!canManage) return;
    const startMinutes = toMinutes(form.start);
    const endMinutes = toMinutes(form.end);
    if (startMinutes < 480 || endMinutes > 1020 || endMinutes <= startMinutes) {
      notify("Choose a valid time between 8:00 AM and 5:00 PM, with the end after the start.");
      return;
    }
    if (startMinutes < 720 && endMinutes > 660) {
      notify("11:00 AM–12:00 PM is reserved for the campus break.");
      return;
    }
    const updatedSession = {
      ...form,
      id: editingId || `cit-session-${Date.now()}`,
    };
    setSessions((current) => editingId
      ? current.map((session) => session.id === editingId ? updatedSession : session)
      : [...current, updatedSession]);
    setSessionDialogOpen(false);
    notify(editingId ? "Timetable session updated." : "Timetable session added.");
  }

  function confirmDelete() {
    if (!canManage) return;
    setSessions((current) => current.filter((session) => session.id !== deleteCandidate.id));
    setDeleteCandidate(null);
    setSessionDialogOpen(false);
    notify("Timetable session deleted.");
  }

  function exportTimetable() {
    const columns = ["Academic year", "Semester", "Day", "Start", "End", "Subject", "Code", "Branch", "Year", "Section", "Faculty", "Room", "Session type"];
    const records = viewSessions.map((session) => [
      session.academicYear || "2026–27",
      session.semester,
      session.day,
      session.start,
      session.end,
      session.subject,
      session.code,
      session.branch,
      session.year,
      session.section,
      session.faculty,
      session.room,
      session.type,
    ]);
    const csv = [columns, ...records].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cit-timetable-2026-27.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${viewSessions.length} timetable sessions.`);
  }

  function toggleGenerationBranch(branch) {
    setGenerated(false);
    setGenerateOptions((current) => ({
      ...current,
      branches: current.branches.includes(branch)
        ? current.branches.filter((item) => item !== branch)
        : [...current.branches, branch],
    }));
  }

  function generatePreview() {
    if (!generateOptions.branches.length) {
      notify("Select at least one branch to generate a preview.");
      return;
    }
    setGenerating(true);
    setGenerated(false);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 900);
  }

  function focusConflict(conflict) {
    const sessionId = conflict.sessionId || conflict.sessionIds?.[0];
    setFilters({
      academicYear: "2026–27",
      semester: "All semesters",
      branch: "All branches",
      year: "All years",
      section: "All sections",
      faculty: "All faculty",
      room: "All rooms",
    });
    setActiveView("Weekly View");
    setFocusedSession(sessionId);
    window.setTimeout(() => {
      document.getElementById(`timetable-${sessionId}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 60);
    window.setTimeout(() => setFocusedSession(""), 1800);
  }

  function resetFilters() {
    setFilters({
      academicYear: "2026–27",
      semester: "All semesters",
      branch: "All branches",
      year: "All years",
      section: "All sections",
      faculty: "All faculty",
      room: "All rooms",
    });
  }

  return (
    <div className="timetable-management">
      <PageTitle
        eyebrow="ACADEMIC PLANNING"
        title="Timetable Management"
        subtitle="Manage and monitor academic schedules."
        action={
          <div className="tm-page-actions">
            <div className="tm-header-selects">
              <FilterSelect label="Academic year" value={filters.academicYear} options={["2026–27", "All academic years"]} onChange={(value) => setFilter("academicYear", value)} />
              <FilterSelect label="Semester" value={filters.semester} options={filterOptions.semesters} onChange={(value) => setFilter("semester", value)} />
            </div>
            <div className="tm-header-buttons">
              <Button variant="outlined" startIcon={<Download size={16} />} onClick={exportTimetable}>Export</Button>
              {canManage && <Button variant="outlined" startIcon={<BookOpen size={16} />} onClick={() => setSubjectDialogOpen(true)}>Add Subject</Button>}
              {canManage && <Button variant="outlined" startIcon={<Plus size={16} />} onClick={openNewSession}>Add Session</Button>}
              {canManage && <Button variant="contained" startIcon={<Sparkles size={16} />} onClick={() => setGenerateOpen((open) => !open)}>Generate Timetable</Button>}
            </div>
          </div>
        }
      />

      {isStudent && (
        <section className="student-registration-panel">
          <div className="student-registration-heading">
            <div><span className="tm-eyebrow">STUDENT REGISTRATION</span><h2>Choose your classes</h2><p>Request a subject for your semester and group. Only approved registrations appear in your timetable.</p></div>
            <Button variant="outlined" startIcon={<Plus size={15} />} onClick={() => {
              setSubjectProposal({ name: "", code: "", branch: studentForm.branch, year: studentForm.year, semester: studentForm.semester });
              setSubjectProposalOpen(true);
            }}>Propose a subject</Button>
          </div>
          <div className="student-registration-filters">
            <FilterSelect label="Semester" value={studentForm.semester} options={semesters} onChange={(semester) => setStudentForm((current) => ({ ...current, semester }))} />
            <FilterSelect label="Branch" value={studentForm.branch} options={branches} onChange={(branch) => setStudentForm((current) => ({ ...current, branch }))} />
            <FilterSelect label="Year" value={studentForm.year} options={years} onChange={(year) => setStudentForm((current) => ({ ...current, year }))} />
            <FilterSelect label="Section" value={studentForm.section} options={["A", "B", "C"]} onChange={(section) => setStudentForm((current) => ({ ...current, section }))} />
          </div>
          <div className="student-subject-list">
            {studentSubjectOptions.length ? studentSubjectOptions.map((subject) => {
              const registration = [...studentRequests, ...approvedEnrollments].find((item) => (
                item.studentId.toLowerCase() === account.name.toLowerCase()
                && item.code === subject.code
                && item.branch === studentForm.branch
                && item.year === studentForm.year
                && item.section === studentForm.section
                && item.semester === studentForm.semester
                && item.status !== "Rejected"
              ));
              return (
                <article className="student-subject-option" key={`${subject.code}-${subject.name}`}>
                  <span className="student-subject-icon"><BookOpen size={16} /></span>
                  <span><b>{subject.name}</b><small>{subject.code} · {subject.branch} · {subject.semester}</small></span>
                  {registration?.status === "Approved"
                    ? <span className="student-registration-status approved"><CheckCircle2 size={14} />Approved</span>
                    : registration?.status === "Pending"
                      ? <span className="student-registration-status pending"><Clock3 size={14} />Awaiting approval</span>
                      : <Button size="small" variant="outlined" onClick={() => requestStudentSubject(subject)}>Request registration</Button>}
                </article>
              );
            }) : <div className="student-subject-empty">No catalog subjects for this semester and group yet. Propose a subject and wait for academic approval.</div>}
          </div>
          {(studentRequests.length > 0 || studentSubjectRequests.length > 0) && (
            <div className="student-request-history">
              <b>Your requests</b>
              {[...studentSubjectRequests.map((request) => ({ ...request, requestType: "New subject" })), ...studentRequests.map((request) => ({ ...request, requestType: "Registration" }))].map((request) => (
                <span key={request.id}><small>{request.requestType}</small><strong>{request.code} · {request.name || request.subject}</strong><em className={`request-state ${request.status.toLowerCase()}`}>{request.status}</em></span>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="tm-filter-panel" aria-label="Timetable filters">
        <div className="tm-filter-heading">
          <div><b>Schedule filters</b><small>Choose the academic group and teaching space to review.</small></div>
          <button type="button" className="tm-reset-button" onClick={resetFilters}>Reset filters</button>
        </div>
        <div className="tm-filter-grid">
          <FilterSelect label="Branch" value={filters.branch} options={filterOptions.branches} onChange={(value) => setFilter("branch", value)} />
          <FilterSelect label="Year" value={filters.year} options={filterOptions.years} onChange={(value) => setFilter("year", value)} />
          <FilterSelect label="Section" value={filters.section} options={filterOptions.sections} onChange={(value) => setFilter("section", value)} />
          <FilterSelect label="Faculty" value={filters.faculty} options={filterOptions.faculty} onChange={(value) => setFilter("faculty", value)} />
          <FilterSelect label="Room" value={filters.room} options={filterOptions.rooms} onChange={(value) => setFilter("room", value)} />
        </div>
      </section>

      {canManage && generateOpen && (
        <section className="tm-generate-panel" aria-label="Generate timetable preview">
          <div className="tm-generate-heading">
            <div className="tm-generate-icon"><Sparkles size={19} /></div>
            <div><h2>Generate timetable</h2><p>Configure a semester and preview the generated schedule. Scheduling is simulated in this frontend.</p></div>
            <button type="button" className="tm-close-button" aria-label="Close generation panel" onClick={() => setGenerateOpen(false)}>×</button>
          </div>
          <div className="tm-dataset-info"><CalendarDays size={15} /><span><b>CIT timetable dataset</b><small>{sessions.length} sample sessions · {groupOptions.length} student groups · frontend preview only</small></span></div>
          <div className="tm-generation-controls">
            <FilterSelect label="Academic year" value={generateOptions.academicYear} options={["2026–27"]} onChange={(value) => { setGenerated(false); setGenerateOptions((current) => ({ ...current, academicYear: value })); }} />
            <FilterSelect label="Semester" value={generateOptions.semester} options={semesters} onChange={(value) => { setGenerated(false); setGenerateOptions((current) => ({ ...current, semester: value })); }} />
            <FilterSelect label="Student group" value={generateOptions.studentGroup} options={["All student groups", ...groupOptions]} onChange={(value) => { setGenerated(false); setGenerateOptions((current) => ({ ...current, studentGroup: value })); }} />
            <div className="tm-branch-picker"><span>Branches</span><div>{branches.map((branch) => <button type="button" key={branch} aria-pressed={generateOptions.branches.includes(branch)} className={generateOptions.branches.includes(branch) ? "selected" : ""} onClick={() => toggleGenerationBranch(branch)}>{branch}</button>)}</div></div>
            <Button variant="contained" disabled={generating} startIcon={<Sparkles size={16} />} onClick={generatePreview}>{generating ? "Generating preview..." : "Generate preview"}</Button>
          </div>
          {generating && <div className="tm-progress" role="status"><span className="tm-progress-spinner" /><div><b>Building a draft timetable from the selected groups…</b><span className="tm-progress-track"><i /></span></div></div>}
          {generated && (
            <div className="tm-generated-preview">
              <div className={`tm-preview-status ${generatedConflicts.length ? "needs-review" : ""}`}>{generatedConflicts.length ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}<span><b>Generated timetable preview</b><small>Validation result: {generatedConflicts.length ? "sample conflicts need review" : "no sample conflicts found"}.</small></span></div>
              <div className="tm-preview-metrics"><span><b>{generateOptions.branches.length}</b><small>Branches</small></span><span><b>{generatedSessions.length}</b><small>Sample sessions</small></span><span><b>{generatedConflicts.length}</b><small>Sample warnings</small></span></div>
              <div className="tm-preview-list">{generatedSessions.length ? generatedSessions.slice(0, 4).map((session) => <span key={session.id}><b>{session.code}</b>{session.subject}<small>{session.day} · {displayTime(session.start)} · {session.room}</small></span>) : <span className="tm-preview-empty">No dataset sessions match this semester, branch, and student group.</span>}</div>
              <div className="tm-preview-summary"><b>Conflict summary</b><span>{generatedConflicts.length ? generatedConflicts.map((conflict) => conflict.type).join(" · ") : "No sample warnings for this selection."}</span></div>
              <div className="tm-simulation-note"><AlertTriangle size={14} /> Timetable generation and clash detection are UI simulations. No schedule was saved or published.</div>
            </div>
          )}
        </section>
      )}

      <div className="tm-view-toolbar">
        <div className="tm-view-tabs" role="tablist" aria-label="Timetable views">
          {["Weekly View", "Faculty View", "Room View", "Group View"].map((view) => (
            <button type="button" role="tab" aria-selected={activeView === view} className={activeView === view ? "active" : ""} key={view} onClick={() => setActiveView(view)}>{view}</button>
          ))}
        </div>
        {activeView !== "Weekly View"
          ? <FilterSelect label={activeView === "Faculty View" ? "Faculty" : activeView === "Room View" ? "Room" : "Student group"} value={viewSelection[activeView]} options={viewOptions} onChange={(value) => setViewSelection((current) => ({ ...current, [activeView]: value }))} />
          : <span className="tm-view-hint">Showing all matching groups</span>}
      </div>

      <div className="tm-calendar-heading">
        <div><span className="tm-eyebrow">{activeView.toUpperCase()} · 09–14 NOV 2026</span><h2>{activeView === "Weekly View" ? "Academic timetable" : activeView.replace(" View", " timetable")}</h2><p>{viewSessions.length} sessions shown · 8:00 AM–5:00 PM · Break 11:00 AM–12:00 PM</p></div>
        <div className="tm-calendar-tools"><span><i className="tm-live-dot" />2026–27</span><span>Semester view</span></div>
      </div>

      <div className="tm-legend" aria-label="Session type legend">
        <span><i className="tm-legend-dot lecture" />Lecture</span>
        <span><i className="tm-legend-dot tutorial" />Tutorial</span>
        <span><i className="tm-legend-dot lab" />Practical lab</span>
        <span><i className="tm-legend-dot break" />Break</span>
        <span><i className="tm-legend-dot conflict" />Needs review</span>
      </div>

      <section className="tm-calendar-scroll" role="tabpanel" aria-label={`${activeView} timetable`}>
        <div className="tm-calendar">
          <div className="tm-time-column">
            <div className="tm-day-header tm-time-header">TIME</div>
            {hours.map((hour) => <div className="tm-hour-label" key={hour}>{formatSlot(hour)}</div>)}
            <div className="tm-hour-end">5:00 PM</div>
          </div>
          {days.map((day, dayIndex) => {
            const daySessions = viewSessions.filter((session) => session.day === day);
            return (
              <div className="tm-day-column" key={day}>
                <div className={`tm-day-header ${dayIndex === 0 ? "is-current" : ""}`}><span>{day.slice(0, 3).toUpperCase()}</span><b>{String(9 + dayIndex).padStart(2, "0")}</b></div>
                <div className="tm-day-track">
                  <div className="tm-lunch-break"><span>BREAK · 11 AM–12 PM</span></div>
                  {daySessions.map((session) => {
                    const top = ((toMinutes(session.start) - 480) / 60) * 74 + 4;
                    const height = Math.max(((toMinutes(session.end) - toMinutes(session.start)) / 60) * 74 - 8, 48);
                    const hasConflict = activeConflicts.some((conflict) => conflict.sessionId === session.id || conflict.sessionIds?.includes(session.id));
                    const overlapGroup = daySessions
                      .filter((other) => toMinutes(other.start) < toMinutes(session.end) && toMinutes(other.end) > toMinutes(session.start))
                      .sort((left, right) => left.id.localeCompare(right.id));
                    const lane = overlapGroup.findIndex((item) => item.id === session.id);
                    const placement = overlapGroup.length > 1
                      ? { left: lane === 0 ? "4px" : "calc(50% + 1px)", width: "calc(50% - 5px)" }
                      : { left: "4px", right: "4px" };
                    return (
                      <article
                        id={`timetable-${session.id}`}
                        className={`tm-session tm-session--${session.type === "Practical lab" ? "lab" : session.type.toLowerCase()} ${hasConflict ? "is-conflict" : ""} ${focusedSession === session.id ? "is-focused" : ""}`}
                        key={session.id}
                        style={{ top: `${top}px`, height: `${height}px`, ...placement }}
                      >
                        <div className="tm-session-top"><span>{session.code}</span>{canManage && <button type="button" aria-label={`Edit ${session.subject}`} onClick={() => openEditSession(session)}><Pencil size={13} /></button>}</div>
                        <b className="tm-subject">{session.subject}</b>
                        <span className="tm-session-meta"><span>{session.faculty}</span><span><MapPin size={11} />{session.room}</span></span>
                        <span className="tm-session-time">{displayTime(session.start)}–{displayTime(session.end)} · {displayDuration(session.start, session.end)} <i>{session.type}</i></span>
                        {hasConflict && <AlertTriangle className="tm-card-alert" size={14} aria-label="Scheduling warning" />}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {viewSessions.length === 0 && (
        <div className="tm-empty-state"><CalendarDays size={22} /><b>No sessions match these filters</b><span>Try another branch, semester, faculty member, or room.</span><button type="button" onClick={resetFilters}>Clear filters</button></div>
      )}

      {canManage && <section className="tm-conflicts-panel" id="timetable-conflicts">
        <div className="tm-section-heading"><div><span className="tm-eyebrow">VALIDATION</span><h2>Conflict warnings</h2><p>Sample findings for the interface; automatic clash detection is not connected yet.</p></div><span className="tm-conflict-count"><AlertTriangle size={15} />{activeConflicts.length} sample warnings</span></div>
        <div className="tm-conflict-list">
          {activeConflicts.map((conflict) => (
            <button className="tm-conflict-row" type="button" key={conflict.type} onClick={() => focusConflict(conflict)}>
              <span className={`tm-conflict-icon ${conflict.severity}`}><AlertTriangle size={16} /></span>
              <span className="tm-conflict-copy"><b>{conflict.type}</b><small>{conflict.affected}</small><span>{conflict.reason}</span></span>
              <span className="tm-conflict-time">{conflict.time}</span>
              <ArrowRight size={15} className="tm-conflict-arrow" />
            </button>
          ))}
        </div>
      </section>}

      <div className="tm-footer-note"><Clock3 size={15} /><span>Academic changes are saved in this browser only. Connect a backend to synchronize, publish, and validate schedules across users.</span></div>

      <Dialog open={canManage && sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} fullWidth maxWidth="md">
        <form onSubmit={saveSession}>
          <DialogTitle>{editingId ? "Edit timetable session" : "Add timetable session"}</DialogTitle>
          <DialogContent>
            <div className="tm-session-form">
              <TextField label="Subject" select value={form.code} required fullWidth onChange={(event) => {
                const subject = subjects.find((item) => item.code === event.target.value);
                setForm((current) => ({ ...current, subject: subject?.name || "", code: subject?.code || "", branch: subject?.branch || current.branch, year: subject?.year || current.year, semester: subject?.semester || current.semester }));
              }}>
                {subjects.map((subject) => <MenuItem value={subject.code} key={`${subject.code}-${subject.name}`}>{subject.code} · {subject.name}</MenuItem>)}
              </TextField>
              <TextField label="Subject name" value={form.subject} required fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Subject code" value={form.code} required fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Branch" select value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} fullWidth>{branches.map((branch) => <MenuItem value={branch} key={branch}>{branch}</MenuItem>)}</TextField>
              <TextField label="Year" select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} fullWidth>{years.map((year) => <MenuItem value={year} key={year}>{year}</MenuItem>)}</TextField>
              <TextField label="Section" select value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} fullWidth>{["A", "B", "C"].map((section) => <MenuItem value={section} key={section}>{section}</MenuItem>)}</TextField>
              <TextField label="Semester" select value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })} fullWidth>{semesters.map((semester) => <MenuItem value={semester} key={semester}>{semester}</MenuItem>)}</TextField>
              <TextField label="Academic year" select value={form.academicYear} onChange={(event) => setForm({ ...form, academicYear: event.target.value })} fullWidth><MenuItem value="2026–27">2026–27</MenuItem></TextField>
              <TextField label="Faculty" select value={form.faculty} onChange={(event) => setForm({ ...form, faculty: event.target.value })} fullWidth>{facultyMembers.map((faculty) => <MenuItem value={faculty} key={faculty}>{faculty}</MenuItem>)}</TextField>
              <TextField label="Room" select value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} fullWidth>{rooms.map((room) => <MenuItem value={room} key={room}>{room}</MenuItem>)}</TextField>
              <TextField label="Session type" select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} fullWidth>{["Lecture", "Tutorial", "Practical lab"].map((type) => <MenuItem value={type} key={type}>{type}</MenuItem>)}</TextField>
              <TextField label="Day" select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })} fullWidth>{days.map((day) => <MenuItem value={day} key={day}>{day}</MenuItem>)}</TextField>
              <TextField label="Start time" type="time" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} required fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: "08:00", max: "16:59" }} />
              <TextField label="End time" type="time" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} required fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: "08:01", max: "17:00" }} />
            </div>
            <p className="tm-form-hint">Select a time between 8:00 AM and 5:00 PM. End time must be later than start time.</p>
          </DialogContent>
          <DialogActions className="tm-dialog-actions">
            {editingId && <Button color="error" startIcon={<Trash2 size={15} />} onClick={() => setDeleteCandidate(sessions.find((session) => session.id === editingId))}>Delete</Button>}
            <span />
            <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={editingId ? <CheckCircle2 size={15} /> : <Plus size={15} />}>{editingId ? "Save changes" : "Add session"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={canManage && subjectDialogOpen} onClose={() => setSubjectDialogOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={saveSubject}>
          <DialogTitle>Add a subject to the catalog</DialogTitle>
          <DialogContent>
            <div className="tm-session-form tm-subject-form">
              <TextField label="Subject name" value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} required autoFocus fullWidth />
              <TextField label="Branch" select value={subjectForm.branch} onChange={(event) => setSubjectForm({ ...subjectForm, branch: event.target.value })} fullWidth>{branches.map((branch) => <MenuItem value={branch} key={branch}>{branch}</MenuItem>)}</TextField>
              <TextField label="Year" select value={subjectForm.year} onChange={(event) => setSubjectForm({ ...subjectForm, year: event.target.value })} fullWidth>{years.map((year) => <MenuItem value={year} key={year}>{year}</MenuItem>)}</TextField>
              <TextField label="Semester" select value={subjectForm.semester} onChange={(event) => setSubjectForm({ ...subjectForm, semester: event.target.value })} fullWidth>{semesters.map((semester) => <MenuItem value={semester} key={semester}>{semester}</MenuItem>)}</TextField>
            </div>
            <p className="tm-form-hint">Enter the subject name and choose its branch, year, and semester. A subject code is generated automatically.</p>
          </DialogContent>
          <DialogActions><Button onClick={() => setSubjectDialogOpen(false)}>Cancel</Button><Button type="submit" variant="contained" startIcon={<Plus size={15} />}>Add subject</Button></DialogActions>
        </form>
      </Dialog>

      <Dialog open={isStudent && subjectProposalOpen} onClose={() => setSubjectProposalOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={submitSubjectProposal}>
          <DialogTitle>Propose a subject for approval</DialogTitle>
          <DialogContent>
            <div className="tm-session-form tm-subject-form">
              <TextField label="Subject name" value={subjectProposal.name} onChange={(event) => setSubjectProposal({ ...subjectProposal, name: event.target.value })} required fullWidth />
              <TextField label="Subject code" value={subjectProposal.code} onChange={(event) => setSubjectProposal({ ...subjectProposal, code: event.target.value })} required fullWidth />
              <TextField label="Branch" select value={subjectProposal.branch} onChange={(event) => setSubjectProposal({ ...subjectProposal, branch: event.target.value })} fullWidth>{branches.map((branch) => <MenuItem value={branch} key={branch}>{branch}</MenuItem>)}</TextField>
              <TextField label="Year" select value={subjectProposal.year} onChange={(event) => setSubjectProposal({ ...subjectProposal, year: event.target.value })} fullWidth>{years.map((year) => <MenuItem value={year} key={year}>{year}</MenuItem>)}</TextField>
              <TextField label="Semester" select value={subjectProposal.semester} onChange={(event) => setSubjectProposal({ ...subjectProposal, semester: event.target.value })} fullWidth>{semesters.map((semester) => <MenuItem value={semester} key={semester}>{semester}</MenuItem>)}</TextField>
            </div>
            <p className="tm-form-hint">A teacher or administrator must approve the proposal before it is added to the shared catalog.</p>
          </DialogContent>
          <DialogActions><Button onClick={() => setSubjectProposalOpen(false)}>Cancel</Button><Button type="submit" variant="contained" startIcon={<Plus size={15} />}>Send for approval</Button></DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this session?</DialogTitle>
        <DialogContent><p className="tm-delete-copy">This removes <b>{deleteCandidate?.subject}</b> from the current timetable preview.</p></DialogContent>
        <DialogActions><Button onClick={() => setDeleteCandidate(null)}>Keep session</Button><Button color="error" variant="contained" onClick={confirmDelete}>Delete session</Button></DialogActions>
      </Dialog>
    </div>
  );
}
