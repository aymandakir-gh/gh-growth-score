// ─────────────────────────────────────────────────────────────────────────────
// Growth-Health-Score · i18n Translation Dictionary
// 9 P1 languages: EN, AR (RTL), IT, NL, ZH, ES, FR, DE, PT-BR
// Namespaces: quiz.* | results.* | stage.* | nav.*
// ─────────────────────────────────────────────────────────────────────────────

export type Locale = "en" | "ar" | "it" | "nl" | "zh" | "es" | "fr" | "de" | "pt-br";

export const RTL_LOCALES: Locale[] = ["ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  it: "Italiano",
  nl: "Nederlands",
  zh: "中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  "pt-br": "Português (BR)",
};

export type TranslationDict = Record<string, string>;

const en: TranslationDict = {
  // ── Nav ──────────────────────────────────────────────────────────────────
  "nav.title": "Growth Health Score",
  "nav.openSource": "Open source · MIT",

  // ── Quiz — intro page ────────────────────────────────────────────────────
  "quiz.badge": "Free Growth Audit",
  "quiz.hero.title1": "What's Your Growth",
  "quiz.hero.title2": "Health Score?",
  "quiz.hero.subtitle":
    "Answer 15 diagnostic questions across the 5 AARRR stages. Get a 0–100 score per stage, identify your top bottlenecks, and receive 3 ICE-prioritized experiments to fix them.",
  "quiz.feature.stageScores": "Stage Scores",
  "quiz.feature.stageScores.desc": "0–100 score for each of the 5 AARRR stages",
  "quiz.feature.bottleneck": "Bottleneck Analysis",
  "quiz.feature.bottleneck.desc": "Top 3 weakest stages ranked by impact",
  "quiz.feature.experiments": "ICE Experiments",
  "quiz.feature.experiments.desc": "3 prioritized experiments targeted at your gaps",
  "quiz.howItWorks": "How it works",
  "quiz.step1.label": "Answer 15 questions",
  "quiz.step1.desc": "One per AARRR stage — takes ~3 min",
  "quiz.step2.label": "Get your AARRR score",
  "quiz.step2.desc": "0–100 per stage, weighted overall",
  "quiz.step3.label": "See your roadmap",
  "quiz.step3.desc": "Bottlenecks + 3 ICE experiments to fix them",
  "quiz.cta": "Start Free Audit →",
  "quiz.cta.note": "Takes ~3 minutes · No signup required · 100% free",
  "quiz.back": "← Back",
  "quiz.question.counter": "Question {current} of {total}",

  // ── Stage labels (mirrors scoring.ts STAGE_CONFIGS) ──────────────────────
  "stage.acquisition": "Acquisition",
  "stage.activation": "Activation",
  "stage.retention": "Retention",
  "stage.revenue": "Revenue",
  "stage.referral": "Referral",
  "stage.acquisition.desc": "How well you attract new visitors and leads",
  "stage.activation.desc": "How quickly new users reach their first 'aha moment'",
  "stage.retention.desc": "How well you keep users coming back over time",
  "stage.revenue.desc": "How effectively you monetize your user base",
  "stage.referral.desc": "How much your users spread the word organically",

  // ── Results ──────────────────────────────────────────────────────────────
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Stage Breakdown",
  "results.stageBreakdown.desc":
    "Weighted contributions to your overall score. Red stages are your primary bottlenecks.",
  "results.bottlenecks.title": "Your Top {count} Bottlenecks",
  "results.bottlenecks.desc":
    "These stages are dragging down your overall score. Focus here first.",
  "results.experiments.title": "Your Top 3 Experiments",
  "results.experiments.desc":
    "ICE-prioritized (Impact × Confidence / Effort). Higher score = run this first.",
  "results.legend.critical": "Critical (<40)",
  "results.legend.needsWork": "Needs work (40-69)",
  "results.legend.good": "Good (70-84)",
  "results.legend.excellent": "Excellent (85+)",
  "results.footer.oss": "This tool is free and open-source.",
  "results.footer.fork": "Fork it on GitHub",
  "results.footer.questions": "Questions?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Your action playbook",
  "playbook.desc":
    "Concrete tactics for your weakest stages — what to do, the steps, and what to measure. Export it and run it.",
  "playbook.copy": "Copy playbook",
  "playbook.copied": "Copied!",
  "playbook.download": "Download .md",
  "playbook.measure": "Measure",
  "embed.poweredBy": "Powered by Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "How you compare",
  "results.compare.overall": "Overall",
  "results.shared.title": "You're viewing a shared result.",
  "results.shared.desc": "Curious how your own growth engine scores?",
  "results.shared.cta": "Take the free audit →",
  "share.title": "Share your score",
  "share.desc": "Your results are encoded in the URL — no account needed to share.",
  "results.compare.industry": "Industry",
};

