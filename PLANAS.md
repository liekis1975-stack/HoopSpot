# HoopSpot įgyvendinimo planas

## 1. Projekto tikslas

„HoopSpot“ – krepšinio treniruočių ir užsiėmimų rezervavimo platforma.

Pagrindinis srautas:

1. Prisijungęs vartotojas sukuria veiklą.
2. Kitas vartotojas ją pamato.
3. Rezervuoja vieną vietą.
4. Laisvų vietų skaičius sumažėja.
5. Vartotojas gali rezervaciją atšaukti iki veiklos pradžios.
6. Atšaukta vieta vėl tampa laisva.

Tas pats vartotojas gali būti ir veiklos kūrėjas, ir dalyvis.

Pirmoji versija skirta tik krepšinio veikloms.

## 2. Pagrindiniai ekranai

- Viešas veiklų sąrašas.
- Veiklos detalių puslapis.
- Registracijos ir prisijungimo puslapiai.
- Naujos veiklos kūrimo puslapis.
- „Mano veiklos“ puslapis.
- „Mano rezervacijos“ puslapis.
- Bendras navigacijos meniu.
- Įkėlimo, tuščio sąrašo ir klaidų būsenos.

Veiklos detalėse rodoma:

- pavadinimas;
- aprašymas;
- data ir laikas;
- vieta;
- kūrėjas;
- laisvų ir visų vietų skaičius;
- rezervavimo arba rezervacijos atšaukimo veiksmas;
- veiklos būsena.

Dalyvių sąrašą mato tik tos veiklos kūrėjas.

## 3. Rezervavimo taisyklės

- Neprisijungęs vartotojas gali peržiūrėti veiklas, bet negali rezervuoti.
- Vienas vartotojas vienoje veikloje gali turėti tik vieną aktyvią rezervaciją.
- Rezervuoti galima tik tada, kai veikla turi laisvų vietų.
- Rezervuoti galima tik neprasidėjusią veiklą.
- Rezervacijos atšaukimas leidžiamas tik iki veiklos pradžios.
- Atšaukti galima tik savo rezervaciją.
- Rezervacija padidina `reserved_slots` vienetu.
- Atšaukimas sumažina `reserved_slots` vienetu.
- `capacity` nustatomas kuriant veiklą ir vėliau nekeičiamas.
- Du žmonės, vienu metu bandantys rezervuoti paskutinę vietą, negali abu jos gauti.

Veiklos atšaukimas pirmame etape neįgyvendinamas.

Vėliau, apsikeitus darbais:

- Mindaugas pridės organizatoriaus veiklos atšaukimo funkciją.
- Karolis dalyvio dalyje parodys būseną „Veikla atšaukta“.

## 4. Technologijų paskirtis

- **Next.js** – puslapiai, maršrutai, formos, serverio logika ir vartotojo sąsaja.
- **Supabase** – duomenų bazė, vartotojų autentifikacija ir RLS prieigos taisyklės.
- **GitHub** – bendras kodas ir pakeitimų istorija.
- **Vercel** – Next.js aplikacijos build ir publikavimas.
- **RLS** – duomenų bazės taisyklės, nustatančios, kas gali matyti ar keisti duomenis.
- **RPC funkcija** – Supabase duomenų bazėje vykdoma saugi funkcija, atliekanti rezervaciją kaip vieną operaciją.

## 5. Supabase lentelės

### `profiles`

- `id` – susietas su Supabase Auth vartotoju.
- `display_name` – viešas vartotojo vardas.
- `created_at` – profilio sukūrimo laikas.

### `activities`

| Laukas | Paskirtis |
|---|---|
| `id` | Unikalus veiklos ID |
| `creator_id` | Veiklos kūrėjas |
| `title` | Veiklos pavadinimas |
| `description` | Veiklos aprašymas |
| `activity_type` | Veiklos tipas |
| `starts_at` | Pradžios data ir laikas |
| `ends_at` | Pabaigos data ir laikas |
| `location` | Veiklos vieta |
| `capacity` | Maksimalus vietų skaičius |
| `reserved_slots` | Aktyvių rezervacijų skaičius |
| `status` | Veiklos būsena |
| `created_at` | Sukūrimo laikas |
| `updated_at` | Paskutinio pakeitimo laikas |

`capacity` nustatomas tik kuriant veiklą. Redaguojant veiklą šis laukas nekeičiamas.

Pradinės veiklos:

- Krepšinio treniruotė – 8 vietos.
- Metimų treniruotė – 4 vietos.
- Individuali 1 prieš 1 treniruotė – 1 vieta.

