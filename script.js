"use strict";
const selector = document.querySelector('#cultivo');
const estado = document.querySelector('#estado');
const lista = document.querySelector('#registros');
const cantidad = document.querySelector('#cantidad');
const texto = value => typeof value === 'string' && value.trim().length > 0;
function valido(r) {
  if (!r || !['cultivo','fecha','equipo','fuente','observacion'].every(k => texto(r[k]))) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.fecha)) return false;
  const fecha = new Date(r.fecha + 'T12:00:00Z');
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0,10) === r.fecha;
}
function elemento(tag, contenido, clase) {
  const el = document.createElement(tag); el.textContent = contenido;
  if (clase) el.className = clase;
  return el;
}
async function cargar() {
  try {
    const respuesta = await fetch('datos.json');
    if (!respuesta.ok) throw new Error('HTTP');
    const datos = await respuesta.json();
    if (!Array.isArray(datos.registros) || !datos.registros.every(valido)) throw new Error('Formato');
    const registros = [...datos.registros].sort((a,b) => b.fecha.localeCompare(a.fecha));
    [...new Set(['Zapallo', 'Acelga', 'Espinaca', ...registros.map(r => r.cultivo)])].sort().forEach(c => {
      const op = elemento('option',c); op.value = c; selector.append(op);
    });
    function pintar() {
      const visibles = registros.filter(r => !selector.value || r.cultivo === selector.value);
      lista.replaceChildren(); cantidad.textContent = `${visibles.length} registros publicados`;
      estado.hidden = visibles.length > 0;
      estado.textContent = registros.length ? 'Este cultivo todavía no tiene registros fechados. Su ficha está disponible en la sección Cultivos.' : 'TodavÃ­a no hay mediciones publicadas. El equipo estÃ¡ preparando los registros de campo con fecha, fuente y responsable. La bitÃ¡cora se completarÃ¡ despuÃ©s de revisarlos.';
      visibles.forEach(r => {
        const li = document.createElement('li');
        const fecha = elemento('time',new Date(r.fecha+'T12:00:00Z').toLocaleDateString('es-AR',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}));
        fecha.dateTime = r.fecha;
        li.append(fecha,elemento('h3',r.cultivo),elemento('p',r.observacion),elemento('p',`Equipo: ${r.equipo} Â· Fuente: ${r.fuente}`,'fuente'));
        lista.append(li);
      });
    }
    selector.addEventListener('change',pintar); pintar();
  } catch {
    estado.hidden = false; estado.textContent = 'No se pudo cargar la bitÃ¡cora. RecargÃ¡ la pÃ¡gina. Si el problema sigue, el equipo debe revisar datos.json.';
    cantidad.textContent = 'Datos no disponibles'; selector.disabled = true;
  }
}
cargar();
