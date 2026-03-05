You are a senior UI/UX designer + front-end motion designer.

Project: “Herbalook” — a digital B2B catalogue website (Hebrew, RTL). Style is minimal, modern, exotic/natural. Smooth premium feel. No pricing.

Task: Define and implement a consistent animation system across the entire website, including button navigation that animates to the target section/page.

Global motion rules:
- Use subtle, premium motion (no flashy effects).
- Prefer smooth easing (ease-out for entering, ease-in for exiting).
- All animations must feel consistent across the site.
- Respect reduced motion: if user prefers reduced motion, reduce duration and remove parallax/blur, keep minimal fades only.

Page/section transitions (when navigating between pages or major sections):
- Use animated transitions (fade + slight translate).
- Enter: opacity 0 → 1 and translateY 12px → 0 (or translateX in RTL-friendly way), duration 450–650ms.
- Exit: opacity 1 → 0 and translateY 0 → -10px, duration 250–350ms.
- Keep header/nav stable when possible; content transitions underneath.

Button navigation behavior (very important):
- Any button or nav item that navigates must not jump instantly.
- When a button is pressed:
  1) show a micro-interaction on the button (scale 0.98 for 80ms + ripple or soft highlight).
  2) animate navigation to the target:
     - If it’s a section on the same page: smooth scroll to anchor with duration 650–900ms and easing.
     - While scrolling, animate the target section reveal:
       * as it becomes visible: opacity 0 → 1 and translateY 16px → 0, duration 500–700ms.
  3) After reaching the target: briefly highlight the section (soft background glow/pulse for 600–900ms) to confirm arrival.

Hover + focus states (desktop):
- Buttons: subtle lift on hover (translateY -2px) and slight shadow increase, duration 150–220ms.
- Links: underline animation (from right to left for RTL) duration 200ms.
- Focus states must be accessible: visible outline or glow.

Cards + product elements:
- On load: stagger reveal for cards (80–120ms between items).
- On hover: image zoom 1.02 and card elevate slightly.
- On tap (mobile): quick scale down then back (0.98 → 1.0).

Navbar behavior:
- Sticky navbar with smooth hide/show:
  - On scroll down: navbar slides up slightly and becomes more compact.
  - On scroll up: navbar returns.
- Active section indicator animates (sliding underline from right-to-left for RTL).

Scrolling enhancements (optional but subtle):
- Very light parallax on large hero images only (max 6–10px movement).
- No heavy blur or long elastic motions.

Performance + quality:
- Keep animations GPU-friendly (transform/opacity).
- Avoid animating layout properties heavily.
- Ensure animations look smooth on mobile.

Deliverable:
- Apply this animation system across all pages and all navigation buttons.
- Ensure every navigation action uses animated motion to reach the destination area/page.
- Website must remain fast, clean, modern, and premium.