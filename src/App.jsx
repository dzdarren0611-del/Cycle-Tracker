import { useState } from "react";

const PHASES = {
  menstrual: { label: "Menstrual", color: "#C4A0C8", bg: "#F5EDF7", arc: 0.08 },
  follicular: { label: "Follicular", color: "#E8C4C4", bg: "#FDF0F0", arc: 0.35 },
  ovulation: { label: "Ovulating", color: "#8FAF9A", bg: "#EDF5F0", arc: 0.55 },
  luteal: { label: "Luteal", color: "#B8A09C", bg: "#F7F0EE", arc: 0.82 },
};

function getPhase(dayOfCycle, cycleLength = 28) {
  const pct = dayOfCycle / cycleLength;
  if (pct <= 0.18) return "menstrual";
  if (pct <= 0.5) return "follicular";
  if (pct <= 0.64) return "ovulation";
  return "luteal";
}

function getDayOfCycle(lastPeriodStr) {
  const last = new Date(lastPeriodStr);
  const today = new Date();
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

function getNextPeriod(lastPeriodStr, cycleLength) {
  const last = new Date(lastPeriodStr);
  const next = new Date(last);
  next.setDate(next.getDate() + cycleLength);
  return next;
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

// Moon arc SVG — fills based on phase progress
function PhaseArc({ phase, dayOfCycle, cycleLength }) {
  const progress = Math.min(dayOfCycle / cycleLength, 1);
  const angle = progress * 360;
  const r = 28;
  const cx = 34;
  const cy = 34;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const startAngle = -90;
  const endAngle = startAngle + angle;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = angle > 180 ? 1 : 0;
  const phaseInfo = PHASES[phase];

  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDE0F0" strokeWidth="5" />
      {angle > 0 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none"
          stroke={phaseInfo.color}
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      <circle cx={cx} cy={cy} r={18} fill={phaseInfo.bg} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontFamily="DM Sans, sans-serif" fill="#5A3D5C" fontWeight="600">
        {dayOfCycle}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fontSize="7" fontFamily="DM Sans, sans-serif" fill="#9A7A9C">
        day
      </text>
    </svg>
  );
}

// 7-day pill strip
function WeekStrip({ lastPeriod, cycleLength }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    const diff = Math.floor((d - new Date(lastPeriod)) / (1000 * 60 * 60 * 24));
    const dayNum = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    const phase = getPhase(dayNum, cycleLength);
    const isToday = i === 3;
    return { date: d, dayNum, phase, isToday };
  });

  return (
    <div style={{ display: "flex", gap: "4px", marginTop: "12px" }}>
      {days.map((d, i) => {
        const ph = PHASES[d.phase];
        return (
          <div key={i} style={{
            flex: 1,
            borderRadius: "8px",
            padding: "6px 2px",
            background: d.isToday ? ph.color : ph.bg,
            border: d.isToday ? `2px solid ${ph.color}` : "2px solid transparent",
            textAlign: "center",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: "9px", fontFamily: "DM Sans, sans-serif", color: d.isToday ? "#fff" : "#9A7A9C", fontWeight: 600 }}>
              {d.date.toLocaleDateString("en", { weekday: "short" }).toUpperCase()}
            </div>
            <div style={{ fontSize: "11px", fontFamily: "DM Sans, sans-serif", color: d.isToday ? "#fff" : "#5A3D5C", fontWeight: 700, marginTop: "2px" }}>
              {d.date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const INITIAL_PEOPLE = [
  { id: 1, name: "Amirah", lastPeriod: "2026-06-03", cycleLength: 28, notes: "Regular", color: "#C4A0C8" },
  { id: 2, name: "Siti", lastPeriod: "2026-06-17", cycleLength: 31, notes: "Sometimes irregular", color: "#E8A0A0" },
  { id: 3, name: "Mei Lin", lastPeriod: "2026-06-10", cycleLength: 26, notes: "", color: "#8FAF9A" },
];

function PersonCard({ person, onEdit, onDelete }) {
  const dayOfCycle = getDayOfCycle(person.lastPeriod);
  const phase = getPhase(dayOfCycle, person.cycleLength);
  const phaseInfo = PHASES[phase];
  const nextPeriod = getNextPeriod(person.lastPeriod, person.cycleLength);
  const daysLeft = daysUntil(nextPeriod);

  return (
    <div style={{
      background: "#fff",
      borderRadius: "20px",
      padding: "20px",
      boxShadow: "0 2px 16px rgba(45,27,51,0.07)",
      border: `1px solid ${phaseInfo.bg}`,
      transition: "box-shadow 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: `linear-gradient(135deg, ${person.color}99, ${person.color})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Playfair Display, serif", fontSize: "18px", color: "#fff", fontWeight: 700
          }}>
            {person.name[0]}
          </div>
          <div>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "17px", color: "#2D1B33", fontWeight: 700 }}>
              {person.name}
            </div>
            <div style={{
              display: "inline-block", fontSize: "10px", fontFamily: "DM Sans, sans-serif",
              fontWeight: 700, letterSpacing: "0.08em", padding: "2px 8px",
              borderRadius: "20px", background: phaseInfo.bg, color: phaseInfo.color,
              marginTop: "2px", textTransform: "uppercase"
            }}>
              {phaseInfo.label}
            </div>
          </div>
        </div>
        <PhaseArc phase={phase} dayOfCycle={Math.min(dayOfCycle, person.cycleLength)} cycleLength={person.cycleLength} />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        {[
          { label: "Cycle", value: `${person.cycleLength}d` },
          { label: "Last period", value: formatDate(new Date(person.lastPeriod)) },
          { label: daysLeft >= 0 ? "Next in" : "Overdue by", value: `${Math.abs(daysLeft)}d` },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: "#FAF5F0", borderRadius: "10px",
            padding: "8px 6px", textAlign: "center"
          }}>
            <div style={{ fontSize: "8px", fontFamily: "DM Sans, sans-serif", color: "#9A7A9C", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "13px", fontFamily: "DM Sans, sans-serif", color: "#2D1B33", fontWeight: 700, marginTop: "2px" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Week strip */}
      <WeekStrip lastPeriod={person.lastPeriod} cycleLength={person.cycleLength} />

      {/* Notes */}
      {person.notes && (
        <div style={{ marginTop: "10px", fontSize: "11px", fontFamily: "DM Sans, sans-serif", color: "#9A7A9C", fontStyle: "italic" }}>
          {person.notes}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <button onClick={() => onEdit(person)} style={{
          flex: 1, padding: "8px", border: "1.5px solid #EDE0F0", borderRadius: "10px",
          background: "transparent", fontFamily: "DM Sans, sans-serif", fontSize: "12px",
          color: "#7A5A7C", cursor: "pointer", fontWeight: 600
        }}>
          Edit
        </button>
        <button onClick={() => onDelete(person.id)} style={{
          padding: "8px 14px", border: "1.5px solid #F5E0E0", borderRadius: "10px",
          background: "transparent", fontFamily: "DM Sans, sans-serif", fontSize: "12px",
          color: "#C4808A", cursor: "pointer", fontWeight: 600
        }}>
          Remove
        </button>
      </div>
    </div>
  );
}

function Modal({ person, onSave, onClose }) {
  const [form, setForm] = useState(
    person || { name: "", lastPeriod: "", cycleLength: 28, notes: "", color: "#C4A0C8" }
  );
  const colors = ["#C4A0C8", "#E8A0A0", "#8FAF9A", "#A0B8C8", "#C8B89A", "#A0C8B0"];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(45,27,51,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px"
    }}>
      <div style={{
        background: "#fff", borderRadius: "24px", padding: "28px",
        width: "100%", maxWidth: "380px", boxShadow: "0 8px 40px rgba(45,27,51,0.18)"
      }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", color: "#2D1B33", margin: "0 0 20px", fontSize: "20px" }}>
          {person ? "Edit person" : "Add person"}
        </h2>

        {[
          { label: "Name", key: "name", type: "text", placeholder: "e.g. Amirah" },
          { label: "Last period started", key: "lastPeriod", type: "date", placeholder: "" },
          { label: "Average cycle length (days)", key: "cycleLength", type: "number", placeholder: "28" },
          { label: "Notes (optional)", key: "notes", type: "text", placeholder: "e.g. Irregular, on contraceptives..." },
        ].map((field) => (
          <div key={field.key} style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontFamily: "DM Sans, sans-serif", fontSize: "11px", color: "#9A7A9C", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
              {field.label}
            </label>
            <input
              type={field.type}
              value={form[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => set(field.key, field.type === "number" ? parseInt(e.target.value) || 28 : e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                border: "1.5px solid #EDE0F0", fontFamily: "DM Sans, sans-serif",
                fontSize: "14px", color: "#2D1B33", outline: "none", boxSizing: "border-box",
                background: "#FAF5F0"
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "11px", color: "#9A7A9C", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
            Colour
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {colors.map((c) => (
              <div key={c} onClick={() => set("color", c)} style={{
                width: "28px", height: "28px", borderRadius: "50%", background: c, cursor: "pointer",
                border: form.color === c ? "3px solid #2D1B33" : "3px solid transparent",
                transition: "border 0.15s"
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", border: "1.5px solid #EDE0F0", borderRadius: "12px",
            background: "transparent", fontFamily: "DM Sans, sans-serif", fontSize: "14px",
            color: "#7A5A7C", cursor: "pointer", fontWeight: 600
          }}>Cancel</button>
          <button onClick={() => form.name && form.lastPeriod && onSave(form)} style={{
            flex: 2, padding: "12px", border: "none", borderRadius: "12px",
            background: "linear-gradient(135deg, #7A5A7C, #C4A0C8)",
            fontFamily: "DM Sans, sans-serif", fontSize: "14px",
            color: "#fff", cursor: "pointer", fontWeight: 700
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function CycleTracker() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [modal, setModal] = useState(null); // null | "add" | person object

  const handleSave = (form) => {
    if (form.id) {
      setPeople((p) => p.map((x) => (x.id === form.id ? form : x)));
    } else {
      setPeople((p) => [...p, { ...form, id: Date.now() }]);
    }
    setModal(null);
  };

  const handleDelete = (id) => setPeople((p) => p.filter((x) => x.id !== id));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #FAF5F0 0%, #F0E8F5 100%)",
      padding: "0 0 40px",
      fontFamily: "DM Sans, sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2D1B33 0%, #5A3D5C 100%)",
        padding: "32px 24px 28px",
        borderRadius: "0 0 28px 28px",
        boxShadow: "0 4px 24px rgba(45,27,51,0.18)"
      }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#C4A0C8", textTransform: "uppercase", marginBottom: "6px" }}>
          Cycle Tracker
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#FAF5F0", fontSize: "26px", margin: 0, fontWeight: 700 }}>
          Tracking {people.length} {people.length === 1 ? "person" : "people"}
        </h1>
        <p style={{ color: "#C4A0C8", fontSize: "13px", margin: "6px 0 0", fontWeight: 400 }}>
          Today, {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Phase legend */}
      <div style={{ display: "flex", gap: "8px", padding: "16px 20px 4px", overflowX: "auto" }}>
        {Object.entries(PHASES).map(([key, ph]) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: ph.bg, borderRadius: "20px", padding: "4px 10px",
            flexShrink: 0
          }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: ph.color }} />
            <span style={{ fontSize: "10px", color: ph.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {ph.label}
            </span>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {people.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#C4A0C8", fontFamily: "Playfair Display, serif", fontSize: "18px" }}>
            No one added yet.<br />
            <span style={{ fontSize: "13px", fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>Tap + to get started.</span>
          </div>
        )}
        {people.map((p) => (
          <PersonCard key={p.id} person={p} onEdit={(p) => setModal(p)} onDelete={handleDelete} />
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setModal("add")} style={{
        position: "fixed", bottom: "28px", right: "24px",
        width: "56px", height: "56px", borderRadius: "50%",
        background: "linear-gradient(135deg, #7A5A7C, #C4A0C8)",
        border: "none", color: "#fff", fontSize: "26px", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(45,27,51,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 90
      }}>+</button>

      {/* Modal */}
      {modal && (
        <Modal
          person={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
