/**
 * Utility to apply Russian typography rules.
 * Specifically replaces spaces after short prepositions, conjunctions, and particles
 * with non-breaking spaces (\u00A0) to prevent hanging words at the end of lines.
 */
export function applyTypography(text: string): string {
    if (!text || typeof text !== "string") return text;

    // 1. Prepositions and conjunctions (fixed to the NEXT word)
    // Common Russian prepositions/conjunctions of 1-3 letters.
    // Includes: в, во, с, со, из, от, к, ко, у, о, об, на, по, за, до, при, и, а, но, да, ли, или, же, бы.
    const prepositions = [
        "в", "во", "с", "со", "из", "от", "к", "ко", "у", "о", "об", "на", "по", "за", "до", "при",
        "и", "а", "но", "да", "ли", "или", "же", "бы", "как", "так", "что"
    ];

    let result = text;

    // Regex explanation:
    // (^|\s)      - Start of string or whitespace
    // (pre)       - The short word
    // (\s+)       - One or more spaces
    // (?=[^\s])   - Followed by a non-space character (lookahead)
    prepositions.forEach(prep => {
        const regex = new RegExp(`(^|\\s)(${prep})(\\s+)(?=[^\\s])`, "gi");
        result = result.replace(regex, "$1$2\u00A0");
    });

    // 2. Specific particles that should be tied to the PREVIOUS word
    // e.g., "сделал бы", "скажи-ка", "же" (if after words)
    const trailingParticles = ["бы", "же", "ли"];
    trailingParticles.forEach(part => {
        const regex = new RegExp(`([^\\s])(\\s+)(${part})(\\s|[,.!?;:]|$)`, "gi");
        result = result.replace(regex, "$1\u00A0$3$4");
    });

    // 3. Numbers with units
    // e.g., "10 кг", "50 %"
    result = result.replace(/(\d+)(\s+)(кг|шт|ед|см|мм|м|км|%|руб|₽|USD|EUR)/g, "$1\u00A0$3");

    return result;
}
