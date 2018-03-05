var Migrations = artifacts.require("./Migrations.sol");

var Ponzy = artifacts.require("./Ponzy.sol");

var Dispatcher = artifacts.require("./Upgradability/Dispatcher.sol");

module.exports = function(deployer) { 
  deployer.deploy(Ponzy, {gas :  1901396 }).then(function() {
    return deployer.deploy(Dispatcher, Ponzy.address, {gas: 332753});
  });;  
};
