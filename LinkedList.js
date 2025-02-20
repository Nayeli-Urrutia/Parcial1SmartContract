//importar las clases
import Node from './Node.js';

class LinkedList {
    constructor() {
        this.head = null; // Primer nodo de la lista
    }

    // Agregar una nueva transacción al final de la lista
    addTransaction(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
    }

    // Mostrar todas las transacciones
    displayTransactions() {
        let current = this.head;
        while (current) {
            console.log(current.data);
            current = current.next;
        }
    }
}
export default LinkedList;