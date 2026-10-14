// Reemplaza esta URL con la IP pública de tu instancia EC2. 
// Muy importante: NO pongas una barra diagonal (/) al final.
const API_URL = 'http://184.194.248.3:8000'; 

document.addEventListener('DOMContentLoaded', () => {
    cargarContactos();
    
    // NOTA: Esta función está comentada porque el endpoint /categorias no existe en tu nuevo main.py.
    // cargarCategorias(); 

    document.getElementById('formContacto').addEventListener('submit', guardarContacto);
});

async function cargarContactos() {
    try {
        const respuesta = await fetch(`${API_URL}/contactos`);
        if (!respuesta.ok) throw new Error('Error en la red');
        
        const contactos = await respuesta.json();
        const tbody = document.getElementById('tablaContactos');
        tbody.innerHTML = '';

        contactos.forEach(contacto => {
            tbody.innerHTML += `
                <tr>
                    <td>${contacto.id_contacto}</td>
                    <td>${contacto.nombre_completo}</td>
                    <td>${contacto.telefono || 'N/A'}</td>
                    <td>${contacto.email || 'N/A'}</td>
                    <td>${contacto.categoria}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-2" onclick="editarContacto(${contacto.id_contacto})" data-bs-toggle="modal" data-bs-target="#contactoModal">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarContacto(${contacto.id_contacto})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar contactos:', error);
    }
}

// Función para cargar los datos en el modal cuando se presiona "Editar"
window.editarContacto = async (id) => {
    try {
        const respuesta = await fetch(`${API_URL}/contactos/${id}`);
        const contacto = await respuesta.json();

        // Llenar el formulario con los datos existentes
        document.getElementById('contactoId').value = contacto.id_contacto;
        document.getElementById('nombre').value = contacto.nombre;
        document.getElementById('apPaterno').value = contacto.apellido_paterno;
        document.getElementById('apMaterno').value = contacto.apellido_materno || '';
        document.getElementById('email').value = contacto.email || '';
        document.getElementById('telefono').value = contacto.telefono || '';
        
        // Si vuelves a habilitar las categorías, esto seleccionará la correcta
        if(document.getElementById('categoria').options.length > 0) {
            document.getElementById('categoria').value = contacto.id_categoria;
        }

        document.getElementById('modalTitle').innerText = 'Editar Contacto';
    } catch (error) {
        console.error('Error al obtener el contacto:', error);
    }
};

async function guardarContacto(e) {
    e.preventDefault();
    
    const idContacto = document.getElementById('contactoId').value;
    
    // Objeto con la estructura exacta que espera tu modelo en FastAPI
    const datosContacto = {
        nombre: document.getElementById('nombre').value,
        apellido_paterno: document.getElementById('apPaterno').value,
        apellido_materno: document.getElementById('apMaterno').value || null,
        telefono: document.getElementById('telefono').value || null,
        celular: null, // Si decides agregar el input celular, cámbialo aquí
        email: document.getElementById('email').value || null,
        fecha_nacimiento: null, // Si decides agregar el input fecha, cámbialo aquí
        id_categoria: document.getElementById('categoria').value ? parseInt(document.getElementById('categoria').value) : 1 // Valor 1 por defecto si no hay categorías cargadas
    };

    try {
        let url = `${API_URL}/contactos`;
        let metodo = 'POST'; // Por defecto es POST (Crear)

        // Si existe un idContacto en el campo oculto, cambiamos a PUT (Actualizar)
        if (idContacto) {
            url = `${API_URL}/contactos/${idContacto}`;
            metodo = 'PUT';
        }

        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosContacto)
        });

        if (respuesta.ok) {
            // Ocultar modal y refrescar tabla
            bootstrap.Modal.getInstance(document.getElementById('contactoModal')).hide();
            cargarContactos();
            limpiarFormulario();
        } else {
            console.error('Error de la API:', await respuesta.text());
        }
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

window.eliminarContacto = async (id) => {
    if(confirm('¿Estás seguro de eliminar este contacto?')) {
        try {
            await fetch(`${API_URL}/contactos/${id}`, { 
                method: 'DELETE' 
            });
            cargarContactos();
        } catch (error) {
            console.error('Error al eliminar:', error);
        }
    }
};

window.limpiarFormulario = () => {
    document.getElementById('formContacto').reset();
    document.getElementById('contactoId').value = '';
    document.getElementById('modalTitle').innerText = 'Nuevo Contacto';
};