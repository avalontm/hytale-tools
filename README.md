# 🎮 Hytale Tools

Herramientas de desarrollo para Hytale - Plataforma web para generar y gestionar contenido del juego.

## 📁 Estructura del Proyecto

```
hytale-tools/
├── index.html              # HTML principal
├── main.jsx                # Punto de entrada de React
├── App.jsx                 # Componente principal con routing
├── index.css               # Estilos globales
├── package.json            # Dependencias del proyecto
├── vite.config.js          # Configuración de Vite
│
├── pages/                  # Páginas de la aplicación
│   └── Home.jsx           # Página de inicio con grid de tools
│
└── tools/                  # Herramientas individuales
    └── NPCGenerator.jsx   # Generador de NPCs

```

## 🚀 Características

### ✅ Implementado
- **NPC Generator**: Genera archivos JSON de apariencia y rol para NPCs
  - Carga carpetas completas con modelos y texturas
  - Detección automática del modelo principal
  - Asignación inteligente de gradientes
  - Descarga de archivos JSON generados

### 🔜 Próximamente (Fácilmente extensible)
- **Block Generator**: Crea bloques personalizados
- **Item Generator**: Genera items y herramientas
- **Biome Editor**: Editor visual de biomas
- **Recipe Creator**: Crea recetas de crafteo
- **Quest Builder**: Constructor de misiones

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js 16+ instalado
- npm o yarn

### Pasos

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en desarrollo:**
```bash
npm run dev
```

3. **Construir para producción:**
```bash
npm run build
```

## 🎨 Diseño

El sitio cuenta con:
- **Tema oscuro espacial** con gradientes púrpura/azul
- **Glassmorphism** en tarjetas y componentes
- **Animaciones fluidas** con transiciones suaves
- **Diseño responsive** que funciona en todos los dispositivos
- **Sin dependencias de backend** - Todo se ejecuta en el navegador

## 📝 Cómo Agregar Nuevas Herramientas

1. **Crear el componente de la herramienta:**

```jsx
// tools/MiNuevaHerramienta.jsx
import React, { useState } from 'react';

export default function MiNuevaHerramienta() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      padding: '40px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h2>Mi Nueva Herramienta</h2>
      {/* Tu código aquí */}
    </div>
  );
}
```

2. **Registrar en App.jsx:**

```jsx
import MiNuevaHerramienta from './tools/MiNuevaHerramienta';

const tools = [
  {
    id: 'mi-herramienta',
    name: 'Mi Herramienta',
    description: 'Descripción de lo que hace',
    icon: '🔧',
    category: 'Utilities',
    component: MiNuevaHerramienta
  },
  // ... otras herramientas
];
```

3. **¡Listo!** La nueva herramienta aparecerá automáticamente en la página de inicio.

## 🎯 Categorías de Herramientas

- **Character**: NPCs, jugadores, skins
- **World**: Bloques, biomas, estructuras
- **Items**: Items, armas, armaduras
- **Utilities**: Editores, conversores, validadores

## 🔧 Tecnologías Utilizadas

- **React 18** - Framework de UI
- **Vite** - Build tool ultra-rápido
- **Vanilla CSS** - Estilos personalizados sin frameworks
- **File System Access API** - Para leer carpetas del sistema

## 📄 Licencia

MIT - Libre para uso personal y comercial

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Creado por la comunidad de Hytale

---

**Nota:** Este proyecto no está afiliado oficialmente con Hypixel Studios.
