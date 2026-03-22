/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";

// ─── Dropdown Options ──────────────────────────────────────────
const OPTS = {
  location_type: ["Urban", "Semi-Urban", "Rural"],
  domain: ["Academic", "Cultural", "NGO", "Professional Network", "Startup", "Student Club", "Health & Wellness", "Arts & Creative", "Sports & Fitness", "Technology"],
  mode: ["Hybrid", "Online", "Offline"],
  target_demographic: ["Youth", "Students", "Professionals", "Mixed", "Senior", "Women", "Parents"],
  motive_category: ["Networking", "Skill Building", "Awareness", "Advocacy", "Fundraising", "Social Support", "Entertainment", "Learning", "Career Growth"],
  has_formal_leadership: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }],
  Social_Platforms: ["WhatsApp Groups", "Facebook Groups", "Instagram", "LinkedIn Ads", "Twitter/X Threads", "Discord Partnering", "Telegram Shouts", "Email Newsletter", "YouTube", "SMS Campaign", "SEO/Blog", "Cold Outreach", "Reddit Communities", "TikTok", "Podcast Channels", "Others"],
  Physical_Platforms: ["Local Meetups", "Campus Ambassadors", "Offline Banners", "Pamphlets", "Billboards", "Word of Mouth", "Flyers & Posters", "Community Boards", "Physical Events", "Pop-up Stalls", "Radio/TV Ads", "Others"],
};

const COMM_TYPES = ["Tech", "Sustainable", "Empowerment", "Connection", "Growth", "Cultural", "Health", "Creative", "Sports", "Academic", "Social Impact", "Professional"];

const COMM_LABELS_BY_TYPE = {
  Tech: ["AI Ethics", "Data Science", "Dev Hub", "Cyber Security", "Open Source", "No-Code Hub", "Quantum Computing", "Robotics Club", "VR/AR Creators", "Green Tech", "Crypto Trading", "E-commerce"],
  Sustainable: ["Composting", "Zero Waste", "Reforestation", "Solar Share", "Plastic Waste", "E-Waste", "Urban Garden", "Food Rescue", "Cloth Swap", "Water Save", "Paper Recycle", "Bike Commute", "Vegan Living", "Green Cloud"],
  Empowerment: ["Girls in STEM", "Women in Law", "Minority Founders", "Rural Literacy", "Disability Tech", "Refugee Aid", "Prison Reform", "Youth Politics", "Senior Digital"],
  Connection: ["Book Club", "Board Game Fan", "Pet Owners", "Solo Travelers", "Urban Sketchers", "Language Xchange", "Amateur Radio", "New Dads"],
  Growth: ["Startup SaaS", "Freelance Lab", "Real Estate", "Content Creator", "Podcasting", "Dev Connect", "Upcycling", "Bio-Hacking"],
  Cultural: ["Language Xchange", "Urban Sketchers", "Amateur Radio", "Book Club", "Board Game Fan", "Film & Cinema", "Photography Club", "Dance & Music"],
  Health: ["Anxiety Support", "Fitness Challenge", "Mental Wellness", "Yoga & Mindfulness", "Nutrition Hub", "Running Club", "Chronic Illness Support", "Sleep Well"],
  Creative: ["Content Creator", "Podcasting", "VR/AR Creators", "Photography Club", "Urban Sketchers", "Design Thinkers", "Film Club", "Maker Space"],
  Sports: ["Running Club", "Cycling Hub", "Basketball League", "Football Fans", "Cricket Club", "Chess Masters", "Swimming Club", "Gym Buddies"],
  Academic: ["Research Hub", "Debate Club", "Science Fair", "Engineering Club", "Math Olympiad", "Philosophy Circle", "History Buffs", "Language Lab"],
  "Social Impact": ["Refugee Aid", "Prison Reform", "Rural Literacy", "Disability Tech", "Youth Politics", "Voter Awareness", "Community Kitchen", "Blood Donation"],
  Professional: ["Dev Connect", "Startup SaaS", "Freelance Lab", "Real Estate", "HR Network", "Finance Circle", "Legal Eagles", "Marketing Pros"],
};

