/**
 * Sample fixture for the Claims reviews screen (MVP V1).
 *
 * All of this data is deliberately fictitious — the program names, addresses,
 * program IDs, payment references and amounts are invented for the prototype and
 * do not correspond to any real childcare program, claim or payment.
 */

/** Where a claim currently sits in the review chain. */
export type ReviewStatus =
  | 'In review at QA Review'
  | 'QA Review complete'
  | 'FDH EO complete'
  | 'ICC EO complete'
  | 'Funding Manager complete'
  | 'Held at Funding Manager';

export type ClaimType = 'Claim' | 'Adjustment';

/** Why a claim was pulled into the QA queue. */
export type ClaimFlag = 'High variance' | 'Random sample';

export interface Claim {
  /** Payment reference doubles as the stable row key. */
  paymentRef: string;
  /** Sortable received date (ISO). */
  receivedIso: string;
  program: string;
  address: string;
  programId: string;
  claimPeriod: string;
  type: ClaimType;
  amount: number;
  /** Present once the claim has entered the review chain. */
  reviewStatus?: ReviewStatus;
  /** True while the claim is awaiting HQ QA review. */
  inQaQueue: boolean;
  /** Why QA picked it up. Only meaningful for queued claims. */
  flag?: ClaimFlag;
  /** Seeded watchlist membership. */
  watchlisted: boolean;
}

