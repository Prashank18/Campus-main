import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, Download,
  FileText, History, MapPin, MessageSquareText, Plus, Search, Sparkles, Users, X,
} from "lucide-react";
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField,
} from "@mui/material";
import PageTitle from "../components/PageHeader.jsx";

const eventTypes = ["Lecture", "Workshop", "Seminar", "Meeting", "Cultural Event", "Technical Event", "Spectra Event"];
const priorities = ["Not configured", "Priority category A (placeholder)", "Priority category B (placeholder)"];
const bookingStatuses = ["Pending", "Approved", "Rejected", "Alternative Suggested"];
const facilityOptions = ["Projector", "Wi-Fi", "Smart Board", "AC", "Microphone", "Computers"];
const fallbackVenues = [
  { id: "AUD-01", name: "Main Auditorium", type: "Auditorium", capacity: 500, facilities: ["Projector", "Microphone", "AC"], status: "Available" },
  { id: "SH-A", name: "Seminar Hall A", type: "Seminar Hall", capacity: 120, facilities: ["Projector", "Wi-Fi", "Microphone", "AC"], status: "Available" },
  { id: "SH-B", name: "Seminar Hall B", type: "Seminar Hall", capacity: 75, facilities: ["Projector", "Wi-Fi"], status: "Available" },
  { id: "CS-01", name: "Lab CS-01", type: "Computer Lab", capacity: 50, facilities: ["Computers", "Projector", "Wi-Fi"], status: "Booked" },
  { id: "TH-01", name: "Campus Theatre", type: "Open-Air Theatre", capacity: 800, facilities: ["Microphone", "Wi-Fi"], status: "Available" },
];
const blankForm = (requester = "") => ({
  event: "",
  eventType: "Workshop",
  requestedBy: requester,
  date: "",
  start: "10:00",
  end: "13:00",
  venue: "",
  attendees: "",
  purpose: "",
  requiredFacilities: [],
  priority: "Not configured",
});

function readVenueOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem("campusOSVenues") || "null");
    return Array.isArray(saved) && saved.length
      ? saved.map((venue) => ({ ...venue, capacity: Number(venue.capacity) || 0, facilities: venue.facilities || [] }))
      : fallbackVenues;
  } catch {
    return fallbackVenues;
  }
}

function formatDate(dateValue, fallback = "Date not set") {
  if (!dateValue) return fallback;
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function clockLabel(time) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute || 0).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function getBookingPriority(booking) {
  return priorities.includes(booking.priority) ? booking.priority : "Not configured";
}

function getVenueType(booking, venues) {
  const matchedVenue = venues.find((venue) => venue.name === booking.venue);
  if (matchedVenue) return matchedVenue.type;
  const venueName = booking.venue?.toLowerCase() || "";
  if (/seminar hall/.test(venueName)) return "Seminar Hall";
  if (/auditorium/.test(venueName)) return "Auditorium";
  if (/lab|innovation/.test(venueName)) return "Computer Lab";
  if (/theatre|theater/.test(venueName)) return "Open-Air Theatre";
  return "Other";
}

function StatusBadge({ status }) {
  const safeStatus = status || "Pending";
  return <span className={`vb-status vb-status--${safeStatus.toLowerCase().replaceAll(" ", "-")}`}><i />{safeStatus}</span>;
}

function MetricCard({ title, count, icon: Icon, tone }) {
  return <article className={`vb-metric vb-metric--${tone}`}><span><Icon size={18} /></span><div><small>{title}</small><b>{count}</b></div></article>;
}

