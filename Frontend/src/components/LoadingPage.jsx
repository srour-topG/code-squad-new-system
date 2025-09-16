import React from "react";

function LoadingPage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-warning mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <h5 className="fw-bold text-orange">Loading, please wait...</h5>
    </div>
  );
}

export default LoadingPage;
