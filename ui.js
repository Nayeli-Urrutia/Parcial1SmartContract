import SmartContract from './SmartContract.js';

const contract = new SmartContract();
window.contract = contract;

let isSellerAuthenticated = false;
const SELLER_CREDENTIALS = {
    username: "Nayeli_Urrutia",
    password: "1234"
};

// Authentication functions
export function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

export function selectRole(role) {
    if (role === 'seller') {
        showLoginModal();
    } else {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('buyerContent').style.display = 'block';
        showAvailableProperties('buyer');
    }
}

export async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === SELLER_CREDENTIALS.username && password === SELLER_CREDENTIALS.password) {
        isSellerAuthenticated = true;
        closeModal('loginModal');
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('sellerContent').style.display = 'block';
        showAvailableProperties('seller');
        alert('Inicio de sesión exitoso');
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

// Modal management functions
export function showRegisterPropertyModal() {
    if (!isSellerAuthenticated) {
        showLoginModal();
        return;
    }
    document.getElementById('registerPropertyModal').style.display = 'block';
}

export function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

export async function showTransferModal(propertyId, currentOwner, isSeller = false) {
    const property = (await contract.getProperties()).find(p => p.id === propertyId);
    if (!property) return;

    // Add validation for buyer's purchase limit
    if (!isSeller && property.value > 1000000) {
        alert('Lo sentimos, no puede comprar propiedades con valor superior a Q1,000,000');
        return;
    }

    document.getElementById('transferPropertyId').value = propertyId;
    document.getElementById('currentOwner').value = currentOwner;
    document.getElementById('transferModalTitle').textContent = isSeller ? 'Vender Propiedad' : 'Comprar Propiedad';
    document.getElementById('saleValue').value = property.value;
    document.getElementById('saleValueDisplay').textContent = property.value.toLocaleString();
    document.getElementById('transferPropertyModal').style.display = 'block';
}

// Property management functions
export async function handleRegisterProperty(event) {
    event.preventDefault();
    const propertyId = document.getElementById('propertyId').value;
    const owner = document.getElementById('owner').value;
    const location = document.getElementById('location').value;
    const area = Number(document.getElementById('area').value);
    const value = Number(document.getElementById('value').value);

    const success = await contract.registerProperty(propertyId, owner, location, area, value);
    if (success) {
        alert('Propiedad registrada exitosamente');
        closeModal('registerPropertyModal');
        document.getElementById('registerPropertyForm').reset();
        showAvailableProperties('seller');
    } else {
        alert('Error: La propiedad ya existe');
    }
}

export async function handleTransferProperty(event) {
    event.preventDefault();
    const propertyId = document.getElementById('transferPropertyId').value;
    const currentOwner = document.getElementById('currentOwner').value;
    const newOwner = document.getElementById('newOwner').value;
    const saleValue = Number(document.getElementById('saleValue').value);

    if (!isSellerAuthenticated) {
        const SPENDING_LIMIT = 1000000;
        if (saleValue > SPENDING_LIMIT) {
            alert('Error: El valor de venta excede el límite permitido');
            return;
        }
    }

    const success = await contract.transferProperty(propertyId, currentOwner, newOwner, saleValue);
    if (success) {
        alert('Propiedad transferida exitosamente');
        closeModal('transferPropertyModal');
        document.getElementById('transferPropertyForm').reset();
        showAvailableProperties('buyer');
    } else {
        alert('Error: No se pudo transferir la propiedad');
    }
}

// Property display functions
export async function showMyProperties() {
    const properties = await contract.getProperties();
    const container = document.getElementById('propertyListContainer');
    container.innerHTML = '<h2>Mis Propiedades</h2>';

    const myProperties = properties.filter(p => p.status === 'sold');
    if (myProperties.length === 0) {
        container.innerHTML += '<p>No tienes propiedades registradas.</p>';
    } else {
        const propertiesContainer = document.createElement('div');
        propertiesContainer.className = 'properties-grid';

        myProperties.forEach((property) => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            propertyCard.innerHTML = `
                <h3>Propiedad ${property.id}</h3>
                <div><strong>Propietario:</strong> ${property.owner}</div>
                <div><strong>Ubicación:</strong> ${property.location}</div>
                <div><strong>Área:</strong> ${property.area} metros cuadrados</div>
                <div><strong>Valor:</strong> Q${property.value}</div>
                <button class="button" onclick="showPropertyHistory('${property.id}')">Ver Historial</button>
            `;
            propertiesContainer.appendChild(propertyCard);
        });

        container.appendChild(propertiesContainer);
    }

    document.getElementById('transactionsContainer').innerHTML = '';
}

export async function showAvailableProperties(userType) {
    if (userType === 'seller' && !isSellerAuthenticated) {
        showLoginModal();
        return;
    }

    const properties = await contract.getProperties();
    const container = document.getElementById('propertyListContainer');
    container.innerHTML = '';

    if (userType === 'seller') {
        const availableSection = document.createElement('div');
        availableSection.innerHTML = '<h2>Propiedades Disponibles</h2>';
        const soldSection = document.createElement('div');
        soldSection.innerHTML = '<h2>Propiedades Vendidas</h2>';

        properties.forEach((property) => {
            const propertyCard = createPropertyCard(property, userType);
            if (property.status === 'sold') {
                soldSection.appendChild(propertyCard);
            } else {
                availableSection.appendChild(propertyCard);
            }
        });

        container.appendChild(availableSection);
        container.appendChild(soldSection);
    } else {
        const availableProperties = properties.filter(p => p.status === 'available');
        availableProperties.forEach((property) => {
            const propertyCard = createPropertyCard(property, userType);
            container.appendChild(propertyCard);
        });
    }

    document.getElementById('transactionsContainer').innerHTML = '';
}

