import type { Resource } from "./types";

/** Skills each supported role needs. "core" skills weigh double in the match score. */
export const ROLE_REQUIREMENTS: Record<string, { core: string[]; useful: string[] }> = {
  "Full Stack Developer": {
    core: ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL"],
    useful: ["Git", "REST APIs", "TypeScript", "Testing"],
  },
  "Frontend Developer": {
    core: ["HTML", "CSS", "JavaScript", "React"],
    useful: ["TypeScript", "Git", "Testing", "REST APIs"],
  },
  "Backend Developer": {
    core: ["Node.js", "SQL", "REST APIs", "Git"],
    useful: ["Python", "Docker", "Testing", "Linux"],
  },
  "Data Analyst": {
    core: ["SQL", "Python", "Pandas", "Data Visualization", "Statistics"],
    useful: ["Machine Learning", "Git"],
  },
  "Data Scientist": {
    core: ["Python", "Statistics", "Pandas", "Machine Learning", "SQL"],
    useful: ["Data Visualization", "Git", "Docker"],
  },
  "Cyber Security Analyst": {
    core: ["Networking", "Linux", "Web Security", "Python"],
    useful: ["Cryptography", "SQL", "Git"],
  },
  "DevOps Engineer": {
    core: ["Linux", "Git", "Docker", "CI/CD", "Cloud"],
    useful: ["Kubernetes", "Python", "Networking"],
  },
};

export const ROLES = Object.keys(ROLE_REQUIREMENTS);

/** Fallback requirements used by the rule engine for roles outside the catalog. */
export const GENERIC_REQUIREMENTS = {
  core: ["Git", "Python", "SQL"],
  useful: ["Linux", "REST APIs", "Testing"],
};

type Entry = { resources: Omit<Resource, "type">[]; exercise: string };

