# Contributing (v.1.0.0)
 
This document covers conventions for working on the Bookshelf App codebase,branching, commits, code style, and the general workflow.
 
 
## Workflow
 
1. Pull the latest `main`
2. Create a feature or fix branch (see naming below)
3. Make your changes — keep commits small and focused
4. Run the checks before pushing
5. Open a pull request against `main`
 
## Branch Naming
 
```
feat/short-description        # new feature
fix/short-description         # bug fix
chore/short-description       # maintenance, deps, config
docs/short-description        # documentation only
refactor/short-description    # no behavior change
```
 
Examples:
 
```
feat/book-search-filter
fix/progress-percentage-calculation
chore/upgrade-prisma-5.x
docs/add-trpc-guide
```
 
## Commit Style
 
Follow [Conventional Commits](https://www.conventionalcommits.org/):
 
```
<type>: <short summary in present tense>
 
[optional body — explain why, not what]
```
 
Types:
 
| Type | When to use |
|---|---|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `chore` | Maintenance (deps, config, tooling) |
| `docs` | Documentation only |
| `refactor` | Internal restructure, no behavior change |
| `test` | Adding or updating tests |
| `style` | Formatting only (no logic change) |
 
Examples:
 
```
feat: add genre filter to book list
fix: correct completion percentage when totalPages is null
chore: upgrade to Prisma 5.14
docs: document tRPC procedure conventions
refactor: extract book validation schema to shared lib
```
 