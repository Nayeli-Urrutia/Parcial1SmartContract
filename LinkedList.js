// Node class to represent each transaction in the linked list with validation
class Node {
    constructor(transaction) {
        if (!transaction || typeof transaction !== 'object') {
            throw new Error('Invalid transaction data');
        }
        this.transaction = this.validateTransaction(transaction);
        this.next = null;
    }

    validateTransaction(transaction) {
        const requiredFields = ['property_id', 'type', 'timestamp'];
        for (const field of requiredFields) {
            if (!(field in transaction)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        return { ...transaction };
    }
}

// Enhanced LinkedList class to manage transactions with improved functionality
class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null; // Added tail pointer for O(1) append
        this.size = 0;
        this.transactionTypes = new Set(['REGISTRO', 'TRANSFERENCIA', 'MODIFICACION_VALOR']);
    }

    // Add a new transaction to the end of the list with validation
    append(transaction) {
        try {
            if (!this.transactionTypes.has(transaction.type)) {
                throw new Error(`Invalid transaction type: ${transaction.type}`);
            }

            const newNode = new Node(transaction);
            this.size++;

            if (!this.head) {
                this.head = newNode;
                this.tail = newNode;
                return true;
            }

            this.tail.next = newNode;
            this.tail = newNode;
            return true;
        } catch (error) {
            console.error('Error appending transaction:', error);
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
                
                // Apply filters if any
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
            console.error('Error getting transactions:', error);
            return [];
        }
    }

    // Get transactions for a specific property with date range filter
    getPropertyTransactions(propertyId, startDate = null, endDate = null) {
        try {
            if (!propertyId) {
                throw new Error('Property ID is required');
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
            console.error('Error getting property transactions:', error);
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
            this.head = null;
            this.tail = null;
            this.size = 0;
            return true;
        } catch (error) {
            console.error('Error clearing transactions:', error);
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
            console.error('Error getting latest property transaction:', error);
            return null;
        }
    }
}

export default LinkedList;