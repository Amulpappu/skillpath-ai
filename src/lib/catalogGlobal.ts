import type { Resource } from "./types";

/**
 * v2 global catalogue: more career roles (tech and non-tech) and every major programming language,
 * plus the CS fundamentals placement rounds test. Merged into catalog.ts.
 * URLs are fixed here (official docs or well-known free courses) so no agent can invent a link.
 */

export const GLOBAL_ROLES: Record<string, { core: string[]; useful: string[] }> = {
  "Software Engineer (Placements)": {
    core: ["Data Structures & Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks", "SQL"],
    useful: ["Java", "C++", "Python", "Git", "System Design"],
  },
  "Java Developer": { core: ["Java", "OOP", "Spring Boot", "SQL", "REST APIs"], useful: ["Git", "Docker", "Testing", "Data Structures & Algorithms"] },
  "Python Developer": { core: ["Python", "Django", "SQL", "REST APIs", "Git"], useful: ["Docker", "Testing", "Linux"] },
  ".NET Developer": { core: ["C#", ".NET", "SQL", "REST APIs"], useful: ["Azure", "Git", "Testing"] },
  "Go Developer": { core: ["Go", "REST APIs", "SQL", "Docker"], useful: ["Kubernetes", "Linux", "Git"] },
  "Rust Developer": { core: ["Rust", "Data Structures & Algorithms", "Linux", "Git"], useful: ["C++", "Testing", "Operating Systems"] },
  "Android Developer": { core: ["Kotlin", "Android", "REST APIs", "Git"], useful: ["Java", "Testing", "UI Design"] },
  "iOS Developer": { core: ["Swift", "iOS", "REST APIs", "Git"], useful: ["UI Design", "Testing"] },
  "Flutter Developer": { core: ["Dart", "Flutter", "REST APIs", "Git"], useful: ["UI Design", "Testing", "Firebase"] },
  "Frontend Engineer (Angular/Vue)": { core: ["HTML", "CSS", "JavaScript", "TypeScript", "Angular", "Vue"], useful: ["Git", "Testing", "Accessibility"] },
  "Data Engineer": { core: ["SQL", "Python", "Apache Spark", "Data Modelling", "Cloud"], useful: ["Docker", "Git", "Linux"] },
  "MLOps Engineer": { core: ["Python", "Machine Learning", "Docker", "CI/CD", "MLOps"], useful: ["Kubernetes", "Cloud", "Linux"] },
  "Generative AI Engineer": { core: ["Python", "LLMs & Prompting", "RAG & Vector Databases", "AI Agents & MCP", "LLM Evaluation"], useful: ["Machine Learning", "Deep Learning", "Docker", "Cloud"] },
  "Computer Vision Engineer": { core: ["Python", "Deep Learning", "OpenCV", "Machine Learning"], useful: ["C++", "Docker", "Statistics"] },
  "NLP Engineer": { core: ["Python", "Deep Learning", "LLMs & Prompting", "Machine Learning"], useful: ["Statistics", "Docker"] },
  "Site Reliability Engineer": { core: ["Linux", "Networking", "Kubernetes", "Go", "CI/CD"], useful: ["Python", "Cloud", "Terraform"] },
  "Cloud Architect (AWS)": { core: ["AWS", "Networking", "Linux", "Terraform", "Docker"], useful: ["Kubernetes", "Python", "Cloud"] },
  "Cloud Engineer (Azure)": { core: ["Azure", "Networking", "Linux", ".NET", "Docker"], useful: ["Terraform", "Kubernetes"] },
  "Network Engineer": { core: ["Computer Networks", "Networking", "Linux"], useful: ["Python", "Cloud", "Web Security"] },
  "Penetration Tester": { core: ["Web Security", "Networking", "Linux", "Python", "Bash"], useful: ["Cryptography", "C"] },
  "SOC Analyst": { core: ["Networking", "Linux", "Web Security", "Computer Networks"], useful: ["Python", "Cryptography", "Bash"] },
  "Database Administrator": { core: ["SQL", "DBMS", "Linux", "PostgreSQL"], useful: ["Cloud", "Bash", "Python"] },
  "Embedded Systems Engineer": { core: ["C", "C++", "Embedded & IoT", "Operating Systems"], useful: ["Python", "Linux", "Git"] },
  "Blockchain Developer": { core: ["Solidity", "JavaScript", "Cryptography", "Git"], useful: ["TypeScript", "Rust", "Testing"] },
  "Salesforce Developer": { core: ["Salesforce", "SQL", "JavaScript"], useful: ["REST APIs", "Git"] },
  "Business Analyst": { core: ["SQL", "Excel & Spreadsheets", "Data Visualization", "Statistics"], useful: ["Power BI", "Python"] },
  "BI Developer (Power BI)": { core: ["Power BI", "SQL", "Data Modelling", "Excel & Spreadsheets"], useful: ["Python", "Statistics"] },
  "Product Manager": { core: ["Product Management", "UX Research", "SQL", "Data Visualization"], useful: ["Agile & Scrum", "Figma"] },
  "Technical Writer": { core: ["Technical Writing", "Git", "HTML", "REST APIs"], useful: ["Python", "Markdown"] },
  "Digital Marketer": { core: ["Digital Marketing", "SEO", "Data Visualization"], useful: ["Excel & Spreadsheets", "HTML"] },
  "Solutions Architect": { core: ["System Design", "Cloud", "Networking", "REST APIs"], useful: ["Kubernetes", "Security"] },
  // AI-era roles (reviewed Nov 2026 against LinkedIn Jobs/Skills on the Rise 2026 and AI-engineer job-posting analyses)
  "AI Engineer (LLM apps)": { core: ["Python", "Prompt & Context Engineering", "RAG & Vector Databases", "AI Agents & MCP", "LLM Evaluation"], useful: ["TypeScript", "REST APIs", "Docker", "AI Security", "Cloud"] },
  "AI Agent Engineer": { core: ["Python", "TypeScript", "AI Agents & MCP", "Prompt & Context Engineering", "LLM Evaluation", "REST APIs"], useful: ["RAG & Vector Databases", "AI Security", "Docker"] },
  "AI Consultant / Strategist": { core: ["AI for Business", "AI Literacy", "Prompt & Context Engineering", "Product Management", "Data Visualization"], useful: ["Responsible AI", "SQL", "Excel & Spreadsheets"] },
  "AI Security Engineer": { core: ["AI Security", "Web Security", "Python", "Networking"], useful: ["Responsible AI", "Cloud", "LLM Evaluation"] },
};

