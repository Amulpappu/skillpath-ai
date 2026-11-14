"use client";

import { useState } from "react";
import type { Level, QuizResult, RoadmapStep } from "@/lib/types";
import { Quiz } from "./Quiz";
import { Button, Card } from "./ui";

interface Props {
  roadmap: RoadmapStep[];
  isDone: (step: RoadmapStep) => boolean;
  levelFor: (skill: string) => Level;
  onQuizGraded: (step: RoadmapStep, result: QuizResult) => void;
  onMarkDone: (step: RoadmapStep) => void;
  busy: boolean;
}

export function Roadmap({ roadmap, isDone, levelFor, onQuizGraded, onMarkDone, busy }: Props) {
  const [openQuiz, setOpenQuiz] = useState<string | null>(null);

  return (
    <Card title="Learning roadmap" id="roadmap-heading" aside={<span className="text-sm text-muted">{roadmap.length} step(s)</span>}>
      <ol className="space-y-3">
        {roadmap.map((step) => {
          const done = isDone(step);
          return (
            <li key={step.id} className={`rounded-lg border p-4 ${step.remedial ? "border-warn bg-warn-soft/40" : "border-line bg-white"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">
                  <span className="mr-2 font-mono text-xs text-muted">WEEK {step.week}</span>
                  {step.skill}
                  {step.remedial && <span className="ml-2 rounded bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">Revision added by AI Mentor</span>}
                </h3>
                <span className={`text-sm font-medium ${done ? "text-accent" : "text-muted"}`}>{done ? "✓ Completed" : "Not started"}</span>
              </div>
              <p className="mt-1 text-sm">{step.goal}</p>

              <ul className="mt-3 space-y-1 text-sm">
                {step.resources.map((resource) => (
                  <li key={resource.url}>
                    <span className="mr-2 inline-block w-16 text-xs uppercase tracking-wide text-muted">{resource.type}</span>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-2">
                      {resource.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <span className="text-muted">, {resource.provider}</span>
                  </li>
                ))}
                <li>
                  <span className="mr-2 inline-block w-16 text-xs uppercase tracking-wide text-muted">Practice</span>
                  {step.exercise}
                </li>
              </ul>

              {!done && openQuiz !== step.id && (
                <div className="mt-3">
                  {step.remedial ? (
                    <Button variant="ghost" onClick={() => onMarkDone(step)} disabled={busy}>
                      Mark revision done
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setOpenQuiz(step.id)} disabled={busy} aria-label={`Take the ${step.skill} quiz`}>
                      Take quiz
                    </Button>
                  )}
                </div>
              )}
              {openQuiz === step.id && (
                <Quiz
                  skill={step.skill}
                  level={levelFor(step.skill)}
                  onGraded={(result) => onQuizGraded(step, result)}
                  onClose={() => setOpenQuiz(null)}
                />
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
