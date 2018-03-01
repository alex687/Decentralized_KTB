pragma solidity ^0.4.18;

//import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
//import "github.com/OpenZeppelin/zeppelin-solidity/contracts/lifecycle/Pausable.sol";


import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import '../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol';


contract Ponzy is Pausable {
    using SafeMath for uint;

    struct Deposit {
        uint index;
        uint amount;
        uint timeDeposited;
    }
    
    struct Payout {
        uint depositIndex;
        uint index;
        uint timeout;
        uint payoutPercentage;
    }
    
    mapping(address => Deposit[]) public userDeposits;
    mapping(address => Payout[]) public userPayouts;
    mapping(address => mapping(uint => uint)) public userDepositPayout;

    function addDeposit(uint timeDeposited) public payable {  
        require(msg.value > 0);      

        Deposit[] storage deposits = userDeposits[msg.sender];
        Deposit memory newDeposit = Deposit(deposits.length, msg.value, timeDeposited);
        deposits.push(newDeposit);
    }

    function getDepositAtIndex(uint index) public view returns(uint, uint) {
        Deposit storage deposit = userDeposits[msg.sender][index];
        return (deposit.amount, deposit.timeDeposited);
    }

    function getDepositsCount() public view returns(uint) {
        return userDeposits[msg.sender].length;
    }
    
    function rquestPayout(uint depositIndex, uint timeoutInMonths) public {
        require(timeoutInMonths <= 5);

        Deposit[] storage deposits = userDeposits[msg.sender];
        require(deposits.length > depositIndex);
        assert(!existsPayoutForDeposit(depositIndex));

        uint timeout = now + timeoutInMonths * 1 seconds;
        uint payoutPercentage = calculatePayoutPercentage(timeoutInMonths);
        Payout memory payout = Payout(depositIndex, userPayouts[msg.sender].length, timeout, payoutPercentage);

        userPayouts[msg.sender].push(payout);
        userDepositPayout[msg.sender][depositIndex] = payout.index;
    }
    
    function getRequestedPayoutAtIndex(uint index) public view returns(uint, uint, uint) {
        Payout storage payout = userPayouts[msg.sender][index];
        return (payout.depositIndex, payout.timeout, payout.payoutPercentage);
    }

    function getRequestedPayoutsCount() public view returns(uint) {
        return userPayouts[msg.sender].length;
    }

    function widthraw (uint payoutIndex) public {
        Payout[] storage payouts = userPayouts[msg.sender];
        require(payouts.length > payoutIndex);

        Payout memory payout = payouts[payoutIndex]; 
        Deposit[] storage deposits = userDeposits[msg.sender];
        assert(deposits.length > payout.depositIndex);

        Deposit memory deposit = deposits[payout.depositIndex];
        uint interest = calculateInterest(deposit.amount, deposit.timeDeposited);

        uint amoutToPay = deposit.amount.add(interest).mul(payout.payoutPercentage).div(100);
        assert(this.balance >= amoutToPay);
        
        deleteDeposit(deposits, payouts, payout.depositIndex);
        deletePayout(payouts, payoutIndex);

        msg.sender.transfer(amoutToPay);
    }   

    function deleteDeposit(Deposit[] storage deposits, Payout[] storage payouts, uint depositIndex) private {     
        uint lastDepositIndex = deposits.length - 1;
        Deposit storage lastDeposit = deposits[lastDepositIndex];

        lastDeposit.index = depositIndex;
        deposits[depositIndex] = lastDeposit;
        deposits.length -= 1;
        
        if (existsPayoutForDeposit(lastDepositIndex)) {
            uint payoutIndex = userDepositPayout[msg.sender][lastDepositIndex];
            userDepositPayout[msg.sender][depositIndex] = payoutIndex;
            payouts[payoutIndex].depositIndex = depositIndex;
            
            delete userDepositPayout[msg.sender][lastDepositIndex];
        }
    }

    function deletePayout(Payout[] storage payouts, uint payoutIndex) private {
        uint lastPayoutIndex = payouts.length - 1;
        Payout storage lastPayout = payouts[lastPayoutIndex];

        lastPayout.index = payoutIndex;
        payouts[payoutIndex] = lastPayout;
        payouts.length -= 1;
    }

    function calculateInterest(uint input, uint timeDeposited) private view returns(uint) {
        uint diffrence = (now.sub(timeDeposited)) / 30 days;
        uint interest = ((input / 100 ) * diffrence);
       
        return interest;
    }

    function existsPayoutForDeposit(uint depositIndex) private view returns(bool) {
         uint payoutIndex = userDepositPayout[msg.sender][depositIndex];
         Payout[] storage payouts = userPayouts[msg.sender];
         
         return payouts.length > payoutIndex && payouts[payoutIndex].depositIndex == depositIndex;
    }

    function calculatePayoutPercentage(uint timeoutInMonths) private pure returns(uint) {
        uint percentage = 50 + (timeoutInMonths * 10);

        return percentage;
    }
}