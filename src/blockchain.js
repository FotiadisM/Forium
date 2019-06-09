const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.signature = '';
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transaction from other wallets!');
        }
        const transactionHash = this.calculateHash();
        const signature = signingKey.sign(transactionHash, 'base64');
        this.signature = signature.toDER('hex');
    }

    isValid() {
        if(this.fromAddress === null) {
            return true;
        }
        if(!this.signature || this.signature.length === 0) {
            throw new Error('Transaction has no signature');
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex'); 
        return publicKey.verify(this.calculateHash(), this.signature);
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

    hasValidTransaction() {
        if(!this.transaction.isValid()) {
            return false;
        }
        return true;
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

    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress || !transaction.amount) {
            throw new Error('Transaction must include from and to address and an amount');
        }
        if(!transaction.isValid()) {
            throw new Error('Transaction is invalid');
        }
        this.pendingTransactions.push(transaction);
    }

    getBalanceAddress(address) {
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
            if(!this.chain[i].hasValidTransaction()) {
                return false;
            }
            return true;
        }
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;