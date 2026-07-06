# Skill: Premium UI/UX Review (`ui-ux-review`)

## 1. Purpose
The purpose of this skill is to enforce our strict design ethos of "Craftsmanship over Defaults". It ensures that all interfaces are tailored to high accessibility standards (essential for elderly recipients) and high informational clarity (essential for busy caregivers).

## 2. When this skill should be invoked
Invoke this skill whenever:
* Creating, styling, or refactoring front-end user interface components.
* Building interactive widgets, graphs, navigation sidebars, or modals.
* Enhancing accessibility (WCAG compliance), responsive layouts, and animations.

## 3. Preconditions
* Standard styling utilities (Tailwind CSS) and animation libraries (`motion`) configured.
* Screen assets and icons imported from approved libraries (`lucide-react`).

## 4. Inputs
* Front-end component files (`.tsx`).
* Visual layouts in different viewports (mobile to desktop).
* Accessibility and color-contrast measurements.

## 5. Expected outputs
* A compiled `ui_ux_review.md` (or `production_review.md`) report detailing visual compliance.
* Highly polished, responsive, and animated user interfaces.

## 6. Step-by-step execution workflow
1. **Visual Contrast Check**: Verify that all text contrasts against its background. Normal text must satisfy WCAG AA (at least 4.5:1 ratio).
2. **Touch Target Inspection**: Ensure all interactive buttons, inputs, and toggles have a touch-target size of at least 48x48px (crucial for older adults).
3. **Responsive Flow Audit**: Resize viewports from 320px (mobile portrait) to 1440px (desktop) to ensure layouts expand gracefully without clipping or overlapping.
4. **State Coverage Audit**: Verify and implement:
   * *Skeleton loaders* during data retrieval.
   * *Empty states* with call-to-action assistance.
   * *Error overlays* with manual retry triggers.
   * *Success animations* on form confirmations.
5. **Interactive Motion implementation**: Use `motion` to add gentle entry transitions (e.g., staggering list items, slide-over modals).
6. **Report Generation**: Compile findings using the premium UI/UX review template.

## 7. Validation checklist
- [ ] Text contrasts satisfy WCAG AA recommendations.
- [ ] Interactive touch points are at least 48px in height.
- [ ] Layout behaves perfectly down to 320px viewport width.
- [ ] Loading skeletons, empty states, and error cards are configured.
- [ ] Motion animations are smooth and serve a visual-hierarchy purpose.

## 8. Common failure scenarios
* **Clipped Content on Small Devices**: Layout cards overflow screen width on 360px viewports. *Mitigation*: Replace hardcoded pixel widths (`w-[400px]`) with responsive percentage parameters (`w-full max-w-md`).
* **Sudden Visual Pop-ins**: Data loads and shifts content down abruptly. *Mitigation*: Pre-allocate container height using stable skeletons.

## 9. Acceptance criteria
* The review report contains zero visual or accessibility blockers.
* The interface works smoothly on touch devices.

## 10. Deliverables
* Completed `ui_ux_review.md` report.
* Optimized visual components under `/src/components/`.

## 11. Dependencies on other skills
* **Performance Review (`performance-review`)**: Excessive visual animations must not degrade frame rates.
* **Healthcare Compliance (`healthcare-compliance`)**: High-priority alert buttons must be instantly accessible and clear.

## 12. Example usage
Reviewing the Caregiver Dashboard:
Check that the heart rate graph utilizes an eye-safe contrast color, that the "Call Smartwatch" button is larger than 48px, and that the timeline items stagger in with a gentle fade-in animation.

## 13. Anti-patterns (What must never be done)
* ❌ **DO NOT** use default browser outline rings or generic purple/blue gradients.
* ❌ **DO NOT** let content render on mobile with raw unaligned borders.
* ❌ **DO NOT** use unstyled, non-functional text placeholders like "Lorem Ipsum".
* ❌ **DO NOT** include sudden, jarring page refreshes instead of smooth React transitions.
* ❌ **DO NOT** implement multiple visual presets or theme options unless the user explicitly requests them. Choose one polished slate/teal design and stick to it.