/** Curated free learning resources. URLs are fixed here so the model can never invent a link. */
const SKILL_CATALOG: Record<string, Entry> = {
  HTML: {
    resources: [
      { title: "HTML reference and guides", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
      { title: "Learn HTML", provider: "web.dev", url: "https://web.dev/learn/html" },
    ],
    exercise: "Build a semantic one-page resume with header, main, sections and a contact form.",
  },
  CSS: {
    resources: [
      { title: "Learn CSS", provider: "web.dev", url: "https://web.dev/learn/css" },
      { title: "CSS reference and guides", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    ],
    exercise: "Style your resume page with a responsive two-column layout using flexbox or grid.",
  },
  JavaScript: {
    resources: [
      { title: "The Modern JavaScript Tutorial", provider: "javascript.info", url: "https://javascript.info" },
      { title: "JavaScript Guide", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
    ],
    exercise: "Build a to-do list in plain JavaScript: add, complete, delete and persist items in localStorage.",
  },
  React: {
    resources: [
      { title: "Learn React", provider: "react.dev", url: "https://react.dev/learn" },
      { title: "Tutorial: Tic-Tac-Toe", provider: "react.dev", url: "https://react.dev/learn/tutorial-tic-tac-toe" },
    ],
    exercise: "Rebuild your to-do list in React with components, props and state.",
  },
  "Node.js": {
    resources: [
      { title: "Introduction to Node.js", provider: "nodejs.org", url: "https://nodejs.org/en/learn" },
      { title: "Express getting started", provider: "Express", url: "https://expressjs.com" },
    ],
    exercise: "Create a small Express API with GET and POST routes for your to-do items.",
  },
  SQL: {
    resources: [
      { title: "Interactive SQL lessons", provider: "SQLBolt", url: "https://sqlbolt.com" },
      { title: "PostgreSQL tutorial", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/tutorial.html" },
    ],
    exercise: "Design tables for a library and write queries with JOIN, GROUP BY and a subquery.",
  },
  Python: {
    resources: [
      { title: "The Python Tutorial", provider: "python.org", url: "https://docs.python.org/3/tutorial/" },
      { title: "Python course", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn/python" },
    ],
    exercise: "Write a script that reads a CSV file and prints summary statistics.",
  },
  Git: {
    resources: [
      { title: "Pro Git book", provider: "git-scm.com", url: "https://git-scm.com/book/en/v2" },
      { title: "Learn Git Branching", provider: "learngitbranching", url: "https://learngitbranching.js.org" },
    ],
    exercise: "Put a project on GitHub using a feature branch and a pull request.",
  },
  TypeScript: {
    resources: [
      { title: "TypeScript Handbook", provider: "typescriptlang.org", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
    ],
    exercise: "Convert one of your JavaScript files to TypeScript with strict mode on.",
  },
  "REST APIs": {
    resources: [
      { title: "HTTP overview and guides", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
    ],
    exercise: "Design and document five REST endpoints for a notes app, with status codes.",
  },
  Testing: {
    resources: [{ title: "Vitest guide", provider: "Vitest", url: "https://vitest.dev/guide/" }],
    exercise: "Write unit tests for three functions in an existing project.",
  },
  Docker: {
    resources: [{ title: "Get started with Docker", provider: "Docker Docs", url: "https://docs.docker.com/get-started/" }],
    exercise: "Write a Dockerfile for a small web app and run it locally.",
  },
  Linux: {
    resources: [
      { title: "The Linux command line for beginners", provider: "Ubuntu", url: "https://ubuntu.com/tutorials/command-line-for-beginners" },
    ],
    exercise: "Write a shell script that backs up a folder and logs the result.",
  },
  Networking: {
    resources: [{ title: "Learning Center", provider: "Cloudflare", url: "https://www.cloudflare.com/learning/" }],
    exercise: "Trace a web request end to end: DNS lookup, TCP, TLS and HTTP, and write up each step.",
  },
  "Web Security": {
    resources: [
      { title: "Web Security Academy", provider: "PortSwigger", url: "https://portswigger.net/web-security" },
      { title: "OWASP Top Ten", provider: "OWASP", url: "https://owasp.org/www-project-top-ten/" },
    ],
    exercise: "Complete three Web Security Academy labs on SQL injection and XSS.",
  },
  Cryptography: {
    resources: [
      { title: "Cryptography", provider: "Khan Academy", url: "https://www.khanacademy.org/computing/computer-science/cryptography" },
    ],
    exercise: "Implement a Caesar cipher, then explain why it is not secure.",
  },
  Pandas: {
    resources: [{ title: "Pandas course", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn/pandas" }],
    exercise: "Clean a public dataset and answer three questions about it with Pandas.",
  },
  "Data Visualization": {
    resources: [
      { title: "Data Visualization course", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn/data-visualization" },
    ],
    exercise: "Create four charts that tell one story from a dataset of your choice.",
  },
  Statistics: {
    resources: [
      { title: "Statistics and probability", provider: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability" },
    ],
    exercise: "Compute mean, median, variance and a confidence interval for a real dataset.",
  },
  "Machine Learning": {
    resources: [
      { title: "Machine Learning Crash Course", provider: "Google", url: "https://developers.google.com/machine-learning/crash-course" },
      { title: "Intro to Machine Learning", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
    ],
    exercise: "Train and evaluate a decision tree on a Kaggle beginner dataset.",
  },
  "CI/CD": {
    resources: [{ title: "GitHub Actions documentation", provider: "GitHub", url: "https://docs.github.com/en/actions" }],
    exercise: "Add a workflow that runs your tests on every push.",
  },
  Cloud: {
    resources: [{ title: "Google Cloud documentation", provider: "Google Cloud", url: "https://cloud.google.com/docs" }],
    exercise: "Deploy a small web app to a managed cloud service.",
  },
  Kubernetes: {
    resources: [
      { title: "Learn Kubernetes Basics", provider: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" },
    ],
    exercise: "Deploy a container to a local cluster and scale it to three replicas.",
  },
};

const ALIASES: Record<string, string> = {
  js: "javascript",
  node: "node.js",
  nodejs: "node.js",
  reactjs: "react",
  "react.js": "react",
  ts: "typescript",
  html5: "html",
  css3: "css",
  mysql: "sql",
  postgresql: "sql",
  ml: "machine learning",
  api: "rest apis",
  apis: "rest apis",
  "rest api": "rest apis",
};

/** Lower-cases a skill name and strips qualifiers such as "basic" so that "Basic HTML" equals "HTML". */
export function normalizeSkill(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/\b(basic|basics|beginner|intermediate|advanced|fundamentals|of)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ALIASES[cleaned] ?? cleaned;
}

function catalogEntry(skill: string): Entry | undefined {
  const key = Object.keys(SKILL_CATALOG).find((k) => normalizeSkill(k) === normalizeSkill(skill));
  return key ? SKILL_CATALOG[key] : undefined;
}

/**
 * Resources for a skill. Known skills get curated links; unknown skills get a search link,
 * which is labelled as a search so the learner is never shown an invented URL.
 */
export function resourcesFor(skill: string): Resource[] {
  const entry = catalogEntry(skill);
  if (!entry) {
    return [
      {
        title: `Search free ${skill} tutorials`,
        type: "tutorial",
        provider: "Web search",
        url: `https://www.google.com/search?q=${encodeURIComponent(`${skill} free beginner tutorial`)}`,
      },
    ];
  }
  return entry.resources.map((r, i) => ({ ...r, type: i === 0 ? "course" : "tutorial" }));
}

export function exerciseFor(skill: string): string {
  return catalogEntry(skill)?.exercise ?? `Build one small project that uses ${skill} and publish it on GitHub.`;
}
