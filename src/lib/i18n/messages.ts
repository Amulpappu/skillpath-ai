/**
 * Interface strings. English is the source; every other language must provide the same keys
 * (TypeScript enforces it). Translations should be reviewed by a native speaker before launch.
 */
const en = {
  "brand.tagline": "Your career, planned by AI agents and proved by practice",
  "nav.dashboard": "Dashboard",
  "nav.roadmap": "Roadmap",
  "nav.practice": "Coding practice",
  "nav.assessments": "Assessments",
  "nav.company": "Company prep",
  "nav.jobs": "Jobs",
  "nav.courses": "Free courses",
  "nav.progress": "Progress",
  "nav.settings": "Settings",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.language": "Language",
  "landing.title": "From where you are to the job you want",
  "landing.lead":
    "SkillPath AI reads your skills, matches you to roles worldwide, builds a week-by-week plan, tests you, prepares you for your dream company's hiring rounds and finds open jobs for you.",
  "landing.cta": "Start for free",
  "landing.guest": "Try without an account",
  "landing.stat.roles": "career roles",
  "landing.stat.skills": "skills and languages",
  "landing.stat.agents": "AI agents",
  "landing.stat.questions": "questions per skill",
  "login.title": "Sign in to SkillPath AI",
  "login.lead": "Your roadmap, scores and practice progress are saved to your account.",
  "login.continueWith": "Continue with",
  "login.failed": "Sign-in didn't work. Please try again.",
  "login.disabled": "Sign-in is not set up on this server yet. You can still use the planner as a guest.",
  "login.terms": "By continuing you agree to use SkillPath AI fairly and keep your account secure.",
  "agents.title": "Agent activity",
  "agents.running": "Running",
  "agents.idle": "Idle",
} as const;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const hi: Messages = {
  "brand.tagline": "आपका करियर, AI एजेंटों द्वारा योजनाबद्ध और अभ्यास से सिद्ध",
  "nav.dashboard": "डैशबोर्ड", "nav.roadmap": "रोडमैप", "nav.practice": "कोडिंग अभ्यास", "nav.assessments": "मूल्यांकन",
  "nav.company": "कंपनी तैयारी", "nav.jobs": "नौकरियाँ", "nav.courses": "मुफ़्त कोर्स", "nav.progress": "प्रगति",
  "nav.settings": "सेटिंग्स", "nav.signIn": "साइन इन", "nav.signOut": "साइन आउट", "nav.language": "भाषा",
  "landing.title": "जहाँ आप हैं, वहाँ से उस नौकरी तक जो आप चाहते हैं",
  "landing.lead": "SkillPath AI आपके कौशल पढ़ता है, दुनिया भर की भूमिकाओं से मिलान करता है, सप्ताह-दर-सप्ताह योजना बनाता है, आपकी परीक्षा लेता है, आपकी पसंदीदा कंपनी की भर्ती के लिए तैयार करता है और आपके लिए खुली नौकरियाँ ढूँढता है।",
  "landing.cta": "मुफ़्त में शुरू करें", "landing.guest": "बिना खाते के आज़माएँ",
  "landing.stat.roles": "करियर भूमिकाएँ", "landing.stat.skills": "कौशल और भाषाएँ", "landing.stat.agents": "AI एजेंट", "landing.stat.questions": "प्रश्न प्रति कौशल",
  "login.title": "SkillPath AI में साइन इन करें", "login.lead": "आपका रोडमैप, स्कोर और अभ्यास प्रगति आपके खाते में सहेजे जाते हैं।",
  "login.continueWith": "इसके साथ जारी रखें:", "login.failed": "साइन इन नहीं हुआ। कृपया फिर से प्रयास करें।",
  "login.disabled": "इस सर्वर पर साइन इन अभी सेट नहीं है। आप अतिथि के रूप में प्लानर का उपयोग कर सकते हैं।",
  "login.terms": "जारी रखकर आप SkillPath AI का उचित उपयोग करने और अपना खाता सुरक्षित रखने के लिए सहमत हैं।",
  "agents.title": "एजेंट गतिविधि", "agents.running": "चल रहा है", "agents.idle": "निष्क्रिय",
};

