"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Scene = "browse" | "player" | "call" | "submit" | "compare" | "accepted" | "profile";
type ContributionId = "original" | "lowlight" | "circuitromance";
type CreatorContributionId = Exclude<ContributionId, "original">;
type SubmissionMethod = "record" | "remix" | "upload";
type IconName =
  | "arrow"
  | "back"
  | "check"
  | "chevron"
  | "close"
  | "comment"
  | "disc"
  | "dots"
  | "heart"
  | "pause"
  | "person"
  | "play"
  | "record"
  | "remix"
  | "reset"
  | "share"
  | "spark"
  | "star"
  | "studio"
  | "upload"
  | "verified";

const SCENES: Scene[] = [
  "browse",
  "player",
  "call",
  "submit",
  "compare",
  "accepted",
  "profile",
];

const SCENE_LABELS: Record<Scene, string> = {
  browse: "Browse",
  player: "Player",
  call: "Open call",
  submit: "Submit",
  compare: "Compare",
  accepted: "Accepted",
  profile: "Profile",
};

const contributions = {
  lowlight: {
    handle: "@lowlight",
    title: "Muted trumpet counterline",
    note: "More tension, fewer safe choices.",
    color: "#ff5ca8",
    tint: "rgba(255, 92, 168, 0.16)",
    name: "Nia Okafor",
    image: "/nia-okafor.png",
    verification: "Verified creator",
    acceptedCount: 18,
    reuses: 46,
    openCalls: 7,
    followers: "1,132",
    album: "Hollow City",
    workplace: "Northline Studios",
  },
  circuitromance: {
    handle: "@circuitromance",
    title: "Granular bass response",
    note: "Sharper rhythm. Keep the negative space.",
    color: "#ff9d47",
    tint: "rgba(255, 157, 71, 0.16)",
    name: "Malik Chen",
    image: "/adopter-malik.jpg",
    verification: "Verified creator",
    acceptedCount: 11,
    reuses: 31,
    openCalls: 4,
    followers: "824",
    album: "Glass Transit",
    workplace: "Circuit Romance Studio",
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
  if (name === "star") {
    return (
      <svg {...common}>
        <path d="M12 3.4l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8L12 3.4z" />
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
  if (name === "back") {
    return (
      <svg {...common}>
        <path d="m15 18-6-6 6-6" />
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
        <path d="M12 15V3m0 0L8 7m4-4 4 4" />
        <path d="M7 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg {...common}>
        <path d="M20.8 4.6a5.4 5.4 0 0 0-7.7 0L12 5.7l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.7Z" />
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
  if (name === "record") {
    return (
      <svg {...common}>
        <rect x="9" y="3" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
      </svg>
    );
  }
  if (name === "remix") {
    return (
      <svg {...common}>
        <path d="M4 7h5l6 10h5" />
        <path d="m17 14 3 3-3 3M4 17h5l2-3M15 7h5m-3-3 3 3-3 3" />
      </svg>
    );
  }
  if (name === "upload") {
    return (
      <svg {...common}>
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M5 14v5h14v-5" />
      </svg>
    );
  }
  if (name === "disc") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    );
  }
  if (name === "studio") {
    return (
      <svg {...common}>
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M8 20v-7h8v7M3 20h18" />
      </svg>
    );
  }
  return null;
}

function StatusIcons() {
  return (
    <svg className="status-icons" width="50" height="13" viewBox="0 0 50 13" fill="none" aria-hidden="true">
      <rect x="0" y="9" width="2.5" height="4" rx="1" fill="currentColor" />
      <rect x="4.5" y="6.5" width="2.5" height="6.5" rx="1" fill="currentColor" />
      <rect x="9" y="3.5" width="2.5" height="9.5" rx="1" fill="currentColor" />
      <rect x="13.5" y="0.5" width="2.5" height="12.5" rx="1" fill="currentColor" />
      <path d="M21 4.4c3.3-3 8.7-3 12 0M23.6 7.1c1.9-1.7 5-1.7 6.9 0M26.5 10.1a.8.8 0 1 0 1.6 0 .8.8 0 0 0-1.6 0Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="37" y="2" width="11" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.25" />
      <rect x="38.7" y="3.7" width="7.7" height="5.6" rx="1.1" fill="currentColor" />
      <path d="M49.1 5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
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
    <div className="brand" aria-label="Open Signal, an independent concept for Suno">
      <svg className="brand__wave" viewBox="0 0 34 34" aria-hidden="true">
        <rect x="6" y="11" width="4" height="12" rx="2" />
        <rect x="15" y="6" width="4" height="22" rx="2" />
        <rect x="24" y="13" width="4" height="8" rx="2" />
      </svg>
      <span>Open Signal</span>
      <small>Independent concept<br />for Suno</small>
    </div>
  );
}

function VerifiedHuman({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`verified-human${compact ? " is-compact" : ""}`}>
      <Icon name="verified" size={compact ? 15 : 18} />
      {compact ? "Verified" : "Verified creator"}
    </span>
  );
}

function PlayerScene({
  playing,
  liked,
  onTogglePlay,
  onToggleLike,
  onOpenCall,
  onShare,
}: {
  playing: boolean;
  liked: boolean;
  onTogglePlay: () => void;
  onToggleLike: () => void;
  onOpenCall: () => void;
  onShare: () => void;
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
        <StatusIcons />
      </div>
      <header className="player-scene__header">
        <div>
          <h2>Open Signal</h2>
          <div className="artist-link">
            <span className="artist-orb" />
            Mara Venn
            <VerifiedHuman compact />
          </div>
        </div>
      </header>
      <nav className="action-rail" aria-label="Song actions">
        <button className={liked ? "is-liked" : ""} type="button" onClick={onToggleLike} aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked}>
          <Icon name="heart" size={21} />
          <small>{liked ? "342" : "341"}</small>
        </button>
        <button type="button" onClick={onShare} aria-label="Share Open Signal">
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
        <WaveBars color="rgba(255, 255, 255, 0.3)" quiet />
      </div>
      <div className="branch-preview__tracks">
        <div><WaveBars color="#e9e2da" /></div>
        <div><WaveBars color="#ff5ca8" /></div>
        <div><WaveBars color="#ff9d47" /></div>
      </div>
      <div className="branch-preview__context branch-preview__context--right">
        <WaveBars color="rgba(255, 255, 255, 0.3)" quiet />
      </div>
    </div>
  );
}

function CallScene({
  onClose,
  onContribute,
  onCompare,
}: {
  onClose: () => void;
  onContribute: () => void;
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
          <StatusIcons />
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
          <span><i style={{ background: "#e9e2da" }} />Original</span>
          <span><i style={{ background: "#ff5ca8" }} />@lowlight</span>
          <span><i style={{ background: "#ff9d47" }} />@circuitromance</span>
        </div>
        <div className="call-copy">
          <h3>Replace the guitar riff</h3>
          <p>Keep the tension. Lose the stock indie cadence.</p>
          <small>106 BPM <b>·</b> E minor <b>·</b> 14 sec</small>
          <p className="call-rights">If accepted, the take ships in this song. Stems stay yours.</p>
        </div>
        <div className="call-sheet__actions">
          <span><Icon name="person" /> 2 contributions</span>
          <div className="call-sheet__cta-group">
            <button className="secondary-action" type="button" onClick={onContribute}>
              Add your take
            </button>
            <button type="button" onClick={onCompare}>
              Compare
              <Icon name="arrow" size={17} />
            </button>
          </div>
        </div>
        <div className="requested-by">
          <span className="artist-orb" />
          <div>
            <strong>Requested by Mara Venn</strong>
            <small>Invite-only call · 2 hours ago</small>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubmitScene({
  method,
  rightsConfirmed,
  submitted,
  playing,
  onMethod,
  onRightsConfirmed,
  onPlay,
  onSubmit,
  onBack,
  onReview,
}: {
  method: SubmissionMethod;
  rightsConfirmed: boolean;
  submitted: boolean;
  playing: boolean;
  onMethod: (method: SubmissionMethod) => void;
  onRightsConfirmed: (confirmed: boolean) => void;
  onPlay: () => void;
  onSubmit: () => void;
  onBack: () => void;
  onReview: () => void;
}) {
  const methodOptions: Array<{
    id: SubmissionMethod;
    icon: IconName;
    label: string;
  }> = [
    { id: "record", icon: "record", label: "Record" },
    { id: "remix", icon: "remix", label: "Remix with Suno" },
    { id: "upload", icon: "upload", label: "Upload" },
  ];

  const methodDescriptor: Record<SubmissionMethod, string> = {
    record: "recorded",
    remix: "Suno remix",
    upload: "uploaded",
  };

  return (
    <section className="submit-scene scene" aria-label="Submit a contribution">
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <StatusIcons />
      </div>
      <header className="submit-header">
        <button className="round-control" type="button" onClick={onBack} aria-label="Back to open call">
          <Icon name="back" />
        </button>
        <div>
          <span>Contributor view · @lowlight, invited</span>
          <strong>Add your take</strong>
        </div>
        <img src="/nia-okafor.png" alt="Nia Okafor" />
      </header>

      {submitted ? (
        <div className="submission-success">
          <div className="submission-success__mark"><Icon name="check" size={30} /></div>
          <span>Sent for review</span>
          <h2>Your take is in context.</h2>
          <p>Mara can hear your 14-second contribution against the same song and ask for one revision before deciding.</p>
          <div className="submission-success__receipt">
            <div><span>Take</span><strong>Muted trumpet counterline</strong></div>
            <div><span>Rights</span><strong>Confirmed by @lowlight</strong></div>
            <div><span>If accepted</span><strong>Credit attaches to what ships</strong></div>
          </div>
          <button className="gradient-button" type="button" onClick={onReview}>
            Review the decision flow
            <Icon name="arrow" size={17} />
          </button>
        </div>
      ) : (
        <div className="submit-body">
          <div className="submit-request">
            <img src="/open-signal-cover.png" alt="" />
            <div>
              <span>Open call · 0:42–0:56</span>
              <strong>Replace the guitar riff</strong>
              <small>Keep the tension. Lose the stock indie cadence.</small>
            </div>
          </div>

          <div className="submission-context">
            <div>
              <span>Original in context</span>
              <small>106 BPM · E minor · 14 sec</small>
            </div>
            <WaveBars color="rgba(255, 255, 255, 0.35)" quiet />
            <button type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} original section`}>
              <Icon name={playing ? "pause" : "play"} size={17} />
            </button>
          </div>

          <fieldset className="submission-methods">
            <legend>How do you want to contribute?</legend>
            <div>
              {methodOptions.map((option) => (
                <button
                  key={option.id}
                  className={method === option.id ? "is-selected" : ""}
                  type="button"
                  onClick={() => onMethod(option.id)}
                  aria-pressed={method === option.id}
                >
                  <Icon name={option.icon} size={18} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="draft-take">
            <img src="/nia-okafor.png" alt="" />
            <div>
              <span>Ready to submit</span>
              <strong>Muted trumpet counterline</strong>
              <small>@lowlight · Take 02 · {methodDescriptor[method]}</small>
            </div>
            <button type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} draft take`}>
              <Icon name={playing ? "pause" : "play"} size={17} />
            </button>
          </div>

          <label className="rights-check">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(event) => onRightsConfirmed(event.target.checked)}
            />
            <span>
              <strong>I made or control this audio.</strong>
              <small>If accepted, Mara may publish and monetize it in this song. Separate stem reuse still requires permission.</small>
            </span>
          </label>

          <button className="gradient-button submission-submit" type="button" disabled={!rightsConfirmed} onClick={onSubmit}>
            Send for review
            <Icon name="arrow" size={17} />
          </button>
          <p className="submission-note">One revision round · Attribution required · Illustrative terms</p>
        </div>
      )}
    </section>
  );
}

