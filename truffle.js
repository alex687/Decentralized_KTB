var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "sIisNdwjyrwk5qdZJaes";
var mnemonic = "hello system outer female wine under casual above elephant creek guide tooth";
var hdWallet = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey, 0);

console.log(hdWallet.address);

module.exports = {
    networks: {
		development: {
		  host: "127.0.0.1",
		  port: 8545,
		  network_id: "*" // Match any network id
		},
		 ropsten: {
		  provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey),
			network_id: 3,
			gas: 3721975
		}
	}
};