const ta: Messages = {
  "brand.tagline": "உங்கள் தொழில், AI முகவர்களால் திட்டமிடப்பட்டு பயிற்சியால் நிரூபிக்கப்படுகிறது",
  "nav.dashboard": "டாஷ்போர்டு", "nav.roadmap": "கற்றல் வரைபடம்", "nav.practice": "கோடிங் பயிற்சி", "nav.assessments": "மதிப்பீடுகள்",
  "nav.company": "நிறுவனத் தயாரிப்பு", "nav.jobs": "வேலைகள்", "nav.courses": "இலவச படிப்புகள்", "nav.progress": "முன்னேற்றம்",
  "nav.settings": "அமைப்புகள்", "nav.signIn": "உள்நுழை", "nav.signOut": "வெளியேறு", "nav.language": "மொழி",
  "landing.title": "நீங்கள் இருக்கும் இடத்திலிருந்து நீங்கள் விரும்பும் வேலை வரை",
  "landing.lead": "SkillPath AI உங்கள் திறன்களைப் படிக்கிறது, உலகளாவிய பணிகளுடன் பொருத்துகிறது, வாரந்தோறும் திட்டம் தயாரிக்கிறது, உங்களைச் சோதிக்கிறது, உங்கள் கனவு நிறுவனத்தின் தேர்வுச் சுற்றுகளுக்குத் தயார்படுத்துகிறது, உங்களுக்கான வேலைகளைக் கண்டறிகிறது.",
  "landing.cta": "இலவசமாகத் தொடங்கு", "landing.guest": "கணக்கு இல்லாமல் முயற்சிக்கவும்",
  "landing.stat.roles": "தொழில் பணிகள்", "landing.stat.skills": "திறன்கள் மற்றும் மொழிகள்", "landing.stat.agents": "AI முகவர்கள்", "landing.stat.questions": "ஒரு திறனுக்கான கேள்விகள்",
  "login.title": "SkillPath AI-இல் உள்நுழையவும்", "login.lead": "உங்கள் வரைபடம், மதிப்பெண்கள் மற்றும் பயிற்சி முன்னேற்றம் உங்கள் கணக்கில் சேமிக்கப்படும்.",
  "login.continueWith": "இதன் மூலம் தொடரவும்:", "login.failed": "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
  "login.disabled": "இந்த சர்வரில் உள்நுழைவு இன்னும் அமைக்கப்படவில்லை. விருந்தினராக திட்டமிடலைப் பயன்படுத்தலாம்.",
  "login.terms": "தொடர்வதன் மூலம் SkillPath AI-ஐ நியாயமாகப் பயன்படுத்தவும் உங்கள் கணக்கைப் பாதுகாப்பாக வைத்திருக்கவும் ஒப்புக்கொள்கிறீர்கள்.",
  "agents.title": "முகவர் செயல்பாடு", "agents.running": "இயங்குகிறது", "agents.idle": "செயலற்றது",
};

const te: Messages = {
  "brand.tagline": "మీ కెరీర్, AI ఏజెంట్లు ప్లాన్ చేసి సాధనతో నిరూపించినది",
  "nav.dashboard": "డాష్‌బోర్డ్", "nav.roadmap": "రోడ్‌మ్యాప్", "nav.practice": "కోడింగ్ సాధన", "nav.assessments": "అంచనాలు",
  "nav.company": "కంపెనీ సన్నద్ధత", "nav.jobs": "ఉద్యోగాలు", "nav.courses": "ఉచిత కోర్సులు", "nav.progress": "పురోగతి",
  "nav.settings": "సెట్టింగ్‌లు", "nav.signIn": "సైన్ ఇన్", "nav.signOut": "సైన్ అవుట్", "nav.language": "భాష",
  "landing.title": "మీరు ఉన్న చోటు నుండి మీకు కావలసిన ఉద్యోగం వరకు",
  "landing.lead": "SkillPath AI మీ నైపుణ్యాలను చదివి, ప్రపంచవ్యాప్త పాత్రలతో సరిపోల్చి, వారం వారీ ప్రణాళిక రూపొందించి, మిమ్మల్ని పరీక్షించి, మీ కలల కంపెనీ నియామక రౌండ్లకు సిద్ధం చేసి, మీ కోసం ఖాళీ ఉద్యోగాలను కనుగొంటుంది.",
  "landing.cta": "ఉచితంగా ప్రారంభించండి", "landing.guest": "ఖాతా లేకుండా ప్రయత్నించండి",
  "landing.stat.roles": "కెరీర్ పాత్రలు", "landing.stat.skills": "నైపుణ్యాలు మరియు భాషలు", "landing.stat.agents": "AI ఏజెంట్లు", "landing.stat.questions": "ప్రతి నైపుణ్యానికి ప్రశ్నలు",
  "login.title": "SkillPath AI లో సైన్ ఇన్ చేయండి", "login.lead": "మీ రోడ్‌మ్యాప్, స్కోర్లు మరియు సాధన పురోగతి మీ ఖాతాలో సేవ్ అవుతాయి.",
  "login.continueWith": "దీనితో కొనసాగండి:", "login.failed": "సైన్ ఇన్ కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
  "login.disabled": "ఈ సర్వర్‌లో సైన్ ఇన్ ఇంకా సెటప్ కాలేదు. మీరు అతిథిగా ప్లానర్‌ను ఉపయోగించవచ్చు.",
  "login.terms": "కొనసాగడం ద్వారా SkillPath AI ని న్యాయంగా ఉపయోగించడానికి మరియు మీ ఖాతాను సురక్షితంగా ఉంచడానికి మీరు అంగీకరిస్తున్నారు.",
  "agents.title": "ఏజెంట్ కార్యాచరణ", "agents.running": "నడుస్తోంది", "agents.idle": "నిష్క్రియం",
};

