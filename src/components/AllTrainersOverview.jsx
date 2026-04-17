import { useMemo } from "react";
import {
    SLOTS,
    DAYS,
    DAY_LABELS,
    TRAINER_NAMES,
    getCell,
    weekLoad,
} from "../data/timetableData";
import { useTooltip, Tooltip } from "./Tooltip";

export default function AllTrainersOverview() {
    const { tooltip, showTooltip, hideTooltip, moveTooltip } = useTooltip();

    const stats = useMemo(() => {
        let occ = 0;
        const total = TRAINER_NAMES.length * DAYS.length * SLOTS.length;
        TRAINER_NAMES.forEach((n) =>
            DAYS.forEach((d) =>
                SLOTS.forEach((s) => {
                    if (getCell(n, d, s.id)) occ++;
                })
            )
        );
        const loads = TRAINER_NAMES.map((n) => weekLoad(n));
        const maxL = Math.max(...loads);
        const maxN = TRAINER_NAMES[loads.indexOf(maxL)].split(" ")[0];
        return { occ, total, maxL, maxN };
    }, []);

    return (
        <div onMouseMove={moveTooltip}>
            <div className="sec-hdr">
                <h2>All Trainers — Weekly Overview</h2>
                <p>Each filled cell means occupied. Hover to see course details. Load = total occupied slots.</p>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card dark">
                    <div className="stat-val">{TRAINER_NAMES.length}</div>
                    <div className="stat-lbl">Trainers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{stats.occ}</div>
                    <div className="stat-lbl">Occupied Slots / Week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">{stats.total - stats.occ}</div>
                    <div className="stat-lbl">Free Slots / Week</div>
                </div>
                {/* <div className="stat-card">
                    <div className="stat-val">{stats.maxL}</div>
                    <div className="stat-lbl">Max Load · {stats.maxN}</div>
                </div> */}
            </div>

            {/* Legend */}
            <div className="legend">
                <div className="leg-item">
                    <div className="leg-box leg-occ"></div> Occupied
                </div>
                <div className="leg-item">
                    <div className="leg-box leg-free"></div> Free
                </div>
            </div>

            {/* Table */}
            <div className="ov-wrap">
                <div className="scroll-hint">← Scroll →</div>
                <table className="ov-table">
                    <thead>
                        <tr>
                            <th className="th-left" rowSpan={2} style={{ minWidth: 148 }}>Trainer</th>
                            {DAYS.map((d) => (
                                <th key={d} colSpan={SLOTS.length} className="day-group-th">
                                    {DAY_LABELS[d]}
                                </th>
                            ))}
                            <th rowSpan={2} style={{ borderLeft: "2px solid rgba(255,255,255,.12)" }}>Load</th>
                        </tr>
                        <tr>
                            {DAYS.map((d) =>
                                SLOTS.map((s) => (
                                    <th key={`${d}-${s.id}`} className="th-time">
                                        {s.time.split("–")[0]}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {TRAINER_NAMES.map((name) => (
                            <tr key={name}>
                                <td className="tn-cell">{name}</td>
                                {DAYS.map((d) =>
                                    SLOTS.map((s) => {
                                        const cell = getCell(name, d, s.id);
                                        return (
                                            <td key={`${d}-${s.id}`} className="ov-sc">
                                                {cell ? (
                                                    <span
                                                        className="ov-occ"
                                                        onMouseEnter={(e) => showTooltip(e, cell)}
                                                        onMouseLeave={hideTooltip}
                                                    >
                                                        ●
                                                    </span>
                                                ) : (
                                                    <span className="ov-free"></span>
                                                )}
                                            </td>
                                        );
                                    })
                                )}
                                <td className="ov-tot">{weekLoad(name)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Tooltip tooltip={tooltip} />
        </div>
    );
}