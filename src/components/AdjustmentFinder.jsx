// AdjustmentFinder.jsx — full rewrite with all new features

import { useState, useCallback, useEffect } from "react";
import { SLOTS, DAYS, DAY_LABELS, TRAINER_NAMES, getCell } from "../data/timetableData";
import LoginModal from "./LoginModal";

const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "http://localhost:8080/api";

const DAY_FULL = {
  Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday",
};

function getDayKeyFromDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const map = { 1: "Mo", 2: "Tu", 3: "We", 4: "Th", 5: "Fr" };
  return map[d.getDay()] || "";
}

function loadColor(load) {
  if (load === 0) return { bg: "rgba(126,200,227,.12)", color: "#7ec8e3" };
  if (load <= 3) return { bg: "rgba(80,200,120,.12)", color: "#50c878" };
  if (load <= 5) return { bg: "rgba(232,180,74,.14)", color: "#e8b44a" };
  return { bg: "rgba(230,80,80,.14)", color: "#e05050" };
}

export default function AdjustmentFinder() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [requestingFaculty, setRequestingFaculty] = useState("");
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [requestState, setRequestState] = useState({});
  const [requestMsg, setRequestMsg] = useState({});


  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  // const [authToken, setAuthToken] = useState(localStorage.getItem("tt_auth_token") || "");
  const [authToken, setAuthToken] = useState(() => {
    const saved = localStorage.getItem("tt_auth_session");
    if (!saved) return "";

    try {
      const parsed = JSON.parse(saved);

      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem("tt_auth_session");
        return "";
      }

      return parsed.token;
    } catch {
      localStorage.removeItem("tt_auth_session");
      return "";
    }
  });
  const [pendingFaculty, setPendingFaculty] = useState(null);


  // useEffect(() => {
  //   if (authToken) {
  //     localStorage.setItem("tt_auth_token", authToken);
  //   } else {
  //     localStorage.removeItem("tt_auth_token");
  //   }
  // }, [authToken]);
  useEffect(() => {
    if (!authToken) return;

    const expiresAt = Date.now() + 1000 * 60 * 5; // 5 min

    localStorage.setItem(
      "tt_auth_session",
      JSON.stringify({
        token: authToken,
        expiresAt,
      })
    );

    const timeout = setTimeout(() => {
      setAuthToken("");
      localStorage.removeItem("tt_auth_session");
    }, 1000 * 60 * 5);

    return () => clearTimeout(timeout);
  }, [authToken]);

  async function handleSendOtp() {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail }),
    });

    const data = await res.json();
    console.log(data, "data-finder-line63")

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setOtpSent(true);
    alert("OTP sent to your official email.");
  }

  async function handleVerifyOtp() {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    // setAuthToken(data.token);
    const expiresAt = Date.now() + 1000 * 60 * 5;

    localStorage.setItem(
      "tt_auth_session",
      JSON.stringify({
        token: data.token,
        expiresAt,
      })
    );

    setAuthToken(data.token);
    setShowLoginModal(false);
    setOtp("");
    setOtpSent(false);

    if (pendingFaculty) {
      handleRequestAdjustment(pendingFaculty, data.token);
      setPendingFaculty(null);
    }
  }

  function handleDateChange(e) {
    const val = e.target.value;
    setSelectedDate(val);
    setSelectedDay(getDayKeyFromDate(val));
    setResults(null);
    setSearchError("");
    setRequestState({});
    setRequestMsg({});
  }

  function handleSlotChange(e) {
    setSelectedSlot(e.target.value);
    setResults(null);
    setSearchError("");
    setRequestState({});
    setRequestMsg({});
  }

  async function handleSearch() {
    if (!selectedDate) { setSearchError("Please select a date first."); return; }
    if (!selectedDay) { setSearchError("The selected date falls on a weekend. Please pick Mon-Fri."); return; }
    if (!selectedSlot) { setSearchError("Please select a time slot."); return; }
    setSearchError("");
    setSearching(true);
    setResults(null);
    setRequestState({});
    setRequestMsg({});
    try {
      const url = `${API_BASE}/available?day=${selectedDay}&slotId=${selectedSlot}&date=${selectedDate}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) setSearchError(data.error || "Server error. Please try again.");
      else setResults(data);
    } catch {
      setSearchError("Could not reach the server. Make sure the backend is running on port 5000.");
    } finally {
      setSearching(false);
    }
  }

  const handleRequestAdjustment = useCallback(async (coveringFaculty, tokenOverride = null) => {
    const tokenToUse = tokenOverride || authToken;

    if (!tokenToUse) {
      setPendingFaculty(coveringFaculty);
      setShowLoginModal(true);
      return;
    }

    if (!requestingFaculty) {
      setRequestMsg((p) => ({
        ...p,
        [coveringFaculty]: {
          type: "error",
          text: "Please select the requesting faculty above first.",
        },
      }));
      return;
    }

    if (requestingFaculty === coveringFaculty) {
      setRequestMsg((p) => ({
        ...p,
        [coveringFaculty]: {
          type: "error",
          text: "Requesting and covering faculty cannot be the same person.",
        },
      }));
      return;
    }

    const classDetails = getCell(requestingFaculty, selectedDay, Number(selectedSlot));

    if (!classDetails) {
      setRequestMsg((p) => ({
        ...p,
        [coveringFaculty]: {
          type: "error",
          text: `${requestingFaculty} has no scheduled class on ${DAY_FULL[selectedDay]} Slot ${selectedSlot}.`,
        },
      }));
      return;
    }

    setRequestState((p) => ({ ...p, [coveringFaculty]: "loading" }));

    try {
      const res = await fetch(`${API_BASE}/request-adjustment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify({
          requestingFaculty,
          coveringFaculty,
          day: selectedDay,
          slotId: Number(selectedSlot),
          date: selectedDate,
          classDetails,
        }),
      });

      const data = await res.json();

      // if (!res.ok) {
      //   setRequestState((p) => ({ ...p, [coveringFaculty]: "error" }));
      //   setRequestMsg((p) => ({
      //     ...p,
      //     [coveringFaculty]: { type: "error", text: data.error },
      //   }));
      //   return;
      // }
      if (res.status === 401) {
        setAuthToken("");
        localStorage.removeItem("tt_auth_session");

        setPendingFaculty(coveringFaculty);
        setShowLoginModal(true);

        setRequestState((p) => ({
          ...p,
          [coveringFaculty]: "idle",
        }));

        return;
      }

      if (!res.ok) {
        setRequestState((p) => ({ ...p, [coveringFaculty]: "error" }));
        setRequestMsg((p) => ({
          ...p,
          [coveringFaculty]: {
            type: "error",
            text: data.error || "Something went wrong.",
          },
        }));
        return;
      }

      setRequestState((p) => ({ ...p, [coveringFaculty]: "success" }));

      setRequestMsg((p) => ({
        ...p,
        [coveringFaculty]: {
          type: "success",
          text: `Assigned! ID: ${data.requestId}`,
        },
      }));

      setResults((prev) =>
        prev
          ? {
            ...prev,
            availableTrainers: prev.availableTrainers.filter(
              (t) => t.name !== coveringFaculty
            ),
            totalAvailable: prev.totalAvailable - 1,
          }
          : prev
      );
    } catch {
      setRequestState((p) => ({ ...p, [coveringFaculty]: "error" }));
    }
  }, [authToken, requestingFaculty, selectedDay, selectedSlot, selectedDate]);


  return (
    <div>
      <div className="sec-hdr">
        <h2>Class Adjustment Finder</h2>
        <p>Select a date and slot to find free trainers. Request an adjustment to notify them via email.</p>
      </div>

      <div className="finder-card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "8px" }}>

          {/* Date */}
          <div className="form-grp">
            <label>Date <span style={{ color: "#e05050", fontSize: "11px" }}>*</span></label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%", padding: "10px 14px", boxSizing: "border-box",
                background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.12)",
                borderRadius: "10px", color: "inherit", fontSize: "14px", cursor: "pointer",
              }}
            />
          </div>

          {/* Day (auto) */}
          <div className="form-grp">
            <label>Day <span style={{ color: "rgba(200,216,232,.4)", fontSize: "11px" }}>(auto-filled)</span></label>
            <div style={{
              padding: "10px 14px", background: "rgba(255,255,255,.03)",
              border: "1.5px solid rgba(255,255,255,.07)", borderRadius: "10px",
              color: selectedDay ? "#e8b44a" : "rgba(200,216,232,.35)",
              fontSize: "14px", fontWeight: selectedDay ? 600 : 400,
              minHeight: "42px", display: "flex", alignItems: "center",
            }}>
              {selectedDay ? DAY_FULL[selectedDay] : selectedDate ? "Weekend — pick a weekday" : "Pick a date above"}
            </div>
          </div>

          {/* Slot */}
          <div className="form-grp">
            <label>Time Slot <span style={{ color: "#e05050", fontSize: "11px" }}>*</span></label>
            <select value={selectedSlot} onChange={handleSlotChange}>
              <option value="">Select Slot</option>
              {SLOTS.map(s => <option key={s.id} value={s.id}>Slot {s.id} · {s.time}</option>)}
            </select>
          </div>

          {/* Requesting Faculty */}
          <div className="form-grp">
            <label>Requesting Faculty <span style={{ color: "#e05050", fontSize: "11px" }}>*</span></label>
            <select value={requestingFaculty} onChange={e => { setRequestingFaculty(e.target.value); setRequestMsg({}); }}>
              <option value="">Select Faculty</option>
              {TRAINER_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Button */}
          <div className="find-btn-wrap" style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="find-btn" onClick={handleSearch} disabled={searching}
              style={{ width: "100%", opacity: searching ? 0.7 : 1, cursor: searching ? "wait" : "pointer" }}>
              {searching ? "🔍 Searching…" : "🔍 Find Available"}
            </button>
          </div>
        </div>

        {/* Error */}
        {searchError && <div className="no-res" style={{ marginTop: "16px" }}>⚠️ {searchError}</div>}

        {/* No results */}
        {results && results.totalAvailable === 0 && !searchError && (
          <div className="no-res" style={{ marginTop: "16px" }}>
            😔 Every trainer is occupied or already assigned for <strong>{results.dayLabel}</strong> · <strong>Slot {results.slotId} ({results.slotTime})</strong> on <strong>{selectedDate}</strong>.
          </div>
        )}

        {/* Results */}
        {results && results.totalAvailable > 0 && (
          <>
            <div className="res-info" style={{ marginTop: "20px" }}>
              <strong>{results.totalAvailable} trainer(s)</strong> free on{" "}
              <span className="hl">{results.dayLabel}</span> — <span className="hl">Slot {results.slotId} · {results.slotTime}</span> on{" "}
              <span className="hl">{selectedDate}</span>{" "}
              <em style={{ fontSize: ".78rem", color: "var(--gray-400)" }}>(sorted by weekly load)</em>
            </div>

            <div className="res-grid" style={{ marginTop: "16px" }}>
              {results.availableTrainers.map((trainer, i) => {
                const state = requestState[trainer.name] || "idle";
                const msg = requestMsg[trainer.name];
                const dlSty = loadColor(trainer.dayLoad);
                const wlSty = loadColor(trainer.weeklyLoad);

                return (
                  <div key={trainer.name} className="res-card" style={{ animationDelay: `${i * 55}ms` }}>
                    <div className="rc-name">{trainer.name}</div>
                    <div className="rc-avail"><span className="rc-dot"></span> Free this slot</div>

                    {/* Dual load badges */}
                    <div style={{ display: "flex", gap: "8px", margin: "10px 0 4px" }}>
                      <div style={{ flex: 1, background: dlSty.bg, borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "rgba(200,216,232,.5)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: ".6px" }}>{results.dayLabel} Load</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: dlSty.color }}>{trainer.dayLoad}</div>
                      </div>
                      <div style={{ flex: 1, background: wlSty.bg, borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "rgba(200,216,232,.5)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: ".6px" }}>Weekly Load</div>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: wlSty.color }}>{trainer.weeklyLoad}</div>
                      </div>
                    </div>

                    {/* Request button */}
                    {state !== "success" && (
                      <button
                        onClick={() => handleRequestAdjustment(trainer.name)}
                        disabled={state === "loading"}
                        style={{
                          marginTop: "10px", width: "100%", padding: "9px 0",
                          background: state === "error" ? "rgba(230,80,80,.18)" : "rgba(232,180,74,.15)",
                          border: `1.5px solid ${state === "error" ? "rgba(230,80,80,.4)" : "rgba(232,180,74,.35)"}`,
                          borderRadius: "9px",
                          color: state === "error" ? "#e05050" : "#e8b44a",
                          fontSize: "13px", fontWeight: 600,
                          cursor: state === "loading" ? "wait" : "pointer",
                          opacity: state === "loading" ? 0.7 : 1,
                          transition: "all .2s",
                        }}
                      >
                        {state === "loading" ? "⏳ Sending…" : state === "error" ? "⚠ Retry" : "📨 Request Adjustment"}
                      </button>
                    )}

                    {state === "success" && (
                      <div style={{ marginTop: "10px", padding: "9px 12px", background: "rgba(80,200,120,.12)", border: "1.5px solid rgba(80,200,120,.3)", borderRadius: "9px", color: "#50c878", fontSize: "13px", fontWeight: 600, textAlign: "center" }}>
                        ✅ Assigned
                      </div>
                    )}

                    {msg && (
                      <div style={{
                        marginTop: "8px", padding: "8px 12px",
                        background: msg.type === "success" ? "rgba(80,200,120,.08)" : "rgba(230,80,80,.08)",
                        borderRadius: "8px",
                        color: msg.type === "success" ? "#50c878" : "#e05050",
                        fontSize: "11.5px", lineHeight: 1.5, wordBreak: "break-word",
                      }}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <LoginModal
        show={showLoginModal}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        otp={otp}
        setOtp={setOtp}
        otpSent={otpSent}
        handleSendOtp={handleSendOtp}
        handleVerifyOtp={handleVerifyOtp}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}