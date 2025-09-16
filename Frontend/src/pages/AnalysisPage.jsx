import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ... keep your imports

function AnalysisPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const levels = [1, 2, 3, 4];

  // 🔹 Last 12 months
  const getLast12Months = () => {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const m = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.unshift(m.toLocaleString("default", { month: "short" }));
    }
    return months;
  };
  const last12Months = getLast12Months();

  // 🔹 Fetch students & prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, pricesRes] = await Promise.all([
          axios.get("http://localhost:5000/students"),
          axios.get("http://localhost:5000/prices"),
        ]);

        const updatedStudents = (studentsRes.data || []).map((s) => {
          const payments = {};
          last12Months.forEach((m, idx) => {
            const val = s.paidMonths?.[idx] ?? 0; // default 0
            payments[m] = val;
          });
          return { ...s, payments };
        });

        const defaultPrices = { 1: 100, 2: 150, 3: 200, 4: 250 };
        setStudents(updatedStudents);
        setPrices({ ...defaultPrices, ...pricesRes.data });
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        alert("Failed to fetch students or prices");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Toggle month (0 → 1 → 2 → 0)
  const togglePayment = async (student, month) => {
    const current = student.payments[month];
    const newState = (current + 1) % 3;

    const updatedStudents = students.map((s) =>
      s.id === student.id
        ? { ...s, payments: { ...s.payments, [month]: newState } }
        : s
    );
    setStudents(updatedStudents);

    try {
      await axios.put(`http://localhost:5000/students/${student.id}`, {
        ...student,
        paidMonths: last12Months.map((m) =>
          m === month ? newState : student.payments[m]
        ),
      });
    } catch (err) {
      console.error("❌ Error updating payment:", err);
    }
  };

  // 🔹 Save prices
  const savePrices = async () => {
    try {
      await axios.put("http://localhost:5000/prices", prices);
      alert("✅ Prices updated!");
    } catch (err) {
      console.error("❌ Error saving prices:", err);
      alert("Failed to update prices");
    }
  };

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <p className="text-center fw-bolder fs-5">Loading...</p>
      </div>
    );

  // 🔹 Table + Chart Summary
  const tableData = levels.map((lvl) => {
    const levelStudents = students.filter((s) => s.level === lvl);

    let paidCount = 0;
    let unpaidCount = 0;

    levelStudents.forEach((s) => {
      Object.values(s.payments).forEach((val) => {
        if (val === 1) paidCount++;
        if (val === 2) unpaidCount++;
      });
    });

    const collected = paidCount * (prices[lvl] || 0);
    const missing = unpaidCount * (prices[lvl] || 0);

    return {
      level: `Level ${lvl}`,
      students: levelStudents.length,
      paid: paidCount,
      unpaid: unpaidCount,
      price: prices[lvl] || 0,
      collected,
      missing,
    };
  });

  const chartData = tableData.map((row) => ({
    level: row.level,
    Collected: row.collected,
    Missing: row.missing,
  }));

  // 🔹 Totals Row
  const totals = tableData.reduce(
    (acc, row) => {
      acc.students += row.students;
      acc.paid += row.paid;
      acc.unpaid += row.unpaid;
      acc.collected += row.collected;
      acc.missing += row.missing;
      return acc;
    },
    { students: 0, paid: 0, unpaid: 0, collected: 0, missing: 0 }
  );

  return (
    <div className="container mt-5">
      {/* Back */}
      <button
        className="btn btn-outline-orange mb-3"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          💰{" "}
          <span className="text-orange">
            Financial Analysis – Last 12 Months
          </span>
        </h2>
        <p className="text-muted">Click months to mark Paid / Unpaid.</p>
      </div>

      {/* Editable Prices */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="fw-semibold mb-3">📌 Set Level Prices</h5>
        <div className="row g-3">
          {levels.map((lvl) => (
            <div key={lvl} className="col-md-3 col-6">
              <label className="form-label fw-semibold">
                Level {lvl} Price:
              </label>
              <input
                type="number"
                className="form-control text-center"
                value={prices[lvl] || ""}
                onChange={(e) =>
                  setPrices({ ...prices, [lvl]: parseFloat(e.target.value) })
                }
              />
            </div>
          ))}
        </div>
        <button className="btn btn-success mt-3" onClick={savePrices}>
          💾 Save Prices
        </button>
      </div>

      {/* Students Payments Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning text-dark fw-bold">
          🧑‍🎓 Students Monthly Payments
        </div>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                {last12Months.map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.name}</td>
                  {last12Months.map((m) => {
                    const val = s.payments[m];
                    let bg = "white",
                      text = "black",
                      label = "";
                    if (val === 1) {
                      bg = "#28a745";
                      text = "white";
                      label = "Paid";
                    }
                    if (val === 2) {
                      bg = "#dc3545";
                      text = "white";
                      label = "Unpaid";
                    }
                    return (
                      <td
                        key={m}
                        onClick={() => togglePayment(s, m)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: bg,
                          color: text,
                          fontWeight: "bold",
                        }}
                      >
                        {label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-dark fw-bold">
          📊 Payment Summary
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle text-center mb-0">
            <thead className="table-light">
              <tr>
                <th>Level</th>
                <th>Students</th>
                <th className="text-success">Paid</th>
                <th className="text-danger">Unpaid</th>
                <th>Price</th>
                <th className="text-success">Collected</th>
                <th className="text-danger">Missing</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.level}>
                  <td className="fw-semibold">{row.level}</td>
                  <td>{row.students}</td>
                  <td className="text-success fw-bold">{row.paid}</td>
                  <td className="text-danger fw-bold">{row.unpaid}</td>
                  <td>${row.price}</td>
                  <td className="text-success fw-semibold">${row.collected}</td>
                  <td className="text-danger fw-semibold">${row.missing}</td>
                </tr>
              ))}
              {/* 🔹 Totals Row */}
              <tr className="table-secondary fw-bold">
                <td>Total</td>
                <td>{totals.students}</td>
                <td className="text-success">{totals.paid}</td>
                <td className="text-danger">{totals.unpaid}</td>
                <td>-</td>
                <td className="text-success">${totals.collected}</td>
                <td className="text-danger">${totals.missing}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="card shadow-sm p-3">
        <h5 className="fw-semibold mb-3">📈 Collected vs Missing</h5>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Collected" fill="#28a745" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Missing" fill="#dc3545" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;
