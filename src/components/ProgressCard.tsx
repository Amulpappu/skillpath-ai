import { PASS_MARK } from "@/lib/scoring";
import type { MentorNote } from "@/lib/types";
import { Card } from "./ui";

export interface ScoreEntry {
  skill: string;
  scorePercent: number;
  at: string;
}

interface Props {
  completed: number;
  total: number;
  startPercent: number;
  livePercent: number;
  scores: ScoreEntry[];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-card p-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function ProgressCard({ completed, total, startPercent, livePercent, scores }: Props) {
  const average = scores.length ? Math.round(scores.reduce((sum, s) => sum + s.scorePercent, 0) / scores.length) : null;
  return (
    <Card title="Progress tracking" id="progress-heading">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Steps completed" value={`${completed} / ${total}`} />
        <Stat label="Match at start" value={`${startPercent}%`} />
        <Stat label="Match now" value={`${livePercent}%`} />
        <Stat label="Average quiz score" value={average === null ? "No quizzes" : `${average}%`} />
      </dl>
      {scores.length > 0 && (
        <table className="mt-4 w-full text-left text-sm">
          <caption className="mb-2 text-left text-sm font-semibold">Assessment history</caption>
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="py-1 font-medium">Skill</th>
              <th scope="col" className="py-1 font-medium">Score</th>
              <th scope="col" className="py-1 font-medium">Result</th>
              <th scope="col" className="py-1 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={index} className="border-t border-line">
                <td className="py-1.5">{score.skill}</td>
                <td className="py-1.5 tabular-nums">{score.scorePercent}%</td>
                <td className={`py-1.5 font-medium ${score.scorePercent >= PASS_MARK ? "text-accent" : "text-bad"}`}>
                  {score.scorePercent >= PASS_MARK ? "Passed" : "Plan adapted"}
                </td>
                <td className="py-1.5 text-muted">{new Date(score.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export function MentorCard({ mentor }: { mentor: MentorNote }) {
  return (
    <section aria-labelledby="mentor-heading" aria-live="polite" className="rounded-md bg-inverse p-5 text-on-inverse sm:p-6">
      <h2 id="mentor-heading" className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent-soft">
        AI Mentor
      </h2>
      <p className="text-base leading-relaxed">{mentor.message}</p>
      <p className="mt-3 text-sm">
        <span className="font-semibold text-accent-soft">Next step: </span>
        {mentor.nextAction}
      </p>
    </section>
  );
}
