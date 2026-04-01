const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin:'*'
}));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Task Schema
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Added 'required' for safety
    priority: { type: String, default: 'Low' },
    completed: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', taskSchema);

// --- ROUTES ---

// 1. Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// 2. Create a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.status(201).json(newTask); // 201 means "Created"
    } catch (err) {
        res.status(400).json({ error: "Failed to create task" });
    }
});

// 3. Get count of pending tasks (For your notifications!)
app.get('/api/tasks/pending-count', async (req, res) => {
    try {
        const count = await Task.countDocuments({ completed: false });
        res.json({ pendingCount: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update a task (e.g., mark as completed)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Returns the updated document
        );
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

// 5. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: "Delete failed" });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});