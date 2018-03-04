var Migrations = artifacts.require("./Migrations.sol");

var Ponzy = artifacts.require("./Ponzy.sol");

var Dispatcher = artifacts.require("./Dispatcher.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
 
  deployer.deploy(Ponzy).then(function() {
    return deployer.deploy(Dispatcher, Ponzy.address);
  });;  
};
