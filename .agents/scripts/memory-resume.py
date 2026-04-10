import os
import glob
from datetime import datetime

def resume():
  """
  Finds the latest session log in vault/050-Сессии/ to help the agent restore context.
  """
  brain_dir = "vault/050-Сессии"
  
  if not os.path.exists(brain_dir):
    print("No previous sessions found. Start fresh.")
    return
    
  session_files = glob.glob(os.path.join(brain_dir, "*.md"))
  if not session_files:
    print("No previous sessions found. Start fresh.")
    return
    
  # Find the most recent session file
  latest_file = max(session_files, key=os.path.getctime)
  
  print(f"RESUMING CONTEXT FROM LATEST SESSION:\n---\n")
  with open(latest_file, "r", encoding="utf-8") as f:
    print(f.read())
  print("\n---")
  print(f"Read vault/000-Навигация/ОГЛАВЛЕНИЕ.md for standard rules.")

if __name__ == "__main__":
  resume()
