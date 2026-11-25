# Huellas Felices — Sistema de Gestión para Hotel de Mascotas

Aplicación web Full-Stack (MVP) desarrollada para la gestión integral de reservas, estadías, control de cupos diarios por categoría de alojamiento y administración de usuarios en un hotel de mascotas.

---

## 1. Acceso al Sistema Publicado (Producción en Render)

El sistema se encuentra desplegado en **Render** mediante una arquitectura cliente-servidor desacoplada:

* **Aplicación Web (Frontend - Static Site):** https://huellasfelices-1.onrender.com
* **API REST (Backend - Web Service):** https://huellasfelices-p2ke.onrender.com

> **Nota sobre el plan gratuito de Render:** Si el servicio backend permanece 15 minutos sin actividad entra en modo reposo. Al realizar la primera consulta (por ejemplo, al iniciar sesión), puede demorar entre 30 y 50 segundos en reactivarse.

### Credenciales de Prueba (Roles del Sistema)

| Rol | Correo Electrónico | Contraseña | Permisos y Alcance |
| :--- | :--- | :--- | :--- |
| **Cliente** | `nicolas@gmail.com` | `1234` | Solicitar turnos, consultar disponibilidad, emitir voucher de confirmación y ver su historial. |
| **Empleado** | `empleado@huellasfelices.com` | `1234` | Visualizar todos los turnos y actualizar estados de estadía (Confirmado, Check-in, Check-out, Cancelado). |
| **Dueño / Admin** | `dueno@huellasfelices.com` | `1234` | Acceso completo a reservas, gestión de estados, control del hotel y administración de usuarios. |

---

## 2. Estructura Detallada del Proyecto

```text
trabajo-ppi/
├── backend/                  
│   ├── index.js              
│   ├── package.json          
│   └── package-lock.json     
├── frontend/                 
│   ├── index.html            
│   ├── estilos/
│   │   └── estilos.css       
│   ├── imagen/               
│   ├── js/
│   │   └── javascripts.js    
│   └── pages/
│       ├── login.html        
│       ├── turnos.html       
│       ├── confirmacion.html 
│       ├── historial.html    
│       └── usuarios.html     
├── documentacion/            
├── .gitignore                
└── README.md                 