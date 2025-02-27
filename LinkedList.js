// Node class to represent each transaction in the linked list with validation
class Node {
    constructor(transaction) {
        // Valida e inicializa un nodo de transacción
        if (!transaction || typeof transaction !== 'object') {
            throw new Error('Datos de transacción inválidos');
        }
        this.transaction = this.validateTransaction(transaction);
        this.next = null;
    }

    validateTransaction(transaction) {
        // Asegura que la transacción tenga todos los campos requeridos
        const requiredFields = ['property_id', 'type', 'timestamp'];
        for (const field of requiredFields) {
            if (!(field in transaction)) {
                throw new Error(`Falta el campo requerido: ${field}`);
            }
        }
        return { ...transaction };
    }
}

// Enhanced LinkedList class to manage transactions with improved functionality
class LinkedList {
    constructor() {
        // Inicializa una lista enlazada vacía
        this.head = null;
        this.tail = null; // Puntero tail añadido para añadir en O(1)
        this.size = 0;
        this.transactionTypes = new Set(['REGISTRO', 'TRANSFERENCIA', 'MODIFICACION_VALOR']);
    }

    // Add a new transaction to the end of the list with validation
    append(transaction) {
        try {
            // Valida el tipo de transacción antes de añadir
            if (!this.transactionTypes.has(transaction.type)) {
                throw new Error(`Tipo de transacción inválido: ${transaction.type}`);
            }

            const newNode = new Node(transaction);
            this.size++;

            if (!this.head) {
                // Si la lista está vacía, establece el nuevo nodo como head y tail
                this.head = newNode;
                this.tail = newNode;
                return true;
            }

            // Añade el nuevo nodo al final de la lista
            this.tail.next = newNode;
            this.tail = newNode;
            return true;
        } catch (error) {
            console.error('Error al añadir la transacción:', error);
            return false;
        }
    }

    // Get all transactions in chronological order with optional filtering
    getTransactions(filters = {}) {
        try {
            const transactions = [];
            let current = this.head;

            while (current) {
                let includeTransaction = true;
                
                // Aplica filtros si los hay
                for (const [key, value] of Object.entries(filters)) {
                    if (current.transaction[key] !== value) {
                        includeTransaction = false;
                        break;
                    }
                }

                if (includeTransaction) {
                    transactions.push(current.transaction);
                }
                current = current.next;
            }

            return transactions;
        } catch (error) {
            console.error('Error al obtener las transacciones:', error);
            return [];
        }
    }

    // Get transactions for a specific property with date range filter
    getPropertyTransactions(propertyId, startDate = null, endDate = null) {
        try {
            if (!propertyId) {
                throw new Error('Se requiere el ID de la propiedad');
            }

            const filters = { property_id: propertyId };
            const transactions = this.getTransactions(filters);

            if (startDate || endDate) {
                return transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.timestamp);
                    if (startDate && transactionDate < new Date(startDate)) return false;
                    if (endDate && transactionDate > new Date(endDate)) return false;
                    return true;
                });
            }

            return transactions;
        } catch (error) {
            console.error('Error al obtener las transacciones de la propiedad:', error);
            return [];
        }
    }

    // Get the size of the list
    getSize() {
        return this.size;
    }

    // Clear all transactions with validation
    clear() {
        try {
            // Restablece la lista a un estado vacío
            this.head = null;
            this.tail = null;
            this.size = 0;
            return true;
        } catch (error) {
            console.error('Error al borrar las transacciones:', error);
            return false;
        }
    }

    // Find the latest transaction for a property
    getLatestPropertyTransaction(propertyId) {
        try {
            const transactions = this.getPropertyTransactions(propertyId);
            return transactions.length > 0 ? 
                transactions.reduce((latest, current) => 
                    new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
                ) : null;
        } catch (error) {
            console.error('Error al obtener la última transacción de la propiedad:', error);
            return null;
        }
    }
}

export default LinkedList;