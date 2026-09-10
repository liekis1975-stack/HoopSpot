"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event) { event.preventDefault(); setError(""); if (!email.trim() || !password) return setError("Užpildykite el. paštą ir slaptažodį."); setBusy(true); const { error: loginError } = await createClient().auth.signInWithPassword({ email: email.trim(), password }); setBusy(false); if (loginError) return setError("Neteisingas el. paštas arba slaptažodis."); router.push("/"); router.refresh(); }
  return <main className="auth-page"><section className="auth-card"><h1>Prisijungimas</h1><form onSubmit={submit}>
    <label>El. paštas<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>Slaptažodis<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="form-button" disabled={busy}>{busy ? "Jungiamasi..." : "Prisijungti"}</button>
  </form><p>Neturite paskyros? <Link href="/register">Registruokitės</Link>.</p></section></main>;
}
