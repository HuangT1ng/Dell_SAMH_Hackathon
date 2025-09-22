import React, { useMemo, useState } from "react";
import { X } from "lucide-react";

interface MoodEntry {
  date: string;
  mood: number;
  moodLabel: string;
  triggers: string[];
  activities: string[];
  notes: string;
  aiSummary?: string;
}
interface NotebookJournalProps {
  entries: MoodEntry[];
  onSave: (entry: MoodEntry) => void;
  onNavigate: (view: string) => void;
}

// Consistent serif stack everywhere
const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

// Cheerful solids per-card
const PASTELS = ["#FFF4B3", "#FFD6E7", "#CFFAE2", "#D6E4FF", "#FFEAD6"];
const FIVE_LABELS = ["Terrible", "Bad", "Okay", "Good", "Excellent"];

// helpers
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm = (v: number) => clamp((v - 1) / 4, 0, 1);

// Faces for sliders
const MoodFace: React.FC<{ value: number }> = ({ value }) => {
  const t = norm(value);
  const eyeX = lerp(-1.6, 1.6, t);
  const mouthY = lerp(64, 92, t); // 1=frown → 5=smile
  return (
    <svg viewBox="0 0 120 120" className="w-56 h-56 md:w-60 md:h-60" aria-hidden>
      <circle cx={45} cy={50} r={14} fill="none" stroke="#0B0B0C" strokeWidth={2}/>
      <circle cx={75} cy={50} r={14} fill="none" stroke="#0B0B0C" strokeWidth={2}/>
      <circle cx={45 + eyeX} cy={50} r={3.5} fill="#0B0B0C"/>
      <circle cx={75 + eyeX} cy={50} r={3.5} fill="#0B0B0C"/>
      <path d={`M 40 78 Q 60 ${mouthY} 80 78`} stroke="#0B0B0C" strokeWidth={3} fill="none" strokeLinecap="round"/>
    </svg>
  );
};

const EnergyFace: React.FC<{ value: number }> = ({ value }) => {
  const t = norm(value);
  const lid = lerp(10, 0, t);
  const mouthY = lerp(66, 88, t);
  return (
    <svg viewBox="0 0 120 120" className="w-56 h-56 md:w-60 md:h-60" aria-hidden>
      <circle cx={45} cy={50} r={14} fill="none" stroke="#0B0B0C" strokeWidth={2}/>
      <circle cx={75} cy={50} r={14} fill="none" stroke="#0B0B0C" strokeWidth={2}/>
      <path d={`M31 ${50 - lid} Q45 ${45 - lid} 59 ${50 - lid}`} stroke="#0B0B0C" strokeWidth={2} fill="none"/>
      <path d={`M61 ${50 - lid} Q75 ${45 - lid} 89 ${50 - lid}`} stroke="#0B0B0C" strokeWidth={2} fill="none"/>
      <circle cx={45} cy={50 - lid * 0.3} r={3.5} fill="#0B0B0C"/>
      <circle cx={75} cy={50 - lid * 0.3} r={3.5} fill="#0B0B0C"/>
      <path d={`M 40 78 Q 60 ${mouthY} 80 78`} stroke="#0B0B0C" strokeWidth={3} fill="none" strokeLinecap="round"/>
      {t > 0.7 && <path d="M62 28 l5 0 -6 10 6 0 -10 14 3 -10 -6 0 z" fill="#0B0B0C" opacity={0.75}/>}
    </svg>
  );
};

const SocialFace: React.FC<{ value: number }> = ({ value }) => {
  const t = norm(value);
  const gap = lerp(26, 36, t);
  const mouthY = lerp(66, 86, t);
  const blush = lerp(0, 0.35, t);
  return (
    <svg viewBox="0 0 120 120" className="w-56 h-56 md:w-60 md:h-60" aria-hidden>
      <circle cx={60 - gap/2} cy={50} r={14} fill="none" stroke="#0B0B0C" strokeWidth={2}/>
      <circle cx={60 + gap/2} cy={50} r={14} fill="none" stroke="#0B0B0C" strokeWidth={2}/>
      <circle cx={60 - gap/2} cy={50} r={3.5} fill="#0B0B0C"/>
      <circle cx={60 + gap/2} cy={50} r={3.5} fill="#0B0B0C"/>
      <circle cx={60 - gap/2 - 10} cy={60} r={5} fill="#FF7B8A" opacity={blush}/>
      <circle cx={60 + gap/2 + 10} cy={60} r={5} fill="#FF7B8A" opacity={blush}/>
      <path d={`M 40 78 Q 60 ${mouthY} 80 78`} stroke="#0B0B0C" strokeWidth={3} fill="none" strokeLinecap="round"/>
    </svg>
  );
};

const FaceByQuestion: React.FC<{ id: string; value: number }> = ({ id, value }) => {
  if (id === "mood") return <MoodFace value={value} />;
  if (id === "energy") return <EnergyFace value={value} />;
  if (id === "social") return <SocialFace value={value} />;
  return null;
};

