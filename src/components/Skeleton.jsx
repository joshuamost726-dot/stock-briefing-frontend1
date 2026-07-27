// Generic pulsing placeholder block — width/height/className let callers
// shape it to whatever real content it's standing in for.
export function SkeletonBlock({ width, height, className = "" }) {
  return <div className={`skeleton-block ${className}`} style={{ width, height }} />;
}

// Placeholder grid matching the Dashboard's ticker-card layout, shown while
// /api/briefing/latest is still loading instead of plain "Loading…" text.
export function DashboardSkeleton({ count = 6 }) {
  return (
    <div className="ticker-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ticker-card">
          <div className="ticker-top">
            <SkeletonBlock width="60px" height="20px" />
            <SkeletonBlock width="70px" height="22px" className="skeleton-pill" />
          </div>
          <SkeletonBlock width="90px" height="40px" />
          <SkeletonBlock width="140px" height="14px" className="skeleton-margin-top" />
          <SkeletonBlock width="100%" height="36px" className="skeleton-margin-top" />
          <SkeletonBlock width="100%" height="6px" className="skeleton-margin-top skeleton-pill" />
        </div>
      ))}
    </div>
  );
}

// Placeholder shape matching TickerDetail's header + market-data +
// callout sections, shown while /api/ticker/:ticker is still loading.
export function TickerDetailSkeleton() {
  return (
    <div className="detail-page">
      <SkeletonBlock width="90px" height="14px" className="skeleton-margin-bottom" />
      <header className="detail-header">
        <div>
          <SkeletonBlock width="140px" height="40px" />
          <SkeletonBlock width="180px" height="14px" className="skeleton-margin-top" />
        </div>
        <SkeletonBlock width="108px" height="108px" className="skeleton-circle" />
      </header>
      <SkeletonBlock width="100%" height="90px" className="skeleton-margin-bottom skeleton-card" />
      <SkeletonBlock width="100%" height="120px" className="skeleton-margin-bottom skeleton-card" />
      <SkeletonBlock width="100%" height="80px" className="skeleton-margin-bottom skeleton-card" />
    </div>
  );
}
