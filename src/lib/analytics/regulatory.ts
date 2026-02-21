// ============================================================
// TERRAIN — Regulatory Intelligence Analysis Engine
// Analyzes regulatory pathways, designation eligibility,
// timelines, risks, and comparable approvals.
// ============================================================

import type {
  RegulatoryOutput,
  RegulatoryPathway,
  DesignationOpportunity,
  RegulatoryRisk,
  ComparableApproval,
  DataSource,
  RegulatoryAgency,
  DevelopmentStage,
} from '@/types';

import {
  REGULATORY_PATHWAYS,
  DESIGNATION_DEFINITIONS,
  COMPARABLE_APPROVALS,
  type RegulatoryPathwayDefinition,
  type ComparableApprovalRecord,
} from '@/lib/data/regulatory-pathways';

import { INDICATION_DATA } from '@/lib/data/indication-map';

// ────────────────────────────────────────────────────────────
// INPUT INTERFACE (server-side analysis)
// ────────────────────────────────────────────────────────────

export interface RegulatoryAnalysisInput {
  indication: string;
  product_type: 'pharmaceutical' | 'biologic' | 'device' | 'diagnostic';
  development_stage: DevelopmentStage;
  mechanism?: string;
  geography: RegulatoryAgency[];
  unmet_need: 'high' | 'medium' | 'low';
  has_orphan_potential: boolean;
}

// ────────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ────────────────────────────────────────────────────────────

