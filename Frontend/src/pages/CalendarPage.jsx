import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const localizer = momentLocalizer(moment);

function CalendarPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    startHour: 9.0,
    startPeriod: "AM",
    endHour: 10.0,
    endPeriod: "AM",
    dayOfWeek: 1,
    repeat: false,
  });

  // ✅ Load events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await axios.get("http://localhost:5000/events");
    // Convert ISO dates back into JS Date
    setEvents(
      res.data.map((ev) => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }))
    );
  };

  // Convert float hour + AM/PM → Date
  const getTime = (baseDate, floatHour, period) => {
    const d = new Date(baseDate);
    let hour = Math.floor(floatHour);
    let minutes = Math.round((floatHour - hour) * 60);

    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    d.setHours(hour, minutes, 0, 0);
    return d;
  };

  // ✅ Add or update event
  const handleSaveEvent = async () => {
    const {
      title,
      dayOfWeek,
      startHour,
      startPeriod,
      endHour,
      endPeriod,
      repeat,
    } = formData;
    if (!title) return alert("⚠️ Please enter a title");

    let newEvents = [];

    if (repeat) {
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      let current = new Date(today);
      current.setDate(
        current.getDate() - current.getDay() + parseInt(dayOfWeek)
      );

      while (current <= nextYear) {
        const start = getTime(current, parseFloat(startHour), startPeriod);
        const end = getTime(current, parseFloat(endHour), endPeriod);
        newEvents.push({ title, start, end });
        current.setDate(current.getDate() + 7);
      }
    } else {
      const start = getTime(new Date(), parseFloat(startHour), startPeriod);
      const end = getTime(new Date(), parseFloat(endHour), endPeriod);
      newEvents.push({ title, start, end });
    }

    if (editingEvent) {
      // ✅ Update single event
      const updated = { ...newEvents[0], id: editingEvent.id };
      await axios.put(
        `http://localhost:5000/events/${editingEvent.id}`,
        updated
      );
    } else {
      // ✅ Save all new events to backend
      for (let ev of newEvents) {
        await axios.post("http://localhost:5000/events", ev);
      }
    }

    fetchEvents();
    setShowModal(false);
    setEditingEvent(null);
    resetForm();
  };

  // ✅ Delete event
  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    await axios.delete(`http://localhost:5000/events/${editingEvent.id}`);
    fetchEvents();
    setShowModal(false);
    setEditingEvent(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      startHour: 9.0,
      startPeriod: "AM",
      endHour: 10.0,
      endPeriod: "AM",
      dayOfWeek: 1,
      repeat: false,
    });
  };

  // When selecting an event
  const handleSelectEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      startHour: event.start.getHours() % 12 || 12,
      startPeriod: event.start.getHours() >= 12 ? "PM" : "AM",
      endHour: event.end.getHours() % 12 || 12,
      endPeriod: event.end.getHours() >= 12 ? "PM" : "AM",
      dayOfWeek: event.start.getDay(),
      repeat: false,
    });
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button
        className="btn btn-outline-orange mb-3"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <h3 className="fw-bold mb-3">
        📅 <span className="text-orange">My Calendar</span>
      </h3>

      <button
        className="btn btn-orange mb-3"
        onClick={() => {
          setEditingEvent(null);
          resetForm();
          setShowModal(true);
        }}
      >
        ➕ Add Event / Session
      </button>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          onNavigate={(newDate) => setDate(newDate)}
          onView={(newView) => setView(newView)}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          onSelectEvent={handleSelectEvent}
          style={{ borderRadius: "10px", background: "#fff" }}
          formats={{
            timeGutterFormat: (date, culture, loc) =>
              loc.format(date, "hh:mm A", culture),
            eventTimeRangeFormat: ({ start, end }, culture, loc) =>
              `${loc.format(start, "hh:mm A", culture)} – ${loc.format(
                end,
                "hh:mm A",
                culture
              )}`,
          }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content p-4 bg-white rounded shadow-lg">
            <h4 className="fw-bold mb-3">
              {editingEvent ? "✏️ Edit Event" : "➕ Add Event / Session"}
            </h4>

            <input
              type="text"
              placeholder="Event title"
              className="form-control mb-2"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            {/* Time Inputs */}
            <div className="row mb-2">
              <div className="col">
                <label>Start Time</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    step="0.25"
                    className="form-control"
                    value={formData.startHour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startHour: parseFloat(e.target.value),
                      })
                    }
                  />
                  <select
                    className="form-select"
                    value={formData.startPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, startPeriod: e.target.value })
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="col">
                <label>End Time</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    step="0.25"
                    className="form-control"
                    value={formData.endHour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endHour: parseFloat(e.target.value),
                      })
                    }
                  />
                  <select
                    className="form-select"
                    value={formData.endPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, endPeriod: e.target.value })
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Repeat Checkbox */}
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.repeat}
                onChange={(e) =>
                  setFormData({ ...formData, repeat: e.target.checked })
                }
              />
              <label className="form-check-label">Repeat weekly</label>
            </div>

            {formData.repeat && (
              <select
                className="form-select mb-2"
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dayOfWeek: parseInt(e.target.value),
                  })
                }
              >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            )}

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-orange w-50" onClick={handleSaveEvent}>
                {editingEvent ? "Update" : "Save"}
              </button>
              {editingEvent && (
                <button
                  className="btn btn-danger w-50"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </button>
              )}
              <button
                className="btn btn-outline-orange w-50"
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

export default CalendarPage;
