/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useCallback } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`;

const CSS = `
  ${FONT}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono&display=swap');

  :root {
    --bg: #f8fafc;
    --accent: #3b82f6;
    --accent-glow: rgba(59,130,246,0.1);
    --violet: #8b5cf6;
    --green: #10b981;
    --text: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --card-bg: #ffffff;
    --radius-lg: 24px;
    --radius: 16px;
    --font: 'Outfit', sans-serif;
  }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    background-image: 
      radial-gradient(at 0% 0%, hsla(210,100%,98%,1) 0, transparent 50%),
      radial-gradient(at 100% 0%, hsla(230,100%,97%,1) 0, transparent 50%);
    min-height: 100vh;
  }

  .shell { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px; padding: 12px 24px;
    background: rgba(255,255,255,0.8); backdrop-filter: blur(12px);
    border: 1px solid var(--border); border-radius: 999px;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon { width: 32px; height: 32px; background: linear-gradient(135deg, var(--accent), var(--violet)); border-radius: 10px; display: grid; place-items: center; color: white; }
  .brand-name { font-weight: 800; font-size: 19px; }

  .main-nav { display: flex; gap: 8px; margin-bottom: 32px; padding: 6px; background: #f1f5f9; border-radius: 16px; width: fit-content; }
  .nav-btn { padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; color: var(--text-muted); transition: all 0.3s; background: transparent; display: flex; align-items: center; gap: 8px; }
  .nav-btn.active { background: white; color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

  .main { display: flex; flex-direction: column; gap: 32px; animation: fadeIn 0.5s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
  .stat-card { background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; gap: 8px; }
  .stat-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
  .stat-val { font-size: 32px; font-weight: 800; color: var(--accent); }
  .stat-bar { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  .stat-bar-fill { height: 100%; transition: width 1s; }

  .card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; height: 100%; display: flex; flex-direction: column; }
  .card-head { padding: 20px 24px; border-bottom: 1px solid var(--border); font-weight: 800; color: var(--text-muted); font-size: 12px; letter-spacing: 1px; }
  .card-body { padding: 24px; flex: 1; }

  .input-tabs { display: flex; gap: 4px; padding: 6px; background: #f1f5f9; border-radius: 12px; margin-bottom: 32px; width: fit-content; }
  .tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; color: var(--text-muted); transition: all 0.2s; background: transparent; }
  .tab.active { background: white; color: var(--accent); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

  .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; }
  .field { display: flex; flex-direction: column; gap: 8px; }
  .field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
  input, select { padding: 14px 18px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f1f5f9; font-family: inherit; font-size: 15px; font-weight: 600; outline: none; }
  input:focus { border-color: var(--accent); background: white; }

  .btn-analyze { margin-top: 32px; background: linear-gradient(135deg, var(--accent), var(--violet)); color: white; border: none; padding: 20px; border-radius: 16px; font-weight: 800; font-size: 15px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; }

  .rec-box { background: #f8fafc; border-radius: 20px; padding: 32px; border: 1px solid var(--border); }
  .rec-tag { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; margin-bottom: 16px; }

  /* Visualization Grid */
  .viz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 8px; }
  @media (max-width: 1000px) { .viz-grid { grid-template-columns: 1fr; } }
  .large-viz { grid-column: 1 / -1; min-height: 450px; }

  /* Chat Terminal */
  .strategist-view { display: flex; flex-direction: column; height: 75vh; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; }
  .chat-msgs { flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 24px; background: #fafafa; }
  .msg-bub { padding: 20px 24px; border-radius: 24px; font-size: 15px; font-weight: 500; line-height: 1.6; max-width: 80%; }
  .msg.bot .msg-bub { background: white; border: 1px solid var(--border); color: #334155; align-self: flex-start; border-bottom-left-radius: 4px; }
  .msg.user .msg-bub { background: var(--accent); color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 10px 15px -3px rgba(59,130,246,0.3); }
  .chat-inp-row { padding: 24px 32px; border-top: 1px solid var(--border); display: flex; gap: 16px; background: white; }
  .btn-send { width: 56px; height: 56px; border-radius: 16px; background: var(--accent); color: white; border: none; cursor: pointer; display: grid; place-items: center; }

  /* New Chart Mockups */
  .growth-bar-container { display: flex; align-items: flex-end; gap: 12px; height: 280px; width: 100%; border-bottom: 2px solid var(--border); padding-bottom: 8px; margin-top: 20px; position: relative; }
  .bar-col { flex: 1; border-radius: 8px 8px 0 0; min-width: 40px; position: relative; transition: height 1s cubic-bezier(0.4, 0, 0.2, 1); }
  .bar-col::after { content: attr(data-val); position: absolute; top: -28px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 800; color: var(--text-muted); opacity: 0; transition: opacity 0.3s; }
  .bar-col:hover::after { opacity: 1; }
  .pulse-canvas-wrap { height: 440px; width: 100%; position: relative; margin-top: 10px; }
  .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px; opacity: 0.6; }
`;

/* ΓöÇΓöÇΓöÇ helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
function analyze({ size, active_users, events, engagement }) {
  const ratio = size > 0 ? (active_users / size) * 100 : 0;
  const health = Math.min(100, Math.max(0, Math.round(engagement * 0.6 + ratio * 0.4)));
  if (size < 50) return { stage: "Early Stage", stageColor: "#f59e0b", cluster: "Emerging", confidence: 74, health, recommendation: "Host 3ΓÇô4 events/month to build momentum.", reason: "Small communities need frequent touchpoints." };
  if (events >= 3 && engagement > 60) return { stage: "Growing", stageColor: "#10d97b", cluster: "High Engagement", confidence: 87, health, recommendation: "Introduce mentorship tracks.", reason: "High-engagement needs conversion to advocates." };
  return { stage: "Stable", stageColor: "#00d4ff", cluster: "Balanced Core", confidence: 81, health, recommendation: "Increase events to 5/month.", reason: "Consistent activation nudges are needed." };
}

function buildPulseData(formData, result) {
  const { health } = result;
  const months = ["Now","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"];
  const actual = [], improved = [];
  for (let i = 0; i < 12; i++) {
    const noise = (Math.random() - 0.5) * 5;
    const base = Math.min(100, Math.max(10, health + (i * 1.5) + noise));
    actual.push(Math.round(base));
    improved.push(Math.round(Math.min(100, base + (i < 2 ? 0 : (i - 1) * 3))));
  }
  return { months, actual, improved };
}

function radarPoints(data, cx, cy, r) {
  const axes = [{ key: 'size_score', label: 'Size' }, { key: 'activity', label: 'Activity' }, { key: 'events_score', label: 'Events' }, { key: 'engagement', label: 'Engage' }, { key: 'health', label: 'Health' }, { key: 'confidence', label: 'Conf' }];
  return axes.map((ax, i) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const val = (data ? data[ax.key] : 0) / 100;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle), lx: cx + (r + 25) * Math.cos(angle), ly: cy + (r + 25) * Math.sin(angle), label: ax.label };
  });
}

/* ΓöÇΓöÇΓöÇ components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
function Ico({ n, size = 14 }) {
  const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (n === "pulse") return <svg {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
  if (n === "bot") return <svg {...s}><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  if (n === "star") return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if (n === "users") return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (n === "send") return <svg {...s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
  return null;
}

function PulseTimeline({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current, ctx = canvas.getContext('2d'), dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
    const { months, actual, improved } = data, n = months.length, padL = 50, padR = 24, padT = 32, padB = 56;
    const gW = W - padL - padR, gH = H - padT - padB;
    const xOf = i => padL + (i / (n - 1)) * gW, yOf = v => padT + (1 - v / 100) * gH;
    ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 0.5;
    [0, 25, 50, 75, 100].forEach(v => { ctx.beginPath(); ctx.moveTo(padL, yOf(v)); ctx.lineTo(W - padR, yOf(v)); ctx.stroke(); });
    const labelEvery = W / n > 55 ? 1 : 2;
    ctx.fillStyle = '#64748b'; ctx.font = '13px Outfit'; ctx.textAlign = 'center';
    months.forEach((m, i) => i % labelEvery === 0 && ctx.fillText(m, xOf(i), H - 18));
    ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); improved.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v))); ctx.stroke(); ctx.restore();
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB); grad.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.beginPath(); actual.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v))); ctx.lineTo(xOf(n - 1), H - padB); ctx.lineTo(xOf(0), H - padB); ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath(); actual.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v))); ctx.stroke();
  }, [data]);
  return <div className="pulse-canvas-wrap"><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>;
}

function RadarChart({ vals }) {
  const cx = 150, cy = 150, r = 110;
  const pts = radarPoints(vals, cx, cy, r);
  const polyStr = pts.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <svg width="300" height="300" viewBox="0 0 300 300">
      {[0.25, 0.5, 0.75, 1].map(f => {
        const rings = pts.map((_, i) => {
          const a = (Math.PI * 2 * i) / pts.length - Math.PI / 2;
          return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`;
        }).join(' ');
        return <polygon key={f} points={rings} fill="none" stroke="#f1f5f9" strokeWidth="1" />;
      })}
      {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos((Math.PI * 2 * i) / pts.length - Math.PI / 2)} y2={cy + r * Math.sin((Math.PI * 2 * i) / pts.length - Math.PI / 2)} stroke="#f1f5f9" strokeWidth="1" />)}
      <polygon points={polyStr} fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
          <text x={p.lx} y={p.ly + 4} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

