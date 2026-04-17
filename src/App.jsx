import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import AllTrainersOverview from "./components/AllTrainersOverview";
import IndividualTimetable from "./components/IndividualTimetable";
import AdjustmentFinder from "./components/AdjustmentFinder";

// ── put your CSS here (the styles you already have) ──────────────────────────
// import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <div className="logo">
          <div className="logo-mark"><div className="logo-cube"></div></div>
          <div className="logo-text">
            TechTrainers<em className="em"> Class Adjustment Platform</em>
          </div>                                                         
        </div>
        <div className="hdr-badge">Even Sem · 2025–26</div>
      </header>

      <div className="tabs-bar modern-tabs">
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            "tab-btn modern-tab" + (isActive ? " active" : "")
          }
        >
          All Trainers Overview
        </NavLink>

        <NavLink
          to="/individual"
          className={({ isActive }) =>
            "tab-btn modern-tab" + (isActive ? " active" : "")
          }
        >
          Individual Timetable
        </NavLink>

        <NavLink
          to="/adjust"
          className={({ isActive }) =>
            "tab-btn modern-tab special-tab" + (isActive ? " active" : "")
          }
        >
          Adjustment Finder
        </NavLink>
      </div>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path="/overview"
            element={
              <div id="tab-overview" className="tab-content active">
                <AllTrainersOverview />
              </div>
            }
          />
          <Route
            path="/individual"
            element={
              <div id="tab-individual" className="tab-content active">
                <IndividualTimetable />
              </div>
            }
          />
          <Route
            path="/adjust"
            element={
              <div id="tab-adjust" className="tab-content active">
                <AdjustmentFinder />
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}