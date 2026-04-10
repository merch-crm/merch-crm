# MerchCRM UI Kit: Comparison Audit

This document provides a comparative analysis of specialized CRM components developed for MerchCRM against industry-standard open-source components from ReactBits and AlignUI.

## 1. Executive Summary
- **Custom Components**: Optimized for **Data Density** and **Business Logic**. Better for daily CRM operations where information clarity is paramount.
- **Library Components**: Optimized for **Emotional Resonance** and **Visual WOW-factor**. Ideal for onboarding, marketing landing pages, and "Hero" sections.

---

## 2. Head-to-Head Comparison

### Category A: Cards & Metrics
| Feature | Custom `MetricCard` | Recommendation |
| :--- | :--- | :--- |
| **Visual Style** | Minimal, SaaS-standard, clean. | Use Custom for Dashboards. |
| **Interactivity** | Hover states, smooth transitions. | |
| **Data Density** | High (shows sparklines, trends, subtext). | |

### Category B: Buttons & Actions
| Feature | Custom (Shadcn-based) | AlignUI `Fancy Button` | Recommendation |
| :--- | :--- | :--- | :--- |
| **Design** | Utility-first, reliable. | Premium gradient borders and animations. | **Adopt AlignUI**: For main "Call to Action" buttons (e.g., Create Deal). |
| **Performance** | Instant (Pure CSS). | Lightweight (Tailwind-only logic). | |
| **Customization** | Standard Tailwind classes. | Proprietary `tv()` (Tailwind Variants) system. | |

### Category C: Text & Typography
| Feature | Custom CSS Reveal | ReactBits `BlurText` / `SplitText` | Recommendation |
| :--- | :--- | :--- | :--- |
| **Animation** | One-time CSS fade-in. | Granular control (letter-by-letter, word-by-word). | **Adopt ReactBits**: For marketing headings and "Success" messages. |
| **Technical** | 0 JS overhead. | Requires GSAP/Motion (minimal overhead). | |

---

## 3. License & "Free" Tier Audit

We have verified that the following components implemented in MerchCRM are strictly from the **Free / Open Source** tiers:

1. **ReactBits**: Entirety of `reactbits.dev` is free. No "Pro" content imported.
2. **AlignUI**: Only "Base Components" (Atomic elements) included. No "Pro Blocks" or "Figma Pro" assets.

## 4. Next Steps for Decision Makers
1. **Approval of the Lab**: Review the side-by-side comparison at `/ui-kit/lab`.
2. **Strategic Selection**: Decide which categories should switch to Library-standard and which should remain Custom.
3. **Integration Phase**: Once choice is made, move selected library components from `lab/` to the main `ui-kit/` categories.
