"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./ParticipantActivities.module.css";

const activityFields = "id,title,activity_type,starts_at,ends_at,location,capacity,reserved_slots,status";
const dateFormat = new Intl.DateTimeFormat("lt-LT", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vilnius",
});

function errorMessage(error, cancelling) {
  const messages = {
    "Veikla nerasta": "Ši veikla neberasta. Atnaujinkite sąrašą.",
    "Veikla atšaukta": "Ši veikla atšaukta, todėl jos rezervuoti negalima.",
    "Veikla jau prasidėjo": "Veikla jau prasidėjo, todėl rezervuoti nebegalima.",
    "Veikla pilna": "Šioje veikloje laisvų vietų nebėra.",
    "Šioje veikloje jau turite aktyvią rezervaciją": "Šioje veikloje jau turite aktyvią rezervaciją.",
    "Rezervacija nerasta arba nepriklauso vartotojui": "Rezervacija nerasta arba nepriklauso jums.",
    "Rezervacija jau atšaukta": "Ši rezervacija jau atšaukta.",
    "Prasidėjusios veiklos rezervacijos atšaukti negalima": "Veikla jau prasidėjo, todėl rezervacijos atšaukti nebegalima.",
    "Rezervavimui reikia prisijungti": "Norėdami rezervuoti, prisijunkite iš naujo.",
    "Rezervacijos atšaukimui reikia prisijungti": "Norėdami atšaukti rezervaciją, prisijunkite iš naujo.",
  };
  if (error.code === "23505") return "Šioje veikloje jau turite aktyvią rezervaciją.";
  return messages[error.message] || (cancelling
    ? "Nepavyko atšaukti rezervacijos. Atnaujinkite sąrašą ir bandykite dar kartą."
    : "Nepavyko rezervuoti veiklos. Atnaujinkite sąrašą ir bandykite dar kartą.");
}

export default function ParticipantActivities({ reservationsOnly = false }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);
  const [pending, setPending] = useState(null);
  const locked = useRef(false);
  const requestVersion = useRef(0);
  const invalidateRequests = useCallback(() => {
    ++requestVersion.current;
  }, []);

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError("");
    try {
      const supabase = createClient();
      let query;
      if (reservationsOnly) {
        const { data, error } = await supabase.auth.getUser();
        if (version !== requestVersion.current) return;
        if (!data.user) {
          setItems([]);
          if (error && error.name !== "AuthSessionMissingError") throw error;
          router.replace("/login");
          return;
        }
        if (error) throw error;
        query = supabase.from("reservations")
          .select(`id,activity:activities(${activityFields})`)
          .eq("user_id", data.user.id).eq("status", "active")
          .order("reserved_at", { ascending: false });
      } else {
        query = supabase.from("activities").select(activityFields)
          .eq("status", "active").order("starts_at", { ascending: true });
      }
      const { data, error } = await query;
      if (error) throw error;
      if (version === requestVersion.current) setItems(data ?? []);
    } catch {
      if (version === requestVersion.current) {
        setItems([]);
        setLoadError("Nepavyko įkelti sąrašo. Patikrinkite interneto ryšį ir bandykite dar kartą.");
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [reservationsOnly, router]);

  useEffect(() => {
    // Run queries outside the Supabase auth callback to avoid auth lock contention.
    let timer = setTimeout(refresh, 0);
    const { data } = createClient().auth.onAuthStateChange(() => {
      invalidateRequests();
      if (reservationsOnly) setItems([]);
      clearTimeout(timer);
      timer = setTimeout(refresh, 0);
    });
    window.addEventListener("focus", refresh);
    return () => {
      invalidateRequests();
      clearTimeout(timer);
      data.subscription.unsubscribe();
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, reservationsOnly, invalidateRequests]);

  async function act(id) {
    if (locked.current) return;
    locked.current = true;
    setPending(id);
    setNotice(null);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getUser();
      if (!data.user && (!authError || authError.name === "AuthSessionMissingError")) {
        router.push("/login");
        return;
      }
      if (authError) throw authError;
      const { error } = reservationsOnly
        ? await supabase.rpc("cancel_reservation", { p_reservation_id: id })
        : await supabase.rpc("reserve_activity", { p_activity_id: id });
      if (error) throw error;
      setNotice({ error: false, text: reservationsOnly
        ? "Rezervacija sėkmingai atšaukta."
        : "Veikla sėkmingai rezervuota. Rezervaciją rasite puslapyje „Mano rezervacijos“." });
    } catch (error) {
      setNotice({ error: true, text: errorMessage(error, reservationsOnly) });
    } finally {
      await refresh();
      locked.current = false;
      setPending(null);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{reservationsOnly ? "Mano rezervacijos" : "Aktyvios veiklos"}</h1>
        <p>{reservationsOnly ? "Jūsų aktyvios rezervacijos ir veiklų informacija." : "Raskite krepšinio veiklą ir rezervuokite vietą."}</p>
        <p>Laikas rodomas Lietuvos laiko juostoje.</p>
        {reservationsOnly && <Link className={styles.link} href="/">Peržiūrėti veiklas</Link>}
      </header>
      {notice && <p className={notice.error ? styles.error : styles.success} role={notice.error ? "alert" : "status"}>{notice.text}</p>}
      {loading && <p role="status">{reservationsOnly ? "Kraunamos rezervacijos..." : "Kraunamos veiklos..."}</p>}
      {loadError && <div role="alert" className={styles.error}><p>{loadError}</p><button className={styles.button} onClick={refresh} disabled={loading || pending !== null}>Bandyti dar kartą</button></div>}
      {!loading && !loadError && items.length === 0 && <p className={styles.empty}>{reservationsOnly ? "Aktyvių rezervacijų dar neturite." : "Šiuo metu aktyvių veiklų nėra."}</p>}
      <div className={styles.grid} aria-busy={loading}>
        {items.map((item) => {
          const activity = reservationsOnly ? item.activity : item;
          const busy = pending === item.id;
          if (!activity) return <article className={styles.card} key={item.id}><h2>Veiklos informacija nepasiekiama</h2><p>Nepavyko gauti su rezervacija susijusios veiklos.</p><button className={styles.button} disabled={pending !== null || loading} onClick={() => act(item.id)}>{busy ? "Atšaukiama..." : "Atšaukti rezervaciją"}</button></article>;
          const remaining = activity.capacity - activity.reserved_slots;
          return (
            <article className={styles.card} key={item.id}>
              <h2>{activity.title}</h2>
              <dl className={styles.details}>
                <div><dt>Veiklos tipas</dt><dd>{activity.activity_type}</dd></div>
                <div><dt>Pradžia</dt><dd><time dateTime={activity.starts_at}>{dateFormat.format(new Date(activity.starts_at))}</time></dd></div>
                <div><dt>Pabaiga</dt><dd><time dateTime={activity.ends_at}>{dateFormat.format(new Date(activity.ends_at))}</time></dd></div>
                <div><dt>Vieta</dt><dd>{activity.location}</dd></div>
                <div><dt>Vietų skaičius</dt><dd>{activity.capacity}</dd></div>
                <div><dt>Liko vietų</dt><dd>{remaining}</dd></div>
              </dl>
              {activity.status === "cancelled" && <p>Veikla atšaukta.</p>}
              <button className={styles.button} type="button" disabled={pending !== null || loading || (!reservationsOnly && remaining <= 0)} onClick={() => act(item.id)}>
                {busy ? (reservationsOnly ? "Atšaukiama..." : "Rezervuojama...") : reservationsOnly ? "Atšaukti rezervaciją" : remaining <= 0 ? "Vietų nėra" : "Rezervuoti"}
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}
