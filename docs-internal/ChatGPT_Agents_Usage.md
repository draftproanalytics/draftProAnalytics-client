Then tell the agent which documentation applies:

Read AGENTS.md and docs/modules/upcoming-games.md before making changes.

This is better than pasting your entire architecture template into every prompt.

6. Use Git worktrees or feature branches

Your past branch and stash problems make this especially important.

For a normal change:

cd ~/aiAssistWS/draftProAnalytics-client

git switch main
git pull --ff-only origin main
git switch -c feature/upcoming-games-preseason-filter

Then launch Codex:

codex

For parallel tasks, Codex supports agent workflows built around isolated worktrees, and OpenAI’s Codex interfaces are designed to support parallel engineering work without having every task edit the same working tree.

For now, I would keep it simple: one feature branch, one agent session, one clearly defined task.

7. Change how you prompt the agent

Do not prompt it like this:

Fix the Upcoming Games filters.

Use a constrained task contract:

Read AGENTS.md first.

Task:
Correct the Upcoming NFL Games filtering behavior.

Required behavior:
For any selected year, when:
- season type is Preseason
- week is Preseason

show all preseason games for the selected year.

Do not interpret the week selection as an individual preseason week in this
specific case.

Process:
1. Inspect the existing filter component, store/API request construction,
   server endpoint contract, and relevant tests.
2. Explain the current behavior and root cause.
3. List the files that need to change.
4. Implement the smallest complete correction.
5. Add or update tests.
6. Run the client build and relevant tests.
7. Show the final diff summary.

Constraints:
- Vue 3 Composition API
- strict TypeScript
- no `any`
- no unrelated refactoring
- do not commit or push

That prompt is much more agent-safe because it defines:

Desired behavior
Investigation scope
Constraints
Verification requirements
Prohibited actions
Definition of completion
8. Use a two-pass workflow

This is the most important methodology improvement.

Pass 1: Analysis only
Do not edit files yet.

Inspect the implementation related to Upcoming NFL Games filtering. Explain:

1. Current request flow
2. Root cause
3. Client and server files involved
4. Proposed solution
5. Test cases
6. Risks

Stop after presenting the plan.

Review the plan.

Pass 2: Implementation
Proceed with the approved plan.

Do not change files outside the approved list unless a necessary dependency is
discovered. If another file is necessary, explain why before modifying it.

Run the relevant tests and build after implementation.

This is more reliable than allowing the agent to investigate and immediately rewrite several modules.

9. Keep human approval at four checkpoints

You should retain control over:

Architecture: Does the plan conform to DPA’s module boundaries?
Database: Is any schema or production-data change being proposed?
Diff: Did the agent change only what was necessary?
Verification: Did tests and builds actually run successfully?

The agent can do the mechanical work, but it should not independently decide to redesign a module, change the database, commit, push, or deploy.

10. Suggested DPA operating model

For each feature:

1. Create feature branch
2. Start Codex in the repository
3. Ask for analysis only
4. Review and correct its plan
5. Authorize implementation
6. Review git diff
7. Run tests/build independently
8. Manually exercise the feature
9. Commit yourself
10. Merge through your normal Git process

Useful review commands:

git status
git diff --stat
git diff
git diff --check
npm run build
npm test

For server changes involving Prisma:

npx prisma validate
npx prisma generate
npm run build

Do not automatically run prisma db push, prisma migrate, database restoration scripts, or production deployment commands.

Bottom line

The recommendation to graduate from browser-and-zip development is correct. However, your best ChatGPT-native next step is:

Install Codex CLI, add disciplined AGENTS.md files to both DPA repositories, and adopt a plan-review-implement-test Git workflow.

The real improvement is not simply giving AI direct filesystem access. It is giving the agent controlled repository access plus persistent architectural rules, narrow tasks, verification gates, and reliable rollback through Git.

I would begin with the Upcoming NFL Games preseason-filter correction as the pilot. It is narrow enough to test the workflow without exposing a large module or database operation.
