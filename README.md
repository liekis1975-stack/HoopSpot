# HoopSpot v1.1

## Krepšinio veiklų rezervavimo platforma

„HoopSpot“ – krepšinis vienoje vietoje: rezervuok vietą aikštelėje.

„HoopSpot“ – internetinė platforma, skirta krepšinio treniruotėms ir kitiems krepšinio užsiėmimams kurti bei rezervuoti. Vartotojas gali sukurti veiklą, peržiūrėti kitų vartotojų veiklas, rezervuoti laisvą vietą ir iki veiklos pradžios atšaukti savo rezervaciją.

Pirmoji versija skirta tik krepšinio veikloms. Tas pats vartotojas gali atlikti ir organizatoriaus, ir dalyvio veiksmus.

## Vieša versija

[Atidaryti HoopSpot Vercel platformoje](https://hoop-spot-eosin.vercel.app)

## Komandos atsakomybės

### Karolis – organizatoriaus funkcijos

- Krepšinio veiklų kūrimas.
- Veiklų redagavimas.
- Vietų skaičiaus nustatymas kuriant veiklą.
- „Mano veiklos“ ekranas.
- Tik veiklos kūrėjui matomo dalyvių sąrašo peržiūra.
- Organizatoriaus formų ir validacijų kūrimas.

Vėliau, apsikeitus darbais, Karolis dalyvio dalyje pridėjo būseną „Veikla atšaukta“.

### Mindaugas – dalyvio funkcijos

- Viešas krepšinio veiklų sąrašas.
- Veiklos detalių peržiūra.
- Vietos rezervavimas.
- Savo rezervacijos atšaukimas iki veiklos pradžios.
- „Mano rezervacijos“ ekranas.
- Prisijungimo ir dalyvio būsenų valdymas.

Vėliau, apsikeitus darbais, Mindaugas organizatoriaus dalyje pridėjo veiklos atšaukimo funkciją.

## Technologijos

- Next.js
- Supabase
- GitHub
- Vercel

## Versija

**v1.1**

Pakeitimai nuo pirmosios viešos versijos:

- organizatorius gali atšaukti savo sukurtą veiklą jos neištrindamas;
- dalyvio rezervacijose aiškiai rodoma būsena „Veikla atšaukta“;
- į atšauktą veiklą nebegalima rezervuoti vietos;
- patikrinta paskutinės vietos apsauga duomenų bazėje;
- testavimo rezultatai pateikti faile [TESTAI.md](TESTAI.md).

## Paleidimas lokaliai

1. Nuklonuokite projektą:

```bash
git clone https://github.com/liekis1975-stack/HoopSpot.git
cd HoopSpot
```

2. Įdiekite priklausomybes (reikalingi Node.js ir npm):

```bash
npm install
```

3. Projekto šakniniame kataloge sukurkite `.env.local` pagal `.env.example`:

```bash
cp .env.example .env.local
```

Faile naudojami šie aplinkos kintamieji (pavyzdyje reikšmės paliktos tuščios):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Į `.env.local` patys įrašykite bendro Supabase projekto reikšmes. Šį failą Git ignoruoja.

4. Paleiskite kūrimo serverį:

```bash
npm run dev
```

5. Naršyklėje atidarykite [http://localhost:3000](http://localhost:3000).

## Projekto dalys

- **Organizatoriaus dalis:** `app/activities/new/` (kūrimas), `app/activities/[id]/edit/` (redagavimas), `app/my-activities/` („Mano veiklos“), `components/activity-form/` (formos ir atšaukimas), `lib/organizer/` (serverio veiksmai, sesija ir validacija).
- **Dalyvio dalis:** `app/page.js` (viešas veiklų sąrašas), `app/my-reservations/` („Mano rezervacijos“), `components/ParticipantActivities.js` (veiklų peržiūra ir rezervacijų veiksmai). Registracija ir prisijungimas yra `app/register/` ir `app/login/`.

## Dokumentacija

- [Projekto įgyvendinimo planas – PLANAS.md](PLANAS.md)
- [Testavimo aprašymas ir rezultatai – TESTAI.md](TESTAI.md)
