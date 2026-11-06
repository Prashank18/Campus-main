import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Building2, GraduationCap, LockKeyhole, Mail, Phone, ShieldCheck,
} from "lucide-react";

const portals = [
  {
    id: "administrator",
    title: "Administrator",
    description: "Manage campus operations, spaces, schedules, and approvals.",
    icon: ShieldCheck,
    detail: "Campus operations",
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "View your teaching schedule, classes, and room assignments.",
    icon: BookOpen,
    detail: "Faculty workspace",
  },
  {
    id: "student",
    title: "Student",
    description: "Check your timetable, exams, and campus announcements.",
    icon: GraduationCap,
    detail: "Student portal",
  },
];

export default function Login() {
  const { role: roleId } = useParams();
  const role = portals.find((portal) => portal.id === roleId);
  const [authMode, setAuthMode] = useState(roleId === "administrator" ? "login" : "register");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAuthMode(roleId === "administrator" ? "login" : "register");
    setIdentifier("");
    setPassword("");
    setName("");
    setPhone("");
    setConfirmPassword("");
    setError("");
    setNotice("");
  }, [roleId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!role || submitting) return;
    setError("");
    setNotice("");
    if (role.id !== "administrator" && authMode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const registering = role.id !== "administrator" && authMode === "register";
      const response = await fetch(registering ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registering
          ? { role: role.id, name, phone, email: identifier, password }
          : { role: role.id, identifier, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to continue.");
      if (registering) {
        setNotice("Registration sent. You can sign in after an administrator approves your request.");
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        window.location.assign("/");
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to connect to the local authentication service.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <Link to="/login" className="login-brand">
          <span className="login-brand-mark"><Building2 size={19} /></span>
          <span>Campus<span>OS</span></span>
        </Link>
        <div className="login-story-copy">
          <span className="login-overline">IIT BHUBANESWAR</span>
          <h1>One campus.<br />Your space to thrive.</h1>
          <p>A connected home for the people, places, and plans that keep campus moving.</p>
        </div>
        <div className="login-story-art" aria-hidden="true">
          <div className="login-art-orbit orbit-one" />
          <div className="login-art-orbit orbit-two" />
          <div className="login-art-core"><Building2 size={34} /></div>
          <span className="login-art-node node-one"><BookOpen size={17} /></span>
          <span className="login-art-node node-two"><GraduationCap size={18} /></span>
          <span className="login-art-node node-three"><ShieldCheck size={16} /></span>
        </div>
        <div className="login-story-footer"><span>Campus operations suite</span><span>01 / 03</span></div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          {!role ? (
            <>
              <span className="login-overline">WELCOME BACK</span>
              <h2>Choose your portal</h2>
              <p className="login-intro">Select your account type to continue to the right workspace.</p>
              <div className="portal-list">
                {portals.map(({ id, title, description, icon: Icon, detail }) => (
                  <Link to={`/login/${id}`} className="portal-option" key={id}>
                    <span className={`portal-icon portal-${id}`}><Icon size={20} /></span>
                    <span className="portal-copy">
                      <b>{title}</b>
                      <small>{description}</small>
                    </span>
                    <span className="portal-detail">{detail}</span>
                    <ArrowRight className="portal-arrow" size={17} />
                  </Link>
                ))}
              </div>
              <p className="login-footnote"><LockKeyhole size={14} /> Your portal determines which workspace you enter.</p>
            </>
          ) : (
            <>
              <Link to="/login" className="login-back"><ArrowLeft size={15} /> All portals</Link>
              <span className="login-overline">{role.detail.toUpperCase()}</span>
              <h2>{role.id !== "administrator" && authMode === "register" ? `Register as ${role.title.toLowerCase()}` : `${role.title} sign in`}</h2>
              <p className="login-intro">{role.id === "administrator"
                ? "Sign in with the administrator credentials."
                : authMode === "register"
                  ? "First-time access requires administrator approval."
                  : "Sign in with your approved campus account."}</p>
              {notice && <p className="login-feedback success" role="status">{notice}</p>}
              {error && <p className="login-feedback error" role="alert">{error}</p>}
              <form className="login-form" onSubmit={handleSubmit}>
                {role.id !== "administrator" && authMode === "register" && <>
                  <label>
                    <span>Full name</span>
                    <span className="login-input-wrap"><GraduationCap size={17} /><input autoComplete="name" type="text" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} /></span>
                  </label>
                  <label>
                    <span>Phone number</span>
                    <span className="login-input-wrap"><Phone size={17} /><input autoComplete="tel" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={24} /></span>
                  </label>
                </>}
                <label>
                  <span>{role.id === "administrator" ? "Administrator ID" : role.id === "student" ? "Student email" : "Faculty email"}</span>
                  <span className="login-input-wrap">
                    {role.id === "student" && authMode === "register" ? <Mail size={17} /> : role.id === "administrator" ? <ShieldCheck size={17} /> : <Mail size={17} />}
                    <input
                      autoComplete={role.id === "administrator" ? "username" : "email"}
                      type={role.id === "administrator" ? "text" : "email"}
                      placeholder={role.id === "administrator" ? "Enter administrator ID" : "name@college.edu"}
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      required
                    />
                  </span>
                </label>
                <label>
                  <span>Password</span>
                  <span className="login-input-wrap">
                    <LockKeyhole size={17} />
                    <input
                      autoComplete={authMode === "register" ? "new-password" : "current-password"}
                      type="password"
                      placeholder={authMode === "register" ? "Create a password (10+ characters)" : "Enter your password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={authMode === "register" ? 10 : undefined}
                      required
                    />
                  </span>
                </label>
                {role.id !== "administrator" && authMode === "register" && <label>
                  <span>Confirm password</span>
                  <span className="login-input-wrap"><LockKeyhole size={17} /><input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></span>
                </label>}
                <button className="login-submit" type="submit" disabled={submitting}>
                  {submitting ? "Please wait..." : role.id !== "administrator" && authMode === "register" ? "Send registration for approval" : `Sign in to ${role.title.toLowerCase()}`}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </form>
              {role.id !== "administrator" && <button className="login-mode-switch" type="button" onClick={() => { setAuthMode((mode) => mode === "register" ? "login" : "register"); setError(""); setNotice(""); }}>
                {authMode === "register" ? "Already approved? Sign in" : "First time here? Register for approval"}
              </button>}
              {role.id === "administrator" && <p className="login-demo-note">Administrator credentials are verified by the local server.</p>}
              <Link to="/login" className="login-switch">Use a different portal</Link>
            </>
          )}
          <div className="login-legal">Need access help? Contact your campus administrator.</div>
        </div>
      </section>
    </main>
  );
}
