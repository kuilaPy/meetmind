import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, CheckCircle2, CircleHelp, Clock3, FileText, ListTodo, MessageSquareText, Plus, Sparkles, Users, X } from "lucide-react";
import type { Analysis, Meeting } from "./types";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const sample = `Meeting: Q4 Sales Planning
Date: 2026-10-26
Maya: We need to improve Q4 pipeline visibility.
Rahul: I will prepare the Q4 sales report by Friday, October 30.
Maya: Agreed. Let's use the new regional dashboard for the weekly review.
Chen: I can share the dashboard access with the sales leads today.
Maya: Great, Chen owns that. The campaign budget is still under review.
Rahul: We should consider a customer webinar, but we haven't approved it.`;

const empty: Analysis = { meeting_summary: "", key_decisions: [], discussions: [], action_items: [], open_questions: [], follow_up_items: [] };

export default function App() {
  const [title, setTitle] = useState("Q4 Sales Planning");
  const [transcript, setTranscript] = useState(sample);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [history, setHistory] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview"|"actions"|"decisions">("overview");

  async function loadHistory() {
    try { const r = await fetch(`${API}/api/v1/meetings`); if (r.ok) setHistory(await r.json()); } catch { /* backend may be starting */ }
  }
  useEffect(() => { loadHistory(); }, []);

  async function analyze() {
    setLoading(true); setError(""); setMeeting(null);
    try {
      const response = await fetch(`${API}/api/v1/meetings/analyze`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ title, transcript }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setMeeting(data); await loadHistory();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to reach the API. Is the backend running?"); }
    finally { setLoading(false); }
  }

  const analysis = meeting?.analysis || empty;
  const stats = [
    { label: "Decisions", value: analysis.key_decisions.length, icon: CheckCircle2 },
    { label: "Action items", value: analysis.action_items.length, icon: ListTodo },
    { label: "Open questions", value: analysis.open_questions.length, icon: CircleHelp },
    { label: "Follow-ups", value: analysis.follow_up_items.length, icon: Clock3 }
  ];

  return <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>meetmind</span></div>
      <div className="nav-label">WORKSPACE</div>
      <button className="nav-item active"><Activity size={17}/> Meeting insights</button>
      <button className="nav-item" onClick={() => {setMeeting(null); setTitle(""); setTranscript("");}}><Plus size={17}/> New analysis</button>
      <div className="nav-label recent-label">RECENT MEETINGS</div>
      {history.slice(0,6).map(m => <button key={m.id} className="history-item" onClick={async()=>{const r=await fetch(`${API}/api/v1/meetings/${m.id}`);if(r.ok)setMeeting(await r.json());}}><FileText size={15}/><span>{m.title}</span></button>)}
      <div className="sidebar-bottom"><div className="avatar">MM</div><div><b>Meeting workspace</b><small>AI-powered notes</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">WORKSPACE / MEETING INSIGHTS</span><h1>Meeting intelligence</h1></div><div className="top-right"><span className="status-dot"/> AI assistant ready</div></header>
      <section className="intro"><div><div className="pill"><Sparkles size={13}/> AI-POWERED MEETING NOTES</div><h2>Turn conversations into<br/><span>clear next steps.</span></h2><p>Extract decisions, owners and commitments from your meeting transcripts — with evidence you can verify.</p></div><div className="hero-art"><div className="orb"><MessageSquareText size={42}/></div><div className="floating-card"><CheckCircle2 size={15}/> Evidence-backed insights</div></div></section>

      <div className="workspace-grid">
        <section className="panel input-panel">
          <div className="panel-heading"><div><div className="section-kicker">01 / INPUT</div><h3>Meeting transcript</h3></div><span className="tag">TEXT INPUT</span></div>
          <label>Meeting title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Weekly product sync"/>
          <div className="label-row"><label>Transcript</label><span>{transcript.length.toLocaleString()} characters</span></div>
          <textarea value={transcript} onChange={e=>setTranscript(e.target.value)} placeholder={"Paste your transcript here...\n\nSpeaker: What was discussed?"}/>
          <div className="input-foot"><span><Users size={14}/> Speaker labels improve attribution</span><button onClick={()=>setTranscript(sample)}>Load sample</button></div>
          <button className="primary-btn" onClick={analyze} disabled={loading || !title.trim() || !transcript.trim()}>{loading ? <><span className="spinner"/> Analyzing transcript...</> : <><Sparkles size={17}/> Analyze meeting <ArrowUpRight size={16}/></>}</button>
          {error && <div role="alert" className="error">{error}</div>}
          <p className="privacy-note">Your transcript is sent to the configured AI provider for analysis.</p>
        </section>

        <section className="results">
          <div className="panel-heading result-heading"><div><div className="section-kicker">02 / INTELLIGENCE</div><h3>Meeting breakdown</h3></div>{meeting && <span className="tag success">ANALYSIS READY</span>}</div>
          {!meeting ? <div className="empty-state"><div className="empty-icon"><Sparkles size={25}/></div><h3>Your insights will appear here</h3><p>Paste a transcript and run analysis to see a structured summary, decisions and assigned actions.</p><div className="empty-features"><span><CheckCircle2 size={14}/> Decisions</span><span><Users size={14}/> Owners</span><span><Clock3 size={14}/> Deadlines</span></div></div> : <>
            <div className="stats-grid">{stats.map(s=><div className="stat-card" key={s.label}><s.icon size={17}/><b>{s.value}</b><span>{s.label}</span></div>)}</div>
            <div className="summary-card"><div className="card-title"><FileText size={16}/> Executive summary</div><p>{analysis.meeting_summary}</p></div>
            <div className="tabs"><button className={tab==="overview"?"selected":""} onClick={()=>setTab("overview")}>Overview</button><button className={tab==="actions"?"selected":""} onClick={()=>setTab("actions")}>Action items ({analysis.action_items.length})</button><button className={tab==="decisions"?"selected":""} onClick={()=>setTab("decisions")}>Decisions ({analysis.key_decisions.length})</button></div>
            {tab==="overview" && <div className="detail-list">
              <h4><ListTodo size={16}/> Action items</h4>{analysis.action_items.length ? analysis.action_items.map((a,i)=><div className="detail-card" key={i}><div className="detail-main"><b>{a.task}</b><div className="meta"><span><Users size={13}/> {a.owner || "Owner not specified"}</span><span><Clock3 size={13}/> {a.deadline || "No confirmed deadline"}</span></div><blockquote>“{a.evidence}”</blockquote></div><span className="tag warning">{a.status}</span></div>) : <p className="muted">No explicit action items identified.</p>}
              <h4><CircleHelp size={16}/> Open questions</h4>{analysis.open_questions.length ? analysis.open_questions.map((q,i)=><div className="question" key={i}>{q.question}</div>) : <p className="muted">No open questions identified.</p>}
              <h4><MessageSquareText size={16}/> Discussions (not decisions)</h4>{analysis.discussions.map((d,i)=><div className="discussion" key={i}><b>{d.topic}</b><p>{d.notes}</p></div>)}
            </div>}
            {tab==="actions" && <div className="detail-list">{analysis.action_items.map((a,i)=><div className="detail-card" key={i}><div className="detail-main"><b>{a.task}</b><div className="meta"><span>{a.owner || "Unassigned"}</span><span>{a.deadline || "No deadline"}</span></div><blockquote>“{a.evidence}”</blockquote></div><span className="tag warning">{a.status}</span></div>)}</div>}
            {tab==="decisions" && <div className="detail-list">{analysis.key_decisions.length ? analysis.key_decisions.map((d,i)=><div className="decision" key={i}><CheckCircle2 size={17}/><div><b>{d.decision}</b><blockquote>“{d.evidence}”</blockquote><small>{d.speaker || "Speaker not identified"} · confidence {(d.confidence*100).toFixed(0)}%</small></div></div>) : <p className="muted">No explicit decisions identified.</p>}</div>}
          </>}
        </section>
      </div>
      <footer>MeetMind <span>·</span> Built for clarity, accountability and better meetings.</footer>
    </main>
  </div>;
}
