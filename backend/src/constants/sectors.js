/**
 * SAKSHAM Authoritative MPLADS 12-Sector Classification
 * Mandatory for all project recommendations, approvals, filtering, and risk analytics.
 */
export const MPLADS_SECTORS = [
  'Public & Community Buildings',
  'Public Conveniences, Safety & Security',
  'Education',
  'Public Health',
  'Drinking Water & Sanitation',
  'Irrigation, Drainage & Flood Control Systems',
  'Animal Husbandry, Dairy & Fisheries',
  'Agriculture & Farmer Welfare',
  'Energy Supply & Distribution Systems',
  'Railways, Roads, Bridges & Pathways',
  'Environment, Wild Animals, Forest & Other Natural Resources',
  'Public Recreational Facilities, Sports & Parks',
];

export function isValidSector(sector) {
  return MPLADS_SECTORS.includes(sector);
}
