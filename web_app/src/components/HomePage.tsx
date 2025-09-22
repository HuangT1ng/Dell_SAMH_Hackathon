import React from "react";
import {
  Brain,
  Search,
  Gamepad2,
  BookOpen,
  Users,
  ShieldCheck,
} from "lucide-react";

// Import images
import KAIPhoneApp from "../Assets/KAIPhoneApp.png";
import TeenIdentification from "../Assets/TeenIdentification.png";
import ResponseCoach from "../Assets/ResponseCoach.png";
import ResilienceGames from "../Assets/ResilienceGames.png";
import CommunityJournal from "../Assets/CommunityJournal.png";
import Community from "../Assets/Community.png";

interface HomePageProps {
  darkMode: boolean;
}

const PALETTE = {
  blue: "#4a6cf7",
  pink: "#ec4899",
  orange: "#fb923c",
  yellow: "#facc15",
  green: "#34d399",
  slate: "#64748b",
};

const HomePage: React.FC<HomePageProps> = ({ darkMode }) => {
  const textStrong = darkMode ? "text-white" : "text-slate-900";
  const textSoft = darkMode ? "text-slate-200" : "text-slate-600";
  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const ring = darkMode ? "ring-white/10" : "ring-slate-200";

  const modules = [
    {
      title: "Smart Outreach",
      desc:
        "Responsible web intelligence to surface teens who may be outside traditional systems.",
      icon: Search,
      image: TeenIdentification,
      tag: "AI Discovery",
      color: PALETTE.blue,
    },
    {
      title: "Personalized Guidance",
      desc:
        "Memory-aware tips and nudges tailored to each teen's journey.",
      icon: Brain,
      image: ResponseCoach,
      tag: "RAG Engine",
      color: PALETTE.pink,
    },
    {
      title: "Coping Micro-Games",
      desc:
        "2–3 minute scenario games that build real self-regulation skills.",
      icon: Gamepad2,
      image: ResilienceGames,
      tag: "Play to Learn",
      color: PALETTE.orange,
    },
    {
      title: "Mood Diary & Insights",
      desc:
        "Private journaling with gentle prompts and clear mood trends.",
      icon: BookOpen,
      image: CommunityJournal,
      tag: "Private by Default",
      color: PALETTE.yellow,
    },
    {
      title: "Community & Events",
      desc:
        "Moderated groups, local events, and a light rewards loop.",
      icon: Users,
      image: Community,
      tag: "Safe Social",
      color: PALETTE.green,
    },
    {
      title: "Safety & Compliance",
      desc:
        "RBAC, data minimization, audit trails, and PDPA-ready connectors.",
      icon: ShieldCheck,
      tag: "Trust",
      color: PALETTE.slate,
    },
  ];

  return (
    <div
      className={`${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800"
          : "bg-gradient-to-br from-blue-50 via-white to-pink-50"
      } min-h-screen`}
    >
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* ===== HERO (Modern Design) ===== */}
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          {/* Phone mock / visual block */}
          <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: PALETTE.blue }}></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: PALETTE.pink }}></div>
            <div className="absolute top-1/2 -right-8 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: PALETTE.orange }}></div>
            
            <div
              className={`relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border-2 ${
                darkMode ? 'border-slate-700' : 'border-white/50'
              }`}
              style={{ 
                background: darkMode 
                  ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              {/* phone with actual app image */}
              <div className="relative h-full w-full grid place-items-center">
                <div className="relative h-[540px] w-[270px] rounded-[40px] shadow-2xl ring-2 ring-white/20 overflow-hidden">
                  <img 
                    src={KAIPhoneApp} 
                    alt="K.AI Phone App" 
                    className="w-full h-full object-cover rounded-[40px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h1 className={`text-5xl md:text-7xl font-bold bg-gradient-to-r ${darkMode ? 'from-white to-slate-300' : 'from-slate-900 to-slate-600'} bg-clip-text text-transparent`}>
                K.AI
              </h1>
              <h2 className={`text-3xl md:text-5xl font-semibold ${textStrong}`}>
                Teen Resilience Platform
              </h2>
            </div>
            
            <p className={`text-xl leading-relaxed ${textSoft} max-w-lg`}>
              K.AI helps teens build coping skills, keep a private mood diary,
              and find safe community connections — in a single, privacy-first app.
              Built for Singapore youth and partners who support them.
            </p>

            <div className="flex flex-wrap gap-3">
              <span
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: PALETTE.blue, color: 'white' }}
              >
                Youth-first UX
              </span>
              <span
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: PALETTE.pink, color: 'white' }}
              >
                Memory-aware RAG
              </span>
              <span
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: PALETTE.orange, color: 'white' }}
              >
                Micro-games
              </span>
              <span
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: PALETTE.yellow, color: 'black' }}
              >
                Private by default
              </span>
            </div>
          </div>
        </section>

        {/* ===== FEATURES (Modern Cards) ===== */}
        <section id="features" className="mt-20 md:mt-32">
          <div className="text-center mb-16">
            <h3 className={`text-4xl md:text-5xl font-bold ${textStrong} mb-4`}>
              Features
            </h3>
            <p className={`text-xl ${textSoft} max-w-2xl mx-auto`}>
              Comprehensive tools designed to support teen mental health and resilience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <article
                  key={idx}
                  className={`group relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                    darkMode
                      ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm"
                      : "bg-gradient-to-br from-white/90 to-white/70 border border-white/50 backdrop-blur-sm shadow-xl"
                  }`}
                  style={{
                    background: darkMode 
                      ? `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)`
                      : `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`
                  }}
                >
                  {/* Decorative gradient overlay */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${m.color}20 0%, ${m.color}40 100%)`
                    }}
                  ></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className="grid h-16 w-16 place-items-center rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: m.color }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className={`text-2xl font-bold ${textStrong}`}>
                        {m.title}
                      </h4>
                    </div>
                    
                    <p className={`text-lg leading-relaxed ${textSoft} mb-6`}>{m.desc}</p>
                    
                    {/* Feature image */}
                    {m.image && (
                      <div className="rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <img 
                          src={m.image} 
                          alt={m.title}
                          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
