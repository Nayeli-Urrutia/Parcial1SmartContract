class SmartContract {
    constructor() {
        this.properties = [];
        this.transactions = [];
    }

    // Función para registrar una nueva propiedad
    async registerProperty(propertyId, owner, location, area, value) {
        try {
            // Check if property exists
            const existingProperty = this.properties.find(p => p.id === propertyId);
            if (existingProperty) {
                return false;
            }

            // Create new property
            const property = { id: propertyId, owner, location, area, value, status: 'available' };
            this.properties.push(property);

            // Record transaction
            const transaction = {
                property_id: propertyId,
                type: 'REGISTRO',
                owner,
                location,
                area,
                value,
                timestamp: new Date().toISOString()
            };
            this.transactions.push(transaction);

            return true;
        } catch (error) {
            console.error('Error registering property:', error);
            return false;
        }
    }

    // Función para transferir una propiedad
    async transferProperty(propertyId, currentOwner, newOwner, saleValue) {
        try {
            // Verify property ownership
            const property = this.properties.find(p => p.id === propertyId && p.owner === currentOwner);
            if (!property) {
                return false;
            }

            // Update property owner and status
            property.owner = newOwner;
            property.status = 'sold';

            // Record transaction
            const transaction = {
                property_id: propertyId,
                type: 'TRANSFERENCIA',
                previousOwner: currentOwner,
                newOwner,
                saleValue,
                timestamp: new Date().toISOString()
            };
            this.transactions.push(transaction);

            return true;
        } catch (error) {
            console.error('Error transferring property:', error);
            return false;
        }
    }

    // Función para obtener todas las propiedades
    async getProperties() {
        try {
            return this.properties;
        } catch (error) {
            console.error('Error getting properties:', error);
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
            console.error('Error getting transactions:', error);
            return [];
        }
    }
}

export default SmartContract;