const kn: Messages = {
  "brand.tagline": "ನಿಮ್ಮ ವೃತ್ತಿ, AI ಏಜೆಂಟ್‌ಗಳು ಯೋಜಿಸಿ ಅಭ್ಯಾಸದಿಂದ ಸಾಬೀತುಪಡಿಸಿದ್ದು",
  "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.roadmap": "ರೋಡ್‌ಮ್ಯಾಪ್", "nav.practice": "ಕೋಡಿಂಗ್ ಅಭ್ಯಾಸ", "nav.assessments": "ಮೌಲ್ಯಮಾಪನಗಳು",
  "nav.company": "ಕಂಪನಿ ತಯಾರಿ", "nav.jobs": "ಉದ್ಯೋಗಗಳು", "nav.courses": "ಉಚಿತ ಕೋರ್ಸ್‌ಗಳು", "nav.progress": "ಪ್ರಗತಿ",
  "nav.settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "nav.signIn": "ಸೈನ್ ಇನ್", "nav.signOut": "ಸೈನ್ ಔಟ್", "nav.language": "ಭಾಷೆ",
  "landing.title": "ನೀವು ಇರುವಲ್ಲಿಂದ ನೀವು ಬಯಸುವ ಉದ್ಯೋಗದವರೆಗೆ",
  "landing.lead": "SkillPath AI ನಿಮ್ಮ ಕೌಶಲಗಳನ್ನು ಓದಿ, ಜಾಗತಿಕ ಹುದ್ದೆಗಳಿಗೆ ಹೊಂದಿಸಿ, ವಾರವಾರು ಯೋಜನೆ ರೂಪಿಸಿ, ನಿಮ್ಮನ್ನು ಪರೀಕ್ಷಿಸಿ, ನಿಮ್ಮ ಕನಸಿನ ಕಂಪನಿಯ ನೇಮಕಾತಿ ಸುತ್ತುಗಳಿಗೆ ಸಿದ್ಧಪಡಿಸಿ, ನಿಮಗಾಗಿ ಖಾಲಿ ಉದ್ಯೋಗಗಳನ್ನು ಹುಡುಕುತ್ತದೆ.",
  "landing.cta": "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ", "landing.guest": "ಖಾತೆ ಇಲ್ಲದೆ ಪ್ರಯತ್ನಿಸಿ",
  "landing.stat.roles": "ವೃತ್ತಿ ಹುದ್ದೆಗಳು", "landing.stat.skills": "ಕೌಶಲಗಳು ಮತ್ತು ಭಾಷೆಗಳು", "landing.stat.agents": "AI ಏಜೆಂಟ್‌ಗಳು", "landing.stat.questions": "ಪ್ರತಿ ಕೌಶಲಕ್ಕೆ ಪ್ರಶ್ನೆಗಳು",
  "login.title": "SkillPath AI ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ", "login.lead": "ನಿಮ್ಮ ರೋಡ್‌ಮ್ಯಾಪ್, ಅಂಕಗಳು ಮತ್ತು ಅಭ್ಯಾಸದ ಪ್ರಗತಿ ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಉಳಿಯುತ್ತವೆ.",
  "login.continueWith": "ಇದರೊಂದಿಗೆ ಮುಂದುವರಿಸಿ:", "login.failed": "ಸೈನ್ ಇನ್ ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  "login.disabled": "ಈ ಸರ್ವರ್‌ನಲ್ಲಿ ಸೈನ್ ಇನ್ ಇನ್ನೂ ಹೊಂದಿಸಿಲ್ಲ. ನೀವು ಅತಿಥಿಯಾಗಿ ಯೋಜಕವನ್ನು ಬಳಸಬಹುದು.",
  "login.terms": "ಮುಂದುವರಿಯುವ ಮೂಲಕ SkillPath AI ಅನ್ನು ನ್ಯಾಯವಾಗಿ ಬಳಸಲು ಮತ್ತು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ.",
  "agents.title": "ಏಜೆಂಟ್ ಚಟುವಟಿಕೆ", "agents.running": "ಚಾಲನೆಯಲ್ಲಿದೆ", "agents.idle": "ನಿಷ್ಕ್ರಿಯ",
};

