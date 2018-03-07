var Ponzy = artifacts.require("./Ponzy.sol");
var Dispatcher = artifacts.require("./Dispatcher.sol");

module.exports = function(deployer) {
  deployer.deploy(Ponzy).then(function() {
   
    let addr = Ponzy.address;
    console.log(addr);
   
    let ponzy = Ponzy.at("0x03fBE06C3688AA6e87311f4a3e73EC9d2288f58D");
    console.log(ponzy.address);

    console.log(ponzy.owner());
     ponzy.upgrade(addr);
  }); 
};