const ar: TranslationDict = {
  "nav.title": "نقاط صحة النمو",
  "nav.openSource": "مفتوح المصدر · MIT",

  "quiz.badge": "تدقيق النمو المجاني",
  "quiz.hero.title1": "ما هي درجة",
  "quiz.hero.title2": "صحة نموك؟",
  "quiz.hero.subtitle":
    "أجب على 15 سؤالاً تشخيصياً عبر مراحل AARRR الخمس. احصل على درجة 0–100 لكل مرحلة، حدد أبرز عوائقك، واحصل على 3 تجارب ذات أولوية.",
  "quiz.feature.stageScores": "درجات المراحل",
  "quiz.feature.stageScores.desc": "درجة 0–100 لكل مرحلة من المراحل الخمس",
  "quiz.feature.bottleneck": "تحليل العوائق",
  "quiz.feature.bottleneck.desc": "أضعف 3 مراحل مرتبة حسب الأثر",
  "quiz.feature.experiments": "تجارب ICE",
  "quiz.feature.experiments.desc": "3 تجارب ذات أولوية تستهدف نقاط ضعفك",
  "quiz.howItWorks": "كيف يعمل",
  "quiz.step1.label": "أجب على 15 سؤالاً",
  "quiz.step1.desc": "سؤال واحد لكل مرحلة — ~3 دقائق",
  "quiz.step2.label": "احصل على درجة AARRR",
  "quiz.step2.desc": "0–100 لكل مرحلة، مرجّح إجمالياً",
  "quiz.step3.label": "اطّلع على خارطة طريقك",
  "quiz.step3.desc": "العوائق + 3 تجارب ICE لإصلاحها",
  "quiz.cta": "← ابدأ التدقيق المجاني",
  "quiz.cta.note": "~3 دقائق · لا تسجيل مطلوب · مجاني 100٪",
  "quiz.back": "رجوع →",
  "quiz.question.counter": "السؤال {current} من {total}",

  "stage.acquisition": "الاستحواذ",
  "stage.activation": "التفعيل",
  "stage.retention": "الاحتفاظ",
  "stage.revenue": "الإيرادات",
  "stage.referral": "الإحالة",
  "stage.acquisition.desc": "مدى جذبك لزوار ومرشّحين جدد",
  "stage.activation.desc": "مدى سرعة وصول المستخدمين الجدد للقيمة",
  "stage.retention.desc": "مدى الاحتفاظ بعودة المستخدمين",
  "stage.revenue.desc": "مدى فعالية تحقيق الدخل من قاعدة المستخدمين",
  "stage.referral.desc": "مدى نشر المستخدمين لتطبيقك عضوياً",

  "results.badge": "نقاط صحة النمو",
  "results.stageBreakdown": "تفصيل المراحل",
  "results.stageBreakdown.desc":
    "المساهمات المرجّحة في درجتك الإجمالية. المراحل الحمراء هي عوائقك الأساسية.",
  "results.bottlenecks.title": "أبرز {count} عوائقك",
  "results.bottlenecks.desc": "هذه المراحل تسحب درجتك الإجمالية للأسفل. ركّز هنا أولاً.",
  "results.experiments.title": "أفضل 3 تجارب لك",
  "results.experiments.desc":
    "مرتبة بـ ICE (الأثر × الثقة / الجهد). الدرجة الأعلى = ابدأ بها أولاً.",
  "results.legend.critical": "حرج (<40)",
  "results.legend.needsWork": "يحتاج تحسين (40-69)",
  "results.legend.good": "جيد (70-84)",
  "results.legend.excellent": "ممتاز (85+)",
  "results.footer.oss": "هذه الأداة مجانية ومفتوحة المصدر.",
  "results.footer.fork": "انشئ نسخة على GitHub",
  "results.footer.questions": "أسئلة؟",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "كتيّب الإجراءات",
  "playbook.desc":
    "تكتيكات ملموسة لأضعف مراحلك — ماذا تفعل، والخطوات، وما الذي تقيسه. صدّره ونفّذه.",
  "playbook.copy": "نسخ الكتيّب",
  "playbook.copied": "تم النسخ!",
  "playbook.download": "تنزيل .md",
  "playbook.measure": "قِس",
  "embed.poweredBy": "مُشغّل بواسطة Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "كيف تُقارَن",
  "results.compare.overall": "إجمالي",
  "results.shared.title": "أنت تشاهد نتيجة مُشارَكة.",
  "results.shared.desc": "هل تتساءل كيف ستكون نتيجة محرّك نموك؟",
  "results.shared.cta": "ابدأ التدقيق المجاني →",
  "share.title": "شارك نتيجتك",
  "share.desc": "نتائجك مُرمَّزة في الرابط — لا حاجة لحساب للمشاركة.",
  "results.compare.industry": "الصناعة",
};