const REAL_LIFE_SOLUTIONS = {
  Tech: [
    { title: "Host a Hackathon Weekend", desc: "A 48-hour hackathon focusing on a real community problem. Even small events see 3x member re-engagement.", icon: "🏆" },
    { title: "Launch a 'Build in Public' Series", desc: "Members share weekly progress on personal projects. Drives consistency and peer accountability.", icon: "🚀" },
    { title: "Mentorship Pairing Programme", desc: "Match seniors with juniors for 30-day sprints. Proven to increase retention by 40%.", icon: "🤝" },
  ],
  Sustainable: [
    { title: "Monthly Neighbourhood Clean-Up", desc: "Visible offline action builds trust and local press coverage.", icon: "🌱" },
    { title: "Zero-Waste Challenge", desc: "A 30-day shared challenge tracked publicly online drives daily engagement.", icon: "♻️" },
    { title: "Partner with Local Businesses", desc: "Eco-friendly brand tie-ins provide resources while expanding your audience.", icon: "🤝" },
  ],
  Empowerment: [
    { title: "Speaker Series: Real Stories", desc: "Monthly live talks by members who overcame challenges. Builds emotional community glue.", icon: "🎤" },
    { title: "Skill Certification Bootcamp", desc: "A structured 4-week programme with certificates. Increases perceived value and commitment.", icon: "🎓" },
    { title: "Peer Mentoring Circles", desc: "Small groups of 5 meet bi-weekly for accountability and support.", icon: "💬" },
  ],
  Connection: [
    { title: "Monthly In-Person Mixer", desc: "Simple low-cost meetups consistently outperform online events for turning followers into friends.", icon: "🎉" },
    { title: "'Coffee Roulette' Pairing", desc: "Randomly pair members for a virtual coffee each week. Scalable and high-impact.", icon: "☕" },
    { title: "Community Challenge (Monthly Theme)", desc: "Give members a shared theme to create around—books, art, recipes. Viral-friendly.", icon: "🌟" },
  ],
  Growth: [
    { title: "Referral Reward System", desc: "Each member who brings in 3 new people gets a badge or perk. A classic that works.", icon: "📈" },
    { title: "Collaborative Launch Day", desc: "Members help each other launch projects simultaneously, creating mutual amplification.", icon: "🚀" },
    { title: "Newsletter Swap with a Peer Community", desc: "Cross-promote with a similar community to grow your audience instantly.", icon: "📧" },
  ],
  default: [
    { title: "Run a Member Spotlight Series", desc: "Feature one member per week. Boosts belonging and gives long-time members visibility.", icon: "⭐" },
    { title: "Set a Public 90-Day Goal", desc: "Rally your community around a single measurable goal. Creates urgency and focus.", icon: "🎯" },
    { title: "Host a 'State of the Community' Call", desc: "Transparent communication about growth, struggles and plans builds deep loyalty.", icon: "📢" },
  ],
};

const VOLUNTEER_STRATEGIES = {
  Tech: {
    how: "Focus on skill acquisition and portfolio building. Developers want to solve 'real' problems they can showcase on GitHub.",
    where: ["GitHub Discussions", "Dev.to Communities", "University CS Labs", "Discord Tech Hubs", "StackOverflow Local Chapters"],
    target: "Computing students, junior devs seeking experience, and senior devs looking for social impact projects."
  },
  Sustainable: {
    how: "Focus on direct local impact and tangible results. People are motivated by seeing their neighbourhood change or a forest grow.",
    where: ["Local Farmer Markets", "University Eco-Clubs", "Instagram Environmentalists", "Nextdoor Neighborhood groups", "Vegan Meetups"],
    target: "Climate-conscious youth, local residents, biology students, and zero-waste advocates."
  },
  Empowerment: {
    how: "Focus on empathy, story-telling, and long-term mentorship. Emphasise the 'ripple effect' of their help.",
    where: ["Community Centers", "NGO Networks", "LinkedIn Social-Impact groups", "Local Libraries", "Psychology Student Associations"],
    target: "Social work students, retired professionals, advocates for social justice, and empathetic listeners."
  },
  Connection: {
    how: "Focus on the joy of sharing a hobby and making new friends. Keep the barrier to entry low and fun.",
    where: ["Meetup.com", "Reddit Hobby-Subs", "Facebook Interest Groups", "Local Cafes", "Co-working spaces"],
    target: "Expats, young professionals, hobbyists, and those seeking sense of belonging."
  },
  default: {
    how: "Focus on clear tasks, regular appreciation, and a sense of shared mission.",
    where: ["General Volunteer Portals", "Social Media Campaigns", "Local Community Boards", "Word of Mouth"],
    target: "Passionate individuals looking for meaningful ways to spend their free time."
  }
};

