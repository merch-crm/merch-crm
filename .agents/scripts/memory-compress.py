import os
import glob

def compress():
  """
  Looks at all session logs in vault/050-Сессии/ and suggests them for compression
  into architecture files.
  """
  brain_dir = "vault/050-Сессии"
  
  if not os.path.exists(brain_dir):
    print("No sessions found to compress.")
    return
    
  session_files = glob.glob(os.path.join(brain_dir, "*.md"))
  
  print(f"Found {len(session_files)} session files. In a real compression step, this script would trigger an LLM prompt to summarize these into vault/020-Архитектура/Бизнес-логика.md")

if __name__ == "__main__":
  compress()
