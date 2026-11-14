import type { CareerMatch, RequiredSkill, SkillAnalysis } from "@/lib/types";
import { Card } from "./ui";

const STATUS: Record<RequiredSkill["status"], { label: string; style: string }> = {
  have: { label: "Have", style: "bg-accent-soft text-accent" },
  partial: { label: "Partial", style: "bg-warn-soft text-warn" },
  missing: { label: "Missing", style: "bg-bad-soft text-bad" },
};

function InsightList({ title, items, empty }: { title: string; items: SkillAnalysis["strengths"]; empty: string }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.skill}>
              <span className="font-medium">{item.skill}.</span> <span className="text-muted">{item.reason}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props {
  analysis: SkillAnalysis;
  match: CareerMatch;
  /** Match score including skills completed since the last analysis. */
  livePercent: number;
  liveSkills: RequiredSkill[];
}

export function MatchCard({ analysis, match, livePercent, liveSkills }: Props) {
  return (
    <Card title={`Skill analysis and match: ${match.role}`} id="match-heading">
      <div className="mb-5">
        <div className="mb-1 flex items-baseline justify-between">
          <span id="match-label" className="text-sm font-medium">
            Career match
          </span>
          <span className="text-2xl font-semibold tabular-nums">{livePercent}%</span>
        </div>
        <div
          role="progressbar"
          aria-labelledby="match-label"
          aria-valuenow={livePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-3 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${livePercent}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">{match.summary}</p>
      </div>

      <h3 className="mb-2 text-sm font-semibold">Required skills</h3>
      <ul className="mb-5 flex flex-wrap gap-2">
        {liveSkills.map((skill) => (
          <li key={skill.name} className={`rounded-full px-3 py-1 text-sm ${STATUS[skill.status].style}`}>
            <span className="font-medium">{skill.name}</span>
            <span className="ml-1.5 text-xs">
              {STATUS[skill.status].label}
              {skill.importance === "core" ? ", core" : ""}
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 sm:grid-cols-2">
        <InsightList title="Strengths" items={analysis.strengths} empty="No confident skills yet." />
        <InsightList title="Weaknesses" items={analysis.weaknesses} empty="No weak areas found in your current skills." />
      </div>
    </Card>
  );
}
