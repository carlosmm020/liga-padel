# Liga Pádel

Aplicación web para la gestión de ligas de pádel: administra jugadores, parejas, divisiones, partidos, resultados y clasificaciones de forma sencilla y visual.

---

## Características principales

- **Gestión de jugadores**: Alta, edición y baja de jugadores.
- **Gestión de parejas**: Creación y edición de parejas, asignación de jugadores y división.
- **Divisiones**: Organización de parejas en divisiones.
- **Calendario de partidos**: Generación automática de partidos y asignación de fechas.
- **Resultados**: Registro y edición de resultados, cálculo automático de clasificación.
- **Clasificación**: Tabla de posiciones con criterios de desempate.
- **Panel de administración**: Acceso protegido para admins.
- **Frontend**: Interfaz moderna y responsive (React + FullCalendar).
- **Backend**: API REST (Express + MongoDB).

---

## Estructura del proyecto

liga-padel/
    ├── backend/ # 
        Backend Node.js/Express/MongoDB 
        │ 
        ├── controllers/ 
        │ 
        ├── models/ 
        │ 
        ├── routes/ 
        │ 
        ├── utils/ 
        │ 
        ├── .env 
        │ 
        └── server.js 
    ├── src/ # Frontend React 
    │ 
    ├── components/ 
    │ 
    ├── context/ 
    │ 
    ├── features/ 
    │ 
    ├── pages/ 
    │ 
    ├── services/ 
    │ 
    ├── styles/ 
    │ 
    └── utils/ 
├── public/ 
├── package.json 
├── vite.config.js 
└── README.md


---

## Instalación y uso

### 1. Clona el repositorio

git clone https://github.com/tuusuario/liga-padel.git
cd liga-padel

### 2. Instalar dependencias

Backend:
cd backend
npm install

Frontend:
cd ..
npm install

### 3. Configurar variables de entorno

Copia el archivo .env en backend/ y ajusta la conexión a MongoDB y la contraseña de admin si lo deseas:

MONGODB_URI=mongodb://localhost:27017/ligapadel
PORT=5000
ADMIN_PASSWORD=admin
JWT_SECRET=unsecretoolvidable

### 4. Iniciar el backend

cd backend
node [server.js](http://_vscodecontentref_/4)

### 5. Iniciar el frontend

En otra terminal:

npm run dev

La app estará disponible en http://localhost:5173.

Acceso administrador

Para acceder a las funciones de administración (CRUD de jugadores, parejas, divisiones), inicia sesión con la contraseña definida en ADMIN_PASSWORD en el backend.

Tecnologías usadas
Frontend: React, Vite, FullCalendar, React Toastify
Backend: Node.js, Express, MongoDB, Mongoose, JWT
Estilos: CSS modularizado
Scripts útiles
npm run dev - Inicia el frontend en modo desarrollo
npm run build - Compila el frontend para producción
node backend/server.js - Inicia el backend
Licencia
MIT

Desarrollado por Carlos Martin Marin