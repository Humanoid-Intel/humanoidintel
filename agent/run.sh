#!/bin/bash
export PATH="/Users/dannysanders/.nvm/versions/node/v20.20.1/bin:$PATH"
NODE=/Users/dannysanders/.nvm/versions/node/v20.20.1/bin/node
NPX=/Users/dannysanders/.nvm/versions/node/v20.20.1/bin/npx
REPO=/Users/dannysanders/Documents/Cowork/humanoidintel
LOG=$REPO/agent/run.log

echo "[$(date)] Agent run starting..." >> "$LOG"

cd "$REPO" || exit 1

# Load env vars
if [ -f "$REPO/.env.local" ]; then
  export $(grep -v '^#' "$REPO/.env.local" | xargs)
fi

# ── Phase 1: Run news agent ───────────────────────────────────────────────────
PUBLISH_MODE=auto $NPX tsx agent/index.ts >> "$LOG" 2>&1

# ── Phase 2: Regenerate search index + ticker (always, even if no new articles)
echo "[$(date)] Regenerating search index..." >> "$LOG"
$NPX tsx scripts/generate-search-index.ts >> "$LOG" 2>&1

echo "[$(date)] Regenerating ticker..." >> "$LOG"
$NPX tsx scripts/generate-ticker.ts >> "$LOG" 2>&1

# ── Phase 3: Git commit & push anything new ───────────────────────────────────
# Check for new news articles
NEW_ARTICLES=$(git -C "$REPO" status --short content/news/ | grep "^??" | wc -l | tr -d ' ')
# Check if static assets changed (search-index, ticker-data)
STATIC_CHANGED=$(git -C "$REPO" diff --name-only public/search-index.json public/ticker-data.json 2>/dev/null | wc -l | tr -d ' ')

if [ "$NEW_ARTICLES" -gt "0" ] || [ "$STATIC_CHANGED" -gt "0" ]; then
  # Stage everything relevant
  [ "$NEW_ARTICLES" -gt "0" ] && git -C "$REPO" add content/news/*.md
  git -C "$REPO" add public/search-index.json public/ticker-data.json 2>/dev/null || true

  COMMIT_MSG="feat(content): auto-publish ${NEW_ARTICLES} article(s) + refresh data $(date '+%Y-%m-%d %H:%M') [bot]"
  [ "$NEW_ARTICLES" -eq "0" ] && COMMIT_MSG="chore(data): refresh search-index + ticker $(date '+%Y-%m-%d %H:%M') [bot]"

  git -C "$REPO" commit -m "$COMMIT_MSG"
  git -C "$REPO" push origin main
  echo "[$(date)] Pushed: $NEW_ARTICLES new articles, static assets updated" >> "$LOG"
else
  echo "[$(date)] No new articles or data changes; skipping push." >> "$LOG"
fi

echo "[$(date)] Run complete." >> "$LOG"