const it: TranslationDict = {
  "nav.title": "Growth Health Score",
  "nav.openSource": "Open source · MIT",
  "quiz.badge": "Audit gratuito",
  "quiz.hero.title1": "Qual è il tuo",
  "quiz.hero.title2": "Growth Health Score?",
  "quiz.hero.subtitle":
    "Rispondi a 15 domande diagnostiche sui 5 stage AARRR. Ottieni un punteggio 0–100 per stage, identifica i tuoi colli di bottiglia e ricevi 3 esperimenti ICE prioritizzati.",
  "quiz.feature.stageScores": "Punteggi per Stage",
  "quiz.feature.stageScores.desc": "Punteggio 0–100 per ognuno dei 5 stage AARRR",
  "quiz.feature.bottleneck": "Analisi Colli di Bottiglia",
  "quiz.feature.bottleneck.desc": "I 3 stage più deboli classificati per impatto",
  "quiz.feature.experiments": "Esperimenti ICE",
  "quiz.feature.experiments.desc": "3 esperimenti prioritizzati mirati ai tuoi gap",
  "quiz.howItWorks": "Come funziona",
  "quiz.step1.label": "Rispondi a 15 domande",
  "quiz.step1.desc": "Una per stage AARRR — ~3 minuti",
  "quiz.step2.label": "Ottieni il tuo AARRR score",
  "quiz.step2.desc": "0–100 per stage, pesato complessivamente",
  "quiz.step3.label": "Vedi la tua roadmap",
  "quiz.step3.desc": "Colli di bottiglia + 3 esperimenti ICE per risolverli",
  "quiz.cta": "Inizia Audit Gratuito →",
  "quiz.cta.note": "~3 minuti · Nessuna registrazione · 100% gratuito",
  "quiz.back": "← Indietro",
  "quiz.question.counter": "Domanda {current} di {total}",
  "stage.acquisition": "Acquisizione",
  "stage.activation": "Attivazione",
  "stage.retention": "Retention",
  "stage.revenue": "Revenue",
  "stage.referral": "Referral",
  "stage.acquisition.desc": "Quanto bene attiri nuovi visitatori e lead",
  "stage.activation.desc": "Quanto velocemente i nuovi utenti raggiungono il loro 'aha moment'",
  "stage.retention.desc": "Quanto bene mantieni gli utenti nel tempo",
  "stage.revenue.desc": "Quanto efficacemente monetizzi la tua base utenti",
  "stage.referral.desc": "Quanto i tuoi utenti diffondono il prodotto organicamente",
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Dettaglio per Stage",
  "results.stageBreakdown.desc":
    "Contributi pesati al tuo punteggio complessivo. Gli stage in rosso sono i tuoi colli di bottiglia principali.",
  "results.bottlenecks.title": "I tuoi {count} principali colli di bottiglia",
  "results.bottlenecks.desc":
    "Questi stage stanno trascinando il tuo punteggio verso il basso. Concentrati qui prima.",
  "results.experiments.title": "I tuoi 3 esperimenti top",
  "results.experiments.desc":
    "Prioritizzati ICE (Impatto × Confidenza / Sforzo). Punteggio più alto = fallo prima.",
  "results.legend.critical": "Critico (<40)",
  "results.legend.needsWork": "Da migliorare (40-69)",
  "results.legend.good": "Buono (70-84)",
  "results.legend.excellent": "Eccellente (85+)",
  "results.footer.oss": "Questo tool è gratuito e open-source.",
  "results.footer.fork": "Forkalo su GitHub",
  "results.footer.questions": "Domande?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Il tuo piano d'azione",
  "playbook.desc":
    "Tattiche concrete per le fasi più deboli — cosa fare, i passaggi e cosa misurare. Esportalo e mettilo in pratica.",
  "playbook.copy": "Copia il piano",
  "playbook.copied": "Copiato!",
  "playbook.download": "Scarica .md",
  "playbook.measure": "Misura",
  "embed.poweredBy": "Realizzato con Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "Come ti posizioni",
  "results.compare.overall": "Totale",
  "results.shared.title": "Stai visualizzando un risultato condiviso.",
  "results.shared.desc": "Curioso di sapere come va il tuo motore di crescita?",
  "results.shared.cta": "Fai l'audit gratuito →",
  "share.title": "Condividi il tuo punteggio",
  "share.desc": "I tuoi risultati sono codificati nell'URL — nessun account necessario.",
  "results.compare.industry": "Settore",
};

