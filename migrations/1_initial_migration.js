var Migrations = artifacts.require("./Migrations.sol");

var Ponzy = artifacts.require("./Ponzy.sol");

var Dispatcher = artifacts.require("./Upgradability/Dispatcher.sol");

module.exports = function(deployer) { 
  deployer.deploy(Ponzy).then(function() {
    console.log(Dispatcher);

    return deployer.deploy(Dispatcher, Ponzy.address);
  });;  
};
