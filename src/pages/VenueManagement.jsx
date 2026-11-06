import { useEffect, useMemo, useState } from "react";
import {
  Building2, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, ImagePlus,
  MapPin, Pencil, Plus, Search, Settings2, Trash2, Users, X,
} from "lucide-react";
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,
  TextField,
} from "@mui/material";
import PageTitle from "../components/PageHeader.jsx";

const venueTypes = ["Classroom", "Computer Lab", "Seminar Hall", "Auditorium", "Open-Air Theatre"];
const facilityOptions = ["Projector", "Wi-Fi", "Smart Board", "AC", "Microphone", "Computers"];
const floorOptions = ["Ground floor", "1st floor", "2nd floor", "3rd floor", "Outdoor"];
const statusOptions = ["Available", "Booked", "Maintenance"];
const hours = Array.from({ length: 10 }, (_, index) => index + 8);
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialVenues = [
  { id: "C-101", name: "Room C-101", type: "Classroom", building: "Academic Block C", floor: "1st floor", capacity: 60, facilities: ["Projector", "Wi-Fi", "Smart Board", "AC"], status: "Available", description: "A bright, technology-enabled teaching room for lectures and seminars.", image: "", color: "blue" },
  { id: "CS-01", name: "Lab CS-01", type: "Computer Lab", building: "Computer Science Block", floor: "2nd floor", capacity: 50, facilities: ["Computers", "Projector", "Wi-Fi", "AC"], status: "Booked", description: "Computer laboratory with workstation access for practical classes.", image: "", color: "rose" },
  { id: "SH-A", name: "Seminar Hall A", type: "Seminar Hall", building: "Central Block", floor: "Ground floor", capacity: 120, facilities: ["Projector", "Wi-Fi", "Microphone", "AC"], status: "Available", description: "Flexible seminar seating with presentation and audio facilities.", image: "", color: "lavender" },
  { id: "AUD-01", name: "Main Auditorium", type: "Auditorium", building: "Arts & Events Center", floor: "Ground floor", capacity: 500, facilities: ["Projector", "Wi-Fi", "Microphone", "AC"], status: "Booked", description: "Main campus auditorium with stage, green room, and AV facilities.", image: "", color: "sand" },
  { id: "TH-01", name: "Campus Theatre", type: "Open-Air Theatre", building: "Central Green", floor: "Outdoor", capacity: 800, facilities: ["Microphone", "Wi-Fi"], status: "Available", description: "Open-air performance space for campus events and ceremonies.", image: "", color: "mint" },
  { id: "C-204", name: "Room C-204", type: "Classroom", building: "Academic Block C", floor: "2nd floor", capacity: 45, facilities: ["Projector", "Wi-Fi", "Smart Board"], status: "Available", description: "General teaching classroom with a smart board.", image: "", color: "blue" },
  { id: "ECE-02", name: "Electronics Lab 02", type: "Computer Lab", building: "Engineering Block", floor: "1st floor", capacity: 36, facilities: ["Computers", "Projector", "AC"], status: "Maintenance", description: "Electronics and embedded systems practical laboratory.", image: "", color: "rose" },
  { id: "SH-B", name: "Seminar Hall B", type: "Seminar Hall", building: "Central Block", floor: "2nd floor", capacity: 75, facilities: ["Projector", "Wi-Fi", "Microphone"], status: "Available", description: "Compact seminar space for workshops and department meetings.", image: "", color: "lavender" },
  { id: "AUD-02", name: "Mini Auditorium", type: "Auditorium", building: "Arts & Events Center", floor: "1st floor", capacity: 220, facilities: ["Projector", "Wi-Fi", "Microphone", "AC"], status: "Available", description: "Tiered seating for talks, screenings, and student presentations.", image: "", color: "sand" },
  { id: "TH-02", name: "Garden Amphitheatre", type: "Open-Air Theatre", building: "East Garden", floor: "Outdoor", capacity: 300, facilities: ["Microphone"], status: "Available", description: "A smaller outdoor venue surrounded by the campus gardens.", image: "", color: "mint" },
];