### `reservations`

| Laukas | Paskirtis |
|---|---|
| `id` | Unikalus rezervacijos ID |
| `activity_id` | Susieta veikla |
| `user_id` | Rezervaciją atlikęs vartotojas |
| `status` | `active` arba `cancelled` |
| `reserved_at` | Rezervacijos laikas |
| `cancelled_at` | Atšaukimo laikas |
| `created_at` | Įrašo sukūrimo laikas |

Ryšiai:

- Vienas vartotojas gali sukurti daug veiklų.
- Viena veikla gali turėti daug rezervacijų.
- Vienas vartotojas gali turėti daug rezervacijų.
- Vienam vartotojui vienoje veikloje leidžiama tik viena aktyvi rezervacija.
- Naudojamas dalinis unikalus indeksas pagal `activity_id` ir `user_id`, kai rezervacija aktyvi.

## 6. Rezervavimo saugumas

Rezervacija vykdoma vienoje PostgreSQL transakcijoje:

1. Užrakinama veiklos eilutė.
2. Patikrinama, ar veikla dar neprasidėjo.
3. Patikrinama, ar yra laisvų vietų.
4. Patikrinama, ar vartotojas dar neturi rezervacijos.
5. Sukuriama rezervacija.
6. Padidinamas `reserved_slots`.

Tam numatomos funkcijos:

- `reserve_activity(activity_id)`
- `cancel_reservation(reservation_id)`

Tokiu būdu apsaugoma paskutinė vieta nuo dvigubo rezervavimo.

## 7. Supabase Auth ir RLS

- Registracija ir prisijungimas vykdomi per Supabase Auth.
- Tik prisijungęs vartotojas gali kurti veiklą.
- Kuriant veiklą `creator_id` turi sutapti su prisijungusio vartotojo ID.
- Tik veiklos kūrėjas gali redaguoti savo veiklą.
- `capacity` negali būti pakeistas po sukūrimo.
- Vartotojas mato savo rezervacijas.
- Veiklos kūrėjas mato savo veiklos dalyvių sąrašą.
- Kiti vartotojai dalyvių sąrašo nemato.
- Anoniminis vartotojas negali kurti rezervacijų.
- Rezervacijų tiesioginis keitimas iš kliento pusės ribojamas.
- Rezervavimas ir atšaukimas vykdomi per kontroliuojamas Supabase funkcijas.

Pirmajame etape veiklos atšaukimo mutacija nesuteikiama. Vėlesniame etape ją galės vykdyti tik veiklos kūrėjas.

## 8. Darbų pasidalijimas

### Karolis – organizatoriaus dalis

Pirmame etape Karolis kuria:

- krepšinio veiklos kūrimo formą;
- veiklos redagavimo formą;
- `capacity` nustatymą kuriant;
- „Mano veiklos“ ekraną;
- kūrėjui matomą dalyvių sąrašą;
- veiklos savininko validacijas.

Karolis pirmame etape nekuria veiklos atšaukimo funkcijos.

Planuojamos dalys:

- `app/activities/new`
- `app/activities/[id]/edit`
- `app/my-activities`
- `components/activity-form`
- `components/organizer-actions`

### Mindaugas – dalyvio dalis

Pirmame etape Mindaugas kuria:

- viešą krepšinio veiklų sąrašą;
- veiklos detalių puslapį;
- rezervavimo veiksmą;
- rezervacijos atšaukimą iki veiklos pradžios;
- „Mano rezervacijos“ ekraną;
- prisijungimo ir vartotojo būsenas.

Planuojamos dalys:

- `app/activities`
- `app/activities/[id]`
- `app/my-reservations`
- `components/activity-list`
- `components/reservation-button`
- `components/auth`

### Bendra integracijos zona

Abu kartu derins:

- Supabase klientus;
- Auth sesijos valdymą;
- TypeScript tipus;
- duomenų bazės migracijas;
- RLS taisykles;
- RPC funkcijas;
- navigaciją;
- bendras klaidų būsenas;
- testų infrastruktūrą.

## 9. Darbų atlikimo eilė

