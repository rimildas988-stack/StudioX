import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Layout, Code, Smartphone, ChevronRight, Send, Quote, Menu, X,
  ExternalLink, Sparkles, Wand2, Bot, Loader2, Zap, CheckCircle2,
  Palette, Check, ArrowRight, Globe, Layers, Cpu
} from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "E-Commerce Luxury Brand",
    category: "Web App",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    description: "A high-end shopping experience with seamless checkout flow and dynamic product filtering.",
    tech: ["React", "Stripe", "Tailwind CSS"],
    live: "#"
  },
  {
    id: 2,
    title: "FinTech Dashboard",
    category: "UI/UX Design",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    description: "Complex financial data visualized in a clean, intuitive interface with real-time charts.",
    tech: ["Next.js", "Chart.js", "Prisma"],
    live: "#"
  },
  {
    id: 3,
    title: "AI SaaS Platform",
    category: "Full Stack",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&q=80&w=800",
    description: "A production-ready AI platform with usage analytics, billing, and team management.",
    tech: ["React", "Node.js", "OpenAI"],
    live: "#"
  },
  {
    id: 4,
    title: "Creative Agency Portfolio",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&q=80&w=800",
    description: "Award-winning agency site with immersive scroll animations and case study showcases.",
    tech: ["Next.js", "GSAP", "Sanity CMS"],
    live: "#"
  }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    company: "Luxe Boutique",
    designRating: 5,
    text: "Absolutely stunning work. The design exceeded our expectations, and the communication was incredibly professional throughout the project."
  },
  {
    id: 2,
    name: "Rajan Mehta",
    company: "FinFlow Inc.",
    designRating: 5,
    text: "Delivered ahead of schedule with pixel-perfect quality. The dashboard has transformed how our team reads data every day."
  }
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "₹999",
    desc: "Perfect for personal projects and small businesses getting started online.",
    features: ["1-page responsive website", "Mobile optimized", "Basic SEO setup", "2 revision rounds", "7-day delivery"],
    cta: "Get Started",
    highlight: false
  },
  {
    name: "Pro",
    price: "₹2,999",
    desc: "Full-featured site for growing businesses that need a serious web presence.",
    features: ["Up to 5 pages", "Custom animations", "Contact form + CMS", "AI chatbot integration", "5 revision rounds", "3-day delivery"],
    cta: "Most Popular",
    highlight: true
  },
  {
    name: "Premium",
    price: "₹5,999",
    desc: "Complete digital solution with advanced features and priority support.",
    features: ["Unlimited pages", "Full-stack web app", "Payment gateway", "Admin dashboard", "Unlimited revisions", "Priority 48hr delivery"],
    cta: "Go Premium",
    highlight: false
  }
];

// --- CLAUDE API ---
const callClaude = async (userMessage, systemPrompt = "", conversationHistory = [], isJson = false) => {
  const messages = [
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt || undefined,
    messages
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  if (isJson) {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
  return text;
};

// --- TOAST ---
const Toast = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      display: "flex", alignItems: "center", gap: 12,
      background: "#111", border: "1px solid rgba(245,158,11,0.3)",
      color: "#fff", padding: "14px 20px", borderRadius: 16,
      boxShadow: "0 10px 40px rgba(245,158,11,0.15)",
      animation: "slideUp 0.3s ease"
    }}>
      <CheckCircle2 style={{ width: 18, height: 18, color: "#f59e0b", flexShrink: 0 }} />
      <span style={{ fontWeight: 500, fontSize: 14 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", marginLeft: 8, padding: 0 }}>
        <X style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
};

// --- STAR RATING ---
const StarRatingInput = ({ rating, setRating }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} type="button" onClick={() => setRating(star)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <Star style={{ width: 18, height: 18, fill: star <= rating ? "#f59e0b" : "transparent", color: star <= rating ? "#f59e0b" : "#4b5563" }} />
      </button>
    ))}
  </div>
);

