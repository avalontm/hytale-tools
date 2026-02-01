# 📂 Estructura del Proyecto Hytale Tools

## Árbol de Archivos

```
hytale-tools/
│
├── 📄 index.html              # HTML principal con configuración SEO
├── 📄 main.jsx                # Punto de entrada React (ReactDOM.render)
├── 📄 App.jsx                 # Componente raíz con routing manual
├── 📄 index.css               # Estilos globales + scrollbar personalizado
├── 📄 package.json            # Dependencias (React + Vite)
├── 📄 vite.config.js          # Configuración de build
├── 📄 .gitignore              # Archivos ignorados por git
├── 📄 README.md               # Documentación completa
│
├── 📁 pages/                  # Páginas de la aplicación
│   └── 📄 Home.jsx           # Página de inicio con hero + grid de tools
│
└── 📁 tools/                  # Herramientas individuales (módulos)
    └── 📄 NPCGenerator.jsx   # Generador de NPCs (primera herramienta)

```

## 🎯 Descripción de Archivos Clave

### **App.jsx** - Router y Layout Principal
- Maneja la navegación entre páginas
- Define el array `tools[]` donde se registran todas las herramientas
- Contiene el Header y Footer globales
- Sistema de routing simple sin dependencias externas

### **pages/Home.jsx** - Landing Page
- Hero section con gradiente animado
- Grid de tarjetas de herramientas agrupadas por categoría
- Sección de features (¿Por qué usar Hytale Tools?)
- Diseño glassmorphism con efectos hover

### **tools/NPCGenerator.jsx** - Primera Herramienta
- Componente reutilizable y autocontenido
- Lógica de generación de JSON para NPCs
- Detección automática de modelos y texturas
- Sistema de descarga de archivos

## 🚀 Flujo de Trabajo para Agregar Herramientas

### Paso 1: Crear el Componente
```jsx
// tools/NombreDeLaHerramienta.jsx
import React, { useState } from 'react';

export default function NombreDeLaHerramienta() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      padding: '40px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h2>Título de la Herramienta</h2>
      {/* Lógica aquí */}
    </div>
  );
}
```

### Paso 2: Registrar en App.jsx
```jsx
import NombreDeLaHerramienta from './tools/NombreDeLaHerramienta';

const tools = [
  // ... herramientas existentes
  {
    id: 'nombre-unico',           // URL-friendly ID
    name: 'Nombre Visible',        // Mostrado en la UI
    description: 'Qué hace esto',  // Descripción corta
    icon: '🔧',                    // Emoji representativo
    category: 'World',             // Character, World, Items, Utilities
    component: NombreDeLaHerramienta
  }
];
```

### Paso 3: ¡Listo!
La herramienta aparecerá automáticamente en:
- Grid de la página de inicio
- Sistema de navegación
- Puede ser accedida haciendo click en su tarjeta

## 📋 Categorías Disponibles

| Categoría    | Para qué se usa                    | Ejemplos              |
|--------------|------------------------------------|-----------------------|
| `Character`  | NPCs, jugadores, entidades         | NPC Generator         |
| `World`      | Bloques, biomas, estructuras       | Block Generator       |
| `Items`      | Items, armas, herramientas         | Item Creator          |
| `Utilities`  | Editores, conversores, validadores | JSON Formatter        |

## 🎨 Guía de Estilo Visual

### Colores Principales
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--dark-bg: linear-gradient(135deg, #0a1128 0%, #1a1f3a 50%, #2a1a3a 100%)
--glass-bg: rgba(255,255,255,0.05)
--border: rgba(255,255,255,0.1)
--text-primary: #ffffff
--text-secondary: rgba(255,255,255,0.7)
```

### Componentes Reutilizables

**Botón Primario:**
```jsx
<button style={{
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
}}>
  Texto del Botón
</button>
```

**Input Field:**
```jsx
<input style={{
  width: '100%',
  padding: '14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: 'white',
  outline: 'none'
}} />
```

**Card Container:**
```jsx
<div style={{
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '30px',
  backdropFilter: 'blur(10px)'
}}>
  Contenido
</div>
```

## 💡 Ideas de Herramientas Futuras

### Character Tools
- ✅ NPC Generator (Implementado)
- 🔜 Skin Converter
- 🔜 Animation Preview
- 🔜 Character Stats Editor

### World Tools
- 🔜 Block Generator
- 🔜 Biome Editor
- 🔜 Structure Builder
- 🔜 Terrain Preview

### Item Tools
- 🔜 Item Generator
- 🔜 Recipe Creator
- 🔜 Loot Table Editor
- 🔜 Enchantment Builder

### Utilities
- 🔜 JSON Validator
- 🔜 Texture Converter
- 🔜 Model Viewer
- 🔜 Documentation Search

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito                    |
|------------|---------|------------------------------|
| React      | 18.2    | Framework UI                 |
| Vite       | 5.0     | Build tool + dev server      |
| Vanilla CSS| -       | Estilos (sin frameworks)     |
| File API   | -       | Lectura de archivos locales  |

## 📦 Sin Dependencias Externas

El proyecto intencionalmente **NO usa**:
- ❌ React Router (routing manual simple)
- ❌ Styled Components (CSS inline)
- ❌ UI Libraries (diseño custom)
- ❌ State Management (useState local)

**¿Por qué?**
- ✅ Bundle más ligero
- ✅ Menos complejidad
- ✅ Más fácil de entender
- ✅ Máxima personalización

## 🚀 Comandos Disponibles

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build para producción
npm run preview      # Preview del build
```

## 🔐 Seguridad y Privacidad

- ✅ Todo se ejecuta en el navegador (client-side)
- ✅ No se envían datos a ningún servidor
- ✅ Los archivos nunca salen de tu máquina
- ✅ Sin tracking ni analytics
- ✅ Open source y auditable

---

**¿Preguntas?** Lee el README.md completo para más detalles.
