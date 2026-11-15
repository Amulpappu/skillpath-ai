"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentLog } from "@/components/AgentLog";
import { MatchCard } from "@/components/MatchCard";
import { ProfileForm } from "@/components/ProfileForm";
import { MentorCard, ProgressCard, type ScoreEntry } from "@/components/ProgressCard";
import { Roadmap } from "@/components/Roadmap";
import { normalizeSkill } from "@/lib/catalog";
import { streamAgents } from "@/lib/client";
import { matchPercent, passed } from "@/lib/scoring";
import type { AdaptResult, AgentEvent, AnalysisResult, Level, Profile, QuizResult, RoadmapStep } from "@/lib/types";

const STORAGE_KEY = "skillpath:v1";

const EMPTY_PROFILE: Profile = {
  name: "",
  skills: [{ name: "", level: "beginner" }],
  certifications: [],
  projects: [],
  targetRole: "Full Stack Developer",
  learnedSkills: [],
};

/** The sample scenario from the problem statement. */
const SAMPLE_PROFILE: Profile = {
  name: "Asha",
  skills: [
    { name: "Python", level: "intermediate" },
    { name: "SQL", level: "intermediate" },
    { name: "HTML", level: "beginner" },
  ],
  certifications: ["Python for Everybody (Coursera)"],
  projects: ["Student marks analyser in Python and SQLite"],
  targetRole: "Full Stack Developer",
  learnedSkills: [],
};

interface Saved {
  profile: Profile;
  result: AnalysisResult | null;
  doneStepIds: string[];
  scores: ScoreEntry[];
}

const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

/** Trims the form state and drops empty rows before it is sent to the agents. */
function cleanProfile(profile: Profile): Profile {
  return {
    ...profile,
    name: profile.name.trim(),
    targetRole: profile.targetRole.trim(),
    skills: profile.skills.map((s) => ({ ...s, name: s.name.trim() })).filter((s) => s.name),
    certifications: clean(profile.certifications),
    projects: clean(profile.projects),
  };
}

