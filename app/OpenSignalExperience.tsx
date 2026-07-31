"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const adopters = [
  { name: "Malik Chen", role: "producer", image: "/adopter-malik.jpg" },
  { name: "Ana Torres", role: "percussion", image: "/adopter-ana.jpg" },
  { name: "Jules Mercer", role: "vocals", image: "/adopter-jules.jpg" },
] as const;

const bars = Array.from({ length: 72 }, (_, index) => {
  const wave = Math.abs(Math.sin(index * 0.91) * 13);
  const pulse = Math.abs(Math.cos(index * 0.27) * 9);
  return Math.round(5 + wave + pulse);
});

type DemoAudioHandle = {
  context: AudioContext;
  master: GainNode;
  timeout: number;
};

function scheduleTone(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  options: {
    type?: OscillatorType;
    volume?: number;
    attack?: number;
    filter?: number;
    detune?: number;
  } = {},
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  const {
    type = "triangle",
    volume = 0.045,
    attack = 0.025,
    filter,
    detune = 0,
  } = options;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(detune, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(volume, start + attack);
  envelope.gain.exponentialRampToValueAtTime(
    0.0001,
    start + Math.max(attack + 0.04, duration),
  );

  if (filter) {
    const lowPass = context.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.setValueAtTime(filter, start);
    oscillator.connect(lowPass).connect(envelope);
  } else {
    oscillator.connect(envelope);
  }

  envelope.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function scheduleKick(
  context: AudioContext,
  destination: AudioNode,
  start: number,
) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(118, start);
  oscillator.frequency.exponentialRampToValueAtTime(44, start + 0.16);
  envelope.gain.setValueAtTime(0.14, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + 0.24);
}

function scheduleHat(
  context: AudioContext,
  destination: AudioNode,
  start: number,
  volume = 0.018,
) {
  const buffer = context.createBuffer(
    1,
    Math.floor(context.sampleRate * 0.055),
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const highPass = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = buffer;
  highPass.type = "highpass";
  highPass.frequency.setValueAtTime(5200, start);
  envelope.gain.setValueAtTime(volume, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
  source.connect(highPass).connect(envelope).connect(destination);
  source.start(start);
}

function scheduleVersionPreview(
  context: AudioContext,
  destination: AudioNode,
  version: ContributionId,
) {
  const start = context.currentTime + 0.04;
  const beat = 60 / 106;
  const previewBeats = 14;

  [164.81, 196, 246.94].forEach((frequency, index) => {
    scheduleTone(
      context,
      destination,
      frequency,
      start,
      previewBeats * beat,
      {
        type: index === 0 ? "sine" : "triangle",
        volume: index === 0 ? 0.025 : 0.012,
        attack: 0.45,
        filter: 1200,
      },
    );
  });

  for (let beatIndex = 0; beatIndex < previewBeats; beatIndex += 1) {
    const at = start + beatIndex * beat;
    if (beatIndex % 2 === 0) scheduleKick(context, destination, at);
    scheduleHat(
      context,
      destination,
      at + beat * 0.5,
      beatIndex % 4 === 3 ? 0.026 : 0.014,
    );
  }

  if (version === "original") {
    const cadence = [329.63, 392, 493.88, 440, 392, 329.63, 293.66];
    cadence.forEach((frequency, index) => {
      scheduleTone(
        context,
        destination,
        frequency,
        start + (index * previewBeats * beat) / cadence.length,
        beat * 0.78,
        { type: "triangle", volume: 0.052, filter: 2400 },
      );
    });
  }

  if (version === "lowlight") {
    const counterline = [
      { beat: 1, frequency: 493.88 },
      { beat: 3.1, frequency: 392 },
      { beat: 5.2, frequency: 440 },
      { beat: 7.4, frequency: 369.99 },
      { beat: 10, frequency: 293.66 },
      { beat: 12, frequency: 329.63 },
    ];
    counterline.forEach(({ beat: offset, frequency }, index) => {
      scheduleTone(
        context,
        destination,
        frequency,
        start + offset * beat,
        beat * 1.35,
        {
          type: "sawtooth",
          volume: 0.032,
          attack: 0.08,
          filter: 1350,
          detune: index % 2 === 0 ? -4 : 3,
        },
      );
    });
  }

  if (version === "circuitromance") {
    const bassResponse = [82.41, 82.41, 98, 73.42, 110, 98, 82.41];
    bassResponse.forEach((frequency, index) => {
      const at = start + index * beat * 2;
      scheduleTone(context, destination, frequency, at, beat * 1.45, {
        type: "sawtooth",
        volume: 0.06,
        attack: 0.012,
        filter: index % 2 === 0 ? 520 : 760,
      });
      scheduleTone(context, destination, frequency * 2, at + beat * 0.35, beat * 0.35, {
        type: "square",
        volume: 0.012,
        filter: 900,
      });
    });
  }
}

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
      <small>Concept</small>
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
  playing,
  onSelect,
  onPlay,
}: {
  id: ContributionId;
  selected: boolean;
  accepted: boolean;
  playing: boolean;
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
      className={`wave-row${selected ? " is-selected" : ""}${accepted ? " is-accepted" : ""}${playing ? " is-playing" : ""}`}
      type="button"
      onClick={() => {
        onSelect();
        onPlay();
      }}
      aria-pressed={selected}
      aria-label={`${playing ? "Pause" : "Play"} ${data.handle} version`}
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
        <Icon name={playing ? "pause" : "play"} size={15} />
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
  playingId,
  onPlay,
  onAccept,
  onProfile,
  onClose,
}: {
  accepted: boolean;
  selected: ContributionId;
  onSelect: (id: ContributionId) => void;
  playingId: ContributionId | null;
  onPlay: (id: ContributionId) => void;
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
            <span className="audition-hint">
              <i aria-hidden="true" />
              Tap a version to hear it in context
            </span>
          </div>
          <div className="timeline-labels" aria-hidden="true">
            <span>0:30</span><span>0:42</span><span>0:56</span><span>1:10</span>
          </div>
          <div className="wave-rows">
            <WaveRow
              id="original"
              selected={selected === "original"}
              accepted={false}
              playing={playingId === "original"}
              onSelect={() => onSelect("original")}
              onPlay={() => onPlay("original")}
            />
            <WaveRow
              id="lowlight"
              selected={selected === "lowlight"}
              accepted={accepted}
              playing={playingId === "lowlight"}
              onSelect={() => onSelect("lowlight")}
              onPlay={() => onPlay("lowlight")}
            />
            <WaveRow
              id="circuitromance"
              selected={selected === "circuitromance"}
              accepted={false}
              playing={playingId === "circuitromance"}
              onSelect={() => onSelect("circuitromance")}
              onPlay={() => onPlay("circuitromance")}
            />
          </div>
          <p className="compare-caveat">Illustrative audio. Only this section changes.</p>
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
                <button type="button" onClick={() => onPlay("original")}>
                  <Icon name={playingId === "original" ? "pause" : "play"} size={14} />
                  {playingId === "original" ? "Pause original" : "Play original"}
                </button>
                <button type="button" onClick={() => onPlay(selected)}>
                  <Icon name={playingId === selected ? "pause" : "play"} size={14} />
                  {playingId === selected ? "Pause proposal" : "Play proposal"}
                </button>
              </div>
              <button className="comment-button" type="button"><Icon name="comment" size={17} />Comment</button>
            </>
          ) : (
            <div className="original-inspector">
              <span>Original section</span>
              <h3>The baseline</h3>
              <p>{playingId === "original" ? "Playing the baseline in context." : "Tap the original waveform to hear the baseline."}</p>
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
        <button
          type="button"
          aria-label={`${playingId === selected ? "Pause" : "Play"} selected version`}
          onClick={() => onPlay(selected)}
        >
          <Icon name={playingId === selected ? "pause" : "play"} />
        </button>
      </footer>
    </section>
  );
}

function ProfileScene({
  playing,
  onPlay,
  onClose,
}: {
  playing: boolean;
  onPlay: () => void;
  onClose: () => void;
}) {
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
        <button className="gradient-square" type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} Nia's work`}>
          <Icon name={playing ? "pause" : "play"} />
        </button>
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
          <button type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} accepted contribution`}>
            <Icon name={playing ? "pause" : "play"} />
          </button>
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
  playingId,
  onScene,
  onSelect,
  onAccept,
  onPlay,
}: {
  scene: Scene;
  accepted: boolean;
  selected: ContributionId;
  playingId: ContributionId | null;
  onScene: (scene: Scene) => void;
  onSelect: (id: ContributionId) => void;
  onAccept: () => void;
  onPlay: (id: ContributionId) => void;
}) {
  return (
    <div className={`phone-frame phone-frame--${scene}`}>
      <div className="phone-island" aria-hidden="true" />
      {scene === "player" ? (
        <PlayerScene
          playing={playingId === "original"}
          onTogglePlay={() => onPlay("original")}
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
          playingId={playingId}
          onPlay={onPlay}
          onAccept={onAccept}
          onProfile={() => onScene("profile")}
          onClose={() => onScene("call")}
        />
      ) : null}
      {scene === "profile" ? (
        <ProfileScene
          playing={playingId === "lowlight"}
          onPlay={() => onPlay("lowlight")}
          onClose={() => onScene(accepted ? "accepted" : "compare")}
        />
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
        <small>Reused by</small>
        <div className="avatar-stack">
          <img src="/nia-okafor.png" alt="Nia Okafor" title="Nia Okafor · producer" />
          {adopters.map((adopter) => (
            <img
              key={adopter.name}
              src={adopter.image}
              alt={adopter.name}
              title={`${adopter.name} · ${adopter.role}`}
            />
          ))}
        </div>
        <strong>12 projects</strong>
      </div>
    </div>
  );
}

export function OpenSignalExperience() {
  const [scene, setScene] = useState<Scene>("player");
  const [accepted, setAccepted] = useState(false);
  const [selected, setSelected] = useState<ContributionId>("lowlight");
  const [playingId, setPlayingId] = useState<ContributionId | null>(null);
  const audioHandle = useRef<DemoAudioHandle | null>(null);

  const stopAudio = useCallback(() => {
    const handle = audioHandle.current;
    if (handle) {
      window.clearTimeout(handle.timeout);
      const now = handle.context.currentTime;
      handle.master.gain.cancelScheduledValues(now);
      handle.master.gain.setValueAtTime(
        Math.max(handle.master.gain.value, 0.0001),
        now,
      );
      handle.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      window.setTimeout(() => {
        void handle.context.close();
      }, 80);
      audioHandle.current = null;
    }
    setPlayingId(null);
  }, []);

  const togglePreview = useCallback(
    async (version: ContributionId) => {
      if (playingId === version) {
        stopAudio();
        return;
      }

      stopAudio();
      const context = new AudioContext();
      await context.resume();
      const master = context.createGain();
      const compressor = context.createDynamicsCompressor();
      master.gain.setValueAtTime(0.82, context.currentTime);
      compressor.threshold.setValueAtTime(-18, context.currentTime);
      compressor.knee.setValueAtTime(18, context.currentTime);
      compressor.ratio.setValueAtTime(5, context.currentTime);
      master.connect(compressor).connect(context.destination);
      scheduleVersionPreview(context, master, version);

      const timeout = window.setTimeout(() => {
        void context.close();
        if (audioHandle.current?.context === context) {
          audioHandle.current = null;
          setPlayingId(null);
        }
      }, 8100);

      audioHandle.current = { context, master, timeout };
      setPlayingId(version);
    },
    [playingId, stopAudio],
  );

  useEffect(
    () => () => {
      const handle = audioHandle.current;
      if (!handle) return;
      window.clearTimeout(handle.timeout);
      void handle.context.close();
      audioHandle.current = null;
    },
    [],
  );

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
    stopAudio();
    navigate("player");
  }, [navigate, stopAudio]);

  const progress = useMemo(() => SCENES.indexOf(scene), [scene]);

  return (
    <main className="site-shell">
      <header className="site-header">
        <BrandMark />
        <p><strong>Open Signal</strong> · Interactive product specification</p>
        <button type="button" onClick={resetDemo} aria-label="Reset demo">
          <Icon name="reset" size={16} />
          <span>Reset demo</span>
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Hear every version. Credit what ships.</h1>
          <p>
            A product spec for directed contribution on Suno: compare one
            section, credit the work that ships, and turn collaboration into
            human reputation.
          </p>
          <SongRail
            playing={playingId === "original"}
            onTogglePlay={() => void togglePreview("original")}
          />
          <ol className="hero-steps">
            <li className={progress >= 1 ? "is-active" : ""}>
              <span>1</span>
              <div><strong>Open</strong><small>Name the section and the ask.</small></div>
            </li>
            <li className={progress >= 2 ? "is-active" : ""}>
              <span>2</span>
              <div><strong>Listen</strong><small>Switch versions in context.</small></div>
            </li>
            <li className={accepted ? "is-active" : ""}>
              <span>3</span>
              <div><strong>Credit</strong><small>Accept one. Preserve who made it.</small></div>
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
            playingId={playingId}
            onScene={navigate}
            onSelect={setSelected}
            onAccept={acceptContribution}
            onPlay={(version) => void togglePreview(version)}
          />
        </div>

        <aside className="proof-column">
          <div className="proof-column__copy">
            <span>Community, not content volume.</span>
            <h2>Make contribution legible.</h2>
            <p>The song owner keeps control. Accepted work builds reputation.</p>
          </div>
          <HumanProofCard accepted={accepted} onOpen={() => navigate("profile")} />
          <div className="trust-stack">
            <div><Icon name="verified" /><span><strong>Verified human</strong><small>Identity</small></span></div>
            <div><Icon name="check" /><span><strong>Credits verified</strong><small>Authorship</small></span></div>
            <div><Icon name="spark" /><span><strong>Native reputation</strong><small>Accepted work</small></span></div>
          </div>
        </aside>
      </section>

      <section className="lineage-section" aria-labelledby="lineage-title">
        <div className="section-heading">
          <div>
            <h2 id="lineage-title">Every version keeps its story.</h2>
            <p>Contribution, decision, and reuse stay connected.</p>
          </div>
          <span>Open Call lineage</span>
        </div>
        <LineageDiagram accepted={accepted} />
      </section>

      <section className="principles-section" aria-labelledby="principles-title">
        <div className="principles-heading">
          <h2 id="principles-title">Four rules keep it human.</h2>
          <p>Less feed. More authorship.</p>
        </div>
        <div className="principles-rail">
          <article><strong>Precise ask</strong><span>One section. One problem.</span></article>
          <article><strong>Listen in context</strong><span>Switch versions without losing the song.</span></article>
          <article><strong>Human credit</strong><span>Accepted work strengthens a real profile.</span></article>
          <article><strong>Portable lineage</strong><span>Credit travels when the sound does.</span></article>
        </div>
        <div className="product-horizon" aria-label="Product horizon">
          <span>Open Calls</span>
          <Icon name="arrow" size={17} />
          <span>Project Graph</span>
          <Icon name="arrow" size={17} />
          <span>Sound Registry</span>
        </div>
      </section>

      <section className="measurement-section" aria-labelledby="measurement-title">
        <div>
          <h2 id="measurement-title">Community outcomes</h2>
          <p>Does directed contribution help better music ship—and make human creativity more legible?</p>
        </div>
        <dl>
          <div><dt>Shipping</dt><dd>Song completion after an Open Call</dd></div>
          <div><dt>Retention</dt><dd>Creator and contributor return</dd></div>
          <div><dt>Reputation</dt><dd>Accepted credit is reused</dd></div>
          <div><dt>Trust</dt><dd>Spam and rights reports stay bounded</dd></div>
        </dl>
      </section>

      <footer className="site-footer">
        <p>Interactive product spec · Proposed experience and illustrative outcomes · Not affiliated with Suno</p>
        <p>Designed for the Staff Product Manager, mobile creation role</p>
      </footer>
    </main>
  );
}
