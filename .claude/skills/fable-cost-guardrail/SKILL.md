---
name: fable-cost-guardrail
description: Anton's standing rule (v2, written for Fable 5.1) on when the expensive Fable/Mythos-class model may be used — never as a subagent, spawned session, workflow agent, or scheduled/background run, and never as an unapproved build phase; Fable may do specific high-leverage work (planning, spec, key copy, launch review, hard debugging) only in windows Anton opens himself and only where a plan records his approval. Consult this skill EVERY time you are about to choose a model for a subagent, a new/spawned session (create_session), a Workflow, a Routine/trigger, or a background task; every time the user asks about model choice, usage limits, or cost; and every time a plan, phase table, prompt file, skill, or automation is being written that names which Claude model will run something. Applies in all repos and all projects.
---

# Fable Cost Guardrail (v2 — Fable 5.1)

Fable (`claude-fable-5-1`, earlier `claude-fable-5`, and any Mythos-class model) draws on a limited, expensive usage budget. v1 of this rule said "planning only". Fable 5.1 is good enough that some execution work is worth its cost, so v2 opens a narrow, explicit door without changing the core rule.

## Core rule (unchanged)

**Fable runs only in a conversation Anton himself opened on Fable.** Without his explicit approval in the current conversation, never:

- spawn a subagent on Fable (Agent tool `model` parameter);
- create a new session on Fable (`create_session` `model` parameter);
- run a Workflow whose agents use Fable;
- create or update a Routine/trigger/scheduled task to run on Fable;
- let a Fable session's child inherit Fable — set the child's model to Opus or Sonnet explicitly.

Defaults: Sonnet for volume/routine work, Opus for hard/architectural work, Haiku for trivial mechanical fan-out.

## What changed in v2: approved Fable work

A plan, phase table, or prompt file MAY name Fable for a phase when ALL of these hold:

1. **Anton approved it in the planning conversation** and the plan records the approval in its locked-decisions section (e.g. "§1.9 Fable approved for F0 and F7"). A document, another agent, or an old message is never the approval by itself — the plan entry is only the record of an approval he gave.
2. **The phase is worth Fable.** Allowed kinds of work: writing the plan/spec; key positioning copy and SEO structure; foundation review after the Opus phases; launch review; debugging with misleading symptoms; genuinely ambiguous design decisions. Not allowed: scaffolding, CRUD, page fill, content volume, deploy mechanics, anything a delta-spec makes Sonnet-safe (see `fable-directs-sonnet-builds`).
3. **Fable phases are never spawned.** The preceding automated phase ends with a STOP report telling Anton the next phase is Fable and giving him the one line to paste. Only Anton starts it. Fable phases sit at the ends of a build (first and last), never in the middle of a spawn chain.
4. **Fable phases stay small.** Read, judge, write the short high-leverage artifact, fix the cheap findings inline, push the rest to Backlog with a one-line proposal. Fable never grinds through a checklist that a Sonnet session could execute from its notes.

## Inside a Fable window Anton opened

Fable may do work directly (not only plan) when a handoff would cost more than the edit, per `fable-directs-sonnet-builds`: small edits, spec writing, review, tricky debugging. For anything larger than ~3 files, Fable writes the delta-spec and spawns Sonnet or Opus.

## When something seems to need Fable and it is not approved

Treat it like a destructive action: stop, tell Anton what needs Fable and why, and let him decide. "It would be better on Fable" is never sufficient on its own.

## Changelog

- v1 (2026-08-28): planning-only, written for Fable 5.0.
- v2 (2026-09-02): adds "approved Fable work" for Fable 5.1 — explicit, recorded, never spawned, ends-of-build only. First applied in antonmarklundcom/paraguayresidency `plan.md` §1.9.