const venueEvents = {
  "C-101": [
    { day: 0, start: 9, end: 10.5, title: "Engineering lecture", detail: "CSE · 42 attendees", type: "class" },
    { day: 2, start: 11, end: 12.5, title: "Faculty workshop", detail: "Academic affairs · 28 attendees", type: "event" },
    { day: 4, start: 14, end: 16, title: "Project reviews", detail: "CSE · 36 attendees", type: "class" },
  ],
  "CS-01": [
    { day: 1, start: 8, end: 10, title: "Programming lab", detail: "CSE · 48 attendees", type: "class" },
    { day: 3, start: 13, end: 15, title: "Software workshop", detail: "CSE · 35 attendees", type: "event" },
  ],
  "SH-A": [
    { day: 0, start: 10, end: 11.5, title: "Department meeting", detail: "Computer Science · 32 attendees", type: "event" },
    { day: 2, start: 9, end: 12, title: "Research symposium", detail: "Research office · 90 attendees", type: "event" },
    { day: 4, start: 13, end: 15, title: "Seminar: applied AI", detail: "Open registration · 110 attendees", type: "event" },
  ],
  "AUD-01": [
    { day: 0, start: 10, end: 16, title: "Spectra 2026", detail: "Cultural committee · 420 attendees", type: "event" },
    { day: 3, start: 9, end: 11, title: "Faculty convocation", detail: "Administration · 300 attendees", type: "event" },
    { day: 4, start: 14, end: 15.5, title: "Guest lecture", detail: "Student affairs · 380 attendees", type: "event" },
  ],
  "TH-01": [
    { day: 2, start: 16, end: 18, title: "Open-air concert", detail: "Student union · 650 attendees", type: "event" },
    { day: 5, start: 10, end: 12, title: "Sports day", detail: "Athletics · 500 attendees", type: "event" },
  ],
  "ECE-02": [
    { day: 1, start: 8, end: 17, title: "Equipment maintenance", detail: "Facilities team · Room closed", type: "maintenance" },
  ],
};

const blankVenue = {
  name: "",
  id: "",
  type: "Classroom",
  building: "",
  floor: "Ground floor",
  capacity: "",
  facilities: [],
  status: "Available",
  description: "",
  image: "",
  color: "blue",
};

