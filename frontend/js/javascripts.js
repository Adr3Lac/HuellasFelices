// ==========================================
// CONSTANTES Y CONFIGURACIÓN GLOBAL
// ==========================================
const API_URL = "http://localhost:3000"; // Cambiar por la URL pública del backend al desplegar

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

function mostrarMensajeFeedback(contenedorId, mensaje, esError = false) {
  let box = document.querySelector(`#${contenedorId}`);
  if (!box) {
    box = document.createElement("div");
    box.id = contenedorId;
    box.style.padding = "10px 14px";
    box.style.margin = "10px 0";
    box.style.borderRadius = "6px";
    box.style.fontWeight = "500";
    const main = document.querySelector("main") || document.body;
    main.prepend(box);
  }
  box.textContent = mensaje;
  box.style.display = "block";
  box.style.backgroundColor = esError ? "#f8d7da" : "#d1e7dd";
  box.style.color = esError ? "#842029" : "#0f5132";
  box.style.border = esError ? "1px solid #f5c2c7" : "1px solid #badbcc";
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
// LLAMADAS A LA API (BACKEND)
// ==========================================
async function obtenerTurnosAPI() {
  const res = await fetch(`${API_URL}/api/turnos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener turnos.");
  return data;
}

async function crearTurnoAPI(payload) {
  const res = await fetch(`${API_URL}/api/turnos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo crear la reserva.");
  return data;
}

async function actualizarEstadoTurnoAPI(idTurno, estado) {
  const res = await fetch(`${API_URL}/api/turnos/${idTurno}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo actualizar el estado.");
  return data;
}

async function eliminarTurnoAPI(idTurno) {
  const res = await fetch(`${API_URL}/api/turnos/${idTurno}`, {
    method: "DELETE"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo eliminar el turno.");
  return data;
}

async function consultarCuposAPI(alojamiento, fechaIngreso, fechaEgreso) {
  const params = new URLSearchParams({ alojamiento });
  if (fechaIngreso) params.append("fechaIngreso", fechaIngreso);
  if (fechaEgreso) params.append("fechaEgreso", fechaEgreso);

  const res = await fetch(`${API_URL}/api/cupos?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al consultar cupos.");
  return data;
}

async function loginAPI(email, password) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión.");
  return data;
}

async function obtenerUsuariosAPI() {
  const res = await fetch(`${API_URL}/api/usuarios`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar usuarios.");
  return data;
}

async function cambiarRolUsuarioAPI(idUsuario, rol) {
  const res = await fetch(`${API_URL}/api/usuarios/${idUsuario}/rol`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rol })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo cambiar el rol.");
  return data;
}

async function eliminarUsuarioAPI(idUsuario) {
  const res = await fetch(`${API_URL}/api/usuarios/${idUsuario}`, {
    method: "DELETE"
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo eliminar el usuario.");
  return data;
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

  const usuario = obtenerUsuarioActual();
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Cargando reservas...</td></tr>`;

  try {
    const turnos = await obtenerTurnosAPI();
    tbody.innerHTML = "";

    if (!turnos || turnos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay reservas registradas</td></tr>`;
      return;
    }

    const esGestionable = usuario && (usuario.rol === "dueño" || usuario.rol === "dueno" || usuario.rol === "empleado");

    turnos.forEach(t => {
      const tr = document.createElement("tr");

      let contenidoHTML = `
        <td>${t.fechaIngreso || t.fecha} a ${t.fechaEgreso || "N/A"}</td>
        <td>${t.usuarioNombre} (${t.mascota})</td>
        <td>${t.alojamiento || "Estándar"} - ${t.tamano || "N/I"}</td>
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
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#842029;">${error.message}</td></tr>`;
  }
}

async function cambiarEstadoTurno(idTurno, nuevoEstado) {
  try {
    await actualizarEstadoTurnoAPI(idTurno, nuevoEstado);
    mostrarMensajeFeedback("feedback-global", `Estado del turno actualizado a "${nuevoEstado}".`, false);
    await renderizarHistorial();
  } catch (error) {
    mostrarMensajeFeedback("feedback-global", error.message, true);
  }
}

async function eliminarTurno(idTurno) {
  if (!confirm("¿Deseas eliminar esta reserva definitivamente?")) return;
  try {
    await eliminarTurnoAPI(idTurno);
    mostrarMensajeFeedback("feedback-global", "Reserva eliminada correctamente.", false);
    await renderizarHistorial();
  } catch (error) {
    mostrarMensajeFeedback("feedback-global", error.message, true);
  }
}

async function renderizarUsuarios() {
  const tbody = document.querySelector("#tabla-usuarios");
  if (!tbody) return;

  const usuario = obtenerUsuarioActual();
  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Cargando usuarios...</td></tr>`;

  try {
    const usuarios = await obtenerUsuariosAPI();
    tbody.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay usuarios registrados</td></tr>`;
      return;
    }

    const esDueno = usuario && (usuario.rol === "dueño" || usuario.rol === "dueno");

    usuarios.forEach(u => {
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
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#842029;">${error.message}</td></tr>`;
  }
}

async function cambiarRolUsuario(idUsuario, nuevoRol) {
  try {
    await cambiarRolUsuarioAPI(idUsuario, nuevoRol);
    mostrarMensajeFeedback("feedback-global", `Rol actualizado a "${nuevoRol}".`, false);
    await renderizarUsuarios();
  } catch (error) {
    mostrarMensajeFeedback("feedback-global", error.message, true);
  }
}

async function eliminarUsuario(idUsuario) {
  if (!confirm("¿Deseas eliminar este usuario?")) return;
  try {
    await eliminarUsuarioAPI(idUsuario);
    mostrarMensajeFeedback("feedback-global", "Usuario eliminado.", false);
    await renderizarUsuarios();
  } catch (error) {
    mostrarMensajeFeedback("feedback-global", error.message, true);
  }
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

  const usuarioSesion = obtenerUsuarioActual();
  const inputNombre = document.querySelector("#input-nombre");
  if (usuarioSesion && inputNombre && !inputNombre.value) {
    inputNombre.value = usuarioSesion.nombre;
  }

  // Cupos reales desde el backend al cambiar alojamiento o fechas
  const selectAlojamiento = document.querySelector("#select-alojamiento");
  const inputIngreso = document.querySelector("#input-fecha-ingreso");
  const inputEgreso = document.querySelector("#input-fecha-egreso");
  const spanCupos = document.querySelector("#cupos-numero");

  async function actualizarIndicadorCupos() {
    if (!selectAlojamiento || !spanCupos) return;
    try {
      const info = await consultarCuposAPI(
        selectAlojamiento.value,
        inputIngreso ? inputIngreso.value : "",
        inputEgreso ? inputEgreso.value : ""
      );
      spanCupos.textContent = String(info.disponibles);
    } catch {
      spanCupos.textContent = "-";
    }
  }

  if (selectAlojamiento && spanCupos) {
    actualizarIndicadorCupos();
    selectAlojamiento.addEventListener("change", actualizarIndicadorCupos);
    inputIngreso?.addEventListener("change", actualizarIndicadorCupos);
    inputEgreso?.addEventListener("change", actualizarIndicadorCupos);
  }

  // Formulario Login
  const formLogin = document.querySelector("#form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value.trim();

      try {
        const usuario = await loginAPI(email, password);
        localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
        window.location.href = resolverUrlRelativa("index.html");
      } catch (error) {
        mostrarMensajeFeedback("feedback-global", error.message, true);
      }
    });
  }

  // Formulario Reserva de Turnos
  const formTurno = document.querySelector("#form-turno");
  if (formTurno) {
    formTurno.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        usuarioNombre: document.querySelector("#input-nombre").value.trim(),
        mascota: document.querySelector("#input-mascota").value.trim(),
        tamano: document.querySelector("#select-tamano").value,
        alojamiento: document.querySelector("#select-alojamiento").value,
        fechaIngreso: document.querySelector("#input-fecha-ingreso").value,
        fechaEgreso: document.querySelector("#input-fecha-egreso").value
      };

      try {
        const nuevoTurno = await crearTurnoAPI(payload);
        localStorage.setItem(VOUCHER_KEY, JSON.stringify(nuevoTurno));
        window.location.href = resolverUrlRelativa("pages/confirmacion.html");
      } catch (error) {
        mostrarMensajeFeedback("feedback-global", error.message, true);
      }
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