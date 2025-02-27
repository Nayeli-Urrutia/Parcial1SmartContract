import PropertySignature from './PropertySignature.js';

// Clase SmartContract para gestionar propiedades y transacciones
class SmartContract {
    constructor() {
        // Inicializa la clase PropertySignature para manejar firmas digitales
        this.propertySignature = new PropertySignature();
        // Lista de propiedades iniciales
        this.properties = [
            { id: '001', owner: 'Nayeli_Urrutia', location: 'Ciudad de Guatemala', area: 150, value: 100000, status: 'available', lastModified: new Date().toISOString() },
            { id: '002', owner: 'Juan Perez', location: 'Antigua Guatemala', area: 200, value: 150000, status: 'available', lastModified: new Date().toISOString() },
            { id: '003', owner: 'Maria Lopez', location: 'Quetzaltenango', area: 250, value: 200000, status: 'available', lastModified: new Date().toISOString() }
        ];
        // Lista de transacciones
        this.transactions = [];
        // Reglas de validación para las propiedades
        this.propertyValidationRules = {
            id: (id) => typeof id === 'string' && id.length > 0,
            owner: (owner) => typeof owner === 'string' && owner.length > 0,
            location: (location) => typeof location === 'string' && location.length > 0,
            area: (area) => typeof area === 'number' && area > 0,
            value: (value) => typeof value === 'number' && value > 0
        };
    }

    // Valida los datos de la propiedad según las reglas
    validatePropertyData(property) {
        for (const [field, validator] of Object.entries(this.propertyValidationRules)) {
            if (!validator(property[field])) {
                throw new Error(`Valor de ${field} inválido`);
            }
        }
        return true;
    }

    // Función mejorada para registrar una nueva propiedad con validación
    async registerProperty(propertyId, owner, location, area, value) {
        try {
            // Valida los datos de entrada
            const propertyData = { id: propertyId, owner, location, area, value };
            this.validatePropertyData(propertyData);

            // Verifica si la propiedad ya existe
            const existingProperty = this.properties.find(p => p.id === propertyId);
            if (existingProperty) {
                throw new Error('La propiedad ya existe');
            }

            // Crea una nueva propiedad con marca de tiempo
            const property = { 
                ...propertyData, 
                status: 'available',
                lastModified: new Date().toISOString()
            };
            this.properties.push(property);

            // Registra la transacción con metadatos adicionales y firma
            const transaction = {
                property_id: propertyId,
                type: 'REGISTRO',
                owner,
                location,
                area,
                value,
                timestamp: new Date().toISOString(),
                metadata: {
                    registrationDate: new Date().toISOString(),
                    initialValue: value
                }
            };
            
            // Genera y almacena la firma digital para la transacción
            const signature = this.propertySignature.generateSignature(propertyId, transaction, 'private_key_' + propertyId);
            transaction.signature = signature;
            this.transactions.push(transaction);

            return true;
        } catch (error) {
            console.error('Error al registrar la propiedad:', error);
            return false;
        }
    }

    // Función mejorada para transferir propiedad con validación y seguimiento de historial
    async transferProperty(propertyId, currentOwner, newOwner, saleValue) {
        try {
            // Validación de entrada
            if (!propertyId || !currentOwner || !newOwner || typeof saleValue !== 'number' || saleValue <= 0) {
                throw new Error('Parámetros de transferencia inválidos');
            }

            // Verifica la propiedad y el estado de propiedad
            const property = this.properties.find(p => p.id === propertyId);
            if (!property) {
                throw new Error('Propiedad no encontrada');
            }
            if (property.owner !== currentOwner) {
                throw new Error('Propietario de la propiedad inválido');
            }
            if (property.status !== 'available') {
                throw new Error('La propiedad no está disponible para transferencia');
            }

            // Actualiza los detalles de la propiedad
            property.owner = newOwner;
            property.status = 'sold';
            property.lastModified = new Date().toISOString();
            property.value = saleValue; // Actualiza el valor de la propiedad al valor de venta

            // Registra la transacción detallada con firma
            const transaction = {
                property_id: propertyId,
                type: 'TRANSFERENCIA',
                previousOwner: currentOwner,
                newOwner,
                saleValue,
                timestamp: new Date().toISOString(),
                metadata: {
                    transferDate: new Date().toISOString(),
                    previousValue: property.value,
                    valueChange: saleValue - property.value
                }
            };
            
            // Genera y almacena la firma digital para la transferencia
            const signature = this.propertySignature.generateSignature(propertyId, transaction, 'private_key_' + propertyId);
            transaction.signature = signature;
            this.transactions.push(transaction);

            return true;
        } catch (error) {
            console.error('Error al transferir la propiedad:', error);
            return false;
        }
    }

    // Función para obtener todas las propiedades
    async getProperties() {
        try {
            return this.properties;
        } catch (error) {
            console.error('Error al obtener las propiedades:', error);
            return [];
        }
    }

    // Función para obtener todas las transacciones
    async getTransactions() {
        try {
            return this.transactions.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
        } catch (error) {
            console.error('Error al obtener las transacciones:', error);
            return [];
        }
    }

    // Función mejorada para modificar el valor de la propiedad con validación y seguimiento de historial
    async modifyPropertyValue(propertyId, newValue) {
        try {
            // Validación de entrada
            if (!propertyId || typeof newValue !== 'number' || newValue <= 0) {
                throw new Error('Parámetros de modificación inválidos');
            }

            // Encuentra y valida la propiedad
            const property = this.properties.find(p => p.id === propertyId);
            if (!property) {
                throw new Error('Propiedad no encontrada');
            }

            const oldValue = property.value;
            if (newValue === oldValue) {
                throw new Error('El nuevo valor debe ser diferente del valor actual');
            }

            // Actualiza la propiedad
            property.value = newValue;
            property.lastModified = new Date().toISOString();

            // Registra la transacción detallada
            const transaction = {
                property_id: propertyId,
                type: 'MODIFICACION_VALOR',
                oldValue,
                newValue,
                timestamp: new Date().toISOString(),
                metadata: {
                    modificationDate: new Date().toISOString(),
                    valueChange: newValue - oldValue,
                    changePercentage: ((newValue - oldValue) / oldValue) * 100
                }
            };
            this.transactions.push(transaction);

            return true;
        } catch (error) {
            console.error('Error al modificar el valor de la propiedad:', error);
            return false;
        }
    }

    // Función para eliminar una propiedad con validación de código de confirmación
    async deleteProperty(propertyId, confirmationCode) {
        try {
            // Valida el código de confirmación
            if (confirmationCode !== '1234') {
                throw new Error('Código de confirmación inválido');
            }

            // Encuentra y valida la propiedad
            const propertyIndex = this.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex === -1) {
                throw new Error('Propiedad no encontrada');
            }

            const property = this.properties[propertyIndex];

            // Registra la transacción de eliminación
            const transaction = {
                property_id: propertyId,
                type: 'ELIMINACION',
                deletedProperty: { ...property },
                timestamp: new Date().toISOString(),
                metadata: {
                    deletionDate: new Date().toISOString(),
                    propertyStatus: property.status
                }
            };
            this.transactions.push(transaction);

            // Elimina la propiedad
            this.properties.splice(propertyIndex, 1);

            return true;
        } catch (error) {
            console.error('Error al eliminar la propiedad:', error);
            return false;
        }
    }
}

export default SmartContract;