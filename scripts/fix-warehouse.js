const fs = require('fs');

function replace(file, findStr, replaceStr) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(findStr).join(replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
}

replace('app/(main)/dashboard/warehouse/edit-storage-location-dialog.tsx', 'color="dark"', 'color="primary" variant="solid"');
replace('app/(main)/dashboard/warehouse/edit-storage-location-dialog.tsx', 'variant={isSubmitting ? "btn-dark" : "btn-dark"}', 'color="primary" variant="solid"'); // Handle weird edge cases
replace('app/(main)/dashboard/warehouse/items/new/components/compact-dropzone.tsx', 'variant="solid" color="danger"', 'color="danger" variant="solid"');
replace('app/(main)/dashboard/warehouse/layout.tsx', 'variant="solid" color="primary"', 'color="primary" variant="solid"');
