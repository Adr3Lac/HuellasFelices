# Sistema de gestion Huellas Felices #  

## Caso de estudio Sistema de Gestion "Huellas Felices"

# Portal del turnos para hotel y guarderia de caninos.

# Este proyecto corresponde al desarrollo de un prototipo web navegable realizado como parte del Hito 2 de la asignatura Practicas #Profesionalizantes I.

# Equipo desarrollador
## Equipo: Grupo 1

 Integrantes
 Adrian  Lacrampette
 Nicolas Mendez
 Sayra  Veron
 Jeremias  Andreotta
 Hernan Martinez Pintos
 Valentin Diaz

Descripción del sistema
El sistema de gestión Huellas Felices es una aplicacion para automatizar la gestion de reservas de estadias, el control de los
caniles (jaulas y suites) y la administración de las mascotas de los clientes.

El sistema permitirá iniciar sesion, gestionar la disponibilidad de caniles en tiempo real, realizar o cancelar una reserva de estadia (como canil estandar, suite VIP o espacio felino), consultar historial de reservas, visualizar un voucher digital de confimación, actualizar el estado de los caniles (ocupado, liberado, en desinfección), notificar demoras de limpieza, visualizar un tablero de control unificado, disponibilidad para evitar reservas superpuestas, mostrar alertas cuando esté bloqueado el alojamiento, consultar inventario de accesorios (correa y platos) y permitirá cerrar sesión.


# En esta primera version se desarrollo un prototipo navegable utilizando únicamente HTML5 y CSS, simulando las principales funcionalidades del sistema.

Tecnologías utilizadas
HTML5
CSS3
Git
GitHub
J.son
Organización del proyecto
gestion-turno/
│
├── index.html
├── README.md
│
├── css/
│   └── styles.css
│
├── img/
│
└── pages/
    ├── solicitar-turno.html
    ├── confirmacion.html
    ├── mis-turnos.html
    ├── historial-de-reservas.html
    └── estado-del-canino.html
Pantallas desarrolladas
# Inicio
Presenta el Portal de gestion de caniles y permite acceder a todas las funcionalidades mediante un menú de navegación.

## Solicitar Turno
El sistema le mostrará las fechas y cupos disponibles en tiempo real y le permitirá confirmar la estadía indicando el tamaño de su mascota.

## Confirmación
Una vez confirmado, el sistema le mostrará en pantalla un voucher digital con el detalle de los días reservados y los requisitos de ingreso.

## Mis Turnos
Muestra un listado de turnos registrados junto con su estado.

## Historial de reservas
Incluirá las estadías pasadas, reservas futuras y la posibilidad de cancelar un turno con anticipación si su viaje se suspende, para no perder la seña abonada.

## Estado del canino
El administrador podrá marcar el estado de un canil como "Ocupado", "Liberado" o "En desinfección", y enviar notificaciones visuales en el 
sistema si hay demoras en la limpieza porque un huésped anterior ensució más de lo esperado.


Esta versión representa únicamente una simulación de la interfaz del sistema y no implementa lógica de negocio ni conexión con bases de datos.

# Licencia
Proyecto desarrollado con fines exclusivamente educativos para la asignatura Prácticas Profesionalizantes I.