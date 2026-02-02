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
 * Creates a standardized NPC Role JSON object.
 * @param {Object} config Configuration object for the NPC role.
 * @returns {Object} The formatted NPC Role JSON.
 */
export const createNpcRole = (config) => {
    const {
        id,
        displayName,
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
            Appearance: id,
            NameTranslationKey: displayName || id,
            MotionStatic: isStatic,
            MotionWander: motionWander,
            GreetRange: greetRange,
            GreetAnimation: greetAnimation
        }
    };
};
