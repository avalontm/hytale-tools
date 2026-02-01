# Hytale NPC Structure & Usage Guide (Detailed)

This guide provides a deep dive into the official Hytale NPC asset structure, based on analysis of the Hytale server assets.

## Asset Hierarchy

Hytale organizes NPC assets by category. The main path is typically `Assets/Common/NPC/`.

### 1. Categories
NPCs are grouped into logical folders:
- `Beast`, `Boss`, `Critter`, `Elemental`
- `Human`, `Intelligent` (Trork, Kweebec, etc.)
- `Livestock`, `Wildlife`, `Undead`, `Void`
- `Swimming_Wildlife`, `Flying_Wildlife`

### 2. NPC Folder Structure
Each individual NPC folder (e.g., `NPC/Intelligent/Trork/`) contains:
- `Animations/`: Contains `.json` (or `.seq`) files defining character movements.
- `Models/`: The core visual data.

### 3. The `Models` Directory (Technical Detail)
This is where the majority of the integration happens:
- `Model.blockymodel`: The master **Blockbench** file.
- `Model_Textures/`: A dedicated folder for all `.png` textures used by the main model.
- `Attachments/`: Specialized sub-folders for modular parts:
    - `Haircuts/`, `Beards/`, `Eyebrows/`, `Eyes/`
    - `Cosmetics/` (Custom clothing or accessories)
    - `Warrior/`, `Sentry/`, `Shaman/` (Class-specific armor/props)
- `Weapons/`: Specific models for held items or equipment.

## Naming Conventions & Rules

To ensure the **NPC Generator** correctly associates assets, follow these strict naming rules:

### 1. Matching Names (Critical)
When dealing with complex creatures that have multiple modular models and textures, the model file and its corresponding texture **must share the exact same name**.
- **Model**: `Orc_Warrior_Top.blockymodel`
- **Texture**: `Model_Textures/Orc_Warrior_Top.png`

The tool uses this naming pattern to automatically link the model geometry with the correct texture ID in the generated JSON.

### 2. General Best Practices
1.  **Main Model**: Use `Model.blockymodel` as the entry point for your NPC. The engine looks for this filename by default.
2.  **Modular Design**: Utilize the `Attachments` folder for variations. Instead of creating 10 different Orc models, create one base model and 10 attachments.
3.  **Texture Organization**: Always keep textures inside `Model_Textures/`. This is critical for path resolution within the `.blockymodel` file.
4.  **Pivot Points**: Ensure your "Root" or "Body" bones match Hytale's standard naming so existing animations can be re-used.

## Using the Generator
The **Hytale Tools NPC Generator** is designed to parse this exact structure. When you select your `Models` folder, it will identify the `Model.blockymodel` and generate the `Appearance` and `Role` files needed to bring your creature to life in-game.
