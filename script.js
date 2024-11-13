const keyList = document.getElementById('keyList');
const keyInput = document.getElementById('keyInput');
const hwidCountInput = document.getElementById('hwidCount');
const hwidInputsContainer = document.getElementById('hwidInputs');
const addKeyButton = document.getElementById('addKeyButton');

// Array para armazenar chaves
let keys = [];

// Função para atualizar a lista de chaves exibida
function updateKeyList() {
    keyList.innerHTML = '';
    keys.forEach((keyData, index) => {
        if (keyData.hwids && Array.isArray(keyData.hwids)) {
            const li = document.createElement('li');
            li.textContent = `Chave: ${keyData.key}, HWIDs: ${keyData.hwids.join(', ')}`;
            li.appendChild(createRemoveButton(index));
            keyList.appendChild(li);
        }
    });
}

// Função para criar um botão de remoção
function createRemoveButton(index) {
    const button = document.createElement('button');
    button.textContent = 'Remover';
    button.classList.add('remove-button');
    button.onclick = () => {
        keys.splice(index, 1);
        updateKeyList();
        showFeedback('Chave removida com sucesso!');
        updateLocalStorage();
        updateGitHubFile(); // Atualiza o arquivo no GitHub
    };
    return button;
}

function generateHwidInputs() {
    hwidInputsContainer.innerHTML = '';
    const hwidCount = parseInt(hwidCountInput.value, 10);
    for (let i = 0; i < hwidCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `HWID ${i + 1}`;
        input.classList.add('hwid-input');
        hwidInputsContainer.appendChild(input);
    }
}

hwidCountInput.addEventListener('input', generateHwidInputs);

addKeyButton.addEventListener('click', () => {
    const newKey = keyInput.value.trim();
    const hwids = Array.from(hwidInputsContainer.getElementsByTagName('input'))
        .map(input => input.value.trim())
        .filter(hwid => hwid);

    if (newKey && hwids.length > 0 && !keys.some(keyData => keyData.key === newKey)) {
        keys.push({ key: newKey, hwids: hwids });
        keyInput.value = '';
        hwidInputsContainer.innerHTML = '';
        hwidCountInput.value = 1; // Reseta o contador de HWIDs
        generateHwidInputs(); // Gera um novo campo de HWID
        updateKeyList(); // Atualiza a lista
        showFeedback('Chave adicionada com sucesso!');
        updateLocalStorage(); // Atualiza o localStorage após adição
        updateGitHubFile(); // Atualiza o arquivo no GitHub
    } else {
        alert('Chave inválida ou já existe!');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const storedKeys = JSON.parse(localStorage.getItem('keys')) || [];
    keys = storedKeys;
    updateKeyList(); // Atualiza a lista de chaves ao carregar
});

function updateLocalStorage() {
    localStorage.setItem('keys', JSON.stringify(keys));
}

function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.classList.add('feedback');
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

async function updateGitHubFile() {
    const token = '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'; // Substitua pelo seu token
    const repoOwner = 'RhChs1090'; // Substitua pelo seu nome de usuário
    const repoName = 'Keys'; // Substitua pelo nome do seu repositório
    const filePath = 'keys.json'; // Nome do arquivo onde as chaves serão salvas

    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Atualizando chaves',
            content: btoa(JSON.stringify(keys)), // Codifica as chaves em Base64
            sha: await getFileSha(repoOwner, repoName, filePath) // Obtém o SHA do arquivo se existir
        })
    });

    if (response.ok) {
        console.log('Arquivo atualizado com sucesso!');
    } else {
        console.error('Erro ao atualizar o arquivo no GitHub:', await response.text());
    }
}

async function getFileSha(repoOwner, repoName, filePath) {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`);
    if (response.ok) {
        const data = await response.json();
        return data.sha; // Retorna o SHA do arquivo
    }
    return null; // Se o arquivo não existir, retorna null
}

generateHwidInputs();
