/**
 * SAKSHAM Authoritative MPLADS 12-Sector Classification
 * Exactly matches backend / database canonical 12-sector standard.
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