function WaveRow({
  id,
  selected,
  accepted,
  passed,
  playing,
  onSelect,
  onPlay,
}: {
  id: ContributionId;
  selected: boolean;
  accepted: boolean;
  passed?: boolean;
  playing: boolean;
  onSelect: () => void;
  onPlay: () => void;
}) {
  const isOriginal = id === "original";
  const data = isOriginal
    ? {
        handle: "Original",
        color: "#e9e2da",
        tint: "rgba(255, 255, 255, 0.12)",
      }
    : contributions[id];

  return (
    <button
      className={`wave-row${selected ? " is-selected" : ""}${accepted ? " is-accepted" : ""}${passed && !accepted ? " is-passed" : ""}${playing ? " is-playing" : ""}`}
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
          color: data.color,
          background: data.tint,
        }}
      >
        {data.handle}
      </span>
      <span className="wave-row__play" aria-hidden="true">
        <Icon name={playing ? "pause" : "play"} size={15} />
      </span>
      <span className="wave-row__wave">
        <span className="wave-row__before"><WaveBars color="rgba(255, 255, 255, 0.3)" quiet /></span>
        <span className="wave-row__branch" style={{ color: data.color }}>
          <WaveBars color={data.color} />
        </span>
        <span className="wave-row__after"><WaveBars color="rgba(255, 255, 255, 0.3)" quiet /></span>
      </span>
      {accepted ? (
        <span className="accepted-flag"><Icon name="check" size={14} /> Accepted</span>
      ) : passed ? (
        <span className="passed-flag">Passed</span>
      ) : null}
    </button>
  );
}

