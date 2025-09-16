import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./data.json"; // text/json file for saving everything

// 👉 Helper: read file
function readData() {
  if (!fs.existsSync(FILE)) return { students: [], events: [], prices: {} };
  const raw = fs.readFileSync(FILE);
  return JSON.parse(raw);
}

// 👉 Helper: write file
function writeData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* ================================
   🔹 STUDENTS CRUD
================================ */
app.get("/students", (req, res) => {
  const data = readData();
  res.json(data.students);
});

// ✅ GET single student
app.get("/students/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const student = data.students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.post("/students", (req, res) => {
  const data = readData();

  // initialize paidMonths with 12 months (default = 0)
  const paidMonths = Array(12).fill(0);
  const sessions = Array(8).fill(false);

  const student = {
    id: Date.now(),
    ...req.body,
    paidMonths,
    sessions,
  };

  data.students.push(student);
  writeData(data);
  res.json(student);
});

app.put("/students/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);

  data.students = data.students.map((s) =>
    s.id === id
      ? {
          ...s,
          ...req.body,
          age: parseInt(req.body.age),
          level: parseInt(req.body.level),
          // ensure correct structure
          paidMonths: req.body.paidMonths || Array(12).fill(0),
          sessions: req.body.sessions || Array(8).fill(false),
        }
      : s
  );

  writeData(data);
  res.json({ success: true });
});

app.delete("/students/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  data.students = data.students.filter((s) => s.id !== id);
  writeData(data);
  res.json({ success: true });
});

/* ================================
   🔹 CALENDAR EVENTS CRUD
================================ */
app.get("/events", (req, res) => {
  const data = readData();
  res.json(data.events);
});

app.get("/events/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const event = data.events.find((e) => e.id === id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

app.post("/events", (req, res) => {
  const data = readData();
  const event = { id: Date.now(), ...req.body };
  data.events.push(event);
  writeData(data);
  res.json(event);
});

app.put("/events/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  data.events = data.events.map((e) =>
    e.id === id ? { ...e, ...req.body } : e
  );
  writeData(data);
  res.json({ success: true });
});

app.delete("/events/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  data.events = data.events.filter((e) => e.id !== id);
  writeData(data);
  res.json({ success: true });
});

/* ================================
   🔹 PRICES CRUD
================================ */
app.get("/prices", (req, res) => {
  const data = readData();
  res.json(data.prices || {});
});

app.put("/prices", (req, res) => {
  const data = readData();
  data.prices = req.body; // overwrite all prices
  writeData(data);
  res.json({ success: true, prices: data.prices });
});

/* ================================
   🔹 SERVER START
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log("✅ Server running on ${Host}")
);
