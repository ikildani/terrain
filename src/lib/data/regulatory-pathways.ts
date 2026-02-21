// ============================================================
// TERRAIN — Regulatory Pathway Definitions
// Comprehensive database of regulatory pathways for pharma,
// devices, diagnostics, and companion diagnostics across
// FDA, EMA, PMDA, and NMPA.
// ============================================================

import type { RegulatoryAgency } from '@/types';

// Extended type for the pathway definitions in this data file.
// The base RegulatoryPathwayDefinition in @/types covers the
// essential fields; this adds product_type routing, success rates,
// clinical data requirements, and recommendation logic.

export interface RegulatoryPathwayDefinition {
  pathway: string;
  agency: RegulatoryAgency;
  product_type: 'pharma' | 'device' | 'diagnostic' | 'cdx';
  description: string;
  typical_review_months: number;
  total_timeline_months: number;
  success_rate: number;
  requires_clinical_data: 'always' | 'usually' | 'sometimes' | 'rarely';
  key_requirements: string[];
  applicable_when: string;
  advantages: string[];
  disadvantages: string[];
}

// ────────────────────────────────────────────────────────────
// PHARMA — FDA
// ────────────────────────────────────────────────────────────

const FDA_PHARMA_PATHWAYS: RegulatoryPathwayDefinition[] = [
  {
    pathway: 'Standard NDA',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'New Drug Application under Section 505(b)(1) of the FD&C Act. The applicant provides full reports of safety and efficacy investigations conducted by or for the applicant. This is the default pathway for novel small-molecule drugs.',
    typical_review_months: 12,
    total_timeline_months: 14,
    success_rate: 0.85,
    requires_clinical_data: 'always',
    key_requirements: [
      'Complete chemistry, manufacturing, and controls (CMC) package',
      'Full nonclinical pharmacology and toxicology studies',
      'Adequate and well-controlled clinical trials (Phase 1-3)',
      'Statistical analysis of efficacy endpoints',
      'Integrated Summary of Safety (ISS) and Integrated Summary of Efficacy (ISE)',
      'Risk Evaluation and Mitigation Strategy (REMS) if applicable',
      'Proposed labeling and prescribing information',
      'Environmental assessment or categorical exclusion claim',
    ],
    applicable_when:
      'The drug is a novel small-molecule entity with no approved reference product, and no expedited pathway designation applies.',
    advantages: [
      'Well-established regulatory framework with clear FDA guidance',
      'No reliance on another product\'s data — full ownership of the safety/efficacy package',
      'Broadest possible labeling scope based on submitted trials',
      'No post-marketing confirmatory study requirement (unlike Accelerated Approval)',
      'Standard 12-month review timeline is predictable for planning',
    ],
    disadvantages: [
      '12-month standard review is the longest non-expedited FDA timeline',
      'Requires the largest and most expensive clinical development program',
      'Phase 3 pivotal trial(s) typically required with hundreds to thousands of patients',
      'No FDA interactive review or priority access during submission',
      'PDUFA user fee of ~$4.0M (FY2025) for commercial applications',
    ],
  },
  {
    pathway: 'BLA (Biologics License Application)',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'Biologics License Application under Section 351(a) of the Public Health Service Act. Required for all biological products including monoclonal antibodies, vaccines, blood products, gene therapies, cell therapies, and recombinant proteins. Reviewed by CBER or CDER depending on product type.',
    typical_review_months: 12,
    total_timeline_months: 14,
    success_rate: 0.82,
    requires_clinical_data: 'always',
    key_requirements: [
      'Full CMC section including manufacturing process validation and characterization',
      'Demonstration of lot-to-lot consistency',
      'Complete nonclinical package (pharmacology, toxicology, immunogenicity assessment)',
      'Adequate and well-controlled clinical trials',
      'Immunogenicity risk assessment and mitigation plan',
      'Product-specific assays and reference standard program',
      'Facility inspection readiness (pre-approval inspection is standard)',
      'Risk management plan including immunogenicity monitoring',
    ],
    applicable_when:
      'The product is a biologic: monoclonal antibody, recombinant protein, vaccine, blood product, gene therapy, cell therapy, or any product regulated under Section 351(a) of the PHS Act.',
    advantages: [
      '12-year data exclusivity for reference biologics (vs. 5 years for small molecules)',
      'Biosimilar competition is more limited due to complexity of biologic manufacturing',
      'Strong IP protection due to manufacturing process know-how',
      'Interchangeability standards create additional barriers for biosimilar substitution',
      'Well-defined FDA guidance for biologics development',
    ],
    disadvantages: [
      'Manufacturing complexity and cost significantly higher than small molecules',
      'Pre-approval inspection (PAI) of manufacturing facility is standard',
      'Immunogenicity risk requires extensive characterization and monitoring',
      'Cold chain and stability requirements increase supply chain complexity',
      'Longer and more expensive manufacturing process validation',
      'Comparability studies required for any manufacturing process changes',
    ],
  },
  {
    pathway: '505(b)(2) NDA',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'A hybrid NDA pathway under Section 505(b)(2) that allows the applicant to rely partly on FDA\'s previous findings of safety and/or efficacy for an approved drug (the Reference Listed Drug). Commonly used for new formulations, new routes of administration, new combinations, or new indications of existing drugs.',
    typical_review_months: 10,
    total_timeline_months: 12,
    success_rate: 0.90,
    requires_clinical_data: 'usually',
    key_requirements: [
      'Identification of a Reference Listed Drug (RLD) and right of reference or published literature',
      'Bridging studies to demonstrate bioequivalence or clinical comparability to the RLD',
      'CMC package for the new formulation or combination',
      'Clinical studies sufficient to bridge to the RLD\'s safety/efficacy data',
      'Suitability petition not required (unlike ANDA), but RLD must be identified',
      'Patent certifications (Paragraph I-IV) for RLD patents listed in the Orange Book',
      'May require full nonclinical studies if formulation changes create new safety questions',
    ],
    applicable_when:
      'The drug is a modification of an already-approved product (new formulation, new route, new dose, new combination, or new indication) where the applicant can bridge to existing FDA findings.',
    advantages: [
      'Significantly reduced clinical development program compared to a full NDA',
      'Can leverage existing safety and efficacy data from the Reference Listed Drug',
      'Shorter development timelines (often 3-5 years vs. 8-12 years for full NDA)',
      'Lower development cost — bridging studies are smaller than full Phase 3 trials',
      'Can create product differentiation and lifecycle management opportunities',
      '5-year NCE exclusivity if the product contains a new active ingredient, or 3-year exclusivity for new clinical investigations',
    ],
    disadvantages: [
      'Potential for Paragraph IV patent certification challenges (Hatch-Waxman litigation)',
      '30-month stay of approval possible if patent holder files infringement suit',
      'Must identify a suitable Reference Listed Drug with adequate prior data',
      'FDA may require more bridging data than anticipated, increasing cost',
      'Market perception as a "follow-on" rather than a truly novel product',
      'Competitive risk from generics of the RLD entering the market',
    ],
  },
  {
    pathway: 'ANDA (Abbreviated NDA / Generic)',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'Abbreviated New Drug Application for generic drugs. Requires demonstration of bioequivalence to a Reference Listed Drug (RLD) without conducting independent clinical trials. The applicant relies entirely on FDA\'s prior finding that the RLD is safe and effective.',
    typical_review_months: 10,
    total_timeline_months: 12,
    success_rate: 0.92,
    requires_clinical_data: 'rarely',
    key_requirements: [
      'Bioequivalence study demonstrating pharmacokinetic equivalence to the RLD',
      'Same active ingredient, route, dosage form, and strength as the RLD',
      'CMC package demonstrating pharmaceutical equivalence',
      'Labeling consistent with the RLD (with certain permitted differences)',
      'Paragraph I-IV patent certifications for all Orange Book-listed patents',
      'Compliance with current Good Manufacturing Practices (cGMP)',
      'Stability data supporting proposed shelf life',
    ],
    applicable_when:
      'The product is a generic copy of an already-approved drug whose patents have expired or will expire, and the applicant can demonstrate bioequivalence.',
    advantages: [
      'No requirement for independent clinical safety or efficacy studies',
      'Significantly lower development cost (typically $1-5M vs. $100M+ for NDA)',
      'Faster development timeline (2-4 years from start to approval)',
      '180-day exclusivity for first-to-file Paragraph IV ANDA',
      'Large addressable market for off-patent drugs',
      'Well-understood regulatory pathway with extensive FDA guidance',
    ],
    disadvantages: [
      'Highly competitive market with thin margins and pricing pressure',
      'Paragraph IV litigation risk with brand-name patent holders',
      'No marketing exclusivity beyond 180-day first-to-file (if applicable)',
      'Complex bioequivalence requirements for some formulations (e.g., locally acting drugs, complex generics)',
      'FDA inspection requirements for all manufacturing sites',
      'Commodity pricing dynamics once multiple generics are approved',
    ],
  },
  {
    pathway: 'Accelerated Approval',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'Expedited approval pathway under 21 CFR 314 Subpart H (drugs) or 21 CFR 601 Subpart E (biologics). Allows approval based on a surrogate endpoint or intermediate clinical endpoint that is reasonably likely to predict clinical benefit. Requires post-marketing confirmatory trial to verify clinical benefit.',
    typical_review_months: 6,
    total_timeline_months: 8,
    success_rate: 0.76,
    requires_clinical_data: 'always',
    key_requirements: [
      'Product must treat a serious or life-threatening disease or condition',
      'Must provide meaningful therapeutic benefit over existing treatments',
      'Surrogate endpoint that is reasonably likely to predict clinical benefit, or intermediate clinical endpoint',
      'Commitment to post-marketing confirmatory trial (now with stronger enforcement under FDORA 2022)',
      'REMS may be required to ensure safe use during the confirmatory period',
      'Labeling must describe the surrogate endpoint and the confirmatory study obligation',
      'If confirmatory trial fails, FDA has authority to initiate expedited withdrawal proceedings',
    ],
    applicable_when:
      'The drug treats a serious condition with unmet medical need, and there is a validated or reasonably likely surrogate endpoint that can be measured before definitive clinical benefit is demonstrated.',
    advantages: [
      'Approval years earlier than traditional pathway — patients get access sooner',
      'Smaller, shorter pivotal trials using surrogate endpoints',
      'Reduced development costs before initial approval',
      'Can be combined with other expedited designations (Breakthrough, Fast Track, Priority Review)',
      'Strong commercial launch opportunity while confirmatory trial is ongoing',
      'Meaningful therapeutic benefit standard is achievable with strong surrogate data',
    ],
    disadvantages: [
      'Post-marketing confirmatory trial is mandatory and expensive',
      'FDA has strengthened withdrawal authority under FDORA 2022 — risk of accelerated withdrawal if confirmatory trial fails',
      'Several high-profile accelerated approvals withdrawn in 2021-2024 (e.g., aducanumab indication narrowing)',
      'Payer coverage may be limited until confirmatory data is available (CMS CED for some products)',
      'Reputational risk if surrogate endpoint does not translate to clinical benefit',
      'Complex post-marketing requirements and FDA engagement obligations',
    ],
  },
  {
    pathway: 'Priority Review',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'FDA designation that shortens the review timeline from the standard 12 months to 8 months (6 months from filing). Granted to applications for drugs that treat serious conditions and would provide a significant improvement in safety or effectiveness compared to available therapy. Priority Review is a review classification, not a separate approval pathway.',
    typical_review_months: 8,
    total_timeline_months: 10,
    success_rate: 0.88,
    requires_clinical_data: 'always',
    key_requirements: [
      'Application must be for a drug treating a serious condition',
      'Must demonstrate significant improvement in safety or effectiveness over available therapy',
      'Priority Review request submitted with the NDA/BLA application',
      'Full NDA or BLA data package is still required — the review is faster, not the data requirements',
      'FDA assigns Priority Review designation within 60 days of receipt',
      'PDUFA goal date is set at 8 months from receipt (vs. 12 months for standard)',
    ],
    applicable_when:
      'The drug treats a serious condition and offers significant improvement over existing treatments. Often combined with other designations (Breakthrough, Fast Track, Orphan). Also available via Priority Review Voucher.',
    advantages: [
      '4-month shorter review timeline compared to Standard Review',
      'Can be combined with all other expedited programs',
      'No additional data requirements beyond standard NDA/BLA',
      'Priority Review Vouchers (PRV) can be obtained for qualifying conditions and transferred/sold',
      'PRVs have sold for $68M-$350M, creating significant value',
      'Earlier market access means earlier revenue generation',
    ],
    disadvantages: [
      'Does not change the evidentiary standard for approval',
      'Does not reduce clinical development requirements',
      'Compressed review timeline can lead to more information requests and potential delays',
      'PRV costs approximately $4.2M in additional PDUFA fee',
      'Not guaranteed — FDA makes the designation decision based on submitted data',
      'Competitors may also receive Priority Review, negating the competitive advantage',
    ],
  },
  {
    pathway: 'Fast Track',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'Designation for drugs intended to treat serious conditions and that demonstrate potential to address an unmet medical need. Fast Track provides early and frequent FDA engagement, rolling review (submission of completed sections before the entire application is complete), and eligibility for Accelerated Approval and Priority Review.',
    typical_review_months: 8,
    total_timeline_months: 10,
    success_rate: 0.82,
    requires_clinical_data: 'always',
    key_requirements: [
      'Drug must be intended to treat a serious or life-threatening condition',
      'Must demonstrate potential to address unmet medical need (nonclinical or clinical evidence)',
      'Request can be submitted at any time during development (typically after IND filing)',
      'FDA response within 60 calendar days of request',
      'Ongoing engagement: more frequent FDA meetings and communications',
      'Rolling review: completed NDA/BLA sections can be submitted and reviewed before the full application is ready',
    ],
    applicable_when:
      'The drug targets a serious condition with limited or no treatment options, and there is at least preclinical or early clinical evidence of potential to address the unmet need. Best requested early in development (Phase 1-2).',
    advantages: [
      'Early and more frequent interactions with FDA — reduces development risk',
      'Rolling review can shorten overall submission-to-approval timeline by 2-6 months',
      'Eligibility for Accelerated Approval if appropriate surrogate endpoint exists',
      'Eligibility for Priority Review if significant improvement over available therapy',
      'Can be requested as early as IND stage with minimal data',
      'Demonstrates to investors and partners that FDA recognizes the unmet need',
    ],
    disadvantages: [
      'Does not guarantee approval or change evidentiary standards',
      'Does not guarantee Accelerated Approval or Priority Review',
      'Rolling review requires careful planning of submission strategy and sequence',
      'Designation can be rescinded if the drug no longer meets the criteria',
      'More frequent FDA interactions require more internal regulatory resources',
      'The "unmet medical need" bar has become more competitive as treatments evolve',
    ],
  },
  {
    pathway: 'Breakthrough Therapy Designation',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'Designation for drugs intended to treat serious conditions where preliminary clinical evidence indicates substantial improvement over available therapy on clinically significant endpoints. Breakthrough Therapy provides all features of Fast Track plus intensive FDA guidance on efficient drug development and organizational commitment from senior FDA leadership.',
    typical_review_months: 8,
    total_timeline_months: 10,
    success_rate: 0.89,
    requires_clinical_data: 'always',
    key_requirements: [
      'Drug must be intended to treat a serious or life-threatening condition',
      'Preliminary clinical evidence (Phase 1 or Phase 2) of substantial improvement over available therapy',
      'Improvement must be on a clinically significant endpoint (not just a biomarker)',
      'Request typically submitted after Phase 1 or early Phase 2 data are available',
      'FDA response within 60 calendar days',
      'Requires ongoing demonstration of substantial improvement as development proceeds',
    ],
    applicable_when:
      'Phase 1 or early Phase 2 data show substantial clinical improvement over existing therapies. This is the highest bar among FDA expedited designations but also offers the most support.',
    advantages: [
      'Intensive FDA guidance on trial design — can lead to smaller, more efficient pivotal studies',
      'All Fast Track features: rolling review, frequent meetings, Accelerated Approval eligibility',
      'Organizational commitment involving senior FDA managers and experienced review staff',
      'Can significantly reduce development timeline by 1-4 years in some cases',
      'Strong signal to investors, partners, and payers (89% approval rate for designated products)',
      'Most prestigious FDA expedited designation — highest approval rate among expedited programs',
    ],
    disadvantages: [
      'Requires preliminary clinical evidence — cannot be obtained at preclinical stage',
      '"Substantial improvement" is a high bar — many requests are denied',
      'Designation can be rescinded if subsequent data do not support the preliminary evidence',
      'Intensive FDA engagement requires significant internal regulatory resources',
      'Does not guarantee approval or change the evidentiary standard',
      'High expectations from stakeholders can create pressure if later data are less compelling',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// PHARMA — EMA
// ────────────────────────────────────────────────────────────

const EMA_PHARMA_PATHWAYS: RegulatoryPathwayDefinition[] = [
  {
    pathway: 'Centralised Procedure (MAA)',
    agency: 'EMA',
    product_type: 'pharma',
    description:
      'Marketing Authorisation Application evaluated by the Committee for Medicinal Products for Human Use (CHMP). The centralised procedure is mandatory for biotech products, orphan medicinal products, ATMPs, and products for HIV/AIDS, cancer, diabetes, neurodegenerative diseases, and rare diseases. Results in a single marketing authorisation valid in all EU/EEA member states.',
    typical_review_months: 15,
    total_timeline_months: 18,
    success_rate: 0.80,
    requires_clinical_data: 'always',
    key_requirements: [
      'Complete quality (Module 3), nonclinical (Module 4), and clinical (Module 5) dossier in CTD format',
      'Rapporteur and Co-Rapporteur assigned from CHMP member states',
      'Assessment phase: Day 80 (first assessment report), Day 120 (consolidated questions), clock-stop for responses, Day 180 (opinion)',
      'GMP compliance certification for all manufacturing sites',
      'Risk Management Plan (RMP) required at submission',
      'Pediatric Investigation Plan (PIP) or waiver required before submission',
      'Environmental Risk Assessment (ERA)',
    ],
    applicable_when:
      'The product is a biologic, orphan medicinal product, ATMP, or intended for a mandatory centralised procedure indication (cancer, HIV/AIDS, diabetes, neurodegenerative, rare diseases, autoimmune). Also available optionally for innovative products.',
    advantages: [
      'Single application and review process for all 27 EU member states plus EEA',
      'One marketing authorisation valid across the entire EU/EEA',
      'Harmonized assessment by CHMP ensures consistent regulatory standard',
      '10 years of data exclusivity (8+2 formula) for new active substances',
      'Well-defined timeline with clock-stops for sponsor responses',
      'Eligible for accelerated assessment, conditional MA, and PRIME designation',
    ],
    disadvantages: [
      '15-month average review timeline is longer than FDA standard review',
      'Clock-stops for sponsor responses can extend total timeline significantly',
      'Complex pricing and reimbursement negotiations required separately in each member state',
      'Rapporteur/Co-Rapporteur dynamics can introduce variability',
      'Post-authorization variations and renewals add ongoing regulatory burden',
      'PRAC (Pharmacovigilance Risk Assessment Committee) review adds complexity for safety signals',
    ],
  },
  {
    pathway: 'PRIME (Priority Medicines)',
    agency: 'EMA',
    product_type: 'pharma',
    description:
      'Priority Medicines (PRIME) scheme provides enhanced EMA support for medicines that target an unmet medical need. Equivalent in spirit to FDA Breakthrough Therapy Designation. Offers early dialogue with CHMP rapporteur, scientific advice at key development milestones, and accelerated assessment eligibility.',
    typical_review_months: 10,
    total_timeline_months: 13,
    success_rate: 0.85,
    requires_clinical_data: 'usually',
    key_requirements: [
      'Product must target a condition with unmet medical need in the EU',
      'Preliminary clinical evidence of major therapeutic advantage (or compelling nonclinical data for academic/SME applicants)',
      'Request submitted to EMA with supporting dossier',
      'EMA assessment within 3 months of request',
      'If granted: assigned CHMP rapporteur for early and continuous regulatory dialogue',
      'Eligible for accelerated assessment at MAA stage',
    ],
    applicable_when:
      'Early clinical data (Phase 1/2) suggest a major therapeutic advantage over existing treatments for a condition with significant unmet need in the EU. Academic sponsors and SMEs may apply with compelling nonclinical data.',
    advantages: [
      'Early appointed CHMP rapporteur provides continuous regulatory guidance',
      'Enhanced scientific advice at key development milestones — reduces regulatory risk',
      'Eligibility for accelerated assessment at MAA filing (150 vs. 210 days)',
      'Increased EMA engagement helps optimize EU development strategy',
      'Signal value for investors and partners in European markets',
      'SMEs and academic sponsors can apply earlier (with nonclinical data)',
    ],
    disadvantages: [
      'Selective designation — acceptance rate approximately 30-40%',
      'Does not guarantee marketing authorisation or change evidentiary standards',
      'Designation can be revoked if development data no longer support major therapeutic advantage',
      'Enhanced engagement requires significant regulatory affairs resources',
      'Does not directly shorten the formal MAA review clock (only via accelerated assessment eligibility)',
      'Limited awareness among some EU HTA bodies — may not accelerate pricing/reimbursement',
    ],
  },
  {
    pathway: 'Conditional Marketing Authorisation',
    agency: 'EMA',
    product_type: 'pharma',
    description:
      'EU equivalent of FDA Accelerated Approval. Allows authorisation based on less comprehensive clinical data than normally required when the benefit-risk balance is positive, the product addresses an unmet medical need, and the applicant commits to providing comprehensive clinical data post-authorisation. Initially valid for 1 year, renewable annually until converted to standard MA.',
    typical_review_months: 10,
    total_timeline_months: 12,
    success_rate: 0.78,
    requires_clinical_data: 'always',
    key_requirements: [
      'Benefit-risk balance must be positive based on available data',
      'Product must address an unmet medical need (life-threatening, seriously debilitating, or public health emergency)',
      'Applicant must be able to provide comprehensive clinical data post-authorisation',
      'Specific obligations attached to the MA (post-authorisation studies, additional data collection)',
      'Annual renewal required until comprehensive data are provided',
      'Risk Management Plan with enhanced pharmacovigilance requirements',
    ],
    applicable_when:
      'The product treats a serious or life-threatening condition with no adequate alternative, and available data (including early/interim trial data) show positive benefit-risk, but comprehensive data are not yet available.',
    advantages: [
      'Earlier market access for patients with serious unmet needs in the EU',
      'Approval based on less complete data than standard MAA',
      'Can be combined with PRIME designation for enhanced support',
      'Provides EU market access while confirmatory studies continue',
      'Signal of regulatory endorsement accelerates HTA engagement in member states',
      'Can be converted to standard MA once comprehensive data are submitted',
    ],
    disadvantages: [
      'Annual renewal requirement creates ongoing regulatory burden',
      'Mandatory post-authorisation studies — failure to comply can result in suspension',
      'Payers may restrict reimbursement pending confirmatory data',
      'Perception of "conditional" status may limit physician adoption',
      'Risk of non-renewal or suspension if benefit-risk balance changes',
      'Comprehensive data requirements post-approval can be costly',
    ],
  },
  {
    pathway: 'Accelerated Assessment',
    agency: 'EMA',
    product_type: 'pharma',
    description:
      'Reduces the CHMP assessment timeframe from 210 to 150 active days for products of major interest from a public health perspective, particularly from the viewpoint of therapeutic innovation. Can be requested at the time of MAA submission or pre-submission.',
    typical_review_months: 10,
    total_timeline_months: 12,
    success_rate: 0.83,
    requires_clinical_data: 'always',
    key_requirements: [
      'Product must be of major interest from a public health perspective, particularly therapeutic innovation',
      'Request submitted to CHMP at least 2-3 months before MAA submission',
      'CHMP decides within ~60 days of request whether to grant accelerated assessment',
      'If granted, assessment timeline is 150 active days (vs. 210 days standard)',
      'CHMP can revert to standard timeline if the product no longer qualifies during review',
      'Full MAA dossier still required — no reduction in evidentiary requirements',
    ],
    applicable_when:
      'The product represents a major therapeutic innovation or addresses a public health need. Typically combined with PRIME designation. Best suited for products with strong Phase 3 data at the time of MAA submission.',
    advantages: [
      'Reduction of assessment time from 210 to 150 active review days (approximately 2 months faster)',
      'Can be combined with conditional MA for even faster initial market access',
      'PRIME-designated products are pre-qualified for accelerated assessment',
      'Demonstrates regulatory recognition of the product\'s public health value',
      'Earlier CHMP opinion translates to earlier national pricing/reimbursement applications',
    ],
    disadvantages: [
      'Reversion to standard timeline is possible if CHMP determines the product no longer qualifies',
      'The 60-day savings may be offset by clock-stops for sponsor responses',
      'Does not reduce data requirements — full MAA package needed',
      'Selective: only ~20-30% of requests are granted',
      'Compressed review places higher demands on regulatory affairs resources for rapid responses',
      'Does not accelerate national pricing and reimbursement timelines post-CHMP opinion',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// PHARMA — PMDA (Japan)
// ────────────────────────────────────────────────────────────

const PMDA_PHARMA_PATHWAYS: RegulatoryPathwayDefinition[] = [
  {
    pathway: 'Standard NDA (Japan)',
    agency: 'PMDA',
    product_type: 'pharma',
    description:
      'Standard new drug application submitted to the Pharmaceuticals and Medical Devices Agency (PMDA) in Japan. Involves pre-application consultation, PMDA review, followed by MHLW approval. Japan requires ethnic sensitivity data and often requires Japanese bridging studies or inclusion of Japanese patients in global trials.',
    typical_review_months: 12,
    total_timeline_months: 14,
    success_rate: 0.80,
    requires_clinical_data: 'always',
    key_requirements: [
      'CTD-format application in Japanese (Common Technical Document)',
      'Japanese bridging study or adequate Japanese patient representation in global trials',
      'Ethnic factor assessment (ICH E5 guideline compliance)',
      'GMP compliance inspection for all manufacturing sites',
      'Pre-application consultation with PMDA (Mendan) — highly recommended',
      'Stability data under ICH conditions including Japanese climatic zone storage',
      'Japanese labeling and package insert',
    ],
    applicable_when:
      'The product is a new drug seeking approval in Japan. Required for all novel drugs not previously approved in Japan, regardless of approval status in other markets.',
    advantages: [
      'Japan is the third-largest pharmaceutical market globally (approximately $80B)',
      'Premium pricing environment — Japanese drug prices are often comparable to US prices',
      'National Health Insurance (NHI) listing typically follows approval within 60-90 days',
      'Predictable review timeline with defined PMDA consultation milestones',
      '8 years of data exclusivity for new active ingredients',
      'Well-established regulatory-science framework with ICH harmonization',
    ],
    disadvantages: [
      'Japanese bridging study requirement can add 12-24 months to development timeline',
      'Language barrier — all submissions must be in Japanese',
      'Biennial NHI price revisions create pricing erosion over time',
      'GMP inspection of overseas manufacturing sites can be slow to schedule',
      'Clinical development in Japan is expensive due to high clinical trial costs',
      'Drug lag — Japanese approval historically 2-4 years after US/EU, though gap is narrowing',
    ],
  },
  {
    pathway: 'SAKIGAKE Designation',
    agency: 'PMDA',
    product_type: 'pharma',
    description:
      'Japan\'s premier expedited designation for innovative drugs. SAKIGAKE (meaning "pioneer") provides prioritized review, pre-application consultation, designated PMDA review team, and a target review period of 6 months. Designed to encourage global-first or simultaneous launches in Japan.',
    typical_review_months: 6,
    total_timeline_months: 9,
    success_rate: 0.87,
    requires_clinical_data: 'always',
    key_requirements: [
      'Drug must treat a disease with serious impact on daily life or life-threatening condition',
      'Must have a new mechanism of action or other innovative features',
      'Development must be planned as Japan-first or global-simultaneous',
      'Japanese patients must be included in clinical development early',
      'Application for SAKIGAKE designation submitted to PMDA',
      'Designated review team provides pre-application guidance',
      'Post-marketing real-world data collection typically required',
    ],
    applicable_when:
      'The product has a novel mechanism of action, targets a disease with high unmet need in Japan, and the sponsor plans to launch in Japan simultaneously with or before the US/EU.',
    advantages: [
      '6-month target review period (vs. 12 months standard) — fastest PMDA pathway',
      'Dedicated PMDA consultation team assigned throughout development',
      'Priority NHI pricing — potential for innovation premium pricing',
      'Prioritized GMP inspection scheduling',
      'Strong government support for SAKIGAKE-designated products',
      'Post-marketing commitment may be lighter than conditional early approval',
    ],
    disadvantages: [
      'Requires Japan-first or simultaneous global development — may not align with US/EU-first strategy',
      'Selective designation — limited number granted per year',
      'Post-marketing real-world data obligations can be extensive',
      'Requires significant early investment in Japanese clinical development',
      'Designation can be withdrawn if development deviates from the Japan-first commitment',
      'May require restructuring global development timelines to accommodate Japan priority',
    ],
  },
  {
    pathway: 'Conditional Early Approval (Japan)',
    agency: 'PMDA',
    product_type: 'pharma',
    description:
      'Japan\'s equivalent of conditional approval, introduced in 2017. Allows approval based on exploratory or early-phase clinical trial results when the disease is serious, there is no adequate alternative, and real-world evidence or additional studies can confirm efficacy post-approval. Common for orphan drugs and regenerative medicines in Japan.',
    typical_review_months: 9,
    total_timeline_months: 12,
    success_rate: 0.75,
    requires_clinical_data: 'always',
    key_requirements: [
      'Drug treats a serious disease with no adequate alternative therapy',
      'Sufficient clinical data to predict efficacy (Phase 2 or exploratory data acceptable)',
      'Commitment to post-marketing studies to confirm clinical benefit',
      'Real-world data collection plan required at time of application',
      'Safety data adequate to assess benefit-risk balance',
      'Annual review and renewal required until comprehensive data submitted',
      'Conditions attached to the approval (e.g., restricted use, mandatory registry)',
    ],
    applicable_when:
      'The product treats a serious condition with limited alternatives in Japan, and early clinical data (Phase 2 or single-arm) show promising efficacy that can be confirmed with post-marketing real-world evidence.',
    advantages: [
      'Approval based on earlier-stage data — can shorten time to market by 2-4 years',
      'Enables Japan market access for drugs that may not have Phase 3 data yet',
      'Particularly useful for rare diseases and regenerative medicines',
      'NHI listing follows approval — revenue begins even with conditional status',
      'Aligns with Japan\'s strategic goal of reducing drug lag',
      'Real-world evidence generation supports broader clinical understanding',
    ],
    disadvantages: [
      'Conditional status requires annual review — risk of non-renewal',
      'Post-marketing study obligations can be extensive and costly',
      'Restricted use conditions may limit the addressable patient population',
      'Payer and physician perception of "conditional" approval may slow adoption',
      'Real-world evidence infrastructure requirements in Japan can be challenging',
      'Risk of approval withdrawal if post-marketing data do not confirm benefit',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// DEVICE — FDA
// ────────────────────────────────────────────────────────────

const FDA_DEVICE_PATHWAYS: RegulatoryPathwayDefinition[] = [
  {
    pathway: '510(k) Clearance',
    agency: 'FDA',
    product_type: 'device',
    description:
      'Premarket notification demonstrating that a new device is substantially equivalent to a legally marketed predicate device. The most common FDA device clearance pathway, used for moderate-risk Class II devices. FDA reviews approximately 3,000-4,000 510(k) submissions annually.',
    typical_review_months: 6,
    total_timeline_months: 9,
    success_rate: 0.82,
    requires_clinical_data: 'sometimes',
    key_requirements: [
      'Identification of a legally marketed predicate device',
      'Demonstration of substantial equivalence (same intended use, same or different technological characteristics)',
      'Performance testing (bench testing, biocompatibility, sterilization validation, electrical safety)',
      'Comparison table: subject device vs. predicate device',
      'Clinical data only if bench testing alone cannot demonstrate substantial equivalence',
      'Labeling review (IFU, physician labeling, patient labeling)',
      'Pre-submission (Q-Sub) meeting with FDA strongly recommended for complex submissions',
      'User fee payment (approximately $21,760 for FY2025, reduced for small businesses)',
    ],
    applicable_when:
      'The device is Class II (moderate risk), there is a legally marketed predicate device with the same intended use, and the device does not raise new safety or effectiveness questions that cannot be resolved through bench testing.',
    advantages: [
      'Fastest FDA pathway for devices — average 174 review days (under 6 months)',
      'Lowest regulatory burden — typically no clinical trial required',
      'Well-established pathway with extensive FDA guidance documents',
      'Lowest user fee among device submissions',
      'Can reference multiple predicate devices (split predicates allowed in limited cases)',
      'Largest body of FDA precedent — over 100,000 cleared devices in the 510(k) database',
      'Post-market surveillance requirements are typically limited to MDR and complaint handling',
    ],
    disadvantages: [
      'Requires identification of a suitable predicate device — no predicate means no 510(k)',
      'Substantial equivalence determination can be subjective and unpredictable',
      'FDA has been increasing clinical data expectations for certain device types',
      '"Predicate creep" concerns — long chains of predicates may invite FDA scrutiny',
      'Does not establish a new device classification — limited marketing claims',
      '510(k) clearance is less prestigious than PMA approval in some clinical contexts',
      'FDA can request Additional Information (AI) that extends review by 3-6 months',
    ],
  },
  {
    pathway: 'De Novo Classification',
    agency: 'FDA',
    product_type: 'device',
    description:
      'Risk-based classification pathway for novel, low-to-moderate risk devices that have no legally marketed predicate device. De Novo creates a new device classification and regulatory controls, and the authorized device becomes a predicate for future 510(k) submissions by competitors. Increasingly used for AI/ML-based devices and novel diagnostics.',
    typical_review_months: 11,
    total_timeline_months: 17,
    success_rate: 0.75,
    requires_clinical_data: 'usually',
    key_requirements: [
      'Novel device with no predicate (or prior 510(k) NSE determination)',
      'Risk assessment demonstrating the device is not high-risk (i.e., general and special controls can mitigate risks)',
      'Proposed classification (Class I or Class II) with recommended special controls',
      'Performance data including bench testing, biocompatibility, software validation (if applicable)',
      'Clinical data typically required (clinical study or real-world performance data)',
      'Labeling and Indications for Use statement',
      'User fee payment (approximately $130,000 for FY2025)',
      'Pre-submission meeting strongly recommended',
    ],
    applicable_when:
      'The device has no legally marketed predicate, is of low-to-moderate risk, and general/special controls can provide reasonable assurance of safety and effectiveness. Common for novel digital health tools, AI/ML software, and innovative POC diagnostics.',
    advantages: [
      'Creates a new classification — the authorized device becomes the predicate for all future entrants',
      'First-mover advantage: establishes the regulatory controls for the device category',
      'Appropriate for truly novel technologies where no predicate exists',
      'Increasing FDA receptivity to De Novo for AI/ML and digital health products',
      'Authorized De Novo devices can be referenced in subsequent 510(k) submissions (competitive moat)',
      'Regulatory precedent-setting strengthens IP and market position',
    ],
    disadvantages: [
      'Longer review timeline — average 344 review days (approximately 11 months)',
      'Higher user fee than 510(k)',
      'Clinical data almost always required — adds time and cost to development',
      'Proposed special controls may be onerous and set the standard for all competitors',
      'Less regulatory certainty than 510(k) — FDA has discretion in classification decision',
      'Competitors can subsequently use the authorized device as a 510(k) predicate',
    ],
  },
  {
    pathway: 'PMA (Premarket Approval)',
    agency: 'FDA',
    product_type: 'device',
    description:
      'Premarket Approval is the FDA\'s most stringent pathway for medical devices. Required for Class III (high-risk) devices. The applicant must provide valid scientific evidence demonstrating reasonable assurance of safety and effectiveness, typically including data from well-controlled clinical trials. Annual PMA supplements are required for most manufacturing and design changes.',
    typical_review_months: 12,
    total_timeline_months: 30,
    success_rate: 0.68,
    requires_clinical_data: 'always',
    key_requirements: [
      'Valid scientific evidence of safety and effectiveness (typically from IDE clinical trial)',
      'IDE (Investigational Device Exemption) approval before initiating pivotal clinical trial',
      'Well-controlled clinical investigation with appropriate endpoints and statistical plan',
      'Complete manufacturing information and quality system documentation',
      'Nonclinical testing (biocompatibility, bench performance, sterilization, shelf life)',
      'Proposed labeling with detailed IFU',
      'Pre-approval inspection of manufacturing facility',
      'User fee payment (approximately $442,000 for FY2025)',
      'Advisory committee meeting likely for novel Class III devices',
    ],
    applicable_when:
      'The device is Class III (high-risk) and general/special controls alone are insufficient to provide reasonable assurance of safety and effectiveness. Common for implantable cardiac devices, total joint replacements, high-risk IVDs, and innovative Class III devices.',
    advantages: [
      'Highest level of FDA endorsement — provides strong market credibility',
      'Post-market protection: competitors cannot use a PMA-approved device as a 510(k) predicate without data cross-reference',
      'PMA supplements provide an ongoing FDA-company relationship that protects market position',
      'Higher reimbursement rates often associated with PMA-approved devices',
      'NTAP (New Technology Add-on Payment) eligibility for Medicare patients',
      'Clinical trial data creates strong evidence base for payer coverage and physician adoption',
    ],
    disadvantages: [
      'Most expensive and time-consuming device pathway — typical 2.5 years and $30-75M',
      'IDE clinical trial required — enrollment challenges, multi-site coordination, and monitoring costs',
      'Advisory committee meeting adds uncertainty and timeline risk',
      'Pre-approval inspection can delay approval if manufacturing deficiencies are found',
      'Ongoing PMA supplement requirements for any changes (design, manufacturing, labeling)',
      'Annual reports and periodic post-market surveillance studies may be required',
      'Only 68% approval rate — significant risk of Complete Response Letter',
    ],
  },
  {
    pathway: 'Breakthrough Device Designation',
    agency: 'FDA',
    product_type: 'device',
    description:
      'FDA designation for devices that provide more effective treatment or diagnosis of life-threatening or irreversibly debilitating diseases or conditions. Provides interactive and timely communication with FDA, data development plan flexibility, expedited review, and senior management involvement. Can be combined with any submission pathway (510(k), De Novo, or PMA).',
    typical_review_months: 8,
    total_timeline_months: 23,
    success_rate: 0.78,
    requires_clinical_data: 'always',
    key_requirements: [
      'Device provides more effective treatment or diagnosis of a life-threatening or irreversibly debilitating condition',
      'Device represents a breakthrough technology, no approved/cleared alternatives exist, offers significant advantages over existing alternatives, or device availability is in the best interest of patients',
      'Designation request submitted to CDRH with supporting evidence',
      'FDA responds within 60 days',
      'Data Development Plan agreed between sponsor and FDA after designation',
      'Post-market data collection often required as a condition',
    ],
    applicable_when:
      'The device treats or diagnoses a life-threatening or irreversibly debilitating condition and represents a significant advance. Evidence may be preliminary (bench, animal, or early clinical data).',
    advantages: [
      'Interactive review with FDA: data development plan negotiation before clinical trial',
      'Prioritized review — faster FDA response times during review process',
      'Senior FDA management involvement and organizational commitment',
      'Flexibility in clinical evidence requirements — FDA may accept alternative data sources',
      'Average 230 review days (vs. 365 for standard PMA)',
      'Can reduce total development timeline by 6-18 months',
      'Strong signal to investors and reimbursement bodies',
    ],
    disadvantages: [
      'Does not change the applicable submission pathway (still need 510(k), De Novo, or PMA)',
      'Post-market data collection requirements can be extensive',
      'Designation can be rescinded if development data no longer support breakthrough criteria',
      'Frequent FDA interactions require significant regulatory affairs resources',
      'Competitive pressure: FDA has granted 800+ Breakthrough designations since 2015',
      'Post-market surveillance commitments may be more extensive than for non-designated devices',
    ],
  },
  {
    pathway: 'HDE (Humanitarian Device Exemption)',
    agency: 'FDA',
    product_type: 'device',
    description:
      'Authorization pathway for Humanitarian Use Devices (HUDs) intended to benefit patients with diseases or conditions affecting fewer than 8,000 individuals in the US per year. Does not require demonstration of effectiveness — only safety and probable benefit. Approved devices receive HDE approval and can only be used at institutions with IRB approval.',
    typical_review_months: 8,
    total_timeline_months: 14,
    success_rate: 0.72,
    requires_clinical_data: 'sometimes',
    key_requirements: [
      'Device must be intended for a condition affecting fewer than 8,000 patients per year in the US',
      'Humanitarian Use Device (HUD) designation must be obtained from OOPD before HDE submission',
      'Demonstration of safety (sufficient evidence of no unreasonable risk)',
      'Demonstration of probable benefit (clinical evidence suggesting the device will work)',
      'No requirement for well-controlled clinical investigations',
      'IRB approval required at each institution where the device will be used',
      'Annual distribution report to FDA',
      'Profit restrictions unless waived by FDA (pediatric conditions automatically exempt)',
    ],
    applicable_when:
      'The device treats a very rare condition (fewer than 8,000 US patients/year), and conducting a well-controlled clinical trial to demonstrate effectiveness is not feasible due to the small patient population.',
    advantages: [
      'Significantly lower evidentiary bar — probable benefit, not proven effectiveness',
      'Smaller or no clinical trial required — reduces cost and timeline',
      'Pathway specifically designed for rare/orphan device indications',
      'Lower user fee than PMA',
      'Automatic profit restriction exemption for pediatric conditions (Pediatric HDE)',
      'Can be an entry point for devices that may later pursue broader PMA',
    ],
    disadvantages: [
      'Market limited to fewer than 8,000 patients/year — inherently small commercial opportunity',
      'IRB approval required at each hospital — creates adoption barriers',
      'Profit restrictions may apply (unless pediatric condition or FDA grants waiver)',
      'Reimbursement challenges — CMS and private payers may resist coverage for HDE devices',
      'Limited marketing claims due to the "probable benefit" standard',
      'Annual reporting requirements and FDA can require post-market surveillance',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// DEVICE — EU (CE Marking under MDR)
// ────────────────────────────────────────────────────────────

const EU_DEVICE_PATHWAYS: RegulatoryPathwayDefinition[] = [
  {
    pathway: 'CE Marking under MDR — Class I',
    agency: 'EMA',
    product_type: 'device',
    description:
      'Self-declaration of conformity for Class I (lowest risk) medical devices under the EU Medical Device Regulation (MDR 2017/745). Class I devices include non-invasive examination instruments, bandages, wheelchairs, and certain software. Manufacturer self-certifies without Notified Body involvement (except for Class I devices with measuring function, supplied sterile, or reusable surgical instruments).',
    typical_review_months: 3,
    total_timeline_months: 6,
    success_rate: 0.95,
    requires_clinical_data: 'rarely',
    key_requirements: [
      'Quality Management System (QMS) compliant with MDR Annex IX or ISO 13485',
      'Technical documentation including risk analysis (ISO 14971) and product specifications',
      'Declaration of Conformity signed by the manufacturer',
      'Clinical evaluation report (literature-based typically sufficient for Class I)',
      'Post-market surveillance plan and system',
      'UDI (Unique Device Identification) registration in EUDAMED database',
      'EU Authorized Representative if manufacturer is outside the EU',
      'Responsible Person for regulatory compliance under MDR Article 15',
    ],
    applicable_when:
      'The device is classified as Class I under MDR Annex VIII classification rules (lowest risk, non-invasive, no measuring function, not sterile, not reusable surgical).',
    advantages: [
      'No Notified Body review required (self-certification)',
      'Fastest pathway to CE marking — 3-6 months typical',
      'Lowest regulatory cost among EU device pathways',
      'Access to all 27 EU member states plus EEA with a single CE marking',
      'Well-suited for simple medical devices and general-purpose software',
    ],
    disadvantages: [
      'Limited to lowest-risk devices — most innovative devices are Class IIa or higher',
      'MDR requirements are more burdensome than the legacy MDD, even for Class I',
      'Clinical evaluation still required (though literature-based is typically acceptable)',
      'Post-market surveillance obligations under MDR are significant even for Class I',
      'EUDAMED registration requirements are evolving and may add complexity',
    ],
  },
  {
    pathway: 'CE Marking under MDR — Class IIa/IIb',
    agency: 'EMA',
    product_type: 'device',
    description:
      'Conformity assessment by a Notified Body for moderate-risk (Class IIa) and higher-moderate-risk (Class IIb) medical devices under MDR 2017/745. Requires quality management system audit, technical documentation review, and clinical evidence assessment. Most surgical instruments, active therapeutic devices, and implantable devices with limited body contact are Class IIa/IIb.',
    typical_review_months: 9,
    total_timeline_months: 15,
    success_rate: 0.78,
    requires_clinical_data: 'usually',
    key_requirements: [
      'Notified Body engagement and application (significant current backlog — 12-18 month wait for NB slot)',
      'Quality Management System audit (ISO 13485 certified)',
      'Technical documentation review per MDR Annex II and III',
      'Clinical evaluation per MDR Article 61 and MEDDEV 2.7/1 Rev 4',
      'Clinical investigation may be required (especially Class IIb)',
      'Risk management file per ISO 14971',
      'Biocompatibility assessment per ISO 10993 series (if applicable)',
      'Post-market clinical follow-up (PMCF) plan',
      'UDI and EUDAMED registration',
    ],
    applicable_when:
      'The device is classified as Class IIa or IIb under MDR Annex VIII. Includes most surgical instruments, active therapeutic devices, drug-delivery devices, and implants with limited risk profiles. Class IIb includes devices with higher risk elements (e.g., long-term implantables, active devices intended to administer or remove medicines).',
    advantages: [
      'Access to 27+ EU/EEA markets with single certification',
      'Well-defined pathway with ISO and MEDDEV guidance documents',
      'Clinical evaluation can often be literature-based for Class IIa (no clinical trial needed)',
      'CE marking provides strong international market access signal (recognized in 50+ countries)',
      'Can support MDSAP (Medical Device Single Audit Program) for simultaneous multi-country compliance',
    ],
    disadvantages: [
      'Significant Notified Body capacity constraints under MDR — wait times of 12-18 months for NB engagement',
      'MDR clinical evidence requirements substantially increased compared to MDD',
      'Technical documentation requirements under MDR are more extensive than legacy MDD',
      'PMCF requirements are mandatory and can be resource-intensive',
      'Notified Body fees have increased significantly under MDR (EUR 50,000-200,000+)',
      'Regulatory uncertainty as MDR implementation continues to evolve',
      'Certificate validity limited to 5 years with annual surveillance audits',
    ],
  },
  {
    pathway: 'CE Marking under MDR — Class III',
    agency: 'EMA',
    product_type: 'device',
    description:
      'Full conformity assessment by a Notified Body for high-risk Class III medical devices under MDR 2017/745. Requires the most comprehensive technical documentation, clinical evidence (typically from clinical investigations), and Notified Body scrutiny. Class III includes total joint replacements, coronary stents, implantable defibrillators, and long-term implantable devices.',
    typical_review_months: 15,
    total_timeline_months: 24,
    success_rate: 0.65,
    requires_clinical_data: 'always',
    key_requirements: [
      'Full quality management system audit by Notified Body',
      'Comprehensive technical documentation per MDR Annex II',
      'Clinical investigation (prospective clinical trial) typically required',
      'Clinical evaluation report with sufficient clinical evidence per MDR Article 61',
      'Risk management file (ISO 14971) with comprehensive risk analysis',
      'Post-market clinical follow-up (PMCF) plan and study protocol',
      'Biocompatibility testing per ISO 10993 series',
      'Summary of Safety and Clinical Performance (SSCP) made publicly available',
      'Consultation procedure with expert panels for certain Class III and Class IIb implantables',
      'UDI and EUDAMED registration',
    ],
    applicable_when:
      'The device is classified as Class III under MDR Annex VIII (highest risk). Includes all long-term implantables (joint replacements, cardiac devices, neurostimulators), devices incorporating medicinal substances, and devices using non-viable tissues or cells.',
    advantages: [
      'Access to the entire EU/EEA single market with one certification',
      'CE marking for Class III is internationally recognized as a rigorous standard',
      'SSCP publication provides transparency that can support physician and payer confidence',
      'Clinical investigation data supports global regulatory submissions (FDA, PMDA)',
      'Expert panel consultation can provide valuable clinical guidance',
    ],
    disadvantages: [
      'Most extensive and expensive EU pathway — EUR 200,000-500,000+ for Notified Body fees alone',
      'Clinical investigation typically required — adds 2-4 years and millions in cost',
      'Severe Notified Body capacity constraints — fewer NB designated for Class III under MDR',
      'Expert panel consultation for certain devices adds 3-6 months and uncertainty',
      'PMCF study requirements can last 5-10 years post-certification',
      'Certificate validity limited to 5 years — recertification process is extensive',
      'MDR transition has created significant uncertainty and delays for legacy devices',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// DIAGNOSTICS — FDA
// ────────────────────────────────────────────────────────────

const FDA_DIAGNOSTICS_PATHWAYS: RegulatoryPathwayDefinition[] = [
  {
    pathway: 'CDx PMA (Companion Diagnostic)',
    agency: 'FDA',
    product_type: 'cdx',
    description:
      'Premarket Approval pathway specifically for companion diagnostics — in vitro diagnostic tests that are essential for the safe and effective use of a corresponding therapeutic product. CDx PMAs are typically reviewed in coordination with the therapeutic product\'s NDA/BLA by CDRH (devices) in collaboration with CDER/CBER (drugs/biologics). Co-development and co-approval with the linked drug is the gold standard.',
    typical_review_months: 12,
    total_timeline_months: 30,
    success_rate: 0.70,
    requires_clinical_data: 'always',
    key_requirements: [
      'Analytical validation: sensitivity, specificity, accuracy, precision, LOD/LOQ for the biomarker assay',
      'Clinical validation: demonstration that the test correctly identifies patients who will benefit from the linked drug (using clinical trial specimens)',
      'Bridging study to the clinical trial assay (if different from the commercial CDx kit)',
      'Co-development agreement with the drug sponsor',
      'Coordinated review timeline with the drug\'s NDA/BLA (co-review by CDRH and CDER/CBER)',
      'Labeling that cross-references the linked drug and specifies the intended use population',
      'Manufacturing validation including GMP compliance for IVD manufacturing',
      'Post-market surveillance and real-world performance monitoring',
    ],
    applicable_when:
      'An IVD test is essential for the safe and effective use of a specific drug — either for patient selection (predictive biomarker), safety monitoring, dose selection, or treatment response assessment. FDA strongly encourages CDx co-development.',
    advantages: [
      'CDx approval tied to drug label creates a durable commercial advantage',
      'FDA co-review with drug ensures coordinated approval timeline',
      'Drug label requiring the CDx test creates guaranteed demand (label-driven testing)',
      'Strong IP protection — biomarker-drug linkage is a regulatory and commercial moat',
      'Reimbursement pathway is clearer for FDA-approved CDx than for LDTs',
      'Can expand CDx label as the linked drug gains additional indications',
    ],
    disadvantages: [
      'Long development timeline — must align with drug clinical development',
      'High cost of clinical validation using clinical trial specimens',
      'Risk that the linked drug fails — CDx investment is lost if the drug is not approved',
      'Complex multi-party agreements (CDx company, drug company, clinical trial sites)',
      'Post-market requirements include ongoing concordance monitoring',
      'FDA has become more stringent on analytical and clinical validation requirements',
    ],
  },
  {
    pathway: 'LDT (Laboratory Developed Test)',
    agency: 'FDA',
    product_type: 'diagnostic',
    description:
      'Laboratory Developed Tests are IVDs designed, manufactured, and used within a single laboratory (typically CLIA-certified high-complexity labs). Historically operated under enforcement discretion — FDA had authority but chose not to enforce premarket review requirements. FDA finalized a rule in 2024 phasing out enforcement discretion over a 4-year period, requiring LDTs to comply with device regulations. This pathway is in transition.',
    typical_review_months: 0,
    total_timeline_months: 3,
    success_rate: 0.98,
    requires_clinical_data: 'sometimes',
    key_requirements: [
      'CLIA certification (high-complexity laboratory)',
      'Analytical validation performed in-house (accuracy, precision, sensitivity, specificity)',
      'Clinical validation recommended but historically not FDA-mandated',
      'State licensing requirements (e.g., New York CLEP for labs offering tests to NY patients)',
      'Compliance with CLIA quality standards for laboratory testing',
      'Under the 2024 final rule: gradual phased-in requirements including medical device reporting, registration and listing, labeling, and eventually premarket review',
      'Professional society guidelines for test validation (e.g., CAP, CLSI)',
    ],
    applicable_when:
      'The test is developed and performed within a single CLIA-certified laboratory, the lab has the expertise and infrastructure for validation, and the sponsor prefers speed to market over FDA clearance/approval. Note: regulatory landscape is changing rapidly as of 2024-2026.',
    advantages: [
      'Historically fastest path to market — no FDA premarket review required',
      'Lower development cost compared to PMA or 510(k)',
      'Flexibility to modify and improve the test without FDA submissions',
      'Can begin offering test immediately after internal validation',
      'Established pathway for genomic, molecular, and specialty diagnostic tests',
      'CLIA oversight provides quality baseline',
    ],
    disadvantages: [
      'Regulatory uncertainty: 2024 FDA final rule is phasing out enforcement discretion',
      'Legal challenges to the FDA rule ongoing — final regulatory framework uncertain',
      'No FDA marketing authorization — some payers require FDA approval for coverage',
      'Limited portability: test cannot be distributed or performed at other laboratories',
      'Reimbursement challenges — MolDx program and payer medical policies may be restrictive',
      'Reputational risk vs. FDA-approved IVDs in competitive market',
      'Post-2024 rule: will need to come into compliance with device regulations over 4-year phase-in',
    ],
  },
  {
    pathway: '510(k) for IVD',
    agency: 'FDA',
    product_type: 'diagnostic',
    description:
      '510(k) premarket notification for in vitro diagnostic devices. Requires demonstration of substantial equivalence to a predicate IVD. Most commonly used for Class II IVDs including chemistry analyzers, hematology instruments, immunoassay platforms, and moderate-risk molecular diagnostics. The pathway and requirements are similar to device 510(k) but with IVD-specific performance standards.',
    typical_review_months: 7,
    total_timeline_months: 10,
    success_rate: 0.80,
    requires_clinical_data: 'usually',
    key_requirements: [
      'Identification of a predicate IVD device with the same intended use',
      'Analytical performance studies: accuracy, precision (repeatability, reproducibility), linearity, LOD/LOQ, interfering substances, stability',
      'Clinical performance: method comparison study against a reference method or predicate device',
      'Specimen matrix validation (serum, plasma, whole blood, urine, tissue, etc.)',
      'Device description including reagent formulations, instrument specifications, and software algorithms',
      'Labeling review including package insert and IFU',
      'Applicable consensus standards (ISO 15189, CLSI guidelines)',
      'Pre-submission meeting recommended for novel analytes or technologies',
    ],
    applicable_when:
      'The IVD is Class II, there is an existing predicate IVD for the same analyte and intended use, and the new test uses the same or similar technology. Common for clinical chemistry, immunoassay, hematology, and molecular diagnostic platforms.',
    advantages: [
      'Well-established pathway for moderate-risk IVDs',
      'No clinical trial required in most cases — method comparison study is sufficient',
      'Moderate timeline (7 months review) and cost',
      'Broad distribution: cleared IVD can be sold to any CLIA-certified laboratory',
      'CMS coverage pathway is clearer for FDA-cleared IVDs vs. LDTs',
      'Marketing claims substantiated by FDA clearance — competitive advantage over LDTs',
    ],
    disadvantages: [
      'Requires suitable predicate — novel biomarkers or technologies may not have one',
      'Analytical performance studies can be time-consuming and expensive',
      'Clinical method comparison may require large numbers of patient specimens',
      'FDA may request Additional Information that extends review by 3-6 months',
      'IVD-specific guidance documents are extensive and evolving',
      'Post-market reporting requirements (MDR, corrections/removals)',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// SPECIAL DESIGNATIONS
// ────────────────────────────────────────────────────────────

const SPECIAL_DESIGNATIONS: RegulatoryPathwayDefinition[] = [
  {
    pathway: 'Orphan Drug Designation (FDA)',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'FDA designation for drugs intended to treat rare diseases or conditions affecting fewer than 200,000 patients in the US (or more than 200,000 if there is no reasonable expectation that development costs will be recovered from US sales). Provides tax credits, user fee waivers, and 7-year market exclusivity upon approval.',
    typical_review_months: 0,
    total_timeline_months: 3,
    success_rate: 0.75,
    requires_clinical_data: 'rarely',
    key_requirements: [
      'Disease or condition affects fewer than 200,000 persons in the US annually (or cost-recovery exception)',
      'Scientific rationale for the drug\'s potential to treat the condition (nonclinical or clinical data)',
      'Orphan Drug Designation application to OOPD (Office of Orphan Products Development)',
      'FDA review and decision within 90 days of complete application',
      'Medically plausible hypothesis that the drug will be effective for the rare disease',
      'Prevalence documentation using published literature, patient registries, or epidemiology data',
    ],
    applicable_when:
      'The drug is intended for a disease affecting fewer than 200,000 US patients (e.g., most rare genetic diseases, rare cancers, rare subtypes of common diseases). Can be obtained at any stage of development, from preclinical onward.',
    advantages: [
      '7-year market exclusivity upon approval (blocks approval of same drug for same indication)',
      'Tax credits for qualified clinical trial expenses (up to 25% of clinical trial costs)',
      'Waiver of PDUFA user fee (approximately $4.0M savings)',
      'FDA grant funding eligibility (Orphan Products Clinical Trials Grants Program)',
      'Eligibility for expedited pathways (Fast Track, Breakthrough, Accelerated Approval)',
      'Reduced competition during exclusivity period',
      'Premium pricing: orphan drugs average $150,000+/year per patient in the US',
    ],
    disadvantages: [
      'Small market size — fewer than 200,000 patients may limit revenue potential',
      'Clinical trial recruitment challenging in rare diseases',
      'Exclusivity can be broken if a competitor demonstrates clinical superiority',
      'Same drug/same indication exclusivity — different drugs can still be approved',
      'Payer pushback on high pricing for orphan drugs is increasing',
      'FDA can withdraw orphan exclusivity if prevalence exceeds 200,000 threshold',
    ],
  },
  {
    pathway: 'Rare Pediatric Disease Designation (FDA)',
    agency: 'FDA',
    product_type: 'pharma',
    description:
      'Designation for drugs intended to prevent or treat a rare pediatric disease (serious or life-threatening disease primarily affecting individuals aged birth to 18 years, with fewer than 200,000 affected in the US). Upon approval, the sponsor receives a Priority Review Voucher (PRV) that can be used or sold to another company.',
    typical_review_months: 0,
    total_timeline_months: 3,
    success_rate: 0.70,
    requires_clinical_data: 'rarely',
    key_requirements: [
      'Disease must primarily affect individuals aged 0-18 years',
      'Disease affects fewer than 200,000 persons in the US',
      'Disease must be serious or life-threatening',
      'Designation request submitted to OOPD with supporting evidence',
      'Upon NDA/BLA approval: PRV application submitted demonstrating ongoing rare pediatric disease need',
      'PRV program currently authorized through September 30, 2026',
    ],
    applicable_when:
      'The drug treats a rare, serious, or life-threatening disease that primarily affects children (aged 0-18). Includes rare genetic disorders, pediatric cancers, and inherited metabolic diseases. The PRV incentive makes this financially attractive even for small-market indications.',
    advantages: [
      'Priority Review Voucher upon approval — can be used or sold (PRVs have sold for $68M-$350M)',
      'Significant financial incentive offsets the high cost of pediatric drug development',
      'Can be combined with Orphan Drug Designation for additional benefits',
      'Rare Pediatric Disease PRV does not expire and is transferable',
      'Strong FDA support and expedited review for pediatric rare disease drugs',
      'Growing investor interest in rare pediatric disease programs due to PRV economics',
    ],
    disadvantages: [
      'Limited to diseases primarily affecting children — adult-onset diseases do not qualify',
      'Small patient population makes clinical trial design and enrollment challenging',
      'PRV program authorization may not be renewed beyond current sunset date',
      'PRV values have declined from peak ($350M) as more vouchers have been issued',
      'Complex regulatory pathway for pediatric clinical trials (ethical considerations, endpoint selection)',
      'Market exclusivity and commercial opportunity limited by small patient population',
    ],
  },
  {
    pathway: 'Orphan Medicinal Product Designation (EMA)',
    agency: 'EMA',
    product_type: 'pharma',
    description:
      'EMA designation for medicines intended to treat, prevent, or diagnose rare diseases (life-threatening or chronically debilitating conditions affecting no more than 5 in 10,000 persons in the EU). Provides 10 years of market exclusivity, protocol assistance, and fee reductions. Evaluated by the Committee for Orphan Medicinal Products (COMP).',
    typical_review_months: 0,
    total_timeline_months: 3,
    success_rate: 0.72,
    requires_clinical_data: 'rarely',
    key_requirements: [
      'Condition affects no more than 5 in 10,000 persons in the EU (approximately 250,000 patients)',
      'Or: the product would not generate sufficient return to justify investment without incentives',
      'No satisfactory method of diagnosis, prevention, or treatment authorized in the EU — or the product offers significant benefit over existing methods',
      'Application to COMP with medical plausibility data',
      'COMP opinion within 90 days of valid application',
      'Condition must be life-threatening or seriously debilitating',
      'Prevalence documentation based on EU epidemiology data',
    ],
    applicable_when:
      'The drug treats a rare condition affecting no more than 5 in 10,000 EU population and there is either no existing treatment or the product offers significant benefit. Can be requested at any development stage.',
    advantages: [
      '10 years of market exclusivity in the EU (extendable to 12 years for pediatric products)',
      'Fee reductions for EMA regulatory activities (protocol assistance, MAA, inspections)',
      'Protocol assistance: scientific advice from EMA at reduced cost',
      'Access to EU centralized procedure regardless of therapeutic area',
      'Stronger exclusivity protection than US orphan drug exclusivity',
      'EU orphan drug market growing rapidly — premium pricing increasingly accepted',
    ],
    disadvantages: [
      'Market exclusivity can be broken if a competitor demonstrates significant benefit',
      'Orphan designation can be removed at marketing authorization if prevalence exceeds threshold',
      'Smaller EU market vs. US for many rare diseases due to pricing differences',
      'Fee reductions are limited (not full waivers like FDA orphan)',
      'National pricing and reimbursement still required country-by-country',
      'HTA bodies in some EU countries may resist premium pricing for orphan medicines',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// COMBINED EXPORT
// ────────────────────────────────────────────────────────────

export const REGULATORY_PATHWAYS: RegulatoryPathwayDefinition[] = [
  ...FDA_PHARMA_PATHWAYS,
  ...EMA_PHARMA_PATHWAYS,
  ...PMDA_PHARMA_PATHWAYS,
  ...FDA_DEVICE_PATHWAYS,
  ...EU_DEVICE_PATHWAYS,
  ...FDA_DIAGNOSTICS_PATHWAYS,
  ...SPECIAL_DESIGNATIONS,
];

// ────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

export function getPathwaysByAgency(agency: RegulatoryAgency): RegulatoryPathwayDefinition[] {
  return REGULATORY_PATHWAYS.filter((p) => p.agency === agency);
}

export function getPathwaysByProductType(
  productType: 'pharma' | 'device' | 'diagnostic' | 'cdx',
): RegulatoryPathwayDefinition[] {
  return REGULATORY_PATHWAYS.filter((p) => p.product_type === productType);
}

export function getPathwayByName(name: string): RegulatoryPathwayDefinition | undefined {
  return REGULATORY_PATHWAYS.find(
    (p) => p.pathway.toLowerCase() === name.toLowerCase(),
  );
}

export function getExpeditedPathways(agency: RegulatoryAgency): RegulatoryPathwayDefinition[] {
  const expeditedNames: Record<RegulatoryAgency, string[]> = {
    FDA: ['Accelerated Approval', 'Priority Review', 'Fast Track', 'Breakthrough Therapy Designation', 'Breakthrough Device Designation'],
    EMA: ['PRIME (Priority Medicines)', 'Conditional Marketing Authorisation', 'Accelerated Assessment'],
    PMDA: ['SAKIGAKE Designation', 'Conditional Early Approval (Japan)'],
    NMPA: [],
  };
  const names = expeditedNames[agency] ?? [];
  return REGULATORY_PATHWAYS.filter(
    (p) => p.agency === agency && names.includes(p.pathway),
  );
}
