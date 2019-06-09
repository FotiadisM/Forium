const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transaction, previousHash = '') {
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    constructor() {
        this.chain = [
            this.createGenesisBlock()
        ];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions[0], this.chain[this.chain.length-1].hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);

        this.pendingTransactions.shift();
        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward));
    }

    createTransaction(Transaction) {
        this.pendingTransactions.push(Transaction);
    }

    getBalanceAdress(address) {
        let balance = 0;

        for(let block of this.chain) {
            if(block.transaction.fromAddress === address) {
                balance -= block.transaction.amount;
            }
            if(block.transaction.toAddress === address) {
                balance += block.transaction.amount;
            }
        }

        return balance;
    }

    isChainValid() {
        for(let i=1; i < this.chain.length; i++) {
            if(this.chain[i].hash !== this.chain[i].calculateHash()) {
                return false;
            }
            if(this.chain[i].previousHash !== this.chain[i-1].hash) {
                return false;
            }
            return true;
        }
    }
}

let forium = new Blockchain();
forium.createTransaction(new Transaction('adr1', 'adr2', 100));
forium.createTransaction(new Transaction('adr2', 'adr1', 50));
console.log(forium);

forium.minePendingTransactions('egw');
console.log(forium);
console.log('Balance of adr1: ' + forium.getBalanceAdress('adr1'));
console.log('Balance of adr2: ' + forium.getBalanceAdress('adr2'));
console.log('Balance of egw: ' + forium.getBalanceAdress('egw'));

forium.minePendingTransactions('egw');
console.log(forium);
console.log('Balance of adr1: ' + forium.getBalanceAdress('adr1'));
console.log('Balance of adr2: ' + forium.getBalanceAdress('adr2'));
console.log('Balance of egw: ' + forium.getBalanceAdress('egw'));

forium.minePendingTransactions('egw');
console.log(forium);
console.log('Balance of adr1: ' + forium.getBalanceAdress('adr1'));
console.log('Balance of adr2: ' + forium.getBalanceAdress('adr2'));
console.log('Balance of egw: ' + forium.getBalanceAdress('egw'));