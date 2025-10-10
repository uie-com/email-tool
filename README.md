# Email Tool — Templating & Semi-Automatic Publishing

A full-stack React/TypeScript app that turns structured program data into production-ready emails — including template filling, QA, and guided publishing to ActiveCampaign or Postmark. It also automates surrounding tasks like creating Notion cards, Collaborative Notes, reference documents, and assets.

## 🧭 What It Does

- **Plan**: Reads upcoming sessions from Airtable to propose/schedule emails.
- **Compose**: Fills dynamic HTML templates (Stripo) using a rich variable system + transforms.
- **Review**: Side-by-side value/template QA, required-field checks, and an optional debug overlay.
- **Publish**: Semi-automatic pipelines for **Campaign**, **Automation**, and **Postmark** scheduling.
- **Orchestrate**: Creates Notion cards, Google Docs notes, and reference docs on demand.
- **Collaborate**: Posts review tickets to Slack.

## 🏗️ Tech Stack

- **Framework**: Next.js (React + API routes) • TypeScript
- **UI**: Mantine (components) • TailwindCSS (utility classes)
- **Integrations**:
  - Google Drive (collab notes & reference docs)
  - ActiveCampaign (templates, campaigns, automations)
  - Airtable (program/schedule data)
  - Slack (review tickets → `#email-deployments`)
  - Notion (Email cards)
- **Companion services**:
  - **PDF tool** (generate PDFs of notes)
  - **Postmark Scheduler** (programmatic one-time transactional sends)
  - **uieasset** (CDN for banners/images)

## ✨ Core Concepts

### Dynamic Templates & Variables
Templates use **Email Tool Variables** like {First Name}, {Session Date}, {Event Link}. Variables:
- are **case- and whitespace-insensitive** ({ Collab Notes } == {collabnotes})
- can be **required** via an asterisk ({Session Date *})
- may include **transforms** in parentheses ({Session Date (YYYY-MM-DD)(+1d)})

Variables can **reference other variables** (values and names) and are resolved safely (self-references error).

### Transforms (excerpt)
- **Dates**: (America/New_York), (YYYY-MM-DD hh:mma), (+1d|+1M|+1h), (Monday before), (12:00pm), (ASAP)
- **Strings**: (Caps), (Title Case), (Tag), (3 Letters), (First Word), (Number to Word), (Iterate x3) with (Separate:___)

See **Transforms** below for a fuller list.

### Config-First Design
Most behavior is declarative in `/config`:
- **Email Settings Config**: default values by program/email + conditional overrides
- **Schedule Config**: which sessions produce which emails, and when
- **Selector Config**: “Add Email” form options (for non-scheduled emails like Vessels/Content)
- **Variable Transforms**: custom transforms (`/config/variable-transforms.tsx`)

## 🚦 UI Overview

Across all pages:
- **Sidebar (top-left)**: all **in-progress** emails (shared). Bulk actions + quick variant creation.
- **Image Uploader (top-right)**: push to `uieasset`; filenames are hashed (safe to re-upload).
- **Auto-Save (bottom-right)**: `Loading…` → `…` (debounced) → `Saving…` → `Saved`.

> If a save is in progress, the app will **block reload** until it finishes.

### Page 1 — Schedule
- Lists each **upcoming session** + the **email(s)** derived from it and their completion status.
- **Start/Continue** actions depending on stage.
- **Quick-Create**:
  - Notion Email Card (and link it)
  - Collaborative Notes (Google Docs) + link back to Airtable
- **Filters**: tag search; data is cached (use **Refresh** to pull updates).
- **Add Email**: create ad-hoc emails (Vessel/Content). Pick a base HTML template or a blank.

### Page 2 — Info Review
- Edit **Send Date/Time, Name, Subject, Preview**, and **Send Type**:
  - `CAMPAIGN` (marketing; needs AC Campaign)
  - `AUTOMATION` (continuous transactional; needs AC Automation)
  - `POSTMARK` (one-time transactional; via Postmark Scheduler)
- One-click initial publishing helpers (create Reference Doc, Notion Card, Notes).
- Inspect/override **resolved values**; surface **hidden values** if needed.
- **Approve Values** → progress to Template Review (edits are still allowed).

### Page 3 — Template Review
- Side-by-side: **Values (left)** vs **Rendered HTML (right)**.
- Toggle **Show Original** (base template) or **Edit HTML** for quick fixes.
- Ensure links/required values are present; approve when QA checks out.

