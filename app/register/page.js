"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", email: "", password: "", repeatPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); }

  async function submit(event) {
    event.preventDefault(); setMessage(""); setError("");
    if (!form.displayName.trim() || !form.email.trim() || !form.password) return setError("Užpildykite visus laukus.");
    if (form.password !== form.repeatPassword) return setError("Slaptažodžiai nesutampa.");
    if (form.password.length < 6) return setError("Slaptažodį turi sudaryti bent 6 simboliai.");
    setBusy(true);
    const { data, error: signUpError } = await createClient().auth.signUp({
      email: form.email.trim(), password: form.password,
      options: { data: { display_name: form.displayName.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (signUpError) return setError(signUpError.message || "Registracija nepavyko.");
    if (data.session) { router.push("/"); router.refresh(); }
    else setMessage("Registracija sėkminga. Patikrinkite el. paštą ir patvirtinkite paskyrą.");
  }

  return <main className="auth-page"><section className="auth-card"><h1>Registracija</h1><form onSubmit={submit}>
    <label>Rodomas vardas<input name="displayName" value={form.displayName} onChange={update} required /></label>
    <label>El. paštas<input name="email" type="email" value={form.email} onChange={update} required /></label>
    <label>Slaptažodis<input name="password" type="password" value={form.password} onChange={update} required /></label>
    <label>Pakartokite slaptažodį<input name="repeatPassword" type="password" value={form.repeatPassword} onChange={update} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
    <button className="form-button" disabled={busy}>{busy ? "Registruojama..." : "Registruotis"}</button>
  </form><p>Jau turite paskyrą? <Link href="/login">Prisijunkite</Link>.</p></section></main>;
}
