import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "https://xv-sophia-4ac28-default-rtdb.firebaseio.com",
    projectId: "xv-sophia-4ac28",
    storageBucket: "xv-sophia-4ac28.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Identificador único do administrador
const adminIp = 'YOUR_ADMIN_IP_ADDRESS'; // Substitua pelo seu identificador exclusivo

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-recados');
    const commentsContainer = document.getElementById('comments-container');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = form.querySelector('input[name="nome"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const recado = form.querySelector('textarea[name="recado"]').value;
        const userId = Date.now().toString(); // ID único para cada recado

        try {
            await writeRecado(userId, { nome, email, recado, timestamp: new Date().toISOString() });
            form.reset();
            loadComments();
        } catch (error) {
            console.error('Erro ao enviar o recado:', error);
            alert('Falha ao enviar o recado. Tente novamente.');
        }
    });

    function createCommentElement(id, { nome, email, recado, timestamp }) {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        
        const commentContent = `
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Recado:</strong> ${recado}</p>
            <p><strong>Data:</strong> ${new Date(timestamp).toLocaleString()}</p>
        `;

        commentElement.innerHTML = commentContent;

        // Adiciona botão de excluir apenas se for o administrador
        if (adminIp === 'YOUR_ADMIN_IP_ADDRESS') { // Substitua pelo seu identificador exclusivo
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.classList.add('btn-delete');
            deleteButton.style.display = 'block'; // Mostra o botão se for o admin
            deleteButton.addEventListener('click', () => {
                if (confirm('Tem certeza de que deseja excluir este comentário?')) {
                    deleteRecado(id)
                        .then(() => {
                            loadComments();
                        })
                        .catch(error => {
                            console.error('Erro ao excluir o recado:', error);
                            alert('Falha ao excluir o recado. Tente novamente.');
                        });
                }
            });
            commentElement.appendChild(deleteButton);
        }

        return commentElement;
    }

    function loadComments() {
        commentsContainer.innerHTML = '';
        getRecados((data) => {
            if (data) {
                Object.entries(data).forEach(([id, recado]) => {
                    const commentElement = createCommentElement(id, recado);
                    commentsContainer.appendChild(commentElement);
                });
            }
        });
    }

    // Carregar comentários ao iniciar
    loadComments();
});

function writeRecado(userId, recadoData) {
    const recadosRef = ref(database, 'recados/' + userId);
    return set(recadosRef, recadoData);
}

function getRecados(callback) {
    const recadosRef = ref(database, 'recados');
    onValue(recadosRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    });
}

function deleteRecado(userId) {
    const recadoRef = ref(database, 'recados/' + userId);
    return remove(recadoRef);
}

