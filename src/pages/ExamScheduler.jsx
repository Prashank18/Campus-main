import { useMemo, useState } from "react";
import {
  BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  Download, MapPin, Pencil, Plus, Trash2, Users,
} from "lucide-react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import PageTitle from "../components/PageHeader.jsx";

const branches = ["CSE", "ECE", "EEE", "Mechanical", "Civil"];
const years = ["First", "Second", "Third"];
const rooms = ["Exam Hall 1", "Exam Hall 2", "Main Auditorium", "Seminar Hall A", "Seminar Hall B", "CSE Lab-1", "ECE Lab-2"];
const examTypes = ["Mid-semester", "End-semester", "Supplementary", "Practical", "Viva"];

export const initialExamSchedule = [
  { id: "exam-cs201", code: "CS201", subject: "Data Structures & Algorithms", branch: "CSE", year: "Second", section: "A", type: "Mid-semester", date: "2026-11-12", start: "09:00", end: "12:00", room: "Main Auditorium", students: 240, status: "Scheduled" },
  { id: "exam-ec205l", code: "EC205L", subject: "Digital Electronics Lab", branch: "ECE", year: "Second", section: "B", type: "Practical", date: "2026-11-12", start: "13:30", end: "16:30", room: "Seminar Hall A", students: 120, status: "Scheduled" },
  { id: "exam-cs303", code: "CS303", subject: "Operating Systems", branch: "CSE", year: "Third", section: "A", type: "End-semester", date: "2026-11-13", start: "09:00", end: "12:00", room: "Exam Hall 1", students: 180, status: "Scheduled" },
  { id: "exam-me206l", code: "ME206L", subject: "Manufacturing Processes Lab", branch: "Mechanical", year: "Third", section: "B", type: "Practical", date: "2026-11-14", start: "13:30", end: "16:30", room: "CSE Lab-1", students: 64, status: "Scheduled" },
];

const blankExam = {
  code: "",
  subject: "",
  branch: "CSE",
  year: "Second",
  section: "A",
  type: "Mid-semester",
  date: "2026-11-16",
  start: "09:00",
  end: "12:00",
  room: rooms[0],
  students: "60",
  status: "Scheduled",
};

function dateLabel(value, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options);
}

