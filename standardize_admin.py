import re
import os

file_path = "app/(main)/admin-panel/actions.ts"

if not os.path.exists(file_path):
    print(f"File {file_path} not found")
    exit(1)

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if 'import { ActionResult }' not in content:
    content = re.sub(r'import\s+\{\s*logError\s*\}\s+from\s+"@/lib/error-logger";', 
                    'import { logError } from "@/lib/error-logger";\nimport { ActionResult } from "@/lib/types";', 
                    content)

# 2. Replaces
# Avoid double success
content = content.replace('return { success: true, data:', 'return { __ALREADY_DONE_DATA__:')
content = content.replace('return { success: false, error:', 'return { __ALREADY_DONE_ERROR__:')

content = content.replace('return { data:', 'return { success: true, data:')
content = content.replace('return { error:', 'return { success: false, error:')

# Restore
content = content.replace('return { __ALREADY_DONE_DATA__:', 'return { success: true, data:')
content = content.replace('return { __ALREADY_DONE_ERROR__:', 'return { success: false, error:')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Updated {file_path}")
