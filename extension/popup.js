import { loadProfile, estimateEffectiveRate, formatCurrency } from './taxCalculator.js';

const filingStatus = document.getElementById('filingStatus');
const state = document.getElementById('state');
const incomeBand = document.getElementById('incomeBand');
const includeFica = document.getElementById('includeFica');
const includeMedicare = document.getElementById('includeMedicare');
const includeState = document.getElementById('includeState');
const additionalDeductions = document.getElementById('additionalDeductions');
const statusEl = document.getElementById('status');
const saveButton = document.getElementById('save');

async function hydrate() {
  const profile = await loadProfile();
  filingStatus.value = profile.filingStatus;
  state.value = profile.state;
  incomeBand.value = profile.incomeBand;
  includeFica.checked = profile.includeFica;
  includeMedicare.checked = profile.includeMedicare;
  includeState.checked = profile.includeState;
  additionalDeductions.value = profile.additionalDeductions;
  showPreview(profile);
}

function showPreview(profile) {
  const sample = 100000;
  const rate = estimateEffectiveRate(sample, profile);
  const takeHome = sample * (1 - rate / 100);
  statusEl.textContent = `Preview: ${formatCurrency(sample)} → ${formatCurrency(takeHome)} (${rate}% effective)`;
}

async function saveProfile() {
  const profile = {
    filingStatus: filingStatus.value,
    state: state.value,
    incomeBand: incomeBand.value,
    includeFica: includeFica.checked,
    includeMedicare: includeMedicare.checked,
    includeState: includeState.checked,
    additionalDeductions: Number(additionalDeductions.value) || 0
  };

  await chrome.storage.sync.set(profile);
  statusEl.textContent = 'Saved! New estimates will appear on refresh.';
  chrome.runtime.sendMessage({ type: 'profileUpdated' });
  showPreview(profile);
}

saveButton.addEventListener('click', saveProfile);
[filingStatus, state, incomeBand, includeFica, includeMedicare, includeState, additionalDeductions].forEach((el) =>
  el.addEventListener('change', () => {
    showPreview({
      filingStatus: filingStatus.value,
      state: state.value,
      incomeBand: incomeBand.value,
      includeFica: includeFica.checked,
      includeMedicare: includeMedicare.checked,
      includeState: includeState.checked,
      additionalDeductions: Number(additionalDeductions.value) || 0
    });
  })
);

hydrate();
