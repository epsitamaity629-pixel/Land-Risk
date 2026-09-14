import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Bot,
  User,
  Send,
  X,
  Sparkles,
  RefreshCw,
  PhoneCall,
  ShieldAlert,
  ChevronDown,
  MapPin,
  HelpCircle,
  Volume2,
  Minimize2,
  Radio,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { generateLocationPredictionFallback, searchGazetteer } from "../services/fallbackEngine";

const INITIAL_MESSAGES = [
  {
    sender: "bot",
    text: "🙏 Welcome to **BHU-SURAKSHA AI Assistant**! I am your real-time Multi-Hazard Risk & Disaster Intelligence assistant. Ask me anything about location risk, live weather forecasts, route safety, or emergency evacuation procedures.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    chips: [
      "⛰️ Darjeeling risk status?",
      "🛣️ Siliguri to Gangtok route?",
      "📞 Emergency Helpline numbers?",
      "🌧️ Flash flood safety guide"
    ]
  }
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Generate Intelligent Response after realistic delay
    setTimeout(async () => {
      const response = await generateAIResponse(query);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chips: response.chips
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const generateAIResponse = async (q) => {
    const raw = q.toLowerCase().trim();

    // 1. Emergency Helpline Query
    if (raw.includes("helpline") || raw.includes("emergency") || raw.includes("phone") || raw.includes("contact") || raw.includes("help") || raw.includes("number") || raw.includes("সাহায্য")) {
      return {
        text: `🚨 **BHU-SURAKSHA Emergency Contacts & Helplines:**\n\n` +
          `• **NDRF National Disaster Helpline:** 📞 1078 / 011-24363260\n` +
          `• **State Disaster Management Authority (SDMA):** 📞 1070\n` +
          `• **National Emergency Response Support System (ERSS):** 📞 112\n` +
          `• **Ambulance Services:** 📞 102 / 108\n` +
          `• **NER Disaster Control Room:** 📞 +91-361-2237011\n\n` +
          `*Tip: In case of active slope collapse or sudden flash flood, move immediately to higher ground and trigger emergency beacon.*`,
        chips: ["⛰️ Darjeeling risk status?", "🌊 Flood safety guide", "🛣️ Check Route Risk"]
      };
    }

    // 2. Route Safety Query
    if (raw.includes("route") || raw.includes("highway") || raw.includes("road") || raw.includes("corridor") || raw.includes("nh10") || raw.includes("nh-10") || raw.includes("raasta") || raw.includes("পথ")) {
      return {
        text: `🛣️ **Corridor Route Hazard Intelligence:**\n\n` +
          `• **Siliguri → Gangtok (NH-10):** 🟡 MODERATE-HIGH HAZARD. Paglajhora & Teesta basin vulnerable to slope slips.\n` +
          `• **Rishikesh → Kedarnath (NH-107):** 🔴 HIGH HAZARD. Active monitoring at Lincholi & Sonprayag.\n` +
          `• **Guwahati → Shillong (NH-6):** 🟢 STABLE PASSAGE. Rain watch active in Upper Shillong bypass.\n` +
          `• **Manali → Leh (NH-3):** 🟡 ADVISORY WATCH. Freeze-thaw rockfalls at high elevation passes.\n\n` +
          `Would you like me to inspect a specific origin and destination route?`,
        chips: ["Analyze Siliguri to Gangtok", "Check Darjeeling Risk", "Emergency Helplines"]
      };
    }

    // 3. Safety Protocols & Guidelines
    if (raw.includes("safety") || raw.includes("guide") || raw.includes("do") || raw.includes("what to do") || raw.includes("precautions") || raw.includes("কী করব")) {
      return {
        text: `🛡️ **Landslide & Flood Safety Protocol (BHU-SURAKSHA Protocol):**\n\n` +
          `**Before / During Landslide:**\n` +
          `1. Watch for warning signs: sudden soil cracks, tilting trees/fences, or muddy stream discharge.\n` +
          `2. Evacuate cut-slopes immediately upon hearing ground rumbling.\n` +
          `3. Stay away from steep natural drainage channels during high rainfall (>80mm/24h).\n\n` +
          `**During Flash Floods:**\n` +
          `1. Move to elevation > 15m above riverbank level.\n` +
          `2. Never attempt to walk or drive through moving floodwaters (15cm water can knock down adults).`,
        chips: ["Check Shillong Risk", "Check Wayanad Risk", "Emergency Helplines"]
      };
    }

    // 4. Specific Location Query - Geocoding via Fallback Engine
    const locationHits = searchGazetteer(raw, 1);
    let targetPlace = locationHits && locationHits.length > 0 ? locationHits[0].name : q;

    try {
      const predData = await generateLocationPredictionFallback(targetPlace);
      const loc = predData.location;
      const ls = predData.prediction.landslide;
      const fl = predData.prediction.flood;
      const score = predData.multi_hazard_scorecard.overall_risk_score;
      const priority = predData.emergency_priority;

      const riskBadge = score >= 60 ? "🔴 DANGER (HIGH HAZARD)" : score >= 40 ? "🟡 MODERATE WATCH" : "🟢 DANGER FREE (SAFE)";

      return {
        text: `📍 **Disaster Risk Intelligence Report for ${loc.name} (${loc.state || 'India'})**\n\n` +
          `• **Overall Multi-Hazard Rating:** **${score}/100** — ${riskBadge}\n` +
          `• **Landslide Risk:** **${ls.risk_score}/100** (${ls.probability_pct}% probability)\n` +
          `• **Flood Risk:** **${fl.risk_score}/100** (${fl.probability_pct}% probability)\n` +
          `• **Terrain Parameters:** Elevation **${loc.elevation_m}m**, Slope **${loc.slope_deg}°**\n` +
          `• **Live Weather:** 24h Rain **${predData.live_meteorology.rainfall_24h_mm}mm**, Soil Moisture **${predData.live_meteorology.soil_moisture_pct}%**\n` +
          `• **Triage Directive:** ${priority.rationale}\n\n` +
          `💡 *SMS Alert Template:* \`${predData.early_warning_sms_template}\``,
        chips: [
          `Forecast for ${loc.name}`,
          `Route to ${loc.name}`,
          "Emergency Helplines"
        ]
      };
    } catch (e) {
      return {
        text: `🤖 **BHU-SURAKSHA Intelligence Engine Response:**\n\n` +
          `I evaluated your query: "${q}". The terrain stability grid is active for 8 NER states and Pan-India.\n\n` +
          `You can search for any city, district, village, or highway (e.g. *Darjeeling, Guwahati, Gangtok, Shillong, Wayanad, Kedarnath*), or ask for emergency contacts!`,
        chips: ["Darjeeling Risk Status", "Emergency Helplines", "Siliguri to Gangtok Route"]
      };
    }
  };

  return (
    <>
      {/* Floating Trigger Button at Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-5 right-5 z-50 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-emerald-400 transition-all transform hover:scale-105 group"
          title="Open BHU-SURAKSHA AI Disaster Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs tracking-wide">BHU-SURAKSHA AI Assistant</span>
          <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border border-emerald-600">
            v2.4
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-4 w-72 h-14"
              : "bottom-4 w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh]"
          } bg-white rounded-2xl border border-slate-300 shadow-2xl flex flex-col overflow-hidden font-sans`}
        >
          {/* Modal Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-600 text-slate-950 font-black">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs tracking-tight text-white m-0">BHU-SURAKSHA AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 m-0">Multi-Hazard Disaster Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Chat Body */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${
                      m.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        m.sender === "user"
                          ? "bg-slate-800 text-white"
                          : "bg-emerald-700 text-white shadow-xs"
                      }`}
                    >
                      {m.sender === "user" ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="max-w-[82%] space-y-1">
                      <div
                        className={`p-3 rounded-2xl text-slate-800 leading-relaxed shadow-xs ${
                          m.sender === "user"
                            ? "bg-emerald-700 text-white rounded-tr-none font-medium"
                            : "bg-white border border-slate-200 rounded-tl-none font-normal"
                        }`}
                      >
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: m.text
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/`([^`]+)`/g, "<code class='bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono text-[11px]'>$1</code>")
                          }}
                        />
                      </div>

                      <span className="text-[9px] text-slate-400 block px-1">
                        {m.timestamp}
                      </span>

                      {/* Quick Suggestion Chips */}
                      {m.chips && m.chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.chips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleSend(chip)}
                              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-semibold transition"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <Bot className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                    <span>BHU-SURAKSHA AI is analyzing telemetry data...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI about Darjeeling, flood risk, or helpline..."
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition disabled:opacity-40 disabled:hover:bg-emerald-700 shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
