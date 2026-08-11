# Paris Summit Invite — Microsite

A personalized executive event invitation microsite for Salesforce World Tour Paris.
Phase 1: static prototype using fictional sample data. No backend, no auth, no database.

## File Structure

```
paris-summit-invite/
  index.html       — semantic page layout; contains no personal data
  styles.css       — editorial visual design (Paris aesthetic)
  app.js           — renders INVITE record into DOM; scroll animations
  invite-data.js   — single invitation record (fictional sample)
  assets/          — placeholder for future images/logos
  CLAUDE.md        — this file
```

## How to Run

Open `index.html` in any modern browser. No build step required.

For local development with live reload:
```
npx serve .
# or
python3 -m http.server 8080
```

## Updating Invitation Content

Edit `invite-data.js` only. The HTML layout and CSS do not need to change.
All personalized content (name, company, event details, message, highlights, host, concierge) is
injected by `app.js` at runtime from the `INVITE` constant.

## Data Privacy

- Do not commit real executive data to this repository.
- The invitation ID must never appear in the page URL.
- `invite-data.js` contains fictional sample data only.

## Design Tokens

Defined in `styles.css` `:root`. Key decisions:
- `--sf-navy` (#032D60) — Salesforce dark navy, used in hero and headings
- `--sf-blue` (#00A1E0) — Salesforce primary blue, used for the single CTA only
- `--gold` (#B8975A) — editorial accent for rules, icons, section labels
- `--ivory` (#F9F6F0) — warm off-white body background
- Font stack: Playfair Display (serif headings) + Inter (sans body)

## Accessibility

- All color combinations meet WCAG AA contrast (4.5:1 for body text, 3:1 for large text).
- Scroll animations respect `prefers-reduced-motion`.
- Keyboard navigation supported; focus styles visible.
- Personal name is in the heading, not in the URL.

## Phase 2 Considerations (not built yet)

- Google Sheets integration for invitation records
- Slack RSVP notifications
- Per-invitation unique URL with token (not name/ID in path)
- Real executive photos in `assets/`
- Analytics (privacy-safe)
