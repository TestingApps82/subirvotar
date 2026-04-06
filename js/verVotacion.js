import { usuariosDocRef, getDoc } from '../config/firebaseConfig.js';

async function cargarResultados() {
    const container = document.getElementById('verVotacionContent');
    container.innerHTML = '<div class="loading">Cargando resultados...</div>';
    
    try {
        const docSnap = await getDoc(usuariosDocRef);
        if (docSnap.exists()) {
            const usuarios = docSnap.data().usuarios || [];
            
            // Filtrar solo usuarios que tienen propuestas válidas
            const participantes = usuarios.filter(u => 
                u.URL01 && u.URL01.trim() !== '' && 
                u.URL02 && u.URL02.trim() !== ''
            );
            
            if (participantes.length === 0) {
                container.innerHTML = '<div class="mensaje mensaje-info">No hay propuestas registradas</div>';
                return;
            }
            
            // CONTAR VOTOS: recorrer todos los usuarios y contar cuántas veces aparece cada nombre votado
            const votosPorPropuesta = {};
            
            usuarios.forEach(usuario => {
                const nombreVotado = usuario.VOTO;
                // Solo contar si hay un voto válido (no vacío, no null, no undefined)
                if (nombreVotado && nombreVotado.trim() !== '') {
                    votosPorPropuesta[nombreVotado] = (votosPorPropuesta[nombreVotado] || 0) + 1;
                }
            });
            
            // Calcular total de votos emitidos (suma de todos los conteos)
            const totalVotos = Object.values(votosPorPropuesta).reduce((sum, count) => sum + count, 0);
            
            let html = '<div class="resultados-container">';
            
            participantes.forEach(participante => {
                const nombrePropuesta = participante.NOMBRE;
                const votos = votosPorPropuesta[nombrePropuesta] || 0;
                const porcentaje = totalVotos > 0 ? (votos / totalVotos) * 100 : 0;
                
                html += `
                    <div class="propuesta-card">
                        <h3>${nombrePropuesta}</h3>
                        <div class="images-container">
                            <img src="${participante.URL01}" alt="Imagen 1">
                            <img src="${participante.URL02}" alt="Imagen 2">
                        </div>
                        <div class="resultado-voto">
                            <strong>Votos: ${votos}</strong>
                            <div class="barra-votos">
                                <div class="barra-porcentaje" style="width: ${porcentaje}%">
                                    ${porcentaje.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                <div class="total-votos" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px; text-align: center;">
                    <strong>Total de votos emitidos: ${totalVotos}</strong>
                </div>
            </div>`;
            
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="mensaje mensaje-error">No se encontraron datos de votación</div>';
        }
    } catch (error) {
        console.error('Error al cargar resultados:', error);
        container.innerHTML = '<div class="mensaje mensaje-error">Error al cargar los resultados</div>';
    }
}

export function initVerVotacion() {
    cargarResultados();
}