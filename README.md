# Inventario de Herramientas IT

Aplicación web responsive para registrar, mover y administrar herramientas/utensilios de IT. Incluye buscador global, filtros, historial (kardex), panel admin, alertas de stock bajo y exportación a PDF con miniaturas.

## ✅ Requisitos
- Navegador moderno.
- Conexión a internet para cargar librerías CDN y fuentes.

## 1) Crear proyecto Firebase
1. Ingresa a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto.
2. Crea una app web y copia la configuración (API Key, Project ID, etc.).

## 2) Pegar las keys
1. Abre `src/services/firebase.js`.
2. Reemplaza el contenido del objeto `firebaseConfig` con tus credenciales.

## 3) Habilitar Auth, Firestore y Storage
1. **Auth**: habilita Email/Password.
2. **Firestore**: crea una base en modo producción (o pruebas) y genera las colecciones sugeridas.
3. **Storage**: habilita para subir fotos de herramientas.

## 4) Correr en local
Opción rápida con Python:
```bash
python -m http.server 5173
```
Abre `http://localhost:5173`.

## 5) Despliegue (opcional)
Puedes desplegar en Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Modelo de datos (Firestore)
Colecciones sugeridas:
- `tools`:
  - name, category, brand, model, description, unit, qty_total, qty_available, min_qty,
    status, location_id, location_name_cache, photos[], code, createdAt, updatedAt
- `locations`:
  - name, description, active
- `movements`:
  - tool_id, type (USE/ADJUST/MOVE/IN), qty, from_location_id, to_location_id,
    note, createdAt, createdBy (uid, name, role)
- `users`:
  - uid, name, email, role, active

## Roles
- **superadmin**: todo
- **admin**: gestiona inventario y ubicaciones
- **operador**: rebajar y mover, no borrar
- **lector**: solo lectura

## Reglas de seguridad (ejemplo base)
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    match /tools/{id} {
      allow read: if isSignedIn();
      allow create, update, delete: if userRole() in ['superadmin', 'admin'];
    }
    match /locations/{id} {
      allow read: if isSignedIn();
      allow create, update, delete: if userRole() in ['superadmin', 'admin'];
    }
    match /movements/{id} {
      allow read: if isSignedIn();
      allow create: if userRole() in ['superadmin', 'admin', 'operador'];
    }
    match /users/{id} {
      allow read: if isSignedIn();
      allow write: if userRole() == 'superadmin';
    }
  }
}
```

## Exportación a PDF
Desde el inventario puedes exportar:
- Listado general
- Stock bajo
- Reporte por ubicación

Los PDF incluyen miniaturas, estado, cantidad, ubicación y código interno. Si una imagen no está disponible, se usa placeholder.

## Datos de ejemplo
La app incluye un modo demo usando `LocalStorage` mientras configuras Firebase. Puedes editar/crear herramientas desde el panel admin.
