"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Scene = "player" | "call" | "compare" | "accepted" | "profile";
type ContributionId = "original" | "lowlight" | "circuitromance";
type IconName =
  | "arrow"
  | "check"
  | "chevron"
  | "close"
  | "comment"
  | "dots"
  | "pause"
  | "person"
  | "play"
  | "reset"
  | "share"
  | "spark"
  | "verified";

const SCENES: Scene[] = [
  "player",
  "call",
  "compare",
  "accepted",
  "profile",
];

const SCENE_LABELS: Record<Scene, string> = {
  player: "Player",
  call: "Open call",
  compare: "Compare",
  accepted: "Accepted",
  profile: "Profile",
};

const contributions = {
  lowlight: {
    handle: "@lowlight",
    title: "Muted trumpet counterline",
    note: "More tension, less stock cadence.",
    color: "#7f53df",
    tint: "#eee7ff",
  },
  circuitromance: {
    handle: "@circuitromance",
    title: "Granular bass response",
    note: "Sharper rhythm. Keep the negative space.",
    color: "#ef4f7b",
    tint: "#ffe7ee",
  },
} as const;

const bars = Array.from({ length: 72 }, (_, index) => {
  const wave = Math.abs(Math.sin(index * 0.91) * 13);
  const pulse = Math.abs(Math.cos(index * 0.27) * 9);
  return Math.round(5 + wave + pulse);
});

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "play") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M8 5.2v13.6c0 .85.94 1.36 1.65.9l10.2-6.8a1.08 1.08 0 0 0 0-1.8L9.65 4.3A1.07 1.07 0 0 0 8 5.2Z" />
      </svg>
    );
  }
  if (name === "pause") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <rect x="7" y="5" width="3.5" height="14" rx="1" />
        <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === "chevron") {
    return (
      <svg {...common}>
        <path d="m7 10 5 5 5-5" />
      </svg>
    );
  }
  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </svg>
    );
  }
  if (name === "dots") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <circle cx="5" cy="12" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="19" cy="12" r="1.6" />
      </svg>
    );
  }
  if (name === "share") {
    return (
      <svg {...common}>
        <path d="M15 8.5 19 5m0 0-4-3.5M19 5H9a4 4 0 0 0-4 4v2" />
        <path d="M8 8H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      </svg>
    );
  }
  if (name === "reset") {
    return (
      <svg {...common}>
        <path d="M4 4v6h6" />
        <path d="M5.4 16.6A8 8 0 1 0 5 8.2L4 10" />
      </svg>
    );
  }
  if (name === "person") {
    return (
      <svg {...common}>
        <circle cx="10" cy="7" r="3" />
        <path d="M4.5 20c.35-4 2.2-6 5.5-6s5.15 2 5.5 6M18 8v6M15 11h6" />
      </svg>
    );
  }
  if (name === "verified") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="m12 2 2.1 1.45 2.55-.2.8 2.42 2.18 1.34-.8 2.42.8 2.42-2.18 1.34-.8 2.42-2.55-.2L12 16.86l-2.1-1.45-2.55.2-.8-2.42-2.18-1.34.8-2.42-.8-2.42 2.18-1.34.8-2.42 2.55.2L12 2Z" />
        <path
          d="m8.7 9.3 2.05 2.05 4.55-4.55"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }
  if (name === "comment") {
    return (
      <svg {...common}>
        <path d="M4 5h16v11H9l-5 4V5Z" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M12 2c.7 5.3 3.2 7.8 8 8-4.8.2-7.3 2.7-8 8-.7-5.3-3.2-7.8-8-8 4.8-.2 7.3-2.7 8-8Z" />
      </svg>
    );
  }
  return null;
}

