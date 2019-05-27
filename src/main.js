const {Blockchain,Transaction} = require("./blockchain"); 
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate("38fdb04fa49de646bef9a56255879c386e6fd186c9b8bd1306aeb873d7c1a3f3")
const mywalletAddress = myKey.getPublic("hex");

let savjee = new Blockchain();

const tx1 = new Transaction(mywalletAddress,"public key goes here",10);
tx1.signTransaction(myKey);
savjee.addTransaction(tx1);

console.log("\nStarting the miner...");
savjee.myPendingTransaction(mywalletAddress);
console.log("\nBalance of whateverAddress is:",savjee.getBalanceOfAddress(mywalletAddress));

console.log("\nStarting the miner again...");
savjee.myPendingTransaction(mywalletAddress);
console.log("\nBalance of whateverAddress is:",savjee.getBalanceOfAddress(mywalletAddress));

console.log("Is chain valid?",savjee.isChainValid());

savjee.chain[1].transactions[0].amount = 1;

console.log("Is chain valid?",savjee.isChainValid());

console.log(savjee.chain.length);
console.log(savjee.chain[0].hash);
console.log(savjee.chain[1].previousHash);
console.log(savjee.chain[1].hash);
console.log(savjee.chain[2].previousHash);

/*
//savjee.createTransaction(new Transaction("address1","address2",100));
//savjee.createTransaction(new Transaction("address2","address1",50));
console.log("\nStarting the miner again...");
savjee.myPendingTransaction("whatEverAddress");
console.log("\nBalance of whateverAddress is:",savjee.getBalanceOfAddress("whatEverAddress"));

console.log("\nBalance of Address1 is:",savjee.getBalanceOfAddress("address1"));
console.log("\nBalance of Address2 is:",savjee.getBalanceOfAddress("address2"));

console.log("Mining block 1...");
savjee.addBlock(new Block(1,"10/07/2017",{amount:4}));
console.log("Mining block 2...");
savjee.addBlock(new Block(2,"12/07/2017",{amount:10}));

console.log("Is blockchain valid?" + savjee.isChainValid());

savjee.chain[1].data = {amount:100};
savjee.chain[1].hash = savjee.chain[1].calculateHash();
console.log("Is blockchain valid?" + savjee.isChainValid());
console.log(JSON.stringify(savjee,null,4));
*/