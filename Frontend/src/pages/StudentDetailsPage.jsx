import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaEdit } from "react-icons/fa";

function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const allMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [sessions, setSessions] = useState(Array(8).fill(false));
  const [paidMonths, setPaidMonths] = useState(Array(12).fill(0));

  const [formData, setFormData] = useState({
    name: "",
    level: "1",
    age: "",
    phone: "",
    startDate: "",
  });

  // Fetch student
  useEffect(() => {
    fetch(`http://localhost:5000/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
        setPaidMonths(data.paidMonths || Array(12).fill(0));
        setSessions(data.sessions || Array(8).fill(false));
        setFormData({
          name: data.name,
          level: String(data.level),
          age: String(data.age),
          phone: data.phone,
          startDate: data.startDate,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching student:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <h3 className="text-center">⏳ Loading student...</h3>;
  if (!student)
    return <h2 className="text-center text-danger">❌ Student not found</h2>;

  const startDate = new Date(student.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 30);

  // Save updates to backend
  const saveUpdates = async (updated) => {
    const res = await fetch(`http://localhost:5000/students/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) setStudent(updated);
  };

  // Toggle session
  const toggleSession = (index) => {
    const newSessions = sessions.map((s, i) => (i === index ? !s : s));
    setSessions(newSessions);

    const updated = {
      ...student,
      sessions: newSessions,
      paidMonths, // keep numeric states
    };
    saveUpdates(updated);
  };

  // Toggle paid month (0 → 1 → 2 → 0)
  const togglePaid = (index) => {
    const newPaidMonths = paidMonths.map((p, i) =>
      i === index ? (p + 1) % 3 : p
    );
    setPaidMonths(newPaidMonths);

    const updated = {
      ...student,
      sessions,
      paidMonths: newPaidMonths, // save as numbers
    };
    saveUpdates(updated);
  };

  // Remove Student
  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove ${student.name}?`)) {
      await fetch(`http://localhost:5000/students/${student.id}`, {
        method: "DELETE",
      });
      navigate("/students");
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save form from modal
  const handleSave = async () => {
    const updated = {
      ...student,
      ...formData,
      age: parseInt(formData.age),
      level: parseInt(formData.level),
      sessions,
      paidMonths, // numeric states
    };
    await saveUpdates(updated);
    setShowModal(false);
  };

  return (
    <div className="container py-5">
      {/* Back Button */}
      <button className="btn btn-orange mb-3" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      {/* Student Card */}
      <div className="student-card p-4 shadow-lg position-relative">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold text-orange">{student.name}</h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-orange"
              onClick={() => setShowModal(true)}
            >
              <FaEdit /> Update
            </button>
            <button className="btn btn-danger" onClick={handleRemove}>
              <FaTrash /> Remove
            </button>
          </div>
        </div>

        <p>
          <strong>📚 Level:</strong> {student.level}
        </p>
        <p>
          <strong>🎂 Age:</strong> {student.age}
        </p>
        <p>
          <strong>📞 Phone:</strong> {student.phone}
        </p>
        <p>
          <strong>📅 Start Date:</strong> {startDate.toDateString()}
        </p>
        <p>
          <strong>📅 End Date:</strong> {endDate.toDateString()}
        </p>

        {/* Paid Months */}
        <h5 className="mt-4 mb-2">💰 Paid Months</h5>
        <div className="months-grid d-flex flex-wrap gap-2">
          {allMonths.map((month, idx) => {
            let bgColor = "#ffffff"; // default white
            let textColor = "#000"; // black text
            if (paidMonths[idx] === 1) {
              bgColor = "#28a745"; // green (paid)
              textColor = "white";
            } else if (paidMonths[idx] === 2) {
              bgColor = "#dc3545"; // red (not paid)
              textColor = "white";
            }

            return (
              <div
                key={month}
                onClick={() => togglePaid(idx)}
                style={{
                  width: "50px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  backgroundColor: bgColor,
                  color: textColor,
                  border: "1px solid #ccc",
                  transition: "0.3s",
                }}
              >
                {month}
              </div>
            );
          })}
        </div>

        {/* Session Attendance */}
        <h5 className="mt-4 mb-2">📌 Session Attendance (8)</h5>
        <div className="session-grid d-flex gap-2">
          {sessions.map((attended, idx) => (
            <div
              key={idx}
              onClick={() => toggleSession(idx)}
              style={{
                width: "40px",
                height: "40px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "5px",
                fontWeight: "bold",
                color: attended ? "white" : "#000",
                backgroundColor: attended ? "#28a745" : "#ffffff",
                border: "1px solid #ccc",
                transition: "0.3s",
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Update Student</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Level</label>
                  <select
                    className="form-select"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                  >
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDetailsPage;