// --- PROJECT MODAL ---
const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, maxWidth: 680, width: "100%", overflow: "hidden",
        animation: "zoomIn 0.25s ease"
      }}>
        <div style={{ position: "relative" }}>
          <img src={project.image} alt={project.title} style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%",
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff"
          }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
          <div style={{
            position: "absolute", top: 16, left: 16,
            background: "rgba(245,158,11,0.9)", color: "#000",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            padding: "4px 12px", borderRadius: 20, textTransform: "uppercase"
          }}>{project.category}</div>
        </div>
        <div style={{ padding: 32 }}>
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>{project.title}</h3>
          <p style={{ color: "#9ca3af", lineHeight: 1.7, margin: "0 0 24px" }}>{project.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {project.tech.map(t => (
              <span key={t} style={{
                background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.2)",
                fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20
              }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "12px 24px", borderRadius: 12,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#9ca3af", fontWeight: 600, cursor: "pointer", fontSize: 14
            }}>Close</button>
            <button style={{
              flex: 2, padding: "12px 24px", borderRadius: 12,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "none", color: "#000", fontWeight: 700, cursor: "pointer",
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <ExternalLink style={{ width: 16, height: 16 }} /> View Live Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CONTACT MODAL ---
const ContactModal = ({ isOpen, onClose, showToast }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    onClose();
    showToast("Message sent! I'll be in touch shortly. 🚀");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, maxWidth: 520, width: "100%", padding: 40,
        animation: "zoomIn 0.25s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Start a Project</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[["Your Name", "name", "text"], ["Email Address", "email", "email"]].map(([ph, key, type]) => (
            <input key={key} type={type} required placeholder={ph} value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              style={{
                background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "14px 18px", color: "#fff", fontSize: 14,
                outline: "none", width: "100%", boxSizing: "border-box"
              }}
            />
          ))}
          <textarea required placeholder="Tell me about your project..." value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            style={{
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "14px 18px", color: "#fff", fontSize: 14,
              outline: "none", width: "100%", resize: "none", height: 120, boxSizing: "border-box"
            }}
          />
          <button type="submit" disabled={sending} style={{
            padding: "14px 24px", borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            border: "none", color: "#000", fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
            fontSize: 15, opacity: sending ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {sending ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Send style={{ width: 16, height: 16 }} />}
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [reviewForm, setReviewForm] = useState({ name: "", company: "", designRating: 0, text: "" });
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [projectPrompt, setProjectPrompt] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [brandPrompt, setBrandPrompt] = useState("");
  const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
  const [brandIdentity, setBrandIdentity] = useState(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi 👋 I'm here to help. Ask me about services, pricing, or anything else!" }]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 4000);
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- AI HANDLERS ---
  const handleEnhanceReview = async () => {
    if (!reviewForm.text.trim()) return;
    setIsEnhancing(true);
    try {
      const result = await callClaude(
        reviewForm.text,
        "You are a professional copywriter. Rewrite this client testimonial to be more professional, enthusiastic, and specific. Keep it to 2-3 sentences. Return ONLY the rewritten text with no quotes or preamble."
      );
      setReviewForm(f => ({ ...f, text: result.trim() }));
      showToast("Review enhanced! ✨");
    } catch {
      showToast("⚠️ AI unavailable. Try again.");
    }
    setIsEnhancing(false);
  };

  const handleAiConsult = async (e) => {
    e.preventDefault();
    if (!projectPrompt.trim()) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await callClaude(
        projectPrompt,
        "Act as a premium web design consultant. Based on the user's project idea, provide a concise, readable plain text response with:\n1. A catchy project title.\n2. Design Vibe (e.g. Minimalist, Brutalist, Editorial).\n3. Three essential features (as bullet points with •).\n4. Estimated complexity: Low / Medium / High.\nKeep it crisp and inspiring."
      );
      setAiAnalysis(result);
      showToast("Blueprint generated! 📐");
    } catch {
      showToast("⚠️ AI unavailable. Try again.");
    }
    setIsAnalyzing(false);
  };

  const handleBrandGeneration = async (e) => {
    e.preventDefault();
    if (!brandPrompt.trim()) return;
    setIsGeneratingBrand(true);
    setBrandIdentity(null);
    try {
      const result = await callClaude(
        `Generate a brand identity for this business: ${brandPrompt}`,
        `You are a world-class brand identity designer. Respond ONLY with a valid JSON object (no markdown, no code fences) with these exact keys:
- "brandName": short catchy brand name
- "tagline": punchy hero headline (max 6 words)
- "primaryColor": dark rich hex background color
- "secondaryColor": light high-contrast text hex color
- "accentColor": vibrant CTA hex color
- "rationale": one sentence explaining the aesthetic fit`
      );
      const cleaned = result.replace(/```json|```/g, "").trim();
      setBrandIdentity(JSON.parse(cleaned));
      showToast("Brand identity generated! ✨");
    } catch {
      showToast("⚠️ AI failed. Try again!");
    }
    setIsGeneratingBrand(false);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text || reviewForm.designRating === 0) {
      showToast("Please fill all required fields and add a rating.");
      return;
    }
    setReviews(prev => [{ id: Date.now(), ...reviewForm }, ...prev]);
    setReviewForm({ name: "", company: "", designRating: 0, text: "" });
    showToast("Review published! Thank you 🙏");
  };

  // --- CHAT (fixed: no auto follow-up spam) ---
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userText = chatInput.trim();
    setChatInput("");

    const userMsg = { role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build history for Claude (exclude the initial bot greeting which has wrong format)
      const history = messages
        .filter((_, i) => i > 0)
        .map(m => ({ role: m.role === "bot" ? "assistant" : m.role, content: m.content }));

      const reply = await callClaude(
        userText,
        `You are a smart, friendly sales assistant for StudioX — a premium web design studio based in India.
Services: business websites, portfolios, dashboards, AI-powered apps.
Pricing: Basic ₹999 (7 days), Pro ₹2,999 (3 days), Premium ₹5,999 (48 hrs).
WhatsApp: +91 70298 28029.
Keep answers short, warm, and persuasive. Mention WhatsApp for placing orders.`,
        history
      );
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please reach out on WhatsApp at +91 70298 28029!" }]);
    }
    setIsTyping(false);
  };

  const isAiBusy = isAnalyzing || isEnhancing || isGeneratingBrand;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(245,158,11,0.3); color: #fde68a; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        input::placeholder, textarea::placeholder { color: #4b5563; }
        input:focus, textarea:focus { border-color: rgba(245,158,11,0.4) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />

      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast(t => ({ ...t, visible: false }))} />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} showToast={showToast} />

      {/* AI LOADING OVERLAY */}
      {isAiBusy && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Loader2 style={{ width: 48, height: 48, color: "#f59e0b", animation: "spin 1s linear infinite" }} />
            <span style={{ color: "#f59e0b", fontWeight: 600, letterSpacing: "0.15em", fontSize: 12, textTransform: "uppercase", animation: "pulse 1.5s ease infinite" }}>
              Claude is thinking…
            </span>
          </div>
        </div>
      )}

      {/* CHAT BUTTON */}
      <button onClick={() => setChatOpen(o => !o)} style={{
        position: "fixed", bottom: 24, left: 24, zIndex: 50,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 32px rgba(245,158,11,0.35)", transition: "transform 0.2s",
        fontSize: 22
      }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {chatOpen ? <X style={{ width: 22, height: 22, color: "#000" }} /> : "💬"}
      </button>

      {/* CHAT BOX */}
      {chatOpen && (
        <div style={{
          position: "fixed", bottom: 96, left: 24, width: 320,
          background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, zIndex: 50, display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          animation: "slideUp 0.3s ease"
        }}>
          <div style={{
            padding: "14px 18px", background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot style={{ width: 18, height: 18, color: "#f59e0b" }} />
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>AI Assistant</span>
              <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s ease infinite" }} />
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          <div style={{ height: 300, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "rgba(0,0,0,0.3)" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "#f59e0b" : "rgba(255,255,255,0.07)",
                color: m.role === "user" ? "#000" : "#d1d5db",
                borderTopRightRadius: m.role === "user" ? 4 : 14,
                borderTopLeftRadius: m.role === "user" ? 14 : 4,
                border: m.role !== "user" ? "1px solid rgba(255,255,255,0.05)" : "none"
              }}>{m.content}</div>
            ))}
            {isTyping && (
              <div style={{
                alignSelf: "flex-start", background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "10px 14px", borderRadius: "14px 14px 14px 4px",
                display: "flex", gap: 4, alignItems: "center"
              }}>
                {[0, 150, 300].map(d => (
                  <div key={d} style={{ width: 6, height: 6, background: "#9ca3af", borderRadius: "50%", animation: `bounce 1s ease infinite`, animationDelay: `${d}ms` }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)", padding: "8px 12px", gap: 8, alignItems: "center" }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChatMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1, background: "transparent", border: "none", color: "#fff",
                fontSize: 13, outline: "none", padding: "6px 4px"
              }} />
            <button onClick={sendChatMessage} disabled={!chatInput.trim() || isTyping}
              style={{
                background: "none", border: "none", color: chatInput.trim() ? "#f59e0b" : "#4b5563",
                cursor: chatInput.trim() ? "pointer" : "not-allowed", padding: 4, transition: "color 0.2s"
              }}>
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.3s",
        background: isScrolled ? "rgba(10,10,10,0.85)" : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        padding: isScrolled ? "16px 0" : "24px 0"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #fde68a, #d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 16, height: 16, color: "#000" }} />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>
              Studio<span style={{ color: "#f59e0b" }}>X</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
            {[["work", "Portfolio"], ["pricing", "Pricing"], ["ai-consult", "AI Concierge"], ["ai-brand", "Brand Architect"]].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={e => handleNavClick(e, id)}
                style={{ fontSize: 14, fontWeight: 500, color: "#9ca3af", textDecoration: "none", transition: "color 0.2s", cursor: "pointer" }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "#9ca3af"}
              >{label}</a>
            ))}
            <button onClick={() => setIsContactModalOpen(true)} style={{
              padding: "10px 22px", background: "#fff", color: "#000", border: "none",
              borderRadius: 100, fontWeight: 700, fontSize: 13, cursor: "pointer",
              transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >Start a Project</button>
          </div>

          <button onClick={() => setMobileMenuOpen(o => !o)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "none" }} className="mobile-menu-btn">
            {mobileMenuOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 40, background: "#050505",
          paddingTop: 96, padding: "96px 32px 32px", display: "flex", flexDirection: "column", gap: 28
        }}>
          {[["work", "Portfolio"], ["pricing", "Pricing"], ["ai-consult", "AI Concierge"], ["ai-brand", "Brand Architect"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={e => handleNavClick(e, id)}
              style={{ fontSize: 28, fontWeight: 600, color: "#fff", textDecoration: "none" }}>{label}</a>
          ))}
          <button onClick={() => { setIsContactModalOpen(true); setMobileMenuOpen(false); }}
            style={{ fontSize: 28, fontWeight: 600, color: "#f59e0b", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            Start a Project →
          </button>
        </div>
      )}

      {/* HERO */}
      <section style={{ position: "relative", paddingTop: 180, paddingBottom: 120, textAlign: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 700, height: 700, background: "rgba(245,158,11,0.07)", borderRadius: "50%",
          filter: "blur(120px)", pointerEvents: "none"
        }} />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px",
            borderRadius: 100, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
            marginBottom: 36
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase" }}>Available for freelance</span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 800,
            color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 24
          }}>
            Crafting Digital<br />
            <span style={{
              background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>Masterpieces.</span>
          </h1>

          <p style={{ fontSize: 18, color: "#9ca3af", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            I build high-end websites with modern aesthetics and integrated AI capabilities — from ₹999.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={e => handleNavClick(e, "work")} style={{
              padding: "14px 32px", background: "#fff", color: "#000", border: "none",
              borderRadius: 100, fontWeight: 700, fontSize: 15, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e5e7eb"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "scale(1)"; }}
            >View Work <ChevronRight style={{ width: 16, height: 16 }} /></button>

            <button onClick={e => handleNavClick(e, "ai-consult")} style={{
              padding: "14px 32px", background: "rgba(255,255,255,0.05)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100,
              fontWeight: 600, fontSize: 15, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            ><Bot style={{ width: 16, height: 16 }} /> Try AI Design</button>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 80, flexWrap: "wrap" }}>
            {[["50+", "Projects Delivered"], ["4.9★", "Average Rating"], ["48hr", "Fastest Delivery"]].map(([val, label]) => (
              <div key={val} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{val}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="work" style={{ padding: "96px 0", maxWidth: 1200, margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Selected Work
          </h2>
          <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 500 }}>
            Handcrafted websites built with precision. Click any project to see details.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))", gap: 24 }}>
          {INITIAL_PROJECTS.map(p => (
            <div key={p.id} onClick={() => setSelectedProject(p)}
              style={{
                borderRadius: 20, overflow: "hidden", background: "#111",
                border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                transition: "border-color 0.3s, transform 0.3s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease", display: "block" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%",
                  width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <ExternalLink style={{ width: 14, height: 14, color: "#fff" }} />
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{p.category}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>{p.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.tech.map(t => (
                    <span key={t} style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20,
                      background: "rgba(255,255,255,0.05)", color: "#9ca3af",
                      border: "1px solid rgba(255,255,255,0.07)"
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "96px 0", maxWidth: 1200, margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#f59e0b" }}>
            <Zap style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Transparent Pricing</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Simple, flat rates.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
          {PRICING_PLANS.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? "rgba(245,158,11,0.06)" : "#0a0a0a",
              border: plan.highlight ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 24, padding: 32, position: "relative",
              transition: "transform 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  padding: "4px 16px", borderRadius: 20, textTransform: "uppercase", whiteSpace: "nowrap"
                }}>Most Popular</div>
              )}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ fontSize: 40, fontWeight: 800, color: plan.highlight ? "#f59e0b" : "#fff", letterSpacing: "-0.03em", marginBottom: 8 }}>{plan.price}</div>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{plan.desc}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: plan.highlight ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check style={{ width: 10, height: 10, color: plan.highlight ? "#f59e0b" : "#6b7280" }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsContactModalOpen(true)} style={{
                width: "100%", padding: "13px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
                transition: "all 0.2s",
                background: plan.highlight ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.06)",
                border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: plan.highlight ? "#000" : "#fff"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >{plan.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* AI CONCIERGE */}
      <section id="ai-consult" style={{ padding: "96px 0", maxWidth: 900, margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <div style={{
          background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28, padding: "clamp(32px, 5vw, 56px)", position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: 300, height: 300, background: "rgba(245,158,11,0.06)",
            borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none"
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#f59e0b" }}>
              <Zap style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Project Kickoff</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#fff", marginBottom: 28, letterSpacing: "-0.02em" }}>
              What are we building today?
            </h2>
            <form onSubmit={handleAiConsult} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input type="text" value={projectPrompt} onChange={e => setProjectPrompt(e.target.value)}
                placeholder="e.g. A dark-themed portfolio for a photographer..."
                style={{
                  flex: "1 1 280px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "16px 20px", color: "#fff", fontSize: 15, outline: "none"
                }} />
              <button type="submit" disabled={isAnalyzing || !projectPrompt.trim()} style={{
                padding: "16px 28px", background: isAnalyzing || !projectPrompt.trim() ? "#555" : "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none", borderRadius: 14, color: "#000", fontWeight: 700, fontSize: 15,
                cursor: isAnalyzing || !projectPrompt.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
              }}>
                {isAnalyzing ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Sparkles style={{ width: 18, height: 18 }} />}
                Generate Vibe
              </button>
            </form>

            {aiAnalysis && (
              <div style={{
                marginTop: 28, padding: "24px 28px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
                animation: "fadeSlideUp 0.4s ease"
              }}>
                <pre style={{ whiteSpace: "pre-wrap", color: "#d1d5db", fontSize: 14, lineHeight: 1.8, fontFamily: "inherit" }}>{aiAnalysis}</pre>
                <button onClick={() => setIsContactModalOpen(true)} style={{
                  marginTop: 20, background: "none", border: "none", color: "#f59e0b",
                  fontWeight: 600, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6
                }}>Let's build this <ArrowRight style={{ width: 14, height: 14 }} /></button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI BRAND ARCHITECT */}
      <section id="ai-brand" style={{ padding: "96px 0", maxWidth: 1200, margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="brand-grid">
          <style>{`@media(max-width:768px){ .brand-grid { grid-template-columns: 1fr !important; } }`}</style>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#f59e0b" }}>
              <Palette style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Brand Architect</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 20, letterSpacing: "-0.02em" }}>
              Visualize your brand instantly.
            </h2>
            <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              Describe your business and Claude will generate a complete brand identity — name, tagline, and a custom color palette applied live.
            </p>
            <form onSubmit={handleBrandGeneration} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="text" value={brandPrompt} onChange={e => setBrandPrompt(e.target.value)}
                placeholder="e.g. A sustainable coffee shop in Brooklyn..."
                style={{
                  background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "16px 20px", color: "#fff", fontSize: 15, outline: "none"
                }} />
              <button type="submit" disabled={isGeneratingBrand || !brandPrompt.trim()} style={{
                padding: "15px 28px", background: isGeneratingBrand || !brandPrompt.trim() ? "#333" : "#fff",
                border: "none", borderRadius: 14, color: "#000", fontWeight: 700, fontSize: 15,
                cursor: isGeneratingBrand || !brandPrompt.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
              }}>
                {isGeneratingBrand ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Wand2 style={{ width: 18, height: 18 }} />}
                Generate Brand ✨
              </button>
            </form>
          </div>

          <div style={{
            height: 420, borderRadius: 24, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)", background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
          }}>
            {!brandIdentity ? (
              <div style={{ textAlign: "center", color: "#374151" }}>
                <Palette style={{ width: 48, height: 48, opacity: 0.2, margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14 }}>Your live preview will appear here.</p>
              </div>
            ) : (
              <div style={{
                position: "absolute", inset: 0, padding: 36, display: "flex", flexDirection: "column", justifyContent: "center",
                background: brandIdentity.primaryColor, animation: "zoomIn 0.5s ease"
              }}>
                <h3 style={{ fontSize: 42, fontWeight: 800, color: brandIdentity.secondaryColor, marginBottom: 12, lineHeight: 1.1 }}>{brandIdentity.brandName}</h3>
                <p style={{ fontSize: 18, color: brandIdentity.secondaryColor, opacity: 0.85, marginBottom: 28 }}>{brandIdentity.tagline}</p>
                <button style={{ alignSelf: "flex-start", padding: "12px 28px", borderRadius: 100, fontWeight: 700, border: "none", cursor: "pointer", background: brandIdentity.accentColor, color: brandIdentity.primaryColor, transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >Get Started</button>

                <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 14 }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 10, lineHeight: 1.5 }}><strong style={{ color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>AI Rationale: </strong>{brandIdentity.rationale}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[brandIdentity.primaryColor, brandIdentity.secondaryColor, brandIdentity.accentColor].map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.4)", padding: "4px 10px", borderRadius: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.2)" }} />
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: "#d1d5db", textTransform: "uppercase" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{ padding: "96px 0", maxWidth: 1200, margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }} className="review-grid">
          <style>{`@media(max-width:768px){ .review-grid { grid-template-columns: 1fr !important; } }`}</style>

          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fff", marginBottom: 36, letterSpacing: "-0.02em" }}>Client Reviews</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {reviews.length === 0 && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24, color: "#6b7280", fontSize: 14 }}>
                  No reviews yet. Be the first!
                </div>
              )}
              {reviews.map(r => (
                <div key={r.id} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 20, padding: "24px 28px", position: "relative", overflow: "hidden",
                  animation: "fadeSlideUp 0.4s ease"
                }}>
                  <Quote style={{ position: "absolute", top: -8, right: -8, width: 80, height: 80, color: "rgba(245,158,11,0.06)", transform: "rotate(12deg)" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "linear-gradient(135deg, #374151, #1f2937)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, color: "#fff", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0
                    }}>{r.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{r.company || "Client"}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} style={{ width: 12, height: 12, fill: i < r.designRating ? "#f59e0b" : "transparent", color: i < r.designRating ? "#f59e0b" : "#374151" }} />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEW FORM */}
          <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 32, position: "sticky", top: 100 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Your Name *", "name"], ["Company (Optional)", "company"]].map(([ph, key]) => (
                  <input key={key} value={reviewForm[key]} onChange={e => setReviewForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={ph} required={key === "name"}
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none" }} />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>Rating *</span>
                <StarRatingInput rating={reviewForm.designRating} setRating={v => setReviewForm(f => ({ ...f, designRating: v }))} />
              </div>

              <div style={{ position: "relative" }}>
                <textarea value={reviewForm.text} onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Write your feedback... *" required
                  style={{ width: "100%", height: 120, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px 44px", color: "#fff", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={handleEnhanceReview} disabled={isEnhancing || !reviewForm.text.trim()}
                  style={{
                    position: "absolute", bottom: 10, right: 10,
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 8, padding: "5px 12px", color: "#f59e0b", fontSize: 11, fontWeight: 700,
                    cursor: isEnhancing || !reviewForm.text.trim() ? "not-allowed" : "pointer",
                    opacity: isEnhancing || !reviewForm.text.trim() ? 0.5 : 1,
                    display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s"
                  }}>
                  {isEnhancing ? <Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} /> : <Wand2 style={{ width: 10, height: 10 }} />}
                  AI Enhance
                </button>
              </div>

              <button type="submit" style={{
                padding: "14px", background: "#fff", color: "#000", border: "none",
                borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e5e7eb"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "scale(1)"; }}
              >Submit Feedback <Send style={{ width: 14, height: 14 }} /></button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "#050505", padding: "48px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #fde68a, #d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 14, height: 14, color: "#000" }} />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Studio<span style={{ color: "#f59e0b" }}>X</span></span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 12 }}>
              <div style={{ background: "#fff", padding: 8, borderRadius: 10 }}>
                <img src="/qr.png" alt="Scan to Pay" style={{ width: 112, height: 112, objectFit: "contain", display: "block" }}
                  onError={e => { e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=StudioX"; }} />
              </div>
            </div>
            <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
              <Zap style={{ width: 10, height: 10 }} /> Scan & Pay
            </span>
          </div>

          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.04)" }} />
          <p style={{ color: "#4b5563", fontSize: 13 }}>© {new Date().getFullYear()} StudioX Design. Powered by Claude AI.</p>
        </div>
      </footer>
    </div>
  );
}

