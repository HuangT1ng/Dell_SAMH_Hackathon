import React, { useEffect, useRef, useState } from "react";

/* ---------- types ---------- */
type Choice = { choice_id: number; label: string; health_impact: number };
type Scenario = { question_id: number; prompt: string; choices: [Choice, Choice] };

interface Props { onBack: () => void; }

/* ---------- constants ---------- */
const START_HEALTH = 100;
const MIN_HEALTH = 0;
const MAX_HEALTH = 200;
const LANES = [-140, 140] as const;      // px offset from center (left/right)
const PLAYER_LINE_VH = 82;               // where the player stands
const GATE_START_VH = -20;               // gates spawn above screen
const GATE_SPEED_VH_PER_SEC = 40;        // how fast the gate falls
const STRIPE_SPEED = 200;                // px/sec for road stripe loop

const AcademicStressGamePage: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<Scenario[]>([]);
  const [i, setI] = useState(0);
   const [phase, setPhase] = useState<"loading"|"running"|"done">("loading");
  const [lane, setLane] = useState<0|1>(0);
  const [gateY, setGateY] = useState(GATE_START_VH);
  const [health, setHealth] = useState(START_HEALTH); // kept internal; not displayed
  const [chosen, setChosen] = useState<Choice|null>(null);
  const stripesRef = useRef<HTMLDivElement|null>(null);

  const current = data[i];

  /* load game data (your JSON file) */
  useEffect(() => {
    (async () => {
      const res = await fetch("/StressGameAcademic.json");
      const j = await res.json();
      setData(j.questions);
      setPhase("running");
    })();
  }, []);

  /* keyboard and touch lane switching */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "running") return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") setLane(0);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") setLane(1);
    };

    const onTouch = (e: TouchEvent) => {
      if (phase !== "running") return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;
      const touchX = touch.clientX;
      
      // Left half of screen = left lane, right half = right lane
      if (touchX < screenWidth / 2) {
        setLane(0);
      } else {
        setLane(1);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouch, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [phase]);

  /* animation loop: road stripes + falling gate */
  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    let last = performance.now();
    let stripeOffset = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000; // seconds
      last = now;

      // move stripes
      stripeOffset = (stripeOffset + STRIPE_SPEED * dt) % 160;
      if (stripesRef.current) stripesRef.current.style.transform = `translateY(${stripeOffset}px)`;

      // move gate
      setGateY(prev => prev + GATE_SPEED_VH_PER_SEC * dt);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

   /* when gate reaches player line -> apply chosen lane automatically */
   useEffect(() => {
     if (phase !== "running") return;
     if (!current) return;
     if (gateY < PLAYER_LINE_VH) return;

     const picked = lane === 0 ? current.choices[0] : current.choices[1];
     setChosen(picked);
     setHealth(h => Math.max(MIN_HEALTH, Math.min(MAX_HEALTH, h + picked.health_impact)));
     
     // Skip feedback phase and go directly to next round
     if (i + 1 < data.length) {
       setI(i + 1);
       setGateY(GATE_START_VH);
       // Keep current lane position instead of resetting to 0
       setChosen(null);
       setPhase("running");
     } else {
       setPhase("done");
     }
   }, [gateY, phase, current, lane, i, data.length]);

  const nextRound = () => {
    if (i + 1 < data.length) {
      setI(i + 1);
      setGateY(GATE_START_VH);
      // Keep current lane position instead of resetting to 0
      setChosen(null);
      setPhase("running");
    } else {
      setPhase("done");
    }
  };

  if (!current || phase === "loading") {
    return <div className="min-h-screen text-slate-900 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>Loading…</div>;
  }

  return (
    <>
      <style>
        {`
          @keyframes moveStripes {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
          }
        `}
      </style>
      <div className="min-h-screen text-slate-900 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* top bar with back + prompt only */}
      <div className="absolute top-0 left-0 right-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={onBack} className="text-slate-700 hover:text-slate-900 font-medium">⟵ Back</button>
            <div className="text-sm text-slate-600 font-medium">Q {i + 1} / {data.length}</div>
            <div className="w-[64px]" />
        </div>
        </div>

        {/* Question band (new) */}
        <div className="absolute top-[80px] sm:top-[64px] left-0 right-0 z-30 flex items-center justify-center">
        <div className="max-w-2xl sm:max-w-3xl px-4 sm:px-6 py-2 sm:py-4 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
            {current.prompt}
            </h2>
        </div>
        </div>

      {/* touch zones for mobile with lane indicators */}
      <div className="absolute inset-0 flex pointer-events-auto">
        <div className={`flex-1 bg-transparent transition-colors duration-200 ${lane === 0 ? '' : ''}`} style={{ backgroundColor: lane === 0 ? 'rgba(236, 72, 153, 0.1)' : 'transparent' }} />
        <div className={`flex-1 bg-transparent transition-colors duration-200 ${lane === 1 ? '' : ''}`} style={{ backgroundColor: lane === 1 ? 'rgba(74, 108, 247, 0.1)' : 'transparent' }} />
      </div>

      {/* full screen road background */}
      <div className="absolute inset-0" style={{ backgroundColor: '#94a3b8' }}>
        {/* center dashed line (CSS-based) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-2 h-full"
          style={{
            background: 'repeating-linear-gradient(to bottom, white 0px, white 20px, transparent 20px, transparent 40px)',
            animation: 'moveStripes 1s linear infinite'
          }}
        />
      </div>

      {/* play field container */}
      <div className="absolute top-[140px] left-0 right-0 sm:top-0 sm:inset-0 flex items-center justify-center pb-0 sm:pb-8 pointer-events-none">
        <div className="relative w-[85vw] sm:w-[800px] h-[55vh] sm:h-[72vh] rounded-[16px] sm:rounded-[28px] overflow-hidden shadow-2xl bg-transparent">
          {/* rail lines */}
          <div className="absolute top-2 left-0 right-0 h-[3px]" style={{ backgroundColor: '#ec4899' }} />
          <div className="absolute bottom-2 left-0 right-0 h-[3px]" style={{ backgroundColor: '#4a6cf7' }} />

          {/* player icon (fixed) */}
          <div
            className="absolute left-1/2 bottom-[4vh] sm:bottom-[6vh] z-20 transition-transform duration-150"
            style={{ transform: `translateX(${lane === 0 ? LANES[0] : LANES[1]}px)` }}
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg" style={{ backgroundColor: '#facc15' }} />
              <div className="absolute inset-0 blur-md rounded-full" style={{ backgroundColor: '#fb923c', opacity: 0.25 }} />
            </div>
          </div>

           {/* joined gate pair, sliding down */}
           <div
             className="absolute left-1/2 -translate-x-1/2 z-10 grid grid-cols-2 gap-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl"
             style={{ 
               top: `${gateY}vh`, 
               width: window.innerWidth < 640 ? Math.min(320, window.innerWidth - 32) : 640, 
               height: window.innerWidth < 640 ? 80 : 120 
             }}
           >
             {/* left gate */}
             <div className={`p-3 sm:p-8 pr-2 sm:pr-4 text-left border-r border-white/20 ${lane===0 ? "scale-[1.02]" : "scale-100"} transition-transform flex items-center`} style={{ backgroundColor: '#ec4899' }}>
               <div className="opacity-90 text-sm sm:text-lg font-medium max-w-[140px] sm:max-w-[280px] leading-tight sm:leading-relaxed text-white">{current.choices[0].label}</div>
             </div>
             {/* right gate */}
             <div className={`p-3 sm:p-8 pl-2 sm:pl-4 text-right ${lane===1 ? "scale-[1.02]" : "scale-100"} transition-transform flex items-center justify-end`} style={{ backgroundColor: '#4a6cf7' }}>
               <div className="opacity-90 text-sm sm:text-lg font-medium max-w-[140px] sm:max-w-[280px] leading-tight sm:leading-relaxed text-white">{current.choices[1].label}</div>
             </div>
           </div>

          {/* player line guide */}
          <div
            className="absolute left-0 right-0 z-0"
            style={{ top: `${PLAYER_LINE_VH}vh` }}
          >
            <div className="mx-auto w-24 h-[3px] bg-white/70 rounded" />
          </div>
        </div>
      </div>


      {/* final screen */}
      {phase === "done" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-4 shadow-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">All done!</h3>
            {/* keep the result simple; still no live health HUD */}
            <p className="mb-4 text-sm sm:text-base text-slate-600">Thanks for playing.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setI(0); setHealth(START_HEALTH); setGateY(GATE_START_VH); setLane(0); setPhase("running"); setChosen(null); }}
                className="px-5 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: '#4a6cf7' }}
              >
                Play again
              </button>
              <button 
                onClick={onBack} 
                className="px-5 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: '#ec4899' }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* minimal controls hint (optional) */}
      {phase === "running" && (
        <div className="absolute left-4 bottom-4 text-xs text-white/70">
          ← / A = Left • → / D = Right
        </div>
      )}
    </div>
    </>
  );
};

export default AcademicStressGamePage;