function readVenues() {
  try {
    const saved = JSON.parse(localStorage.getItem("campusOSVenues") || "null");
    return Array.isArray(saved) ? saved : initialVenues;
  } catch {
    return initialVenues;
  }
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatClock(hour) {
  const wholeHour = Math.floor(hour);
  const minutes = hour % 1 ? "30" : "00";
  return `${wholeHour % 12 || 12}:${minutes} ${wholeHour >= 12 ? "PM" : "AM"}`;
}

function StatusPill({ status }) {
  return <span className={`vm-status vm-status--${status.toLowerCase()}`}><i />{status}</span>;
}

function Stat({ label, value, tone, icon: Icon }) {
  return <article className={`vm-stat vm-stat--${tone}`}>
    <span className="vm-stat-icon"><Icon size={17} /></span>
    <span className="vm-stat-copy"><small>{label}</small><b>{value}</b></span>
  </article>;
}

export default function VenueManagement({ notify, account }) {
  const [venues, setVenues] = useState(readVenues);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [buildingFilter, setBuildingFilter] = useState("All buildings");
  const [capacityFilter, setCapacityFilter] = useState("Any capacity");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortOrder, setSortOrder] = useState("Default order");
  const [view, setView] = useState("Cards");
  const [selectedId, setSelectedId] = useState("AUD-01");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankVenue);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState("Details");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState("Week");
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [uploadError, setUploadError] = useState("");
  const isAdmin = account?.role === "administrator";

  useEffect(() => {
    try {
      localStorage.setItem("campusOSVenues", JSON.stringify(venues));
    } catch {
      notify("Browser storage is full; venue changes may not persist.");
    }
  }, [venues]);

  const buildings = useMemo(() => [...new Set(venues.map((venue) => venue.building).filter(Boolean))].sort(), [venues]);
  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return venues
      .filter((venue) => !normalizedQuery || `${venue.name} ${venue.id} ${venue.building} ${venue.type}`.toLowerCase().includes(normalizedQuery))
      .filter((venue) => typeFilter === "All types" || venue.type === typeFilter)
      .filter((venue) => buildingFilter === "All buildings" || venue.building === buildingFilter)
      .filter((venue) => statusFilter === "All statuses" || venue.status === statusFilter)
      .filter((venue) => {
        if (capacityFilter === "Under 50") return venue.capacity < 50;
        if (capacityFilter === "50–99") return venue.capacity >= 50 && venue.capacity < 100;
        if (capacityFilter === "100–299") return venue.capacity >= 100 && venue.capacity < 300;
        if (capacityFilter === "300+") return venue.capacity >= 300;
        return true;
      })
      .sort((left, right) => sortOrder === "Capacity: low to high"
        ? left.capacity - right.capacity
        : sortOrder === "Capacity: high to low"
          ? right.capacity - left.capacity
          : 0);
  }, [venues, query, typeFilter, buildingFilter, capacityFilter, statusFilter, sortOrder]);

  const selectedVenue = venues.find((venue) => venue.id === selectedId) || filteredVenues[0] || venues[0];
  const availableCount = venues.filter((venue) => venue.status === "Available").length;
  const bookedCount = venues.filter((venue) => venue.status === "Booked").length;
  const maintenanceCount = venues.filter((venue) => venue.status === "Maintenance").length;
  const selectedEvents = venueEvents[selectedVenue?.id] || [];
  const nextEvents = selectedEvents.slice(0, 3);
  const displayDays = calendarMode === "Day" ? [calendarDate] : Array.from({ length: 7 }, (_, index) => addDays(calendarDate, index - ((calendarDate.getDay() + 6) % 7)));

  function openAddVenue() {
    if (!isAdmin) {
      notify("Only administrators can add or edit campus venues.");
      return;
    }
    setEditingId(null);
    setForm(blankVenue);
    setUploadError("");
    setFormOpen(true);
  }

  function openEditVenue(venue) {
    if (!isAdmin) {
      notify("Only administrators can add or edit campus venues.");
      return;
    }
    setEditingId(venue.id);
    setForm({ ...blankVenue, ...venue, facilities: [...venue.facilities] });
    setUploadError("");
    setFormOpen(true);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be 2 MB or smaller for local browser storage.");
      return;
    }
    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.onerror = () => setUploadError("Could not read this image.");
    reader.readAsDataURL(file);
  }

  function saveVenue(event) {
    event.preventDefault();
    if (!isAdmin) return;
    const venue = {
      ...form,
      id: form.id.trim(),
      name: form.name.trim(),
      building: form.building.trim(),
      capacity: Number(form.capacity),
    };
    if (!venue.id || !venue.name || !venue.building || !venue.capacity) return;
    const duplicate = venues.some((item) => item.id.toLowerCase() === venue.id.toLowerCase() && item.id !== editingId);
    if (duplicate) {
      notify(`Venue ID ${venue.id} is already in use.`);
      return;
    }
    if (editingId) {
      setVenues((current) => current.map((item) => item.id === editingId ? venue : item));
      setSelectedId(venue.id);
      notify(`${venue.name} updated.`);
    } else {
      setVenues((current) => [...current, venue]);
      setSelectedId(venue.id);
      notify(`${venue.name} added to venue management.`);
    }
    setFormOpen(false);
  }

  function deleteVenue() {
    if (!isAdmin || !selectedVenue) return;
    const remaining = venues.filter((venue) => venue.id !== selectedVenue.id);
    setVenues(remaining);
    setSelectedId(remaining[0]?.id || "");
    setDeleteOpen(false);
    setDetailsOpen(false);
    notify(`${selectedVenue.name} deleted.`);
  }

  function updateStatus(status) {
    if (!isAdmin || !selectedVenue) return;
    setVenues((current) => current.map((venue) => venue.id === selectedVenue.id ? { ...venue, status } : venue));
    notify(`${selectedVenue.name} marked ${status.toLowerCase()}.`);
  }

  function exportVenues() {
    const columns = ["Venue ID", "Venue name", "Type", "Building", "Floor", "Capacity", "Facilities", "Status", "Description"];
    const rows = filteredVenues.map((venue) => [venue.id, venue.name, venue.type, venue.building, venue.floor, venue.capacity, venue.facilities.join("; "), venue.status, venue.description]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "campus-venues.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    notify("Venue list exported.");
  }

  function moveCalendar(direction) {
    setCalendarDate((current) => addDays(current, direction * (calendarMode === "Day" ? 1 : 7)));
  }

  function eventsForDay(date) {
    const weekday = (date.getDay() + 6) % 7;
    return selectedEvents.filter((item) => item.day === weekday);
  }

  const calendarRange = calendarMode === "Day"
    ? calendarDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })
    : `${formatShortDate(displayDays[0])} – ${displayDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return <div className="venue-management">
    <PageTitle
      eyebrow="CAMPUS SPACES"
      title="Venue Management"
      subtitle="Manage campus rooms, halls and facilities."
      action={<div className="vm-page-actions">
        <Button variant="outlined" startIcon={<Download size={16} />} onClick={exportVenues}>Export Venues</Button>
        {isAdmin && <Button variant="contained" startIcon={<Plus size={16} />} onClick={openAddVenue}>Add New Venue</Button>}
      </div>}
    />

    <section className="vm-stats" aria-label="Venue summary">
      <Stat label="Total venues" value={venues.length} tone="blue" icon={Building2} />
      <Stat label="Available venues" value={availableCount} tone="green" icon={MapPin} />
      <Stat label="Occupied venues" value={bookedCount} tone="amber" icon={Users} />
      <Stat label="Under maintenance" value={maintenanceCount} tone="red" icon={Settings2} />
    </section>

    <section className="vm-workspace">
      <aside className="vm-browser">
        <div className="vm-browser-head"><div><h2>Spaces</h2><span>{venues.length} campus venues</span></div><Building2 size={18} /></div>
        <label className="vm-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search venues or IDs..." /></label>
        <button type="button" className={`vm-location-row ${buildingFilter === "All buildings" ? "active" : ""}`} onClick={() => setBuildingFilter("All buildings")}>
          <span className="vm-location-icon"><Building2 size={17} /></span><span><b>All Locations</b><small>{venues.length} spaces</small></span>
        </button>
        <div className="vm-browser-list">
          {buildings.map((building) => (
            <div className="vm-building-group" key={building}>
              <button type="button" className={`vm-building-label ${buildingFilter === building ? "active" : ""}`} onClick={() => setBuildingFilter(building)}>
                <MapPin size={15} /><span>{building}</span><small>{venues.filter((venue) => venue.building === building).length}</small>
              </button>
              {venues.filter((venue) => venue.building === building).map((venue) => (
                <button type="button" key={venue.id} className={`vm-browser-venue ${selectedVenue?.id === venue.id ? "selected" : ""}`} onClick={() => { setSelectedId(venue.id); setDetailsOpen(true); setDetailsTab("Details"); }}>
                  <i className={`vm-type-dot ${venue.color}`} /><span>{venue.name}</span><small>{venue.capacity}</small>
                </button>
              ))}
            </div>
          ))}
          {filteredVenues.length === 0 && <div className="vm-no-results">No venues match this search.</div>}
        </div>
        {isAdmin && <button type="button" className="vm-add-location" onClick={openAddVenue}><Plus size={14} />Add a venue</button>}
      </aside>

      <div className="vm-main">
        <div className="vm-main-heading">
          <div><h2>IIT BHUBANESWAR</h2><p><MapPin size={13} /> Main campus <span>·</span> {filteredVenues.length} spaces</p></div>
          {isAdmin && <Button variant="contained" startIcon={<Plus size={15} />} onClick={openAddVenue}>Add Space</Button>}
        </div>
        <div className="vm-filter-row">
          <TextField select size="small" label="Venue type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {["All types", ...venueTypes].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Building" value={buildingFilter} onChange={(event) => setBuildingFilter(event.target.value)}>
            {["All buildings", ...buildings].map((building) => <MenuItem key={building} value={building}>{building}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Capacity" value={capacityFilter} onChange={(event) => setCapacityFilter(event.target.value)}>
            {["Any capacity", "Under 50", "50–99", "100–299", "300+"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Availability" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {["All statuses", ...statusOptions].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Sort capacity" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            {["Default order", "Capacity: low to high", "Capacity: high to low"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <div className="vm-view-toggle" role="group" aria-label="Venue layout">
            <button type="button" className={view === "Cards" ? "active" : ""} onClick={() => setView("Cards")}>Cards</button>
            <button type="button" className={view === "Table" ? "active" : ""} onClick={() => setView("Table")}>Table</button>
          </div>
        </div>

        {view === "Cards" ? <div className="vm-card-grid">
          {filteredVenues.map((venue) => (
            <article className={`vm-venue-card ${selectedVenue?.id === venue.id ? "selected" : ""}`} key={venue.id} onClick={() => setSelectedId(venue.id)}>
              <div className={`vm-card-art vm-card-art--${venue.color}`} style={venue.image ? { backgroundImage: `linear-gradient(180deg, #142c4310, #142c4372), url("${venue.image}")` } : undefined}>
                <span>{venue.type}</span>
                <button type="button" aria-label={`Edit ${venue.name}`} onClick={(event) => { event.stopPropagation(); openEditVenue(venue); }}><Settings2 size={15} /></button>
              </div>
              <div className="vm-card-content">
                <div className="vm-card-title"><span><b title={venue.name}>{venue.name}</b><small>{venue.id}</small></span><StatusPill status={venue.status} /></div>
                <p className="vm-card-location"><MapPin size={13} />{venue.building} · {venue.floor}</p>
                <p className="vm-card-capacity"><Users size={13} />{venue.capacity} person capacity</p>
                <div className="vm-facility-list">{venue.facilities.slice(0, 3).map((facility) => <span key={facility}>{facility}</span>)}{venue.facilities.length > 3 && <span>+{venue.facilities.length - 3}</span>}</div>
                <div className="vm-card-actions">
                  <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedId(venue.id); setDetailsTab("Details"); setDetailsOpen(true); }}>View Details</button>
                  <button type="button" aria-label={`Edit ${venue.name}`} onClick={(event) => { event.stopPropagation(); openEditVenue(venue); }}><Pencil size={14} />Edit</button>
                </div>
              </div>
            </article>
          ))}
          {filteredVenues.length === 0 && <div className="vm-empty-state"><Building2 size={24} /><b>No venues found</b><span>Try changing the search or filters.</span></div>}
        </div> : <div className="vm-table-wrap">
          <table className="vm-table"><thead><tr><th>Venue</th><th>Type</th><th>Building</th><th>Capacity</th><th>Facilities</th><th>Status</th><th /></tr></thead>
            <tbody>{filteredVenues.map((venue) => <tr key={venue.id}>
              <td><button className="vm-table-name" onClick={() => { setSelectedId(venue.id); setDetailsOpen(true); }}><b>{venue.name}</b><small>{venue.id}</small></button></td>
              <td>{venue.type}</td><td>{venue.building}<small className="vm-table-floor">{venue.floor}</small></td><td>{venue.capacity}</td>
              <td>{venue.facilities.slice(0, 2).join(", ")}{venue.facilities.length > 2 ? ` +${venue.facilities.length - 2}` : ""}</td>
              <td><StatusPill status={venue.status} /></td>
              <td><div className="vm-table-actions"><button onClick={() => { setSelectedId(venue.id); setDetailsOpen(true); }} aria-label="View details"><Search size={14} /></button><button onClick={() => openEditVenue(venue)} aria-label="Edit venue"><Pencil size={14} /></button></div></td>
            </tr>)}</tbody>
          </table>
          {filteredVenues.length === 0 && <div className="vm-empty-state"><b>No venues found</b></div>}
        </div>}

        <div className="vm-main-foot"><span>Showing {filteredVenues.length} of {venues.length} campus venues</span><button type="button" onClick={exportVenues}><Download size={13} />Export filtered list</button></div>
      </div>
    </section>

    <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="md">
      <form onSubmit={saveVenue}>
        <DialogTitle>{editingId ? "Edit venue" : "Add new venue"}</DialogTitle>
        <DialogContent>
          <div className="vm-form-grid">
            <TextField label="Venue Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required fullWidth />
            <TextField label="Venue ID" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} required fullWidth />
            <TextField label="Venue Type" select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} fullWidth>{venueTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</TextField>
            <TextField label="Building" value={form.building} onChange={(event) => setForm({ ...form, building: event.target.value })} required fullWidth />
            <TextField label="Floor" select value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} fullWidth>{floorOptions.map((floor) => <MenuItem key={floor} value={floor}>{floor}</MenuItem>)}</TextField>
            <TextField label="Seating Capacity" type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required fullWidth inputProps={{ min: 1 }} />
            <TextField label="Availability Status" select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} fullWidth>{statusOptions.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>
            <TextField label="Facilities" select value={form.facilities} onChange={(event) => setForm({ ...form, facilities: event.target.value })} fullWidth SelectProps={{ multiple: true, renderValue: (selected) => selected.join(", ") }}>
              {facilityOptions.map((facility) => <MenuItem key={facility} value={facility}><Checkbox checked={form.facilities.includes(facility)} size="small" /><span>{facility}</span></MenuItem>)}
            </TextField>
            <TextField className="vm-description-field" label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth multiline minRows={3} />
            <div className="vm-upload-field">
              <label htmlFor="venue-image"><ImagePlus size={17} /><span><b>Venue Image</b><small>PNG, JPG or WEBP · up to 2 MB</small></span><span className="vm-upload-button">Choose image</span></label>
              <input id="venue-image" type="file" accept="image/*" onChange={handleImageUpload} />
              {form.image && <div className="vm-upload-preview"><img src={form.image} alt="Venue preview" /><button type="button" onClick={() => setForm({ ...form, image: "" })} aria-label="Remove venue image"><X size={14} /></button></div>}
              {uploadError && <small className="vm-upload-error">{uploadError}</small>}
            </div>
          </div>
        </DialogContent>
        <DialogActions><Button onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit" variant="contained">{editingId ? "Save Venue" : "Save Venue"}</Button></DialogActions>
      </form>
    </Dialog>

    <Dialog open={detailsOpen && Boolean(selectedVenue)} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="lg">
      {selectedVenue && <div className="vm-details-dialog">
        <div className={`vm-details-cover vm-card-art--${selectedVenue.color}`} style={selectedVenue.image ? { backgroundImage: `linear-gradient(180deg, #142c4310, #142c4372), url("${selectedVenue.image}")` } : undefined}>
          <span className="vm-details-type">{selectedVenue.type}</span>
          <button type="button" onClick={() => setDetailsOpen(false)} aria-label="Close venue details"><X size={18} /></button>
        </div>
        <div className="vm-details-body">
          <div className="vm-details-heading"><div><span className="vm-details-id">VENUE {selectedVenue.id}</span><h2>{selectedVenue.name}</h2><p><MapPin size={14} />{selectedVenue.building} · {selectedVenue.floor}</p></div>
            <div className="vm-details-actions"><StatusPill status={selectedVenue.status} />{isAdmin && <Button variant="outlined" startIcon={<Pencil size={14} />} onClick={() => { setDetailsOpen(false); openEditVenue(selectedVenue); }}>Edit venue</Button>}</div>
          </div>
          <div className="vm-detail-tabs">{["Details", "Availability"].map((tab) => <button type="button" key={tab} className={detailsTab === tab ? "active" : ""} onClick={() => setDetailsTab(tab)}>{tab === "Availability" && <CalendarDays size={14} />}{tab}</button>)}</div>
          {detailsTab === "Details" ? <div className="vm-detail-grid">
            <div className="vm-detail-primary">
              <section className="vm-detail-section"><h3>Venue information</h3><p>{selectedVenue.description || "No description has been added for this venue."}</p>
                <div className="vm-detail-facts"><span><Users size={16} /><small>Seating capacity</small><b>{selectedVenue.capacity} people</b></span><span><Building2 size={16} /><small>Venue category</small><b>{selectedVenue.type}</b></span><span><MapPin size={16} /><small>Location</small><b>{selectedVenue.building}, {selectedVenue.floor}</b></span></div>
              </section>
              <section className="vm-detail-section"><h3>Available facilities</h3><div className="vm-detail-facilities">{selectedVenue.facilities.length ? selectedVenue.facilities.map((facility) => <span key={facility}>{facility}</span>) : <small>No facilities listed.</small>}</div></section>
              <section className="vm-detail-section"><div className="vm-detail-section-heading"><h3>Upcoming bookings</h3><button type="button" onClick={() => setDetailsTab("Availability")}>View calendar <ChevronRight size={14} /></button></div>
                {nextEvents.length ? <div className="vm-upcoming-list">{nextEvents.map((item, index) => <div key={`${item.title}-${index}`}><span className={`vm-upcoming-mark ${item.type}`} /><span><b>{item.title}</b><small>{weekDays[item.day]} · {formatClock(item.start)}–{formatClock(item.end)} · {item.detail}</small></span></div>)}</div> : <p className="vm-no-bookings">No upcoming bookings are listed for this venue.</p>}
              </section>
            </div>
            <aside className="vm-detail-side">
              <section className="vm-detail-section vm-status-control"><h3>Current availability</h3>{isAdmin ? <TextField label="Availability status" select size="small" value={selectedVenue.status} onChange={(event) => updateStatus(event.target.value)} fullWidth>{statusOptions.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField> : <StatusPill status={selectedVenue.status} />}</section>
              <section className="vm-maintenance-card"><span><Settings2 size={15} />Maintenance</span><b>{selectedVenue.status === "Maintenance" ? "Under maintenance" : "No active maintenance"}</b><small>{selectedVenue.status === "Maintenance" ? "Venue is temporarily unavailable. Check with campus facilities for the expected reopening date." : "There are no maintenance notices for this venue."}</small></section>
              {isAdmin && <button type="button" className="vm-delete-action" onClick={() => setDeleteOpen(true)}><Trash2 size={15} />Delete venue</button>}
            </aside>
          </div> : <div className="vm-availability">
            <section className="vm-calendar-panel">
              <div className="vm-calendar-toolbar">
                <div><h3>Venue availability</h3><p>{selectedVenue.name} · {selectedVenue.building}</p></div>
                <div className="vm-calendar-controls"><div className="vm-calendar-mode"><button className={calendarMode === "Day" ? "active" : ""} onClick={() => setCalendarMode("Day")}>Day View</button><button className={calendarMode === "Week" ? "active" : ""} onClick={() => setCalendarMode("Week")}>Week View</button></div>
                  <div className="vm-calendar-nav"><button type="button" aria-label="Previous date range" onClick={() => moveCalendar(-1)}><ChevronLeft size={16} /></button><b>{calendarRange}</b><button type="button" aria-label="Next date range" onClick={() => moveCalendar(1)}><ChevronRight size={16} /></button><button type="button" onClick={() => setCalendarDate(new Date())}>Today</button></div>
                </div>
              </div>
              <div className="vm-calendar-legend"><span><i className="booked" />Booked</span><span><i className="maintenance" />Maintenance</span><span><i className="available" />Available</span></div>
              <div className="vm-week-scroll"><div className={`vm-week-grid ${calendarMode === "Day" ? "day-mode" : ""}`}>
                <div className="vm-time-column"><div className="vm-calendar-head-cell">TIME</div>{hours.map((hour) => <div className="vm-time-label" key={hour}>{formatClock(hour)}</div>)}</div>
                {displayDays.map((date) => {
                  const events = eventsForDay(date);
                  return <div className="vm-day-column" key={date.toISOString()}>
                    <div className={`vm-calendar-head-cell ${date.toDateString() === calendarDate.toDateString() ? "selected" : ""}`}><b>{date.toLocaleDateString("en-US", { weekday: "short" })}</b><span>{date.getDate()}</span></div>
                    <div className="vm-day-track">{hours.map((hour) => <i key={hour} />)}
                      {events.map((item, index) => <div className={`vm-calendar-event ${item.type}`} key={`${item.title}-${index}`} style={{ top: `${(item.start - 8) * 58}px`, height: `${Math.max((item.end - item.start) * 58 - 3, 30)}px` }}>
                        <b>{item.title}</b><span>{formatClock(item.start)} – {formatClock(item.end)}</span><small>{item.detail}</small>
                      </div>)}
                    </div>
                  </div>;
                })}
              </div></div>
            </section>
            <aside className="vm-calendar-side"><div className="vm-mini-calendar-heading"><CalendarDays size={16} /><b>{calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</b></div>
              <div className="vm-mini-calendar">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span className="weekday" key={`${day}-${index}`}>{day}</span>)}{Array.from({ length: 35 }, (_, index) => {
                const date = addDays(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1), index - ((new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() + 6) % 7));
                const inMonth = date.getMonth() === calendarDate.getMonth();
                return <button type="button" key={date.toISOString()} className={`${inMonth ? "" : "outside"} ${date.toDateString() === calendarDate.toDateString() ? "active" : ""}`} onClick={() => { setCalendarDate(date); setCalendarMode("Day"); }}>{date.getDate()}</button>;
              })}</div>
              <div className="vm-calendar-note"><Clock3 size={14} /><span>Venue hours<b>8:00 AM – 6:00 PM</b></span></div>
              <div className="vm-calendar-note"><Users size={14} /><span>Capacity<b>{selectedVenue.capacity} people</b></span></div>
            </aside>
          </div>}
        </div>
      </div>}
    </Dialog>

    <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Delete venue?</DialogTitle><DialogContent><p className="vm-delete-copy">Delete <b>{selectedVenue?.name}</b> from the campus venue list? This cannot be undone.</p></DialogContent>
      <DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" variant="contained" onClick={deleteVenue}>Delete venue</Button></DialogActions>
    </Dialog>
  </div>;
}
