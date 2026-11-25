# Huellas Felices — Sistema de Gestión de Turnos para Hotel de Mascotas

MVP desarrollado para la materia **Proyecto Práctico Integrador (PPI)**. Permite a clientes solicitar reservas de estadía para sus mascotas generando un voucher digital, y al personal del hotel (empleados y dueño) administrar los turnos, estados, cupos por tipo de alojamiento y roles de usuario.

---

## Enlaces de la Aplicación Publicada

- **Frontend (Static Site):** `PENDIENTE_URL_FRONTEND_RENDER`
- **Backend / API REST (Web Service):** `PENDIENTE_URL_BACKEND_RENDER`

---

## Arquitectura y Estructura del Proyecto

El sistema sigue una arquitectura **cliente-servidor** desacoplada que se comunica mediante peticiones HTTP (`fetch`) con intercambio de datos en formato JSON.

```text
trabajo-ppi/
├── backend/              # API REST en Node.js + Express (almacenamiento en memoria)
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/             # Aplicación web estática (HTML, CSS y JavaScript)
│   ├── index.html
│   ├── estilos/
│   │   └── estilos.css
│   ├── imagen/
│   ├── js/
│   │   └── javascripts.js
│   └── pages/
│       ├── confirmacion.html
│       ├── historial.html
│       ├── login.html
│       ├── turnos.html
│       └── usuarios.html
├── documentacion/        # Relevamiento, diagramas y archivos de entregas previas
├── .gitignore
└── README.md