/**
 * Hytale Format Utility
 * Centralizes the generation of JSON structures to ensure consistency across tools.
 */

export const DEFAULT_NPC_ROLE_VALUES = {
    isStatic: true,
    motionWander: false,
    greetRange: 5,
    greetAnimation: 'Wave',
    maxHealth: 100,
    maxSpeed: 0.1
};

/**
 * Strips the 'hytale:' prefix from an item ID if present.
 * @param {string} id The item ID to clean.
 * @returns {string} The cleaned item ID.
 */
export const stripHytalePrefix = (id) => {
    if (!id) return id;
    return id.replace(/^hytale:/, '');
};

/**
 * Sanitizes an item ID by replacing spaces with underscores and removing invalid characters.
 * Useful for Hytale internal names (lowercase, no spaces).
 * @param {string} id The item ID to sanitize.
 * @returns {string} The sanitized item ID.
 */
export const sanitizeItemId = (id) => {
    if (!id) return id;
    return id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_:]/g, '');
};

/**
 * Creates a standardized NPC Role JSON object.
 * @param {Object} config Configuration object for the NPC role.
 * @returns {Object} The formatted NPC Role JSON.
 */
export const createNpcRole = (config) => {
    const {
        id,
        displayName,
        appearance,
        isStatic = DEFAULT_NPC_ROLE_VALUES.isStatic,
        motionWander = DEFAULT_NPC_ROLE_VALUES.motionWander,
        greetRange = DEFAULT_NPC_ROLE_VALUES.greetRange,
        greetAnimation = DEFAULT_NPC_ROLE_VALUES.greetAnimation,
        maxHealth = DEFAULT_NPC_ROLE_VALUES.maxHealth,
        maxSpeed = isStatic ? 0.1 : (DEFAULT_NPC_ROLE_VALUES.maxSpeed || 6),
        behaviorType = 'Interactive'
    } = config;

    // Determine template based on behavior or static setting
    const template = (isStatic || behaviorType === 'Interactive') ? 'Template_Temple' : 'Template_Intelligent';

    return {
        Type: "Variant",
        Reference: template,
        Modify: {
            Appearance: appearance || id,
            NameTranslationKey: displayName || id,
            MotionStatic: isStatic,
            MotionWander: motionWander,
            GreetRange: greetRange,
            GreetAnimation: greetAnimation
        }
    };
};
