(function () {
  const ANIO = 2026;
  const MES = 11; // diciembre (0 = enero)
  const DIAS = 24;
  // Orden revuelto de las puertas, como en un calendario de adviento de verdad
  const ORDEN = [7, 15, 1, 22, 11, 4, 18, 9, 24, 13, 2, 20, 6, 17, 10, 23, 3, 14, 21, 8, 16, 5, 19, 12];
  const CLAVE_ABIERTAS = "adviento-abiertas";

  const COLORES = ["rojo", "verde", "crema"];

  const datos = leerDatos();
  const hoy = fechaDeHoy();

  const calendario = document.getElementById("calendario");
  const subtitulo = document.getElementById("subtitulo");
  const aviso = document.getElementById("aviso");
  const dialogo = document.getElementById("carta");
  const cartaDia = document.getElementById("carta-dia");
  const cartaTexto = document.getElementById("carta-texto");
  const regalo = document.getElementById("regalo");
  const regaloNombre = document.getElementById("regalo-nombre");

  // cartas.js guarda { dia: { regalo, carta } } en base64
  function leerDatos() {
    try {
      const bytes = Uint8Array.from(atob(window.DATOS || ""), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes) || "{}");
    } catch (e) {
      return {};
    }
  }

  // Para probar en local: index.html?fecha=2026-12-07
  function fechaDeHoy() {
    const local = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);
    const param = new URLSearchParams(location.search).get("fecha");
    if (local && param) {
      const [a, m, d] = param.split("-").map(Number);
      return new Date(a, m - 1, d);
    }
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  }

  function fechaDe(dia) {
    return new Date(ANIO, MES, dia);
  }

  function diasHasta(dia) {
    return Math.round((fechaDe(dia) - hoy) / 86400000);
  }

  function leerAbiertas() {
    try {
      return new Set(JSON.parse(localStorage.getItem(CLAVE_ABIERTAS) || "[]"));
    } catch (e) {
      return new Set();
    }
  }

  function guardarAbierta(dia) {
    const abiertas = leerAbiertas();
    abiertas.add(dia);
    try {
      localStorage.setItem(CLAVE_ABIERTAS, JSON.stringify([...abiertas]));
    } catch (e) {}
  }

  function textoFaltan(n) {
    return n === 1 ? "mañana" : `en ${n} días`;
  }

  function pintarSubtitulo() {
    const faltan = diasHasta(1);
    if (faltan > 0) {
      subtitulo.textContent = `La primera puerta se abre ${textoFaltan(faltan)} ✨`;
    } else if (diasHasta(DIAS) > 0) {
      subtitulo.textContent = "Cada día se abre una puerta nueva. ¡Busca las que brillan!";
    } else if (diasHasta(DIAS) === 0) {
      subtitulo.textContent = "¡Feliz Nochebuena! Hoy se abre la última puerta ❤️";
    } else {
      subtitulo.textContent = "Todas las puertas están abiertas. ¡Feliz Navidad! ❤️";
    }
  }

  function pintarPuertas() {
    const abiertas = leerAbiertas();
    calendario.innerHTML = "";
    ORDEN.forEach((dia, i) => {
      const disponible = diasHasta(dia) <= 0;
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "puerta " + (disponible ? "disponible" : "bloqueada");
      if (disponible && abiertas.has(dia)) boton.classList.add("abierta");
      boton.dataset.dia = dia;
      boton.setAttribute("aria-label", disponible ? `Día ${dia}` : `Día ${dia}, bloqueado`);
      boton.innerHTML = `
        <span class="interior"><span>${dia}</span></span>
        <span class="hoja ${COLORES[i % COLORES.length]}">
          <span class="numero">${dia}</span>
          <svg class="mariquita-mini" aria-hidden="true"><use href="#mariquita"/></svg>
          ${disponible ? "" : '<span class="candado">🔒</span>'}
        </span>`;
      boton.addEventListener("click", () => pulsar(boton, dia));
      calendario.appendChild(boton);
    });
  }

  function pulsar(boton, dia) {
    const faltan = diasHasta(dia);
    if (faltan > 0) {
      boton.classList.remove("temblar");
      void boton.offsetWidth;
      boton.classList.add("temblar");
      mostrarAviso(`🔒 Esta puerta se abre ${textoFaltan(faltan)}`);
      return;
    }
    if (boton.classList.contains("abierta")) {
      abrirCarta(dia);
      return;
    }
    boton.classList.add("abierta");
    guardarAbierta(dia);
    setTimeout(() => abrirCarta(dia), 750);
  }

  let temporizadorAviso;
  function mostrarAviso(texto) {
    aviso.textContent = texto;
    aviso.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2200);
  }

  function escapar(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Markdown mínimo: párrafos, saltos de línea, **negrita** y *cursiva*
  function renderizar(md) {
    return md
      .split(/\n\s*\n/)
      .map((p) => {
        const html = escapar(p.trim())
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");
        return `<p>${html}</p>`;
      })
      .join("");
  }

  function abrirCarta(dia) {
    const { regalo: nombreRegalo = "", carta = "" } = datos[dia] || {};
    const texto = carta.trim();
    cartaDia.textContent = `${dia} de diciembre`;
    regaloNombre.textContent = nombreRegalo;
    regalo.hidden = !nombreRegalo;
    cartaTexto.innerHTML = texto
      ? renderizar(texto)
      : '<p class="carta-vacia">Esta carta todavía está escribiéndose… 💌</p>';
    dialogo.showModal();
  }

  dialogo.querySelector(".cerrar").addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("click", (e) => {
    if (e.target === dialogo) dialogo.close();
  });

  pintarSubtitulo();
  pintarPuertas();
})();
