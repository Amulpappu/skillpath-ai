"use client";

import { ALL_SKILLS, ROLES } from "@/lib/catalog";
import type { Level, Profile } from "@/lib/types";
import { GitHubCheck } from "./GitHubCheck";
import { Button, Card, inputClass, labelClass } from "./ui";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const OTHER = "__other__";

interface Props {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onSubmit: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  busy: boolean;
  hasPlan: boolean;
  githubUser?: string;
}

const toLines = (items: string[]) => items.join("\n");
const fromLines = (text: string) => text.split("\n");

export function ProfileForm({ profile, onChange, onSubmit, onLoadSample, onReset, busy, hasPlan, githubUser = "" }: Props) {
  const isOther = !ROLES.includes(profile.targetRole);
  const setSkill = (index: number, patch: Partial<Profile["skills"][number]>) =>
    onChange({ ...profile, skills: profile.skills.map((s, i) => (i === index ? { ...s, ...patch } : s)) });

  return (
    <Card title="Your profile" id="profile-heading">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <GitHubCheck profile={profile} onChange={onChange} defaultUser={githubUser} />

        <fieldset>
          <legend className={labelClass}>Current skills</legend>
          <ul className="space-y-2">
            {profile.skills.map((skill, index) => (
              <li key={index} className="flex flex-wrap gap-2 sm:flex-nowrap">
                <input
                  aria-label={`Skill ${index + 1} name`}
                  list="skill-options"
                  className={`${inputClass} min-w-0 flex-1`}
                  value={skill.name}
                  maxLength={40}
                  placeholder="e.g. Python"
                  onChange={(e) => setSkill(index, { name: e.target.value })}
                />
                <select
                  aria-label={`Skill ${index + 1} level`}
                  className={`${inputClass} !w-36 shrink-0`}
                  value={skill.level}
                  onChange={(e) => setSkill(index, { level: e.target.value as Level })}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  className="shrink-0"
                  aria-label={`Remove skill ${skill.name || index + 1}`}
                  onClick={() => onChange({ ...profile, skills: profile.skills.filter((_, i) => i !== index) })}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <datalist id="skill-options">
            {ALL_SKILLS.map((skill) => (
              <option key={skill} value={skill} />
            ))}
          </datalist>
          <Button
            variant="ghost"
            className="mt-2"
            disabled={profile.skills.length >= 30}
            onClick={() => onChange({ ...profile, skills: [...profile.skills, { name: "", level: "beginner" }] })}
          >
            Add a skill
          </Button>
        </fieldset>

        <div>
            <label htmlFor="projects" className={labelClass}>
              Projects <span className="font-normal text-muted">(one per line)</span>
            </label>
            <textarea
              id="projects"
              rows={3}
              className={inputClass}
              value={toLines(profile.projects)}
              onChange={(e) => onChange({ ...profile, projects: fromLines(e.target.value) })}
            />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="role" className={labelClass}>
              Career goal
            </label>
            <select
              id="role"
              className={inputClass}
              value={isOther ? OTHER : profile.targetRole}
              onChange={(e) => onChange({ ...profile, targetRole: e.target.value === OTHER ? "" : e.target.value })}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
              <option value={OTHER}>Another role</option>
            </select>
          </div>
          {isOther && (
            <div>
              <label htmlFor="custom-role" className={labelClass}>
                Role name
              </label>
              <input
                id="custom-role"
                className={inputClass}
                value={profile.targetRole}
                maxLength={60}
                required
                placeholder="e.g. Game Developer"
                onChange={(e) => onChange({ ...profile, targetRole: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Agents are working" : hasPlan ? "Update my plan" : "Analyse my skills"}
          </Button>
          <Button variant="ghost" onClick={onLoadSample} disabled={busy}>
            Load sample learner
          </Button>
          <Button variant="ghost" onClick={onReset} disabled={busy}>
            Reset
          </Button>
        </div>
        {hasPlan && (
          <p className="text-sm text-muted">Change your career goal and update: the agents rebuild the plan and keep the skills you completed.</p>
        )}
      </form>
    </Card>
  );
}
