const BASE_EFFECTIVE_FEDERAL = {
  single: [
    { cap: 60000, rate: 10 },
    { cap: 120000, rate: 14 },
    { cap: 220000, rate: 19 },
    { cap: Infinity, rate: 22 }
  ],
  married: [
    { cap: 120000, rate: 9 },
    { cap: 240000, rate: 12 },
    { cap: 400000, rate: 17 },
    { cap: Infinity, rate: 20 }
  ]
};

const STATE_EFFECTIVE_RATES = {
  none: 0,
  ca: 7,
  ny: 6,
  ma: 5,
  il: 4,
  tx: 0,
  fl: 0,
  wa: 0,
  other: 4
};

const ADDITIONAL_MEDICARE_THRESHOLD = {
  single: 200000,
  married: 250000
};

export async function loadProfile() {
  const defaults = {
    filingStatus: 'single',
    state: 'other',
    incomeBand: '100k-200k',
    includeFica: true,
    includeMedicare: true,
    includeState: true,
    additionalDeductions: 0
  };

  const stored = await chrome.storage.sync.get(defaults);
  return { ...defaults, ...stored };
}

function resolveFederalRate(filingStatus, annualIncome) {
  const bands = BASE_EFFECTIVE_FEDERAL[filingStatus] || BASE_EFFECTIVE_FEDERAL.single;
  const match = bands.find((band) => annualIncome <= band.cap);
  return match ? match.rate : bands[bands.length - 1].rate;
}

function resolveStateRate(state) {
  return STATE_EFFECTIVE_RATES[state] ?? STATE_EFFECTIVE_RATES.other;
}

function bandToIncome(band) {
  if (band === '<100k') return 80000;
  if (band === '100k-200k') return 150000;
  if (band === '200k-400k') return 280000;
  return 450000;
}

export function estimateEffectiveRate(amount, profile) {
  const annualIncome = bandToIncome(profile.incomeBand);
  const federal = resolveFederalRate(profile.filingStatus, annualIncome);
  const state = profile.includeState ? resolveStateRate(profile.state) : 0;
  const fica = profile.includeFica ? Math.min(6.2, amount >= 160200 ? (6.2 * 160200) / amount : 6.2) : 0;
  const medicareBase = profile.includeMedicare ? 1.45 : 0;
  const medicareExtra = profile.includeMedicare && annualIncome > ADDITIONAL_MEDICARE_THRESHOLD[profile.filingStatus] ? 0.9 : 0;

  const grossRate = federal + state + fica + medicareBase + medicareExtra;
  const deductionImpact = profile.additionalDeductions ? (profile.additionalDeductions / amount) * 100 : 0;
  const adjustedRate = Math.max(0, grossRate - deductionImpact);
  return Number(adjustedRate.toFixed(1));
}

export function estimateTakeHome(amount, profile) {
  const effectiveRate = estimateEffectiveRate(amount, profile);
  const takeHome = amount * (1 - effectiveRate / 100);
  return {
    takeHome: Math.max(0, Math.round(takeHome)),
    effectiveRate
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
