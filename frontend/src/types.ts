export type Decision = { decision: string; evidence: string; speaker: string | null; confidence: number };
export type Action = { task: string; owner: string | null; deadline: string | null; status: string; evidence: string; speaker: string | null; confidence: number };
export type Analysis = { meeting_summary: string; key_decisions: Decision[]; discussions: {topic:string;notes:string}[]; action_items: Action[]; open_questions: {question:string;owner:string|null}[]; follow_up_items: {item:string;owner:string|null}[] };
export type Meeting = { id: number; title: string; transcript: string; analysis: Analysis; status: string; created_at: string };