function createPropertyCard(property, userType) {
    const propertyCard = document.createElement('div');
    propertyCard.className = 'property-card';
    propertyCard.innerHTML = `
        <h3>Propiedad ${property.id}</h3>
        <div><strong>Propietario:</strong> ${property.owner}</div>
        <div><strong>Ubicación:</strong> ${property.location}</div>
        <div><strong>Área:</strong> ${property.area} metros cuadrados</div>
        <div><strong>Valor:</strong> Q${property.value}</div>
        ${userType === 'seller' ? 
            `<div class="button-group">
                <button class="button" onclick="showTransferModal('${property.id}', '${property.owner}', true)">Vender Propiedad</button>
                <button class="button" onclick="showModifyPropertyValueModal('${property.id}')">Modificar Valor</button>
                <button class="button" onclick="showDeletePropertyModal('${property.id}')">Eliminar Propiedad</button>
            </div>`
        : `<button class="button" onclick="showTransferModal('${property.id}', '${property.owner}')">Comprar Propiedad</button>`
        }
        <button class="button" onclick="showPropertyHistory('${property.id}')">Ver Historial</button>
    `;
    return propertyCard;
}

function showDeletePropertyModal(propertyId) {
    document.getElementById('deletePropertyId').value = propertyId;
    document.getElementById('deletePropertyModal').style.display = 'block';
}

async function handleDeleteProperty(event) {
    event.preventDefault();
    const propertyId = document.getElementById('deletePropertyId').value;
    const confirmationCode = document.getElementById('confirmationCode').value;

    const success = await contract.deleteProperty(propertyId, confirmationCode);
    if (success) {
        alert('Propiedad eliminada exitosamente');
        closeModal('deletePropertyModal');
        showAvailableProperties('seller');
    } else {
        alert('Error al eliminar la propiedad. Verifique el código de confirmación.');
    }
}

export async function showPropertyHistory(propertyId) {
    const transactions = await contract.getTransactions();
    const propertyTransactions = transactions
        .filter(t => t.property_id === propertyId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const container = document.getElementById('transactionsContainer');
    const table = document.createElement('table');
    table.className = 'transactions-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Detalles</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    propertyTransactions.forEach(transaction => {
        const tr = document.createElement('tr');
        const date = new Date(transaction.timestamp).toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        let details = '';
        if (transaction.type === 'REGISTRO') {
            details = `
                <div><strong>Propietario:</strong> ${transaction.owner}</div>
                <div class="property-details">
                    <div>Ubicación: ${transaction.location}</div>
                    <div>Área: ${transaction.area} metros cuadrados</div>
                    <div>Valor: Q${transaction.value}</div>
                </div>
            `;
        } else if (transaction.type === 'TRANSFERENCIA') {
            details = `
                <div><strong>Vendedor:</strong> ${transaction.previousOwner}</div>
                <div><strong>Comprador:</strong> ${transaction.newOwner}</div>
                <div class="property-details">Valor de Venta: Q${transaction.saleValue}</div>
            `;
        }

        tr.innerHTML = `
            <td>${date}</td>
            <td>
                <span class="transaction-type type-${transaction.type.toLowerCase()}">
                    ${transaction.type}
                </span>
            </td>
            <td>${details}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '<h2>Historial de la Propiedad</h2>';
    container.appendChild(table);
}

export function returnToHome() {
    document.getElementById('welcomeScreen').style.display = 'block';
    document.getElementById('sellerContent').style.display = 'none';
    document.getElementById('buyerContent').style.display = 'none';
    document.getElementById('propertyListContainer').innerHTML = '';
    document.getElementById('transactionsContainer').innerHTML = '';
}

export function showModifyPropertyValueModal(propertyId) {
    if (!isSellerAuthenticated) {
        showLoginModal();
        return;
    }
    document.getElementById('modifyPropertyId').value = propertyId;
    document.getElementById('modifyPropertyValueModal').style.display = 'block';
}

export async function handleModifyPropertyValue(event) {
    event.preventDefault();
    if (!isSellerAuthenticated) {
        alert('Solo los vendedores pueden modificar el valor de las propiedades');
        return;
    }

    const propertyId = document.getElementById('modifyPropertyId').value;
    const newValue = Number(document.getElementById('newValue').value);

    const success = await contract.modifyPropertyValue(propertyId, newValue);
    if (success) {
        alert('Valor de la propiedad actualizado exitosamente');
        closeModal('modifyPropertyValueModal');
        document.getElementById('modifyPropertyValueForm').reset();
        showAvailableProperties('seller');
    } else {
        alert('Error: No se pudo modificar el valor de la propiedad');
    }
}
// Make functions globally accessible
window.selectRole = selectRole;
window.showLoginModal = showLoginModal;
window.handleLogin = handleLogin;
window.showRegisterPropertyModal = showRegisterPropertyModal;
window.showAvailableProperties = showAvailableProperties;
window.showMyProperties = showMyProperties;
window.showPropertyHistory = showPropertyHistory;
window.showTransferModal = showTransferModal;
window.showModifyPropertyValueModal = showModifyPropertyValueModal;
window.showDeletePropertyModal = showDeletePropertyModal;
window.handleRegisterProperty = handleRegisterProperty;
window.handleModifyPropertyValue = handleModifyPropertyValue;
window.handleTransferProperty = handleTransferProperty;
window.handleDeleteProperty = handleDeleteProperty;
window.closeModal = closeModal;
window.returnToHome = returnToHome;