const ml: Messages = {
  "brand.tagline": "നിങ്ങളുടെ കരിയർ, AI ഏജന്റുകൾ ആസൂത്രണം ചെയ്ത് പരിശീലനത്തിലൂടെ തെളിയിച്ചത്",
  "nav.dashboard": "ഡാഷ്‌ബോർഡ്", "nav.roadmap": "റോഡ്‌മാപ്പ്", "nav.practice": "കോഡിംഗ് പരിശീലനം", "nav.assessments": "വിലയിരുത്തലുകൾ",
  "nav.company": "കമ്പനി തയ്യാറെടുപ്പ്", "nav.jobs": "ജോലികൾ", "nav.courses": "സൗജന്യ കോഴ്സുകൾ", "nav.progress": "പുരോഗതി",
  "nav.settings": "ക്രമീകരണങ്ങൾ", "nav.signIn": "സൈൻ ഇൻ", "nav.signOut": "സൈൻ ഔട്ട്", "nav.language": "ഭാഷ",
  "landing.title": "നിങ്ങൾ ഇപ്പോൾ ഉള്ളിടത്ത് നിന്ന് നിങ്ങൾ ആഗ്രഹിക്കുന്ന ജോലിയിലേക്ക്",
  "landing.lead": "SkillPath AI നിങ്ങളുടെ കഴിവുകൾ വായിച്ച്, ലോകമെമ്പാടുമുള്ള റോളുകളുമായി പൊരുത്തപ്പെടുത്തി, ആഴ്ചതോറുമുള്ള പദ്ധതി തയ്യാറാക്കി, നിങ്ങളെ പരീക്ഷിച്ച്, സ്വപ്ന കമ്പനിയുടെ റിക്രൂട്ട്മെന്റ് റൗണ്ടുകൾക്ക് ഒരുക്കി, നിങ്ങൾക്കായി ഒഴിവുള്ള ജോലികൾ കണ്ടെത്തുന്നു.",
  "landing.cta": "സൗജന്യമായി ആരംഭിക്കുക", "landing.guest": "അക്കൗണ്ട് ഇല്ലാതെ പരീക്ഷിക്കുക",
  "landing.stat.roles": "കരിയർ റോളുകൾ", "landing.stat.skills": "കഴിവുകളും ഭാഷകളും", "landing.stat.agents": "AI ഏജന്റുകൾ", "landing.stat.questions": "ഓരോ കഴിവിനും ചോദ്യങ്ങൾ",
  "login.title": "SkillPath AI-ൽ സൈൻ ഇൻ ചെയ്യുക", "login.lead": "നിങ്ങളുടെ റോഡ്‌മാപ്പ്, സ്കോറുകൾ, പരിശീലന പുരോഗതി എന്നിവ നിങ്ങളുടെ അക്കൗണ്ടിൽ സൂക്ഷിക്കും.",
  "login.continueWith": "ഇതുപയോഗിച്ച് തുടരുക:", "login.failed": "സൈൻ ഇൻ പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.",
  "login.disabled": "ഈ സെർവറിൽ സൈൻ ഇൻ ഇതുവരെ സജ്ജമാക്കിയിട്ടില്ല. അതിഥിയായി പ്ലാനർ ഉപയോഗിക്കാം.",
  "login.terms": "തുടരുന്നതിലൂടെ SkillPath AI ന്യായമായി ഉപയോഗിക്കാനും അക്കൗണ്ട് സുരക്ഷിതമായി സൂക്ഷിക്കാനും നിങ്ങൾ സമ്മതിക്കുന്നു.",
  "agents.title": "ഏജന്റ് പ്രവർത്തനം", "agents.running": "പ്രവർത്തിക്കുന്നു", "agents.idle": "നിഷ്ക്രിയം",
};