const nl: TranslationDict = {
  "nav.title": "Growth Health Score",
  "nav.openSource": "Open source · MIT",
  "quiz.badge": "Gratis groei-audit",
  "quiz.hero.title1": "Wat is jouw",
  "quiz.hero.title2": "Growth Health Score?",
  "quiz.hero.subtitle":
    "Beantwoord 15 diagnostische vragen over de 5 AARRR-fases. Krijg een 0–100 score per fase, identificeer je grootste knelpunten en ontvang 3 ICE-geprioriteerde experimenten.",
  "quiz.feature.stageScores": "Fase Scores",
  "quiz.feature.stageScores.desc": "0–100 score voor elk van de 5 AARRR-fases",
  "quiz.feature.bottleneck": "Knelpuntanalyse",
  "quiz.feature.bottleneck.desc": "Top 3 zwakste fases gerangschikt op impact",
  "quiz.feature.experiments": "ICE Experimenten",
  "quiz.feature.experiments.desc": "3 geprioriteerde experimenten gericht op jouw zwakke punten",
  "quiz.howItWorks": "Hoe het werkt",
  "quiz.step1.label": "Beantwoord 15 vragen",
  "quiz.step1.desc": "Eén per AARRR-fase — ~3 min",
  "quiz.step2.label": "Krijg jouw AARRR score",
  "quiz.step2.desc": "0–100 per fase, gewogen totaal",
  "quiz.step3.label": "Zie je roadmap",
  "quiz.step3.desc": "Knelpunten + 3 ICE experimenten om ze op te lossen",
  "quiz.cta": "Start Gratis Audit →",
  "quiz.cta.note": "~3 minuten · Geen registratie · 100% gratis",
  "quiz.back": "← Terug",
  "quiz.question.counter": "Vraag {current} van {total}",
  "stage.acquisition": "Acquisitie",
  "stage.activation": "Activatie",
  "stage.retention": "Retentie",
  "stage.revenue": "Omzet",
  "stage.referral": "Verwijzing",
  "stage.acquisition.desc": "Hoe goed je nieuwe bezoekers en leads aantrekt",
  "stage.activation.desc": "Hoe snel nieuwe gebruikers hun 'aha-moment' bereiken",
  "stage.retention.desc": "Hoe goed je gebruikers terugkomen",
  "stage.revenue.desc": "Hoe effectief je je gebruikersbasis monetiseert",
  "stage.referral.desc": "Hoe vaak gebruikers je product organisch aanbevelen",
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Fase Overzicht",
  "results.stageBreakdown.desc":
    "Gewogen bijdragen aan je totale score. Rode fases zijn je primaire knelpunten.",
  "results.bottlenecks.title": "Jouw Top {count} Knelpunten",
  "results.bottlenecks.desc":
    "Deze fases drukken je totale score omlaag. Focus hier eerst op.",
  "results.experiments.title": "Jouw Top 3 Experimenten",
  "results.experiments.desc":
    "ICE-geprioriteerd (Impact × Vertrouwen / Inspanning). Hogere score = voer dit eerst uit.",
  "results.legend.critical": "Kritiek (<40)",
  "results.legend.needsWork": "Verbetering nodig (40-69)",
  "results.legend.good": "Goed (70-84)",
  "results.legend.excellent": "Uitstekend (85+)",
  "results.footer.oss": "Dit tool is gratis en open-source.",
  "results.footer.fork": "Fork het op GitHub",
  "results.footer.questions": "Vragen?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Jouw actieplan",
  "playbook.desc":
    "Concrete tactieken voor je zwakste fasen — wat te doen, de stappen en wat te meten. Exporteer en voer uit.",
  "playbook.copy": "Plan kopiëren",
  "playbook.copied": "Gekopieerd!",
  "playbook.download": ".md downloaden",
  "playbook.measure": "Meet",
  "embed.poweredBy": "Mogelijk gemaakt door Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "Hoe jij scoort",
  "results.compare.overall": "Totaal",
  "results.shared.title": "Je bekijkt een gedeeld resultaat.",
  "results.shared.desc": "Benieuwd hoe jouw groeimotor scoort?",
  "results.shared.cta": "Doe de gratis audit →",
  "share.title": "Deel je score",
  "share.desc": "Je resultaten staan in de URL — geen account nodig om te delen.",
  "results.compare.industry": "Sector",
};

const zh: TranslationDict = {
  "nav.title": "成长健康评分",
  "nav.openSource": "开源 · MIT",
  "quiz.badge": "免费成长审计",
  "quiz.hero.title1": "您的成长",
  "quiz.hero.title2": "健康评分是多少？",
  "quiz.hero.subtitle":
    "回答 5 个 AARRR 阶段的 15 道诊断题。获取每个阶段的 0–100 分，找出主要瓶颈，并获得 3 个 ICE 优先级实验。",
  "quiz.feature.stageScores": "阶段评分",
  "quiz.feature.stageScores.desc": "5 个 AARRR 阶段各自的 0–100 分",
  "quiz.feature.bottleneck": "瓶颈分析",
  "quiz.feature.bottleneck.desc": "按影响力排名的 3 个最薄弱阶段",
  "quiz.feature.experiments": "ICE 实验",
  "quiz.feature.experiments.desc": "针对您弱点的 3 个优先级实验",
  "quiz.howItWorks": "操作步骤",
  "quiz.step1.label": "回答 15 道题",
  "quiz.step1.desc": "每个 AARRR 阶段一题 — 约 3 分钟",
  "quiz.step2.label": "获取 AARRR 评分",
  "quiz.step2.desc": "每阶段 0–100，加权综合",
  "quiz.step3.label": "查看您的路线图",
  "quiz.step3.desc": "瓶颈 + 3 个 ICE 实验来修复它们",
  "quiz.cta": "开始免费审计 →",
  "quiz.cta.note": "约 3 分钟 · 无需注册 · 完全免费",
  "quiz.back": "← 返回",
  "quiz.question.counter": "第 {current} / {total} 题",
  "stage.acquisition": "获客",
  "stage.activation": "激活",
  "stage.retention": "留存",
  "stage.revenue": "营收",
  "stage.referral": "推荐",
  "stage.acquisition.desc": "吸引新访客和潜在客户的能力",
  "stage.activation.desc": "新用户多快体验到首个「啊哈时刻」",
  "stage.retention.desc": "让用户持续回访的能力",
  "stage.revenue.desc": "从用户群中变现的效率",
  "stage.referral.desc": "用户有机传播的程度",
  "results.badge": "成长健康评分",
  "results.stageBreakdown": "阶段分解",
  "results.stageBreakdown.desc":
    "对总分的加权贡献。红色阶段是您的主要瓶颈。",
  "results.bottlenecks.title": "您的 {count} 大瓶颈",
  "results.bottlenecks.desc": "这些阶段正在拉低您的总分。优先解决这里。",
  "results.experiments.title": "您的前 3 个实验",
  "results.experiments.desc":
    "ICE 优先级（影响 × 置信度 / 努力）。分越高 = 越先执行。",
  "results.legend.critical": "严重 (<40)",
  "results.legend.needsWork": "需改进 (40-69)",
  "results.legend.good": "良好 (70-84)",
  "results.legend.excellent": "优秀 (85+)",
  "results.footer.oss": "此工具免费且开源。",
  "results.footer.fork": "在 GitHub 上 Fork",
  "results.footer.questions": "有问题？",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "你的行动手册",
  "playbook.desc":
    "针对最薄弱环节的具体策略——做什么、步骤以及衡量指标。导出并执行。",
  "playbook.copy": "复制手册",
  "playbook.copied": "已复制！",
  "playbook.download": "下载 .md",
  "playbook.measure": "衡量",
  "embed.poweredBy": "由 Growth Health Score 提供 · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "你的对比情况",
  "results.compare.overall": "总体",
  "results.shared.title": "你正在查看一个分享的结果。",
  "results.shared.desc": "想知道你自己的增长引擎得分吗？",
  "results.shared.cta": "免费做测评 →",
  "share.title": "分享你的分数",
  "share.desc": "你的结果已编码在网址中——无需账户即可分享。",
  "results.compare.industry": "行业",
};