type Entry = { resources: Omit<Resource, "type">[]; exercise: string };

export const GLOBAL_SKILLS: Record<string, Entry> = {
  Java: { resources: [{ title: "Learn Java", provider: "dev.java", url: "https://dev.java/learn/" }], exercise: "Build a console library-management app with classes, interfaces and collections." },
  C: { resources: [{ title: "Learn C", provider: "learn-c.org", url: "https://www.learn-c.org" }, { title: "C reference", provider: "cppreference", url: "https://en.cppreference.com/w/c" }], exercise: "Write a C program that reads a file and counts words using dynamic memory." },
  "C++": { resources: [{ title: "LearnCpp", provider: "learncpp.com", url: "https://www.learncpp.com" }], exercise: "Implement a templated stack and queue with unit tests." },
  Go: { resources: [{ title: "A Tour of Go", provider: "go.dev", url: "https://go.dev/tour/" }], exercise: "Build a small JSON REST API in Go with the standard library." },
  Rust: { resources: [{ title: "The Rust Programming Language", provider: "rust-lang.org", url: "https://doc.rust-lang.org/book/" }], exercise: "Write a command-line grep clone in Rust with error handling." },
  Kotlin: { resources: [{ title: "Kotlin getting started", provider: "kotlinlang.org", url: "https://kotlinlang.org/docs/getting-started.html" }], exercise: "Model a to-do list with data classes, collections and null safety." },
  Swift: { resources: [{ title: "The Swift Programming Language", provider: "swift.org", url: "https://docs.swift.org/swift-book/" }], exercise: "Write Swift structs and protocols for a simple bank account model." },
  Dart: { resources: [{ title: "Dart language tour", provider: "dart.dev", url: "https://dart.dev/language" }], exercise: "Write a Dart program that fetches and parses JSON asynchronously." },
  PHP: { resources: [{ title: "PHP manual", provider: "php.net", url: "https://www.php.net/manual/en/" }], exercise: "Build a contact form that validates input and stores it in SQLite." },
  Ruby: { resources: [{ title: "Ruby in Twenty Minutes", provider: "ruby-lang.org", url: "https://www.ruby-lang.org/en/documentation/quickstart/" }], exercise: "Write a Ruby class hierarchy for shapes with area calculations." },
  R: { resources: [{ title: "R for Data Science", provider: "r4ds", url: "https://r4ds.hadley.nz" }], exercise: "Clean a public dataset and plot three charts with ggplot2." },
  Scala: { resources: [{ title: "Tour of Scala", provider: "scala-lang.org", url: "https://docs.scala-lang.org/tour/tour-of-scala.html" }], exercise: "Use case classes and pattern matching to evaluate arithmetic expressions." },
  Julia: { resources: [{ title: "Julia documentation", provider: "julialang.org", url: "https://docs.julialang.org" }], exercise: "Solve a linear system and benchmark it against a naive loop." },
  Lua: { resources: [{ title: "Programming in Lua", provider: "lua.org", url: "https://www.lua.org/pil/contents.html" }], exercise: "Write a Lua module with tables that implements a simple inventory." },
  Haskell: { resources: [{ title: "Haskell documentation", provider: "haskell.org", url: "https://www.haskell.org/documentation/" }], exercise: "Implement map, filter and fold yourself and use them on a list of records." },
  "F#": { resources: [{ title: "F# guide", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/dotnet/fsharp/" }], exercise: "Model a shopping cart with records and discriminated unions." },
  Elixir: { resources: [{ title: "Learning Elixir", provider: "elixir-lang.org", url: "https://elixir-lang.org/learning.html" }], exercise: "Build a counter process with GenServer and supervise it." },
  Clojure: { resources: [{ title: "Getting started", provider: "clojure.org", url: "https://clojure.org/guides/getting_started" }], exercise: "Transform a list of maps with threading macros." },
  Perl: { resources: [{ title: "perlintro", provider: "perldoc.perl.org", url: "https://perldoc.perl.org/perlintro" }], exercise: "Parse a log file with regular expressions and summarise errors." },
  Fortran: { resources: [{ title: "Learn Fortran", provider: "fortran-lang.org", url: "https://fortran-lang.org/learn/" }], exercise: "Write a Fortran program that multiplies two matrices." },
  Zig: { resources: [{ title: "Learn Zig", provider: "ziglang.org", url: "https://ziglang.org/learn/" }], exercise: "Write a Zig program that reverses a string with an allocator." },
  Solidity: { resources: [{ title: "Solidity documentation", provider: "soliditylang.org", url: "https://docs.soliditylang.org" }], exercise: "Write and test a simple token contract on a local network." },
  Bash: { resources: [{ title: "Bash reference manual", provider: "GNU", url: "https://www.gnu.org/software/bash/manual/" }], exercise: "Write a script that backs up a folder with a dated archive name." },
  "Data Structures & Algorithms": { resources: [{ title: "Algorithms for Competitive Programming", provider: "cp-algorithms", url: "https://cp-algorithms.com" }, { title: "Roadmap", provider: "NeetCode", url: "https://neetcode.io/roadmap" }], exercise: "Solve 10 array and string problems in order of difficulty, timing each one." },
  OOP: { resources: [{ title: "Object-oriented programming in Java", provider: "dev.java", url: "https://dev.java/learn/oop/" }], exercise: "Design classes for a parking lot using inheritance, interfaces and encapsulation." },
  DBMS: { resources: [{ title: "Database Systems (CMU 15-445)", provider: "Carnegie Mellon", url: "https://15445.courses.cs.cmu.edu" }], exercise: "Normalise a messy table to 3NF and write the queries for five business questions." },
  "Operating Systems": { resources: [{ title: "Operating Systems: Three Easy Pieces", provider: "OSTEP", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" }], exercise: "Simulate FCFS, SJF and round-robin scheduling and compare waiting times." },
  "Computer Networks": { resources: [{ title: "Learning Center", provider: "Cloudflare", url: "https://www.cloudflare.com/learning/" }, { title: "Networking Academy", provider: "Cisco", url: "https://www.netacad.com" }], exercise: "Trace a web request from DNS lookup to TCP handshake to HTTP response and explain each step." },
  "System Design": { resources: [{ title: "The System Design Primer", provider: "GitHub", url: "https://github.com/donnemartin/system-design-primer" }], exercise: "Design a URL shortener: API, data model, caching and scaling plan." },
  "Spring Boot": { resources: [{ title: "Spring guides", provider: "spring.io", url: "https://spring.io/guides" }], exercise: "Build a REST API with Spring Boot, JPA and validation." },
  Django: { resources: [{ title: "Django tutorial", provider: "djangoproject.com", url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/" }], exercise: "Build a polls app with the Django admin and tests." },
  ".NET": { resources: [{ title: ".NET documentation", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/dotnet/" }], exercise: "Build a minimal API with ASP.NET Core and Entity Framework." },
  Android: { resources: [{ title: "Android Basics with Compose", provider: "Android Developers", url: "https://developer.android.com/courses/android-basics-compose/course" }], exercise: "Build a two-screen Compose app that lists items from a REST API." },
  iOS: { resources: [{ title: "Develop in Swift tutorials", provider: "Apple Developer", url: "https://developer.apple.com/tutorials/develop-in-swift" }], exercise: "Build a SwiftUI list app with navigation and local storage." },
  Flutter: { resources: [{ title: "Flutter documentation", provider: "flutter.dev", url: "https://docs.flutter.dev" }], exercise: "Build a Flutter app with two screens, state management and a REST call." },
  Angular: { resources: [{ title: "Angular tutorials", provider: "angular.dev", url: "https://angular.dev/tutorials" }], exercise: "Build a routed Angular app with a form and an HTTP service." },
  Vue: { resources: [{ title: "Vue tutorial", provider: "vuejs.org", url: "https://vuejs.org/tutorial/" }], exercise: "Build a Vue to-do app with components and computed state." },
  "Apache Spark": { resources: [{ title: "Spark quick start", provider: "Apache Spark", url: "https://spark.apache.org/docs/latest/quick-start.html" }], exercise: "Aggregate a large CSV with PySpark and compare it with Pandas." },
  "Data Modelling": { resources: [{ title: "Database Systems (CMU 15-445)", provider: "Carnegie Mellon", url: "https://15445.courses.cs.cmu.edu" }], exercise: "Design a star schema for an online store's sales." },
  MLOps: { resources: [{ title: "Made With ML", provider: "madewithml.com", url: "https://madewithml.com" }], exercise: "Package a trained model behind an API and add a CI check that tests it." },
  "LLMs & Prompting": { resources: [{ title: "Hugging Face Learn", provider: "Hugging Face", url: "https://huggingface.co/learn" }, { title: "Prompt design strategies", provider: "Google AI for Developers", url: "https://ai.google.dev/gemini-api/docs/prompting-strategies" }], exercise: "Build a small app that answers questions over your own notes and evaluate 20 answers." },
  OpenCV: { resources: [{ title: "OpenCV tutorials", provider: "opencv.org", url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html" }], exercise: "Detect faces in a webcam stream and blur them." },
  AWS: { resources: [{ title: "AWS Skill Builder", provider: "AWS", url: "https://skillbuilder.aws" }], exercise: "Host a static site on S3 behind CloudFront with HTTPS." },
  Azure: { resources: [{ title: "Azure training", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/azure/" }], exercise: "Deploy a web app to Azure App Service with a managed database." },
  Firebase: { resources: [{ title: "Firebase documentation", provider: "Firebase", url: "https://firebase.google.com/docs" }], exercise: "Add sign-in and a realtime database to a small web app." },
  PostgreSQL: { resources: [{ title: "PostgreSQL tutorial", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/tutorial.html" }], exercise: "Write queries with joins, window functions and an index, and compare plans." },
  "Embedded & IoT": { resources: [{ title: "Arduino documentation", provider: "Arduino", url: "https://docs.arduino.cc" }], exercise: "Read a sensor and send the values over serial every second." },
  Salesforce: { resources: [{ title: "Trailhead", provider: "Salesforce", url: "https://trailhead.salesforce.com" }], exercise: "Build a custom object with a validation rule and an Apex trigger." },
  "Power BI": { resources: [{ title: "Power BI training", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi" }], exercise: "Build a three-page sales report with slicers and a DAX measure." },
  "Excel & Spreadsheets": { resources: [{ title: "Excel help and learning", provider: "Microsoft", url: "https://support.microsoft.com/en-us/excel" }], exercise: "Build a monthly budget with lookups, a pivot table and a chart." },
  "Product Management": { resources: [{ title: "Product School resources", provider: "Product School", url: "https://productschool.com/resources" }], exercise: "Write a one-page PRD for a feature with goals, metrics and risks." },
  "Agile & Scrum": { resources: [{ title: "The Scrum Guide", provider: "scrumguides.org", url: "https://scrumguides.org" }], exercise: "Plan a two-week sprint with a backlog, estimates and a review." },
  "Technical Writing": { resources: [{ title: "Technical Writing courses", provider: "Google for Developers", url: "https://developers.google.com/tech-writing" }], exercise: "Write a README and a quick-start guide for an open-source project." },
  Markdown: { resources: [{ title: "Basic writing and formatting syntax", provider: "GitHub Docs", url: "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" }], exercise: "Rewrite a long document as Markdown with headings, tables and code blocks." },
  "Digital Marketing": { resources: [{ title: "Skillshop", provider: "Google", url: "https://skillshop.withgoogle.com" }], exercise: "Plan a one-month campaign with audience, channels, budget and KPIs." },
  SEO: { resources: [{ title: "SEO Starter Guide", provider: "Google Search Central", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" }], exercise: "Audit a website's titles, headings and page speed and list ten fixes." },
  Security: { resources: [{ title: "OWASP Top Ten", provider: "OWASP", url: "https://owasp.org/www-project-top-ten/" }], exercise: "Threat-model a login flow and list mitigations for each risk." },

  // ---- AI-era skills ----
  "AI Literacy": { resources: [{ title: "Elements of AI", provider: "University of Helsinki", url: "https://www.elementsofai.com" }, { title: "Generative AI for Beginners", provider: "Microsoft (GitHub)", url: "https://github.com/microsoft/generative-ai-for-beginners" }], exercise: "Use an AI assistant for one real task this week, check its output against a trusted source and write down where it was wrong." },
  "AI-Assisted Coding": { resources: [{ title: "GitHub Copilot documentation", provider: "GitHub Docs", url: "https://docs.github.com/en/copilot" }, { title: "Prompt engineering guide", provider: "Anthropic", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" }], exercise: "Build a small feature with an AI coding agent, then review every change it made, add tests and fix what it got wrong." },
  "Prompt & Context Engineering": { resources: [{ title: "Prompt design strategies", provider: "Google AI for Developers", url: "https://ai.google.dev/gemini-api/docs/prompting-strategies" }, { title: "Prompt engineering guide", provider: "Anthropic", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" }], exercise: "Write a prompt with role, context, examples and an output schema; test it on 20 inputs and improve the worst 5." },
  "RAG & Vector Databases": { resources: [{ title: "Open-source AI cookbook", provider: "Hugging Face", url: "https://huggingface.co/learn/cookbook" }, { title: "pgvector", provider: "GitHub", url: "https://github.com/pgvector/pgvector" }], exercise: "Build a question-answering app over your own notes: chunk, embed, store in pgvector, retrieve and cite sources." },
  "AI Agents & MCP": { resources: [{ title: "AI Agents Course", provider: "Hugging Face", url: "https://huggingface.co/learn/agents-course" }, { title: "Model Context Protocol documentation", provider: "modelcontextprotocol.io", url: "https://modelcontextprotocol.io" }, { title: "AI Agents for Beginners", provider: "Microsoft (GitHub)", url: "https://github.com/microsoft/ai-agents-for-beginners" }], exercise: "Write a small MCP server that exposes one tool (for example, search your notes) and use it from an AI client." },
  "LLM Evaluation": { resources: [{ title: "Short courses on evaluation and agents", provider: "DeepLearning.AI", url: "https://www.deeplearning.ai/short-courses/" }, { title: "Open-source AI cookbook", provider: "Hugging Face", url: "https://huggingface.co/learn/cookbook" }], exercise: "Create a 30-case test set for an AI feature, score answers automatically and track the score as you change the prompt." },
  "AI Security": { resources: [{ title: "OWASP Top 10 for LLM Applications", provider: "OWASP GenAI Security Project", url: "https://genai.owasp.org" }], exercise: "Try five prompt-injection attacks on your own AI app and add defences for each one that works." },
  "Responsible AI": { resources: [{ title: "Responsible AI practices", provider: "Google AI", url: "https://ai.google/responsibility/responsible-ai-practices/" }], exercise: "Write a one-page risk review for an AI feature: who could be harmed, how you would measure it and what you would change." },
  "AI for Business": { resources: [{ title: "Elements of AI", provider: "University of Helsinki", url: "https://www.elementsofai.com" }, { title: "Generative AI for Beginners", provider: "Microsoft (GitHub)", url: "https://github.com/microsoft/generative-ai-for-beginners" }], exercise: "Pick one process at a company you know, estimate the time AI could save and write a one-page pilot plan with success metrics." },
};

/**
 * Every role also gets one AI skill that fits its kind of work, because employers now ask for AI skills
 * well beyond technical roles. Added to "useful" (not "core") so it never blocks the fundamentals.
 */
export const CATALOG_REVIEWED = "November 2026";
export function aiSkillFor(role: string, core: string[]): string {
  const r = role.toLowerCase();
  if (/security|penetration|soc analyst/.test(r)) return "AI Security";
  if (/manager|marketer|writer|consultant|analyst \(bi|business analyst|designer/.test(r)) return "AI for Business";
  if (/data|scientist|bi developer|ml|nlp|vision/.test(r)) return "Prompt & Context Engineering";
  if (core.some((s) => ["HTML", "JavaScript", "Python", "Java", "C#", "Go", "Rust", "Kotlin", "Swift", "Dart", "C", "C++", "Node.js", "Data Structures & Algorithms", "Solidity", "Git", "Linux", "Docker"].includes(s))) return "AI-Assisted Coding";
  return "AI Literacy";
}

/** AI-era skills, grouped together in pickers and highlighted as in demand. */
export const AI_SKILLS = ["AI Literacy", "AI-Assisted Coding", "Prompt & Context Engineering", "RAG & Vector Databases", "AI Agents & MCP", "LLM Evaluation", "AI Security", "Responsible AI", "AI for Business", "LLMs & Prompting", "MLOps"];

/** Programming languages shown in their own group in the skill picker. */
export const PROGRAMMING_LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "Dart", "PHP", "Ruby",
  "R", "Scala", "Julia", "Lua", "Haskell", "F#", "Elixir", "Clojure", "Perl", "Fortran", "Zig", "Solidity", "Bash", "SQL",
];
