import { useEffect, useState } from "react";
import { Check, Clock3, GraduationCap, Mail, Phone, ShieldX, X } from "lucide-react";
import { Button } from "@mui/material";
import PageTitle from "./PageHeader.jsx";

export default function AccountRegistrationApprovals() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function loadRegistrations() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/registrations", { credentials: "same-origin" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load registration requests.");
      setRegistrations(result.registrations);
    } catch (loadError) {
      setError(loadError.message || "Could not load registration requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRegistrations();
  }, []);

  async function reviewRegistration(id, status) {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/registrations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this registration.");
      setRegistrations((current) => current.map((item) => item.id === id ? result.registration : item));
    } catch (reviewError) {
      setError(reviewError.message || "Could not update this registration.");
    } finally {
      setUpdatingId("");
    }
  }

  const pendingCount = registrations.filter((item) => item.status === "Pending").length;

  return <>
    <PageTitle
      eyebrow="ACCOUNT ACCESS"
      title="Account registration approvals"
      subtitle="Review teacher and student requests before allowing them to sign in."
    />
    <section className="account-approval-panel">
      <header className="account-approval-heading">
        <div><h2>Registration requests</h2><p>{pendingCount} pending approval{pendingCount === 1 ? "" : "s"}</p></div>
        <Button variant="outlined" onClick={() => void loadRegistrations()} disabled={loading}>Refresh</Button>
      </header>
      {error && <p className="account-approval-alert" role="alert">{error}</p>}
      {loading ? <div className="account-approval-empty"><Clock3 size={20} /><b>Loading requests</b></div>
        : registrations.length ? <div className="account-approval-list">
          {registrations.map((registration) => (
            <article className="account-approval-row" key={registration.id}>
              <span className="account-approval-avatar"><GraduationCap size={18} /></span>
              <div className="account-approval-copy">
                <b>{registration.name}<small>{registration.role}</small></b>
                <span><Mail size={13} />{registration.email}</span>
                <span><Phone size={13} />{registration.phone}</span>
                <small>Requested {new Date(registration.createdAt).toLocaleString()}</small>
              </div>
              <span className={`account-approval-status ${registration.status.toLowerCase()}`}>{registration.status}</span>
              {registration.status === "Pending" && <div className="account-approval-actions">
                <Button size="small" variant="contained" color="success" disabled={Boolean(updatingId)} startIcon={<Check size={14} />} onClick={() => void reviewRegistration(registration.id, "Approved")}>Approve</Button>
                <Button size="small" variant="outlined" color="error" disabled={Boolean(updatingId)} startIcon={<X size={14} />} onClick={() => void reviewRegistration(registration.id, "Rejected")}>Reject</Button>
              </div>}
              {registration.status === "Rejected" && <ShieldX className="account-approval-rejected-icon" size={18} aria-label="Rejected" />}
            </article>
          ))}
        </div> : <div className="account-approval-empty"><Check size={20} /><b>No registrations yet</b><span>New student and teacher requests will appear here.</span></div>}
    </section>
  </>;
}
