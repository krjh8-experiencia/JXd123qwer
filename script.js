// Usuarios hardcodeados (inseguro, pero es estático)
const users = {
    'krjh8': 'password123',  // Solo este puede subir
    'testuser': 'pass456'    // Otro usuario de ejemplo
};

// Función para mostrar mensaje de error
function showError(message) {
    alert(message);
}

// Manejar login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username] === password) {
        localStorage.setItem('loggedUser', username);  // Guardar usuario en localStorage
        showMainContent(username);
    } else {
        showError('Credenciales inválidas');
    }
});

// Mostrar contenido principal
function showMainContent(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('user-display').textContent = username;
    
    if (username === 'krjh8') {
        document.getElementById('upload-section').style.display = 'block';
    }
    
    loadFileList();
}

// Cargar lista de archivos desde localStorage
function loadFileList(searchQuery = '') {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('file_') && key.endsWith('.jar')) {
            const filename = key.replace('file_', '');
            if (searchQuery && !filename.toLowerCase().includes(searchQuery.toLowerCase())) continue;
            
            const li = document.createElement('li');
            li.textContent = filename;
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Descargar';
            downloadBtn.onclick = () => downloadFile(filename);
            li.appendChild(downloadBtn);
            fileList.appendChild(li);
        }
    }
}

// Manejar upload
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file || !file.name.endsWith('.jar')) {
        showError('Archivo inválido. Solo .jar');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const base64 = event.target.result.split(',')[1];  // Obtener base64 puro
        localStorage.setItem(`file_${file.name}`, base64);
        showError('Archivo subido exitosamente (en localStorage)');
        loadFileList();
    };
    reader.readAsDataURL(file);  // Leer como base64
});

// Manejar búsqueda
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchQuery = document.getElementById('searchInput').value;
    loadFileList(searchQuery);
});

// Descargar archivo modificado
async function downloadFile(filename) {
    const base64 = localStorage.getItem(`file_${filename}`);
    if (!base64) return showError('Archivo no encontrado');
    
    // Convertir base64 a ArrayBuffer
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Cargar ZIP con JSZip
    const zip = new JSZip();
    await zip.loadAsync(bytes.buffer);
    
    // Modificar plugin.yml si existe
    if (zip.file('plugin.yml')) {
        let content = await zip.file('plugin.yml').async('text');
        const username = localStorage.getItem('loggedUser');
        content += `\n## Plugin descargado por -${username}-\n`;
        zip.file('plugin.yml', content);
    } else {
        showError('plugin.yml no encontrado en el .jar');
        return;
    }
    
    // Generar nuevo ZIP
    const modifiedZip = await zip.generateAsync({ type: 'blob' });
    
    // Descargar
    const url = URL.createObjectURL(modifiedZip);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('loggedUser');
    location.reload();
});

// Chequear si ya está logueado al cargar
window.onload = function() {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
        showMainContent(loggedUser);
    }
};
