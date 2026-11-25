const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// DATOS EN MEMORIA (ESTRUCTURAS INICIALES)
// ==========================================
const CUPOS_POR_ALOJAMIENTO = {
  "Suite VIP": 2,
  "Espacio Felino": 4,
  "Estándar": 6,
  "Estandar": 6
};

const ESTADOS_VALIDOS = ["Pendiente", "Activo", "Completado", "Cancelado"];
const ROLES_VALIDOS = ["cliente", "empleado", "dueño", "dueno"];

let usuarios = [
  { id: 1, nombre: "Roberto", email: "dueno@huellasfelices.com", password: "1234", rol: "dueño" },
  { id: 2, nombre: "Laura", email: "empleado@huellasfelices.com", password: "1234", rol: "empleado" },
  { id: 3, nombre: "Nicolás", email: "nicolas@gmail.com", password: "1234", rol: "cliente" }
];

let turnos = [];
let nextTurnoId = 1;
let nextUsuarioId = 4;

// ==========================================
// REGLAS DE NEGOCIO Y VALIDACIONES
// ==========================================
function haySuperposicionFechas(inicioA, finA, inicioB, finB) {
  return inicioA < finB && inicioB < finA;
}

function obtenerCupoMaximo(alojamiento) {
  return CUPOS_POR_ALOJAMIENTO[alojamiento] ?? 6;
}

function contarTurnosOcupados(alojamiento, fechaIngresoStr, fechaEgresoStr) {
  const nuevoInicio = new Date(fechaIngresoStr);
  const nuevoFin = new Date(fechaEgresoStr);

  return turnos.filter((t) => {
    if (t.estado === "Cancelado" || t.estado === "Completado") return false;
    if (t.alojamiento !== alojamiento) return false;
    const existenteInicio = new Date(t.fechaIngreso);
    const existenteFin = new Date(t.fechaEgreso);
    return haySuperposicionFechas(nuevoInicio, nuevoFin, existenteInicio, existenteFin);
  }).length;
}

function calcularDias(fechaIngresoStr, fechaEgresoStr) {
  const f1 = new Date(fechaIngresoStr);
  const f2 = new Date(fechaEgresoStr);
  const diffTime = f2 - f1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ==========================================
// RUTAS DE SALUD Y CONFIGURACIÓN
// ==========================================
app.get("/", (req, res) => {
  res.json({
    proyecto: "Huellas Felices MVP API",
    estado: "online",
    cuposPorAlojamiento: CUPOS_POR_ALOJAMIENTO
  });
});

app.get("/api/cupos", (req, res) => {
  const { alojamiento, fechaIngreso, fechaEgreso } = req.query;
  const tipo = alojamiento || "Estándar";
  const cupoMax = obtenerCupoMaximo(tipo);

  let ocupados = 0;
  if (fechaIngreso && fechaEgreso) {
    ocupados = contarTurnosOcupados(tipo, fechaIngreso, fechaEgreso);
  } else {
    ocupados = turnos.filter(
      (t) => t.alojamiento === tipo && t.estado !== "Cancelado" && t.estado !== "Completado"
    ).length;
  }

  const disponibles = Math.max(0, cupoMax - ocupados);
  res.json({ alojamiento: tipo, cupoMax, ocupados, disponibles });
});

// ==========================================
// RUTAS DE TURNOS (CASO DE USO PRINCIPAL)
// ==========================================
app.get("/api/turnos", (req, res) => {
  const { usuarioNombre, estado } = req.query;
  let resultado = [...turnos];

  if (usuarioNombre) {
    resultado = resultado.filter(
      (t) => t.usuarioNombre.toLowerCase() === usuarioNombre.toLowerCase()
    );
  }
  if (estado) {
    resultado = resultado.filter((t) => t.estado.toLowerCase() === estado.toLowerCase());
  }

  res.json(resultado);
});

app.post("/api/turnos", (req, res) => {
  const { usuarioNombre, mascota, tamano, alojamiento, fechaIngreso, fechaEgreso } = req.body;

  if (!usuarioNombre || !mascota || !tamano || !alojamiento || !fechaIngreso || !fechaEgreso) {
    return res.status(400).json({ error: "Todos los campos de la reserva son obligatorios." });
  }

  const f1 = new Date(fechaIngreso);
  const f2 = new Date(fechaEgreso);

  if (Number.isNaN(f1.getTime()) || Number.isNaN(f2.getTime())) {
    return res.status(400).json({ error: "Las fechas ingresadas no son válidas." });
  }

  // Regla de negocio 1: egreso posterior a ingreso y cantidad mínima de 1 día
  const diasTotales = calcularDias(fechaIngreso, fechaEgreso);
  if (f2 <= f1 || diasTotales < 1) {
    return res.status(400).json({
      error: "La fecha de egreso debe ser posterior a la fecha de ingreso (mínimo 1 noche)."
    });
  }

  // Regla de negocio 2: control de cupo por tipo de alojamiento y rango de fechas
  const cupoMax = obtenerCupoMaximo(alojamiento);
  const ocupados = contarTurnosOcupados(alojamiento, fechaIngreso, fechaEgreso);
  if (ocupados >= cupoMax) {
    return res.status(409).json({
      error: `No hay cupos disponibles para "${alojamiento}" en las fechas seleccionadas (${ocupados}/${cupoMax} ocupados).`
    });
  }

  const codigoVoucher = "HF-" + Math.floor(100000 + Math.random() * 900000);

  const nuevoTurno = {
    id: nextTurnoId++,
    codigo: codigoVoucher,
    usuarioNombre: String(usuarioNombre).trim(),
    mascota: String(mascota).trim(),
    tamano: String(tamano).trim(),
    alojamiento: String(alojamiento).trim(),
    fechaIngreso,
    fechaEgreso,
    diasTotales,
    estado: "Pendiente"
  };

  turnos.push(nuevoTurno);
  res.status(201).json(nuevoTurno);
});

app.patch("/api/turnos/:id/estado", (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      error: `Estado inválido. Estados permitidos: ${ESTADOS_VALIDOS.join(", ")}.`
    });
  }

  const turno = turnos.find((t) => t.id === id);
  if (!turno) {
    return res.status(404).json({ error: "Turno no encontrado." });
  }

  turno.estado = estado;
  res.json(turno);
});

app.delete("/api/turnos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = turnos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Turno no encontrado." });
  }

  const [eliminado] = turnos.splice(index, 1);
  res.json({ mensaje: "Turno eliminado correctamente.", turno: eliminado });
});

// ==========================================
// RUTAS DE USUARIOS
// ==========================================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = usuarios.find(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Email o contraseña incorrectos." });
  }

  const { password: _, ...usuarioSeguro } = user;
  res.json(usuarioSeguro);
});

app.get("/api/usuarios", (req, res) => {
  const seguros = usuarios.map(({ password, ...resto }) => resto);
  res.json(seguros);
});

app.patch("/api/usuarios/:id/rol", (req, res) => {
  const id = Number(req.params.id);
  const { rol } = req.body;

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: "Rol no válido." });
  }

  const user = usuarios.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  user.rol = rol;
  const { password, ...usuarioSeguro } = user;
  res.json(usuarioSeguro);
});

app.delete("/api/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }
  const [eliminado] = usuarios.splice(index, 1);
  const { password, ...seguro } = eliminado;
  res.json({ mensaje: "Usuario eliminado.", usuario: seguro });
});

app.listen(PORT, () => {
  console.log(`Servidor Huellas Felices escuchando en http://localhost:${PORT}`);
});