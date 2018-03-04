pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Dispatcher is Ownable {
    address public target;

    function Dispatcher(address _target) public {
        target = _target;
    }

    function() payable public {
        assembly {
            let _target := sload(1)
            calldatacopy(0x0, 0x0, calldatasize)
            let retval := delegatecall(gas, _target, 0x0, calldatasize, 0x0, 0)
            let returnsize := returndatasize
            returndatacopy(0x0, 0x0, returnsize)
            switch retval case 0 {revert(0, 0)} default {return (0, returnsize)}
        }
    }
}
