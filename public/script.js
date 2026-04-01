const API_URL = 'https://task-manager-p7x9.onrender.com/api/tasks';

// 1. Function to Add a Task
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const priorityInput = document.getElementById('priorityInput');

    if (!taskInput.value) return alert("Please type a task!");

    const newTask = {
        title: taskInput.value,
        priority: priorityInput.value,
        completed: false
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            taskInput.value = ''; // Clear input
            fetchTasks(); // Refresh the list
        }
    } catch (error) {
        console.error("Error adding task:", error);
    }
}

// 2. Function to Load Tasks from Render/MongoDB
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        const taskList = document.getElementById('taskList');
        
        taskList.innerHTML = ''; // Clear old list
        
        tasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = `
                <span>${task.title} [${task.priority}]</span>
                <button onclick="deleteTask('${task._id}')">🗑️</button>
            `;
            taskList.appendChild(div);
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// Load tasks when the page opens
fetchTasks();