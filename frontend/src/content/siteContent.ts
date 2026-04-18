export type SiteMetric = {
  label: string;
  value: string;
};

export type CapabilityBlock = {
  title: string;
  detail: string;
};

export type SolutionPage = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  problemStatement: string;
  whatWeDo: string[];
  howWeDo: string[];
  outcomes: string[];
};

export const SITE_METRICS: SiteMetric[] = [
  { label: "Detection Workflows", value: "34" },
  { label: "Hospital Teams Supported", value: "120+" },
  { label: "Average Review Acceleration", value: "41%" },
  { label: "Audit Coverage", value: "100%" },
];

export const PROBLEM_BLOCKS: CapabilityBlock[] = [
  {
    title: "Late Escalation",
    detail:
      "Stone-positive cases can get buried in high-volume review queues, delaying clinical action.",
  },
  {
    title: "Inconsistent Prioritization",
    detail:
      "Manual triage varies by shift, making detection confidence and escalation patterns inconsistent.",
  },
  {
    title: "Low Operational Visibility",
    detail:
      "Leadership lacks a single source of truth for case movement, quality, and turnaround risks.",
  },
];

export const WHAT_WE_DO_BLOCKS: CapabilityBlock[] = [
  {
    title: "Stone-First Decisioning",
    detail:
      "We convert complex multi-class model output into a clear stone versus non-stone decision signal.",
  },
  {
    title: "Clinical Transparency",
    detail:
      "Every prediction includes probability, threshold, and dominant class context so teams can trust output behavior.",
  },
  {
    title: "Deployment Discipline",
    detail:
      "Production-style serving, readiness checks, and robust error handling keep demo and live workflows stable.",
  },
];

export const HOW_WE_DO_STEPS: CapabilityBlock[] = [
  {
    title: "01. Ingest and Validate",
    detail:
      "We validate image type, size, and orientation before inference to prevent noisy runtime failures.",
  },
  {
    title: "02. Infer and Decide",
    detail:
      "The model emits a stone probability score and applies an explicit threshold for deterministic decisioning.",
  },
  {
    title: "03. Explain and Route",
    detail:
      "Results return structured confidence context so downstream triage, reporting, and escalation stay predictable.",
  },
];

