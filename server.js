const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added this for file paths
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// Tell Express to serve files from the 'public' folder
app.use(express.static(path.join(__currentDir, 'public'))); 

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- SCHEMAS ---
const Task = mongoose.model('Task', new mongoose.Schema({
    title: { type: String, required: true },
    priority: { type: String, default: 'medium' },
    completed: { type: Boolean, default: false }
}));

const Habit = mongoose.model('Habit', new mongoose.Schema({
    name: String,
    logs: [String],
    color: { type: String, default: '#00ff88' }
}));

const Event = mongoose.model('Event', new mongoose.Schema({
    title: String,
    event_date: String,
    event_time: String,
    color: String
}));

const Journal = mongoose.model('Journal', new mongoose.Schema({
    title: String,
    content: String,
    mood: String,
    entry_date: String
}));

// --- API ROUTES ---

// TASKS
app.get('/api/tasks', async (req, res) => res.json(await Task.find()));
app.post('/api/tasks', async (req, res) => res.json(await new Task(req.body).save()));
app.put('/api/tasks/:id', async (req, res) => res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/tasks/:id', async (req, res) => res.json(await Task.findByIdAndDelete(req.params.id)));

// HABITS
app.get('/api/habits', async (req, res) => res.json(await Habit.find()));
app.post('/api/habits', async (req, res) => res.json(await new Habit(req.body).save()));
app.post('/api/habits/:id/log', async (req, res) => {
    const habit = await Habit.findById(req.params.id);
    const { date } = req.body;
    habit.logs.includes(date) ? habit.logs = habit.logs.filter(d => d !== date) : habit.logs.push(date);
    await habit.save();
    res.json(habit);
});

// CALENDAR & JOURNAL
app.get('/api/events', async (req, res) => res.json(await Event.find()));
app.post('/api/events', async (req, res) => res.json(await new Event(req.body).save()));
app.get('/api/journal', async (req, res) => res.json(await Journal.find()));
app.post('/api/journal', async (req, res) => res.json(await new Journal(req.body).save()));

// --- THE FIX: CATCH-ALL ROUTE ---
// This ensures that if you refresh the page, it doesn't say "Cannot GET /"
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));