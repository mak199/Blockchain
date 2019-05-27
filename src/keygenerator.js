//this library allows us to generate public and private key
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

//Generate Keypair
const key = ec.genKeyPair();
//Extract public and private key in hex format
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

console.log();
console.log("Private key:",privateKey);

console.log();
console.log("Public key:",publicKey);