const es: TranslationDict = {
  "nav.title": "Growth Health Score",
  "nav.openSource": "Código abierto · MIT",
  "quiz.badge": "Auditoría de crecimiento gratuita",
  "quiz.hero.title1": "¿Cuál es tu",
  "quiz.hero.title2": "Growth Health Score?",
  "quiz.hero.subtitle":
    "Responde 15 preguntas de diagnóstico en los 5 estadios AARRR. Obtén una puntuación de 0–100 por estadio, identifica tus principales cuellos de botella y recibe 3 experimentos ICE priorizados.",
  "quiz.feature.stageScores": "Puntuaciones por Estadio",
  "quiz.feature.stageScores.desc": "Puntuación 0–100 para cada uno de los 5 estadios AARRR",
  "quiz.feature.bottleneck": "Análisis de Cuellos de Botella",
  "quiz.feature.bottleneck.desc": "Los 3 estadios más débiles ordenados por impacto",
  "quiz.feature.experiments": "Experimentos ICE",
  "quiz.feature.experiments.desc": "3 experimentos priorizados dirigidos a tus puntos débiles",
  "quiz.howItWorks": "Cómo funciona",
  "quiz.step1.label": "Responde 15 preguntas",
  "quiz.step1.desc": "Una por estadio AARRR — ~3 min",
  "quiz.step2.label": "Obtén tu puntuación AARRR",
  "quiz.step2.desc": "0–100 por estadio, ponderado globalmente",
  "quiz.step3.label": "Ve tu hoja de ruta",
  "quiz.step3.desc": "Cuellos de botella + 3 experimentos ICE para solucionarlos",
  "quiz.cta": "Comenzar Auditoría Gratuita →",
  "quiz.cta.note": "~3 minutos · Sin registro · 100% gratuito",
  "quiz.back": "← Atrás",
  "quiz.question.counter": "Pregunta {current} de {total}",
  "stage.acquisition": "Adquisición",
  "stage.activation": "Activación",
  "stage.retention": "Retención",
  "stage.revenue": "Ingresos",
  "stage.referral": "Referidos",
  "stage.acquisition.desc": "Qué tan bien atraes nuevos visitantes y leads",
  "stage.activation.desc": "Qué tan rápido los nuevos usuarios llegan a su 'momento eureka'",
  "stage.retention.desc": "Qué tan bien mantienes a los usuarios activos en el tiempo",
  "stage.revenue.desc": "Qué tan eficazmente monetizas tu base de usuarios",
  "stage.referral.desc": "Qué tanto difunden tus usuarios tu producto de manera orgánica",
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Desglose por Estadio",
  "results.stageBreakdown.desc":
    "Contribuciones ponderadas a tu puntuación global. Los estadios en rojo son tus cuellos de botella principales.",
  "results.bottlenecks.title": "Tus {count} principales cuellos de botella",
  "results.bottlenecks.desc":
    "Estos estadios están arrastrando tu puntuación hacia abajo. Enfócate aquí primero.",
  "results.experiments.title": "Tus 3 mejores experimentos",
  "results.experiments.desc":
    "Priorización ICE (Impacto × Confianza / Esfuerzo). Mayor puntuación = ejecuta esto primero.",
  "results.legend.critical": "Crítico (<40)",
  "results.legend.needsWork": "Necesita mejora (40-69)",
  "results.legend.good": "Bueno (70-84)",
  "results.legend.excellent": "Excelente (85+)",
  "results.footer.oss": "Esta herramienta es gratuita y de código abierto.",
  "results.footer.fork": "Forkéalo en GitHub",
  "results.footer.questions": "¿Preguntas?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Tu manual de acción",
  "playbook.desc":
    "Tácticas concretas para tus etapas más débiles: qué hacer, los pasos y qué medir. Expórtalo y ejecútalo.",
  "playbook.copy": "Copiar manual",
  "playbook.copied": "¡Copiado!",
  "playbook.download": "Descargar .md",
  "playbook.measure": "Medir",
  "embed.poweredBy": "Con tecnología de Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "Cómo te comparas",
  "results.compare.overall": "General",
  "results.shared.title": "Estás viendo un resultado compartido.",
  "results.shared.desc": "¿Curioso por saber cómo puntúa tu motor de crecimiento?",
  "results.shared.cta": "Haz la auditoría gratis →",
  "share.title": "Comparte tu puntuación",
  "share.desc": "Tus resultados están codificados en la URL — no necesitas cuenta para compartir.",
  "results.compare.industry": "Sector",
};