const es: Messages = {
  "brand.tagline": "Tu carrera, planificada por agentes de IA y demostrada con práctica",
  "nav.dashboard": "Panel", "nav.roadmap": "Ruta", "nav.practice": "Práctica de código", "nav.assessments": "Evaluaciones",
  "nav.company": "Preparación por empresa", "nav.jobs": "Empleos", "nav.courses": "Cursos gratuitos", "nav.progress": "Progreso",
  "nav.settings": "Ajustes", "nav.signIn": "Iniciar sesión", "nav.signOut": "Cerrar sesión", "nav.language": "Idioma",
  "landing.title": "De donde estás al trabajo que quieres",
  "landing.lead": "SkillPath AI analiza tus habilidades, te compara con puestos de todo el mundo, crea un plan semana a semana, te evalúa, te prepara para los procesos de selección de la empresa de tus sueños y encuentra empleos abiertos para ti.",
  "landing.cta": "Empieza gratis", "landing.guest": "Probar sin cuenta",
  "landing.stat.roles": "puestos profesionales", "landing.stat.skills": "habilidades y lenguajes", "landing.stat.agents": "agentes de IA", "landing.stat.questions": "preguntas por habilidad",
  "login.title": "Inicia sesión en SkillPath AI", "login.lead": "Tu ruta, tus resultados y tu práctica se guardan en tu cuenta.",
  "login.continueWith": "Continuar con", "login.failed": "No se pudo iniciar sesión. Inténtalo de nuevo.",
  "login.disabled": "El inicio de sesión aún no está configurado en este servidor. Puedes usar el planificador como invitado.",
  "login.terms": "Al continuar aceptas usar SkillPath AI de forma justa y mantener tu cuenta segura.",
  "agents.title": "Actividad de los agentes", "agents.running": "En curso", "agents.idle": "Inactivo",
};

const fr: Messages = {
  "brand.tagline": "Votre carrière, planifiée par des agents IA et prouvée par la pratique",
  "nav.dashboard": "Tableau de bord", "nav.roadmap": "Parcours", "nav.practice": "Pratique du code", "nav.assessments": "Évaluations",
  "nav.company": "Préparation entreprise", "nav.jobs": "Offres d'emploi", "nav.courses": "Cours gratuits", "nav.progress": "Progression",
  "nav.settings": "Paramètres", "nav.signIn": "Se connecter", "nav.signOut": "Se déconnecter", "nav.language": "Langue",
  "landing.title": "De là où vous êtes jusqu'au poste que vous visez",
  "landing.lead": "SkillPath AI analyse vos compétences, vous associe à des métiers dans le monde entier, construit un plan semaine par semaine, vous évalue, vous prépare aux recrutements de l'entreprise de vos rêves et trouve des offres pour vous.",
  "landing.cta": "Commencer gratuitement", "landing.guest": "Essayer sans compte",
  "landing.stat.roles": "métiers", "landing.stat.skills": "compétences et langages", "landing.stat.agents": "agents IA", "landing.stat.questions": "questions par compétence",
  "login.title": "Connexion à SkillPath AI", "login.lead": "Votre parcours, vos scores et votre progression sont enregistrés dans votre compte.",
  "login.continueWith": "Continuer avec", "login.failed": "La connexion a échoué. Veuillez réessayer.",
  "login.disabled": "La connexion n'est pas encore configurée sur ce serveur. Vous pouvez utiliser le planificateur en invité.",
  "login.terms": "En continuant, vous acceptez d'utiliser SkillPath AI de manière loyale et de protéger votre compte.",
  "agents.title": "Activité des agents", "agents.running": "En cours", "agents.idle": "Inactif",
};

