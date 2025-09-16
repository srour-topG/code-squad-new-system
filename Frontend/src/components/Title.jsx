import React from "react";

function Title({ title }) {
  return (
    <div
      className="w-100 text-white d-flex align-items-start justify-content-center shadow-sm"
      style={{ background: "linear-gradient(90deg, #ff8800, #ff6600)" }}
    >
      <h1 className="m-5 fw-bold">{title}</h1>
    </div>
  );
}

export default Title;