const fr: TranslationDict = {
  "nav.title": "Growth Health Score",
  "nav.openSource": "Open source · MIT",
  "quiz.badge": "Audit de croissance gratuit",
  "quiz.hero.title1": "Quel est votre",
  "quiz.hero.title2": "Growth Health Score ?",
  "quiz.hero.subtitle":
    "Répondez à 15 questions diagnostiques sur les 5 étapes AARRR. Obtenez un score 0–100 par étape, identifiez vos principaux goulots d'étranglement et recevez 3 expériences ICE priorisées.",
  "quiz.feature.stageScores": "Scores par Étape",
  "quiz.feature.stageScores.desc": "Score 0–100 pour chacune des 5 étapes AARRR",
  "quiz.feature.bottleneck": "Analyse des Goulots",
  "quiz.feature.bottleneck.desc": "Les 3 étapes les plus faibles classées par impact",
  "quiz.feature.experiments": "Expériences ICE",
  "quiz.feature.experiments.desc": "3 expériences priorisées ciblant vos lacunes",
  "quiz.howItWorks": "Comment ça marche",
  "quiz.step1.label": "Répondez à 15 questions",
  "quiz.step1.desc": "Une par étape AARRR — ~3 min",
  "quiz.step2.label": "Obtenez votre score AARRR",
  "quiz.step2.desc": "0–100 par étape, pondéré globalement",
  "quiz.step3.label": "Voyez votre feuille de route",
  "quiz.step3.desc": "Goulots + 3 expériences ICE pour les corriger",
  "quiz.cta": "Démarrer l'Audit Gratuit →",
  "quiz.cta.note": "~3 minutes · Sans inscription · 100% gratuit",
  "quiz.back": "← Retour",
  "quiz.question.counter": "Question {current} sur {total}",
  "stage.acquisition": "Acquisition",
  "stage.activation": "Activation",
  "stage.retention": "Rétention",
  "stage.revenue": "Revenus",
  "stage.referral": "Parrainage",
  "stage.acquisition.desc": "Votre capacité à attirer de nouveaux visiteurs et leads",
  "stage.activation.desc": "Quelle rapidité les nouveaux utilisateurs atteignent leur 'aha moment'",
  "stage.retention.desc": "Votre capacité à fidéliser les utilisateurs",
  "stage.revenue.desc": "Votre efficacité à monétiser votre base d'utilisateurs",
  "stage.referral.desc": "Dans quelle mesure vos utilisateurs recommandent votre produit",
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Détail par Étape",
  "results.stageBreakdown.desc":
    "Contributions pondérées à votre score global. Les étapes rouges sont vos goulots d'étranglement principaux.",
  "results.bottlenecks.title": "Vos {count} principaux goulots",
  "results.bottlenecks.desc":
    "Ces étapes font baisser votre score global. Concentrez-vous ici en premier.",
  "results.experiments.title": "Vos 3 meilleures expériences",
  "results.experiments.desc":
    "Priorisées ICE (Impact × Confiance / Effort). Score plus élevé = faites-le en premier.",
  "results.legend.critical": "Critique (<40)",
  "results.legend.needsWork": "À améliorer (40-69)",
  "results.legend.good": "Bon (70-84)",
  "results.legend.excellent": "Excellent (85+)",
  "results.footer.oss": "Cet outil est gratuit et open-source.",
  "results.footer.fork": "Forkez-le sur GitHub",
  "results.footer.questions": "Questions ?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Votre plan d'action",
  "playbook.desc":
    "Des tactiques concrètes pour vos étapes les plus faibles — quoi faire, les étapes et quoi mesurer. Exportez et exécutez.",
  "playbook.copy": "Copier le plan",
  "playbook.copied": "Copié !",
  "playbook.download": "Télécharger .md",
  "playbook.measure": "Mesurer",
  "embed.poweredBy": "Propulsé par Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "Comment vous vous situez",
  "results.compare.overall": "Global",
  "results.shared.title": "Vous consultez un résultat partagé.",
  "results.shared.desc": "Curieux de savoir comment votre moteur de croissance se situe ?",
  "results.shared.cta": "Faites l'audit gratuit →",
  "share.title": "Partagez votre score",
  "share.desc": "Vos résultats sont encodés dans l'URL — aucun compte requis pour partager.",
  "results.compare.industry": "Secteur",
};

