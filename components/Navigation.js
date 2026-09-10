"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (!error) router.push("/");
  }

  return (
    <nav className="site-nav" aria-label="Pagrindinė navigacija">
      <Link className="site-brand" href="/">HoopSpot</Link>
      <div className="site-nav-links">
        {!loading && user ? (
          <>
            <span className="user-status">Prisijungęs: {user.user_metadata?.display_name || user.email}</span>
            <button type="button" className="nav-button" onClick={signOut}>Atsijungti</button>
          </>
        ) : !loading ? (
          <>
            <Link href="/login">Prisijungti</Link>
            <Link href="/register">Registruotis</Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
