/**
 * Hands-on labs: free interactive tools where a learner can see a concept run, break it and fix it.
 * Shown as "Learn → Try it in a lab → Quiz" for each skill. Links are fixed here; nothing is generated.
 */
export interface Lab { title: string; url: string; what: string }

const L = {
  pythonTutor: { title: "Python Tutor", url: "https://pythontutor.com", what: "Step through code and watch variables, pointers and memory change (Python, Java, C, C++, JavaScript)." },
  visualgo: { title: "VisuAlgo", url: "https://visualgo.net", what: "Animated sorting, trees, graphs and dynamic programming, step by step." },
  cs50: { title: "CS50", url: "https://cs50.harvard.edu", what: "Harvard's free computer science course with hands-on problem sets." },
  stackblitz: { title: "StackBlitz", url: "https://stackblitz.com", what: "Build and run web and Node.js apps in the browser, nothing to install." },
  codepen: { title: "CodePen", url: "https://codepen.io", what: "Try HTML, CSS and JavaScript live and see changes instantly." },
  flexbox: { title: "Flexbox Froggy", url: "https://flexboxfroggy.com", what: "Learn CSS flexbox layout as a game." },
  grid: { title: "Grid Garden", url: "https://cssgridgarden.com", what: "Learn CSS grid layout as a game." },
  sqlMystery: { title: "SQL Murder Mystery", url: "https://mystery.knightlab.com", what: "Solve a crime by writing SQL queries." },
  gitBranching: { title: "Learn Git Branching", url: "https://learngitbranching.js.org", what: "See commits and branches move as you type Git commands." },
  bandit: { title: "OverTheWire: Bandit", url: "https://overthewire.org/wargames/bandit/", what: "Learn Linux commands by hacking through levels." },
  pico: { title: "picoCTF", url: "https://picoctf.org", what: "Beginner capture-the-flag challenges from Carnegie Mellon." },
  portswigger: { title: "Web Security Academy labs", url: "https://portswigger.net/web-security", what: "Exploit and fix real web vulnerabilities in safe labs." },
  packetTracer: { title: "Cisco Packet Tracer", url: "https://www.netacad.com", what: "Simulate routers, switches and subnets (free with a Networking Academy account)." },
  wireshark: { title: "Wireshark", url: "https://www.wireshark.org", what: "Watch real packets: DNS, the TCP handshake and HTTP." },
  killercoda: { title: "Killercoda", url: "https://killercoda.com", what: "Real Linux, Docker and Kubernetes terminals in the browser." },
  tfPlayground: { title: "TensorFlow Playground", url: "https://playground.tensorflow.org", what: "Train a small neural network visually and watch it learn." },
  teachable: { title: "Teachable Machine", url: "https://teachablemachine.withgoogle.com", what: "Train an image or sound model with your webcam in minutes." },
  colab: { title: "Google Colab", url: "https://colab.research.google.com", what: "Free Python notebooks with GPUs for data and ML experiments." },
  kaggle: { title: "Kaggle Notebooks", url: "https://www.kaggle.com/code", what: "Free notebooks on thousands of real datasets." },
  aiStudio: { title: "Google AI Studio", url: "https://aistudio.google.com", what: "Prototype prompts and Gemini apps and compare outputs side by side." },
  hfSpaces: { title: "Hugging Face Spaces", url: "https://huggingface.co/spaces", what: "Try thousands of open AI demos and fork them to build your own." },
  wokwi: { title: "Wokwi", url: "https://wokwi.com", what: "Simulate Arduino and ESP32 boards with sensors in the browser." },
  tinkercad: { title: "Tinkercad Circuits", url: "https://www.tinkercad.com/circuits", what: "Build and simulate electronic circuits." },
  desmos: { title: "Desmos", url: "https://www.desmos.com/calculator", what: "See equations and graphs move instead of memorising formulas." },
  geogebra: { title: "GeoGebra", url: "https://www.geogebra.org", what: "Interactive geometry, algebra and probability." },
  figma: { title: "Figma", url: "https://www.figma.com", what: "Design and prototype screens (free starter plan)." },
  anki: { title: "Anki", url: "https://apps.ankiweb.net", what: "Spaced-repetition flashcards for theory you must remember." },
} satisfies Record<string, Lab>;

const BY_SKILL: Record<string, Lab[]> = {
  "Data Structures & Algorithms": [L.visualgo, L.pythonTutor],
  Python: [L.pythonTutor, L.colab], Java: [L.pythonTutor, L.cs50], C: [L.pythonTutor, L.cs50], "C++": [L.pythonTutor, L.visualgo],
  JavaScript: [L.pythonTutor, L.codepen], TypeScript: [L.stackblitz], HTML: [L.codepen], CSS: [L.flexbox, L.grid],
  React: [L.stackblitz], "Node.js": [L.stackblitz], Angular: [L.stackblitz], Vue: [L.stackblitz], "Next.js": [L.stackblitz],
  SQL: [L.sqlMystery], DBMS: [L.sqlMystery, L.anki], PostgreSQL: [L.sqlMystery], Git: [L.gitBranching],
  Linux: [L.bandit, L.killercoda], Bash: [L.bandit, L.killercoda], Docker: [L.killercoda], Kubernetes: [L.killercoda], "CI/CD": [L.killercoda],
  Networking: [L.packetTracer, L.wireshark], "Computer Networks": [L.packetTracer, L.wireshark, L.anki],
  "Web Security": [L.portswigger, L.pico], Cryptography: [L.pico], Security: [L.portswigger], "AI Security": [L.portswigger, L.aiStudio],
  "Operating Systems": [L.killercoda, L.anki], OOP: [L.pythonTutor],
  "Machine Learning": [L.tfPlayground, L.colab, L.kaggle], "Deep Learning": [L.tfPlayground, L.colab], Statistics: [L.desmos, L.colab],
  Pandas: [L.kaggle, L.colab], "Data Visualization": [L.kaggle], OpenCV: [L.colab, L.teachable],
  "LLMs & Prompting": [L.aiStudio, L.hfSpaces], "Prompt & Context Engineering": [L.aiStudio], "AI Literacy": [L.teachable, L.aiStudio],
  "RAG & Vector Databases": [L.colab, L.hfSpaces], "AI Agents & MCP": [L.aiStudio, L.hfSpaces], "LLM Evaluation": [L.colab, L.aiStudio],
  "Embedded & IoT": [L.wokwi, L.tinkercad], "UI Design": [L.figma], Figma: [L.figma],
  "Quantitative Aptitude": [L.desmos, L.geogebra], "Logical Reasoning": [L.geogebra],
};

/** Labs for a skill; falls back to general tools so every skill has something hands-on. */
export function labsFor(skill: string): Lab[] {
  return BY_SKILL[skill] ?? [L.anki];
}

export const ALL_LABS: Lab[] = Object.values(L);