const de: TranslationDict = {
  "nav.title": "Growth Health Score",
  "nav.openSource": "Open Source · MIT",
  "quiz.badge": "Kostenloser Wachstums-Audit",
  "quiz.hero.title1": "Wie ist Ihr",
  "quiz.hero.title2": "Growth Health Score?",
  "quiz.hero.subtitle":
    "Beantworten Sie 15 Diagnosefragen zu den 5 AARRR-Phasen. Erhalten Sie eine 0–100-Punktzahl pro Phase, identifizieren Sie Ihre größten Engpässe und erhalten Sie 3 ICE-priorisierte Experimente.",
  "quiz.feature.stageScores": "Phasenpunkte",
  "quiz.feature.stageScores.desc": "0–100 Punkte für jede der 5 AARRR-Phasen",
  "quiz.feature.bottleneck": "Engpassanalyse",
  "quiz.feature.bottleneck.desc": "Die 3 schwächsten Phasen nach Auswirkung sortiert",
  "quiz.feature.experiments": "ICE-Experimente",
  "quiz.feature.experiments.desc": "3 priorisierte Experimente für Ihre Schwachstellen",
  "quiz.howItWorks": "So funktioniert es",
  "quiz.step1.label": "15 Fragen beantworten",
  "quiz.step1.desc": "Eine pro AARRR-Phase — ~3 Min.",
  "quiz.step2.label": "AARRR-Punktzahl erhalten",
  "quiz.step2.desc": "0–100 pro Phase, gewichtet gesamt",
  "quiz.step3.label": "Ihre Roadmap ansehen",
  "quiz.step3.desc": "Engpässe + 3 ICE-Experimente zur Behebung",
  "quiz.cta": "Kostenlosen Audit starten →",
  "quiz.cta.note": "~3 Minuten · Ohne Anmeldung · 100% kostenlos",
  "quiz.back": "← Zurück",
  "quiz.question.counter": "Frage {current} von {total}",
  "stage.acquisition": "Akquise",
  "stage.activation": "Aktivierung",
  "stage.retention": "Bindung",
  "stage.revenue": "Umsatz",
  "stage.referral": "Empfehlung",
  "stage.acquisition.desc": "Wie gut Sie neue Besucher und Leads anziehen",
  "stage.activation.desc": "Wie schnell neue Nutzer ihr 'Aha-Erlebnis' erreichen",
  "stage.retention.desc": "Wie gut Sie Nutzer langfristig halten",
  "stage.revenue.desc": "Wie effektiv Sie Ihre Nutzerbasis monetarisieren",
  "stage.referral.desc": "Wie viel Ihre Nutzer das Produkt organisch weiterempfehlen",
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Phasenübersicht",
  "results.stageBreakdown.desc":
    "Gewichtete Beiträge zu Ihrer Gesamtpunktzahl. Rote Phasen sind Ihre primären Engpässe.",
  "results.bottlenecks.title": "Ihre {count} größten Engpässe",
  "results.bottlenecks.desc":
    "Diese Phasen drücken Ihre Gesamtpunktzahl nach unten. Fokussieren Sie sich hier zuerst.",
  "results.experiments.title": "Ihre Top 3 Experimente",
  "results.experiments.desc":
    "ICE-priorisiert (Auswirkung × Vertrauen / Aufwand). Höhere Punktzahl = zuerst ausführen.",
  "results.legend.critical": "Kritisch (<40)",
  "results.legend.needsWork": "Verbesserungsbedarf (40-69)",
  "results.legend.good": "Gut (70-84)",
  "results.legend.excellent": "Ausgezeichnet (85+)",
  "results.footer.oss": "Dieses Tool ist kostenlos und Open Source.",
  "results.footer.fork": "Auf GitHub forken",
  "results.footer.questions": "Fragen?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Ihr Aktionsplaybook",
  "playbook.desc":
    "Konkrete Taktiken für Ihre schwächsten Phasen — was zu tun ist, die Schritte und was zu messen ist. Exportieren und umsetzen.",
  "playbook.copy": "Playbook kopieren",
  "playbook.copied": "Kopiert!",
  "playbook.download": ".md herunterladen",
  "playbook.measure": "Messen",
  "embed.poweredBy": "Bereitgestellt von Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "So schneiden Sie ab",
  "results.compare.overall": "Gesamt",
  "results.shared.title": "Sie sehen ein geteiltes Ergebnis.",
  "results.shared.desc": "Neugierig, wie Ihr eigener Wachstumsmotor abschneidet?",
  "results.shared.cta": "Kostenlosen Audit starten →",
  "share.title": "Teilen Sie Ihr Ergebnis",
  "share.desc": "Ihre Ergebnisse sind in der URL kodiert — kein Konto zum Teilen nötig.",
  "results.compare.industry": "Branche",
};