export async function analyzeRegulatory(
  input: RegulatoryAnalysisInput,
): Promise<RegulatoryOutput> {
  const primaryAgency = input.geography[0] ?? 'FDA';

  // 1. Recommend pathway
  const recommendedPathway = recommendPathway(input, primaryAgency);

  // 2. Estimate timeline
  const timeline = estimateTimeline(input, recommendedPathway.primary);

  // 3. Score designation opportunities
  const designations = scoreDesignations(input, primaryAgency);

  // 4. Find comparable approvals
  const comparables = findComparableApprovals(input);

  // 5. Assess risks
  const risks = assessRisks(input, recommendedPathway.primary);

  // 6. Determine review division and advisory committee likelihood
  const reviewDivision = getReviewDivision(input, primaryAgency);
  const advisoryCommitteeLikely = isAdvisoryCommitteeLikely(input);

  return {
    recommended_pathway: recommendedPathway,
    timeline_estimate: timeline,
    designation_opportunities: designations,
    key_risks: risks,
    comparable_approvals: comparables,
    review_division: reviewDivision,
    advisory_committee_likely: advisoryCommitteeLikely,
    data_sources: getDataSources(),
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// PATHWAY RECOMMENDATION
// ────────────────────────────────────────────────────────────

function mapProductType(
  pt: RegulatoryAnalysisInput['product_type'],
): RegulatoryPathwayDefinition['product_type'] {
  switch (pt) {
    case 'pharmaceutical':
      return 'pharma';
    case 'biologic':
      return 'pharma';
    case 'device':
      return 'device';
    case 'diagnostic':
      return 'diagnostic';
    default:
      return 'pharma';
  }
}

function recommendPathway(
  input: RegulatoryAnalysisInput,
  agency: RegulatoryAgency,
): { primary: RegulatoryPathway; alternatives: RegulatoryPathway[]; rationale: string } {
  const productType = mapProductType(input.product_type);

  // Filter pathways by agency and product type
  let candidates = REGULATORY_PATHWAYS.filter(
    (p) => p.agency === agency && p.product_type === productType,
  );

  // Also include special designations for this agency
  const designationPaths = REGULATORY_PATHWAYS.filter(
    (p) =>
      p.agency === agency &&
      p.product_type === 'pharma' &&
      (p.pathway.includes('Orphan') ||
        p.pathway.includes('Rare Pediatric')),
  );

  if (candidates.length === 0) {
    // Fall back to pharma pathways for the agency
    candidates = REGULATORY_PATHWAYS.filter(
      (p) => p.agency === agency && p.product_type === 'pharma',
    );
  }

  // Score each candidate
  const scored = candidates.map((c) => ({
    pathway: c,
    score: scorePathway(c, input),
  }));

  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0]?.pathway;
  const alternatives = scored.slice(1, 4).map((s) => s.pathway);

  // Build rationale
  const rationale = buildPathwayRationale(input, primary, designationPaths);

  return {
    primary: formatPathway(primary),
    alternatives: alternatives.map(formatPathway),
    rationale,
  };
}

function scorePathway(
  pathway: RegulatoryPathwayDefinition,
  input: RegulatoryAnalysisInput,
): number {
  let score = 0;

  // Base: prefer higher success rates
  score += pathway.success_rate * 40;

  // Faster timelines score higher when unmet need is high
  if (input.unmet_need === 'high') {
    const timelineScore = Math.max(0, 40 - pathway.total_timeline_months);
    score += timelineScore;
  }

  // Accelerated pathways preferred for high unmet need + orphan
  if (
    input.unmet_need === 'high' &&
    input.has_orphan_potential &&
    (pathway.pathway.includes('Accelerated') ||
      pathway.pathway.includes('Breakthrough') ||
      pathway.pathway.includes('SAKIGAKE') ||
      pathway.pathway.includes('Conditional'))
  ) {
    score += 25;
  }

  // Biologics should prefer BLA
  if (
    input.product_type === 'biologic' &&
    pathway.pathway.includes('BLA')
  ) {
    score += 20;
  }

  // Standard NDA is baseline for pharma
  if (
    input.product_type === 'pharmaceutical' &&
    pathway.pathway === 'Standard NDA'
  ) {
    score += 10;
  }

  // 505(b)(2) gets a bonus only if this seems like a reformulation
  // (deduct for novel mechanisms)
  if (pathway.pathway.includes('505(b)(2)')) {
    score -= 5; // Usually not the primary recommendation for novel drugs
  }

  // ANDA scores very low for novel drugs
  if (pathway.pathway.includes('ANDA')) {
    score -= 40;
  }

  // Devices: match pathway to risk
  if (input.product_type === 'device') {
    if (pathway.pathway.includes('510(k)') && input.unmet_need === 'low') {
      score += 15;
    }
    if (pathway.pathway.includes('PMA') && input.unmet_need === 'high') {
      score += 10;
    }
    if (pathway.pathway.includes('De Novo')) {
      score += 5; // Modest bonus for novel devices
    }
  }

  // Priority Review and similar are not standalone pathways; they layer on
  if (pathway.pathway === 'Priority Review' || pathway.pathway === 'Fast Track') {
    score -= 10; // These are designations, not primary pathways
  }

  return score;
}

function formatPathway(def: RegulatoryPathwayDefinition): RegulatoryPathway {
  return {
    name: def.pathway,
    description: def.description,
    typical_review_months: def.typical_review_months,
    requirements: def.key_requirements,
    data_package_requirements: def.key_requirements.filter(
      (r) =>
        r.toLowerCase().includes('clinical') ||
        r.toLowerCase().includes('data') ||
        r.toLowerCase().includes('study') ||
        r.toLowerCase().includes('cmc') ||
        r.toLowerCase().includes('nonclinical'),
    ),
    precedents: def.advantages.slice(0, 3),
  };
}

function buildPathwayRationale(
  input: RegulatoryAnalysisInput,
  primary: RegulatoryPathwayDefinition,
  _designationPaths: RegulatoryPathwayDefinition[],
): string {
  const parts: string[] = [];

  parts.push(
    `Based on the product profile (${input.product_type}, ${input.indication}), the recommended primary pathway is ${primary.pathway}.`,
  );

  if (input.unmet_need === 'high') {
    parts.push(
      'Given the high unmet medical need, expedited designations (Breakthrough Therapy, Fast Track) should be pursued aggressively to reduce development timelines and enable early FDA engagement.',
    );
  }

  if (input.has_orphan_potential) {
    parts.push(
      'Orphan Drug Designation should be pursued early to secure 7-year market exclusivity, PDUFA fee waiver, and tax credits for clinical development costs.',
    );
  }

  if (input.product_type === 'biologic') {
    parts.push(
      'As a biologic product, this will be submitted as a BLA under Section 351(a) of the PHS Act, providing 12-year data exclusivity and limited biosimilar competition.',
    );
  }

  const indicationData = findIndicationData(input.indication);
  if (indicationData && indicationData.us_prevalence < 200000) {
    parts.push(
      `With an estimated US prevalence of ${indicationData.us_prevalence.toLocaleString()}, this indication qualifies for Orphan Drug Designation (fewer than 200,000 patients).`,
    );
  }

  parts.push(
    `The ${primary.pathway} pathway has a historical success rate of ${(primary.success_rate * 100).toFixed(0)}% and a typical total timeline of ${primary.total_timeline_months} months.`,
  );

  return parts.join(' ');
}

// ────────────────────────────────────────────────────────────
// TIMELINE ESTIMATION
// ────────────────────────────────────────────────────────────

const STAGE_TO_REMAINING_MONTHS: Record<DevelopmentStage, { optimistic: number; realistic: number; pessimistic: number }> = {
  preclinical: { optimistic: 60, realistic: 84, pessimistic: 120 },
  phase1: { optimistic: 42, realistic: 60, pessimistic: 84 },
  phase2: { optimistic: 24, realistic: 42, pessimistic: 60 },
  phase3: { optimistic: 12, realistic: 24, pessimistic: 36 },
  approved: { optimistic: 0, realistic: 0, pessimistic: 0 },
};

function estimateTimeline(
  input: RegulatoryAnalysisInput,
  primaryPathway: RegulatoryPathway,
): RegulatoryOutput['timeline_estimate'] {
  const baseTimeline = STAGE_TO_REMAINING_MONTHS[input.development_stage];

  // Apply adjustments for unmet need (faster for high unmet need with expedited programs)
  let optimisticAdj = 0;
  let realisticAdj = 0;
  let pessimisticAdj = 0;

  if (input.unmet_need === 'high') {
    optimisticAdj -= 6;
    realisticAdj -= 3;
  } else if (input.unmet_need === 'low') {
    realisticAdj += 6;
    pessimisticAdj += 6;
  }

  // Orphan / rare disease adjustments (smaller trials, sometimes faster enrollment)
  if (input.has_orphan_potential) {
    optimisticAdj -= 3;
    realisticAdj -= 3;
    // But enrollment can be slow for rare diseases
    pessimisticAdj += 6;
  }

  // Add review time
  const reviewMonths = primaryPathway.typical_review_months;

  const totalOptimistic = Math.max(
    0,
    baseTimeline.optimistic + optimisticAdj + reviewMonths,
  );
  const totalRealistic = Math.max(
    0,
    baseTimeline.realistic + realisticAdj + reviewMonths,
  );
  const totalPessimistic = Math.max(
    0,
    baseTimeline.pessimistic + pessimisticAdj + reviewMonths,
  );

  // Build milestone estimates based on current stage
  const now = new Date();
  const milestones: Record<string, string | undefined> = {};

  if (input.development_stage === 'preclinical') {
    milestones.ind_submission_target = addMonths(now, 6).toISOString();
    milestones.phase1_completion = addMonths(now, 24).toISOString();
    milestones.phase2_completion = addMonths(now, 48).toISOString();
    milestones.phase3_completion = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths + 2).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  } else if (input.development_stage === 'phase1') {
    milestones.phase1_completion = addMonths(now, 12).toISOString();
    milestones.phase2_completion = addMonths(now, 30).toISOString();
    milestones.phase3_completion = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths + 2).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  } else if (input.development_stage === 'phase2') {
    milestones.phase2_completion = addMonths(now, 12).toISOString();
    milestones.phase3_completion = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths + 2).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  } else if (input.development_stage === 'phase3') {
    milestones.phase3_completion = addMonths(now, 12).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  }

  return {
    ind_submission_target: milestones.ind_submission_target,
    phase1_completion: milestones.phase1_completion,
    phase2_completion: milestones.phase2_completion,
    phase3_completion: milestones.phase3_completion,
    bla_nda_submission: milestones.bla_nda_submission,
    approval_estimate: milestones.approval_estimate,
    total_to_approval: {
      optimistic: totalOptimistic,
      realistic: totalRealistic,
      pessimistic: totalPessimistic,
    },
  };
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ────────────────────────────────────────────────────────────
// DESIGNATION ELIGIBILITY SCORING
// ────────────────────────────────────────────────────────────

