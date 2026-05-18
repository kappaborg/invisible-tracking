// The presentation venue. All audience map previews on the wall pin to
// this coordinate when the override is active.
export const VENUE = {
  latitude: 43.821825,
  longitude: 18.309873,
  label: 'International University in Sarajevo',
  shortLabel: 'IUS · Sarajevo',
  mapsUrl: 'https://maps.app.goo.gl/3yCQDtoCWJ4864VQ8',
} as const;

export type Venue = typeof VENUE;
