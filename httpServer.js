// Import built-in HTTP and FS modules
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Employee task array
let tasks = [
  {
    id: 1,
    taskName: "Develop Login Page",
    assignedTo: "Rahul Sharma",
    status: "Pending",
  },
  {
    id: 2,
    taskName: "Design Homepage",
    assignedTo: "Priya Verma",
    status: "Completed",
  },
  {
    id: 3,
    taskName: "Test API",
    assignedTo: "Amit Kumar",
    status: "In Progress",
  },
];

// Function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(data));
}

// Function to read JSON request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 100000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON format"));
      }
    });

    req.on("error", reject);
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // A1 and A2: Home route
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(`
            <h1>Welcome to Employee Task Management</h1>
            <p>Manage employee tasks easily.</p>
        `);
  }

  // A2 and A3: Get all tasks
  else if (req.method === "GET" && pathname === "/tasks") {
    sendJSON(res, 200, tasks);
  }

  // A2: About route
  else if (req.method === "GET" && pathname === "/about") {
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(`
            <h1>About Application</h1>
            <p>This application manages employee tasks.</p>
            <p>It is developed using Node.js HTTP and FS modules.</p>
        `);
  }

  // A4: Serve HTML file using FS module
  else if (req.method === "GET" && pathname === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        sendJSON(res, 500, {
          message: "Unable to read HTML file",
        });
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html",
      });

      res.end(data);
    });
  }

  // A3: Add new task using POST
  else if (req.method === "POST" && pathname === "/add-task") {
    try {
      const newTask = await readBody(req);

      const { id, taskName, assignedTo, status } = newTask;

      if (
        id === undefined ||
        id === null ||
        !Number.isInteger(Number(id)) ||
        !taskName?.trim() ||
        !assignedTo?.trim() ||
        !status?.trim()
      ) {
        sendJSON(res, 400, {
          message: "All fields (id, taskName, assignedTo, status) are required",
        });
        return;
      }

      if (tasks.some((task) => task.id === Number(id))) {
        sendJSON(res, 409, {
          message: "Task ID already exists",
        });
        return;
      }

      const task = {
        id: Number(id),
        taskName: taskName.trim(),
        assignedTo: assignedTo.trim(),
        status: status.trim(),
      };

      tasks.push(task);

      sendJSON(res, 201, {
        message: "Task added successfully",
        task: task,
      });
    } catch (error) {
      sendJSON(res, 400, {
        message: error.message,
      });
    }
  }

  // A5: Invalid route
  else {
    sendJSON(res, 404, {
      message: "404 - Route Not Found",
    });
  }
});

// Start HTTP server
server.listen(3000, () => {
  console.log("HTTP Server running at http://localhost:3000");
});
