import React, { useState, useEffect } from "react";
import { FaPlus, FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./StudentsPage.css";

function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    age: "",
    phone: "",
    level: "1",
    startDate: new Date().toISOString().split("T")[0],
    paidMonths: [],
  });

  // Fetch all students
  useEffect(() => {
    fetch("http://localhost:5000/students")
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => console.error("❌ Error fetching students:", err));
  }, []);

  // Add student
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.age || !newStudent.phone) {
      alert("⚠️ Please fill all fields!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStudent,
          id: Date.now(),
          age: parseInt(newStudent.age),
          level: parseInt(newStudent.level),
        }),
      });

      const savedStudent = await res.json();
      setStudents([...students, savedStudent]);

      setNewStudent({
        name: "",
        age: "",
        phone: "",
        level: "1",
        startDate: new Date().toISOString().split("T")[0],
        paidMonths: [],
      });
      setShowModal(false);
    } catch (err) {
      console.error("❌ Error adding student:", err);
    }
  };

  // Filtering
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (levelFilter === "" || s.level === parseInt(levelFilter))
  );

  return (
    <div className="min-vh-100 bg-light-orange p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">
          🎓 <span className="text-orange">Students</span>
        </h1>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-orange"
            onClick={() => navigate("/")}
          >
            ⬅️ Back Home
          </button>
          <button
            className="btn btn-orange d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Add Student
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="row mb-4">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            placeholder="Search by name..."
            className="form-control stylish-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select stylish-input"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="row g-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div className="col-md-6" key={student.id}>
              <div className="student-card d-flex justify-content-between align-items-center p-3">
                <div>
                  <h5 className="mb-1 fw-bold">{student.name}</h5>
                  <small className="text-muted">Level {student.level}</small>
                </div>
                <button
                  className="btn btn-outline-orange"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <FaEllipsisH />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No students found.</p>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content p-4 rounded shadow-lg bg-white">
            <h3 className="fw-bold text-orange mb-3">➕ Add New Student</h3>

            <input
              type="text"
              placeholder="Name"
              className="form-control stylish-input mb-2"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Age"
              className="form-control stylish-input mb-2"
              value={newStudent.age}
              onChange={(e) =>
                setNewStudent({ ...newStudent, age: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Phone"
              className="form-control stylish-input mb-2"
              value={newStudent.phone}
              onChange={(e) =>
                setNewStudent({ ...newStudent, phone: e.target.value })
              }
            />

            <select
              className="form-select stylish-input mb-3"
              value={newStudent.level}
              onChange={(e) =>
                setNewStudent({ ...newStudent, level: e.target.value })
              }
            >
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>

            <div className="d-flex gap-2">
              <button
                className="btn btn-orange w-50"
                onClick={handleAddStudent}
              >
                Save
              </button>
              <button
                className="btn btn-outline-danger w-50"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;
