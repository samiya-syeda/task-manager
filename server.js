const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- SCHEMAS ---

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    priority: { type: String, default: 'medium' },
    completed: { type: Boolean, default: false }
});
const Task = mongoose.model('Task', taskSchema);

const habitSchema = new mongoose.Schema({
    name: String,
    logs: [String], // Array of dates like ["2026-04-01"]
    color: { type: String, default: '#00ff88' }
});
const Habit = mongoose.model('Habit', habitSchema);

const eventSchema = new mongoose.Schema({
    title: String,
    event_date: String,
    event_time: String,
    color: String
});
const Event = mongoose.model('Event', eventSchema);

const journalSchema = new mongoose.Schema({
    title: String,
    content: String,
    mood: String,
    entry_date: String
});
const Journal = mongoose.model('Journal', journalSchema);

// --- ROUTES ---

// TASKS
app.get('/api/tasks', async (req, res) => res.json(await Task.find()));
app.post('/api/tasks', async (req, res) => res.json(await new Task(req.body).save()));
app.put('/api/tasks/:id', async (req, res) => {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});
app.delete('/api/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// HABITS
app.get('/api/habits', async (req, res) => res.json(await Habit.find()));
app.post('/api/habits', async (req, res) => res.json(await new Habit(req.body).save()));
app.post('/api/habits/:id/log', async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        const { date } = req.body;
        if (habit.logs.includes(date)) {
            habit.logs = habit.logs.filter(d => d !== date);
        } else {
            habit.logs.push(date);
        }
        await habit.save();
        res.json(habit);
    } catch (err) { res.status(500).json(err); }
});

// CALENDAR/EVENTS
app.get('/api/events', async (req, res) => res.json(await Event.find()));
app.post('/api/events', async (req, res) => res.json(await new Event(req.body).save()));

// JOURNAL
app.get('/api/journal', async (req, res) => res.json(await Journal.find()));
app.post('/api/journal', async (req, res) => res.json(await new Journal(req.body).save()));

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));