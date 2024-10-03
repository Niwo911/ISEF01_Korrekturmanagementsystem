const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = 'mongodb+srv://niklaswolter:Name+Passwort der Datenbank, zur Sicherheit hier rausgenommen auf GitHub';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB verbunden!'))
    .catch(err => console.log('Fehler bei der MongoDB-Verbindung:', err));

const ticketSchema = new mongoose.Schema({
    kursID: String,
    title: String,
    mediaType: String,
    date: String,
    description: String,
    exactLocation: String,
    priority: String,
    name: String,
    course: String,
    matriculation: String,
    email: String,  
    status: { type: String, default: 'erfasst' },
    comments: [{ comment: String, date: Date }]
});

const Ticket = mongoose.model('Ticket', ticketSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === 'student' && password === 'student') {
        return res.json({ role: 'student', redirectUrl: '/student.html' });
    }

    if (username === 'agent' && password === 'agent') {
        return res.json({ role: 'agent', redirectUrl: '/agent.html' });
    }

    res.status(401).json({ message: 'Ungültige Anmeldedaten' });
});

app.get('/api/mytickets', async (req, res) => {
    try {
        const tickets = await Ticket.find({});
        res.status(200).json(tickets);
    } catch (err) {
        console.error('Fehler beim Abrufen der Tickets für den Studenten:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der Tickets' });
    }
});

// Aktualisierte Route für Agenten mit Such- und Filterfunktion
app.get('/api/tickets', async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status) {
            query.status = status;
        }

        const tickets = await Ticket.find(query);
        res.status(200).json(tickets);
    } catch (err) {
        console.error('Fehler beim Abrufen der Tickets für den Agenten:', err);
        res.status(500).json({ message: 'Fehler beim Abrufen der Tickets' });
    }
});

app.post('/api/tickets', async (req, res) => {
    try {
        const newTicket = new Ticket(req.body);
        const ticket = await newTicket.save();
        res.status(201).json(ticket);
    } catch (err) {
        console.error('Fehler beim Speichern des Tickets:', err);
        res.status(500).json({ message: 'Fehler beim Speichern des Tickets' });
    }
});

app.put('/api/tickets/:id', async (req, res) => {
    const { comment, status } = req.body;

    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { 
                $push: { comments: { comment: comment, date: new Date() } },
                status: status || 'in Bearbeitung'
            },
            { new: true }
        );
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket nicht gefunden' });
        }
        res.status(200).json(ticket);
    } catch (err) {
        console.error('Fehler beim Aktualisieren des Tickets:', err);
        res.status(500).json({ message: 'Fehler beim Aktualisieren des Tickets' });
    }
});

app.delete('/api/tickets/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket nicht gefunden' });
        }
        res.status(200).json({ message: 'Ticket gelöscht' });
    } catch (err) {
        console.error('Fehler beim Löschen des Tickets:', err);
        res.status(500).json({ message: 'Fehler beim Löschen des Tickets' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
