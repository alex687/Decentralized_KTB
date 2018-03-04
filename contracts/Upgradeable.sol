pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Upgradeable is Ownable {
    address public target;
   
    event EventUpgrade(address target, address admin);

    function upgrade(address _target) onlyOwner public {
        verifyTargetState(_target);
        verifyState(_target);
        target = _target;
        EventUpgrade(_target, msg.sender);
    }

    function verifyTargetState(address testTarget) private {
        require(address(delegateGet(testTarget, "owner()")) == owner);
        require(address(delegateGet(testTarget, "target()")) == target);       
    }

    function verifyState(address testTarget) internal {

    }

    function delegateGet(address testTarget, string signature) internal returns (bytes32 result) {
        bytes4 targetCall = bytes4(keccak256(signature));
        assembly {
            let free := mload(0x40)
            mstore(free, targetCall)
            let retVal := delegatecall(gas, testTarget, free, 4, free, 32)
            result := mload(free)
        }
    }
}
