import React from "react";
import Card from "../components/Card/Card";
import Title from "../components/Title";

function HomePage() {
  return (
    <div
      className="min-vh-100 min-vw-100 overflow-y-hidden"
      style={{ backgroundColor: "#fffaf5" }}
    >
      <Title title={"Code Squad"} />

      <div className="container mt-5">
        {/* First row with 2 cards */}
        <div className="row mb-4">
          <div className="col-md-6 d-flex justify-content-start">
            <Card title="Students" route="/students" />
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <Card title="Analysis" route="/analysis" />
          </div>
        </div>

        {/* Second row with 1 card */}
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            <Card title="Calendar" route="/calendar" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