const de: Messages = {
  "brand.tagline": "Deine Karriere, von KI-Agenten geplant und durch Übung bewiesen",
  "nav.dashboard": "Übersicht", "nav.roadmap": "Lernpfad", "nav.practice": "Programmierübungen", "nav.assessments": "Tests",
  "nav.company": "Firmenvorbereitung", "nav.jobs": "Jobs", "nav.courses": "Kostenlose Kurse", "nav.progress": "Fortschritt",
  "nav.settings": "Einstellungen", "nav.signIn": "Anmelden", "nav.signOut": "Abmelden", "nav.language": "Sprache",
  "landing.title": "Von deinem Stand zum Job, den du willst",
  "landing.lead": "SkillPath AI liest deine Fähigkeiten, gleicht sie mit Rollen weltweit ab, erstellt einen Wochenplan, prüft dich, bereitet dich auf die Auswahlrunden deiner Wunschfirma vor und findet offene Stellen für dich.",
  "landing.cta": "Kostenlos starten", "landing.guest": "Ohne Konto ausprobieren",
  "landing.stat.roles": "Berufsrollen", "landing.stat.skills": "Fähigkeiten und Sprachen", "landing.stat.agents": "KI-Agenten", "landing.stat.questions": "Fragen pro Fähigkeit",
  "login.title": "Bei SkillPath AI anmelden", "login.lead": "Lernpfad, Ergebnisse und Übungsfortschritt werden in deinem Konto gespeichert.",
  "login.continueWith": "Weiter mit", "login.failed": "Die Anmeldung hat nicht geklappt. Bitte versuche es erneut.",
  "login.disabled": "Die Anmeldung ist auf diesem Server noch nicht eingerichtet. Du kannst den Planer als Gast nutzen.",
  "login.terms": "Wenn du fortfährst, nutzt du SkillPath AI fair und hältst dein Konto sicher.",
  "agents.title": "Agentenaktivität", "agents.running": "Läuft", "agents.idle": "Bereit",
};

const pt: Messages = {
  "brand.tagline": "Sua carreira, planejada por agentes de IA e comprovada na prática",
  "nav.dashboard": "Painel", "nav.roadmap": "Trilha", "nav.practice": "Prática de código", "nav.assessments": "Avaliações",
  "nav.company": "Preparação por empresa", "nav.jobs": "Vagas", "nav.courses": "Cursos gratuitos", "nav.progress": "Progresso",
  "nav.settings": "Configurações", "nav.signIn": "Entrar", "nav.signOut": "Sair", "nav.language": "Idioma",
  "landing.title": "De onde você está até o emprego que você quer",
  "landing.lead": "O SkillPath AI lê suas habilidades, combina você com cargos no mundo todo, monta um plano semana a semana, avalia você, prepara para as etapas de seleção da empresa dos seus sonhos e encontra vagas abertas para você.",
  "landing.cta": "Começar grátis", "landing.guest": "Experimentar sem conta",
  "landing.stat.roles": "cargos", "landing.stat.skills": "habilidades e linguagens", "landing.stat.agents": "agentes de IA", "landing.stat.questions": "perguntas por habilidade",
  "login.title": "Entrar no SkillPath AI", "login.lead": "Sua trilha, notas e progresso ficam salvos na sua conta.",
  "login.continueWith": "Continuar com", "login.failed": "Não foi possível entrar. Tente novamente.",
  "login.disabled": "O login ainda não está configurado neste servidor. Você pode usar o planejador como convidado.",
  "login.terms": "Ao continuar, você concorda em usar o SkillPath AI de forma justa e manter sua conta segura.",
  "agents.title": "Atividade dos agentes", "agents.running": "Em execução", "agents.idle": "Ocioso",
};

