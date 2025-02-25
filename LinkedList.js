// Node class to represent each transaction in the linked list
class Node {
    constructor(transaction) {
        this.transaction = transaction;
        this.next = null;
    }
}

// LinkedList class to manage transactions
class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    // Add a new transaction to the end of the list
    append(transaction) {
        const newNode = new Node(transaction);
        this.size++;

        if (!this.head) {
            this.head = newNode;
            return;
        }

        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
    }

    // Get all transactions in chronological order
    getTransactions() {
        const transactions = [];
        let current = this.head;

        while (current) {
            transactions.push(current.transaction);
            current = current.next;
        }

        return transactions;
    }

    // Get transactions for a specific property
    getPropertyTransactions(propertyId) {
        const propertyTransactions = [];
        let current = this.head;

        while (current) {
            if (current.transaction.property_id === propertyId) {
                propertyTransactions.push(current.transaction);
            }
            current = current.next;
        }

        return propertyTransactions;
    }

    // Get the size of the list
    getSize() {
        return this.size;
    }

    // Clear all transactions
    clear() {
        this.head = null;
        this.size = 0;
    }
}

export default LinkedList;