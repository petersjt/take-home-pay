Take-Home Pay Estimator – Chrome Extension

Auto-estimates real take-home pay for any dollar amount you see online.

This Chrome extension scans webpages for financial numbers (salaries, comp ranges, account balances, cash amounts, etc.) and automatically displays a rough take-home pay estimate based on the user’s tax profile.

Tired of seeing $200,000 and forgetting that’s not actually $200K?
This extension shows you what it really means in your bank account.

⸻

✨ Features
	•	Automatically detects dollar amounts like:
	•	$200,000
	•	150k
	•	325,000
	•	Injects a small badge next to each detected amount that shows:
	•	Estimated take-home pay
	•	Effective tax rate used
	•	Hover tooltip shows deeper details (federal, state, FICA, Medicare)
	•	Lightweight, clean UI with minimal visual noise
	•	User profile stored locally via chrome.storage.sync

⸻

🧮 Tax Estimation

This tool provides a rough estimation, not a full tax engine.
It considers:
	•	Federal marginal tax (based on your income range)
	•	State income tax (average effective rate)
	•	FICA (6.2% up to the cap)
	•	Medicare (1.45% + additional Medicare if applicable)
	•	Optional deductions (user-specified)

Formula:

take_home = gross_amount * (1 - effective_tax_rate)

Accuracy target: ±5–10%, enough for salary/reality checks.

⸻

🧑‍💻 User Profile

On first use, the user fills out a simple form:
	•	Filing status
	•	State
	•	Annual income range
	•	Optional deductions
	•	Toggles for:
	  •	FICA
	  •	Medicare
	  •	State tax
	  •	Local tax

Stored using chrome.storage.sync.

⸻

📦 Architecture

This extension uses Chrome Extension Manifest V3.

/extension
  ├── manifest.json
  ├── popup.html
  ├── popup.js
  ├── contentScript.js
  ├── background.js
  ├── taxCalculator.js
  ├── styles.css
  └── README.md  (this file)

Main Components
	•	contentScript.js
Scans visible text nodes on the page, detects financial numbers, and injects UI badges.
	•	taxCalculator.js
Encapsulated logic for rough tax rate estimation.
	•	popup.html / popup.js
UI for setting and updating the user’s profile.
	•	background.js
Coordinates message passing and caching of user profile data.

⸻

🛠️ Build & Install Instructions
	1.	Clone or download the project files.
	2.	Open chrome://extensions in Chrome.
	3.	Enable Developer mode (toggle in the top right).
	4.	Click Load unpacked.
	5.	Select the project folder.
	6.	Visit any website containing dollar amounts to see the extension in action.

⸻

🚀 Stretch Goals

These aren’t required, but nice to have:
	•	Detect context around numbers:
	•	“annual,” “per year,” “hourly,” “monthly”
	•	Option to show badge only on hover
	•	Dark mode / light mode
	•	Ability to exclude specific sites

⸻

⚠️ Notes & Limitations
	•	This provides approximate tax calculations, not legally binding financial advice.
	•	Highly complex tax scenarios (itemized deductions, capital gains, AMT, etc.) are ignored for simplicity.
	•	Developers should keep dependencies minimal and the extension fast/lightweight.

⸻

🤖 Using GPT-Codex / Agentic Builders

If generating or modifying code with an AI agent:
	1.	Provide this README as context.
	2.	Ask for incremental improvements or file-specific changes.
	3.	Maintain the architecture listed above.
	4.	Keep UI + logic simple and testable.
