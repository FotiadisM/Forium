const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { Blockchain, Transaction } = require('./blockchain');

let forium = new Blockchain();

const myKey = ec.genKeyPair()
const publicKey = myKey.getPublic('hex');
// const privateKey = myKey.getPrivate('hex');

const trns1 = new Transaction(publicKey, 'public key here', 10);
trns1.signTransaction(myKey);
forium.addTransaction(trns1); 


console.log(forium);

forium.minePendingTransactions(publicKey);
console.log(forium);
console.log('Balance of me: ' + forium.getBalanceAddress(publicKey));
console.log('Balance of public key here: ' + forium.getBalanceAddress('public key here'));

forium.minePendingTransactions(publicKey);
console.log(forium);
console.log('Balance of me: ' + forium.getBalanceAddress(publicKey));
console.log('Balance of public key here: ' + forium.getBalanceAddress('public key here'));