//Import library for hashing our object data
const SHA256 = require('crypto-js/sha256');
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction{
    constructor(fromAddress,toAddress,amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    //Return hash of the transaction
    //We sign the hash of our transaction and not the content of the transaction
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    //Expect private and public key pair,singingKey is the object from elliptic library
    signTransaction(signingKey){
        //Check if public key equals the fromAddress
        //Can spend coins from the wallets that we have the private key for
        //Because private key is linked to the public key,fromAddress has to equal public key
        if(signingKey.getPublic("hex")!==this.fromAddress){
            throw new Error("You cannot sign transactions for other wallets");
        }
        //create hash of our transaction
        const hashTx = this.calculateHash();
        //Create signature and sign hash of our transaction
        const sig = signingKey.sign(hashTx,"base64");
        //Store the signature created into the transaction
        this.signature = sig.toDER("hex");
    }
    //Verifies if our transaction has been correctly signed
    isValid(){
        //This criteria for mining reward
        if(this.fromAddress===null){
            return true;
        }
        //If there is no signature or if the signature is empty
        if(!this.signature||this.signature.length===0){
            throw new Error("No signature in this transaction");
        }
        //Incase transaction has a signature, we need to verify that the transaction was signed with the correct key
        //Create a new publickey object from the fromAddress,because fromAddress is a publicKey
        const publicKey = ec.keyFromPublic(this.fromAddress,"hex");
        //Verify that the hash of this block has been signed by the signature
        //this.calculateHash() gives hash of transaction
        return publicKey.verify(this.calculateHash(),this.signature);

    }
}


//An object of one Block class consists of block info
class Block{
    constructor(timestamp,transactions,previousHash=''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    //Block also contains its own hash and hash of previous block
    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions)+this.nonce).toString();
        
    }
    //Nonce value of hash function changes until substring of hash is equal to array of zeros
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty)!==Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();            
        }
        console.log("BLOCK MINED:"+this.hash);
    }
    //Verify all the transaction in the current block
    hashValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

//Blockchain contains chain of Block objects and difficulty level of mining
class Blockchain{
    //When a Blockchain object is created, an initial Block is also created 
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransaction = [];
        this.miningReward = 100;
    }
    //Method is only called when the a BlockChain object is created
    createGenesisBlock(){
        return new Block("01/02/2000","","0")
    }

    //Return the last Block in the Blockchain
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }
    //Adds a Block to Blockchain after mining
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock);
    }

    myPendingTransaction(miningRewardAddress){
        let block = new Block(Date.now(),this.pendingTransaction);
        block.mineBlock(this.difficulty);
        console.log("Block Successfully Mined!");
        this.addBlock(block);
        //this.chain.push(block);
        this.pendingTransaction = [];
        this.pendingTransaction.push(new Transaction(null,miningRewardAddress,this.miningReward));
    }

    addTransaction(transaction){
        //from and to address must be filled in
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include from and to address");
        }
        //Transaction must be valid
        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transaction to chain");
        }
        this.pendingTransaction.push(transaction);
        //console.log(this.pendingTransaction.length);
    }

    getBalanceOfAddress(addressOfMiner){
        let balance = 0;
        //console.log("How many blocks:",this.chain.length);
        for(const block of this.chain){
            //console.log("How many transactions:",block.transactions[0].toAddress);
            for(const trans of block.transactions){
                if(trans.fromAddress===addressOfMiner){
                    balance -=trans.amount;
                    //console.log("Balance is :",balance);
                }
                if(trans.toAddress===addressOfMiner){
                    balance +=trans.amount;
                    
                }
                //console.log("trans.toAddress is :",trans.toAddress);
            }
        }
        return balance;
    }

    //Shows that the block can not be manipulated
    //Verifies that the hashes are correct and each block links to previous block
    isChainValid(){
        for(let i=1;i<this.chain.length;i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            //Verifies that the transaction in the current block are valid
            if(!currentBlock.hashValidTransactions()){
                //Blockchain in invalid state
                return false;
            }

            //Chain is false if current and recalculated Hash donot match
            if(currentBlock.hash!==currentBlock.calculateHash()){
                //Blockchain in invalid state
                return false;
            }
            //Chain is false if previousHash of current block does not match with hash of previousBlock
            if(currentBlock.previousHash!==previousBlock.hash){
                //Blockchain in invalid state 
                return false;
            }
        }    
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;

/*
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