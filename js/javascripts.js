// ==========================================
// CONSTANTES Y CONFIGURACIÓN GLOBAL
// ==========================================
const STORAGE_KEY = "huellasFelicesData";
const SESSION_KEY = "huellasFelicesUsuario";
const VOUCHER_KEY = "huellasFelicesUltimoVoucher";

const JERARQUIA_ROLES = {
  dueño: ["dueño", "dueno", "empleado", "cliente"],
  dueno: ["dueño", "dueno", "empleado", "cliente"],
  empleado: ["empleado", "cliente"],
  cliente: ["cliente"]
};

function resolverUrlRelativa(path) {
  const dentroDePages = window.location.pathname.includes("/pages/");
  return dentroDePages ? `../${path}` : path;
}

// ==========================================
// GESTIÓN DE SESIÓN
// ==========================================
function obtenerUsuarioActual() {
  const user = localStorage.getItem(SESSION_KEY);
  return user ? JSON.parse(user) : null;
}

function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = resolverUrlRelativa("index.html");
}

function protegerPaginas() {
  const usuario = obtenerUsuarioActual();
  const path = window.location.pathname;

  const paginasProtegidas = ["usuarios.html", "turnos.html", "historial.html", "confirmacion.html"];
  const esPaginaProtegida = paginasProtegidas.some(pag => path.includes(pag));
  const esPaginaLogin = path.includes("login.html");

  if (!usuario && esPaginaProtegida) {
    alert("Debes iniciar sesión para acceder a esta sección.");
    window.location.href = resolverUrlRelativa("pages/login.html");
  } else if (usuario && esPaginaLogin) {
    window.location.href = resolverUrlRelativa("index.html");
  }
}

// ==========================================
// CARGA Y PERSISTENCIA DE DATOS
// ==========================================
async function obtenerDatosGlobales() {
  const ruta = resolverUrlRelativa("data/datos.json");
  try {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`Status: ${respuesta.status}`);

    const datosIniciales = await respuesta.json();
    const datosGuardados = localStorage.getItem(STORAGE_KEY);

    if (!datosGuardados) {
      guardarDatosGlobales(datosIniciales);
      return datosIniciales;
    }
    return { ...datosIniciales, ...JSON.parse(datosGuardados) };
  } catch (error) {
    console.error("Error al cargar datos.json:", error);
    return { usuarios: [], mascotas: [], turnos: [] };
  }
}