type Q =
  | { id: "mood" | "energy" | "social"; type: "slider"; title: string; labels?: string[] }
  | { id: "learn" | "grateful"; type: "text"; title: string; placeholder?: string };

const NotebookJournal: React.FC<NotebookJournalProps> = ({ onSave, onNavigate }) => {
  const questions: Q[] = useMemo(
    () => [
      { id: "mood", type: "slider", title: "How was your day?", labels: FIVE_LABELS },
      { id: "energy", type: "slider", title: "Energy level today?", labels: ["Very low","Low","Okay","High","Very high"] },
      { id: "social", type: "slider", title: "How social did you feel?", labels: ["Isolated","Low","Okay","Social","Very social"] },
      { id: "learn", type: "text", title: "One small thing you learned?", placeholder: "Write your answer here…" },
      { id: "grateful", type: "text", title: "Something you’re grateful for?", placeholder: "Write your answer here…" },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showEnd, setShowEnd] = useState(false);

  const q = questions[idx];
  const bg = PASTELS[idx % PASTELS.length];

  const setAnswer = (v: string) => setAnswers((p) => ({ ...p, [q.id]: v }));

  const sliderVal = q.type === "slider" ? parseInt(answers[q.id] || "3", 10) : 3;
  const sliderLabel = q.type === "slider"
    ? (q.labels || FIVE_LABELS)[clamp(sliderVal, 1, 5) - 1]
    : "";

  const canContinue =
    q.type === "text" ? (answers[q.id]?.trim().length ?? 0) > 0 : sliderVal >= 1 && sliderVal <= 5;

  const next = () => (idx < questions.length - 1 ? setIdx(idx + 1) : submit());

  const submit = () => {
    const lines = questions.map((qa) => {
      const val = (answers[qa.id] || "").trim();
      if (qa.type === "slider") {
        const labels = (qa.labels || FIVE_LABELS);
        const n = parseInt(val || "3", 10);
        const lbl = labels[clamp(n, 1, 5) - 1];
        return `${qa.title}\n- ${lbl} (${n}/5)`;
      }
      return `${qa.title}\n- ${val || "(no answer)"}`;
    });

    const today = new Date().toISOString().split("T")[0];
    const moodN = parseInt(answers.mood || "3", 10);
    onSave({
      date: today,
      mood: moodN,
      moodLabel: FIVE_LABELS[clamp(moodN, 1, 5) - 1],
      triggers: [],
      activities: [],
      notes: "✨ Today’s Journal\n\n" + lines.join("\n\n"),
      aiSummary: lines.slice(0, 2).join(" | ") || "Journal answers saved.",
    });

    // Show end screen (user taps Done to go home)
    setShowEnd(true);
  };

  if (showEnd) {
    return (
      <div className="fixed inset-0" style={{ fontFamily: SERIF }}>
        <div
          className="relative h-[100dvh] flex flex-col items-center justify-between p-6"
          style={{ backgroundColor: "#D6E4FF", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Decorative rays + sparkles */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 200" preserveAspectRatio="none" style={{ opacity: 0.18 }}>
            <g fill="none" stroke="#2F6FE0" strokeOpacity="0.25" strokeWidth="8">
              {Array.from({length:12}).map((_,i)=>(
                <line key={i} x1="50" y1="40" x2={50+Math.cos((i/12)*Math.PI*2)*120} y2={40+Math.sin((i/12)*Math.PI*2)*120}/>
              ))}
            </g>
            <g fill="#ffffff">
              <path d="M12 22 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" />
              <circle cx="85" cy="30" r="2" />
              <path d="M80 60 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5 z" />
              <circle cx="20" cy="120" r="1.6" />
              <path d="M70 150 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" />
            </g>
          </svg>

          {/* Illustration */}
          <div className="mt-8 relative z-10">
            <svg viewBox="0 0 220 180" className="w-64 h-auto">
              {/* clipboard */}
              <rect x="50" y="20" rx="12" ry="12" width="120" height="150" fill="#2F6FE0" opacity="0.2"/>
              <rect x="45" y="30" rx="12" ry="12" width="120" height="150" fill="#7BB5FF"/>
              <rect x="85" y="18" rx="6" width="40" height="16" fill="#FFE38F" />
              {/* checks */}
              <circle cx="70" cy="70" r="6" fill="#fff"/><path d="M66 70 l3 3 l6 -7" stroke="#2F6FE0" strokeWidth="3" fill="none"/>
              <rect x="85" y="66" width="55" height="6" rx="3" fill="#ffffff" opacity="0.85"/>
              <circle cx="70" cy="95" r="6" fill="#fff"/><path d="M66 95 l3 3 l6 -7" stroke="#2F6FE0" strokeWidth="3" fill="none"/>
              <rect x="85" y="91" width="55" height="6" rx="3" fill="#ffffff" opacity="0.85"/>
              <circle cx="70" cy="120" r="6" fill="#fff"/><path d="M66 120 l3 3 l6 -7" stroke="#2F6FE0" strokeWidth="3" fill="none"/>
              <rect x="85" y="116" width="55" height="6" rx="3" fill="#ffffff" opacity="0.85"/>
              {/* thumb */}
              <path d="M175 120 c-8 -10 -18 -10 -22 2 l-6 18 c-3 10 4 20 14 20 l24 0 c12 0 18 -7 18 -20 l0 -12 c0 -8 -6 -12 -14 -12 l-8 0 0 -10 c0 -8 -5 -10 -10 -6 z"
                    fill="#ffffff" stroke="#2F6FE0" strokeWidth="3"/>
            </svg>
          </div>

          {/* Text */}
          <div className="text-center z-10">
            <h1 className="text-[40px] font-extrabold leading-tight" style={{ color: "#0B2C72" }}>
              Journal saved!
            </h1>
            <p className="mt-2 text-[18px]" style={{ color: "rgba(0,0,0,0.7)" }}>
              Nice work — see you tomorrow.
            </p>
          </div>

          {/* CTA */}
          <div className="w-full max-w-sm z-10 mb-6">
            <button
              onClick={() => onNavigate("home")}
              className="w-full h-14 rounded-full text-[22px] font-semibold"
              style={{ backgroundColor: "#2F6FE0", color: "#fff", fontFamily: SERIF }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main flow
  return (
    <div className="fixed inset-0">
      <div
        className="relative h-[100dvh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: bg,
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: SERIF,
        }}
      >
        {/* Header */}
        <div className="relative z-10 px-5 pt-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate("home")}
              aria-label="Close"
              className="p-2 -ml-2 rounded-lg active:scale-95"
              style={{ fontFamily: SERIF }}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-[36px] font-extrabold tracking-tight" style={{ fontFamily: SERIF }}>
              My Journal Diary
            </div>
            <div className="w-6 h-6" />
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="h-2 rounded-full" style={{ backgroundColor: "#CFECE4" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${((idx + 1) / questions.length) * 100}%`,
                  backgroundColor: "#2FB08F",
                }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="relative z-10 px-6 mt-5">
          <h1 className="text-[40px] leading-[1.15] font-extrabold tracking-tight" style={{ fontFamily: SERIF }}>
            {q.title}
          </h1>
          {q.type === "slider" && (
            <div className="mt-2 text-[20px]" style={{ fontFamily: SERIF, color: "rgba(0,0,0,0.72)" }}>
              {sliderLabel}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="relative z-10 px-6 mt-6">
          {q.type === "text" ? (
            // Single clean card (textarea has NO inner border)
            <div
              className="rounded-[28px] border p-5"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#EFEFEF", fontFamily: SERIF }}
            >
              <textarea
                rows={6}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={q.placeholder || "Write your answer here…"}
                className="w-full outline-none text-[32px] leading-[1.35] rounded-[16px] px-2 py-1"
                style={{ background: "transparent", border: "none", boxShadow: "none", fontFamily: SERIF }}
              />
              <div className="mt-2 text-right text-xs" style={{ color: "rgba(0,0,0,0.5)" }}>
                {(answers[q.id]?.length ?? 0)} characters
              </div>
            </div>
          ) : (
            <>
              <div className="w-full flex justify-center mb-6">
                <FaceByQuestion id={q.id} value={sliderVal} />
              </div>

              {/* Transparent-track slider with green progress */}
              <div className="relative w-full max-w-[540px] mx-auto">
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                  style={{ height: 6, width: `${((sliderVal - 1) / 4) * 100}%`, backgroundColor: "#2FB08F" }}
                />
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={sliderVal}
                  onChange={(e) => setAnswer(String(parseInt(e.target.value, 10)))}
                  aria-label="slider"
                  className="journal-slider relative z-10 w-full appearance-none bg-transparent h-8"
                  style={{ fontFamily: SERIF }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[14px]" style={{ color: "rgba(0,0,0,0.45)", fontFamily: SERIF }}>
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </>
          )}

          {/* Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={next}
              disabled={!canContinue}
              className="h-14 w-[70%] rounded-full text-[22px] font-semibold transition-all"
              style={{
                backgroundColor: canContinue ? "#2FB08F" : "rgba(47,176,143,0.45)",
                color: "#FFFFFF",
                boxShadow: "none",
                fontFamily: SERIF,
                cursor: canContinue ? "pointer" : "not-allowed",
              }}
            >
              {idx === questions.length - 1 ? "Submit" : "Continue"}
            </button>
          </div>
        </div>
      </div>

      {/* Slider CSS (transparent track, matching thumb) */}
      <style>{`
        .journal-slider::-webkit-slider-thumb{
          -webkit-appearance:none; appearance:none;
          width:28px; height:28px; border-radius:9999px;
          background:#2FB08F; border:0; box-shadow:0 6px 16px rgba(0,0,0,0.15);
        }
        .journal-slider::-moz-range-thumb{
          width:28px; height:28px; border-radius:9999px;
          background:#2FB08F; border:0; box-shadow:0 6px 16px rgba(0,0,0,0.15);
        }
        .journal-slider::-webkit-slider-runnable-track{
          background: transparent; height: 6px;
        }
        .journal-slider::-moz-range-track{
          background: transparent; height: 6px;
        }
      `}</style>
    </div>
  );
};

export default NotebookJournal;
