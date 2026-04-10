import os
from datetime import datetime
import sys

def preserve(action_summary):
  """
  Preserves current session context into vault/050-Сессии/YYYY-MM-DD.md
  """
  brain_dir = "vault/050-Сессии"
  
  if not os.path.exists(brain_dir):
    os.makedirs(brain_dir)
    
  date_str = datetime.now().strftime("%Y-%m-%d")
  time_str = datetime.now().strftime("%H:%M:%S")
  session_file = os.path.join(brain_dir, f"{date_str}.md")
  
  log_entry = f"\n## {time_str}\n\n- **Status**: Preserved\n- **Summary**: {action_summary}\n"
  
  with open(session_file, "a", encoding="utf-8") as f:
    f.write(log_entry)
    
  print(f"Context preserved in {session_file}")

if __name__ == "__main__":
  summary = sys.argv[1] if len(sys.argv) > 1 else "[No summary provided]"
  preserve(summary)