const ar: Messages = {
  "brand.tagline": "مسيرتك المهنية، يخطّطها وكلاء الذكاء الاصطناعي وتثبتها الممارسة",
  "nav.dashboard": "لوحة التحكم", "nav.roadmap": "خطة التعلّم", "nav.practice": "تمارين البرمجة", "nav.assessments": "الاختبارات",
  "nav.company": "التحضير للشركات", "nav.jobs": "الوظائف", "nav.courses": "دورات مجانية", "nav.progress": "التقدّم",
  "nav.settings": "الإعدادات", "nav.signIn": "تسجيل الدخول", "nav.signOut": "تسجيل الخروج", "nav.language": "اللغة",
  "landing.title": "من حيث أنت إلى الوظيفة التي تريدها",
  "landing.lead": "يقرأ SkillPath AI مهاراتك، ويطابقك مع وظائف حول العالم، ويبني خطة أسبوعية، ويختبرك، ويجهّزك لمراحل التوظيف في شركة أحلامك، ويجد لك وظائف متاحة.",
  "landing.cta": "ابدأ مجانًا", "landing.guest": "جرّب دون حساب",
  "landing.stat.roles": "مسارًا مهنيًا", "landing.stat.skills": "مهارة ولغة", "landing.stat.agents": "وكيل ذكاء اصطناعي", "landing.stat.questions": "سؤالًا لكل مهارة",
  "login.title": "تسجيل الدخول إلى SkillPath AI", "login.lead": "تُحفظ خطتك ونتائجك وتقدّمك في حسابك.",
  "login.continueWith": "المتابعة باستخدام", "login.failed": "تعذّر تسجيل الدخول. حاول مرة أخرى.",
  "login.disabled": "لم يتم إعداد تسجيل الدخول على هذا الخادم بعد. يمكنك استخدام المخطِّط كزائر.",
  "login.terms": "بالمتابعة، توافق على استخدام SkillPath AI بإنصاف والحفاظ على أمان حسابك.",
  "agents.title": "نشاط الوكلاء", "agents.running": "قيد التشغيل", "agents.idle": "خامل",
};

const zh: Messages = {
  "brand.tagline": "你的职业规划，由 AI 智能体制定，用练习来验证",
  "nav.dashboard": "概览", "nav.roadmap": "学习路线", "nav.practice": "编程练习", "nav.assessments": "测评",
  "nav.company": "企业备考", "nav.jobs": "职位", "nav.courses": "免费课程", "nav.progress": "进度",
  "nav.settings": "设置", "nav.signIn": "登录", "nav.signOut": "退出登录", "nav.language": "语言",
  "landing.title": "从现在的你，到你想要的工作",
  "landing.lead": "SkillPath AI 分析你的技能，匹配全球职位，制定每周计划，进行测评，帮你准备梦想公司的招聘环节，并为你寻找在招职位。",
  "landing.cta": "免费开始", "landing.guest": "无需账号试用",
  "landing.stat.roles": "个职业方向", "landing.stat.skills": "项技能与编程语言", "landing.stat.agents": "个 AI 智能体", "landing.stat.questions": "道题 / 每项技能",
  "login.title": "登录 SkillPath AI", "login.lead": "你的学习路线、成绩和练习进度都会保存在账号中。",
  "login.continueWith": "使用以下方式继续：", "login.failed": "登录失败，请重试。",
  "login.disabled": "此服务器尚未配置登录。你仍可以访客身份使用规划工具。",
  "login.terms": "继续即表示你同意合理使用 SkillPath AI 并妥善保护账号安全。",
  "agents.title": "智能体动态", "agents.running": "运行中", "agents.idle": "空闲",
};

export const LOCALES = {
  en: { name: "English", dir: "ltr", messages: en },
  hi: { name: "हिन्दी", dir: "ltr", messages: hi },
  ta: { name: "தமிழ்", dir: "ltr", messages: ta },
  te: { name: "తెలుగు", dir: "ltr", messages: te },
  kn: { name: "ಕನ್ನಡ", dir: "ltr", messages: kn },
  ml: { name: "മലയാളം", dir: "ltr", messages: ml },
  es: { name: "Español", dir: "ltr", messages: es },
  fr: { name: "Français", dir: "ltr", messages: fr },
  de: { name: "Deutsch", dir: "ltr", messages: de },
  pt: { name: "Português", dir: "ltr", messages: pt },
  ar: { name: "العربية", dir: "rtl", messages: ar },
  zh: { name: "中文", dir: "ltr", messages: zh },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = "en";
export const isLocale = (v: unknown): v is Locale => typeof v === "string" && v in LOCALES;
