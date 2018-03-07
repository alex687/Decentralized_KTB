var config = require('./config.js');
var HDWalletProvider = require("truffle-hdwallet-provider");
module.exports = {
    networks: {
			development: {
				host: "127.0.0.1",
				port: 8545,
				network_id: "*" // Match any network id
			},
			ropsten: {
				provider: new HDWalletProvider(config.mnemonic, `https://ropsten.infura.io/${config.infura_apikey}`),
				network_id: 3,
				gas: 3821975
			}
	}
};


