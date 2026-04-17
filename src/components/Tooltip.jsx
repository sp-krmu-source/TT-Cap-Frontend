import { useState, useCallback } from "react";

export function useTooltip() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, cell: null });

  const showTooltip = useCallback((e, cell) => {
    setTooltip({ visible: true, x: e.clientX + 16, y: e.clientY + 12, cell });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const moveTooltip = useCallback((e) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({ ...prev, x: e.clientX + 16, y: e.clientY + 12 }));
    }
  }, [tooltip.visible]);

  return { tooltip, showTooltip, hideTooltip, moveTooltip };
}

export function Tooltip({ tooltip }) {
  if (!tooltip.visible || !tooltip.cell) return null;
  return (
    <div
      id="tt"
      style={{ display: "block", left: tooltip.x, top: tooltip.y }}
    >
      <div className="tt-course">{tooltip.cell.c}</div>
      <div>{tooltip.cell.b}</div>
      <div className="tt-room">📍 {tooltip.cell.r}</div>
    </div>
  );
}