import { useState, useMemo } from "react";
import {
  SLOTS,
  DAYS,
  DAY_LABELS,
  TRAINER_NAMES,
  getCell,
  weekLoad,
  dayLoad,
} from "../data/timetableData";
import { useTooltip, Tooltip } from "./Tooltip";

export default function IndividualTimetable() {
  const [curTrainer, setCurTrainer] = useState(TRAINER_NAMES[0]);
  const { tooltip, showTooltip, hideTooltip, moveTooltip } = useTooltip();

  const { rows, slotCounts, wkTotal } = useMemo(() => {
    const slotCounts = Array(SLOTS.length).fill(0);
    let wkTotal = 0;
    const rows = DAYS.map((d) => {
      const dl = dayLoad(curTrainer, d);
      wkTotal += dl;
      const cells = SLOTS.map((s, i) => {
        const cell = getCell(curTrainer, d, s.id);
        if (cell) slotCounts[i]++;
        return { slot: s, cell, idx: i };
      });
      return { day: d, dl, cells };
    });
    return { rows, slotCounts, wkTotal };
  }, [curTrainer]);

  return (
    <div onMouseMove={moveTooltip}>
      <div className="sec-hdr">
        <h2>Individual Trainer Timetable</h2>
        <p>Select a trainer to see their full weekly schedule and load count per day.</p>
      </div>

      {/* Trainer pills */}
      <div className="trainer-pills">
        {TRAINER_NAMES.map((n) => (
          <button
            key={n}
            className={`tr-pill${n === curTrainer ? " active" : ""}`}
            onClick={() => setCurTrainer(n)}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="tbl-wrap">
        <div className="scroll-hint">← Scroll →</div>
        <table>
          <thead>
            <tr>
              <th className="th-left" style={{ minWidth: 78 }}>Day</th>
              {SLOTS.map((s) => (
                <th key={s.id} className="slot-th">
                  S{s.id}
                  <br />
                  <span style={{ fontSize: ".58rem", fontWeight: 400, color: "rgba(246,231,188,.65)" }}>
                    {s.time}
                  </span>
                </th>
              ))}
              <th style={{ borderLeft: "2px solid rgba(255,255,255,.12)" }}>Load</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ day, dl, cells }) => (
              <tr key={day}>
                <td className="day-cell">
                  <div className="day-orb">{DAY_LABELS[day]}</div>
                </td>
                {cells.map(({ slot, cell }) => (
                  <td key={slot.id} className="slot-cell">
                    {cell ? (
                      <div
                        className="chip-occ"
                        onMouseEnter={(e) => showTooltip(e, cell)}
                        onMouseLeave={hideTooltip}
                      >
                        <div className="chip-course">
                          {cell.c.length > 20 ? cell.c.substring(0, 18) + "…" : cell.c}
                        </div>
                        <div className="chip-tag">
                          {DAY_LABELS[day]} S{slot.id}
                        </div>
                      </div>
                    ) : (
                      <div className="chip-free"></div>
                    )}
                  </td>
                ))}
                <td className="load-cell">
                  <div className={`load-orb${dl > 5 ? " hi" : dl === 0 ? " zero" : ""}`}>
                    {dl}
                  </div>
                </td>
              </tr>
            ))}

            {/* Weekly total row */}
            <tr className="tot-row">
              <td className="day-cell">
                <div className="day-orb">WK</div>
              </td>
              {slotCounts.map((cnt, i) => (
                <td
                  key={i}
                  className="slot-cell"
                  style={{
                    fontFamily: "'Delius Swash Caps', sans-serif",
                    fontSize: ".82rem",
                    fontWeight: 800,
                    color: "var(--navy)",
                    textAlign: "center",
                  }}
                >
                  {cnt || "—"}
                </td>
              ))}
              <td className="load-cell">
                <div className="wk-pill">{wkTotal}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Tooltip tooltip={tooltip} />
    </div>
  );
}