// Minimal 16x16 stroke icons for signal category section headers — hand
// rolled instead of pulling in an icon library for five glyphs. Consistent
// 1.6px stroke, rounded joins, no fill, so they sit quietly next to the
// existing uppercase label text rather than competing with it.
const PATHS = {
  "Company Filings": (
    <>
      <path d="M4 1.5h5l3 3v10a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5z" />
      <path d="M9 1.5v3h3" />
      <path d="M5.5 8.5h5M5.5 11h3" />
    </>
  ),
  "Analyst & Estimates": (
    <>
      <path d="M2 13.5V9M6 13.5V6M10 13.5V3M14 13.5v-5" />
      <path d="M1.5 13.5h13" />
    </>
  ),
  "Market Activity": (
    <path d="M1.5 8.5h3l2-5 3 9 2-7 1.5 3h2.5" />
  ),
  "Government & Political": (
    <>
      <path d="M2 6.5 8 2l6 4.5" />
      <path d="M2.5 6.5h11v6.5h-11z" />
      <path d="M5 9v3M8 9v3M11 9v3" />
      <path d="M1.5 13.5h13" />
    </>
  ),
  "Retail Sentiment": (
    <path d="M2 3h10a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1H7l-3 2.5v-2.5H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
  ),
};

export default function CategoryIcon({ category }) {
  const path = PATHS[category];
  if (!path) return null;

  return (
    <svg viewBox="0 0 16 16" className="category-icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  );
}