function CompareScene({
  acceptedId,
  passedIds,
  selected,
  onSelect,
  playingId,
  onPlay,
  onAccept,
  onPass,
  onReceipt,
  onProfile,
  onClose,
}: {
  acceptedId: CreatorContributionId | null;
  passedIds: CreatorContributionId[];
  selected: ContributionId;
  onSelect: (id: ContributionId) => void;
  playingId: ContributionId | null;
  onPlay: (id: ContributionId) => void;
  onAccept: (id: CreatorContributionId) => void;
  onPass: (id: CreatorContributionId) => void;
  onReceipt: () => void;
  onProfile: () => void;
  onClose: () => void;
}) {
  const selectedData =
    selected === "original" ? null : contributions[selected];
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("Could you pull the final note back and leave more air before the transition?");
  const [commentSent, setCommentSent] = useState(false);

  const selectContribution = (id: ContributionId) => {
    setCommentOpen(false);
    setCommentSent(false);
    onSelect(id);
  };

  return (
    <section className="compare-scene scene" aria-label="Compare contributions">
      <header className="compare-header">
        <button className="round-control" type="button" onClick={onClose} aria-label="Back to open call">
          <Icon name="back" />
        </button>
        <img src="/open-signal-cover.png" alt="" />
        <div>
          <h2>Open Signal <span className="model-tag">v5.5</span></h2>
          <p>Mara Venn</p>
        </div>
        <span className="compare-header__mode">Collaborate</span>
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
              onSelect={() => selectContribution("original")}
              onPlay={() => onPlay("original")}
            />
            <WaveRow
              id="lowlight"
              selected={selected === "lowlight"}
              accepted={acceptedId === "lowlight"}
              passed={passedIds.includes("lowlight")}
              playing={playingId === "lowlight"}
              onSelect={() => selectContribution("lowlight")}
              onPlay={() => onPlay("lowlight")}
            />
            <WaveRow
              id="circuitromance"
              selected={selected === "circuitromance"}
              accepted={acceptedId === "circuitromance"}
              passed={passedIds.includes("circuitromance")}
              playing={playingId === "circuitromance"}
              onSelect={() => selectContribution("circuitromance")}
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
                <img src={selectedData.image} alt="" />
                <span>
                  <strong>{selectedData.name}</strong>
                  <small>{selectedData.verification}</small>
                </span>
                <Icon name="verified" size={17} />
              </button>
              <p className="contribution-note">{selectedData.note}</p>
              {acceptedId === selected ? (
                <div className="accepted-panel">
                  <span><Icon name="spark" /> Accepted into Open Signal</span>
                  <div className="acceptance-receipt-summary">
                    <div>
                      <small>Rights + credit recorded</small>
                      <strong>{selectedData.handle} · Take 02</strong>
                    </div>
                    <button type="button" onClick={onReceipt}>View receipt</button>
                  </div>
                  <button type="button" onClick={onProfile}>View {selectedData.name}’s profile<Icon name="arrow" size={17} /></button>
                </div>
              ) : (
                <button
                  className="gradient-button"
                  type="button"
                  onClick={() => {
                    if (selected !== "original") onAccept(selected);
                  }}
                >
                  <Icon name="spark" />
                  {acceptedId ? "Accept instead" : "Accept contribution"}
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
              {commentSent ? (
                <div className="comment-sent" role="status"><Icon name="check" size={15} />Feedback sent to {selectedData.handle}</div>
              ) : commentOpen ? (
                <form
                  className="comment-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!comment.trim()) return;
                    setCommentSent(true);
                    setCommentOpen(false);
                  }}
                >
                  <label htmlFor={`review-comment-${selected}`}>Request one revision</label>
                  <textarea id={`review-comment-${selected}`} value={comment} onChange={(event) => setComment(event.target.value)} />
                  <div>
                    <button type="button" onClick={() => setCommentOpen(false)}>Cancel</button>
                    <button type="submit">Send feedback</button>
                  </div>
                </form>
              ) : (
                <button className="comment-button" type="button" onClick={() => setCommentOpen(true)}><Icon name="comment" size={17} />Request changes</button>
              )}
              {acceptedId !== selected ? (
                passedIds.includes(selected as CreatorContributionId) ? (
                  <p className="passed-note" role="status">
                    Passed. {selectedData.handle} keeps this take and its rights.
                  </p>
                ) : (
                  <button className="pass-button" type="button" onClick={() => onPass(selected as CreatorContributionId)}>
                    Pass on this take
                  </button>
                )
              ) : null}
            </>
          ) : (
            <div className="original-inspector">
              <span>Original section</span>
              <h3>The baseline</h3>
              <p>{playingId === "original" ? "Playing the baseline in context." : "Tap the original waveform to hear the baseline."}</p>
              <button type="button" onClick={() => selectContribution("lowlight")}>
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
  contributionId,
  accepted,
  playing,
  following,
  onPlay,
  onFollow,
  onShare,
  onClose,
}: {
  contributionId: CreatorContributionId;
  accepted: boolean;
  playing: boolean;
  following: boolean;
  onPlay: () => void;
  onFollow: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  const creator = contributions[contributionId];

  return (
    <section className="profile-scene scene" aria-label={`${creator.name} profile`}>
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <StatusIcons />
      </div>
      <button className="round-control profile-scene__close" type="button" onClick={onClose} aria-label="Close profile">
        <Icon name="close" />
      </button>
      <img className="profile-scene__portrait" src={creator.image} alt={`${creator.name} creator profile`} />
      <h2>{creator.name}</h2>
      <p className="profile-handle">{creator.handle}</p>
      <VerifiedHuman />
      <div className="reputation-stats" aria-label="Suno reputation">
        <div><strong>{creator.acceptedCount + (accepted ? 1 : 0)}</strong><span>Accepted</span></div>
        <div><strong>{creator.reuses}</strong><span>Reuses</span></div>
        <div><strong>{creator.openCalls}</strong><span>Open calls</span></div>
      </div>
      <div className="profile-actions">
        <button className={following ? "is-following" : ""} type="button" onClick={onFollow} aria-pressed={following}><Icon name={following ? "check" : "person"} />{following ? "Following" : "Follow"}</button>
        <button type="button" onClick={onShare} aria-label={`Share ${creator.name}'s profile`}><Icon name="share" /></button>
        <button className="gradient-square" type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} ${creator.name}'s work`}>
          <Icon name={playing ? "pause" : "play"} />
        </button>
      </div>
      <small className="follower-count">{creator.followers} followers</small>
      <section className="credits">
        <div className="section-title-row">
          <h3>Selected credits</h3>
          <span><Icon name="verified" size={16} /> Credits verified</span>
        </div>
        <p><Icon name="disc" size={15} /> <strong>{creator.album}</strong> — producer</p>
        <p><Icon name="studio" size={15} /> <strong>{creator.workplace}</strong> — sound design</p>
      </section>
      <section className="profile-contributions">
        <h3>Contributions</h3>
        <article>
          <img src="/open-signal-cover.png" alt="" />
          <div>
            <small>{accepted ? "Accepted" : "In review"}</small>
            <strong>{creator.title} {accepted ? "accepted into" : "proposed for"} Open Signal</strong>
            <span>0:42–0:56 · Mara Venn</span>
          </div>
          <button type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} contribution`}>
            <Icon name={playing ? "pause" : "play"} />
          </button>
        </article>
        <article>
          <div className="texture-art" aria-hidden="true" />
          <div>
            <small>Reused</small>
            <strong>Drum texture reused in 14 projects</strong>
            <span>Last used 2d ago · 14 projects</span>
          </div>
          <button type="button" onClick={onPlay} aria-label={`${playing ? "Pause" : "Play"} reused texture`}><Icon name={playing ? "pause" : "play"} /></button>
        </article>
      </section>
    </section>
  );
}

function AcceptanceReceipt({
  contributionId,
  onClose,
}: {
  contributionId: CreatorContributionId;
  onClose: () => void;
}) {
  const creator = contributions[contributionId];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="receipt-overlay" role="dialog" aria-modal="true" aria-labelledby="receipt-title" aria-describedby="receipt-note">
      <button className="receipt-overlay__backdrop" type="button" onClick={onClose} aria-label="Close acceptance receipt" tabIndex={-1} />
      <section className="receipt-sheet">
        <span className="sheet-handle" aria-hidden="true" />
        <header>
          <div>
            <span>Recorded on acceptance</span>
            <h2 id="receipt-title">Rights + credit receipt</h2>
          </div>
          <button ref={closeButtonRef} className="round-control" type="button" onClick={onClose} aria-label="Close acceptance receipt"><Icon name="close" /></button>
        </header>
        <div className="receipt-creator">
          <img src={creator.image} alt="" />
          <div><strong>{creator.name}</strong><span>{creator.handle} · {creator.title}</span></div>
          <Icon name="verified" size={19} />
        </div>
        <dl>
          <div><dt>Exact asset</dt><dd>Take 02 · 0:42–0:56 · 14 sec</dd></div>
          <div><dt>Song rights</dt><dd>Mara may publish and monetize this accepted take in Open Signal.</dd></div>
          <div><dt>Stem reuse</dt><dd>Not included. Separate permission is required.</dd></div>
          <div><dt>Attribution</dt><dd>{creator.handle} stays attached to downstream remixes.</dd></div>
        </dl>
        <div className="receipt-confirmation" id="receipt-note"><Icon name="check" size={16} /><span><strong>Confirmed by both creators</strong><small>Illustrative rights model for this product spec</small></span></div>
        <button className="gradient-button" type="button" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}

function BrowseScene({
  onOpenCall,
  acceptedId,
  starred,
  onToggleStar,
  forkedDraft,
  onFork,
  onOpenComments,
}: {
  onOpenCall: () => void;
  acceptedId: CreatorContributionId | null;
  starred: boolean;
  onToggleStar: () => void;
  forkedDraft: boolean;
  onFork: () => void;
  onOpenComments: () => void;
}) {
  const malik = contributions.circuitromance;

  return (
    <section className="browse-scene scene" aria-label="Browse open work">
      <div className="status-bar status-bar--light" aria-hidden="true">
        <strong>9:41</strong>
        <StatusIcons />
      </div>
      <header className="browse-header">
        <h2>Open work</h2>
        <p>Find a section that needs your sound.</p>
      </header>

      <h3 className="browse-section-title">Trending open calls</h3>
      <div className="browse-calls">
        <button className="browse-call-card browse-call-card--live" type="button" onClick={onOpenCall}>
          <img src="/open-signal-cover.png" alt="" />
          <span className="browse-call-card__body">
            <small>art-pop · E minor · 106 BPM</small>
            <strong>Replace the guitar riff</strong>
            <span>2 takes in review · Invite-only</span>
          </span>
          <span className="browse-call-card__by">Mara Venn</span>
          <Icon name="arrow" size={17} />
        </button>
        <div className="browse-call-card">
          <span className="browse-tile browse-tile--dusk" aria-hidden="true" />
          <span className="browse-call-card__body">
            <small>ambient · C♯ minor · 74 BPM</small>
            <strong>Granular pad under the bridge</strong>
            <span>4 takes in review · Open pool</span>
          </span>
          <span className="browse-call-card__by">@riverchapel</span>
        </div>
        <div className="browse-call-card">
          <span className="browse-tile browse-tile--ember" aria-hidden="true" />
          <span className="browse-call-card__body">
            <small>alt-R&B · F major · 92 BPM</small>
            <strong>Vocal texture for the outro</strong>
            <span>1 take in review · Invite-only</span>
          </span>
          <span className="browse-call-card__by">@juneaux</span>
        </div>
      </div>

      <h3 className="browse-section-title">Trending packs</h3>
      <div className="browse-components">
        <div className="browse-comp-tile browse-comp-tile--live">
          <button className="browse-pack-open" type="button" onClick={onOpenComments} aria-label="Open Drum texture pack comments">
            <span className="texture-art" aria-hidden="true" />
            <strong>Drum texture</strong>
            <small>@lowlight</small>
          </button>
          <span className="browse-pack-stats">
            <button className={`browse-star${starred ? " is-starred" : ""}`} type="button" onClick={onToggleStar} aria-pressed={starred} aria-label="Star this pack">
              <Icon name="star" size={13} />
              <span key={`s${starred ? 1 : 0}`} className="count-pop">{214 + (starred ? 1 : 0)}</span>
            </button>
            <span className="browse-forks"><Icon name="remix" size={13} /><span key={`f${forkedDraft ? 1 : 0}`} className="count-pop">{41 + (forkedDraft ? 1 : 0)}</span></span>
            <button className="browse-pack-comments" type="button" onClick={onOpenComments} aria-label="3 comments"><Icon name="comment" size={13} />3</button>
          </span>
          <button className="browse-fork-btn" type="button" onClick={onFork}><Icon name="remix" size={14} />Fork</button>
        </div>
        <div className="browse-comp-tile">
          <span className="browse-tile browse-tile--haze" aria-hidden="true" />
          <strong>Tape-warble keys</strong>
          <small>@circuitromance</small>
          <span className="browse-pack-stats"><span><Icon name="star" size={12} />58</span><span><Icon name="remix" size={12} />9</span></span>
        </div>
        <div className="browse-comp-tile">
          <span className="browse-tile browse-tile--dusk" aria-hidden="true" />
          <strong>Dusted bass one-shots</strong>
          <small>@riverchapel</small>
          <span className="browse-pack-stats"><span><Icon name="star" size={12} />31</span><span><Icon name="remix" size={12} />6</span></span>
        </div>
      </div>

      {forkedDraft ? (
        <>
          <h3 className="browse-section-title">Your drafts</h3>
          <div className="browse-draft">
            <span className="texture-art" aria-hidden="true" />
            <span className="browse-draft__body">
              <strong>Fork of Drum texture</strong>
              <small>Draft · Synced just now</small>
            </span>
            <Icon name="check" size={15} />
          </div>
        </>
      ) : null}

      <h3 className="browse-section-title">Top contributors</h3>
      <div className="browse-people">
        <div className="browse-person">
          <img src="/nia-okafor.png" alt="Nia Okafor" />
          <strong>@lowlight</strong>
          <small>{contributions.lowlight.acceptedCount + (acceptedId === "lowlight" ? 1 : 0)} accepted</small>
        </div>
        <div className="browse-person">
          <img src="/adopter-malik.jpg" alt="Malik Chen" />
          <strong>@circuitromance</strong>
          <small>{malik.acceptedCount + (acceptedId === "circuitromance" ? 1 : 0)} accepted</small>
        </div>
        <div className="browse-person">
          <img src="/adopter-ana.jpg" alt="" />
          <strong>@anaverse</strong>
          <small>9 accepted</small>
        </div>
        <div className="browse-person">
          <img src="/adopter-jules.jpg" alt="" />
          <strong>@julesmakes</strong>
          <small>7 accepted</small>
        </div>
      </div>

      <h3 className="browse-section-title">Active collaborations</h3>
      <div className="browse-activity">
        <div><strong>Open Signal</strong><span>New take submitted 2h ago</span></div>
        <div><strong>Hollow City</strong><span>Take accepted 1d ago</span></div>
      </div>
    </section>
  );
}

function CommentsSheet({
  comments,
  onAddComment,
  onFork,
  onPlaySnippet,
  snippetPlaying,
  onClose,
}: {
  comments: string[];
  onAddComment: (text: string) => void;
  onFork: () => void;
  onPlaySnippet: () => void;
  snippetPlaying: boolean;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="receipt-overlay" role="dialog" aria-modal="true" aria-labelledby="comments-title">
      <button className="receipt-overlay__backdrop" type="button" onClick={onClose} aria-label="Close comments" tabIndex={-1} />
      <section className="receipt-sheet comments-sheet">
        <span className="sheet-handle" aria-hidden="true" />
        <header>
          <div>
            <span>Pack by @lowlight</span>
            <h2 id="comments-title">Drum texture</h2>
          </div>
          <button ref={closeButtonRef} className="round-control" type="button" onClick={onClose} aria-label="Close comments"><Icon name="close" /></button>
        </header>
        <p className="comments-stats"><Icon name="star" size={14} /> 214 · 41 forks · 14 shipped</p>
        <div className="comments-thread">
          <div className="comment">
            <img src="/adopter-jules.jpg" alt="" />
            <div className="comment__body">
              <strong>@julesmakes</strong>
              <p>I added more snare to this to really bring out the offbeat</p>
              <div className="comment__snippet">
                <button type="button" onClick={onPlaySnippet} aria-label={`${snippetPlaying ? "Pause" : "Play"} Offbeat snare flip`}>
                  <Icon name={snippetPlaying ? "pause" : "play"} size={14} />
                </button>
                <span><strong>Offbeat snare flip</strong><small>Fork of Drum texture</small></span>
                <button className="comment__snippet-fork" type="button" onClick={onFork}><Icon name="remix" size={13} />Fork</button>
              </div>
            </div>
          </div>
          <div className="comment">
            <img src="/nia-okafor.png" alt="" />
            <div className="comment__body">
              <strong>@lowlight <em className="comment__creator">Creator</em></strong>
              <p>That’s genius.</p>
            </div>
          </div>
          {comments.map((text, index) => (
            <div className="comment" key={index}>
              <span className="comment__you" aria-hidden="true">You</span>
              <div className="comment__body">
                <strong>You</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <form
          className="comments-composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            onAddComment(draft.trim());
            setDraft("");
          }}
        >
          <label htmlFor="pack-comment" className="visually-hidden-label">Add a comment</label>
          <input id="pack-comment" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a comment…" />
          <button type="submit">Post</button>
        </form>
      </section>
    </div>
  );
}

function PhoneDemo({
  scene,
  acceptedId,
  passedIds,
  starred,
  onToggleStar,
  forkedDraft,
  onFork,
  onOpenComments,
  commentsOpen,
  comments,
  onAddComment,
  onCloseComments,
  selected,
  submissionMethod,
  rightsConfirmed,
  submitted,
  receiptOpen,
  liked,
  following,
  playingId,
  onScene,
  onSelect,
  onAccept,
  onPass,
  onReceipt,
  onCloseReceipt,
  onSubmissionMethod,
  onRightsConfirmed,
  onSubmit,
  onToggleLike,
  onToggleFollow,
  onShare,
  onPlay,
}: {
  scene: Scene;
  acceptedId: CreatorContributionId | null;
  passedIds: CreatorContributionId[];
  starred: boolean;
  onToggleStar: () => void;
  forkedDraft: boolean;
  onFork: () => void;
  onOpenComments: () => void;
  commentsOpen: boolean;
  comments: string[];
  onAddComment: (text: string) => void;
  onCloseComments: () => void;
  selected: ContributionId;
  submissionMethod: SubmissionMethod;
  rightsConfirmed: boolean;
  submitted: boolean;
  receiptOpen: boolean;
  liked: boolean;
  following: boolean;
  playingId: ContributionId | null;
  onScene: (scene: Scene) => void;
  onSelect: (id: ContributionId) => void;
  onAccept: (id: CreatorContributionId) => void;
  onPass: (id: CreatorContributionId) => void;
  onReceipt: () => void;
  onCloseReceipt: () => void;
  onSubmissionMethod: (method: SubmissionMethod) => void;
  onRightsConfirmed: (confirmed: boolean) => void;
  onSubmit: () => void;
  onToggleLike: () => void;
  onToggleFollow: () => void;
  onShare: () => void;
  onPlay: (id: ContributionId) => void;
}) {
  const profileContributionId = selected === "original" ? acceptedId ?? "lowlight" : selected;

  return (
    <div className={`phone-frame phone-frame--${scene}`}>
      <div className="phone-island" aria-hidden="true" />
      {scene === "browse" ? (
        <BrowseScene
          onOpenCall={() => onScene("call")}
          acceptedId={acceptedId}
          starred={starred}
          onToggleStar={onToggleStar}
          forkedDraft={forkedDraft}
          onFork={onFork}
          onOpenComments={onOpenComments}
        />
      ) : null}
      {scene === "player" ? (
        <PlayerScene
          playing={playingId === "original"}
          liked={liked}
          onTogglePlay={() => onPlay("original")}
          onToggleLike={onToggleLike}
          onOpenCall={() => onScene("call")}
          onShare={onShare}
        />
      ) : null}
      {scene === "call" ? (
        <CallScene
          onClose={() => onScene("player")}
          onContribute={() => onScene("submit")}
          onCompare={() => onScene("compare")}
        />
      ) : null}
      {scene === "submit" ? (
        <SubmitScene
          method={submissionMethod}
          rightsConfirmed={rightsConfirmed}
          submitted={submitted}
          playing={playingId === "lowlight"}
          onMethod={onSubmissionMethod}
          onRightsConfirmed={onRightsConfirmed}
          onPlay={() => onPlay("lowlight")}
          onSubmit={onSubmit}
          onBack={() => onScene("call")}
          onReview={() => onScene("compare")}
        />
      ) : null}
      {scene === "compare" || scene === "accepted" ? (
        <CompareScene
          acceptedId={acceptedId}
          passedIds={passedIds}
          selected={selected}
          onSelect={onSelect}
          playingId={playingId}
          onPlay={onPlay}
          onAccept={onAccept}
          onPass={onPass}
          onReceipt={onReceipt}
          onProfile={() => onScene("profile")}
          onClose={() => onScene("call")}
        />
      ) : null}
      {scene === "profile" ? (
        <ProfileScene
          contributionId={profileContributionId}
          accepted={acceptedId === profileContributionId}
          playing={playingId === profileContributionId}
          following={following}
          onPlay={() => onPlay(profileContributionId)}
          onFollow={onToggleFollow}
          onShare={onShare}
          onClose={() => onScene(acceptedId ? "accepted" : "compare")}
        />
      ) : null}
      {receiptOpen && acceptedId ? <AcceptanceReceipt contributionId={acceptedId} onClose={onCloseReceipt} /> : null}
      {commentsOpen ? (
        <CommentsSheet
          comments={comments}
          onAddComment={onAddComment}
          onFork={onFork}
          onPlaySnippet={() => onPlay("lowlight")}
          snippetPlaying={playingId === "lowlight"}
          onClose={onCloseComments}
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
    </div>
  );
}

function HumanProofCard({ contributionId, accepted, onOpen }: { contributionId: CreatorContributionId; accepted: boolean; onOpen: () => void }) {
  const creator = contributions[contributionId];

  return (
    <button className="human-proof-card" type="button" onClick={onOpen}>
      <span className="human-proof-card__label">Creator reputation</span>
      <img src={creator.image} alt="" />
      <div>
        <strong>{creator.name}</strong>
        <span>{creator.handle}</span>
        <VerifiedHuman compact />
      </div>
      <p>
        {accepted
          ? "Accepted into Open Signal"
          : `${creator.acceptedCount} accepted contributions`}
      </p>
      <Icon name="arrow" size={17} />
    </button>
  );
}

function LineageDiagram({ acceptedId }: { acceptedId: CreatorContributionId | null }) {
  const acceptedCreator = acceptedId ? contributions[acceptedId] : null;

  return (
    <div className={`lineage-diagram${acceptedId ? " is-accepted" : ""}`}>
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
        <small>{acceptedCreator ? "Accepted" : "Creator decision"}</small>
        <strong>{acceptedCreator ? acceptedCreator.title : "Choose what ships"}</strong>
        <span>{acceptedCreator ? `${acceptedCreator.handle} receives durable credit` : "Credit follows the selected take"}</span>
      </div>
      <div className="lineage-arrow"><Icon name="arrow" /></div>
      <div className="downstream">
        <small>Reused by</small>
        <div className="avatar-stack">
          <img
            src={acceptedCreator?.image ?? "/nia-okafor.png"}
            alt={acceptedCreator?.name ?? "Nia Okafor"}
            title={`${acceptedCreator?.name ?? "Nia Okafor"} · accepted contributor`}
          />
          {adopters.filter((adopter) => adopter.image !== acceptedCreator?.image).map((adopter) => (
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
  const [scene, setScene] = useState<Scene>("browse");
  const [acceptedId, setAcceptedId] = useState<CreatorContributionId | null>(null);
  const [passedIds, setPassedIds] = useState<CreatorContributionId[]>([]);
  const [selected, setSelected] = useState<ContributionId>("lowlight");
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>("remix");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [starred, setStarred] = useState(false);
  const [forkedDraft, setForkedDraft] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<ContributionId | null>(null);
  const audioHandle = useRef<DemoAudioHandle | null>(null);
  const shareTimeout = useRef<number | null>(null);

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
      if (handle) {
        window.clearTimeout(handle.timeout);
        void handle.context.close();
        audioHandle.current = null;
      }
      if (shareTimeout.current) window.clearTimeout(shareTimeout.current);
    },
    [],
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const next = new URLSearchParams(window.location.search).get("scene") as Scene | null;
      const storedId = window.localStorage.getItem("open-signal:accepted-id");
      const validAcceptedId = storedId === "lowlight" || storedId === "circuitromance" ? storedId : null;
      const requestedScene = next && SCENES.includes(next) ? next : "browse";
      setAcceptedId(validAcceptedId);
      if (validAcceptedId) setSelected(validAcceptedId);
      setScene(requestedScene === "accepted" && !validAcceptedId ? "compare" : requestedScene);
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
    setReceiptOpen(false);
    setCommentsOpen(false);
    const url = new URL(window.location.href);
    if (next === "browse") {
      url.searchParams.delete("scene");
    } else {
      url.searchParams.set("scene", next);
    }
    window.history.pushState({}, "", url);
    window.requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".phone-frame .scene").forEach((element) => {
        element.scrollTop = 0;
      });
      if (window.matchMedia("(max-width: 680px)").matches) {
        document.querySelector<HTMLElement>(".hero")?.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
  }, []);

  const acceptContribution = useCallback((id: CreatorContributionId) => {
    setAcceptedId(id);
    setSelected(id);
    setPassedIds((current) => current.filter((passed) => passed !== id));
    window.localStorage.setItem("open-signal:accepted-id", id);
    window.localStorage.removeItem("open-signal:accepted");
    navigate("accepted");
    window.setTimeout(() => setReceiptOpen(true), 180);
  }, [navigate]);

  const passContribution = useCallback((id: CreatorContributionId) => {
    setPassedIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }, []);

  const submitContribution = useCallback(() => {
    if (!rightsConfirmed) return;
    setSubmitted(true);
    setSelected("lowlight");
  }, [rightsConfirmed]);

  const sharePrototype = useCallback(async () => {
    const canShare = typeof navigator.share === "function";
    const shareData = {
      title: "Open Signal — an interactive product spec",
      text: "Ask for a take, hear it in context, and preserve credit for what ships.",
      url: new URL("/", window.location.href).href,
    };

    setShareStatus(canShare ? "Opening share sheet…" : "Copying link…");
    if (shareTimeout.current) window.clearTimeout(shareTimeout.current);
    shareTimeout.current = window.setTimeout(() => setShareStatus(null), 2600);

    try {
      if (canShare) {
        await navigator.share(shareData);
        setShareStatus("Share sheet opened");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus("Link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus("Link copied");
      } catch {
        setShareStatus("Copy the URL from your browser");
      }
    }

  }, []);

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem("open-signal:accepted");
    window.localStorage.removeItem("open-signal:accepted-id");
    setAcceptedId(null);
    setPassedIds([]);
    setSelected("lowlight");
    setSubmissionMethod("remix");
    setRightsConfirmed(false);
    setSubmitted(false);
    setReceiptOpen(false);
    setLiked(false);
    setFollowing(false);
    setStarred(false);
    setForkedDraft(false);
    setComments([]);
    setCommentsOpen(false);
    stopAudio();
    navigate("browse");
  }, [navigate, stopAudio]);

  const progress = useMemo(() => SCENES.indexOf(scene), [scene]);

  return (
    <main className="site-shell">
      <header className="site-header">
        <BrandMark />
        <p>Interactive product specification</p>
        <button type="button" onClick={resetDemo} aria-label="Reset demo">
          <Icon name="reset" size={16} />
          <span>Reset demo</span>
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>Hear every version. Credit what ships.</h1>
          <p>
            Suno already helps creators generate, remix, and compare versions.
            Open Signal adds the human layer: ask for one precise take, choose
            what ships, and preserve rights-safe credit for who made it.
          </p>
          <SongRail
            playing={playingId === "original"}
            onTogglePlay={() => void togglePreview("original")}
          />
          <ol className="hero-steps">
            <li className={progress >= 2 ? "is-active" : ""}>
              <span>1</span>
              <div><strong>Open</strong><small>Name the section and the ask.</small></div>
            </li>
            <li className={["compare", "accepted", "profile"].includes(scene) ? "is-active" : ""}>
              <span>2</span>
              <div><strong>Listen</strong><small>Switch versions in context.</small></div>
            </li>
            <li className={acceptedId ? "is-active" : ""}>
              <span>3</span>
              <div><strong>Credit</strong><small>Accept one. Preserve who made it.</small></div>
            </li>
          </ol>
        </div>

        <div className="demo-column">
          <p className="mobile-thesis">Ask for a take. Hear it in context. Keep what works. Credit who made it.</p>
          <div className="scene-tabs" aria-label="Demo scenes">
            {SCENES.map((item) => (
              <button
                key={item}
                type="button"
                className={scene === item ? "is-active" : ""}
                onClick={() => navigate(item)}
                disabled={item === "accepted" && !acceptedId}
                aria-pressed={scene === item}
              >
                {SCENE_LABELS[item]}
              </button>
            ))}
          </div>
          <PhoneDemo
            scene={scene}
            acceptedId={acceptedId}
            passedIds={passedIds}
            starred={starred}
            onToggleStar={() => setStarred((current) => !current)}
            forkedDraft={forkedDraft}
            onFork={() => {}}
            onOpenComments={() => setCommentsOpen(true)}
            commentsOpen={commentsOpen}
            comments={comments}
            onAddComment={(text) => setComments((current) => [...current, text])}
            onCloseComments={() => setCommentsOpen(false)}
            selected={selected}
            submissionMethod={submissionMethod}
            rightsConfirmed={rightsConfirmed}
            submitted={submitted}
            receiptOpen={receiptOpen}
            liked={liked}
            following={following}
            playingId={playingId}
            onScene={navigate}
            onSelect={setSelected}
            onAccept={acceptContribution}
            onPass={passContribution}
            onReceipt={() => setReceiptOpen(true)}
            onCloseReceipt={() => setReceiptOpen(false)}
            onSubmissionMethod={setSubmissionMethod}
            onRightsConfirmed={setRightsConfirmed}
            onSubmit={submitContribution}
            onToggleLike={() => setLiked((current) => !current)}
            onToggleFollow={() => setFollowing((current) => !current)}
            onShare={() => void sharePrototype()}
            onPlay={(version) => void togglePreview(version)}
          />
        </div>

        <aside className="proof-column">
          <div className="proof-column__copy">
            <span>The human layer.</span>
            <h2>Make contribution legible.</h2>
            <p>Producers find open work in the feed; a precise request becomes a contribution, a review, a decision, and durable credit—all in Suno’s musical language.</p>
          </div>
          <HumanProofCard contributionId={acceptedId ?? "lowlight"} accepted={Boolean(acceptedId)} onOpen={() => navigate("profile")} />
          <div className="trust-stack">
            <div><Icon name="verified" /><span><strong>Identity verified</strong><small>Creator profile</small></span></div>
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
        <LineageDiagram acceptedId={acceptedId} />
      </section>

      <section className="principles-section" aria-labelledby="principles-title">
        <div className="principles-heading">
          <h2 id="principles-title">Borrow the protocol, not the chrome.</h2>
          <p>When re-rolling stops helping, you ask a person.</p>
        </div>
        <div className="principles-rail">
          <article><strong>Precise ask</strong><span>One section. One problem.</span></article>
          <article><strong>Listen in context</strong><span>Switch versions without losing the song.</span></article>
          <article><strong>Human credit</strong><span>Accepted work strengthens a real profile.</span></article>
          <article><strong>Portable lineage</strong><span>Credit travels when the sound does.</span></article>
        </div>
        <div className="product-horizon" aria-label="GitHub collaboration logic translated into Suno language">
          <strong>GitHub logic, Suno language</strong>
          <span>Request</span>
          <Icon name="arrow" size={17} />
          <span>Contribution</span>
          <Icon name="arrow" size={17} />
          <span>Review</span>
          <Icon name="arrow" size={17} />
          <span>Accept + credit</span>
        </div>
      </section>

      <section className="measurement-section" aria-labelledby="measurement-title">
        <div>
          <h2 id="measurement-title">What the beta must prove</h2>
          <p>Start invite-only with creators who repeatedly edit one section but have not exported the song.</p>
          <p className="measurement-note">Credit-first by design. Compensation and splits enter once accepted takes prove they help songs ship.</p>
          <p className="measurement-note">Supply starts with the same stuck editors flipped around: a 14-second ask is small enough to answer between your own edits, and it lands where creators already are.</p>
        </div>
        <dl>
          <div><dt>Primary</dt><dd>Incremental 7-day publish or export completion versus editing alone</dd></div>
          <div><dt>Supply</dt><dd>Eligible Open Calls receiving a qualified take within 24 hours</dd></div>
          <div><dt>Quality</dt><dd>Accepted contributions that survive into the published or exported song</dd></div>
          <div><dt>Trust</dt><dd>Rights disputes, spam, and moderator time per 1,000 contributions</dd></div>
        </dl>
      </section>

      <footer className="site-footer">
        <p>Interactive product spec · Fictional people, audio, and outcomes · Not affiliated with Suno</p>
        <p>Designed for the Staff Product Manager, mobile creation role</p>
      </footer>
      {shareStatus ? <div className="site-toast" role="status"><Icon name="check" size={16} />{shareStatus}</div> : null}
    </main>
  );
}
