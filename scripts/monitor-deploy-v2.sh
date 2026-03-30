#!/bin/bash

SHA=$1
REPO="merch-crm/merch-crm"

if [ -z "$SHA" ]; then
  echo "Usage: $0 <commit-sha>"
  exit 1
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
      exit 0
    else
      echo "❌ Workflow $RUN_ID failed (Conclusion: $RUN_CONCLUSION)."
      echo "Please inspect logs manually on GitHub Actions for Run $RUN_ID."
      
      # Try fetching job logs and annotations
      echo "Fetching failed jobs..."
      export GH_TOKEN
      export REPO
      export RUN_ID
      node -e "
        async function run() {
          const token = process.env.GH_TOKEN;
          const repo = process.env.REPO;
          const runId = process.env.RUN_ID;
          try {
            const res = await fetch(\`https://api.github.com/repos/\${repo}/actions/runs/\${runId}/jobs\`, {
              headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json' }
            });
            const data = await res.json();
            const failed = data.jobs.filter(j => j.conclusion === 'failure');
            
            for (const j of failed) {
              console.log('\n❌ Failed job:', j.name);
              console.log('🔗 URL:', j.html_url);
              
              const annRes = await fetch(\`https://api.github.com/repos/\${repo}/check_runs/\${j.id}/annotations\`, {
                headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json' }
              });
              const annotations = await annRes.json();
              if (Array.isArray(annotations) && annotations.length > 0) {
                console.log('\n--- 📋 Annotations ---');
                annotations.forEach(a => {
                  if (a.annotation_level === 'failure' || a.annotation_level === 'warning') {
                     console.log(\`[\${a.annotation_level.toUpperCase()}] \${a.path}:\${a.start_line} - \${a.message}\`);
                  }
                });
              } else {
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
          } catch(e) { console.error('Error fetching logs:', e.message); }
        }
        run();
      "
      exit 1
    fi
  else
    echo "Workflow is $RUN_STATUS... waiting 60s"
    sleep 60
  fi
done