function timeLabel(value) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function ExamScheduler({ canManage, subjects, exams, onSaveExam, onDeleteExam, notify }) {
  const [view, setView] = useState("Calendar");
  const [selectedType, setSelectedType] = useState("All exam types");
  const [selectedBranch, setSelectedBranch] = useState("All branches");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankExam);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 10, 1));

  const visibleExams = useMemo(() => exams
    .filter((exam) => selectedType === "All exam types" || exam.type === selectedType)
    .filter((exam) => selectedBranch === "All branches" || exam.branch === selectedBranch)
    .sort((left, right) => `${left.date}-${left.start}`.localeCompare(`${right.date}-${right.start}`)),
  [exams, selectedBranch, selectedType]);

  const monthLabel = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const calendarStart = new Date(firstOfMonth);
  calendarStart.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { date, key, exams: visibleExams.filter((exam) => exam.date === key) };
  });

  function openNewExam(date) {
    if (!canManage) return;
    setEditingId(null);
    setForm({ ...blankExam, date: date || `${monthKey(calendarMonth)}-16` });
    setDialogOpen(true);
  }

  function openEditExam(exam) {
    if (!canManage) return;
    setEditingId(exam.id);
    setForm({ ...exam, students: String(exam.students) });
    setDialogOpen(true);
  }

  function saveExam(event) {
    event.preventDefault();
    if (form.end <= form.start) {
      notify("Exam end time must be later than the start time.");
      return;
    }
    onSaveExam({
      ...form,
      id: editingId || `exam-${Date.now()}`,
      students: Number(form.students) || 0,
    });
    setCalendarMonth(new Date(`${form.date}T12:00:00`));
    setDialogOpen(false);
    notify(editingId ? "Exam timetable updated." : "Exam added to the timetable.");
  }

  function exportExams() {
    const columns = ["Exam type", "Date", "Subject code", "Subject", "Branch", "Year", "Section", "Start", "End", "Room", "Students"];
    const rows = visibleExams.map((exam) => [exam.type, exam.date, exam.code, exam.subject, exam.branch, exam.year, exam.section, exam.start, exam.end, exam.room, exam.students]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cit-exam-timetable.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${visibleExams.length} exam sessions.`);
  }

  const uniqueRooms = [...new Set([...rooms, ...exams.map((exam) => exam.room)])];
  const firstExam = visibleExams[0];

  return (
    <div className="exam-scheduler">
      <PageTitle
        eyebrow="ACADEMIC PLANNING"
        title="Examination scheduler"
        subtitle="Select an exam session type, choose dates on the calendar, and schedule subject assessments."
        action={
          <div className="exam-page-actions">
            <Button variant="outlined" startIcon={<Download size={16} />} onClick={exportExams}>Export</Button>
            {canManage && <Button variant="contained" startIcon={<Plus size={17} />} onClick={() => openNewExam()}>Schedule exam</Button>}
          </div>
        }
      />

      <section className="exam-summary-row">
        <div className="exam-summary"><span className="tiny-icon blue"><BookOpen size={16} /></span><span><b>{visibleExams.length}</b><small>Exams in this view</small></span></div>
        <div className="exam-summary"><span className="tiny-icon green"><MapPin size={16} /></span><span><b>{new Set(visibleExams.map((exam) => exam.room)).size}</b><small>Rooms assigned</small></span></div>
        <div className="exam-summary"><span className="tiny-icon orange"><Clock3 size={16} /></span><span><b>{firstExam ? dateLabel(firstExam.date, { month: "short", day: "numeric" }) : "—"}</b><small>Next scheduled exam</small></span></div>
        <div className="exam-summary"><span className="tiny-icon lavender"><Users size={16} /></span><span><b>{visibleExams.reduce((sum, exam) => sum + Number(exam.students || 0), 0).toLocaleString()}</b><small>Students appearing</small></span></div>
      </section>

      <article className="panel exam-table-panel">
        <div className="exam-controls">
          <TextField className="filter-select" select size="small" label="Exam session" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
            {["All exam types", ...examTypes].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField className="filter-select" select size="small" label="Branch" value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)}>
            {["All branches", ...branches].map((branch) => <MenuItem key={branch} value={branch}>{branch}</MenuItem>)}
          </TextField>
          <div className="segmented-control">{["Calendar", "Table"].map((item) => <button type="button" key={item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}</button>)}</div>
        </div>

        <div className="exam-calendar-heading">
          <div><span className="tm-eyebrow">EXAM TIMETABLE · {visibleExams.length} SCHEDULED</span><h2>{monthLabel}</h2><p>Choose an exam date, review the scheduled subjects, or add a new session.</p></div>
          <div className="week-control">
            <button type="button" className="icon-button mini" aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
            <b>{monthLabel}</b>
            <button type="button" className="icon-button mini" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
          </div>
        </div>

        {view === "Calendar" ? (
          <div className="exam-calendar-grid-scroll">
            <div className="exam-month-calendar">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div className="exam-month-weekday" key={day}>{day}</div>)}
              {calendarDays.map(({ date, key, exams: dayExams }) => (
                <div className={`exam-month-day ${date.getMonth() !== calendarMonth.getMonth() ? "outside" : ""}`} key={key}>
                  <button type="button" className="exam-month-date" onClick={() => canManage && openNewExam(key)} aria-label={`${canManage ? "Schedule exam on " : ""}${dateLabel(key)}`}>
                    {date.getDate()}{dayExams.length > 0 && <small>{dayExams.length} exam{dayExams.length === 1 ? "" : "s"}</small>}
                  </button>
                  <div className="exam-month-events">
                    {dayExams.slice(0, 2).map((exam) => (
                      <button type="button" className="exam-month-event" key={exam.id} onClick={() => canManage && openEditExam(exam)} title={`${exam.code} · ${exam.type} · ${timeLabel(exam.start)}`}>
                        <b>{exam.code}</b><span>{timeLabel(exam.start)} · {exam.room}</span>
                      </button>
                    ))}
                    {dayExams.length > 2 && <small className="exam-more-count">+{dayExams.length - 2} more</small>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table exam-table">
              <thead><tr><th>SUBJECT</th><th>SESSION</th><th>GROUP</th><th>DATE & TIME</th><th>EXAM VENUE</th><th>STUDENTS</th><th>STATUS</th>{canManage && <th>ACTIONS</th>}</tr></thead>
              <tbody>
                {visibleExams.map((exam) => (
                  <tr key={exam.id}>
                    <td><div className="subject-cell"><b>{exam.subject}</b><small>{exam.code}</small></div></td>
                    <td>{exam.type}</td>
                    <td>{exam.branch} · {exam.year} · {exam.section}</td>
                    <td>{dateLabel(exam.date)}<small className="table-subline">{timeLabel(exam.start)} – {timeLabel(exam.end)}</small></td>
                    <td><span className="venue-cell"><MapPin size={13} />{exam.room}</span></td>
                    <td>{exam.students}</td><td><span className="status status-scheduled"><i />{exam.status}</span></td>
                    {canManage && <td><div className="exam-row-actions"><button type="button" aria-label={`Edit ${exam.subject}`} onClick={() => openEditExam(exam)}><Pencil size={14} /></button><button type="button" aria-label={`Delete ${exam.subject}`} onClick={() => setDeleteCandidate(exam)}><Trash2 size={14} /></button></div></td>}
                  </tr>
                ))}
                {visibleExams.length === 0 && <tr><td colSpan={canManage ? 8 : 7} className="exam-empty-row">No exam sessions match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {view === "Calendar" && visibleExams.length === 0 && <p className="exam-calendar-empty">No exams match the selected session type and branch.</p>}
        <div className="table-footer"><span>{visibleExams.length} exam sessions · {canManage ? "You can schedule and edit exams." : "View-only access."}</span>{canManage && <button className="text-link" onClick={() => openNewExam()}>Schedule an exam <Plus size={14} /></button>}</div>
      </article>

      <div className="tm-footer-note"><CalendarDays size={15} /><span>Exam schedules are local frontend data in this prototype. Production access control, conflict validation, and publishing require backend support.</span></div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <form onSubmit={saveExam}>
          <DialogTitle>{editingId ? "Edit exam timetable" : "Schedule an exam"}</DialogTitle>
          <DialogContent>
            <div className="exam-form">
              <TextField label="Subject" select value={form.code} required onChange={(event) => {
                const subject = subjects.find((item) => item.code === event.target.value);
                setForm((current) => ({ ...current, code: subject?.code || "", subject: subject?.name || "", branch: subject?.branch || current.branch, year: subject?.year || current.year }));
              }}>
                {subjects.map((subject) => <MenuItem key={`${subject.code}-${subject.name}`} value={subject.code}>{subject.code} · {subject.name}</MenuItem>)}
              </TextField>
              <TextField label="Exam session type" select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{examTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>
              <TextField label="Branch" select value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })}>{branches.map((branch) => <MenuItem key={branch} value={branch}>{branch}</MenuItem>)}</TextField>
              <TextField label="Year" select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}>{years.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}</TextField>
              <TextField label="Section" select value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })}>{["A", "B", "C"].map((section) => <MenuItem key={section} value={section}>{section}</MenuItem>)}</TextField>
              <TextField label="Exam date" type="date" value={form.date} required onChange={(event) => setForm({ ...form, date: event.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="Start time" type="time" value={form.start} required onChange={(event) => setForm({ ...form, start: event.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="End time" type="time" value={form.end} required onChange={(event) => setForm({ ...form, end: event.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label="Room" select value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })}>{uniqueRooms.map((room) => <MenuItem key={room} value={room}>{room}</MenuItem>)}</TextField>
              <TextField label="Students" type="number" value={form.students} onChange={(event) => setForm({ ...form, students: event.target.value })} inputProps={{ min: 1 }} />
            </div>
            <p className="tm-form-hint">Select the exam date using the calendar field and choose the assessment session type. Scheduling and clash checks are frontend simulations.</p>
          </DialogContent>
          <DialogActions>
            {editingId && <Button color="error" startIcon={<Trash2 size={15} />} onClick={() => { setDeleteCandidate(exams.find((exam) => exam.id === editingId)); setDialogOpen(false); }}>Delete</Button>}
            <span className="exam-dialog-spacer" /><Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={editingId ? <CheckCircle2 size={15} /> : <Plus size={15} />}>{editingId ? "Save exam" : "Add exam"}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this exam?</DialogTitle>
        <DialogContent><p className="tm-delete-copy">This removes <b>{deleteCandidate?.subject}</b> from the exam timetable.</p></DialogContent>
        <DialogActions><Button onClick={() => setDeleteCandidate(null)}>Keep exam</Button><Button color="error" variant="contained" onClick={() => { onDeleteExam(deleteCandidate.id); setDeleteCandidate(null); notify("Exam removed from the timetable."); }}>Delete exam</Button></DialogActions>
      </Dialog>
    </div>
  );
}

export default ExamScheduler;
