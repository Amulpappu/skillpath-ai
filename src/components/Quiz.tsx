"use client";

import { useEffect, useState } from "react";
import { postJson } from "@/lib/client";
import { PASS_MARK, gradeQuiz } from "@/lib/scoring";
import type { Level, QuizQuestion, QuizResult } from "@/lib/types";
import { Button } from "./ui";

interface Props {
  skill: string;
  level: Level;
  onGraded: (result: QuizResult) => void;
  onClose: () => void;
}

type QuizResponse = { questions: QuizQuestion[]; source: "gemini" | "rules" };

/** Five-question assessment for one roadmap step, written by the Assessment Agent. */
export function Quiz({ skill, level, onGraded, onClose }: Props) {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    postJson<QuizResponse>("/api/quiz", { skill, level })
      .then((data) => {
        if (cancelled) return;
        setQuiz(data);
        setAnswers(data.questions.map(() => -1));
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [skill, level]);

  if (error) {
    return (
      <div role="alert" className="mt-4 rounded-lg bg-bad-soft p-3 text-sm text-bad">
        {error}{" "}
        <button type="button" className="underline" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }
  if (!quiz) {
    return (
      <p role="status" className="mt-4 text-sm text-muted">
        Assessment Agent is writing your {skill} quiz…
      </p>
    );
  }

  const unanswered = answers.filter((a) => a === -1).length;
  const submit = () => {
    const graded = gradeQuiz(skill, quiz.questions, answers);
    setResult(graded);
    onGraded(graded);
  };

  return (
    <form
      className="mt-4 space-y-4 border-t border-line pt-4"
      aria-label={`${skill} quiz`}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <p className="text-xs text-muted">
        Questions from {quiz.source === "gemini" ? "Gemini" : "the built-in question bank"}. Pass mark {PASS_MARK}%.
      </p>
      {quiz.questions.map((question, qi) => {
        const chosen = answers[qi];
        return (
          <fieldset key={qi} disabled={Boolean(result)}>
            <legend className="mb-1.5 text-sm font-medium">
              {qi + 1}. {question.question}
            </legend>
            <div className="space-y-1">
              {question.options.map((option, oi) => (
                <label key={oi} className="flex cursor-pointer items-start gap-2 rounded px-1 py-0.5 text-sm hover:bg-accent-soft">
                  <input
                    type="radio"
                    name={`${skill}-q${qi}`}
                    className="mt-1 accent-accent"
                    checked={chosen === oi}
                    onChange={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))}
                  />
                  <span>
                    {option}
                    {result && oi === question.answerIndex && <strong className="ml-2 text-accent">Correct answer</strong>}
                    {result && chosen === oi && oi !== question.answerIndex && <strong className="ml-2 text-bad">Your answer</strong>}
                  </span>
                </label>
              ))}
            </div>
            {result && <p className="mt-1 text-sm text-muted">{question.explanation}</p>}
          </fieldset>
        );
      })}
      {result ? (
        <div className="flex flex-wrap items-center gap-3">
          <p role="status" className="text-sm font-semibold">
            Score: {result.scorePercent}%. {result.scorePercent >= PASS_MARK ? "Passed." : "Below the pass mark, so the agents are adapting your plan."}
          </p>
          <Button variant="ghost" onClick={onClose}>
            Close quiz
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={unanswered > 0}>
            Submit answers
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {unanswered > 0 && <span className="text-sm text-muted">{unanswered} question(s) left</span>}
        </div>
      )}
    </form>
  );
}
