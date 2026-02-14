import re
import os

files = [
    "app/(main)/dashboard/warehouse/actions.ts",
    "app/(main)/dashboard/warehouse/items/new/actions.ts"
]

for file_path in files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace { error: ... } with { success: false, error: ... }
    # Only if it doesn't already have success: false
    # We use a negative lookbehind or check if success is present?
    # Simple strategy: replace all "return { error:" that are NOT preceded by "success: false, "
    
    # Regex for "return { error:" allowing spaces
    # We want to match `return { error:` but NOT `return { success: false, error:`
    
    # Let's use a temporary placeholder strategy which is robust
    content = content.replace('return { success: false, error:', 'return { __ALREADY_DONE_ERROR__:')
    content = content.replace('return { error:', 'return { success: false, error:')
    content = content.replace('return { __ALREADY_DONE_ERROR__:', 'return { success: false, error:')

    # Same for data
    content = content.replace('return { success: true, data:', 'return { __ALREADY_DONE_DATA__:')
    content = content.replace('return { data:', 'return { success: true, data:')
    content = content.replace('return { __ALREADY_DONE_DATA__:', 'return { success: true, data:')

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Updated {file_path}")