function scoreDesignations(
  input: RegulatoryAnalysisInput,
  agency: RegulatoryAgency,
): DesignationOpportunity[] {
  const relevantDesignations = DESIGNATION_DEFINITIONS.filter(
    (d) => d.agency === agency,
  );

  return relevantDesignations.map((def) => {
    const { eligibility, criteriaMet, criteriaUnmet } = assessEligibility(
      def,
      input,
    );

    let timeSavings: string | undefined;
    if (def.typical_timeline_reduction_months > 0) {
      timeSavings = `Up to ${def.typical_timeline_reduction_months} months reduction in development or review timeline.`;
    }

    return {
      designation: def.name as DesignationOpportunity['designation'],
      eligibility,
      key_criteria_met: criteriaMet,
      key_criteria_unmet: criteriaUnmet,
      benefit: def.benefit,
      application_timing: def.application_timing,
      estimated_time_savings: timeSavings,
    };
  });
}

function assessEligibility(
  def: (typeof DESIGNATION_DEFINITIONS)[number],
  input: RegulatoryAnalysisInput,
): {
  eligibility: 'likely' | 'possible' | 'unlikely';
  criteriaMet: string[];
  criteriaUnmet: string[];
} {
  const criteriaMet: string[] = [];
  const criteriaUnmet: string[] = [];
  let score = 0;

  // Common checks across all designations
  const indicationData = findIndicationData(input.indication);
  const isRare = indicationData ? indicationData.us_prevalence < 200000 : input.has_orphan_potential;
  const isSeriousCondition = input.unmet_need === 'high' || input.unmet_need === 'medium';

  switch (def.id) {
    case 'breakthrough_therapy': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious or life-threatening condition');
        score += 30;
      } else {
        criteriaUnmet.push('Condition may not meet "serious or life-threatening" threshold');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet medical need — limited or no effective alternatives');
        score += 30;
      } else if (input.unmet_need === 'medium') {
        criteriaMet.push('Moderate unmet need — some alternatives exist');
        score += 15;
      } else {
        criteriaUnmet.push('Low unmet need — multiple effective treatments available');
      }
      if (input.development_stage === 'phase1' || input.development_stage === 'phase2') {
        criteriaMet.push('Clinical data available to support substantial improvement claim');
        score += 20;
      } else if (input.development_stage === 'preclinical') {
        criteriaUnmet.push('Preliminary clinical evidence required — preclinical data insufficient');
      } else {
        criteriaMet.push('Late-stage data available (though earlier application is typical)');
        score += 10;
      }
      break;
    }

    case 'fast_track': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious or life-threatening condition');
        score += 35;
      } else {
        criteriaUnmet.push('Condition may not meet "serious" threshold');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('Demonstrates potential to address unmet medical need');
        score += 35;
      } else if (input.unmet_need === 'medium') {
        criteriaMet.push('Some potential to address medical need, though alternatives exist');
        score += 20;
      } else {
        criteriaUnmet.push('Unmet medical need bar may not be met with existing treatments available');
      }
      // Fast Track can be obtained early
      criteriaMet.push('Can be requested at any stage of development');
      score += 10;
      break;
    }

    case 'priority_review': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious condition');
        score += 30;
      } else {
        criteriaUnmet.push('Must treat a serious condition');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('Significant improvement over available therapy expected');
        score += 40;
      } else if (input.unmet_need === 'medium') {
        criteriaMet.push('Some improvement over available therapy possible');
        score += 20;
      } else {
        criteriaUnmet.push('Significant improvement over existing therapy not demonstrated');
      }
      break;
    }

    case 'accelerated_approval': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious condition with unmet need');
        score += 25;
      } else {
        criteriaUnmet.push('Must treat a serious condition with unmet need');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet need supports accelerated pathway');
        score += 25;
      } else {
        criteriaUnmet.push('Unmet need may not justify accelerated pathway');
      }
      // Check if surrogate endpoint is likely available
      if (input.product_type === 'biologic' || input.product_type === 'pharmaceutical') {
        criteriaMet.push('Surrogate or intermediate clinical endpoint may be available for this product type');
        score += 15;
      }
      if (indicationData && indicationData.therapy_area === 'oncology') {
        criteriaMet.push('Oncology indications frequently use surrogate endpoints (ORR, PFS)');
        score += 15;
      } else {
        criteriaUnmet.push('Validated surrogate endpoint availability should be confirmed for this indication');
      }
      break;
    }

    case 'orphan_drug': {
      if (isRare) {
        criteriaMet.push('Disease affects fewer than 200,000 persons in the US');
        score += 60;
      } else {
        criteriaUnmet.push('Disease prevalence exceeds 200,000 US patients — standard orphan threshold not met');
      }
      if (input.has_orphan_potential) {
        criteriaMet.push('Sponsor has identified orphan drug potential');
        score += 15;
      }
      // Can be applied at any stage
      criteriaMet.push('Designation available at any development stage');
      score += 5;
      break;
    }

    case 'rmat': {
      if (input.product_type === 'biologic') {
        criteriaMet.push('Product may qualify as regenerative medicine therapy');
        score += 25;
      } else {
        criteriaUnmet.push('RMAT designation requires a regenerative medicine therapy (cell, gene, tissue engineering)');
        score -= 30;
      }
      if (isSeriousCondition) {
        criteriaMet.push('Treats serious condition');
        score += 20;
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet need supports RMAT designation');
        score += 20;
      }
      break;
    }

    case 'prime': {
      if (isSeriousCondition) {
        criteriaMet.push('Product targets a condition with unmet medical need in the EU');
        score += 30;
      } else {
        criteriaUnmet.push('Must target unmet medical need in EU');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet need supports PRIME eligibility');
        score += 30;
      } else if (input.unmet_need === 'medium') {
        score += 15;
      }
      if (input.development_stage === 'phase1' || input.development_stage === 'phase2') {
        criteriaMet.push('Preliminary clinical data available for PRIME assessment');
        score += 15;
      } else if (input.development_stage === 'preclinical') {
        criteriaUnmet.push('Clinical data typically required (except for SMEs/academic sponsors)');
      }
      break;
    }

    case 'sakigake': {
      if (input.unmet_need === 'high') {
        criteriaMet.push('Serious condition with high unmet need in Japan');
        score += 30;
      } else {
        criteriaUnmet.push('Must target disease with serious impact and high unmet need');
      }
      if (input.mechanism) {
        criteriaMet.push('Novel mechanism of action may qualify as innovative');
        score += 20;
      }
      criteriaUnmet.push('Requires Japan-first or simultaneous global development commitment');
      score -= 10; // Often difficult to commit to Japan-first
      break;
    }
  }

  let eligibility: 'likely' | 'possible' | 'unlikely';
  if (score >= 60) {
    eligibility = 'likely';
  } else if (score >= 30) {
    eligibility = 'possible';
  } else {
    eligibility = 'unlikely';
  }

  return { eligibility, criteriaMet, criteriaUnmet };
}

