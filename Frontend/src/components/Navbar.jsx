import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    color: isActive ? "#fff" : "#333",
    backgroundColor: isActive ? "#ff7f50" : "transparent",
    transition: "0.3s",
  });

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm min-vw-100 overflow-x-hidden"
      style={{ backgroundColor: "#fffaf5" }}
    >
      <div className="container d-flex justify-content-between">
        <h3 className="fw-bold text-orange m-0">Code Squad</h3>
        <div className="d-flex gap-3">
          <NavLink to="/" style={linkStyle}>
            Home
          </NavLink>
          <NavLink to="/students" style={linkStyle}>
            Students
          </NavLink>
          <NavLink to="/analysis" style={linkStyle}>
            Analysis
          </NavLink>
          <NavLink to="/calendar" style={linkStyle}>
            Calendar
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
