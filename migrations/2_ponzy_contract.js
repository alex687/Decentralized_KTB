let Ponzy = artifacts.require("./Ponzy.sol");
let Dispatcher = artifacts.require("./Upgradability/Dispatcher.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Ponzy, {gas :  1901396 });
    await deployer.deploy(Dispatcher, Ponzy.address, {gas: 332753});
};