function GrowthBars({ stats }) {
  if (!stats) return <div className="empty-state">No data for breakdown</div>;
  const bars = [
    { label: "Viral Growth", val: Math.min(100, (stats.engagement * 0.9)), color: "var(--accent)" },
    { label: "Community DNA", val: stats.size_score, color: "var(--violet)" },
    { label: "Retention Cap", val: stats.health, color: "var(--green)" },
    { label: "Event Gravity", val: stats.events_score, color: "#f59e0b" },
  ];
  return (
    <div className="growth-bar-container">
      {bars.map((b, i) => (
        <div key={i} className="bar-col" data-val={`${Math.round(b.val)}%`} style={{ height: b.val + "%", background: b.color }} />
      ))}
      <div style={{ position: 'absolute', bottom: -24, width: '100%', display: 'flex', justifyContent: 'space-around', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
        {bars.map(b => <span key={b.label}>{b.label}</span>)}
      </div>
    </div>
  );
}

function App() {
  const [form, setForm] = useState({ members: "", active_members: "", events_per_month: "", community_age_months: "", engagement_rate: 15, location_type: "Urban", mode: "Hybrid", Social_Platforms: "WhatsApp", "Comm Label": "Tech Education" });
  const [result, setResult] = useState(null), [pulseData, setPulseData] = useState(null), [analyzing, setAnalyzing] = useState(false);
  const [view, setView] = useState("analytics"), [activeTab, setActiveTab] = useState("performance");
  const [messages, setMessages] = useState([{ role: "bot", text: "I'm your AI strategist. Let's analyze your growth vectors." }]);
  const [chatInput, setChatInput] = useState(""), [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleAnalyze = async () => {
    setAnalyzing(true);
    const payload = {
      size: +form.members,
      active_users: +form.active_members,
      events: +form.events_per_month,
      engagement: +form.engagement_rate,
      age: +form.community_age_months,
      location: form.location_type,
    };
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Analyze request failed");
      const data = await res.json();
      const resultData = data.result || data;
      setResult(resultData);
      setPulseData(buildPulseData(payload, resultData));
    } catch {
      const fallback = analyze(payload);
      setResult(fallback);
      setPulseData(buildPulseData(payload, fallback));
    }
    setAnalyzing(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput; setChatInput(""); setMessages(p => [...p, { role: "user", text: msg }]);
    setChatLoading(true);
    setTimeout(() => {
      setMessages(p => [...p, { role: "bot", text: "Based on your community health of " + (result?.health || 0) + "%, I suggest focusing on 'Event Gravity' to bridge the engagement gap." }]);
      setChatLoading(false);
    }, 1000);
  };

  const activeRatio = form.members > 0 && form.active_members > 0 ? Math.round((+form.active_members / +form.members) * 100) : null;
  const radarVals = result ? { size_score: Math.min(100, Math.round((+form.members / 500) * 100)), activity: activeRatio || 0, events_score: Math.min(100, (+form.events_per_month / 8) * 100), engagement: +form.engagement_rate, health: result.health, confidence: result.confidence } : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <header className="topbar">
          <div className="brand"><div className="brand-icon"><Ico n="star" /></div><div className="brand-name">CONNECTRUST PRO</div></div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>ΓùÅ AI ENGINE ACTIVE</div>
        </header>

        <nav className="main-nav">
          <button className={`nav-btn ${view === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}><Ico n="users" /> Metrics</button>
          <button className={`nav-btn ${view === 'modeling' ? 'active' : ''}`} onClick={() => setView('modeling')}><Ico n="pulse" /> Visual Insights</button>
          <button className={`nav-btn ${view === 'strategist' ? 'active' : ''}`} onClick={() => setView('strategist')}><Ico n="bot" /> AI Advisor</button>
        </nav>

        {view === 'analytics' && (
          <div className="main">
            <div className="stat-grid">
              {[{ l: "Size", v: form.members || "ΓÇö", c: "var(--accent)", b: Math.min(100, (+form.members / 500) * 100) }, { l: "Active", v: activeRatio ? activeRatio + "%" : "ΓÇö", c: "var(--green)", b: activeRatio || 0 }, { l: "Engagement", v: form.engagement_rate + "%", c: "var(--violet)", b: +form.engagement_rate }, { l: "Health", v: result ? result.health + "%" : "ΓÇö", c: result?.stageColor || "var(--text-muted)", b: result?.health || 0 }].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-label">{s.l}</div><div className="stat-val" style={{ color: s.c }}>{s.v}</div>
                  <div className="stat-bar"><div className="stat-bar-fill" style={{ width: s.b + "%", background: s.c }} /></div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-head">Γùê DATA CONFIGURATION</div>
              <div className="card-body">
                <div className="input-tabs">
                  <button className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance</button>
                  <button className={`tab ${activeTab === 'dna' ? 'active' : ''}`} onClick={() => setActiveTab('dna')}>DNA</button>
                </div>
                {activeTab === 'performance' ? (
                  <div className="input-grid">
                    <div className="field"><label>Total Members</label><input type="number" value={form.members} onChange={e => set("members", e.target.value)} /></div>
                    <div className="field"><label>Active Users</label><input type="number" value={form.active_members} onChange={e => set("active_members", e.target.value)} /></div>
                    <div className="field"><label>Events / Mo</label><input type="number" value={form.events_per_month} onChange={e => set("events_per_month", e.target.value)} /></div>
                    <div className="field"><label>Engage</label><input type="range" value={form.engagement_rate} onChange={e => set("engagement_rate", +e.target.value)} /></div>
                  </div>
                ) : (
                  <div className="input-grid">
                    <div className="field"><label>Age</label><input type="number" value={form.community_age_months} onChange={e => set("community_age_months", e.target.value)} /></div>
                    <div className="field"><label>Location</label><select value={form.location_type} onChange={e => set("location_type", e.target.value)}><option>Urban</option><option>Rural</option></select></div>
                    <div className="field"><label>Platform</label><select value={form.Social_Platforms} onChange={e => set("Social_Platforms", e.target.value)}><option>WhatsApp</option><option>Discord</option></select></div>
                  </div>
                )}
                <button className="btn-analyze" onClick={handleAnalyze} style={{ width: '100%' }}>{analyzing ? "SIMULATING..." : "GENERATE GROWTH MODEL"}</button>
              </div>
            </div>
            {result && (
              <div className="card">
                <div className="card-head">Γùê STRATEGY SUMMARY</div>
                <div className="card-body"><div className="rec-box"><div className="rec-tag" style={{ background: result.stageColor + '20', color: result.stageColor }}>{result.stage}</div><div style={{ fontWeight: 800, fontSize: 20, marginBottom: 12 }}>{result.recommendation}</div><p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.reason}</p></div></div>
              </div>
            )}
          </div>
        )}

        {view === 'modeling' && (
          <div className="viz-grid">
            <div className="card large-viz"><div className="card-head">Γùê 12-MONTH TRAJECTORY SIMULATION (PREDICTIVE)</div><div className="card-body">{pulseData ? <PulseTimeline data={pulseData} /> : <div className="empty-state">Run analysis to see simulation</div>}</div></div>
            <div className="card" style={{ height: 420 }}><div className="card-head">Γùê GROWTH SENSITIVITY FACTORS</div><div className="card-body"><GrowthBars stats={radarVals} /></div></div>
            <div className="card" style={{ height: 420 }}><div className="card-head">Γùê MULTI-DIMENSIONAL COMMUNITY RADAR</div><div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{radarVals ? <RadarChart vals={radarVals} /> : <div className="empty-state">Radar offline</div>}</div></div>
          </div>
        )}

        {view === 'strategist' && (
          <div className="strategist-view">
            <div className="chat-msgs">{messages.map((m, i) => <div key={i} className={`msg ${m.role}`}><div className="msg-bub">{m.text}</div></div>)}{chatLoading && <div className="msg bot"><div className="msg-bub">...</div></div>}<div ref={chatEndRef} /></div>
            <div className="chat-inp-row"><input className="chat-inp" style={{ flex: 1, border: 'none', background: '#f1f5f9', padding: '0 24px', borderRadius: 16, fontSize: 16, fontWeight: 500 }} placeholder="Ask your strategist..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} /><button className="btn-send" onClick={handleChat}><Ico n="send" size={20} /></button></div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