1. Patvirtinti laukus, taisykles ir navigaciją.
2. Sukurti GitHub repozitoriją ir Next.js projektą.
3. Sukurti Supabase projektą.
4. Sukurti lenteles, ryšius, indeksus ir RLS.
5. Sukurti rezervavimo ir rezervacijos atšaukimo RPC funkcijas.
6. Įkelti tris bandomąsias veiklas.
7. Karolis ir Mindaugas lygiagrečiai kuria savo dalis.
8. Sujungti Auth, navigaciją ir bendrus komponentus.
9. Prijungti realų rezervavimo srautą.
10. Ištestuoti vietų skaičių, RLS ir paskutinės vietos apsaugą.
11. Publikuoti aplikaciją per Vercel.
12. Apsikeisti darbais:
    - Mindaugas pridės veiklos atšaukimą organizatoriaus dalyje.
    - Karolis dalyvio dalyje parodys „Veikla atšaukta“.

## 10. Pirmos versijos ribos

Į MVP įtraukiama:

- registracija ir prisijungimas;
- krepšinio veiklų peržiūra;
- veiklos kūrimas ir redagavimas;
- nekintamas `capacity`;
- kūrėjui matomas dalyvių sąrašas;
- rezervavimas;
- rezervacijos atšaukimas iki veiklos pradžios;
- vietų skaičiaus atnaujinimas;
- RLS;
- trys bandomosios veiklos;
- bazinis responsive dizainas.

Į MVP neįtraukiama:

- veiklos atšaukimas;
- mokėjimai;
- el. pašto ir push pranešimai;
- laukiančiųjų eilė;
- pasikartojančios veiklos;
- administratoriaus skydas;
- žemėlapiai;
- vertinimai ir komentarai;
- nuotraukų įkėlimas;
- kalendoriaus sinchronizacija.

## 11. Testavimo planas

- Vietų skaičiaus ir datos validacijos testai.
- Testas, kad `capacity` negalima pakeisti.
- Testas, kad vartotojas negali rezervuoti du kartus.
- Testas, kad pilnos veiklos nebegalima rezervuoti.
- Testas, kad rezervaciją galima atšaukti tik iki veiklos pradžios.
- RLS testai su anonimine role ir dviem vartotojais.
- Testas, kad tik kūrėjas mato dalyvių sąrašą.
- Testas, kad vartotojas negali redaguoti svetimos veiklos.
- Konkurencinis paskutinės vietos rezervavimo testas.
- E2E scenarijus: registracija -> rezervacija -> vietų sumažėjimas -> atšaukimas -> vietos grįžimas.
- Mobiliojo ir desktop vaizdo patikrinimas.
- Prieš kiekvieną `Push`: lint, TypeScript patikra, testai ir build.

## 12. GitHub darbo eiga

- Abu dirba tik `main` šakoje.
- Papildomos šakos nenaudojamos.
- Pull Request nenaudojami.
- Git veiksmus abu atlieka per VS Code Source Control.
- Prieš darbą ir prieš `Push` atliekamas `Fetch` ir `Pull`.
- Po pakeitimų atliekami:
  - `Stage`;
  - `Commit`;
  - `Push`.
- Commit žinutės turi trumpai aprašyti pakeitimą.
- Jei kyla konfliktas, jis sprendžiamas VS Code Merge Editor.
- Po konflikto sprendimo testai paleidžiami iš naujo.
- Supabase migracijos numeruojamos ir jau pritaikytos migracijos neperrašomos.

## 13. Vercel publikavimo planas

1. GitHub repozitoriją prijungti prie Vercel.
2. Nustatyti:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Supabase Auth nustatymuose pridėti production domeną.
4. `main` šakos pakeitimai publikuojami į production.
5. Po kiekvieno svarbaus `Push` patikrinti Vercel deploymentą.
6. Po pirmo publikavimo patikrinti:
   - registraciją;
   - prisijungimą;
   - sesijos atkūrimą;
   - veiklų peržiūrą;
   - rezervavimą;
   - rezervacijos atšaukimą;
   - RLS;
   - Auth nukreipimus.
7. Duomenų bazės migracijos vykdomos kontroliuojamai per Supabase CLI arba migracijų procesą.

## 14. Sprendimai ir ribos

- Šiame etape programos kodas nekuriamas.
- Pirmoji HoopSpot versija skirta tik krepšinio veikloms.
- `capacity` nustatomas kuriant veiklą ir po sukūrimo nekeičiamas.
- Dalyvių sąrašas matomas tik veiklos kūrėjui.
- Rezervaciją galima atšaukti tik iki veiklos pradžios.
- Pirmajame etape veiklos atšaukimo nėra.
- Po apsikeitimo darbais Mindaugas pridės veiklos atšaukimą organizatoriaus dalyje, o Karolis dalyvio dalyje parodys „Veikla atšaukta“.
- GitHub darbai atliekami tik `main` šakoje per VS Code; prieš `Push` būtini `Fetch` ir `Pull`.
