---
name: gsd-master
description: Master orchestrator for Get Shit Done (GSD) skills. Contains internal tools for planning, execution, and reporting.
---

# GSD Master Skill

This is a consolidated skill that manages all "Get Shit Done" internal tools. Use this skill when you need to perform actions related to project management, task execution, or session reporting.

## Available Internal Tools

All individual GSD tools are now located in the `internal/` directory:

- **Planning**: `gsd-plan-phase`, `gsd-plan-milestone-gaps`, `gsd-plant-seed`
- **Execution**: `gsd-workstreams`, `gsd-pr-branch`, `gsd-verify-work`
- **Maintenance**: `gsd-cleanup`, `gsd-check-todos`, `gsd-map-codebase`
- **User Management**: `gsd-profile-user`, `gsd-set-profile`
- **Reporting**: `gsd-session-report`, `gsd-manager`

## How to use
When you need a specific GSD capability, refer to the corresponding `SKILL.md` within the `internal/` subdirectory:
`.agents/skills/gsd-master/internal/<skill-name>/SKILL.md`
