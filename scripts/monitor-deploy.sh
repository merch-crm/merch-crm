#!/bin/bash

SHA=$1
REPO="merch-crm/merch-crm"

# If no SHA provided, use HEAD
if [ -z "$SHA" ]; then
  SHA=$(git rev-parse HEAD 2>/dev/null)
  if [ -z "$SHA" ]; then
    echo "Usage: $0 [commit-sha]"
    echo "Or run from a git repository to auto-detect HEAD."
    exit 1
  fi
  echo "No SHA provided, using HEAD: $SHA"
fi

# Expand short SHA to full SHA if needed (git may accept short, but GitHub API needs full)
if [ ${#SHA} -lt 40 ]; then
  FULL_SHA=$(git rev-parse "$SHA" 2>/dev/null)
  if [ -n "$FULL_SHA" ]; then
    SHA="$FULL_SHA"
  fi
fi

echo "Monitoring GitHub Actions for SHA: $SHA..."

# Extract token from Antigravity MCP config
MCP_CONFIG_PATH="$HOME/.gemini/antigravity/mcp_config.json"

if [ ! -f "$MCP_CONFIG_PATH" ]; then
  echo "Error: MCP config not found at $MCP_CONFIG_PATH"
  exit 1
fi

GH_TOKEN=$(node -e "
  const fs = require('fs');
  try {
    const config = JSON.parse(fs.readFileSync('$MCP_CONFIG_PATH', 'utf-8'));
    const token = config.mcpServers['github-mcp-server'].env.GITHUB_PERSONAL_ACCESS_TOKEN;
    if (token) console.log(token);
  } catch (e) {
    // silent fail
  }
")

if [ -z "$GH_TOKEN" ]; then
  echo "Error: Could not extract GITHUB_PERSONAL_ACCESS_TOKEN from MCP config."
  exit 1
fi

echo "Looking for workflow runs for commit $SHA in $REPO..."

while true; do
  # Fetch workflow runs
  RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/$REPO/actions/runs?head_sha=$SHA")
  
  # Check if response has what we need
  RUN_INFO=$(echo "$RESPONSE" | node -e "
    let d='';
    process.stdin.on('data', c => d+=c).on('end', () => {
      try {
        const data = JSON.parse(d);
        if (data.workflow_runs && data.workflow_runs.length > 0) {
          const run = data.workflow_runs[0];
          console.log(JSON.stringify({ id: run.id, status: run.status, conclusion: run.conclusion }));
        } else {
          console.log('');
        }
      } catch (e) {
        console.log('');
      }
    });
  ")
  
  if [ -z "$RUN_INFO" ]; then
    echo "Wait, run not found yet or compiling... retrying in 5 seconds."
    sleep 5
    continue
  fi
  
  RUN_ID=$(echo "$RUN_INFO" | node -e "let d=''; process.stdin.on('data', c => d+=c).on('end', () => console.log(JSON.parse(d).id))")
  RUN_STATUS=$(echo "$RUN_INFO" | node -e "let d=''; process.stdin.on('data', c => d+=c).on('end', () => console.log(JSON.parse(d).status))")
  RUN_CONCLUSION=$(echo "$RUN_INFO" | node -e "let d=''; process.stdin.on('data', c => d+=c).on('end', () => console.log(JSON.parse(d).conclusion))")

  echo "Run ID: $RUN_ID | Status: $RUN_STATUS"

  if [ "$RUN_STATUS" == "completed" ]; then
    if [ "$RUN_CONCLUSION" == "success" ]; then
      echo "✅ Workflow $RUN_ID completed successfully!"
    else
      echo "❌ Workflow $RUN_ID failed (Conclusion: $RUN_CONCLUSION)."
      echo "Please inspect logs manually on GitHub Actions for Run $RUN_ID."
    fi

    echo "Fetching jobs data for warnings/errors..."
    export GH_TOKEN
    export REPO
    export RUN_ID
    export RUN_CONCLUSION
    node -e "
      async function run() {
        const token = process.env.GH_TOKEN;
        const repo = process.env.REPO;
        const runId = process.env.RUN_ID;
        const runConclusion = process.env.RUN_CONCLUSION;
        try {
          const res = await fetch(\`https://api.github.com/repos/\${repo}/actions/runs/\${runId}/jobs\`, {
            headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json' }
          });
          const data = await res.json();
          if (!data.jobs) return;
          
          for (const j of data.jobs) {
            const annRes = await fetch(\`https://api.github.com/repos/\${repo}/check_runs/\${j.id}/annotations\`, {
              headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json' }
            });
            const annotations = await annRes.json();
            
            if (Array.isArray(annotations) && annotations.length > 0) {
              const importantAnns = annotations.filter(a => a.annotation_level === 'failure' || a.annotation_level === 'warning' || a.annotation_level === 'notice');
              if (importantAnns.length > 0) {
                 console.log(\`\n--- 📋 Annotations for \${j.name} ---\`);
                 importantAnns.forEach(a => {
                   console.log(\`[\${a.annotation_level.toUpperCase()}] \${a.path}:\${a.start_line} - \${a.message}\`);
                 });
              }
            }
            
            if (j.conclusion === 'failure') {
               console.log('\n❌ Failed job:', j.name);
               console.log('🔗 URL:', j.html_url);
               
               if (!Array.isArray(annotations) || annotations.filter(a => a.annotation_level === 'failure').length === 0) {
                 const logRes = await fetch(\`https://api.github.com/repos/\${repo}/actions/jobs/\${j.id}/logs\`, {
                   headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json' }
                 });
                 if (logRes.ok) {
                   const logText = await logRes.text();
                   const lines = logText.split('\n');
                   console.log('\n--- 📝 Last 50 lines of logs ---');
                   console.log(lines.slice(-50).join('\n'));
                 }
               }
            }
          }
        } catch(e) { console.error('Error fetching logs/annotations:', e.message); }
      }
      run();
    "
    if [ "$RUN_CONCLUSION" == "success" ]; then
      exit 0
    else
      exit 1
    fi
  else
    echo "Workflow is $RUN_STATUS... waiting 60s"
    sleep 60
  fi
done
