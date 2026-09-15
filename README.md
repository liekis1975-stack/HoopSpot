# HoopSpot

## Krepšinio veiklų rezervavimo platforma

„HoopSpot“ – krepšinis vienoje vietoje: rezervuok vietą aikštelėje.

„HoopSpot“ – internetinė platforma, skirta krepšinio treniruotėms ir kitiems krepšinio užsiėmimams kurti bei rezervuoti. Vartotojas gali sukurti veiklą, peržiūrėti kitų vartotojų veiklas, rezervuoti laisvą vietą ir iki veiklos pradžios atšaukti savo rezervaciją.

Pirmoji versija skirta tik krepšinio veikloms. Tas pats vartotojas gali atlikti ir organizatoriaus, ir dalyvio veiksmus.

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