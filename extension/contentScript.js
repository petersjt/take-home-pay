let cachedProfile = null;
let tooltip = null;
const seenNodes = new WeakSet();

const numberPattern = /\$?\b\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?k?\b/gi;

async function ensureProfile() {
  if (cachedProfile) return cachedProfile;
  const module = await import(chrome.runtime.getURL('taxCalculator.js'));
  cachedProfile = await module.loadProfile();
  return cachedProfile;
}

function parseAmount(raw) {
  const normalized = raw.toLowerCase().replace(/\$/g, '').replace(/,/g, '').trim();
  const isK = normalized.endsWith('k');
  const numeric = parseFloat(normalized.replace(/k$/, ''));
  if (Number.isNaN(numeric)) return null;
  return Math.round(numeric * (isK ? 1000 : 1));
}

function createTooltip() {
  const tip = document.createElement('div');
  tip.className = 'thp-tooltip hidden';
  document.body.appendChild(tip);
  return tip;
}

function positionTooltip(target) {
  if (!tooltip || !target) return;
  const rect = target.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
}

async function buildBadge(textNode, rawMatch) {
  const module = await import(chrome.runtime.getURL('taxCalculator.js'));
  const profile = await ensureProfile();
  const amount = parseAmount(rawMatch);
  if (!amount) return;

  const { takeHome, effectiveRate } = module.estimateTakeHome(amount, profile);
  const badge = document.createElement('span');
  badge.className = 'thp-badge';
  badge.dataset.rate = effectiveRate;
  badge.textContent = module.formatCurrency(takeHome);

  badge.addEventListener('mouseenter', () => {
    tooltip ??= createTooltip();
    tooltip.innerHTML = `<strong>${module.formatCurrency(amount)} → ${module.formatCurrency(takeHome)}</strong>` +
      `<div>Effective rate: ${effectiveRate}%</div>` +
      `<div>Profile: ${profile.filingStatus}, ${profile.state.toUpperCase()}, ${profile.incomeBand}</div>`;
    tooltip.classList.remove('hidden');
    positionTooltip(badge);
  });

  badge.addEventListener('mouseleave', () => tooltip?.classList.add('hidden'));

  textNode.parentElement?.insertAdjacentElement('beforeend', badge);
}

async function scanTextNode(node) {
  if (seenNodes.has(node)) return;
  const text = node.textContent;
  if (!text || !numberPattern.test(text)) return;

  seenNodes.add(node);
  const matches = text.match(numberPattern) || [];
  for (const match of matches) {
    await buildBadge(node, match);
  }
}

function isEligibleNode(node) {
  if (!node || !node.parentElement) return false;
  const parent = node.parentElement;
  const tag = parent.tagName;
  if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'TITLE', 'INPUT', 'TEXTAREA'].includes(tag)) return false;
  if (parent.closest('.thp-badge')) return false;
  return true;
}

async function scanDocument() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let current = walker.nextNode();
  while (current) {
    if (isEligibleNode(current)) {
      await scanTextNode(current);
    }
    current = walker.nextNode();
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(async (node) => {
      if (node.nodeType === Node.TEXT_NODE && isEligibleNode(node)) {
        await scanTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        await scanDocument();
      }
    });
  }
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message?.type === 'refreshProfile') {
    cachedProfile = null;
    await ensureProfile();
    await scanDocument();
  }
});

(async function init() {
  await ensureProfile();
  tooltip = createTooltip();
  await scanDocument();
  observer.observe(document.body, { childList: true, subtree: true });
})();
