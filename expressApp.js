
// Import Express
import express from 'express';

// Create Express application
const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Employee task array
let tasks = [
    {
        id: 1,
        taskName: "Develop Login Page",
        assignedTo: "Rahul Sharma",
        status: "Pending",
        priority: "High"
    },
    {
        id: 2,
        taskName: "Design Homepage",
        assignedTo: "Priya Verma",
        status: "Completed",
        priority: "Medium"
    },
    {
        id: 3,
        taskName: "Test REST API",
        assignedTo: "Amit Kumar",
        status: "In Progress",
        priority: "High"
    }
];

// Function to validate task details
function validateTask(data, requireAll = true) {

    const fields = [
        "taskName",
        "assignedTo",
        "status",
        "priority"
    ];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return false;
    }

    if (requireAll) {
        return fields.every(field =>
            typeof data[field] === "string" &&
            data[field].trim() !== ""
        );
    }

    return fields.some(field => field in data) &&
        Object.keys(data).every(field =>
            fields.includes(field) &&
            typeof data[field] === "string" &&
            data[field].trim() !== ""
        );
}

// B2: GET all employee tasks
app.get('/tasks', (req, res) => {

    res.status(200).json({
        message: "All employee tasks",
        tasks: tasks
    });

});

// B2: GET task by ID
app.get('/tasks/:id', (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.status(200).json(task);

});

// B2: POST - Add new task
app.post('/tasks', (req, res) => {

    const { id } = req.body;

    if (
        !Number.isInteger(id) ||
        id <= 0 ||
        !validateTask(req.body)
    ) {
        return res.status(400).json({
            message: "Provide a valid ID, taskName, assignedTo, status and priority"
        });
    }

    const existingTask = tasks.find(t => t.id === id);

    if (existingTask) {
        return res.status(409).json({
            message: "Task ID already exists"
        });
    }

    const newTask = {
        id: id,
        taskName: req.body.taskName.trim(),
        assignedTo: req.body.assignedTo.trim(),
        status: req.body.status.trim(),
        priority: req.body.priority.trim()
    };

    tasks.push(newTask);

    res.status(201).json({
        message: "Task added successfully",
        task: newTask
    });

});

// B2: PUT - Update task
app.put('/tasks/:id', (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (!validateTask(req.body, false)) {
        return res.status(400).json({
            message: "Provide at least one valid field to update"
        });
    }

    // Update only the supplied fields
    const allowedFields = [
        "taskName",
        "assignedTo",
        "status",
        "priority"
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            task[field] = req.body[field].trim();
        }
    });

    res.status(200).json({
        message: "Task updated successfully",
        task: task
    });

});

// B2: DELETE - Delete task
app.delete('/tasks/:id', (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid task ID"
        });
    }

    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const deletedTask = tasks.splice(index, 1);

    res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask[0]
    });

});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {

    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    res.status(500).json({
        message: "Internal Server Error"
    });

});

// Handle invalid routes
app.use((req, res) => {

    res.status(404).json({
        message: "API route not found"
    });

});

// Start Express server
app.listen(4000, () => {
    console.log("Express Server running at http://localhost:4000");
});
