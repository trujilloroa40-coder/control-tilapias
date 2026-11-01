import clsx from "clsx";
import {
  cycleStatusLabels,
  cycleStatusStyles,
  type CycleStatus,
} from "@/types/production";

export function CycleStatusBadge({ status }: { status: CycleStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1",
        cycleStatusStyles[status],
      )}
    >
      {cycleStatusLabels[status]}
    </span>
  );
}