function BookingFields({ value, onChange, venues }) {
  const set = (key, nextValue) => onChange((current) => ({ ...current, [key]: nextValue }));
  return <div className="vb-form-grid">
    <TextField label="Event Name" value={value.event} onChange={(event) => set("event", event.target.value)} required fullWidth />
    <TextField label="Event Type" select value={value.eventType} onChange={(event) => set("eventType", event.target.value)} fullWidth>{eventTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>
    <TextField label="Requested By" value={value.requestedBy} onChange={(event) => set("requestedBy", event.target.value)} required fullWidth />
    <TextField label="Event Date" type="date" value={value.date} onChange={(event) => set("date", event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
    <TextField label="Start Time" type="time" value={value.start} onChange={(event) => set("start", event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
    <TextField label="End Time" type="time" value={value.end} onChange={(event) => set("end", event.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
    <TextField label="Preferred Venue" select value={value.venue} onChange={(event) => set("venue", event.target.value)} required fullWidth>
      {venues.map((venue) => <MenuItem key={venue.id} value={venue.name}>{venue.name} · {venue.capacity} seats</MenuItem>)}
    </TextField>
    <TextField label="Expected Participants" type="number" value={value.attendees} onChange={(event) => set("attendees", event.target.value)} required fullWidth inputProps={{ min: 1 }} />
    <TextField label="Priority Category" select value={value.priority} onChange={(event) => set("priority", event.target.value)} fullWidth>{priorities.map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}</TextField>
    <TextField label="Required Facilities" select value={value.requiredFacilities} onChange={(event) => set("requiredFacilities", event.target.value)} fullWidth SelectProps={{ multiple: true, renderValue: (selected) => selected.join(", ") }}>
      {facilityOptions.map((facility) => <MenuItem key={facility} value={facility}><Checkbox checked={value.requiredFacilities.includes(facility)} size="small" />{facility}</MenuItem>)}
    </TextField>
    <TextField className="vb-purpose-field" label="Purpose" value={value.purpose} onChange={(event) => set("purpose", event.target.value)} fullWidth multiline minRows={3} />
  </div>;
}

function parseRequest(text, venues, requester) {
  const lowered = text.toLowerCase();
  const monthNames = {
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
    may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8,
    september: 9, sep: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
  };
  let date = "";
  const isoDate = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  const dayMonth = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i);
  const monthDay = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (isoDate) date = `${isoDate[1]}-${isoDate[2].padStart(2, "0")}-${isoDate[3].padStart(2, "0")}`;
  else if (dayMonth || monthDay) {
    const match = dayMonth || monthDay;
    const day = Number(dayMonth ? match[1] : match[2]);
    const monthKey = (dayMonth ? match[2] : match[1]).toLowerCase();
    const month = monthNames[monthKey] || monthNames[monthKey.slice(0, 3)];
    if (month && day > 0 && day < 32) date = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const timePattern = /(?:from|between)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|until|and|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const hinglishPattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:se|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = text.match(timePattern) || text.match(hinglishPattern);
  let start = "";
  let end = "";
  if (timeMatch) {
    const to24Hour = (hourValue, minuteValue, meridiem) => {
      let hour = Number(hourValue) % 12;
      if (meridiem?.toLowerCase() === "pm") hour += 12;
      return hour * 60 + Number(minuteValue || 0);
    };
    let startMinutes = to24Hour(timeMatch[1], timeMatch[2], timeMatch[3]);
    let endMinutes = to24Hour(timeMatch[4], timeMatch[5], timeMatch[6]);
    if (!timeMatch[3] && !timeMatch[6] && endMinutes <= startMinutes) endMinutes += 12 * 60;
    if (!timeMatch[3] && timeMatch[6]?.toLowerCase() === "pm" && startMinutes < 12 * 60) startMinutes += 12 * 60;
    start = `${String(Math.floor(startMinutes / 60) % 24).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}`;
    end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
  }
  const participantMatch = text.match(/\b(\d{1,4})\s*(?:students?|people|participants?|attendees?)\b/i);
  const venue = venues.find((item) => {
    const escapedName = item.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escapedName}\\b`, "i").test(lowered);
  })
    || (lowered.includes("seminar hall")
      ? venues.find((item) => item.name.toLowerCase() === "seminar hall a")
        || venues.find((item) => item.type === "Seminar Hall")
      : null)
    || (lowered.includes("auditorium") ? venues.find((item) => item.type === "Auditorium") : null)
    || venues[0];
  let event = "Venue booking request";
  let eventType = "Meeting";
  if (/spectra/.test(lowered)) { event = "Spectra Event"; eventType = "Spectra Event"; }
  else if (/technical\s+workshop/.test(lowered)) { event = "Technical Workshop"; eventType = "Technical Event"; }
  else if (/workshop/.test(lowered)) { event = "Workshop"; eventType = "Workshop"; }
  else if (/seminar/.test(lowered)) { event = "Seminar"; eventType = "Seminar"; }
  else if (/lecture|class/.test(lowered)) { event = "Lecture"; eventType = "Lecture"; }
  else if (/cultural|concert|fest/.test(lowered)) { event = "Cultural Event"; eventType = "Cultural Event"; }
  else if (/meeting/.test(lowered)) { event = "Meeting"; eventType = "Meeting"; }

  return {
    event,
    eventType,
    requestedBy: requester,
    date,
    start,
    end,
    venue: venue?.name || "",
    attendees: participantMatch?.[1] || "",
    purpose: text.trim(),
    requiredFacilities: [],
    priority: "Not configured",
  };
}

function normalizeHistory(booking) {
  if (booking.history?.length) return booking.history;
  return [{
    status: booking.status || "Pending",
    by: booking.owner || "Requester",
    at: booking.date || "Previous request",
    note: booking.decisionReason || "History details are not available for this sample request.",
  }];
}

export default function VenueBookingManagement({ bookings = [], updateBooking, addBooking, notify, account }) {
  const [venues] = useState(readVenueOptions);
  const [activeTab, setActiveTab] = useState("Requests");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All venue types");
  const [eventTypeFilter, setEventTypeFilter] = useState("All event types");
  const [priorityFilter, setPriorityFilter] = useState("All priority categories");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState(() => blankForm(account?.name || ""));
  const [selectedId, setSelectedId] = useState(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiForm, setAiForm] = useState(null);
  const [aiParsed, setAiParsed] = useState(false);
  const [aiError, setAiError] = useState("");
  const isAdmin = account?.role === "administrator";

  const normalizedBookings = useMemo(() => bookings.map((booking) => ({
    ...booking,
    eventType: booking.eventType || "Meeting",
    requiredFacilities: booking.requiredFacilities || [],
    priority: getBookingPriority(booking),
  })), [bookings]);
  const selectedBooking = normalizedBookings.find((booking) => booking.id === selectedId);
  const counts = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "Pending").length,
    approved: bookings.filter((booking) => booking.status === "Approved").length,
    rejected: bookings.filter((booking) => booking.status === "Rejected").length,
    alternative: bookings.filter((booking) => booking.status === "Alternative Suggested").length,
  };
  const filteredBookings = useMemo(() => normalizedBookings.filter((booking) => (
    (statusFilter === "All statuses" || booking.status === statusFilter)
    && (typeFilter === "All venue types" || getVenueType(booking, venues) === typeFilter)
    && (eventTypeFilter === "All event types" || booking.eventType === eventTypeFilter)
    && (priorityFilter === "All priority categories" || booking.priority === priorityFilter)
    && (!dateFilter || booking.eventDate === dateFilter)
    && (!search.trim() || `${booking.id} ${booking.event}`.toLowerCase().includes(search.trim().toLowerCase()))
  )), [normalizedBookings, statusFilter, typeFilter, eventTypeFilter, priorityFilter, dateFilter, search, venues]);
  const historyBookings = normalizedBookings.filter((booking) => bookingStatuses.includes(booking.status));
  const spectraBookings = normalizedBookings.filter((booking) => booking.eventType === "Spectra Event" || booking.event.toLowerCase().includes("spectra"));
  const alternativeOptions = venues.filter((venue) => (
    venue.name !== selectedBooking?.venue
    && venue.capacity >= Number(selectedBooking?.people || 0)
    && venue.status === "Available"
  )).slice(0, 3);

  function openNewRequest() {
    setRequestForm(blankForm(account?.name || ""));
    setRequestDialogOpen(true);
  }

  function submitRequest(event) {
    event.preventDefault();
    if (requestForm.end <= requestForm.start) {
      notify("End time must be later than start time.");
      return;
    }
    if (requestForm.requiredFacilities.length && !requestForm.venue) {
      notify("Choose a preferred venue.");
      return;
    }
    addBooking(requestForm);
    setRequestDialogOpen(false);
    setRequestForm(blankForm(account?.name || ""));
  }

  function parsePrompt() {
    if (!aiPrompt.trim()) {
      setAiError("Enter a booking request to parse.");
      return;
    }
    setAiForm(parseRequest(aiPrompt, venues, account?.name || ""));
    setAiParsed(true);
    setAiError("");
  }

  function submitAiRequest(event) {
    event.preventDefault();
    if (!aiForm?.event || !aiForm.date || !aiForm.start || !aiForm.end || !aiForm.venue || !aiForm.attendees) {
      setAiError("Review the extracted fields and complete the required booking details.");
      return;
    }
    if (aiForm.end <= aiForm.start) {
      setAiError("End time must be later than start time.");
      return;
    }
    addBooking(aiForm);
    setAiPrompt("");
    setAiForm(null);
    setAiParsed(false);
    setAiError("");
  }

  function openDetails(booking) {
    setSelectedId(booking.id);
    setDecisionReason("");
    setShowAlternatives(false);
  }

  function decide(booking, status, defaultReason) {
    const reason = decisionReason.trim() || defaultReason;
    updateBooking(booking.id, status, reason);
    setDecisionReason("");
    if (status === "Alternative Suggested") setShowAlternatives(true);
  }

  function chooseAlternative(venue) {
    if (!selectedBooking) return;
    updateBooking(
      selectedBooking.id,
      "Alternative Suggested",
      `Sample alternative selected: ${venue.name}. Availability requires backend verification.`,
      { alternativeVenue: venue.name },
    );
  }

  function exportBookings() {
    const rows = [
      ["Booking ID", "Event", "Event Type", "Requested By", "Venue", "Date", "Start", "End", "Participants", "Priority", "Status"],
      ...filteredBookings.map((booking) => [
        booking.id, booking.event, booking.eventType, booking.owner, booking.venue,
        booking.eventDate || booking.date, booking.start || "", booking.end || "",
        booking.people, booking.priority, booking.status,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "venue-booking-requests.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    notify("Filtered booking requests exported.");
  }

  const activeBookings = activeTab === "History"
    ? historyBookings.filter((booking) => (
      (historyStatusFilter === "All statuses" || booking.status === historyStatusFilter)
      && (!search.trim() || `${booking.id} ${booking.event}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    : filteredBookings;

  return <div className="venue-booking-management">
    <PageTitle
      eyebrow="CAMPUS SPACES"
      title="Venue Booking Management"
      subtitle="Manage campus venue reservations and requests."
      action={<div className="vb-header-actions">
        <Button variant="outlined" startIcon={<Download size={16} />} onClick={exportBookings}>Export Bookings</Button>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={openNewRequest}>New Booking Request</Button>
      </div>}
    />

    <section className="vb-metrics" aria-label="Booking request summary">
      <MetricCard title="Total Requests" count={counts.total} icon={FileText} tone="blue" />
      <MetricCard title="Pending" count={counts.pending} icon={Clock3} tone="amber" />
      <MetricCard title="Approved" count={counts.approved} icon={CheckCircle2} tone="green" />
      <MetricCard title="Rejected" count={counts.rejected} icon={X} tone="red" />
      <MetricCard title="Alternative Suggested" count={counts.alternative} icon={MapPin} tone="violet" />
    </section>

    <section className="vb-ai-banner">
      <span className="vb-ai-icon"><Sparkles size={18} /></span>
      <div><b>Describe your booking in English or Hinglish</b><small>AI-style parsing is simulated locally. Review the extracted fields before submitting.</small></div>
      <button type="button" className={activeTab === "AI Request" ? "active" : ""} onClick={() => setActiveTab("AI Request")}>Open AI request <ArrowRight size={14} /></button>
    </section>

    <div className="vb-tabs" role="tablist" aria-label="Booking management views">
      {[
        ["Requests", CalendarDays, counts.total],
        ["AI Request", Sparkles, null],
        ["History", History, historyBookings.length],
      ].map(([tab, Icon, count]) => <button type="button" role="tab" aria-selected={activeTab === tab} key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}><Icon size={15} />{tab}{count !== null && <span>{count}</span>}</button>)}
    </div>

    {activeTab === "AI Request" ? <section className="vb-ai-workspace">
      <article className="vb-ai-composer">
        <div className="vb-section-heading"><div><span className="vb-eyebrow">SMART REQUEST</span><h2>Tell us what you need</h2><p>Include a venue, date, time, and expected participants.</p></div><span className="vb-ai-spark"><Sparkles size={18} /></span></div>
        <textarea value={aiPrompt} onChange={(event) => { setAiPrompt(event.target.value); setAiError(""); }} placeholder="e.g. Book Seminar Hall A for a technical workshop on 12 November from 10 AM to 1 PM for 100 students.&#10;&#10;Mujhe 12 November ko 10 se 1 baje tak 100 students ke liye seminar hall book karna hai." />
        <div className="vb-prompt-examples"><span>Try:</span><button type="button" onClick={() => setAiPrompt("Book Seminar Hall A for a technical workshop on 12 November from 10 AM to 1 PM for 100 students.")}>English example</button><button type="button" onClick={() => setAiPrompt("Mujhe 12 November ko 10 se 1 baje tak 100 students ke liye seminar hall book karna hai.")}>Hinglish example</button></div>
        <button type="button" className="vb-parse-button" onClick={parsePrompt}><Sparkles size={15} />Parse Request</button>
        {aiError && <div className="vb-inline-error"><AlertTriangle size={14} />{aiError}</div>}
        <small className="vb-local-note"><AlertTriangle size={13} /> Mock parser only. Extracted details are not checked against live availability.</small>
      </article>
      {aiParsed && aiForm && <form className="vb-ai-preview" onSubmit={submitAiRequest}>
        <div className="vb-preview-heading"><span><CheckCircle2 size={16} /></span><div><b>Booking preview</b><small>Needs Review · Edit any extracted detail before confirming.</small></div></div>
        <BookingFields value={aiForm} onChange={setAiForm} venues={venues} />
        {aiError && <div className="vb-inline-error"><AlertTriangle size={14} />{aiError}</div>}
        <div className="vb-ai-preview-actions"><Button variant="outlined" onClick={() => { setAiForm(null); setAiParsed(false); setAiError(""); }}>Cancel</Button><Button type="submit" variant="contained" startIcon={<Check size={15} />}>Confirm Request</Button></div>
      </form>}
    </section> : <section className="vb-table-panel">
      <div className="vb-table-heading">
        <div><span className="vb-eyebrow">{activeTab === "History" ? "DECISIONS & STATUS" : "REQUEST QUEUE"}</span><h2>{activeTab === "History" ? "Booking history" : "Booking requests"}</h2><p>{activeTab === "History" ? "Previous requests and their decisions." : "Review incoming reservations across campus."}</p></div>
        <div className="vb-table-heading-actions"><label className="vb-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search event or booking ID" /></label></div>
      </div>
      {activeTab !== "History" && <div className="vb-filter-row">
        <TextField select size="small" label="Booking status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{["All statuses", ...bookingStatuses].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>
        <TextField select size="small" label="Venue category" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>{["All venue types", ...[...new Set(venues.map((venue) => venue.type))]].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>
        <TextField type="date" size="small" label="Event date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField select size="small" label="Event type" value={eventTypeFilter} onChange={(event) => setEventTypeFilter(event.target.value)}>{["All event types", ...eventTypes].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>
        <TextField select size="small" label="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>{["All priority categories", ...priorities].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}</TextField>
      </div>}
      {activeTab === "History" && <div className="vb-history-filter"><span>View requests by current status</span><div>{["All statuses", ...bookingStatuses].map((status) => <button type="button" key={status} aria-pressed={historyStatusFilter === status} className={`vb-history-chip ${historyStatusFilter === status ? "is-active" : ""} ${status === "All statuses" ? "" : `vb-history-chip--${status.toLowerCase().replaceAll(" ", "-")}`}`} onClick={() => setHistoryStatusFilter(status)}>{status}<b>{status === "All statuses" ? historyBookings.length : historyBookings.filter((booking) => booking.status === status).length}</b></button>)}</div></div>}
      <div className="vb-table-scroll"><table className="vb-table">
        <thead><tr><th>BOOKING ID</th><th>EVENT NAME</th><th>REQUESTED BY</th><th>VENUE</th><th>DATE & TIME</th><th>PARTICIPANTS</th><th>PRIORITY</th><th>STATUS</th><th>ACTION</th></tr></thead>
        <tbody>{activeBookings.map((booking) => <tr key={booking.id}>
          <td><b className="vb-booking-id">{booking.id}</b></td>
          <td><span className="vb-event-cell"><b>{booking.event}</b><small>{booking.eventType || "Meeting"}</small></span></td>
          <td>{booking.owner || "Requester"}</td>
          <td><span className="vb-venue-cell"><MapPin size={13} />{booking.venue}</span>{booking.alternativeVenue && <small className="vb-alt-caption">Alt: {booking.alternativeVenue}</small>}</td>
          <td><span className="vb-date-cell">{booking.eventDate ? formatDate(booking.eventDate) : booking.date}</span><small className="vb-time-cell">{booking.start && booking.end ? `${clockLabel(booking.start)} – ${clockLabel(booking.end)}` : booking.time}</small></td>
          <td>{booking.people} people</td>
          <td><span className="vb-priority-placeholder">{booking.priority}</span></td>
          <td><StatusBadge status={booking.status} /></td>
          <td><button type="button" className="vb-view-button" onClick={() => openDetails(booking)}>View Details <ArrowRight size={13} /></button></td>
        </tr>)}</tbody>
      </table>
      {!activeBookings.length && <div className="vb-empty-state"><FileText size={23} /><b>No booking requests found</b><span>Change the filters or submit a new request.</span></div>}</div>
      <div className="vb-table-footer"><span>Showing {activeBookings.length} of {activeTab === "History" ? historyBookings.length : filteredBookings.length} requests</span><button type="button" onClick={exportBookings}><Download size={13} />Export filtered requests</button></div>
    </section>}

    <section className="vb-spectra-panel">
      <div className="vb-spectra-header"><span><Sparkles size={17} /></span><div><span className="vb-eyebrow">SPECIAL EVENT WINDOW</span><h2>Spectra Week</h2><p>Sample dates · November 9–15, 2026</p></div><b className="vb-policy-flag">Priority rules not configured</b></div>
      <div className="vb-spectra-policy"><AlertTriangle size={15} /><span>No Spectra priority ranking or approval rule is configured. Requests below use placeholder categories until the institution supplies its policy.</span></div>
      <div className="vb-spectra-requests">
        {spectraBookings.length ? spectraBookings.map((booking) => <article key={booking.id} className="vb-spectra-row">
          <span className="vb-spectra-date">{booking.eventDate ? formatDate(booking.eventDate) : booking.date}</span><span className="vb-spectra-event"><b>{booking.event}</b><small>{booking.id} · {booking.venue} · {booking.people} people</small></span>
          <span className="vb-spectra-priority"><small>Priority category</small><b>{booking.priority}</b></span><StatusBadge status={booking.status} />
          <span className="vb-spectra-reason">{booking.decisionReason || "Awaiting review; no decision reason recorded."}</span>
        </article>) : <div className="vb-spectra-empty">No Spectra requests have been submitted for the sample week.</div>}
        <div className="vb-placeholder-categories"><span>Placeholder category options:</span>{priorities.map((priority) => <b key={priority}>{priority}</b>)}</div>
      </div>
    </section>

    <Dialog className="vb-booking-dialog" open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} fullWidth maxWidth="md">
      <form onSubmit={submitRequest}>
        <DialogTitle>New Booking Request</DialogTitle>
        <DialogContent><p className="vb-dialog-intro">Provide the event details and venue requirements. The request will be added as pending for local review.</p><BookingFields value={requestForm} onChange={setRequestForm} venues={venues} /></DialogContent>
        <DialogActions><Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button><Button type="submit" variant="contained">Submit Request</Button></DialogActions>
      </form>
    </Dialog>

    <Dialog className="vb-booking-dialog" open={Boolean(selectedBooking)} onClose={() => setSelectedId(null)} fullWidth maxWidth="md">
      {selectedBooking && <div className="vb-details-dialog">
        <div className="vb-details-title"><div><span className="vb-eyebrow">BOOKING REQUEST · {selectedBooking.id}</span><h2>{selectedBooking.event}</h2><p>{selectedBooking.eventType || "Meeting"} · Requested by {selectedBooking.owner}</p></div><StatusBadge status={selectedBooking.status} /></div>
        <DialogContent>
          <div className="vb-detail-facts">
            <span><MapPin size={15} /><small>Requested venue</small><b>{selectedBooking.venue}</b></span>
            <span><CalendarDays size={15} /><small>Date & time</small><b>{selectedBooking.eventDate ? formatDate(selectedBooking.eventDate) : selectedBooking.date}</b><em>{selectedBooking.start && selectedBooking.end ? `${clockLabel(selectedBooking.start)} – ${clockLabel(selectedBooking.end)}` : selectedBooking.time}</em></span>
            <span><Users size={15} /><small>Participants</small><b>{selectedBooking.people} people</b></span>
            <span><FileText size={15} /><small>Priority category</small><b>{selectedBooking.priority}</b></span>
          </div>
          <div className="vb-detail-content-grid">
            <section className="vb-detail-box"><h3>Event information</h3><span><small>Purpose</small><b>{selectedBooking.purpose || "No purpose supplied."}</b></span><span><small>Required facilities</small><b>{selectedBooking.requiredFacilities?.length ? selectedBooking.requiredFacilities.join(", ") : "No additional facilities requested."}</b></span>{selectedBooking.alternativeVenue && <span><small>Suggested venue</small><b>{selectedBooking.alternativeVenue}</b></span>}</section>
            <section className="vb-detail-box"><h3>Decision explanation</h3><p>{selectedBooking.decisionReason || "No decision explanation recorded yet."}</p>{isAdmin && <TextField label="Decision reason" value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} fullWidth multiline minRows={2} placeholder="Explain the decision for the requester" />}</section>
          </div>
          {isAdmin && <div className="vb-decision-actions">
            <Button variant="contained" color="success" disabled={selectedBooking.status === "Approved"} onClick={() => decide(selectedBooking, "Approved", "Request approved.")}><Check size={15} />Approve</Button>
            <Button variant="outlined" color="error" disabled={selectedBooking.status === "Rejected"} onClick={() => decide(selectedBooking, "Rejected", "Request rejected.")}><X size={15} />Reject</Button>
            <Button variant="outlined" onClick={() => decide(selectedBooking, "Alternative Suggested", "A sample alternative venue is available for review.")}><MapPin size={15} />Suggest Alternative</Button>
          </div>}
          {showAlternatives && <section className="vb-alternatives"><div className="vb-alternatives-heading"><div><h3>Alternative venue suggestions</h3><p>Mock capacity and availability only. Verify with the booking team.</p></div><span><Sparkles size={14} />Suggestions</span></div>
            <div className="vb-alternative-grid">{alternativeOptions.map((venue) => <article key={venue.id} className="vb-alternative-card">
              <div><b>{venue.name}</b><small>{venue.type} · {venue.capacity} person capacity</small></div>
              <span className="vb-sample-availability"><i />Available · sample</span>
              <small>Requested: {selectedBooking.eventDate ? formatDate(selectedBooking.eventDate) : selectedBooking.date} · {selectedBooking.time}</small>
              <div className="vb-alt-facilities">{venue.facilities.slice(0, 3).map((facility) => <em key={facility}>{facility}</em>)}</div>
              {isAdmin && <Button size="small" variant="outlined" onClick={() => chooseAlternative(venue)}>Select Alternative</Button>}
            </article>)}
              {!alternativeOptions.length && <div className="vb-no-alternatives">No sample venues meet this request's capacity. This demo does not query actual availability.</div>}
            </div>
          </section>}
          <section className="vb-history-box"><h3><History size={15} />Booking history</h3><div className="vb-timeline">{normalizeHistory(selectedBooking).map((item, index) => <div key={`${item.status}-${index}`} className="vb-timeline-item"><i /><span><b>{item.status}</b><small>{item.at} · {item.by}</small><em>{item.note}</em></span></div>)}</div></section>
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedId(null)}>Close</Button></DialogActions>
      </div>}
    </Dialog>
  </div>;
}
