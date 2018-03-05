var Ponzy = artifacts.require("./Ponzy.sol");
var Dispatcher = artifacts.require("./Dispatcher.sol");

module.exports = function(deployer) {
  deployer.deploy(Ponzy).then(function() {
    let addr = Ponzy.address;
    console.log(addr);
    let ponzy = Ponzy.at("0xf12b5dd4ead5f743c6baa640b0216200e89b60da");
    console.log(ponzy.address);

    console.log(ponzy.owner());
     ponzy.upgrade(addr);
  });
};
