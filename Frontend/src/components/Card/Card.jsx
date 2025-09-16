import React from "react";
import { useNavigate } from "react-router-dom";
import "./Card.css"; // fashion styles

function Card({ title, route }) {
  const navigate = useNavigate();

  return (
    <div
      className="fashion-card"
      onClick={() => navigate(route)}
    >
      <div className="fashion-card-content">
        <h2 className="fashion-card-title">{title}</h2>
        <p className="fashion-card-text">Click to explore {title}</p>
        <span className="fashion-arrow">➜</span>
      </div>
    </div>
  );
}

export default Card;
