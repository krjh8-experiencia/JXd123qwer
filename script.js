// Usuarios hardcodeados
const users = {
    'krjh8': 'password123',
    'testuser': 'pass456'
};

// Mostrar mensajes (usamos alert por simplicidad)
function mostrarMensaje(mensaje, esError = false) {
    alert(esError ? '❌ ' + mensaje : '✅ ' + mensaje);
}

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username] === password) {
        localStorage.setItem('loggedUser', username);
        mostrarMensaje(`Bienvenido ${username}`);
        mostrarInterfazPrincipal(username);
    } else {
        mostrarMensaje('Credenciales inválidas', true);
    }
});

// Mostrar interfaz después del login
function mostrarInterfazPrincipal(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('user-display').textContent = username;
    
    // Mostrar sección de subida solo a krjh8
    document.getElementById('upload-section').style.display = 
        username === 'krjh8' ? 'block' : 'none';
    
    cargarListaArchivos();
}

// Cargar lista de archivos
function cargarListaArchivos(busqueda = '') {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    let encontrados = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('file_') && key.endsWith('.jar')) {
            const nombreArchivo = key.substring(5); // quitar "file_"
            if (busqueda && !nombreArchivo.toLowerCase().includes(busqueda.toLowerCase())) 
                continue;
            
            const li = document.createElement('li');
            li.innerHTML = `${nombreArchivo} <button class="download-btn">Descargar</button>`;
            li.querySelector('.download-btn').onclick = () => descargarArchivo(nombreArchivo);
            fileList.appendChild(li);
            encontrados++;
        }
    }
    
    if (encontrados === 0) {
        fileList.innerHTML = '<li>No hay archivos aún.</li>';
    }
}

// SUBIDA DE ARCHIVO - Versión corregida
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        mostrarMensaje('Selecciona un archivo primero', true);
        return;
    }
    
    if (!file.name.toLowerCase().endsWith('.jar')) {
        mostrarMensaje('Solo se permiten archivos .jar', true);
        return;
    }
    
    if (file.size > 4 * 1024 * 1024) { // 4 MB límite recomendado
        mostrarMensaje('El archivo es demasiado grande (máx 4 MB recomendado)', true);
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const base64 = event.target.result.split(',')[1];
            const clave = 'file_' + file.name;
            
            // Guardar en localStorage
            localStorage.setItem(clave, base64);
            
            mostrarMensaje(`¡"${file.name}" subido correctamente!`);
            console.log('Archivo guardado con clave:', clave);
            
            // Limpiar input y recargar lista
            fileInput.value = '';
            cargarListaArchivos();
            
        } catch (error) {
            console.error(error);
            mostrarMensaje('Error al guardar el archivo', true);
        }
    };
    
    reader.onerror = function() {
        mostrarMensaje('Error al leer el archivo', true);
    };
    
    reader.readAsDataURL(file);
});

// Búsqueda
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const busqueda = document.getElementById('searchInput').value.trim();
    cargarListaArchivos(busqueda);
});

// Descarga con modificación
async function descargarArchivo(nombreArchivo) {
    const clave = 'file_' + nombreArchivo;
    const base64 = localStorage.getItem(clave);
    
    if (!base64) {
        mostrarMensaje('Archivo no encontrado', true);
        return;
    }
    
    try {
        // Convertir base64 a bytes
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Cargar con JSZip
        const zip = new JSZip();
        await zip.loadAsync(bytes.buffer);
        
        const pluginFile = zip.file('plugin.yml');
        if (!pluginFile) {
            mostrarMensaje('Este .jar no contiene plugin.yml', true);
            return;
        }
        
        let contenido = await pluginFile.async('text');
        const usuario = localStorage.getItem('loggedUser') || 'desconocido';
        contenido += `\n## Plugin descargado por -${usuario}-\n`;
        
        zip.file('plugin.yml', contenido);
        
        const blobModificado = await zip.generateAsync({ type: 'blob' });
        
        // Descargar
        const url = URL.createObjectURL(blobModificado);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarMensaje(`"${nombreArchivo}" descargado y modificado`);
        
    } catch (error) {
        console.error(error);
        mostrarMensaje('Error al procesar el archivo', true);
    }
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('loggedUser');
    location.reload();
});

// Al cargar la página
window.onload = function() {
    const usuarioLogueado = localStorage.getItem('loggedUser');
    if (usuarioLogueado && users[usuarioLogueado]) {
        mostrarInterfazPrincipal(usuarioLogueado);
    }
};
