/**
 * The 80/20 Enforcer caps (§6.5). The system says "no" by design: to activate a
 * new venture beyond the cap, the operator must demote an existing one or send
 * the idea to the Idea Vault.
 *
 * Defaults: 2 primary + 1 experiment. Editable here (operator-owned config).
 */
export const FOCUS_CAPS = {
  primary: 2,
  experiment: 1,
} as const;
