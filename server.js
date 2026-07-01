const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'bookings.json');
const ADMIN_KEY = process.env.ADMIN_KEY || 'paint-admin-123'; // maathikonga production la

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());

// ---------- Simple JSON "database" helpers ----------
function readBookings() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    try {
        return JSON.parse(raw);
    } catch (err) {
        return [];
    }
}

function saveBookings(bookings) {
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2));
}

// ---------- Validation helpers ----------
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9+\-\s]{7,15}$/.test(phone);
}

// ---------- Routes ----------

// Health check
app.get('/', (req, res) => {
    res.send('PAINT Booking API is running...');
});

// Create a new booking
app.post('/api/book', (req, res) => {
    const { name, phone, email, service, date, time, message } = req.body;

    // Basic validation
    if (!name || !phone || !email || !service || !date || !time) {
        return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!isValidPhone(phone)) {
        return res.status(400).json({ message: 'Please enter a valid phone number.' });
    }

    // Don't allow booking a date/time that's already fully booked
    const bookings = readBookings();
    const conflict = bookings.find(
        (b) => b.date === date && b.time === time && b.status !== 'cancelled'
    );
    if (conflict) {
        return res.status(409).json({ message: 'This date & time slot is already booked. Please choose another slot.' });
    }

    const newBooking = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        service,
        date,
        time,
        message: message ? message.trim() : '',
        status: 'pending', // pending -> confirmed -> completed / cancelled
        createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    saveBookings(bookings);

    console.log(`New booking received: ${newBooking.name} - ${newBooking.service} on ${newBooking.date} ${newBooking.time}`);

    return res.status(201).json({
        message: 'Appointment booked successfully!',
        booking: newBooking
    });
});

// ---------- Admin routes (protected by a simple key) ----------
function checkAdmin(req, res, next) {
    const key = req.headers['x-admin-key'] || req.query.key;
    if (key !== ADMIN_KEY) {
        return res.status(401).json({ message: 'Unauthorized. Invalid admin key.' });
    }
    next();
}

// Get all bookings
app.get('/api/bookings', checkAdmin, (req, res) => {
    const bookings = readBookings();
    res.json(bookings);
});

// Get single booking
app.get('/api/bookings/:id', checkAdmin, (req, res) => {
    const bookings = readBookings();
    const booking = bookings.find((b) => b.id === req.params.id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
    }
    res.json(booking);
});

// Update booking status (confirm / cancel / complete)
app.patch('/api/bookings/:id/status', checkAdmin, (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const bookings = readBookings();
    const booking = bookings.find((b) => b.id === req.params.id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
    }

    booking.status = status;
    saveBookings(bookings);
    res.json({ message: 'Status updated.', booking });
});

// Delete a booking
app.delete('/api/bookings/:id', checkAdmin, (req, res) => {
    let bookings = readBookings();
    const exists = bookings.some((b) => b.id === req.params.id);
    if (!exists) {
        return res.status(404).json({ message: 'Booking not found.' });
    }
    bookings = bookings.filter((b) => b.id !== req.params.id);
    saveBookings(bookings);
    res.json({ message: 'Booking deleted.' });
});

// ---------- 404 handler ----------
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});

// ---------- Start server ----------
app.listen(PORT, () => {
    console.log(`PAINT Booking backend server started on http://localhost:${PORT}`);
});
