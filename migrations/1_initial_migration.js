var Migrations = artifacts.require("./Migrations.sol");

var Ponzy = artifacts.require("./Ponzy.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Ponzy);  
};
