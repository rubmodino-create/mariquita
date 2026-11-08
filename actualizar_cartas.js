// Copia las cartas y los regalos de ../06_cartas a cartas.js.
// Ejecutar con: node actualizar_cartas.js
const fs = require("fs");
const path = require("path");

const carpeta = path.join(__dirname, "..", "06_cartas");
const PLANTILLA = "(escribe aquí la carta)";
const dias = {};

for (let dia = 1; dia <= 24; dia++) {
  const archivo = path.join(carpeta, `dia_${String(dia).padStart(2, "0")}.md`);
  if (!fs.existsSync(archivo)) continue;
  const md = fs.readFileSync(archivo, "utf8").replace(/\r\n/g, "\n");

  // "**Regalo:** Peluche (por confirmar)" -> "Peluche"
  const linea = md.match(/^\*\*Regalo:\*\*(.*)$/m);
  const regalo = linea ? linea[1].replace(/\(.*?\)/g, "").trim() : "";

  // Todo lo que va después de la primera línea "---" es la carta
  const partes = md.split(/^---\s*$/m);
  let carta = (partes.length > 1 ? partes.slice(1).join("---") : "").trim();
  if (carta === PLANTILLA) carta = "";

  if (regalo || carta) dias[dia] = { regalo, carta };
}

// En base64 para que no se lean los regalos de un vistazo mirando el código
const datos = Buffer.from(JSON.stringify(dias), "utf8").toString("base64");
const salida = "// Generado por actualizar_cartas.js — no editar a mano\nwindow.DATOS = \"" + datos + "\";\n";
fs.writeFileSync(path.join(__dirname, "cartas.js"), salida, "utf8");

const valores = Object.values(dias);
const cartas = valores.filter((d) => d.carta).length;
const regalos = valores.filter((d) => d.regalo).length;
console.log(`cartas.js actualizado: ${cartas}/24 cartas y ${regalos}/24 regalos.`);
