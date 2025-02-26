class SmartContract {
    constructor() {
        this.properties = [
            { id: '001', owner: 'Nayeli_Urrutia', location: 'Ciudad de Guatemala', area: 150, value: 100000, status: 'available', lastModified: new Date().toISOString() },
            { id: '002', owner: 'Juan Perez', location: 'Antigua Guatemala', area: 200, value: 150000, status: 'available', lastModified: new Date().toISOString() },
            { id: '003', owner: 'Maria Lopez', location: 'Quetzaltenango', area: 250, value: 200000, status: 'available', lastModified: new Date().toISOString() }
        ];
        this.transactions = [];
        this.propertyValidationRules = {
            id: (id) => typeof id === 'string' && id.length > 0,
            owner: (owner) => typeof owner === 'string' && owner.length > 0,
            location: (location) => typeof location === 'string' && location.length > 0,
            area: (area) => typeof area === 'number' && area > 0,
            value: (value) => typeof value === 'number' && value > 0
        };
    }

    // Validate property data against rules
    validatePropertyData(property) {
        for (const [field, validator] of Object.entries(this.propertyValidationRules)) {
            if (!validator(property[field])) {
                throw new Error(`Invalid ${field} value`);
            }
        }
        return true;
    }

    // Enhanced function to register a new property with validation
    async registerProperty(propertyId, owner, location, area, value) {
        try {
            // Validate input data
            const propertyData = { id: propertyId, owner, location, area, value };
            this.validatePropertyData(propertyData);

            // Check if property exists
            const existingProperty = this.properties.find(p => p.id === propertyId);
            if (existingProperty) {
                throw new Error('Property already exists');
            }

            // Create new property with timestamp
            const property = { 
                ...propertyData, 
                status: 'available',
                lastModified: new Date().toISOString()
            };
            this.properties.push(property);

            // Record transaction with additional metadata
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
            this.transactions.push(transaction);

            return true;
        } catch (error) {
            console.error('Error registering property:', error);
            return false;
        }
    }

    // Enhanced function to transfer property with validation and history tracking
    async transferProperty(propertyId, currentOwner, newOwner, saleValue) {
        try {
            // Input validation
            if (!propertyId || !currentOwner || !newOwner || typeof saleValue !== 'number' || saleValue <= 0) {
                throw new Error('Invalid transfer parameters');
            }

            // Verify property ownership and status
            const property = this.properties.find(p => p.id === propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            if (property.owner !== currentOwner) {
                throw new Error('Invalid property owner');
            }
            if (property.status !== 'available') {
                throw new Error('Property is not available for transfer');
            }

            // Update property details
            property.owner = newOwner;
            property.status = 'sold';
            property.lastModified = new Date().toISOString();
            property.value = saleValue; // Update property value to sale value

            // Record detailed transaction
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

    // Enhanced function to modify property value with validation and history tracking
    async modifyPropertyValue(propertyId, newValue) {
        try {
            // Input validation
            if (!propertyId || typeof newValue !== 'number' || newValue <= 0) {
                throw new Error('Invalid modification parameters');
            }

            // Find and validate property
            const property = this.properties.find(p => p.id === propertyId);
            if (!property) {
                throw new Error('Property not found');
            }

            const oldValue = property.value;
            if (newValue === oldValue) {
                throw new Error('New value must be different from current value');
            }

            // Update property
            property.value = newValue;
            property.lastModified = new Date().toISOString();

            // Record detailed transaction
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
            console.error('Error modifying property value:', error);
            return false;
        }
    }
}

export default SmartContract;