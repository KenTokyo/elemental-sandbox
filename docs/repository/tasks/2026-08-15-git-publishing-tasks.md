# Git publishing — task and progress log

## Initial goal

- Prompt: `docs/repository/tasks/2026-08-15-git-publishing-enhanced-prompt.md`
- Turn this project folder into an independent public GitHub repository and push its `main` branch.

## Phase 1 — Repository and publication audit

**Goal:** Establish a safe repository boundary and publication set.

- [x] Confirm current Git boundary, identity, GitHub CLI access, and target repository availability.
- [x] Review ignored, generated, local-only, secret-like, and oversized content.
- [x] Decide repository name, visibility, and staged file set.

**Limits:** No browser, UI check, dev server, or product behavior changes.

**Architecture:** Nested project `.git/` owns product history; parent Git repository continues to own only shared rule files.

**References:** `.gitignore`, `package.json`, `README.md`

## Phase 2 — Independent Git repository

**Goal:** Produce one clean, reproducible initial commit on `main`.

- [ ] Update only repository metadata needed for safe publication.
- [ ] Initialize nested repository with `main`.
- [ ] Stage only reviewed project files.
- [ ] Check status, staged file list, staged diff, and whitespace.
- [ ] Commit the complete project.

**Limits:** Never use `git add -A`; never stage parent-repository files.

## Phase 3 — GitHub publication and verification

**Goal:** Publish and verify the independent repository.

- [ ] Create public GitHub repository under authenticated account.
- [ ] Configure `origin`, push `main`, and set upstream.
- [ ] Verify local hash, remote hash, remote URL, branch, and clean status.
- [ ] Re-read prompt and task, then append completion evidence.

## Progress log

### 2026-08-15 — Start

- Current folder is inside parent rules repository `D:/CODING/React Projects/test-projects`; no nested `.git/` exists yet.
- GitHub CLI is available and authenticated as active account `KenTokyo` with repository access.
- `CLAUDE.md` is absent from project and allowed parent rule locations; shared coding rules were found at `../shared/shared-docs/CODING-RULES.md` and read fully.

### 2026-08-15 — Phase 1 complete

- Target: public `KenTokyo/elemental-sandbox`; GitHub API lookup returned no accessible existing repository.
- Publication set: source, required public assets, package lock, docs, audit tools, reference images, README, and MIT license.
- Exclusions: `node_modules/`, `dist/`, `.uniai-chat/`, and `.unityAIChat/`; last two contain machine-local model cache, prompt configuration, and chat history.
- Secret scan found no matching credential filename, access token, private key, or credential assignment.
- Largest publishable file is `public/hdri/spruit_sunrise.hdr` at 5,934,209 bytes; no file exceeds 50 MiB or GitHub's 100 MiB file limit.
- Phase result: repository name, visibility, boundary, and reviewed file set are safe to proceed.
