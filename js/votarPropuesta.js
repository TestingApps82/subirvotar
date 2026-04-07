import { usuariosDocRef, getDoc, updateDoc } from '../config/firebaseConfig.js';

let propuestas = [];
let votoSeleccionado = null;

async function verificarFecha() {
    const fechaLimite = new Date('2026-04-24');
    const fechaActual = new Date();
    
    if (fechaActual > fechaLimite) {
        mostrarMensaje('YA NO SE PUEDE VOTAR', 'error');
        return false;
    }
    return true;
}

function mostrarMensaje(mensaje, tipo) {
    const container = document.getElementById('votarPropuestaContent');
    container.innerHTML = `<div class="mensaje mensaje-${tipo}">${mensaje}</div>`;
}

async function buscarUsuario(nombreCompleto) {
    try {
        const docSnap = await getDoc(usuariosDocRef);
        if (docSnap.exists()) {
            const usuarios = docSnap.data().usuarios || [];
            const usuario = usuarios.find(u => u.NOMBRE.toLowerCase() === nombreCompleto.toLowerCase());
            return usuario;
        }
        return null;
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        return null;
    }
}

function mostrarPropuestas(usuario) {
    const container = document.getElementById('votarPropuestaContent');
    
    // Filtrar propuestas que tengan ambas URLs no vacías
    const propuestasValidas = propuestas.filter(p => p.URL01 && p.URL01.trim() !== '' && p.URL02 && p.URL02.trim() !== '');
    
    if (propuestasValidas.length === 0) {
        container.innerHTML = '<div class="mensaje mensaje-info">No hay propuestas disponibles para votar</div>';
        return;
    }
    
    let html = '<h3>Selecciona tu voto:</h3>';
    propuestasValidas.forEach(propuesta => {
        html += `
            <div class="propuesta-card">
                <h3>PROPUESTA DE: ${propuesta.NOMBRE}</h3>
                <div class="images-container">
                    <img src="${propuesta.URL01}" alt="Imagen 1 de ${propuesta.NOMBRE}">
                    <img src="${propuesta.URL02}" alt="Imagen 2 de ${propuesta.NOMBRE}">
                </div>
                <div class="radio-group">
                    <input type="radio" name="voto" value="${propuesta.NOMBRE}" id="voto_${propuesta.NOMBRE.replace(/\s/g, '_')}">
                    <label for="voto_${propuesta.NOMBRE.replace(/\s/g, '_')}">Votar por esta propuesta</label>
                </div>
            </div>
        `;
    });
    
    html += '<button id="btnConfirmarVoto" style="margin-top: 20px;">Confirmar Voto</button>';
    html += '<div id="mensajeVoto"></div>';
    
    container.innerHTML = html;
    
    // Agregar event listeners a los radios
    document.querySelectorAll('input[name="voto"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            votoSeleccionado = e.target.value;
        });
    });
    
    document.getElementById('btnConfirmarVoto').addEventListener('click', async () => {
        if (!votoSeleccionado) {
            mostrarMensajeVoto('Selecciona una propuesta para votar', 'error');
            return;
        }
        
        await registrarVoto(usuario.NOMBRE, votoSeleccionado);
    });
}

function mostrarMensajeVoto(mensaje, tipo) {
    const mensajeDiv = document.getElementById('mensajeVoto');
    mensajeDiv.innerHTML = `<div class="mensaje mensaje-${tipo}">${mensaje}</div>`;
}

async function registrarVoto(nombreVotante, nombreVotado) {
    try {
        const docSnap = await getDoc(usuariosDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const usuarios = data.usuarios || [];
            const indexVotado = usuarios.findIndex(u => u.NOMBRE === nombreVotante);
            
            if (indexVotado !== -1) {
                // Incrementar el contador de votos
                const votosActuales = usuarios[indexVotado].VOTO || 0;
                usuarios[indexVotado].VOTO = nombreVotado;
                
                await updateDoc(usuariosDocRef, { usuarios: usuarios });
                mostrarMensajeVoto(`¡Voto registrado exitosamente para ${nombreVotado}!`, 'exito');
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error al registrar voto:', error);
        mostrarMensajeVoto('Error al registrar el voto', 'error');
    }
}

async function cargarPropuestas() {
    try {
        const docSnap = await getDoc(usuariosDocRef);
        if (docSnap.exists()) {
            propuestas = docSnap.data().usuarios || [];
        }
    } catch (error) {
        console.error('Error al cargar propuestas:', error);
    }
}

export async function initVotarPropuesta() {
    const fechaValida = await verificarFecha();
    if (!fechaValida) return;
    
    await cargarPropuestas();
    
    const container = document.getElementById('votarPropuestaContent');
    container.innerHTML = `
        <div class="form-group">
            <label>Tu Nombre Completo:</label>
            <input type="text" id="nombreVotante" placeholder="Ingresa tu nombre y apellidos completos" style="text-transform: uppercase;" >
        </div>
        <button id="btnVerificarVotante">Verificar Identidad</button>
        <div id="resultadoVotante"></div>
    `;
    
    document.getElementById('btnVerificarVotante').addEventListener('click', async () => {
        const nombre = document.getElementById('nombreVotante').value.trim();
        if (!nombre) {
            document.getElementById('resultadoVotante').innerHTML = '<div class="mensaje mensaje-error">Ingresa un nombre válido</div>';
            return;
        }
        
        const usuario = await buscarUsuario(nombre);
        if (usuario) {
            mostrarPropuestas(usuario);
        } else {
            document.getElementById('resultadoVotante').innerHTML = '<div class="mensaje mensaje-error">No se encontró coincidencia exacta</div>';
        }
    });
}