const ptBr: TranslationDict = {
  "nav.title": "Growth Health Score",
  "nav.openSource": "Código aberto · MIT",
  "quiz.badge": "Auditoria de crescimento grátis",
  "quiz.hero.title1": "Qual é o seu",
  "quiz.hero.title2": "Growth Health Score?",
  "quiz.hero.subtitle":
    "Responda 15 perguntas de diagnóstico nos 5 estágios AARRR. Obtenha uma pontuação de 0–100 por estágio, identifique seus principais gargalos e receba 3 experimentos priorizados por ICE.",
  "quiz.feature.stageScores": "Pontuações por Estágio",
  "quiz.feature.stageScores.desc": "Pontuação de 0–100 para cada um dos 5 estágios AARRR",
  "quiz.feature.bottleneck": "Análise de Gargalos",
  "quiz.feature.bottleneck.desc": "Os 3 estágios mais fracos classificados por impacto",
  "quiz.feature.experiments": "Experimentos ICE",
  "quiz.feature.experiments.desc": "3 experimentos priorizados direcionados às suas lacunas",
  "quiz.howItWorks": "Como funciona",
  "quiz.step1.label": "Responda 15 perguntas",
  "quiz.step1.desc": "Uma por estágio AARRR — ~3 min",
  "quiz.step2.label": "Obtenha seu score AARRR",
  "quiz.step2.desc": "0–100 por estágio, ponderado no geral",
  "quiz.step3.label": "Veja seu roadmap",
  "quiz.step3.desc": "Gargalos + 3 experimentos ICE para corrigi-los",
  "quiz.cta": "Começar Auditoria Grátis →",
  "quiz.cta.note": "~3 minutos · Sem cadastro · 100% grátis",
  "quiz.back": "← Voltar",
  "quiz.question.counter": "Pergunta {current} de {total}",
  "stage.acquisition": "Aquisição",
  "stage.activation": "Ativação",
  "stage.retention": "Retenção",
  "stage.revenue": "Receita",
  "stage.referral": "Indicação",
  "stage.acquisition.desc": "O quão bem você atrai novos visitantes e leads",
  "stage.activation.desc": "Quão rapidamente novos usuários atingem seu 'momento aha'",
  "stage.retention.desc": "O quão bem você mantém os usuários retornando ao longo do tempo",
  "stage.revenue.desc": "Quão efetivamente você monetiza sua base de usuários",
  "stage.referral.desc": "O quanto seus usuários divulgam o produto organicamente",
  "results.badge": "Growth Health Score",
  "results.stageBreakdown": "Detalhamento por Estágio",
  "results.stageBreakdown.desc":
    "Contribuições ponderadas para sua pontuação geral. Estágios em vermelho são seus gargalos principais.",
  "results.bottlenecks.title": "Seus {count} principais gargalos",
  "results.bottlenecks.desc":
    "Esses estágios estão puxando sua pontuação para baixo. Foque aqui primeiro.",
  "results.experiments.title": "Seus 3 melhores experimentos",
  "results.experiments.desc":
    "Priorização ICE (Impacto × Confiança / Esforço). Pontuação mais alta = execute este primeiro.",
  "results.legend.critical": "Crítico (<40)",
  "results.legend.needsWork": "Precisa melhorar (40-69)",
  "results.legend.good": "Bom (70-84)",
  "results.legend.excellent": "Excelente (85+)",
  "results.footer.oss": "Esta ferramenta é gratuita e de código aberto.",
  "results.footer.fork": "Faça um fork no GitHub",
  "results.footer.questions": "Dúvidas?",
  "results.progress": "{answered}/{total}",

  // ── Playbook ─────────────────────────────────────────────────────────────
  "playbook.title": "Seu manual de ação",
  "playbook.desc":
    "Táticas concretas para suas etapas mais fracas — o que fazer, os passos e o que medir. Exporte e execute.",
  "playbook.copy": "Copiar manual",
  "playbook.copied": "Copiado!",
  "playbook.download": "Baixar .md",
  "playbook.measure": "Medir",
  "embed.poweredBy": "Desenvolvido com Growth Health Score · growthackers.io",

  // ── Results/share (localized) ──────────────────────────────────────────
  "results.compare.title": "Como você se compara",
  "results.compare.overall": "Geral",
  "results.shared.title": "Você está vendo um resultado compartilhado.",
  "results.shared.desc": "Quer saber como seu motor de crescimento pontua?",
  "results.shared.cta": "Faça a auditoria grátis →",
  "share.title": "Compartilhe sua pontuação",
  "share.desc": "Seus resultados estão codificados na URL — não precisa de conta para compartilhar.",
  "results.compare.industry": "Setor",
};

export const translations: Record<Locale, TranslationDict> = {
  en,
  ar,
  it,
  nl,
  zh,
  es,
  fr,
  de,
  "pt-br": ptBr,
};

// ─────────────────────────────────────────────────────────────────────────────
// Compat exports — used by components/LanguageSelector.tsx
// (keeps the existing component compiling without changes)
// ─────────────────────────────────────────────────────────────────────────────

export type LangCode = Locale;

const FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  it: "🇮🇹",
  nl: "🇳🇱",
  zh: "🇨🇳",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  "pt-br": "🇧🇷",
};

export const LANGUAGES = (Object.keys(LOCALE_LABELS) as Locale[]).map((code) => ({
  code,
  label: LOCALE_LABELS[code],
  dir: (RTL_LOCALES.includes(code) ? "rtl" : "ltr") as "ltr" | "rtl",
  flag: FLAGS[code],
}));

export function getLangDir(code: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(code) ? "rtl" : "ltr";
}

export function isValidLang(code: string): code is Locale {
  return Object.prototype.hasOwnProperty.call(LOCALE_LABELS, code);
}

/**
 * Resolve a locale from a URL query string (`?lang=`). Returns a valid Locale or
 * null. Pure — no storage, no globals. This is the single source for locale
 * selection: we never read/write localStorage, so a chosen language is fully
 * shareable and reload-stable via the URL.
 */
export function resolveLocale(search: string): Locale | null {
  try {
    const v = new URLSearchParams(search).get("lang");
    if (v && isValidLang(v)) return v;
  } catch {
    // malformed query → fall through
  }
  return null;
}
