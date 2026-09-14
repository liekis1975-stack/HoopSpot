# Organizatoriaus dalies tikrinimas

Automatinė validacija: `node --test tests/organizer-validation.test.mjs`.
Projekto patikros: `npm run lint` ir `npm run build`.

Naršyklėje (`npm run dev`):

1. Neprisijungę atidarykite `/my-activities` ir `/activities/new`: turi nukreipti į `/login`.
2. Prisijunkite vartotoju A. Navigacijoje pasirinkite „Mano veiklos“ → „Sukurti krepšinio veiklą“.
3. Įveskite pavadinimą, aprašymą, būsimą pradžią ir vėlesnę pabaigą, vietą bei 8 vietų limitą. Sukūrus sąraše turi būti rezervuota 0, laisva 8.
4. Pasirinkite „Redaguoti veiklą“. Pakeiskite pavadinimą ir aprašymą. Vietų limitas rodomas, bet neredaguojamas. Data ir vieta šiame etape taip pat neredaguojamos, pagal esamos schemos stulpelių teises.
5. Nukopijuokite redagavimo URL. Atskirame privačiame lange prisijunkite vartotoju B: jo „Mano veiklos“ neturi rodyti A veiklos, o A redagavimo URL turi grąžinti 404.
6. Patikrinkite praeities pradžią, pabaigą prieš pradžią, tuščią pavadinimą, nulį ir trupmeninį limitą: išsaugojimas neleidžiamas.
7. Kai bendroje bazėje yra aktyvių rezervacijų, atnaujinkite „Mano veiklos“: skaičiai gaunami iš `reserved_slots` ir `capacity`, dalyviai — tik iš aktyvių rezervacijų. Rezervavimo veiksmų šioje dalyje nėra.

Prieigos apsauga: serverio puslapiai ir veiksmas tikrina vartotoją per `auth.getUser()`, kūrėjo ID nustato serveris, redagavimo užklausa filtruoja pagal vartotojo ID. Duomenų bazės `activities_insert_own` ir `activities_update_own` RLS saugo tiesiogines užklausas; stulpelių teisės leidžia keisti tik `title` ir `description`; `activities_capacity_immutable` papildomai saugo limitą. Dalyvių puslapis užklausia tik savo veiklas, o RLS riboja rezervacijų skaitymą.

`organizer-access.sql` — papildomas duomenų bazės regresijos testas su trimis vartotojais ir anonimine role. Vykdyti atskiroje testinėje Supabase bazėje, pritaikius `001_initial_schema.sql`, administratoriaus teisėmis. Testiniai įrašai kuriami transakcijoje ir pabaigoje atšaukiami su `ROLLBACK`. Šis failas nėra migracija. Jei vykdymas sustoja ties klaida, sesijoje atlikite `ROLLBACK`. Testas tikrina kūrimą, svetimos veiklos keitimo draudimą, suklastotą kūrėją, nekintamą limitą ir dalyvių sąrašo prieigą.