export const SOLUTION_PAGES: SolutionPage[] = [
  {
    slug: "stone-risk-screening",
    category: "Clinical",
    title: "Stone Risk Screening",
    summary:
      "Rapid front-door screening workflow for probable kidney stone cases.",
    problemStatement:
      "ED and OPD teams need immediate risk cues before full radiology sign-off is available.",
    whatWeDo: [
      "Provide a high-clarity stone detection output for first-pass clinical screening.",
      "Pair decision labels with probability to support risk-aware triage.",
      "Reduce uncertainty in the first five minutes of intake.",
    ],
    howWeDo: [
      "Use validated CT image pre-processing and deterministic API behavior.",
      "Apply configurable stone thresholding tuned to site policy.",
      "Expose top-class context for reviewer confidence checks.",
    ],
    outcomes: [
      "Faster first clinical decision",
      "Lower triage ambiguity",
      "Clearer cross-team communication",
    ],
  },
  {
    slug: "emergency-triage",
    category: "Clinical",
    title: "Emergency Triage",
    summary: "Prioritize urgent stone-positive scans in emergency workflows.",
    problemStatement:
      "High patient load can hide urgent stone findings in generic triage queues.",
    whatWeDo: [
      "Flag probable stone findings early.",
      "Push high-risk scans into priority lanes.",
      "Attach confidence and threshold metadata for safe escalation.",
    ],
    howWeDo: [
      "Integrate API outputs into ER queue orchestration.",
      "Use threshold presets tuned for emergency sensitivity.",
      "Support near-real-time updates to status boards.",
    ],
    outcomes: [
      "Reduced urgent-case wait time",
      "Improved escalation consistency",
      "Better shift-level confidence",
    ],
  },
  {
    slug: "outpatient-fast-track",
    category: "Clinical",
    title: "Outpatient Fast Track",
    summary: "Route likely non-stone cases to efficient outpatient pathways.",
    problemStatement:
      "Routine outpatient queues lose efficiency when all scans are treated with the same urgency.",
    whatWeDo: [
      "Separate probable non-stone scans from high-priority stone findings.",
      "Enable smoother scheduling and review batching.",
      "Reduce unnecessary high-alert handling for low-risk studies.",
    ],
    howWeDo: [
      "Use deterministic non-stone decisioning from the same model output.",
      "Share confidence cues with operations coordinators.",
      "Align handoffs to outpatient care timelines.",
    ],
    outcomes: [
      "Higher OPD throughput",
      "Lower queue friction",
      "Balanced radiology workload",
    ],
  },
  {
    slug: "radiology-worklist",
    category: "Clinical",
    title: "Radiology Worklist Prioritizer",
    summary: "Sort CT studies by probable stone risk before final read.",
    problemStatement:
      "Manual worklist sorting costs radiologists time and introduces reviewer variability.",
    whatWeDo: [
      "Add AI-based risk signals to worklist ordering.",
      "Keep transparency with top-class confidence markers.",
      "Support radiologist override at every step.",
    ],
    howWeDo: [
      "Generate structured prediction payloads.",
      "Map payloads to worklist priority bands.",
      "Log every transition for audit review.",
    ],
    outcomes: [
      "Faster critical reads",
      "Cleaner queue management",
      "Improved reporting cadence",
    ],
  },
  {
    slug: "tele-radiology-hub",
    category: "Clinical",
    title: "Tele-Radiology Hub",
    summary:
      "Keep distributed radiology teams aligned on stone-focused priorities.",
    problemStatement:
      "Remote reading teams need synchronized priority signals across shifts and geographies.",
    whatWeDo: [
      "Standardize stone decision data for remote teams.",
      "Reduce interpretation drift across reading centers.",
      "Support reliable handoff context.",
    ],
    howWeDo: [
      "Serve unified API contracts across connected sites.",
      "Embed confidence metadata in transfer packets.",
      "Monitor readiness and runtime consistency.",
    ],
    outcomes: [
      "Aligned remote triage",
      "Smoother shift handovers",
      "Lower cross-site variance",
    ],
  },
  {
    slug: "quality-assurance",
    category: "Quality",
    title: "Clinical Quality Assurance",
    summary:
      "Track and review detection behavior with measurable quality guardrails.",
    problemStatement:
      "Quality teams need reproducible evidence that AI behavior remains stable and safe.",
    whatWeDo: [
      "Capture confidence trends and threshold decisions.",
      "Enable structured QA sampling workflows.",
      "Expose edge-case clusters for review.",
    ],
    howWeDo: [
      "Store response metadata for retrospective analysis.",
      "Define QA cohorts by score bands.",
      "Run scheduled quality reports for governance teams.",
    ],
    outcomes: [
      "More reliable QA cycles",
      "Early anomaly detection",
      "Clear evidence trails",
    ],
  },
  {
    slug: "model-governance",
    category: "Governance",
    title: "Model Governance",
    summary: "Operational governance framework for model lifecycle decisions.",
    problemStatement:
      "Without governance structure, threshold and model updates become risky and opaque.",
    whatWeDo: [
      "Establish decision checkpoints for release and rollback.",
      "Track model versions with deployment context.",
      "Support policy-aligned threshold management.",
    ],
    howWeDo: [
      "Pair runtime metadata with release metadata.",
      "Enforce controlled configuration updates.",
      "Document governance approvals in workflow logs.",
    ],
    outcomes: [
      "Safer model evolution",
      "Governance-ready documentation",
      "Reduced change risk",
    ],
  },
  {
    slug: "deployment-control",
    category: "Governance",
    title: "Deployment Control Room",
    summary:
      "Central visibility into release posture, readiness, and stability.",
    problemStatement:
      "Teams often lack one place to verify whether detection services are demo or production ready.",
    whatWeDo: [
      "Unify deployment status, readiness checks, and service health.",
      "Highlight blocked releases with actionable context.",
      "Promote controlled rollout behavior.",
    ],
    howWeDo: [
      "Expose lightweight health and readiness endpoints.",
      "Integrate startup warmup checks into deployment policy.",
      "Surface release metadata for operators.",
    ],
    outcomes: [
      "Higher deployment confidence",
      "Fewer runtime surprises",
      "Faster release approvals",
    ],
  },
  {
    slug: "audit-trails",
    category: "Governance",
    title: "Audit Trails",
    summary:
      "Create defensible records for every prediction and routing decision.",
    problemStatement:
      "Medical AI workflows require clear traceability for operational and compliance reviews.",
    whatWeDo: [
      "Capture decision details and thresholds.",
      "Preserve timeline of workflow events.",
      "Support exportable audit evidence.",
    ],
    howWeDo: [
      "Use structured response payloads with deterministic fields.",
      "Pair logs with operational event context.",
      "Enable filtered retrieval for auditors.",
    ],
    outcomes: [
      "Audit-ready records",
      "Lower compliance friction",
      "Faster incident reconstruction",
    ],
  },
  {
    slug: "clinician-feedback",
    category: "Quality",
    title: "Clinician Feedback Loop",
    summary: "Collect expert feedback to refine confidence behavior over time.",
    problemStatement:
      "Without clinician input, model behavior can drift from real diagnostic expectations.",
    whatWeDo: [
      "Capture case-level agreement and disagreement.",
      "Tag edge cases for targeted retraining review.",
      "Turn frontline feedback into measurable quality signals.",
    ],
    howWeDo: [
      "Add lightweight feedback prompts in reviewer workflow.",
      "Link comments to prediction context.",
      "Summarize trends for model owners.",
    ],
    outcomes: [
      "Better human-AI alignment",
      "Higher trust among clinicians",
      "Sharper retraining priorities",
    ],
  },
  {
    slug: "patient-intake",
    category: "Operations",
    title: "Patient Intake Coordination",
    summary: "Use stone probability as an intake planning signal.",
    problemStatement:
      "Intake teams need quick risk-informed pathways before complete specialist review.",
    whatWeDo: [
      "Map stone risk to intake route templates.",
      "Reduce ambiguity during handoff from front desk to clinical teams.",
      "Support consistent triage framing.",
    ],
    howWeDo: [
      "Connect prediction API outputs to intake forms.",
      "Define route policies by threshold range.",
      "Validate all uploads at intake stage.",
    ],
    outcomes: [
      "Cleaner intake operations",
      "Reduced routing delays",
      "More predictable first-touch care",
    ],
  },
  {
    slug: "report-assistant",
    category: "Clinical",
    title: "Report Assistant",
    summary: "Pre-populate report context with stone-centric AI findings.",
    problemStatement:
      "Radiology reporting can slow down when confidence context must be reconstructed manually.",
    whatWeDo: [
      "Provide structured stone probability fields.",
      "Attach top-class interpretation cues.",
      "Speed up report drafting without removing clinician control.",
    ],
    howWeDo: [
      "Integrate response payload with report templates.",
      "Use standardized wording for confidence ranges.",
      "Support quick edits before final sign-off.",
    ],
    outcomes: [
      "Faster report turnaround",
      "Consistent report language",
      "Improved reviewer focus",
    ],
  },
  {
    slug: "follow-up-planner",
    category: "Operations",
    title: "Follow-Up Planner",
    summary:
      "Drive follow-up cadence from confidence-informed screening decisions.",
    problemStatement:
      "Teams need structured follow-up planning when stone findings are likely but not yet finalized.",
    whatWeDo: [
      "Assign follow-up urgency bands from stone probability.",
      "Coordinate scheduling windows with care teams.",
      "Reduce missed high-risk follow-ups.",
    ],
    howWeDo: [
      "Map threshold ranges to follow-up policy.",
      "Publish reminders to case managers.",
      "Track closure rates by risk tier.",
    ],
    outcomes: [
      "Stronger follow-up adherence",
      "Lower missed-care risk",
      "More consistent scheduling",
    ],
  },
  {
    slug: "alert-orchestration",
    category: "Operations",
    title: "Alert Orchestration",
    summary:
      "Trigger targeted alerts only when stone risk crosses policy thresholds.",
    problemStatement:
      "Over-alerting creates fatigue, while under-alerting can delay care escalation.",
    whatWeDo: [
      "Balance alert sensitivity using explicit thresholding.",
      "Route alerts by role and urgency.",
      "Maintain alert traceability for review.",
    ],
    howWeDo: [
      "Define multi-band notification policies.",
      "Use payload metadata for context-rich messages.",
      "Measure alert precision over time.",
    ],
    outcomes: [
      "Lower alert fatigue",
      "Faster targeted response",
      "Improved escalation quality",
    ],
  },
  {
    slug: "care-team-collaboration",
    category: "Operations",
    title: "Care Team Collaboration",
    summary:
      "Unify radiology, nephrology, and operations around one detection signal.",
    problemStatement:
      "Cross-functional care teams often rely on fragmented status updates and inconsistent context.",
    whatWeDo: [
      "Create a shared stone-risk language across teams.",
      "Expose consistent confidence context for all stakeholders.",
      "Improve handoff fidelity from scan to action.",
    ],
    howWeDo: [
      "Standardize payload consumption across systems.",
      "Embed decision context into collaboration channels.",
      "Track handoff completion metrics.",
    ],
    outcomes: [
      "Stronger team alignment",
      "Fewer communication gaps",
      "Faster case closure",
    ],
  },
  {
    slug: "imaging-protocols",
    category: "Platform",
    title: "Imaging Protocol Alignment",
    summary: "Keep scan ingestion quality aligned with model expectations.",
    problemStatement:
      "Protocol variance across devices and sites can weaken inference stability.",
    whatWeDo: [
      "Define image-readiness checks before scoring.",
      "Align operational protocol guidance with model constraints.",
      "Reduce rejected or low-quality submissions.",
    ],
    howWeDo: [
      "Apply deterministic file and format validation.",
      "Track rejection reasons for protocol coaching.",
      "Publish protocol conformance dashboards.",
    ],
    outcomes: [
      "Higher usable scan rates",
      "More stable predictions",
      "Less rework for technicians",
    ],
  },
  {
    slug: "scanner-readiness",
    category: "Platform",
    title: "Scanner Readiness",
    summary: "Verify scanner output compatibility before operational rollout.",
    problemStatement:
      "New or recalibrated scanners may produce subtle format drift that affects model behavior.",
    whatWeDo: [
      "Test scanner output against ingestion constraints.",
      "Detect compatibility risks early.",
      "Support pre-go-live validation routines.",
    ],
    howWeDo: [
      "Run controlled sample validation pipelines.",
      "Compare confidence distributions across devices.",
      "Publish readiness sign-off checklists.",
    ],
    outcomes: [
      "Safer scanner onboarding",
      "Lower go-live risk",
      "Consistent cross-device behavior",
    ],
  },
  {
    slug: "data-ingestion",
    category: "Platform",
    title: "Data Ingestion Gateway",
    summary: "Reliable intake pipeline for CT images with strict validation.",
    problemStatement:
      "Unvalidated uploads increase error rates and operational instability.",
    whatWeDo: [
      "Enforce size, extension, and structure checks.",
      "Normalize image orientation and shape handling.",
      "Return actionable client errors for fast correction.",
    ],
    howWeDo: [
      "Apply defensive validations at API boundary.",
      "Use deterministic exception handling.",
      "Emit predictable JSON response contracts.",
    ],
    outcomes: [
      "Lower ingestion failures",
      "Faster issue resolution",
      "Stronger runtime resilience",
    ],
  },
  {
    slug: "dataset-governance",
    category: "Governance",
    title: "Dataset Governance",
    summary: "Control dataset lineage and quality for retraining programs.",
    problemStatement:
      "Retraining without dataset controls can introduce bias, leakage, and performance regression.",
    whatWeDo: [
      "Track source datasets and augmentation lineage.",
      "Define quality checks before retraining runs.",
      "Link metrics back to data revisions.",
    ],
    howWeDo: [
      "Use reproducible data prep scripts.",
      "Capture extraction statistics and class distributions.",
      "Store training artifacts with version metadata.",
    ],
    outcomes: [
      "More trustworthy retraining",
      "Better reproducibility",
      "Reduced governance risk",
    ],
  },
  {
    slug: "drift-monitoring",
    category: "Quality",
    title: "Drift Monitoring",
    summary: "Detect prediction drift before it impacts clinical confidence.",
    problemStatement:
      "Data and workflow changes can silently degrade model behavior in production.",
    whatWeDo: [
      "Monitor confidence distribution movement.",
      "Track threshold-trigger rates by site and shift.",
      "Alert teams to suspicious trend changes.",
    ],
    howWeDo: [
      "Establish baseline score profiles.",
      "Run periodic drift checks with governance alerts.",
      "Tie drift signals to retraining evaluation plans.",
    ],
    outcomes: [
      "Earlier issue detection",
      "Smarter retraining timing",
      "Higher operational confidence",
    ],
  },
  {
    slug: "false-negative-watch",
    category: "Quality",
    title: "False Negative Watch",
    summary: "Prioritize review workflows around missed-stone risk.",
    problemStatement:
      "False negatives are the highest-risk failure mode in stone detection pathways.",
    whatWeDo: [
      "Create dedicated review cohorts for low-score but clinically suspicious cases.",
      "Track false-negative patterns by context.",
      "Feed findings into threshold and model policy.",
    ],
    howWeDo: [
      "Blend model output with clinical follow-up outcomes.",
      "Escalate high-risk disagreement cases.",
      "Maintain an action log for quality board reviews.",
    ],
    outcomes: [
      "Improved safety posture",
      "Better threshold governance",
      "Sharper quality interventions",
    ],
  },
  {
    slug: "performance-dashboard",
    category: "Business",
    title: "Performance Dashboard",
    summary: "Executive view of throughput, quality, and reliability trends.",
    problemStatement:
      "Leaders need concise cross-functional visibility, not raw logs.",
    whatWeDo: [
      "Aggregate key operational and model indicators.",
      "Translate technical metrics into business impact.",
      "Support weekly governance briefings.",
    ],
    howWeDo: [
      "Combine API telemetry with workflow KPIs.",
      "Show trend movement over clinically relevant windows.",
      "Surface exceptions with investigation links.",
    ],
    outcomes: [
      "Faster executive decisions",
      "Clear operational priorities",
      "Data-backed strategy alignment",
    ],
  },
  {
    slug: "regulatory-prep",
    category: "Governance",
    title: "Regulatory Preparation",
    summary: "Organize evidence and controls for compliance readiness.",
    problemStatement:
      "Regulatory conversations require structured proof of controls, traceability, and risk mitigation.",
    whatWeDo: [
      "Compile evidence around validation, monitoring, and governance.",
      "Map operational controls to compliance expectations.",
      "Prepare review-ready documentation sets.",
    ],
    howWeDo: [
      "Use standardized artifact templates.",
      "Collect endpoint behavior evidence from runtime checks.",
      "Align release and audit logs for traceability.",
    ],
    outcomes: [
      "Smoother regulatory conversations",
      "Reduced documentation scramble",
      "Higher compliance confidence",
    ],
  },
  {
    slug: "security-center",
    category: "Platform",
    title: "Security Center",
    summary:
      "Operational security controls for image handling and service access.",
    problemStatement:
      "Clinical AI services face elevated security expectations in production environments.",
    whatWeDo: [
      "Constrain API exposure and input surfaces.",
      "Harden runtime behavior against malformed inputs.",
      "Support explicit CORS and service policy controls.",
    ],
    howWeDo: [
      "Apply boundary validation and predictable errors.",
      "Use allowlist-based origin policies.",
      "Deploy on hardened serving stack for demos and production.",
    ],
    outcomes: [
      "Lower attack surface",
      "Safer runtime operation",
      "Improved trust with security teams",
    ],
  },
  {
    slug: "access-control",
    category: "Platform",
    title: "Access Control",
    summary:
      "Role-based access strategy for clinical and operational workflows.",
    problemStatement:
      "Teams need strict role boundaries across clinical reviewers, operators, and administrators.",
    whatWeDo: [
      "Define workflow permissions by role.",
      "Limit sensitive action paths to approved personas.",
      "Support auditable access updates.",
    ],
    howWeDo: [
      "Separate read, triage, and admin actions.",
      "Integrate access policy checks into route-level controls.",
      "Log access changes for governance review.",
    ],
    outcomes: [
      "Better least-privilege enforcement",
      "Clear accountability",
      "Reduced unauthorized workflow risk",
    ],
  },
  {
    slug: "integration-apis",
    category: "Platform",
    title: "Integration APIs",
    summary:
      "Connect detection output with hospital systems and workflow tools.",
    problemStatement:
      "Standalone AI output has limited value unless it integrates cleanly with operational systems.",
    whatWeDo: [
      "Provide predictable JSON contracts for downstream systems.",
      "Enable consistent payload consumption by EMR and workflow engines.",
      "Keep API behavior deterministic across versions.",
    ],
    howWeDo: [
      "Maintain explicit response fields for decisions and context.",
      "Use lightweight health and readiness probes for integrators.",
      "Version and document endpoint contracts.",
    ],
    outcomes: [
      "Faster system integration",
      "Lower interface ambiguity",
      "Stronger interoperability",
    ],
  },
  {
    slug: "edge-sites",
    category: "Platform",
    title: "Edge Site Enablement",
    summary:
      "Deploy reliable stone detection workflows at distributed care sites.",
    problemStatement:
      "Distributed facilities need stable local workflows despite varied infrastructure maturity.",
    whatWeDo: [
      "Provide a compact serving stack suitable for edge deployments.",
      "Preserve the same decision contract across central and edge sites.",
      "Support controlled rollout by location.",
    ],
    howWeDo: [
      "Use portable WSGI deployment patterns.",
      "Keep health and readiness probes consistent.",
      "Track site-level reliability metrics.",
    ],
    outcomes: [
      "Faster site onboarding",
      "Consistent care logic",
      "Lower operational variance",
    ],
  },
  {
    slug: "cloud-ops",
    category: "Platform",
    title: "Cloud Operations",
    summary:
      "Operate AI detection services with production-grade cloud discipline.",
    problemStatement:
      "Unmanaged cloud operations can introduce instability, cost drift, and unclear ownership.",
    whatWeDo: [
      "Standardize deployment and observability practices.",
      "Track runtime behavior and service health continuously.",
      "Support clean rollback for risky releases.",
    ],
    howWeDo: [
      "Use repeatable startup and readiness policies.",
      "Combine endpoint probes with alerting thresholds.",
      "Document operating runbooks for incident response.",
    ],
    outcomes: [
      "More resilient cloud runtime",
      "Clearer operational ownership",
      "Improved uptime consistency",
    ],
  },
  {
    slug: "enterprise-sla",
    category: "Business",
    title: "Enterprise SLA Management",
    summary:
      "Monitor and improve adherence to enterprise response commitments.",
    problemStatement:
      "Enterprise healthcare programs require evidence of reliability and response consistency.",
    whatWeDo: [
      "Track service readiness and response patterns against SLA targets.",
      "Surface at-risk windows before breaches occur.",
      "Support proactive operations planning.",
    ],
    howWeDo: [
      "Map endpoint reliability metrics to SLA indicators.",
      "Use trend analytics for forecasted risk.",
      "Publish SLA snapshots for leadership reviews.",
    ],
    outcomes: [
      "Higher SLA adherence",
      "Fewer surprise incidents",
      "Better executive confidence",
    ],
  },
  {
    slug: "training-center",
    category: "Business",
    title: "Training Center",
    summary:
      "Onboard clinicians and operators with role-specific learning paths.",
    problemStatement:
      "Adoption slows when teams do not understand confidence signals and workflow implications.",
    whatWeDo: [
      "Provide practical training modules around decision interpretation.",
      "Tailor guidance to each clinical and operational role.",
      "Shorten time-to-confidence after rollout.",
    ],
    howWeDo: [
      "Use scenario-based demos with real API outputs.",
      "Highlight threshold behavior through examples.",
      "Track completion and competency markers.",
    ],
    outcomes: [
      "Faster adoption",
      "Lower misuse risk",
      "Stronger team confidence",
    ],
  },
  {
    slug: "implementation-playbook",
    category: "Business",
    title: "Implementation Playbook",
    summary: "Structured deployment playbook from pilot to enterprise rollout.",
    problemStatement:
      "Many healthcare AI projects stall between pilot success and scaled implementation.",
    whatWeDo: [
      "Define phased rollout milestones and ownership.",
      "Set readiness criteria for each stage.",
      "Reduce friction between technical and clinical teams.",
    ],
    howWeDo: [
      "Standardize environment setup and validation checks.",
      "Sequence adoption by use case and site maturity.",
      "Run checkpoint reviews before each scale step.",
    ],
    outcomes: [
      "Predictable implementation pace",
      "Lower rollout risk",
      "Clear stakeholder alignment",
    ],
  },
  {
    slug: "roi-calculator",
    category: "Business",
    title: "ROI Calculator",
    summary:
      "Quantify operational and clinical value from stone-focused AI workflows.",
    problemStatement:
      "Sponsors need measurable value narratives to justify scaling and long-term investment.",
    whatWeDo: [
      "Translate throughput and quality gains into economic impact.",
      "Model value scenarios by hospital profile.",
      "Support board-level decision conversations.",
    ],
    howWeDo: [
      "Map workflow metrics to cost and capacity assumptions.",
      "Track baseline versus post-deployment trends.",
      "Generate executive-ready value snapshots.",
    ],
    outcomes: [
      "Clearer investment case",
      "Data-backed scaling decisions",
      "Stronger sponsor confidence",
    ],
  },
  {
    slug: "executive-briefing",
    category: "Business",
    title: "Executive Briefing Deck",
    summary: "Leadership narrative for operational impact and risk posture.",
    problemStatement:
      "Executives need concise AI impact stories tied to measurable performance indicators.",
    whatWeDo: [
      "Frame operational performance in strategic terms.",
      "Highlight safety, quality, and reliability indicators.",
      "Support stakeholder alignment before major decisions.",
    ],
    howWeDo: [
      "Curate key charts from dashboard and audit sources.",
      "Connect metrics to business outcomes.",
      "Summarize current risks and mitigations.",
    ],
    outcomes: [
      "Sharper executive alignment",
      "Faster decision cycles",
      "Clearer strategic communication",
    ],
  },
  {
    slug: "live-demo-lab",
    category: "Business",
    title: "Live Demo Lab",
    summary:
      "Purpose-built demonstration experience for supervisors and stakeholders.",
    problemStatement:
      "Demo environments often fail because they lack production-style readiness checks and narrative flow.",
    whatWeDo: [
      "Provide a polished demo journey from landing to decision outcome.",
      "Show readiness, predictability, and confidence transparency in real time.",
      "Support stakeholder Q and A with defensible output signals.",
    ],
    howWeDo: [
      "Use production-style serving with readiness probes.",
      "Present clear stone versus non-stone decision payloads.",
      "Link every screen to operational value messaging.",
    ],
    outcomes: [
      "Stronger demo confidence",
      "Better supervisor buy-in",
      "Clear path to next-phase approval",
    ],
  },
];

export const SOLUTIONS_COUNT = SOLUTION_PAGES.length;

export const FEATURED_SOLUTION_SLUGS = [
  "stone-risk-screening",
  "emergency-triage",
  "radiology-worklist",
  "drift-monitoring",
  "security-center",
  "live-demo-lab",
];

export const FEATURED_SOLUTIONS = SOLUTION_PAGES.filter((page) =>
  FEATURED_SOLUTION_SLUGS.includes(page.slug),
);