export const CLAIMS: Claim[] = [
  // Appears in both working sets: in review at QA Review *and* sitting in the
  // HQ QA queue flagged for high variance.
  {
    paymentRef: 'PR-778400',
    receivedIso: '2026-07-15',
    program: 'Horse Shoe Lake Daycare',
    address: '1 Prospect Point NW, Canmore',
    programId: '80031442',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 12107.18,
    reviewStatus: 'In review at QA Review',
    inQaQueue: true,
    flag: 'High variance',
    watchlisted: true,
  },

  // ---- Claims overview ----
  {
    paymentRef: 'PR-778643',
    receivedIso: '2026-07-15',
    program: 'Chinook OSC',
    address: '667 10th Street SE, Medicine Hat',
    programId: '80010567',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 30784.18,
    reviewStatus: 'QA Review complete',
    inQaQueue: false,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778538',
    receivedIso: '2026-07-16',
    program: 'Willow Kids Club',
    address: '422 23rd Avenue NE, St. Albert',
    programId: '80010322',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 15130.18,
    reviewStatus: 'FDH EO complete',
    inQaQueue: false,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778616',
    receivedIso: '2026-07-15',
    program: 'Sunrise OSC',
    address: '604 1st Avenue NW, St. Albert',
    programId: '80010504',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 12152.18,
    reviewStatus: 'ICC EO complete',
    inQaQueue: false,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778670',
    receivedIso: '2026-07-15',
    program: 'Wildrose Play Academy',
    address: '730 19th Avenue NE, Lloydminster',
    programId: '80010630',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 16363.18,
    reviewStatus: 'Funding Manager complete',
    inQaQueue: false,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778697',
    receivedIso: '2026-07-15',
    program: 'Northern Early Learning',
    address: '793 4th Street SW, Sherwood Park',
    programId: '80010693',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 18469.18,
    reviewStatus: 'Funding Manager complete',
    inQaQueue: false,
    watchlisted: false,
  },
  // The single claim on hold — drives the "Hold 1" tab count.
  {
    paymentRef: 'PR-778427',
    receivedIso: '2026-07-15',
    program: 'Chinook Daycare',
    address: '163 10th Street SE, Spruce Grove',
    programId: '80010063',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 10319.18,
    reviewStatus: 'Held at Funding Manager',
    inQaQueue: false,
    watchlisted: true,
  },
  {
    paymentRef: 'PR-778619',
    receivedIso: '2026-07-16',
    program: 'Prairie OSC',
    address: '611 2nd Street SE, Sherwood Park',
    programId: '80010511',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 12386.18,
    reviewStatus: 'QA Review complete',
    inQaQueue: false,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778526',
    receivedIso: '2026-07-21',
    program: 'Wildrose Kids Club',
    address: '394 19th Avenue NE, Medicine Hat',
    programId: '80010294',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 6072.18,
    reviewStatus: 'FDH EO complete',
    inQaQueue: false,
    watchlisted: false,
  },
  // Negative adjustment — renders as a bracketed, emphasised amount.
  {
    paymentRef: 'PR-778646',
    receivedIso: '2026-07-16',
    program: 'Willow OSC',
    address: '674 11th Avenue NE, Fort McMurray',
    programId: '80010574',
    claimPeriod: 'Jun 2026',
    type: 'Adjustment',
    amount: -11502.82,
    reviewStatus: 'ICC EO complete',
    inQaQueue: false,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778673',
    receivedIso: '2026-07-16',
    program: 'Aurora Play Academy',
    address: '707 22nd Street SW, Calgary',
    programId: '80010637',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 16597.18,
    reviewStatus: 'Funding Manager complete',
    inQaQueue: false,
    watchlisted: false,
  },

  // ---- HQ QA queue ----
  {
    paymentRef: 'PR-778460',
    receivedIso: '2026-07-17',
    program: 'Foothills Preschool',
    address: '240 21st Avenue NW, St. Albert',
    programId: '80010140',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 7965.18,
    inQaQueue: true,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778547',
    receivedIso: '2026-07-19',
    program: 'Prairie Childcare Centre',
    address: '443 2nd Street SE, Okotoks',
    programId: '80010343',
    claimPeriod: 'Jun 2026',
    type: 'Adjustment',
    amount: 19677.18,
    inQaQueue: true,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778490',
    receivedIso: '2026-07-18',
    program: 'Chinook Inclusive Child Care',
    address: '310 7th Avenue NE, Fort McMurray',
    programId: '80010210',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 3264.18,
    inQaQueue: true,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778478',
    receivedIso: '2026-07-23',
    program: 'Maple FDH',
    address: '282 3rd Avenue NE, Calgary',
    programId: '80010182',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 3736.18,
    inQaQueue: true,
    flag: 'Random sample',
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778565',
    receivedIso: '2026-07-16',
    program: 'Aurora Childcare Centre',
    address: '485 8th Street SW, Medicine Hat',
    programId: '80010385',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 21081.18,
    inQaQueue: true,
    flag: 'High variance',
    watchlisted: true,
  },
  {
    paymentRef: 'PR-778703',
    receivedIso: '2026-07-17',
    program: 'Little Early Learning',
    address: '807 6th Street SE, Okotoks',
    programId: '80010707',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 18937.18,
    inQaQueue: true,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778469',
    receivedIso: '2026-07-20',
    program: 'Aspen Preschool',
    address: '261 24th Street SW, Okotoks',
    programId: '80010161',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 13594.18,
    inQaQueue: true,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778556',
    receivedIso: '2026-07-22',
    program: 'Bright Childcare Centre',
    address: '464 5th Avenue NW, Calgary',
    programId: '80010364',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 10234.0,
    inQaQueue: true,
    flag: 'Random sample',
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778409',
    receivedIso: '2026-07-18',
    program: 'Northern Daycare',
    address: '121 4th Street SW, Medicine Hat',
    programId: '80010021',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 8915.18,
    inQaQueue: true,
    watchlisted: false,
  },
  {
    paymentRef: 'PR-778418',
    receivedIso: '2026-07-21',
    program: 'Wildrose Daycare',
    address: '142 7th Avenue NE, Airdrie',
    programId: '80010042',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 4689.18,
    inQaQueue: true,
    watchlisted: true,
  },
  {
    paymentRef: 'PR-778574',
    receivedIso: '2026-07-19',
    program: 'Willow Childcare Centre',
    address: '506 11th Avenue NE, Airdrie',
    programId: '80010406',
    claimPeriod: 'Jun 2026',
    type: 'Claim',
    amount: 3948.18,
    inQaQueue: true,
    watchlisted: false,
  },
];

/**
 * Size of the whole HQ QA queue on the server, as specified by the design
 * ("QA queue 68"). The fixture above only populates the first page of that
 * queue, so the tab badge reads from this total rather than from `CLAIMS`.
 */
export const QA_QUEUE_TOTAL = 68;
