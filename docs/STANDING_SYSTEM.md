# Standing System

## Overview

The **Standing System** replaces the old *Merit System* as the framework for tracking a user’s advancement in the community. Unlike the previous design, Standing focuses on multiple dimensions of contribution and connection, and avoids moralizing concepts like “merit.”

Standing represents the **overall position** of a user within the community. It is influenced by three underlying factors:

* **Reputation** – how trusted and respected the user is.
* **Engagement** – how much constructive activity the user contributes.
* **Affinity** – how close and integrated the user is with the community and (eventually) with topics of focus.

Together, these form a holistic measure of presence and growth. Standing governs access to features and resources, and also drives private levels and optional public cosmetic enhancements.

---

## Core Concepts

### Standing

* A composite measure (0–100 scale initially) combining Reputation, Engagement, and Affinity.
* Determines a user’s **Standing Level** and available unlocks.
* Never shown publicly as a number.

### Axes

* **Reputation (R)** – Credibility, trust, quality of contributions.
* **Engagement (E)** – Activity, participation, completion of objectives.
* **Affinity (A)** – History, consistency, closeness with the community.
* Future: Affinity may extend to **topic-level familiarity**.

### Standing Levels

* Private, tiered progression based on Standing.
* Each level unlocks new features, reach, or resources.
* Example levels: Contributor → Collaborator → Steward → Curator → Guardian.
* Levels are **visible only to the user**, unless they choose to display cosmetics.

### Cosmetics

* Optional, non-intrusive profile enhancements (e.g., subtle borders, accents).
* Cosmetic indicators are **opt-in only**.
* Designed to be uplifting, not competitive or judgmental.

---

## User Experience

* Users can view their Standing Level, their R/E/A breakdown, and recent contributing events.
* Guidance is provided on “what moves the needle next” to encourage constructive growth.
* Publicly, no scores are visible unless the user opts into cosmetics.
* Achievements are celebrated with gentle, optional cues.

---

## Roadmap

1. **Documentation & Design (current)**

   * Replace old Merit System documentation with the Standing vision.
   * Do not change code yet.
2. **Refactor Terminology**

   * Replace internal references from “merit” to “standing” in codebase (future milestone).
   * Introduce R/E/A axes as tracked metrics.
3. **Standing Levels (MVP)**

   * Add private levels and feature unlocks.
   * Begin seeding cosmetic options.
4. **Cosmetic System (opt-in)**

   * Add cosmetic enhancements to user profile appearance.
   * Ensure opt-in is default off.
5. **Topic Affinity (future)**

   * Expand Affinity to account for topical expertise as well as community tenure.

---

## Why This Design?

* **Non-dualistic**: Avoids “meritocracy” baggage.
* **Holistic**: Combines trust, activity, and presence into a balanced measure.
* **Private-first**: Growth is personal and encouraging, not competitive.
* **Optional visibility**: Public expression is a choice, not forced.
* **Extendable**: Topic-based affinity and future unlock systems can be layered on later.

---

✅ This document supersedes the old *MERIT_SYSTEM.md*. It defines the **Standing System** as the guiding vision, while code changes and refactors will be introduced in future phases.