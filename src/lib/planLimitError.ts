/**
 * Detects and parses the "product plan limit" error raised by the
 * `enforce_product_limit` Postgres trigger.
 *
 * The trigger raises:
 *   "Límite del plan alcanzado: tu plan permite máximo N productos. ..."
 * with ERRCODE = check_violation ('23514').
 */
export interface PlanLimitInfo {
  isPlanLimit: boolean;
  max: number | null;
  message: string;
}

export const parsePlanLimitError = (error: unknown): PlanLimitInfo => {
  const err = error as { message?: string; code?: string; details?: string } | null;
  const raw = [err?.message, err?.details].filter(Boolean).join(" ");
  const matchMax = raw.match(/máximo\s+(\d+)\s+productos/i);
  const isPlanLimit =
    /Límite del plan alcanzado/i.test(raw) ||
    (err?.code === "23514" && /producto/i.test(raw));

  return {
    isPlanLimit,
    max: matchMax ? Number(matchMax[1]) : null,
    message: raw || "Límite del plan alcanzado.",
  };
};
