import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { trackCtaClick } from "../utils/analytics.js";
import { submissionIdentity, unconfirmedInquiry } from "./inquirySubmission.js";
import "./home-form.css";

const emptyForm = { name: "", email: "", message: "" };
const limits = { name: 120, email: 254, message: 5000 };
const requestTimeout = 20000;

const validate = (values) => {
  const errors = {};
  if (!values.name.trim()) errors.name = "Add your name.";
  if (!values.email.trim()) errors.email = "Add your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Use a valid email address.";
  if (!values.message.trim()) errors.message = "Tell us a little about your project.";
  for (const [field, limit] of Object.entries(limits)) {
    if (values[field].trim().length > limit) errors[field] = `Use ${limit.toLocaleString()} characters or fewer.`;
  }
  return errors;
};

export default function HomeStartForm({ apiBase = "", source = "homepage-start", qualification = null }) {
  const formRef = useRef(null);
  const statusRef = useRef(null);
  const requestRef = useRef(null);
  const submissionRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const isLoading = status.state === "loading";
  const validity = validate(form);
  const completed = Object.keys(limits).filter((field) => form[field].trim() && !validity[field] && !errors[field]);
  const completion = completed.length === 3 ? "valid" : Object.values(form).some((value) => value.trim()) ? "partial" : "empty";
  const fieldState = (field) => errors[field] ? "error" : completed.includes(field) ? "complete" : "empty";

  useEffect(() => () => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(() => {
    if (status.state === "error") {
      const invalidField = formRef.current?.querySelector('[aria-invalid="true"]');
      (invalidField || statusRef.current)?.focus();
    } else if (status.state === "success") {
      statusRef.current?.focus();
    }
  }, [status]);

  const update = (event) => {
    if (requestRef.current) return;
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    if (status.state !== "idle") setStatus({ state: "idle", message: "" });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (requestRef.current || status.state === "success") return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ state: "error", message: "Check the highlighted fields and try again." });
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), requestTimeout);
    setStatus({ state: "loading", message: "Sending your project inquiry…" });
    trackCtaClick("Start a project", "/api/contacts/", { context: source === "homepage-start" ? "homepage_start" : "site_start" });

    try {
      const body = JSON.stringify({
        name: form.name.trim(), email: form.email.trim(), company: "",
        message: form.message.trim(), source,
        website: formRef.current?.elements.namedItem("website")?.value || "",
        ...(qualification ? { qualification } : {}),
      });
      submissionRef.current = submissionIdentity(submissionRef.current, body);
      const response = await fetch(`${apiBase}/api/contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": submissionRef.current.key },
        signal: controller.signal,
        body,
      });
      const payload = await response.json().catch(() => null);
      if (requestRef.current !== controller) return;
      if (!response.ok) {
        const fieldErrors = {};
        for (const field of Object.keys(limits)) {
          const detail = payload?.errors?.[field] ?? payload?.fields?.[field];
          if (typeof detail === "string") fieldErrors[field] = detail;
        }
        setErrors(fieldErrors);
        setStatus({ state: "error", message: Object.keys(fieldErrors).length
          ? "Check the highlighted fields and try again."
          : response.status === 429
            ? "Please wait before sending another inquiry, or email us below. Your details are still here."
            : unconfirmedInquiry });
        return;
      }
      if (payload?.ok !== true || !Number.isSafeInteger(payload.id) || payload.id <= 0) throw new Error("Unconfirmed delivery");

      submissionRef.current = null;
      setForm(emptyForm);
      setStatus({ state: "success", message: "Your project inquiry has been received." });
    } catch {
      if (requestRef.current !== controller) return;
      setStatus({ state: "error", message: unconfirmedInquiry });
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  return (
    <form
      ref={formRef}
      className="hp-start-form"
      data-state={status.state}
      data-completion={completion}
      aria-busy={isLoading}
      onSubmit={submit}
      noValidate
    >
      <span className="hp-start-form__delivery" aria-hidden="true"><i /><b /></span>
      {status.state === "success" ? (
        <div className="hp-start-form__success" ref={statusRef} tabIndex="-1" role="status">
          <span className="hp-system-label">Inquiry received</span>
          <h3>Received. The next step is a conversation.</h3>
          <p>We’ll review your project context and reply by email to discuss the next step.</p>
          <Link to="/start#next-step">Prepare for a conversation <span>(optional)</span><b aria-hidden="true">↗</b></Link>
        </div>
      ) : (
        <>
          <div hidden aria-hidden="true">
            <label>Leave this field empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <p className="hp-start-form__intro">Send the project context. We’ll reply by email to discuss the next step. <span>All three fields are required.</span></p>
          <label className="hp-form-field" data-field="01" data-state={fieldState("name")} htmlFor="start-name">
            <span className="hp-form-field__label"><b aria-hidden="true">01</b><span id="start-name-label">Name</span><i aria-hidden="true" /></span>
            <input
              id="start-name"
              name="name"
              value={form.name}
              onChange={update}
              autoComplete="name"
              maxLength={limits.name}
              readOnly={isLoading}
              required
              placeholder="Your name"
              aria-labelledby="start-name-label"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "start-name-error" : "start-name-help"}
            />
            {errors.name
              ? <small id="start-name-error" className="hp-field-note is-error">{errors.name}</small>
              : <small id="start-name-help" className="hp-field-note">Who should we reply to?</small>}
          </label>
          <label className="hp-form-field" data-field="02" data-state={fieldState("email")} htmlFor="start-email">
            <span className="hp-form-field__label"><b aria-hidden="true">02</b><span id="start-email-label">Email</span><i aria-hidden="true" /></span>
            <input
              id="start-email"
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              maxLength={limits.email}
              readOnly={isLoading}
              required
              placeholder="you@company.com"
              aria-labelledby="start-email-label"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "start-email-error" : "start-email-help"}
            />
            {errors.email
              ? <small id="start-email-error" className="hp-field-note is-error">{errors.email}</small>
              : <small id="start-email-help" className="hp-field-note">For the project conversation.</small>}
          </label>
          <label className="hp-form-field hp-start-form__brief" data-field="03" data-state={fieldState("message")} htmlFor="start-message">
            <span className="hp-form-field__label"><b aria-hidden="true">03</b><span id="start-message-label">Tell us about your project</span><i aria-hidden="true" /></span>
            <textarea
              id="start-message"
              name="message"
              value={form.message}
              onChange={update}
              rows="4"
              maxLength={limits.message}
              readOnly={isLoading}
              required
              placeholder="What are you building, improving, or trying to make work?"
              aria-labelledby="start-message-label"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "start-message-error" : "start-message-help"}
            />
            {errors.message
              ? <small id="start-message-error" className="hp-field-note is-error">{errors.message}</small>
              : <small id="start-message-help" className="hp-field-note">A few sentences are enough. No polished brief needed.</small>}
          </label>
          <p className="hp-start-form__privacy">
            We collect your name, email, and message to reply and discuss your project. Please don’t include sensitive personal information. This does not subscribe you to marketing. <Link to="/privacy">Privacy Policy</Link>
          </p>
          <div className="hp-start-form__submit">
            <button type="submit" disabled={isLoading}>
              <span>{isLoading ? "Sending your inquiry…" : "Start a project"}</span>
              <b aria-hidden="true">{isLoading ? "—" : "↗"}</b>
            </button>
            <p
              ref={statusRef}
              tabIndex="-1"
              className={`hp-start-form__status is-${status.state}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >{status.message}</p>
          </div>
        </>
      )}
    </form>
  );
}
