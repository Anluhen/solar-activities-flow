let deliveries = [];
let currentDelivery = null;

// One-time default on very first load, uncomment & edit:
//  const defaultDeliveries = [
//    { ID:1, ZVGP:'Z001', ZRGP:'R001', Data_Coleta:'2025-06-10', Data_Entrega:'2025-06-15', Status:'Aguardando', Endereco_Coleta:'Site A', Endereco_Entrega:'Site B', Incoterms:'FOB', Cotacao:'C123', Material:['Painel','Estrutura'] }
//  ];

function loadDeliveries() {
    const raw = localStorage.getItem('deliveries');
    if (raw) {
        try {
            deliveries = JSON.parse(raw);
        } catch (e) {
            console.error('Could not parse deliveries from localStorage:', e);
            deliveries = [];
        }
    } else {
        // first ever load → use defaults or start empty:
        // deliveries = defaultDeliveries.slice();
        deliveries = [];
    }
}

function saveDeliveries() {
    try {
        localStorage.setItem('deliveries', JSON.stringify(deliveries));
    } catch (e) {
        console.error('Could not save deliveries to localStorage:', e);
    }
}

const tableBody = document.getElementById('delivery-table-body');
const listScreen = document.getElementById('list-screen');
const detailScreen = document.getElementById('detail-screen');
const navList = document.getElementById('nav-list');
const navDetail = document.getElementById('nav-detail');
const newBtn = document.getElementById('new-delivery');
const form = document.getElementById('detail-form');
const steps = document.querySelectorAll('.progress-step');

function renderTable() {
    tableBody.innerHTML = '';
    deliveries.forEach(del => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${del.ID}</td><td>${del.ZVGP}</td><td>${del.ZRGP}</td><td>${del.Data_Entrega}</td><td>${del.Status}</td><td><button data-id='${del.ID}' class='view-btn'>Ver</button></td>`;
        tableBody.appendChild(tr);
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            currentDelivery = deliveries.find(d => d.ID === id);
            showDetail();
        });
    });
}

function showDetail() {
    listScreen.classList.remove('active');
    detailScreen.classList.add('active');
    populateForm();
    updateProgress();
}

function showList() {
    detailScreen.classList.remove('active');
    listScreen.classList.add('active');
}

navList.addEventListener('click', e => { e.preventDefault(); showList(); });
navDetail.addEventListener('click', e => { e.preventDefault(); if (currentDelivery) showDetail(); });
newBtn.addEventListener('click', () => {
    currentDelivery = { ID: deliveries.length + 1, ZVGP: '', ZRGP: '', Data_Coleta: '', Data_Entrega: '', Status: 'Aguardando', Endereco_Coleta: '', Endereco_Entrega: '', Incoterms: '', Cotacao: '', Material: [] };
    showDetail();
});

function populateForm() {
    form.reset();
    document.getElementById('ID').value = currentDelivery.ID;
    ['ZVGP', 'ZRGP', 'Data_Coleta', 'Data_Entrega', 'Endereco_Coleta', 'Endereco_Entrega', 'Incoterms', 'Cotacao'].forEach(field => {
        document.getElementById(field).value = currentDelivery[field];
    });
    document.getElementById('Status').value = currentDelivery.Status;
    renderMaterials();
    setFormState();
}

function renderMaterials() {
    const listDiv = document.getElementById('material-list');
    listDiv.innerHTML = '';

    currentDelivery.Material.forEach((mat, idx) => {
        const div = document.createElement('div');

        // — ID field —
        const idInput = document.createElement('input');
        idInput.placeholder = 'Material ID';
        idInput.value = mat.id || '';
        idInput.disabled = (currentDelivery.Status !== 'Aguardando');
        idInput.dataset.idx = idx;
        idInput.dataset.field = 'id';
        idInput.addEventListener('input', e => {
            currentDelivery.Material[e.target.dataset.idx].id = e.target.value;
        });
        div.appendChild(idInput);

        // — Description field —
        const descInput = document.createElement('input');
        descInput.placeholder = 'Descrição';
        descInput.value = mat.description || '';
        descInput.disabled = (currentDelivery.Status !== 'Aguardando');
        descInput.dataset.idx = idx;
        descInput.dataset.field = 'description';
        descInput.addEventListener('input', e => {
            currentDelivery.Material[e.target.dataset.idx].description = e.target.value;
        });
        div.appendChild(descInput);

        // — Quantity field —
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.placeholder = 'Quantidade';
        qtyInput.value = mat.quantity || '';
        qtyInput.disabled = (currentDelivery.Status !== 'Aguardando');
        qtyInput.dataset.idx = idx;
        qtyInput.dataset.field = 'quantity';
        qtyInput.addEventListener('input', e => {
            currentDelivery.Material[e.target.dataset.idx].quantity = e.target.value;
        });
        div.appendChild(qtyInput);

        // — Remove button (only when editable) —
        if (currentDelivery.Status === 'Aguardando') {
            const rm = document.createElement('button');
            rm.textContent = 'X';
            rm.addEventListener('click', () => {
                currentDelivery.Material.splice(idx, 1);
                renderMaterials();
            });
            div.appendChild(rm);
        }

        listDiv.appendChild(div);
    });
}

document.getElementById('add-material').addEventListener('click', () => {
    if (currentDelivery.Status === 'Aguardando') {
        currentDelivery.Material.push({ id: '', description: '', quantity: '' });
        renderMaterials();
    }
});

document.getElementById('Status').addEventListener('change', () => { currentDelivery.Status = document.getElementById('Status').value; setFormState(); updateProgress(); });

// Save button handler
document.getElementById('save-button').addEventListener('click', () => {
    ['ZVGP', 'ZRGP', 'Data_Coleta', 'Data_Entrega', 'Endereco_Coleta', 'Endereco_Entrega', 'Incoterms', 'Cotacao'].forEach(field => {
        currentDelivery[field] = document.getElementById(field).value;
    });
    if (!deliveries.find(d => d.ID === currentDelivery.ID)) { deliveries.push(currentDelivery); }
    saveDeliveries();
    renderTable();
    showList();
});

function setFormState() {
    const status = currentDelivery.Status;
    form.querySelectorAll('input, select, button').forEach(el => { el.disabled = false; });
    if (status === 'Separado') { document.querySelectorAll('#material-fieldset input,#material-fieldset button').forEach(el => el.disabled = true); }
    if (status === 'Coletado') { form.querySelectorAll('input, select, button').forEach(el => { if (el.id !== 'Status' && el.id !== 'save-button') el.disabled = true; }); }
}

function updateProgress() {
    const order = ['Aguardando', 'Separado', 'Coletado'];
    steps.forEach(step => {
        step.classList.toggle('completed', order.indexOf(step.dataset.status) <= order.indexOf(currentDelivery.Status));
    });
}

loadDeliveries();
renderTable();
