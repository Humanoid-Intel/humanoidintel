#!/bin/bash
# humanoidintel.ai — Hourly Agent Runner
# Runs the content agent, auto-publishes to content/news/, commits and pushes to GitHub

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

NODE=/Users/dannysanders/.nvm/versions/node/v20.20.1/bin/node
NPX=/Users/dannysanders/.nvm/versions/node/v20.20.1/bin/npx
REPO=/Users/dannysanders/Documents/Cowork/humanoidintel
LOG=$REPO/agent/run.log

echo "" >> "$LOG"
echo "=== Run started: $(date) ===" >> "$LOG"

cd "$REPO" || exit 1

# Run the agent
$NPX tsx agent/index.ts >> "$LOG" 2>&1

# Commit and push any new articles
NEW_FILES=$(git status --short content/news/ | grep "^??" | wc -l | tr -d ' ')

if [ "$NEW_FILES" -gt "0" ]; then
  # Regenerate search index before committing
  $NPX tsx scripts/generate-search-index.ts >> "$LOG" 2>&1

  git add content/news/*.md public/search-index.json >> "$LOG" 2>&1
  git commit -m "feat(content): auto-publish $NEW_FILES article(s) $(date '+%Y-%m-%d %H:%M') [bot]" >> "$LOG" 2>&1
  git push origin main >> "$LOG" 2>&1
  echo "Pushed $NEW_FILES new article(s)" >> "$LOG"
else
  echo "No new articles this run" >> "$LOG"
fi

echo "=== Run complete: $(date) ===" >> "$LOG"
