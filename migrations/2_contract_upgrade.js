var Migrations = artifacts.require("./Migrations.sol");

var Ponzy = artifacts.require("./Ponzy.sol");

var Dispatcher = artifacts.require("./Dispatcher.sol");

module.exports = function(deployer) {
  deployer.deploy(Ponzy).then(function() {
    let addr = Ponzy.address;
    console.log(addr);
    let ponzy = Ponzy.at("0x345ca3e014aaf5dca488057592ee47305d9b3e10");
    console.log(ponzy.address);

    console.log(ponzy.owner());
     ponzy.upgrade(addr);
  });;  
};
