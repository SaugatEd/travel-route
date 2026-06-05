interface StopStoryProps {
  city: string;
  story?: string;
  history?: string;
  must?: string[];
  accent: string;
}

/** "About {city}" — the narrative + historical background + the don't-miss list.
 *  Pure STOPS data (story / history / must). */
export function StopStory({ city, story, history, must, accent }: StopStoryProps) {
  if (!story && !history && !(must && must.length)) return null;

  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="section-header">
        <h2 className="section-title">About {city}</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          The story of the place &amp; why it matters
        </span>
      </div>

      {story && <p className="stop-story-body">{story}</p>}

      {history && (
        <details className="stop-history">
          <summary style={{ color: accent }}>📜 History &amp; background</summary>
          <p>{history}</p>
        </details>
      )}

      {must && must.length > 0 && (
        <div className="stop-must">
          <div className="stop-must-title" style={{ color: accent }}>Don&apos;t miss</div>
          <ul>
            {must.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
