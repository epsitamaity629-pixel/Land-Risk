import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle2,
  Shield,
  HelpCircle,
  Minimize2,
  Maximize2,
  X,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Droplets,
  Mountain,
  Activity
} from "lucide-react";
import { chatWithAIAssistant } from "../api";
import { useAuth } from "../AuthContext";

export default function AIChatAssistant({ locationData = null, defaultOpen = false }) {
  const { t } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 **Bhu-Surakha AI Assistant** online.\n\nI provide real-time disaster risk intelligence across North Eastern India and all Indian states. Grounded strictly in live meteorological telemetry, DEM slope gradients, BIS IS 1893 seismic zoning, and verified historical records.\n\nAsk me anything or choose a quick prompt below:",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const locName = locationData?.location?.name || "Shillong";
  const locState = locationData?.location?.state || "Meghalaya";

  const QUICK_PROMPTS = [
    `Is ${locName} safe for travel today?`,
    `Why is ${locName} showing elevated risk?`,
    `What happened historically in ${locName}?`,
    `What if rainfall increases by 40% in ${locName}?`,
    `Compare ${locName} and Gangtok`,
    `What should citizens do during a landslide warning?`,
    `Which NER districts are currently most vulnerable?`,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (userText = input) => {
    const textToSend = userText.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithAIAssistant(textToSend, locName, locationData);
      const aiReply = {
        sender: "ai",
        text: res.reply || "Analysis completed based on live telemetry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        scorecard: res.scorecard,
        location: res.location,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ **Error retrieving disaster intelligence:** ${err.message || "Network issue"}. Please verify backend connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Speech Recognition / Voice Input
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      handleSend(speechResult);
    };

    recognition.start();
  };

  // Format Markdown-like text
  const renderFormattedText = (txt) => {
    return txt.split("\n").map((line, idx) => {
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5 text-xs">
            <span className="text-emerald-400 font-bold">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: line.substring(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </div>
        );
      }
      return (
        <p
          key={idx}
          className="my-1 text-xs leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button if closed */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full shadow-lg border border-emerald-400/40 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">AI Assistant</span>
        </button>
      )}

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed bottom-16 sm:bottom-5 right-2 sm:right-5 left-2 sm:left-auto z-50 sm:w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden text-slate-900 ${
            isMinimized ? "h-14" : "h-[580px] max-h-[80vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-white">
                    Bhu-Surakha AI Assistant
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold rounded-full">
                    Grounded Live
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 block font-medium">
                  Context: <span className="text-emerald-300 font-semibold">{locName}, {locState}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-300 hover:text-white"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-300 hover:text-white"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 custom-scrollbar bg-slate-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white shadow-2xs"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {msg.sender === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs ${
                        msg.sender === "user"
                          ? "bg-purple-700 text-white rounded-tr-none font-medium"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none leading-relaxed"
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Small Score Pill if available in reply */}
                      {msg.scorecard && (
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700 border border-slate-200">
                            Overall: {msg.scorecard.overall_risk_score}/100
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            LS: {msg.scorecard.landslide_score}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                            Flood: {msg.scorecard.flood_score}
                          </span>
                        </div>
                      )}

                      <span className={`block text-[9px] text-right mt-1 ${msg.sender === "user" ? "text-purple-200" : "text-slate-400"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl animate-pulse w-fit shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Analyzing live telemetry & computing hazard probabilities...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Pills */}
              <div className="p-2 bg-white border-t border-slate-200 overflow-x-auto custom-scrollbar flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 pl-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Prompts:
                </span>
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(qp)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition shrink-0"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-2 rounded-xl transition ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${locName}, flood risk, safe routes...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
