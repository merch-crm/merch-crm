// Mock state
let formData = { attributes: {} };

const updateFormData = (updater) => {
    const updates = updater(formData);
    formData = { ...formData, ...updates };
};

const handleAttributeChange = (slug, _typeName, code, optionName) => {
    const attrLabel = "TestLabel";

    updateFormData((prev) => {
        const currentAttrs = prev.attributes || {};
        const updates = {
            attributes: {
                ...currentAttrs,
                [attrLabel]: optionName,
                [slug]: code
            }
        };
        return updates;
    });
};

const getCodeForSlug = (slug) => {
    return formData.attributes && formData.attributes[slug];
};

handleAttributeChange("test_uuid", "TestLabel", "TEST_CODE", "Test Name");
console.log(formData);
console.log(getCodeForSlug("test_uuid"));