### Page 4 — Publishing
- Guided, undoable steps depending on send type (Campaign / Automation / Postmark).
- Copy-friendly “hover to copy” fields (e.g., Email ID) when needed.
- **ActiveCampaign auth**: you’ll need a current browser token (userscript below, optional).
- After external QA passes, you may **manually mark complete** (also syncs Notion & Slack).

**Optional Userscript (ActiveCampaign token bridge):**
```js
// ==UserScript==
// @name        Share AC Token
// @match       https://centercentre.activehosted.com/*
// @match       http://localhost/*
// @match       https://cc-emailtool.netlify.app/*
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==
(async () => {
  if (location.href.includes('activehosted')) {
    const token = sessionStorage.getItem('ac');
    if (token?.length > 5) await GM.setValue('ac', token);
    console.log('[USERSCRIPT] Aquired Token ', token);
  } else {
    const token = await GM.getValue('ac', '');
    const dict = JSON.parse(localStorage.getItem('globalSettings') || '{}');
    if (token?.length > 5) dict.activeCampaignToken = token;
    console.log('[USERSCRIPT] Updated Token ', token, dict);
    localStorage.setItem('globalSettings', JSON.stringify(dict));
  }
})();
```
Tip: If anything spins for 40s+ or looks odd, reload. Saves are guarded.

## 🧩 Configuration

### Email Settings Config (`/config/email-settings`)
Hierarchical **SETTINGS** object with conditional “filters” and **settings** dictionaries.  
Filters are `"Key:Value"` pairs; keys/values map directly to resolved variable names/values.

**Example (abbreviated):**
```
const SETTINGS = {
  settings: { 'Send To': { value: 'LoA' } },
  'Program:Metrics': {
    settings: { 'Send To': { value: 'Metrics' } },
    "Email Type:Today's Session": {
      settings: { 'Subject': { value: "Let's meet today!" } }
    }
  },
  'Send To:LoA': { settings: { 'List ID': { value: '255' } } }
};
```

**Flags per value:**
- `hide: true` — omit from UI  
- `part: 0..n` — build a value from multiple parts (override any piece)  
- `fetch: 'text' | 'airtable'` — dereference at runtime (e.g., import external HTML, or pull a field from Airtable)

### Schedule Config (`/config/email-schedule.ts`)
Declares which sessions produce which emails, and assigns send dates **relative** to session dates using transforms.

**Example:**
```
const EMAILS_PER_SESSION = {
  'Program:Metrics': {
    emails: {
      "Today's Session": { "Send Date": "{Session Date(8:00am)}" }
    },
    'Is Last Session': {
      emails: {
        "Today's Session": {},
        "Wrap Up": { "Send Date": "{Session Date(10:00am)}" },
        "Certificate": { "Send Date": "{Session Date(10:00am)(+1d)}" }
      }
    }
  }
};
```

### Selector Config (`/config/email-selector.ts`)
Controls options for **Add Email** (for items not derived from the schedule).  
Supports **multi-select**, generated options (e.g., months, numbered), and accepts **custom values** any time.

## 🔤 Variables & Transforms

### Variables
- {First Name} — plain variable  
- { Collab Notes } — spacing/case don’t matter  
- {Session Date *} — required; blocks publishing if empty  
- {Session Date (YYYY-MM-DD)(+1d)} — transforms  
- { {Name Type} Name } — variable in name (resolve “Name Type” first)  
- Values can also include variables: {Full Name} = "{First Name} {Last Name}"

### Transforms (full list)

