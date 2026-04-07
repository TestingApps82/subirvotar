import { usuariosDocRef, getDoc, updateDoc } from '../config/firebaseConfig.js';

let usuarioEncontrado = null;
let imagenesSubidas = { url01: '', url02: '' };

async function verificarFecha() {
    const fechaLimite = new Date('2026-04-20');
    const fechaActual = new Date();
    
    if (fechaActual > fechaLimite) {
        mostrarMensaje('YA NO SE PUEDE SUBIR PROPUESTAS', 'error');
        return false;
    }
    return true;
}

function mostrarMensaje(mensaje, tipo) {
    const container = document.getElementById('subirPropuestaContent');
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

async function subirImagen(file, position) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', '2903767d708eb5a3fa020cac8ac45c5a');
    
    try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error('Error al subir imagen');
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function mostrarFormularioSubida(usuario) {
    const container = document.getElementById('subirPropuestaContent');
    container.innerHTML = `
        <div class="upload-section">
            <h3>Propuesta de: ${usuario.NOMBRE}</h3>
            <div class="form-group">
                <label>Para damas:</label>
                <input type="file" id="imagen1" accept="image/*">
                ${usuario.URL01 ? `<div>Imagen actual: <a href="${usuario.URL01}" target="_blank">Ver imagen</a></div>` : ''}
                <div id="preview1"></div>
            </div>
            <div class="form-group">
                <label>Para caballos:</label>
                <input type="file" id="imagen2" accept="image/*">
                ${usuario.URL02 ? `<div>Imagen actual: <a href="${usuario.URL02}" target="_blank">Ver imagen</a></div>` : ''}
                <div id="preview2"></div>
            </div>
            <button id="btnSubirImagenes">Subir/Reemplazar Imágenes</button>
            <div id="mensajeSubida"></div>
        </div>
    `;
    
    const img1Input = document.getElementById('imagen1');
    const img2Input = document.getElementById('imagen2');
    const preview1 = document.getElementById('preview1');
    const preview2 = document.getElementById('preview2');
    
    img1Input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview1.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; margin-top: 10px;">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    img2Input.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview2.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; margin-top: 10px;">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    document.getElementById('btnSubirImagenes').addEventListener('click', async () => {
        const file1 = img1Input.files[0];
        const file2 = img2Input.files[0];
        
        if (!file1 && !file2) {
            mostrarMensajeSubida('Selecciona al menos una imagen para subir', 'error');
            return;
        }
        
        mostrarMensajeSubida('Subiendo imágenes...', 'info');
        
        if (file1) {
            const url = await subirImagen(file1, 1);
            if (url) imagenesSubidas.url01 = url;
        }
        
        if (file2) {
            const url = await subirImagen(file2, 2);
            if (url) imagenesSubidas.url02 = url;
        }
        
        await actualizarUrlsEnFirebase(usuario.NOMBRE);
    });
}

function mostrarMensajeSubida(mensaje, tipo) {
    const mensajeDiv = document.getElementById('mensajeSubida');
    mensajeDiv.innerHTML = `<div class="mensaje mensaje-${tipo}">${mensaje}</div>`;
}

async function actualizarUrlsEnFirebase(nombreUsuario) {
    try {
        const docSnap = await getDoc(usuariosDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const usuarios = data.usuarios || [];
            const index = usuarios.findIndex(u => u.NOMBRE === nombreUsuario);
            
            if (index !== -1) {
                if (imagenesSubidas.url01) usuarios[index].URL01 = imagenesSubidas.url01;
                if (imagenesSubidas.url02) usuarios[index].URL02 = imagenesSubidas.url02;
                
                await updateDoc(usuariosDocRef, { usuarios: usuarios });
                mostrarMensajeSubida('Imágenes subidas exitosamente', 'exito');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error al actualizar URLs:', error);
        mostrarMensajeSubida('Error al guardar las imágenes', 'error');
    }
}

export function initSubirPropuesta() {
    const container = document.getElementById('subirPropuestaContent');
    
    async function iniciar() {
        const fechaValida = await verificarFecha();
        if (!fechaValida) return;
        
        container.innerHTML = `
            <div class="form-group">
                <label>Nombre Completo:</label>
                <input type="text" id="nombreUsuario" placeholder="Ingresa tu nombre y apellidos completos" style="text-transform: uppercase; ">
            </div>
            <button id="btnVerificar">Verificar Usuario</button>
            <div id="resultadoBusqueda"></div>
        `;
        
        document.getElementById('btnVerificar').addEventListener('click', async () => {
            const nombre = document.getElementById('nombreUsuario').value.trim();
            if (!nombre) {
                document.getElementById('resultadoBusqueda').innerHTML = '<div class="mensaje mensaje-error">Ingresa un nombre válido</div>';
                return;
            }
            
            const usuario = await buscarUsuario(nombre);
            if (usuario) {
                mostrarFormularioSubida(usuario);
            } else {
                document.getElementById('resultadoBusqueda').innerHTML = '<div class="mensaje mensaje-error">No se encontró coincidencia exacta</div>';
            }
        });
    }
    
    iniciar();
}