function WaveBars({
  color = "#26252a",
  quiet = false,
}: {
  color?: string;
  quiet?: boolean;
}) {
  return (
    <div className={`wave-bars${quiet ? " is-quiet" : ""}`} aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          style={{
            height: `${quiet ? Math.max(3, Math.round(height * 0.55)) : height}px`,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}

function MiniWaveform() {
  return (
    <div className="mini-waveform" aria-label="Song waveform">
      <WaveBars color="#a7a4a7" quiet />
      <span className="mini-waveform__progress" />
    </div>
  );
}

function BrandMark() {
  return (
    <div className="brand" aria-label="Suno concept">
      <span className="brand__orb" aria-hidden="true" />
      <span>Suno</span>
    </div>
  );
}

function VerifiedHuman({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`verified-human${compact ? " is-compact" : ""}`}>
      <Icon name="verified" size={compact ? 15 : 18} />
      {compact ? "Verified" : "Verified human"}
    </span>
  );
}

function PlayerScene({
  playing,
  onTogglePlay,
  onOpenCall,
}: {
  playing: boolean;
  onTogglePlay: () => void;
  onOpenCall: () => void;
}) {
  return (
    <section className="player-scene scene" aria-label="Open Signal player">
      <img
        className="player-scene__art"
        src="/open-signal-cover.png"
        alt="Mara Venn leaning on a car against a city skyline at night"
      />
      <div className="player-scene__shade" />
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <span>● ●● ◒</span>
      </div>
      <header className="player-scene__header">
        <div>
          <h2>Open Signal</h2>
          <button className="artist-link" type="button">
            <span className="artist-orb" />
            Mara Venn
            <VerifiedHuman compact />
          </button>
        </div>
        <button className="round-control round-control--dark" type="button" aria-label="Collapse player">
          <Icon name="chevron" size={26} />
        </button>
      </header>
      <nav className="action-rail" aria-label="Song actions">
        <button type="button" aria-label="Like">
          <span aria-hidden="true">♥</span>
          <small>0</small>
        </button>
        <button type="button" aria-label="Share">
          <Icon name="share" size={22} />
        </button>
        <button
          className="action-rail__open-call"
          type="button"
          onClick={onOpenCall}
          aria-label="Open the collaboration call"
        >
          <span className="open-call-glyph" aria-hidden="true" />
          <small>Open call</small>
        </button>
        <button type="button" aria-label="More actions">
          <Icon name="dots" />
        </button>
      </nav>
      <div className="player-controls">
        <div className="section-marker">0:42–0:56</div>
        <div className="player-controls__row">
          <button
            type="button"
            className="bare-control"
            onClick={onTogglePlay}
            aria-label={playing ? "Pause Open Signal" : "Play Open Signal"}
          >
            <Icon name={playing ? "pause" : "play"} size={25} />
          </button>
          <span>0:42</span>
          <div className={`progress-track${playing ? " is-playing" : ""}`}>
            <span className="progress-track__before" />
            <span className="progress-track__call" />
            <span className="progress-track__after" />
          </div>
          <span>0:56</span>
        </div>
        <button className="open-call-primary" type="button" onClick={onOpenCall}>
          Open the call
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </section>
  );
}

function BranchPreview() {
  return (
    <div className="branch-preview" aria-label="Original section and two proposed alternatives">
      <span className="branch-preview__time branch-preview__time--start">0:42</span>
      <span className="branch-preview__time branch-preview__time--end">0:56</span>
      <div className="branch-preview__context branch-preview__context--left">
        <WaveBars color="#b7b4b4" quiet />
      </div>
      <div className="branch-preview__tracks">
        <div><WaveBars color="#de654f" /></div>
        <div><WaveBars color="#7b315d" /></div>
        <div><WaveBars color="#3a59bd" /></div>
      </div>
      <div className="branch-preview__context branch-preview__context--right">
        <WaveBars color="#b7b4b4" quiet />
      </div>
    </div>
  );
}

function CallScene({
  onClose,
  onCompare,
}: {
  onClose: () => void;
  onCompare: () => void;
}) {
  return (
    <section className="call-scene scene" aria-label="Open call details">
      <div className="call-scene__art">
        <img
          src="/open-signal-cover.png"
          alt="Open Signal cover artwork"
        />
        <div className="status-bar status-bar--light" aria-hidden="true">
          <strong>9:41</strong>
          <span>● ●● ◒</span>
        </div>
        <div className="song-ribbon">
          <div>
            <h2>Open Signal <span className="model-tag">v5.5</span></h2>
            <p><span className="artist-orb" /> Mara Venn</p>
          </div>
          <button className="round-control round-control--dark" type="button" onClick={onClose} aria-label="Close open call">
            <Icon name="chevron" size={25} />
          </button>
        </div>
      </div>
      <div className="call-sheet">
        <span className="sheet-handle" aria-hidden="true" />
        <div className="call-sheet__header">
          <h2>Open call</h2>
          <button className="round-control" type="button" onClick={onClose} aria-label="Close open call">
            <Icon name="close" />
          </button>
        </div>
        <BranchPreview />
        <div className="branch-key" aria-label="Waveform key">
          <span><i style={{ background: "#de654f" }} />Original</span>
          <span><i style={{ background: "#7b315d" }} />@lowlight</span>
          <span><i style={{ background: "#3a59bd" }} />@circuitromance</span>
        </div>
        <div className="call-copy">
          <h3>Replace the guitar riff</h3>
          <p>Keep the tension. Lose the stock indie cadence.</p>
          <small>106 BPM <b>·</b> E minor <b>·</b> 14 sec</small>
        </div>
        <div className="call-sheet__actions">
          <span><Icon name="person" /> 2 contributions</span>
          <button type="button" onClick={onCompare}>
            Compare
            <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="requested-by">
          <span className="artist-orb" />
          <div>
            <strong>Requested by Mara Venn</strong>
            <small>2 hours ago</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function WaveRow({
  id,
  selected,
  accepted,
  onSelect,
  onPlay,
}: {
  id: ContributionId;
  selected: boolean;
  accepted: boolean;
  onSelect: () => void;
  onPlay: () => void;
}) {
  const isOriginal = id === "original";
  const data = isOriginal
    ? {
        handle: "Original",
        color: "#28272d",
        tint: "#efedeb",
      }
    : contributions[id];

  return (
    <button
      className={`wave-row${selected ? " is-selected" : ""}${accepted ? " is-accepted" : ""}`}
      type="button"
      onClick={() => {
        onSelect();
        onPlay();
      }}
      aria-pressed={selected}
    >
      <span
        className="wave-row__label"
        style={{
          color: isOriginal ? "#25242a" : data.color,
          background: data.tint,
        }}
      >
        {data.handle}
      </span>
      <span className="wave-row__play" aria-hidden="true">
        <Icon name="play" size={15} />
      </span>
      <span className="wave-row__wave">
        <span className="wave-row__before"><WaveBars color="#c4c1c1" quiet /></span>
        <span className="wave-row__branch" style={{ color: data.color }}>
          <WaveBars color={data.color} />
        </span>
        <span className="wave-row__after"><WaveBars color="#c4c1c1" quiet /></span>
      </span>
      {accepted ? (
        <span className="accepted-flag"><Icon name="check" size={14} /> Accepted</span>
      ) : null}
    </button>
  );
}

function CompareScene({
  accepted,
  selected,
  onSelect,
  onAccept,
  onProfile,
  onClose,
}: {
  accepted: boolean;
  selected: ContributionId;
  onSelect: (id: ContributionId) => void;
  onAccept: () => void;
  onProfile: () => void;
  onClose: () => void;
}) {
  const selectedData =
    selected === "original" ? null : contributions[selected];

  return (
    <section className="compare-scene scene" aria-label="Compare contributions">
      <header className="compare-header">
        <button className="round-control" type="button" onClick={onClose} aria-label="Back to open call">
          <span className="back-arrow" aria-hidden="true">‹</span>
        </button>
        <img src="/open-signal-cover.png" alt="" />
        <div>
          <h2>Open Signal <span className="model-tag">v5.5</span></h2>
          <p>Mara Venn</p>
        </div>
        <span className="compare-header__mode">Collaborate</span>
        <button className="round-control compare-header__more" type="button" aria-label="More">
          <Icon name="dots" />
        </button>
      </header>
      <div className="compare-body">
        <div className="compare-canvas">
          <div className="compare-copy">
            <strong>Replace section 0:42–0:56 <span>(14s)</span></strong>
            <small>Guitar riff</small>
          </div>
          <div className="timeline-labels" aria-hidden="true">
            <span>0:30</span><span>0:42</span><span>0:56</span><span>1:10</span>
          </div>
          <div className="wave-rows">
            <WaveRow
              id="original"
              selected={selected === "original"}
              accepted={false}
              onSelect={() => onSelect("original")}
              onPlay={() => onSelect("original")}
            />
            <WaveRow
              id="lowlight"
              selected={selected === "lowlight"}
              accepted={accepted}
              onSelect={() => onSelect("lowlight")}
              onPlay={() => onSelect("lowlight")}
            />
            <WaveRow
              id="circuitromance"
              selected={selected === "circuitromance"}
              accepted={false}
              onSelect={() => onSelect("circuitromance")}
              onPlay={() => onSelect("circuitromance")}
            />
          </div>
          <p className="compare-caveat">Only this section changes. The rest of the track stays the same.</p>
        </div>
        <aside className="contribution-inspector" aria-live="polite">
          {selectedData ? (
            <>
              <button className="round-control contribution-inspector__close" type="button" onClick={onClose} aria-label="Close comparison">
                <Icon name="close" />
              </button>
              <h3>{selectedData.title}</h3>
              <p className="contribution-inspector__byline">
                by <strong style={{ color: selectedData.color }}>{selectedData.handle}</strong>
              </p>
              <button className="profile-inline" type="button" onClick={onProfile}>
                {selected === "lowlight" ? (
                  <img src="/nia-okafor.png" alt="" />
                ) : (
                  <span className="artist-orb artist-orb--large" />
                )}
                <span>
                  <strong>{selected === "lowlight" ? "Nia Okafor" : "Circuit Romance"}</strong>
                  <small>{selected === "lowlight" ? "Verified human" : "Verified group"}</small>
                </span>
                <Icon name="verified" size={17} />
              </button>
              <p className="contribution-note">{selectedData.note}</p>
              {accepted && selected === "lowlight" ? (
                <div className="accepted-panel">
                  <span><Icon name="spark" /> Accepted into Open Signal</span>
                  <button type="button" onClick={onProfile}>
                    View Nia’s profile
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              ) : (
                <button
                  className="gradient-button"
                  type="button"
                  disabled={selected !== "lowlight"}
                  onClick={onAccept}
                >
                  <Icon name="spark" />
                  {selected === "lowlight" ? "Accept contribution" : "Choose @lowlight to accept"}
                </button>
              )}
              <div className="inspector-actions">
                <button type="button"><Icon name="play" size={14} />Play original</button>
                <button type="button"><Icon name="play" size={14} />Play proposal</button>
              </div>
              <button className="comment-button" type="button"><Icon name="comment" size={17} />Comment</button>
            </>
          ) : (
            <div className="original-inspector">
              <span>Original section</span>
              <h3>The baseline</h3>
              <p>Hear the stock guitar cadence before auditioning alternatives.</p>
              <button type="button" onClick={() => onSelect("lowlight")}>
                Review @lowlight
                <Icon name="arrow" size={17} />
              </button>
            </div>
          )}
        </aside>
      </div>
      <footer className="compare-player">
        <img src="/open-signal-cover.png" alt="" />
        <div><strong>Open Signal</strong><small>Mara Venn</small></div>
        <button type="button" aria-label="Play selected version"><Icon name="play" /></button>
      </footer>
    </section>
  );
}

function ProfileScene({ onClose }: { onClose: () => void }) {
  return (
    <section className="profile-scene scene" aria-label="Nia Okafor profile">
      <div className="status-bar" aria-hidden="true">
        <strong>9:41</strong>
        <span>● ●● ◒</span>
      </div>
      <button className="round-control profile-scene__close" type="button" onClick={onClose} aria-label="Close profile">
        <Icon name="close" />
      </button>
      <img className="profile-scene__portrait" src="/nia-okafor.png" alt="Nia Okafor in a recording studio" />
      <h2>Nia Okafor</h2>
      <p className="profile-handle">@lowlight</p>
      <VerifiedHuman />
      <div className="reputation-stats" aria-label="Suno reputation">
        <div><strong>18</strong><span>Accepted</span></div>
        <div><strong>46</strong><span>Reuses</span></div>
        <div><strong>7</strong><span>Open calls</span></div>
      </div>
      <div className="profile-actions">
        <button type="button"><Icon name="person" />Follow</button>
        <button type="button" aria-label="Share Nia's profile"><Icon name="share" /></button>
        <button className="gradient-square" type="button" aria-label="Play Nia's work"><Icon name="play" /></button>
      </div>
      <small className="follower-count">1,132 followers</small>
      <section className="credits">
        <div className="section-title-row">
          <h3>Selected credits</h3>
          <span><Icon name="verified" size={16} /> Credits verified</span>
        </div>
        <p><span aria-hidden="true">◉</span> <strong>Hollow City</strong> — producer</p>
        <p><span aria-hidden="true">▮▮</span> <strong>Northline Studios</strong> — sound design</p>
      </section>
      <section className="profile-contributions">
        <h3>Contributions</h3>
        <article>
          <img src="/open-signal-cover.png" alt="" />
          <div>
            <small>Accepted</small>
            <strong>Muted trumpet counterline accepted into Open Signal</strong>
            <span>0:42–0:56 · Mara Venn</span>
          </div>
          <button type="button" aria-label="Play accepted contribution"><Icon name="play" /></button>
        </article>
        <article>
          <div className="texture-art" aria-hidden="true" />
          <div>
            <small>Reused</small>
            <strong>Drum texture reused in 12 projects</strong>
            <span>Last used 2d ago · 12 projects</span>
          </div>
          <button type="button" aria-label="Play reused texture"><Icon name="play" /></button>
        </article>
      </section>
    </section>
  );
}

function PhoneDemo({
  scene,
  accepted,
  selected,
  playing,
  onScene,
  onSelect,
  onAccept,
  onTogglePlay,
}: {
  scene: Scene;
  accepted: boolean;
  selected: ContributionId;
  playing: boolean;
  onScene: (scene: Scene) => void;
  onSelect: (id: ContributionId) => void;
  onAccept: () => void;
  onTogglePlay: () => void;
}) {
  return (
    <div className={`phone-frame phone-frame--${scene}`}>
      <div className="phone-island" aria-hidden="true" />
      {scene === "player" ? (
        <PlayerScene
          playing={playing}
          onTogglePlay={onTogglePlay}
          onOpenCall={() => onScene("call")}
        />
      ) : null}
      {scene === "call" ? (
        <CallScene
          onClose={() => onScene("player")}
          onCompare={() => onScene("compare")}
        />
      ) : null}
      {scene === "compare" || scene === "accepted" ? (
        <CompareScene
          accepted={accepted}
          selected={selected}
          onSelect={onSelect}
          onAccept={onAccept}
          onProfile={() => onScene("profile")}
          onClose={() => onScene("call")}
        />
      ) : null}
      {scene === "profile" ? (
        <ProfileScene onClose={() => onScene(accepted ? "accepted" : "compare")} />
      ) : null}
    </div>
  );
}

function SongRail({
  playing,
  onTogglePlay,
}: {
  playing: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <div className="song-rail">
      <img src="/open-signal-cover.png" alt="" />
      <div className="song-rail__meta">
        <h2>Open Signal <span className="model-tag">v5.5</span></h2>
        <strong>Mara Venn</strong>
        <small>art-pop / indietronica · 106 BPM · E minor</small>
      </div>
      <button type="button" onClick={onTogglePlay} aria-label={playing ? "Pause Open Signal" : "Play Open Signal"}>
        <Icon name={playing ? "pause" : "play"} />
      </button>
      <div className="song-rail__timeline">
        <MiniWaveform />
        <span>0:00</span>
        <span>3:18</span>
      </div>
      <button className="song-rail__more" type="button" aria-label="More"><Icon name="dots" /></button>
    </div>
  );
}

function HumanProofCard({ accepted, onOpen }: { accepted: boolean; onOpen: () => void }) {
  return (
    <button className="human-proof-card" type="button" onClick={onOpen}>
      <span className="human-proof-card__label">Human proof</span>
      <img src="/nia-okafor.png" alt="" />
      <div>
        <strong>Nia Okafor</strong>
        <span>@lowlight</span>
        <VerifiedHuman compact />
      </div>
      <p>
        {accepted
          ? "Accepted into Open Signal"
          : "18 accepted contributions"}
      </p>
      <Icon name="arrow" size={17} />
    </button>
  );
}

function LineageDiagram({ accepted }: { accepted: boolean }) {
  return (
    <div className={`lineage-diagram${accepted ? " is-accepted" : ""}`}>
      <div className="lineage-node lineage-node--source">
        <small>Original section</small>
        <strong>0:42–0:56</strong>
        <span>Mara Venn</span>
        <MiniWaveform />
      </div>
      <div className="lineage-split" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="lineage-proposals">
        <div className="lineage-node">
          <small>Proposal A</small>
          <strong>Muted trumpet counterline</strong>
          <span>by @lowlight</span>
        </div>
        <div className="lineage-node">
          <small>Proposal B</small>
          <strong>Granular bass response</strong>
          <span>by @circuitromance</span>
        </div>
      </div>
      <div className="lineage-merge" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="lineage-node lineage-node--accepted">
        <small>{accepted ? "Accepted" : "Maintainer decision"}</small>
        <strong>{accepted ? "In the track" : "One canonical version"}</strong>
        <span>{accepted ? "Nia receives durable credit" : "Credit follows what ships"}</span>
      </div>
      <div className="lineage-arrow"><Icon name="arrow" /></div>
      <div className="downstream">
        <strong>Downstream adoption</strong>
        <div className="avatar-stack" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <span>Used in 12 projects</span>
      </div>
    </div>
  );
}

export function OpenSignalExperience() {
  const [scene, setScene] = useState<Scene>("player");
  const [accepted, setAccepted] = useState(false);
  const [selected, setSelected] = useState<ContributionId>("lowlight");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const syncFromLocation = () => {
      const next = new URLSearchParams(window.location.search).get("scene") as Scene | null;
      setScene(next && SCENES.includes(next) ? next : "player");
      setAccepted((current) => {
        if (current || next === "accepted" || next === "profile") return true;
        return window.localStorage.getItem("open-signal:accepted") === "true";
      });
    };

    const animationFrame = window.requestAnimationFrame(syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  const navigate = useCallback((next: Scene) => {
    setScene(next);
    const url = new URL(window.location.href);
    if (next === "player") {
      url.searchParams.delete("scene");
    } else {
      url.searchParams.set("scene", next);
    }
    window.history.pushState({}, "", url);
  }, []);

  const acceptContribution = useCallback(() => {
    setAccepted(true);
    setSelected("lowlight");
    window.localStorage.setItem("open-signal:accepted", "true");
    navigate("accepted");
  }, [navigate]);

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem("open-signal:accepted");
    setAccepted(false);
    setSelected("lowlight");
    setPlaying(false);
    navigate("player");
  }, [navigate]);

  const progress = useMemo(() => SCENES.indexOf(scene), [scene]);

  return (
    <main className="site-shell">
      <header className="site-header">
        <BrandMark />
        <p>A product concept by Bo Abrams</p>
        <button type="button" onClick={resetDemo} aria-label="Reset demo">
          <Icon name="reset" size={16} />
          <span>Reset demo</span>
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Make human contribution legible.</h1>
          <p>
            Open Calls turn a promising song section into an invitation—and
            accepted work into durable creative reputation.
          </p>
          <SongRail playing={playing} onTogglePlay={() => setPlaying((value) => !value)} />
          <ol className="hero-steps">
            <li className={progress >= 1 ? "is-active" : ""}>
              <span>1</span>
              <div><strong>Open a section</strong><small>Define the exact time and what you need.</small></div>
            </li>
            <li className={progress >= 2 ? "is-active" : ""}>
              <span>2</span>
              <div><strong>Review contributions</strong><small>Compare alternatives from real producers.</small></div>
            </li>
            <li className={accepted ? "is-active" : ""}>
              <span>3</span>
              <div><strong>Credit what ships</strong><small>Accept one into the track. Credit stays visible.</small></div>
            </li>
          </ol>
        </div>

        <div className="demo-column">
          <div className="scene-tabs" aria-label="Demo scenes">
            {SCENES.map((item) => (
              <button
                key={item}
                type="button"
                className={scene === item ? "is-active" : ""}
                onClick={() => navigate(item)}
                disabled={item === "accepted" && !accepted}
              >
                {SCENE_LABELS[item]}
              </button>
            ))}
          </div>
          <PhoneDemo
            scene={scene}
            accepted={accepted}
            selected={selected}
            playing={playing}
            onScene={navigate}
            onSelect={setSelected}
            onAccept={acceptContribution}
            onTogglePlay={() => setPlaying((value) => !value)}
          />
        </div>

        <aside className="proof-column">
          <div className="proof-column__copy">
            <span>Not more remixing.</span>
            <h2>Directed contribution.</h2>
            <p>
              A creator names the problem. Producers answer with craft.
              The maintainer decides what becomes canonical.
            </p>
          </div>
          <HumanProofCard accepted={accepted} onOpen={() => navigate("profile")} />
          <div className="trust-stack">
            <div><Icon name="verified" /><span><strong>Verified human</strong><small>Identity, not celebrity</small></span></div>
            <div><Icon name="check" /><span><strong>Credits verified</strong><small>External work, substantiated</small></span></div>
            <div><Icon name="spark" /><span><strong>Native reputation</strong><small>Accepted work and reuse</small></span></div>
          </div>
        </aside>
      </section>

      <section className="lineage-section" aria-labelledby="lineage-title">
        <div className="section-heading">
          <div>
            <h2 id="lineage-title">The decision becomes the network.</h2>
            <p>Project ancestry stays readable after the song leaves the editor.</p>
          </div>
          <span>Open Call lineage</span>
        </div>
        <LineageDiagram accepted={accepted} />
      </section>

      <section className="system-section" aria-labelledby="system-title">
        <div className="system-thesis">
          <h2 id="system-title">Start with one section.<br />Build toward an open sound registry.</h2>
          <p>
            GitHub made contribution, ancestry, and reputation visible for code.
            Suno can make those same primitives musical—and unmistakably human.
          </p>
        </div>
        <div className="system-sequence">
          <article>
            <span>Now</span>
            <h3>Open Calls</h3>
            <p>Ask for help at the exact point where another person’s taste can improve the work.</p>
          </article>
          <Icon name="arrow" />
          <article>
            <span>Next</span>
            <h3>Project Graph</h3>
            <p>Make accepted decisions, contributors, and downstream adoption visible.</p>
          </article>
          <Icon name="arrow" />
          <article>
            <span>Later</span>
            <h3>Open Sound Registry</h3>
            <p>Give reusable sounds provenance without pretending provenance is already a commercial license.</p>
          </article>
        </div>
      </section>

      <section className="measurement-section" aria-labelledby="measurement-title">
        <div>
          <h2 id="measurement-title">The product bet</h2>
          <p>
            Better songs pull creators back. Visible credit pulls skilled
            contributors in. Together they create a quality loop ordinary
            remixing cannot.
          </p>
        </div>
        <dl>
          <div><dt>Primary signal</dt><dd>Accepted contributions per Open Call within seven days</dd></div>
          <div><dt>Retention proof</dt><dd>Creator return and contributor repeat rate</dd></div>
          <div><dt>Catalog proof</dt><dd>Project publication and downstream reuse</dd></div>
          <div><dt>Guardrails</dt><dd>Spam, abandonment, reports, and rights disputes</dd></div>
        </dl>
      </section>

      <footer className="site-footer">
        <p>Concept prototype · Illustrative people and data · Not affiliated with Suno</p>
        <p>Designed for the Staff Product Manager, mobile creation role</p>
      </footer>
    </main>
  );
}