| Transformation | Type  | Effect |
| --- | --- | --- |
| (America/New_York) (GMT) | Dates | Time zone conversion (source is ET). |
| (+1d) (-1d) (+1M) (-1M) (+1h) (-1h) | Dates | Relative date/time math. |
| (Monday before) (Friday after) | Dates | Nearest weekday adjustments. |
| (12:00pm) | Dates | Replace time of a datetime value. |
| (ASAP) | Dates | If past, show time as “ASAP” (in h:mmA strings). |
| (YYYY-MM-DD hh:mma) | Dates | Moment.js-style formatting. |
| (Iterate x3) | String | Repeat; increment `#` numbers; resolve [] vars after iteration. |
| (Separate:___) | String | Separator between iterations. |
| (+1) (-1) | String | Increment/decrement trailing number: Topic 2 → Topic 3. |
| (-:00) | String | Remove :00. |
| (Next Cohort) | String | Increment Win/Numbered cohorts. |
| (Shorthand) | String | Common shortenings (e.g., Cohort → C). |
| (First Word) | String | First token (e.g., April 2024 → April). |
| (#) | String | Keep digits only. |
| (/) | String | Turn ", " into "/". |
| (3 Letters) | String | Truncate to N letters (per item if combined with (/)). |
| (, ) | String | Turn "/" into ", ". |
| (Caps) (Title Case) | String | Uppercase / Title Case. |
| (Tag) | String | Spaces → dashes. |
| (Number to Adverb) | String | 1 → once, 2 → twice, … |
| (Number to Word) | String | 1 → one, 2 → two, … |
| (1st Person) | String | Convert TUXS descriptions to first-person. |
| (pre:___) | String | Add prefix only if non-empty. |
| (Last Paragraph) | String | Extract final paragraph. |
| (MD to HTML) | String | Markdown → HTML. |

## 📚 Schedule Data (what a session provides)

Every session from **Programs – Sync Utility** is normalized into a key:value set (ET timezone by default). You can reference current, previous, future, first/last, or adjacent session values by name, and even compose dynamic lookups:
- **Static**: {Week 3 Session 2 [VARIABLE]}
- **Dynamic**: {{Next Week} Session 1 [VARIABLE]}

**Examples of available keys (abridged):**
- **IDs**: id, Original ID  
- **Datetimes**: Session Date, Lecture Date, Coaching Date, First Date, Last Date  
- **Flags** (presence strings): Is DST, Is First Session Of Program, Is Last Session Of Program, Is Combined Workshop Session, Is Combined Options Session, Is Before Break, Is After Break  
- **Program context**: Program, Cohort, Week, Next Week, Last Week, Session of Week, Session Week Type, counts this/next/prev week  
- **Content**: Topic, Title, Description (Markdown), Topic Type  
- **Links**: Lecture Link, Recording Link, Event Link, Collab Notes Link, Collab PDF Link  
- **Multi-part links**: Lecture Event Link, Coaching Event Link, First Event Link, Second Event Link  
- **Homework (TUXS)**: First Homework, Second Homework  
- **Future series**: Number of Upcoming Sessions + {{Upcoming Session #n [VARIABLE]}}

## 🚀 Getting Started

**Run locally.** The tool is resource-intensive and designed for developer machines.

1) **Clone**
```bash
git clone https://github.com/uie-com/email-tool
cd email-tool
```

2) **Install**
```bash
npm install
```

3) **Environment** — create `.env` in project root:
```dotenv
TAILWIND_MODE=watch

AIRTABLE_READ_API_KEY=YOUR_AIRTABLE_KEY
ACTIVECAMPAIGN_API_KEY=YOUR_AC_API_KEY

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000

SLACK_CREATE_WEBHOOK_URL=...
SLACK_DELETE_WEBHOOK_URL=...
SLACK_SENT_WEBHOOK_URL=...
SLACK_UNDO_SENT_WEBHOOK_URL=...
SLACK_POST_WEBHOOK_URL=...

NOTION_TOKEN=YOUR_NOTION_TOKEN
NOTION_EMAIL_DB_ID=YOUR_NOTION_DB_ID

ZAPIER_REQUEST_PDF_WEBHOOK_URL=...

AC_TOKEN=''  # optional local override if not using userscript

FTP_USER=uieasset
FTP_PASS=********
FTP_HOST=64.207.156.204
```
Never commit secrets. Use a secrets manager (e.g., 1Password) for shared creds.

4) **Run**
```bash
npm run dev
# open http://localhost:3000
```
- Initial load: ~5–10s to fetch schedule + ~5s for saved emails.  
- If loading exceeds ~40s, refresh. The app prevents reload during active saves.

## 🗺️ Project Structure (high level)
```
email-tool/
├─ config/
│  ├─ email-settings.ts            # SETTINGS root + program imports
│  ├─ email-schedule.ts            # EMAILS_PER_SESSION rules
│  ├─ email-selector.ts            # Add Email options
│  ├─ variable-transforms.tsx      # Custom transforms
├─ domain/
│  └─ email/
│     └─ schedule/
│        └─ session.ts             # Session normalization & variable naming
├─ public/                         # assets
├─ pages/ api/                     # Next.js API routes (integrations)
└─ ...
```
