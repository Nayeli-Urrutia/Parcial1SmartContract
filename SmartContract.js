// importar las clases
import LinkedList from './LinkedList.js';

class SmartContract {
    constructor() {
        this.transactions = new LinkedList(); // Lista enlazada para almacenar transacciones
        this.balances = {}; // Objeto para rastrear los saldos de los usuarios
    }

    // Función para registrar una transacción
    executeTransaction(sender, receiver, amount) {
        // Validar que el emisor tenga suficientes fondos
        if (!this.balances[sender] || this.balances[sender] < amount) {
            console.log(`Transacción fallida: ${sender} no tiene suficientes fondos.`);
            return false;
        }

        // Actualizar saldos
        this.balances[sender] -= amount;
        this.balances[receiver] = (this.balances[receiver] || 0) + amount;

        // Registrar la transacción en la lista enlazada
        const transactionData = { sender, receiver, amount };
        this.transactions.addTransaction(transactionData);

        console.log(`Transacción exitosa: ${sender} envió ${amount} a ${receiver}.`);
        return true;
    }

    // Función para mostrar todas las transacciones
    showAllTransactions() {
        console.log("Historial de transacciones:");
        this.transactions.displayTransactions();
    }

    // Función para mostrar los saldos actuales
    showBalances() {
        console.log("Saldos actuales:", this.balances);
    }
}

export default SmartContract;