// ─────────────────────────────────────────────────────────────────────────────
// PLG Readiness — the second diagnostic.
//
// A Product-Led-Growth readiness audit. Same 5×3 shape as AARRR so it reuses the
// shared engine, share codec, OG/report, PDF, and playbook pipelines unchanged.
// Pure data → Edge-safe.
//
// Dimensions (weights sum to 1.0):
//   Time-to-Value · Self-Serve Funnel · Product-Qualified Leads ·
//   In-Product Virality · Expansion-Led Revenue
// ─────────────────────────────────────────────────────────────────────────────

import type { Diagnostic } from "../engine";

export const PLG_DIAGNOSTIC: Diagnostic = {
  id: "plg",
  slug: "plg",
  name: "PLG Readiness Score",
  shortName: "PLG",
  tagline: "Measure how product-led your growth engine really is.",
  emoji: "🚀",
  dimensions: [
    {
      key: "ttv",
      label: "Time-to-Value",
      emoji: "⏱️",
      weight: 0.25,
      description: "How fast a new user reaches first value with no human help",
      color: "purple",
    },
    {
      key: "self_serve",
      label: "Self-Serve Funnel",
      emoji: "🛒",
      weight: 0.25,
      description: "Whether users can sign up, adopt, and pay without sales",
      color: "blue",
    },
    {
      key: "pql",
      label: "Product-Qualified Leads",
      emoji: "🎯",
      weight: 0.15,
      description: "How well you turn in-product signals into qualified pipeline",
      color: "green",
    },
    {
      key: "virality",
      label: "In-Product Virality",
      emoji: "🔗",
      weight: 0.15,
      description: "How much product usage itself creates new users",
      color: "orange",
    },
    {
      key: "expansion",
      label: "Expansion-Led Revenue",
      emoji: "📈",
      weight: 0.20,
      description: "How reliably accounts expand through usage, not renegotiation",
      color: "yellow",
    },
  ],
  questions: [
    // TIME-TO-VALUE
    {
      id: "plg_ttv_speed",
      dimension: "ttv",
      text: "How long from signup to a new user's first real 'win' in the product?",
      hint: "First meaningful outcome, fully self-serve — not just account creation",
      options: [
        "We don't know / over a week",
        "2–7 days",
        "Same day",
        "Under an hour",
        "Under 5 minutes, reliably",
      ],
    },
    {
      id: "plg_ttv_setup",
      dimension: "ttv",
      text: "How much setup is required before a user can experience value?",
      hint: "Data import, integrations, configuration, seat invites, etc.",
      options: [
        "Heavy setup + a call is effectively required",
        "Significant self-serve setup (many steps)",
        "Moderate setup with a guided flow",
        "Minimal setup; sensible defaults",
        "Instant value with templates / sample data, zero config",
      ],
    },
    {
      id: "plg_ttv_instrumented",
      dimension: "ttv",
      text: "How well do you measure and act on time-to-value?",
      hint: "An instrumented 'activation event' with a tracked TTV distribution",
      options: [
        "Not measured at all",
        "We have a rough sense, no data",
        "Activation event defined, tracked loosely",
        "Tracked with a TTV target we monitor",
        "Tracked, alerted on, and actively optimized per cohort",
      ],
    },

    // SELF-SERVE FUNNEL
    {
      id: "plg_ss_signup",
      dimension: "self_serve",
      text: "Can a user go from landing page to active use without talking to sales?",
      hint: "Frictionless signup: no forced demo, no 'contact us' to start",
      options: [
        "No — a demo / sales call is required to start",
        "Free trial exists but is gated behind a form + manual approval",
        "Self-serve signup, but key value is sales-gated",
        "Full self-serve signup and onboarding",
        "Self-serve signup, onboarding, AND purchase end-to-end",
      ],
    },
    {
      id: "plg_ss_pricing",
      dimension: "self_serve",
      text: "How self-serve is your path to paying?",
      hint: "Transparent pricing + in-product checkout vs. 'talk to sales'",
      options: [
        "Pricing is hidden; all deals are sales-led",
        "Pricing shown, but you must contact sales to buy",
        "Self-serve checkout for the entry tier only",
        "Self-serve checkout across most tiers",
        "Usage-based self-serve billing with in-product upgrades",
      ],
    },
    {
      id: "plg_ss_onboarding",
      dimension: "self_serve",
      text: "How deliberately engineered is your in-product onboarding?",
      hint: "Empty states, checklists, contextual nudges, progress to value",
      options: [
        "No onboarding — users land in an empty app",
        "A one-time tour, then nothing",
        "Basic checklist or a few tooltips",
        "Contextual, milestone-based onboarding to the aha moment",
        "Personalized, adaptive onboarding measured against activation",
      ],
    },

    // PRODUCT-QUALIFIED LEADS
    {
      id: "plg_pql_signals",
      dimension: "pql",
      text: "Do you identify Product-Qualified Leads from in-product behavior?",
      hint: "Usage thresholds / fit signals that predict readiness to buy or expand",
      options: [
        "We don't track product usage for this",
        "We look at usage ad-hoc, no definition",
        "A basic PQL definition exists, used manually",
        "A scored PQL model surfaces accounts automatically",
        "A validated PQL model, continuously tuned on conversion data",
      ],
    },
    {
      id: "plg_pql_handoff",
      dimension: "pql",
      text: "What happens when an account hits a buying / expansion signal?",
      hint: "Routing to sales/CS or an automated in-product play",
      options: [
        "Nothing — signals aren't captured",
        "Someone might notice in a dashboard",
        "Manual review, inconsistent follow-up",
        "Automated alert + a defined play (sales or in-product)",
        "Instant routing with an A/B-tested play and tracked conversion",
      ],
    },
    {
      id: "plg_pql_motion",
      dimension: "pql",
      text: "How well do self-serve and sales-assist motions work together?",
      hint: "Sales accelerates product-qualified accounts rather than gating them",
      options: [
        "Pure one or the other; they conflict",
        "Sales gates the product; little self-serve",
        "Both exist but operate in silos",
        "Sales focuses on product-qualified accounts",
        "A tuned hybrid: PLG feeds sales, sales lifts PLG conversion",
      ],
    },

    // IN-PRODUCT VIRALITY
    {
      id: "plg_vir_collab",
      dimension: "virality",
      text: "Does using the product naturally pull in new people?",
      hint: "Collaboration, sharing, invites, public artifacts — built-in spread",
      options: [
        "No — single-player, fully private",
        "Sharing is possible but rare and manual",
        "Some collaboration exists; not a growth driver",
        "Invites/sharing are designed into core workflows",
        "Network effects: usage reliably creates new signups (k measurable)",
      ],
    },
    {
      id: "plg_vir_loops",
      dimension: "virality",
      text: "How engineered and measured are your viral / sharing loops?",
      hint: "Deliberate loops with a tracked viral coefficient (k-factor)",
      options: [
        "No loops, nothing measured",
        "We've thought about it; nothing built",
        "A loop or two exist, unmeasured",
        "Loops built and k-factor tracked",
        "Multiple optimized loops; k contributes materially to growth",
      ],
    },
    {
      id: "plg_vir_freemium",
      dimension: "virality",
      text: "Does your free tier / trial act as a distribution engine?",
      hint: "Free usage that exposes the product to new potential users",
      options: [
        "No free tier or trial",
        "Time-limited trial, no organic exposure",
        "Free tier exists but stays internal to one user",
        "Free tier surfaces the product to an account's wider team",
        "Free usage routinely exposes the product beyond the customer",
      ],
    },

    // EXPANSION-LED REVENUE
    {
      id: "plg_exp_nrr",
      dimension: "expansion",
      text: "What is your Net Revenue Retention (NRR)?",
      hint: "Revenue from existing customers over time, incl. expansion − churn",
      options: [
        "Unknown",
        "Below 90%",
        "90–100%",
        "100–110%",
        "Above 110%",
      ],
    },
    {
      id: "plg_exp_triggers",
      dimension: "expansion",
      text: "How systematic is your in-product expansion motion?",
      hint: "Usage-based upgrade triggers, seat expansion, in-product upsell",
      options: [
        "No expansion motion at all",
        "Occasional, sales-led, reactive upsells",
        "Some in-product upgrade prompts, unoptimized",
        "Usage triggers drive automated upgrade prompts",
        "Tuned expansion triggers; expansion reliably outpaces churn",
      ],
    },
    {
      id: "plg_exp_value_metric",
      dimension: "expansion",
      text: "How well does your pricing's value metric scale with customer value?",
      hint: "Customers pay more as they get more value (seats, usage, outcomes)",
      options: [
        "Flat pricing unrelated to value received",
        "A value metric exists but rarely grows accounts",
        "Value metric scales somewhat with usage",
        "Value metric closely tracks realized value",
        "Value metric makes expansion feel automatic and fair",
      ],
    },
  ],
  experiments: {
    ttv: [
      {
        title: "Instrument the Activation Event + Cut Time-to-Value 50%",
        description:
          "Define the single 'first win' event and instrument the full path to it. Find the biggest pre-value step and remove or defer it. Target: halve median TTV in 30 days.",
        impact: 9,
        confidence: 8,
        effort: 3,
        ice: 0,
        dimension: "ttv",
      },
      {
        title: "Ship Templates / Sample Data for Instant Value",
        description:
          "Let new users start from a realistic template or seeded sample workspace so they see the product working before doing any setup. Measure activation lift vs. blank-start control.",
        impact: 8,
        confidence: 7,
        effort: 4,
        ice: 0,
        dimension: "ttv",
      },
      {
        title: "Reverse-Trial: Full Power Up Front",
        description:
          "Give new signups full functionality for a short window, then drop to free. Front-loads the aha moment. A/B test reverse-trial vs. classic freemium on activation + paid conversion.",
        impact: 7,
        confidence: 6,
        effort: 4,
        ice: 0,
        dimension: "ttv",
      },
    ],
    self_serve: [
      {
        title: "Remove the 'Talk to Sales' Wall on the Entry Tier",
        description:
          "Add transparent pricing and in-product self-serve checkout for the entry tier so users can buy without a call. Measure self-serve conversion and sales-cycle compression.",
        impact: 9,
        confidence: 7,
        effort: 4,
        ice: 0,
        dimension: "self_serve",
      },
      {
        title: "Milestone-Based Onboarding Checklist",
        description:
          "Replace the empty first screen with a checklist that walks users to the aha moment, with contextual nudges per milestone. Measure 7-day activation vs. control.",
        impact: 8,
        confidence: 8,
        effort: 3,
        ice: 0,
        dimension: "self_serve",
      },
      {
        title: "Frictionless Signup Audit",
        description:
          "Strip every non-essential field and approval step between landing and active use (SSO, no credit card to start, deferred profile). Measure signup→activation completion.",
        impact: 7,
        confidence: 8,
        effort: 3,
        ice: 0,
        dimension: "self_serve",
      },
    ],
    pql: [
      {
        title: "Define + Score Your First PQL Model",
        description:
          "Pick 3–5 in-product signals that correlate with conversion/expansion, weight them into a PQL score, and surface qualifying accounts daily. Measure PQL→opportunity rate.",
        impact: 8,
        confidence: 7,
        effort: 4,
        ice: 0,
        dimension: "pql",
      },
      {
        title: "Automated PQL Play on Threshold",
        description:
          "When an account crosses the PQL threshold, fire a defined play (in-product prompt or a sales/CS alert with context). A/B test the play vs. no-touch. Track conversion.",
        impact: 8,
        confidence: 7,
        effort: 3,
        ice: 0,
        dimension: "pql",
      },
      {
        title: "Align Sales Around Product-Qualified Accounts",
        description:
          "Route reps to accounts already showing product traction instead of cold lists. Measure win-rate and cycle length vs. the prior book of business.",
        impact: 7,
        confidence: 7,
        effort: 4,
        ice: 0,
        dimension: "pql",
      },
    ],
    virality: [
      {
        title: "Build One Collaboration / Invite Loop into a Core Workflow",
        description:
          "Find a workflow where inviting a teammate or sharing a result is natural, and make it one tap. Instrument invites sent → accepted → activated. Measure k-factor after 60 days.",
        impact: 8,
        confidence: 6,
        effort: 5,
        ice: 0,
        dimension: "virality",
      },
      {
        title: "Public / Shareable Artifacts with Light Branding",
        description:
          "Let users share a result, report, or view via a public link that exposes the product to outsiders (tasteful 'made with' attribution). Track signups attributed to shares.",
        impact: 7,
        confidence: 6,
        effort: 4,
        ice: 0,
        dimension: "virality",
      },
      {
        title: "Free Tier as a Distribution Surface",
        description:
          "Make the free experience naturally visible to an account's wider team (shared spaces, mentions, requests). Measure new seats originating inside existing accounts.",
        impact: 7,
        confidence: 6,
        effort: 5,
        ice: 0,
        dimension: "virality",
      },
    ],
    expansion: [
      {
        title: "Usage-Based Expansion Trigger",
        description:
          "Identify the usage threshold that predicts upgrade intent (e.g. 80% of a limit). Trigger an in-product upgrade prompt before the limit. A/B test value-led vs. discount messaging.",
        impact: 9,
        confidence: 7,
        effort: 4,
        ice: 0,
        dimension: "expansion",
      },
      {
        title: "Re-Align the Value Metric with Realized Value",
        description:
          "Audit whether customers pay more as they get more value. Test one value-metric or tier change so expansion feels fair and automatic. Measure NRR and ARPA over the next quarter.",
        impact: 8,
        confidence: 6,
        effort: 5,
        ice: 0,
        dimension: "expansion",
      },
      {
        title: "Seat & Workspace Expansion Nudges",
        description:
          "Prompt admins to add teammates at natural moments (shared work, hit limits, pending invites). Track seats added and the resulting NRR lift vs. accounts without nudges.",
        impact: 7,
        confidence: 7,
        effort: 3,
        ice: 0,
        dimension: "expansion",
      },
    ],
  },
};

export default PLG_DIAGNOSTIC;