export function PlanClient({ accountName, accountRole }: { accountName: string; accountRole: string }) {
  const [profile, setProfile] = useState<Profile>(() => ({ ...EMPTY_PROFILE, name: accountName, targetRole: accountRole || EMPTY_PROFILE.targetRole }));
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [doneStepIds, setDoneStepIds] = useState<string[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [log, setLog] = useState<AgentEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Restore the last session from this browser once the page has hydrated.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Saved | null;
        if (saved?.profile) {
          setProfile(saved.profile);
          setResult(saved.result);
          setDoneStepIds(saved.doneStepIds ?? []);
          setScores(saved.scores ?? []);
        }
      } catch {
        // Unreadable or blocked storage: start fresh.
      }
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const saved: Saved = { profile, result, doneStepIds, scores };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Storage full or blocked: the app still works for this session.
    }
  }, [loaded, profile, result, doneStepIds, scores]);

  const addEvent = useCallback((event: AgentEvent) => setLog((current) => [...current, event]), []);

  const analyse = async (source: Profile) => {
    // The name comes from the account; certifications are no longer asked for.
    const cleaned = { ...cleanProfile(source), name: accountName || source.name.trim() || "Learner", certifications: [] };
    if (!cleaned.targetRole) {
      setError("Please choose a career goal.");
      return;
    }
    setBusy(true);
    setError("");
    setLog([]);
    try {
      const data = await streamAgents<AnalysisResult>("/api/analyze", { profile: cleaned, previousRole: result?.match.role }, addEvent);
      setResult(data);
      setProfile(cleaned.skills.length ? cleaned : { ...cleaned, skills: EMPTY_PROFILE.skills });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const liveSkills = useMemo(() => {
    if (!result) return [];
    const learned = new Set(profile.learnedSkills.map(normalizeSkill));
    return result.match.requiredSkills.map((s) => (learned.has(normalizeSkill(s.name)) ? { ...s, status: "have" as const } : s));
  }, [result, profile.learnedSkills]);
  const livePercent = useMemo(() => matchPercent(liveSkills), [liveSkills]);

  const isDone = (step: RoadmapStep) =>
    doneStepIds.includes(step.id) || (!step.remedial && profile.learnedSkills.some((s) => normalizeSkill(s) === normalizeSkill(step.skill)));

  const levelFor = (skill: string): Level => {
    const key = normalizeSkill(skill);
    if (profile.learnedSkills.some((s) => normalizeSkill(s) === key)) return "advanced";
    const found = profile.skills.find((s) => normalizeSkill(s.name) === key);
    if (!found) return "beginner";
    return found.level === "beginner" ? "intermediate" : "advanced";
  };

  const onQuizGraded = async (step: RoadmapStep, quiz: QuizResult) => {
    if (!result) return;
    setScores((current) => [...current, { skill: quiz.skill, scorePercent: quiz.scorePercent, at: new Date().toISOString() }]);

    if (passed(quiz)) {
      const learnedSkills = [...new Set([...profile.learnedSkills, step.skill])];
      setProfile({ ...profile, learnedSkills });
      const next = result.roadmap.find((s) => s.id !== step.id && !isDone(s));
      setResult({
        ...result,
        mentor: {
          message: `${quiz.scorePercent}% on ${quiz.skill}: passed, and it now counts towards your ${result.match.role} match.`,
          nextAction: next ? `Move on to "${next.skill}".` : "Every step is complete. Update your plan to see what is left.",
        },
      });
      return;
    }

    // Weak score: the Assessment Agent reports to the Mentor, who has the Planner adapt the roadmap.
    setBusy(true);
    setError("");
    try {
      const { match, roadmap } = result;
      const data = await streamAgents<AdaptResult>(
        "/api/adapt",
        { profile: cleanProfile(profile), roadmap, quiz, match: { role: match.role, matchPercent: livePercent, missingSkills: match.missingSkills } },
        addEvent,
      );
      setResult({ ...result, roadmap: data.roadmap, mentor: data.mentor });
      setDoneStepIds((current) => current.filter((id) => !data.roadmap.some((s) => s.remedial && s.id === id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not adapt the plan. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setProfile(EMPTY_PROFILE);
    setResult(null);
    setDoneStepIds([]);
    setScores([]);
    setLog([]);
    setError("");
  };

  const completed = result ? result.roadmap.filter(isDone).length : 0;

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">Find your skill gaps and close them</h1>
        <p className="mb-6 max-w-2xl text-muted">
          Tell us what you know and where you want to go. The agents compare your skills with the role, build a roadmap, test you
          and change the plan when your results or your goal change.
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-md border border-bad bg-bad-soft px-4 py-3 text-sm text-bad">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="space-y-5">
            <ProfileForm
              profile={profile}
              onChange={setProfile}
              onSubmit={() => analyse(profile)}
              onLoadSample={() => {
                setProfile(SAMPLE_PROFILE);
                setDoneStepIds([]);
                setScores([]);
                void analyse(SAMPLE_PROFILE);
              }}
              onReset={reset}
              busy={busy}
              hasPlan={Boolean(result)}
            />
            <AgentLog events={log} busy={busy} />
          </div>

          <div className="space-y-5">
            {result ? (
              <>
                <MentorCard mentor={result.mentor} />
                <MatchCard analysis={result.analysis} match={result.match} livePercent={livePercent} liveSkills={liveSkills} />
                <Roadmap
                  roadmap={result.roadmap}
                  isDone={isDone}
                  levelFor={levelFor}
                  onQuizGraded={onQuizGraded}
                  onMarkDone={(step) => setDoneStepIds((current) => [...new Set([...current, step.id])])}
                  busy={busy}
                />
                <ProgressCard
                  completed={completed}
                  total={result.roadmap.length}
                  startPercent={result.match.matchPercent}
                  livePercent={livePercent}
                  scores={scores}
                />
              </>
            ) : (
              <section aria-labelledby="empty-heading" className="rounded-md border border-dashed border-line p-8 text-center">
                <h2 id="empty-heading" className="text-lg font-semibold">
                  Your plan will appear here
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  Fill in your profile and choose a career goal, or load the sample learner who knows Python, SQL and basic HTML
                  and wants to become a Full Stack Developer.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-xs text-muted">Started at PromptWars × Rathinam Technical Campus. As a guest, your plan stays in this browser.</p>
    </>
  );
}