const CONSULTANTS = [
  { name: "Sarah Jenkins", role: "Scalability Expert", rating: 4.9, bio: "Helped grow 50+ startup communities from 0 to 10k members.", img: "👩‍💼" },
  { name: "Marcus Chen", role: "Retention Specialist", rating: 4.8, bio: "Obsessed with churn rates. Expert in building community 'stickiness'.", img: "👨‍💻" },
  { name: "Dr. Elena Rossi", role: "Community Psychologist", rating: 5.0, bio: "Expert in deep engagement and emotional safety in digital spaces.", img: "👩‍🔬" },
  { name: "David Kim", role: "Offline Events Guru", rating: 4.7, bio: "Specialist in hybrid communities and large-scale physical events.", img: "👨‍🏫" }
];

// ─── Styling ──────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f0f4ff;
    --accent: #4f46e5;
    --accent2: #7c3aed;
    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
    --text: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --card: #ffffff;
    --font: 'Outfit', sans-serif;
    --r: 18px;
    --r-sm: 12px;
  }
  body { font-family: var(--font); background: var(--bg); color: var(--text); min-height: 100vh; }

  /* ── Modal Overlay ─────────────────────────────── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(6px);
    z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .modal-box {
    background: white; border-radius: 24px; width: 100%; max-width: 720px;
    max-height: 90vh; overflow-y: auto; padding: 40px;
    box-shadow: 0 25px 60px rgba(79,70,229,0.25);
  }
  .modal-header { margin-bottom: 32px; }
  .modal-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ede9fe, #e0e7ff); color: var(--accent); font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 999px; margin-bottom: 16px; letter-spacing: 0.5px; }
  .modal-title { font-size: 26px; font-weight: 800; line-height: 1.2; }
  .modal-subtitle { margin-top: 8px; color: var(--text-muted); font-size: 14px; font-weight: 500; }
  .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 600px) { .modal-grid { grid-template-columns: 1fr; } }
  .field { display: flex; flex-direction: column; gap: 7px; }
  .field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .field input, .field select {
    padding: 12px 16px; border-radius: 12px; border: 2px solid #f1f5f9;
    background: #f8fafc; font-family: var(--font); font-size: 15px; font-weight: 600;
    outline: none; transition: all 0.2s; color: var(--text);
  }
  .field input:focus, .field select:focus { border-color: var(--accent); background: white; box-shadow: 0 0 0 4px rgba(79,70,229,0.08); }
  .field-full { grid-column: 1 / -1; }
  .range-wrap { display: flex; align-items: center; gap: 12px; }
  .range-wrap input[type=range] { flex: 1; accent-color: var(--accent); }
  .range-val { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 999px; min-width: 50px; text-align: center; }
  .modal-section-title { grid-column: 1 / -1; font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #ede9fe; padding-bottom: 8px; margin-top: 8px; }
  .btn-primary {
    margin-top: 32px; background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white; border: none; padding: 18px; border-radius: 14px; font-weight: 800;
    font-size: 16px; cursor: pointer; width: 100%; letter-spacing: 0.5px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(79,70,229,0.35); }
  .btn-primary:disabled { opacity: 0.7; transform: none; }

  /* ── Shell ──────────────────────────────────────── */
  .shell { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; padding: 14px 24px;
    background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
    border: 1px solid var(--border); border-radius: 999px;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 10px; display: grid; place-items: center; color: white; font-size: 16px; }
  .brand-name { font-weight: 800; font-size: 18px; }
  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .live-dot { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--green); }
  .live-dot::before { content: ''; width: 7px; height: 7px; background: var(--green); border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
  .btn-reconfigure { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.2s; }
  .btn-reconfigure:hover { background: #e0e7ff; color: var(--accent); }

  /* ── Tab Switcher ──────────────────────────────── */
  .main-tabs { display: flex; gap: 8px; margin-bottom: 28px; padding: 6px; background: #e2e8f0; border-radius: 16px; width: fit-content; }
  .tab-btn { padding: 10px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; border: none; cursor: pointer; color: var(--text-muted); transition: all 0.3s; background: transparent; display: flex; align-items: center; gap: 8px; }
  .tab-btn.active { background: white; color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

  /* ── Stage Hero ──────────────────────────────────── */
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; } }
  .hero-card { background: white; border: 1px solid var(--border); border-radius: var(--r); padding: 28px; }
  .hero-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  
  /* Status */
  .status-badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 999px; font-weight: 800; font-size: 17px; margin-bottom: 12px; }
  .status-desc { font-size: 13px; color: var(--text-muted); font-weight: 500; line-height: 1.5; }

  /* Gauge */
  .gauge-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .gauge-score { font-size: 42px; font-weight: 800; }
  .gauge-label { font-size: 12px; font-weight: 700; color: var(--text-muted); }

  /* Reality Check */
  .reality-card { background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%); border: 1px solid #c7d2fe; border-radius: var(--r); padding: 28px; margin-bottom: 28px; }
  .reality-eyebrow { font-size: 10px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .reality-text { font-size: 18px; font-weight: 700; line-height: 1.5; color: var(--text); }
  .reality-comparison { margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap; }
  .compare-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.7); border: 1px solid rgba(79,70,229,0.2); border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 700; }

  /* Advice Grid */
  .advice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  @media (max-width: 700px) { .advice-grid { grid-template-columns: 1fr; } }
  .advice-card { background: white; border: 1px solid var(--border); border-radius: var(--r); padding: 28px; }
  .advice-eye { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
  .focus-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 999px; font-size: 15px; font-weight: 800; margin-bottom: 12px; }
  .advice-text { font-size: 15px; font-weight: 600; line-height: 1.6; color: var(--text); }
  .advice-reason { margin-top: 10px; font-size: 13px; color: var(--text-muted); line-height: 1.5; }

  /* Solutions */
  .solutions-section { margin-bottom: 28px; }
  .section-title { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .solutions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (max-width: 800px) { .solutions-grid { grid-template-columns: 1fr; } }
  .solution-card { background: white; border: 1px solid var(--border); border-radius: var(--r); padding: 24px; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .solution-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
  .sol-icon { font-size: 32px; margin-bottom: 14px; }
  .sol-title { font-size: 16px; font-weight: 800; margin-bottom: 8px; }
  .sol-desc { font-size: 13px; font-weight: 500; color: var(--text-muted); line-height: 1.6; }
  .sol-accent { position: absolute; top: 0; right: 0; width: 80px; height: 80px; background: linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04)); border-radius: 0 18px 0 80px; }

  /* Volunteer Content */
  .volunteer-info { display: flex; flex-direction: column; gap: 24px; }
  .vol-how-card { background: white; border: 1px solid var(--border); border-radius: var(--r); padding: 28px; }
  .vol-where-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }
  .vol-chip { background: #f1f5f9; padding: 12px 18px; border-radius: 12px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; color: var(--accent); }
  .ecosphere-promo { 
    background: linear-gradient(135deg, #10b981, #3b82f6); color: white; border-radius: var(--r); padding: 40px; 
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 32px; 
    box-shadow: 0 20px 40px rgba(16,185,129,0.25);
  }
  .btn-eco { background: white; color: #10b981; border: none; padding: 16px 32px; border-radius: 999px; font-weight: 800; font-size: 16px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
  .btn-eco:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

  /* Consultant Content */
  .consultant-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
  .con-card { background: white; border: 1px solid var(--border); border-radius: var(--r); padding: 24px; text-align: center; }
  .con-img { font-size: 48px; margin-bottom: 16px; }
  .con-name { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
  .con-role { font-size: 12px; font-weight: 800; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
  .con-bio { font-size: 14px; font-weight: 500; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px; }
  .btn-con { background: #f1f5f9; border: none; padding: 12px 24px; border-radius: 999px; font-weight: 800; font-size: 13px; cursor: pointer; width: 100%; transition: all 0.2s; }
  .btn-con:hover { background: var(--accent); color: white; }

  /* Stat Strip */
  .stat-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  @media (max-width: 700px) { .stat-strip { grid-template-columns: 1fr 1fr; } }
  .stat-pill { background: white; border: 1px solid var(--border); border-radius: var(--r-sm); padding: 18px 20px; }
  .stat-pill-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .stat-pill-val { font-size: 24px; font-weight: 800; }
  .stat-pill-bar { height: 4px; background: #f1f5f9; border-radius: 4px; margin-top: 8px; overflow: hidden; }
  .stat-pill-bar-fill { height: 100%; border-radius: 4px; transition: width 1s; }

  /* Loading & Empty */
  .loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; gap: 16px; color: var(--text-muted); font-weight: 600; }
  .spinner { width: 40px; height: 40px; border: 3px solid #e0e7ff; border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg);} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .dashboard { animation: fadeUp 0.5s ease-out; }
`;

// ─── Helpers ───────────────────────────────────────────────────
function stageInfo(stage) {
  const map = {
    Stagnant: { color: "#ef4444", bg: "#fef2f2", emoji: "🔴", desc: "Community is losing momentum. Immediate action needed to re-engage members." },
    Early: { color: "#f59e0b", bg: "#fffbeb", emoji: "🟡", desc: "Early days — focus on building your core group and hosting consistent events." },
    Stable: { color: "#3b82f6", bg: "#eff6ff", emoji: "🔵", desc: "Holding steady with a reliable base. Growth opportunities are ready to unlock." },
    Growing: { color: "#10b981", bg: "#ecfdf5", emoji: "🟢", desc: "Strong momentum. Focus on scaling and converting members into advocates." },
  };
  return map[stage] || map.Stable;
}

function getSolutions(commType) {
  return REAL_LIFE_SOLUTIONS[commType] || REAL_LIFE_SOLUTIONS.default;
}

function getVolunteerStrategy(commType) {
  return VOLUNTEER_STRATEGIES[commType] || VOLUNTEER_STRATEGIES.default;
}

// ─── Icons ───────────────────────────────────────────────────
function Ico({ n, size = 18 }) {
  const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (n === "trend") return <svg {...s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
  if (n === "user-plus") return <svg {...s}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>;
  if (n === "briefcase") return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
  return null;
}

// ─── SVG Gauge ────────────────────────────────────────────────
function CircleGauge({ value, color }) {
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="gauge-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="28" fontWeight="800" fill={color} fontFamily="Outfit, sans-serif">{value}</text>
      </svg>
      <div className="gauge-label">HEALTH SCORE / 100</div>
    </div>
  );
}

// ─── Input Modal ───────────────────────────────────────────────
const DEFAULT_FORM = {
  members: "", active_members: "", events_per_month: "", community_age_months: "",
  engagement_rate: 40, growth_target: 20, location_type: "Urban",
  domain: "Technology", mode: "Hybrid", target_demographic: "Youth",
  motive_category: "Networking", has_formal_leadership: 1,
  Social_Platforms: "WhatsApp Groups", Physical_Platforms: "Local Meetups",
  "Comm Type": "Tech", "Comm Label": "Dev Hub",
};

function InputModal({ onSubmit }) {
  const [f, setF] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const commLabels = COMM_LABELS_BY_TYPE[f["Comm Type"]] || COMM_LABELS_BY_TYPE["Tech"];
  useEffect(() => {
    const labels = COMM_LABELS_BY_TYPE[f["Comm Type"]] || [];
    if (!labels.includes(f["Comm Label"])) {
      setF(p => ({ ...p, "Comm Label": labels[0] || "" }));
    }
  }, [f["Comm Type"]]);

  const handleSubmit = async () => {
    if (!f.members || !f.active_members || !f.events_per_month || !f.community_age_months) {
      alert("Please fill in all required numeric fields.");
      return;
    }
    setSubmitting(true);
    await onSubmit(f);
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-badge">✦ CONNECTRUST PRO</div>
          <div className="modal-title">Tell us about your community</div>
          <div className="modal-subtitle">Fill in these details to get your personalised growth report.</div>
        </div>
        <div className="modal-grid">
          <div className="modal-section-title">📊 Core Metrics</div>
          <div className="field"><label>Total Members *</label><input type="number" value={f.members} onChange={e => set("members", e.target.value)} /></div>
          <div className="field"><label>Active Members *</label><input type="number" value={f.active_members} onChange={e => set("active_members", e.target.value)} /></div>
          <div className="field"><label>Events / Mo *</label><input type="number" value={f.events_per_month} onChange={e => set("events_per_month", e.target.value)} /></div>
          <div className="field"><label>Age (mos) *</label><input type="number" value={f.community_age_months} onChange={e => set("community_age_months", e.target.value)} /></div>
          <div className="field-full"><label>Engagement Rate: {f.engagement_rate}%</label><div className="range-wrap"><input type="range" min="0" max="100" value={f.engagement_rate} onChange={e => set("engagement_rate", +e.target.value)} /><span className="range-val">{f.engagement_rate}%</span></div></div>

          <div className="modal-section-title">🏙️ Community Profile</div>
          <div className="field"><label>Location</label><select value={f.location_type} onChange={e => set("location_type", e.target.value)}>{OPTS.location_type.map(o => <option key={o}>{o}</option>)}</select></div>
          <div className="field"><label>Domain</label><select value={f.domain} onChange={e => set("domain", e.target.value)}>{OPTS.domain.map(o => <option key={o}>{o}</option>)}</select></div>

          <div className="modal-section-title">🏷️ Type & Label</div>
          <div className="field"><label>Comm Type</label><select value={f["Comm Type"]} onChange={e => set("Comm Type", e.target.value)}>{COMM_TYPES.map(o => <option key={o}>{o}</option>)}</select></div>
          <div className="field"><label>Comm Label</label><select value={f["Comm Label"]} onChange={e => set("Comm Label", e.target.value)}>{commLabels.map(o => <option key={o}>{o}</option>)}</select></div>
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Analysing..." : "Generate Analysis →"}</button>
      </div>
    </div>
  );
}

// ─── Dashboard Content ─────────────────────────────────────────
function GrowthDashboard({ result, form }) {
  const si = stageInfo(result.stage);
  const solutions = getSolutions(form["Comm Type"]);
  const activeRatio = form.members > 0 ? Math.round((+form.active_members / +form.members) * 100) : 0;
  const focusColor = result.primaryFocus === "Retention" ? "#ef4444" : result.primaryFocus === "Consistency" ? "#f59e0b" : "#10b981";

  const benchmark = result.health > 65 ? `${result.health - 10}%–${result.health - 2}%` : `${result.health + 2}%–${result.health + 15}%`;
  const comparison = result.health > 65 ? "above average" : "below average";

  return (
    <div className="dashboard">
      <div className="stat-strip">
        {[{ l: "Members", v: (+form.members).toLocaleString(), c: "#4f46e5" }, { l: "Active", v: activeRatio + "%", c: "#10b981" }, { l: "Events/mo", v: form.events_per_month, c: "#7c3aed" }, { l: "Engage", v: form.engagement_rate + "%", c: "#f59e0b" }].map((s, i) => (
          <div className="stat-pill" key={i}>
            <div className="stat-pill-lbl">{s.l}</div><div className="stat-pill-val" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="hero-grid">
        <div className="hero-card"><div className="hero-label">Status</div><div className="status-badge" style={{ background: si.bg, color: si.color }}>{si.emoji} {result.stage}</div><div className="status-desc">{si.desc}</div></div>
        <div className="hero-card" style={{ display: "flex", justifyContent: "center" }}><CircleGauge value={result.health} color={si.color} /></div>
        <div className="hero-card"><div className="hero-label">Cluster Match</div><div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)" }}>{result.cluster}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>{result.confidence}% Match Confidence</div></div>
      </div>
      <div className="reality-card"><div className="reality-eyebrow">⚡ Reality Check</div><div className="reality-text">You are in <strong>'{result.stage}'</strong>. Your score of <strong>{result.health}</strong> is {comparison} for <strong>{form["Comm Type"]}</strong> groups (benchmark: {benchmark}).</div></div>
      <div className="advice-grid">
        <div className="advice-card"><div className="advice-eye" style={{ color: focusColor }}>🎯 Primary Focus</div><div className="focus-badge" style={{ background: focusColor + "18", color: focusColor }}>● {result.primaryFocus}</div><p className="advice-reason">Priority based on your current engagement levels.</p></div>
        <div className="advice-card"><div className="advice-eye" style={{ color: "var(--accent)" }}>💡 Advice</div><div className="advice-text">{result.recommendation}</div><p className="advice-reason">{result.reason}</p></div>
      </div>
      <div className="solutions-section"><div className="section-title">🛠️ Solutions</div><div className="solutions-grid">{solutions.map((s, i) => (<div className="solution-card" key={i}><div className="sol-accent" /><div className="sol-icon">{s.icon}</div><div className="sol-title">{s.title}</div><div className="sol-desc">{s.desc}</div></div>))}</div></div>
    </div>
  );
}

// ─── Volunteer Connect ─────────────────────────────────────────
function VolunteerConnect({ form }) {
  const strategy = getVolunteerStrategy(form["Comm Type"]);
  return (
    <div className="volunteer-info dashboard">
      <div className="vol-how-card">
        <div className="hero-label">Approach Analysis</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{strategy.how}</div>
        <div className="hero-label">Where to engage volunteers</div>
        <div className="vol-where-grid">
          {strategy.where.map(w => <div key={w} className="vol-chip">🌐 {w}</div>)}
        </div>
        <div className="hero-label" style={{ marginTop: 24 }}>Target Personas</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-muted)" }}>{strategy.target}</div>
      </div>
      <div className="ecosphere-promo">
        <div style={{ fontSize: 32, fontWeight: 800 }}>Need actual volunteers?</div>
        <p style={{ fontSize: 18, opacity: 0.9 }}>EcoSphere connects passionate change-makers with communities like yours.</p>
        <button className="btn-eco" onClick={() => window.open("#ecosphere-link-mock", "_blank")}>Go to EcoSphere →</button>
      </div>
    </div>
  );
}

// ─── Consultant Finder ─────────────────────────────────────────
function ConsultantFinder() {
  return (
    <div className="consultant-grid dashboard">
      {CONSULTANTS.map(c => (
        <div className="con-card" key={c.name}>
          <div className="con-img">{c.img}</div>
          <div className="con-name">{c.name}</div>
          <div className="con-role">{c.role}</div>
          <div style={{ color: "var(--amber)", fontSize: 14, fontWeight: 800, marginBottom: 8 }}>⭐ {c.rating}</div>
          <div className="con-bio">{c.bio}</div>
          <button className="btn-con">Message & Book Call</button>
        </div>
      ))}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────
const STORAGE_KEY = "ct_community_form";
const RESULT_KEY = "ct_community_result";

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("growth");
  const [form, setForm] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const savedForm = localStorage.getItem(STORAGE_KEY), savedResult = localStorage.getItem(RESULT_KEY);
    if (savedForm && savedResult) { setForm(JSON.parse(savedForm)); setResult(JSON.parse(savedResult)); } else { setShowModal(true); }
  }, []);

  const handleSubmit = async (f) => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, has_formal_leadership: +f.has_formal_leadership }) });
      const data = await res.json();
      const r = data.result || data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(f)); localStorage.setItem(RESULT_KEY, JSON.stringify(r));
      setForm(f); setResult(r);
    } catch {
      // Very simple fallback
      const r = { stage: "Stable", cluster: "Balanced Core", confidence: 80, health: 68, primaryFocus: "Scaling", recommendation: "Launch referral drive", reason: "Growth potential detected" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(f)); localStorage.setItem(RESULT_KEY, JSON.stringify(r));
      setForm(f); setResult(r);
    }
    setAnalyzing(false); setShowModal(false);
  };

  return (
    <>
      <style>{CSS}</style>
      {showModal && <InputModal onSubmit={handleSubmit} />}
      <div className="shell">
        <header className="topbar">
          <div className="brand"><div className="brand-icon">✦</div><div className="brand-name">CONNECTRUST PRO</div></div>
          <div className="topbar-right"><div className="live-dot">AI ENGINE ACTIVE</div>{result && <button className="btn-reconfigure" onClick={() => setShowModal(true)}>⚙</button>}</div>
        </header>

        {result && form && (
          <nav className="main-tabs">
            <button className={`tab-btn ${activeTab === 'growth' ? 'active' : ''}`} onClick={() => setActiveTab('growth')}><Ico n="trend" /> Growth Analysis</button>
            <button className={`tab-btn ${activeTab === 'volunteer' ? 'active' : ''}`} onClick={() => setActiveTab('volunteer')}><Ico n="user-plus" /> Volunteer Connect</button>
            <button className={`tab-btn ${activeTab === 'consultant' ? 'active' : ''}`} onClick={() => setActiveTab('consultant')}><Ico n="briefcase" /> Hire Consultant</button>
          </nav>
        )}

        {analyzing ? <div className="loading-overlay"><div className="spinner" /><span>Running Model...</span></div> : result && form && (
          <>
            {activeTab === 'growth' && <GrowthDashboard result={result} form={form} />}
            {activeTab === 'volunteer' && <VolunteerConnect form={form} />}
            {activeTab === 'consultant' && <ConsultantFinder />}
          </>
        )}
      </div>
    </>
  );
}