function guardarDatosGlobales(datos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

// ==========================================
// INTERFAZ DE USUARIO Y NAVEGACIÓN
// ==========================================
function adaptarInterfazSegunRol() {
  const usuario = obtenerUsuarioActual();

  document.querySelectorAll(".cliente, .empleado, .dueño, .dueno, .visitante").forEach(el => {
    el.style.display = "none";
  });

  if (usuario && usuario.rol) {
    const rolUsuario = usuario.rol.toLowerCase();
    const rolesVisibles = JERARQUIA_ROLES[rolUsuario] || [rolUsuario];

    rolesVisibles.forEach(rol => {
      document.querySelectorAll(`.${rol}`).forEach(el => {
        el.style.display = "inline-block";
      });
    });

    const userLabel = document.querySelector("#nombre-usuario-nav");
    if (userLabel) {
      userLabel.textContent = `Hola, ${usuario.nombre} (${usuario.rol.toUpperCase()})`;
    }
  } else {
    document.querySelectorAll(".visitante").forEach(el => {
      el.style.display = "inline-block";
    });
  }
}

// ==========================================
// VOUCHER Y CONFIRMACIÓN DE RESERVAS
// ==========================================
function cargarVoucherDigital() {
  const voucherData = localStorage.getItem(VOUCHER_KEY);
  if (!voucherData) return;

  const v = JSON.parse(voucherData);

  if (document.querySelector("#v-codigo")) {
    document.querySelector("#v-codigo").textContent = v.codigo;
    document.querySelector("#v-nombre").textContent = v.usuarioNombre;
    document.querySelector("#v-mascota").textContent = v.mascota;
    document.querySelector("#v-tamano").textContent = v.tamano;
    document.querySelector("#v-alojamiento").textContent = v.alojamiento;
    document.querySelector("#v-ingreso").textContent = v.fechaIngreso;
    document.querySelector("#v-egreso").textContent = v.fechaEgreso;
    document.querySelector("#v-dias").textContent = v.diasTotales;
    document.querySelector("#v-estado").textContent = v.estado;
  }
}

// ==========================================
// RENDERIZADO DE TABLAS
// ==========================================
async function renderizarHistorial() {
  const tbody = document.querySelector("#tabla-historial");
  if (!tbody) return;

  const datos = await obtenerDatosGlobales();
  const usuario = obtenerUsuarioActual();
  tbody.innerHTML = "";

  if (!datos.turnos || datos.turnos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay reservas registradas</td></tr>`;
    return;
  }

  const esGestionable = usuario && (usuario.rol === "dueño" || usuario.rol === "dueno" || usuario.rol === "empleado");

  datos.turnos.forEach(t => {
    const tr = document.createElement("tr");

    let contenidoHTML = `
      <td>${t.fechaIngreso || t.fecha} a ${t.fechaEgreso || 'N/A'}</td>
      <td>${t.usuarioNombre} (${t.mascota})</td>
      <td>${t.alojamiento || 'Estándar'} - ${t.tamano || 'N/I'}</td>
      <td><strong>${t.estado}</strong></td>
    `;

    if (esGestionable) {
      contenidoHTML += `
        <td>
          <select onchange="cambiarEstadoTurno(${t.id}, this.value)">
            <option value="Pendiente" ${t.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
            <option value="Activo" ${t.estado === "Activo" ? "selected" : ""}>Activo</option>
            <option value="Completado" ${t.estado === "Completado" ? "selected" : ""}>Completado</option>
            <option value="Cancelado" ${t.estado === "Cancelado" ? "selected" : ""}>Cancelado</option>
          </select>
          <button onclick="eliminarTurno(${t.id})" style="background-color: #dc3545; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Eliminar</button>
        </td>
      `;
    }

    tr.innerHTML = contenidoHTML;
    tbody.appendChild(tr);
  });
}

async function cambiarEstadoTurno(idTurno, nuevoEstado) {
  const datos = await obtenerDatosGlobales();
  const turno = datos.turnos.find(t => t.id === idTurno);
  if (turno) {
    turno.estado = nuevoEstado;
    guardarDatosGlobales(datos);
    await renderizarHistorial();
  }
}

async function eliminarTurno(idTurno) {
  if (!confirm("¿Deseas eliminar esta reserva definitivamente?")) return;
  const datos = await obtenerDatosGlobales();
  datos.turnos = datos.turnos.filter(t => t.id !== idTurno);
  guardarDatosGlobales(datos);
  await renderizarHistorial();
}

async function renderizarUsuarios() {
  const tbody = document.querySelector("#tabla-usuarios");
  if (!tbody) return;

  const datos = await obtenerDatosGlobales();
  const usuario = obtenerUsuarioActual();
  tbody.innerHTML = "";

  if (!datos.usuarios || datos.usuarios.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay usuarios registrados</td></tr>`;
    return;
  }

  const esDueno = usuario && (usuario.rol === "dueño" || usuario.rol === "dueno");

  datos.usuarios.forEach(u => {
    const tr = document.createElement("tr");

    let contenidoHTML = `
      <td>${u.nombre} (${u.email})</td>
      <td><strong>${u.rol}</strong></td>
    `;

    if (esDueno) {
      contenidoHTML += `
        <td>
          <select onchange="cambiarRolUsuario(${u.id}, this.value)">
            <option value="cliente" ${u.rol === "cliente" ? "selected" : ""}>Cliente</option>
            <option value="empleado" ${u.rol === "empleado" ? "selected" : ""}>Empleado</option>
            <option value="dueño" ${u.rol === "dueño" ? "selected" : ""}>Dueño</option>
          </select>
          <button onclick="eliminarUsuario(${u.id})" style="background-color: #dc3545; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Eliminar</button>
        </td>
      `;
    }

    tr.innerHTML = contenidoHTML;
    tbody.appendChild(tr);
  });
}

async function cambiarRolUsuario(idUsuario, nuevoRol) {
  const datos = await obtenerDatosGlobales();
  const user = datos.usuarios.find(u => u.id === idUsuario);
  if (user) {
    user.rol = nuevoRol;
    guardarDatosGlobales(datos);
    await renderizarUsuarios();
  }
}

async function eliminarUsuario(idUsuario) {
  if (!confirm("¿Deseas eliminar este usuario?")) return;
  const datos = await obtenerDatosGlobales();
  datos.usuarios = datos.usuarios.filter(u => u.id !== idUsuario);
  guardarDatosGlobales(datos);
  await renderizarUsuarios();
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  protegerPaginas();
  adaptarInterfazSegunRol();
  await renderizarHistorial();
  await renderizarUsuarios();
  cargarVoucherDigital();

  // Auto-completar nombre de usuario en formulario de turnos
  const usuarioSesion = obtenerUsuarioActual();
  const inputNombre = document.querySelector("#input-nombre");
  if (usuarioSesion && inputNombre && !inputNombre.value) {
    inputNombre.value = usuarioSesion.nombre;
  }

  // Simulación de cupos disponibles al seleccionar alojamiento
  const selectAlojamiento = document.querySelector("#select-alojamiento");
  const spanCupos = document.querySelector("#cupos-numero");
  if (selectAlojamiento && spanCupos) {
    selectAlojamiento.addEventListener("change", (e) => {
      const tipo = e.target.value;
      if (tipo === "Suite VIP") spanCupos.textContent = "2";
      else if (tipo === "Espacio Felino") spanCupos.textContent = "4";
      else spanCupos.textContent = "6";
    });
  }

  // Formulario Login
  const formLogin = document.querySelector("#form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value.trim();

      const datos = await obtenerDatosGlobales();
      const usuario = datos.usuarios.find(u => u.email === email && u.password === password);

      if (usuario) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
        window.location.href = resolverUrlRelativa("index.html");
      } else {
        alert("Email o contraseña incorrectos.");
      }
    });
  }

  // Formulario Reserva de Turnos
  const formTurno = document.querySelector("#form-turno");
  if (formTurno) {
    formTurno.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.querySelector("#input-nombre").value;
      const mascota = document.querySelector("#input-mascota").value;
      const tamano = document.querySelector("#select-tamano").value;
      const alojamiento = document.querySelector("#select-alojamiento").value;
      const fechaIngreso = document.querySelector("#input-fecha-ingreso").value;
      const fechaEgreso = document.querySelector("#input-fecha-egreso").value;

      // Validación de fechas
      const f1 = new Date(fechaIngreso);
      const f2 = new Date(fechaEgreso);
      if (f2 <= f1) {
        alert("La fecha de egreso debe ser posterior a la fecha de ingreso.");
        return;
      }

      const diffTime = Math.abs(f2 - f1);
      const diasTotales = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const datos = await obtenerDatosGlobales();
      const codigoVoucher = "HF-" + Math.floor(100000 + Math.random() * 900000);

      const nuevoTurno = {
        id: Date.now(),
        codigo: codigoVoucher,
        usuarioNombre: nombre,
        mascota: mascota,
        tamano: tamano,
        alojamiento: alojamiento,
        fechaIngreso: fechaIngreso,
        fechaEgreso: fechaEgreso,
        diasTotales: diasTotales,
        estado: "Pendiente"
      };

      datos.turnos.push(nuevoTurno);
      guardarDatosGlobales(datos);

      // Guardar voucher activo para mostrar en la siguiente página
      localStorage.setItem(VOUCHER_KEY, JSON.stringify(nuevoTurno));

      window.location.href = resolverUrlRelativa("pages/confirmacion.html");
    });
  }

  // Logout
  const btnLogout = document.querySelector("#btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});