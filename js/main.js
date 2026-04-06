// Módulo principal
function cargarPagina(url) {
    const contentDiv = document.getElementById('content');
    fetch(url)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;
            
            // Ejecutar el script correspondiente según la página cargada
            if (url.includes('subirPropuesta')) {
                import('./subirPropuesta.js').then(module => {
                    module.initSubirPropuesta();
                });
            } else if (url.includes('votarPropuesta')) {
                import('./votarPropuesta.js').then(module => {
                    module.initVotarPropuesta();
                });
            } else if (url.includes('verVotacion')) {
                import('./verVotacion.js').then(module => {
                    module.initVerVotacion();
                });
            } else if (url.includes('subirAlumnos')) {
                import('./subirAlumnos.js').then(module => {
                    module.subirAlumnos();
                });
            }
        })
        .catch(error => {
            contentDiv.innerHTML = `<div class="mensaje mensaje-error">Error al cargar la página: ${error.message}</div>`;
        });
}

// Event listeners para los botones del menú
document.getElementById('btnSubirPropuesta').addEventListener('click', () => {
    cargarPagina('pages/subirPropuesta.html');
});

document.getElementById('btnVotarPropuesta').addEventListener('click', () => {
    cargarPagina('pages/votarPropuesta.html');
});

document.getElementById('btnVerVotacion').addEventListener('click', () => {
    cargarPagina('pages/verVotacion.html');
});

document.getElementById('btnSubirAlumnos').addEventListener('click', () => {
    cargarPagina('pages/subirAlumnos.html');
});