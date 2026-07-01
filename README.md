# PAINT Booking Backend

Unga `madhan_html2.html` file la irukura booking form ku (`fetch('http://localhost:5000/api/book')`) suitable ah Node.js + Express backend idhu.

## Setup pandra maadhiri (step by step)

1. Node.js install pannirukanum (v16+ recommended). Illa na https://nodejs.org la irundhu download pannikonga.
2. Intha `paint-backend` folder ah terminal la open pannunga.
3. Dependencies install pannunga:
   ```bash
   npm install
   ```
4. Server ah start pannunga:
   ```bash
   npm start
   ```
   Console la idhu maadhiri message varum:
   ```
   PAINT Booking backend server started on http://localhost:5000
   ```
5. Ippo unga `madhan_html2.html` file ah browser la open pannunga (double-click pannalam, live-server use pannalam). Booking form la fill panni submit pannina, appointment `bookings.json` file la save aagum, "Appointment Booked Successfully!" nu alert varum.

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/book` | Puthu booking create pandradhu (form submit) |
| GET | `/api/bookings` | Ella bookings ah pakkardhu (admin key venum) |
| GET | `/api/bookings/:id` | ஒரு booking details pakkardhu (admin key venum) |
| PATCH | `/api/bookings/:id/status` | Status update (`pending`/`confirmed`/`completed`/`cancelled`) |
| DELETE | `/api/bookings/:id` | Booking delete pandradhu |

Admin routes ku `x-admin-key` header illa `?key=` query param la key kudukanum. Default key: `paint-admin-123` (ithai `.env` la maathikonga production ku).

Example (curl):
```bash
curl "http://localhost:5000/api/bookings?key=paint-admin-123"
```

## Data eppadi store aagudhu?

Simple ah oru `bookings.json` file la store aagum (server folder la automatic ah create aagum). Chinna project/college project/local use ku idhu podhum. Real production site na, idha MongoDB/MySQL/PostgreSQL maadhiri real database ku maathikalam — sollunga, adhukum help pannuren.

## Validation & Safety features

- Required fields (name, phone, email, service, date, time) fill pannalana error varum.
- Email & phone format check pandrum.
- Same date + same time slot already booked na, adha thadukkum (double-booking prevent pannum, veroru user adha slot ah eduthirundha reject aagum).
- CORS enabled pannirukom, so unga HTML file ah edhu vachu open pannalum (file:// or live-server) backend ku connect aagum.

## Port maathanum na?

`server.js` file la `PORT` variable ah maathikonga, illa na terminal la run pandra podhu:
```bash
PORT=6000 npm start
```
Adhukku thakka unga HTML file la `fetch` URL ah maathanum (`http://localhost:6000/api/book`).
