import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudentsPage from "./pages/StudentsPage/StudentsPage";
import AnalysisPage from "./pages/AnalysisPage";
import CalendarPage from "./pages/CalendarPage";
import StudentDetailsPage from "./pages/StudentDetailsPage";
import Navbar from "./components/Navbar";
import { Suspense } from "react";
import LoadingPage from "./components/LoadingPage";

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingPage />} />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailsPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </Router>
  );
}
