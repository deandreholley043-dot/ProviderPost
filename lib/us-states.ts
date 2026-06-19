// Backward-compatible re-export — all consumers continue to work unchanged
export type { Region as USState } from "./regions"
export { US_STATES, CA_PROVINCES, ALL_REGIONS, getStateName, getRegionName } from "./regions"