// ────────────────────────────────────────────────────────────
// COMPARABLE APPROVALS
// ────────────────────────────────────────────────────────────

function findComparableApprovals(
  input: RegulatoryAnalysisInput,
): ComparableApproval[] {
  const indicationData = findIndicationData(input.indication);
  const therapyArea = indicationData?.therapy_area ?? '';

  // Find by therapy area first
  let matches = COMPARABLE_APPROVALS.filter(
    (a) => a.therapy_area.toLowerCase() === therapyArea.toLowerCase(),
  );

  // If not enough matches, broaden to all
  if (matches.length < 3) {
    matches = [...COMPARABLE_APPROVALS];
  }

  // Score by relevance
  const scored = matches.map((a) => ({
    approval: a,
    score: scoreComparable(a, input, therapyArea),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map((s) => formatComparable(s.approval));
}

function scoreComparable(
  approval: ComparableApprovalRecord,
  input: RegulatoryAnalysisInput,
  therapyArea: string,
): number {
  let score = 0;

  // Same therapy area
  if (approval.therapy_area.toLowerCase() === therapyArea.toLowerCase()) {
    score += 40;
  }

  // Same product type
  if (
    (input.product_type === 'biologic' && approval.product_type === 'biologic') ||
    (input.product_type === 'pharmaceutical' && approval.product_type === 'pharma')
  ) {
    score += 20;
  }

  // Orphan overlap
  if (input.has_orphan_potential && approval.designations.includes('Orphan Drug')) {
    score += 15;
  }

  // Recent approvals more relevant
  if (approval.approval_year >= 2022) {
    score += 15;
  } else if (approval.approval_year >= 2019) {
    score += 10;
  }

  // Has similar designations
  if (input.unmet_need === 'high' && approval.designations.includes('Breakthrough Therapy')) {
    score += 10;
  }

  return score;
}

function formatComparable(record: ComparableApprovalRecord): ComparableApproval {
  return {
    drug: record.drug,
    company: record.company,
    indication: record.indication,
    pathway: record.pathway,
    designations: record.designations,
    ind_to_bla_months: record.total_development_months - record.review_months,
    review_months: record.review_months,
    approval_year: record.approval_year,
    accelerated:
      record.pathway.includes('Accelerated') ||
      record.designations.includes('Accelerated Approval'),
  };
}

// ────────────────────────────────────────────────────────────
// RISK ASSESSMENT
// ────────────────────────────────────────────────────────────

function assessRisks(
  input: RegulatoryAnalysisInput,
  primaryPathway: RegulatoryPathway,
): RegulatoryRisk[] {
  const risks: RegulatoryRisk[] = [];

  // Clinical data risks
  if (input.development_stage === 'preclinical' || input.development_stage === 'phase1') {
    risks.push({
      risk: 'Early-stage development: limited clinical data increases regulatory uncertainty. Pivotal trial design may change substantially based on early results.',
      severity: 'high',
      mitigation: 'Engage FDA via Pre-IND meeting (Type B) and End-of-Phase 2 meeting to align on pivotal trial design, endpoints, and patient population before committing to Phase 3.',
    });
  }

  // Endpoint risk
  if (primaryPathway.name.includes('Accelerated')) {
    risks.push({
      risk: 'Accelerated Approval requires post-marketing confirmatory trial. Under FDORA 2022, FDA has strengthened enforcement and expedited withdrawal authority if confirmatory trial fails.',
      severity: 'high',
      mitigation: 'Design confirmatory trial protocol before filing for Accelerated Approval. Ensure statistical plan and enrollment feasibility are robust. Consider initiating confirmatory trial before approval.',
    });
  }

  // Manufacturing risks for biologics
  if (input.product_type === 'biologic') {
    risks.push({
      risk: 'Biologic manufacturing complexity: pre-approval inspection (PAI) failures can delay approval by 6-12 months. Immunogenicity risk may require extensive characterization.',
      severity: 'medium',
      mitigation: 'Begin manufacturing process validation early. Ensure CMC package is submission-ready before BLA filing. Conduct pre-PAI readiness assessments.',
    });
  }

  // Advisory committee risk
  if (isAdvisoryCommitteeLikely(input)) {
    risks.push({
      risk: 'FDA Advisory Committee (AdCom) meeting is likely for this product profile. Unfavorable AdCom vote can delay or prevent approval, even though FDA is not bound by the vote.',
      severity: 'medium',
      mitigation: 'Prepare comprehensive AdCom briefing document. Conduct mock advisory committee with external KOLs. Develop patient advocacy support strategy.',
    });
  }

  // Competition risk
  if (input.unmet_need === 'low') {
    risks.push({
      risk: 'Low unmet medical need: FDA may require larger comparative trials rather than single-arm studies. Active comparator trial design increases cost, timeline, and regulatory complexity.',
      severity: 'medium',
      mitigation: 'Conduct thorough competitive landscape analysis. Consider biomarker-selected patient population to demonstrate superiority in a subgroup even if non-inferior overall.',
    });
  }

  // Orphan-specific risks
  if (input.has_orphan_potential) {
    risks.push({
      risk: 'Rare disease clinical trial enrollment: small patient population makes recruitment challenging. Single-arm studies may face FDA pushback on external controls.',
      severity: 'medium',
      mitigation: 'Establish global clinical trial network with rare disease centers of excellence. Consider natural history study to establish external control arm. Leverage patient registries for enrollment.',
    });
  }

  // Device-specific risks
  if (input.product_type === 'device') {
    risks.push({
      risk: 'Medical device development uncertainty: predicate device identification (510k) or novel classification (De Novo) may change during FDA engagement. IDE clinical trial design may require modification.',
      severity: 'medium',
      mitigation: 'Submit Pre-Submission (Q-Sub) to FDA early. Clearly define intended use and indications for use. Identify predicate devices and prepare substantial equivalence arguments before formal submission.',
    });
  }

  // Regulatory landscape change
  risks.push({
    risk: 'Evolving regulatory landscape: FDA guidance documents, review division reorganizations, and policy changes (e.g., FDA user fee reauthorization, FDORA provisions) may affect the review pathway or requirements.',
    severity: 'low',
    mitigation: 'Maintain ongoing regulatory intelligence monitoring. Engage external regulatory consultants familiar with the relevant review division. Participate in industry trade group regulatory policy discussions.',
  });

  // Labeling/commercial risk
  risks.push({
    risk: 'Label negotiation: FDA-approved labeling may be narrower than desired (restricted indication, boxed warning, REMS requirement), limiting commercial potential.',
    severity: 'medium',
    mitigation: 'Negotiate labeling early in the review process. Design clinical program to support broadest possible label. Consider post-marketing commitments to expand indications.',
  });

  return risks;
}

// ────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

function findIndicationData(
  indication: string,
): (typeof INDICATION_DATA)[number] | undefined {
  const normalized = indication.toLowerCase();
  return INDICATION_DATA.find(
    (ind) =>
      ind.name.toLowerCase() === normalized ||
      ind.synonyms.some((s) => s.toLowerCase() === normalized),
  );
}

function getReviewDivision(
  input: RegulatoryAnalysisInput,
  agency: RegulatoryAgency,
): string {
  if (agency !== 'FDA') {
    return agency === 'EMA'
      ? 'CHMP (Committee for Medicinal Products for Human Use)'
      : 'PMDA Review Division';
  }

  const indicationData = findIndicationData(input.indication);
  const ta = indicationData?.therapy_area?.toLowerCase() ?? '';

  if (input.product_type === 'device') {
    return 'CDRH (Center for Devices and Radiological Health)';
  }
  if (input.product_type === 'diagnostic') {
    return 'CDRH - Office of In Vitro Diagnostics';
  }

  // CDER/CBER routing
  if (ta === 'oncology') {
    return input.product_type === 'biologic'
      ? 'CDER - Office of Oncologic Diseases (OOD) / CBER for cell/gene therapies'
      : 'CDER - Office of Oncologic Diseases (OOD)';
  }
  if (ta === 'neurology') return 'CDER - Office of Neuroscience';
  if (ta === 'immunology' || ta === 'autoimmune') return 'CDER - Office of Immunology and Inflammation';
  if (ta === 'rare_disease') return 'CDER - Office of Rare Diseases, Pediatrics, Urologic and Reproductive Medicine';
  if (ta === 'cardiology' || ta === 'cardiovascular') return 'CDER - Office of Cardiology, Hematology, Endocrinology, and Nephrology';
  if (ta === 'metabolic') return 'CDER - Office of Cardiology, Hematology, Endocrinology, and Nephrology';
  if (ta === 'infectious_disease') return 'CDER - Office of Infectious Diseases';
  if (ta === 'ophthalmology') return 'CDER - Office of Immunology and Inflammation';
  if (ta === 'respiratory') return 'CDER - Office of Immunology and Inflammation';

  return 'CDER (Center for Drug Evaluation and Research)';
}

function isAdvisoryCommitteeLikely(input: RegulatoryAnalysisInput): boolean {
  // AdCom more likely for: first-in-class, novel mechanisms, safety concerns, controversial indications
  if (input.product_type === 'biologic' && input.unmet_need === 'high') return true;
  if (input.development_stage === 'preclinical' || input.development_stage === 'phase1') return false;

  const indicationData = findIndicationData(input.indication);
  const ta = indicationData?.therapy_area?.toLowerCase() ?? '';

  // High-profile therapy areas often get AdCom
  if (ta === 'neurology' || ta === 'psychiatry') return true;
  if (ta === 'cardiology' || ta === 'cardiovascular') return true;

  return false;
}

function getDataSources(): DataSource[] {
  return [
    {
      name: 'FDA Drug Approvals Database',
      type: 'public',
      url: 'https://www.fda.gov/drugs/development-approval-process-drugs/drug-approvals-and-databases',
    },
    {
      name: 'FDA CDER Expedited Programs',
      type: 'public',
      url: 'https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/expedited-programs-serious-conditions',
    },
    {
      name: 'FDA CDRH Device Approvals',
      type: 'public',
      url: 'https://www.fda.gov/medical-devices/device-approvals-denials-and-clearances',
    },
    {
      name: 'EMA Centralised Procedure',
      type: 'public',
      url: 'https://www.ema.europa.eu/en/human-regulatory-overview/marketing-authorisation/centralised-procedure',
    },
    {
      name: 'PMDA Review Reports',
      type: 'public',
      url: 'https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0001.html',
    },
    {
      name: 'Terrain Regulatory Pathway Database',
      type: 'proprietary',
    },
    {
      name: 'Ambrosia Ventures Deal Intelligence',
      type: 'proprietary',
    },
  ];
}
