`strict_mode`

class App {
    constructor()
    {
        this._tryAddInjectedWeb3();
        this._loadContract();
        this._bindToEvents();
    }
    
    async addDeposit(amount) {
        let value = Eth.toWei(amount, 'ether');
        let from = await this.client.coinbase();

        this.contract.addDeposit(1516568303, { from: from, value: value});
    }

    async rquestPayout(depositIndex) {
        let timeoutInMonths = 5;
        let from = await this.client.coinbase();

        this.contract.rquestPayout(depositIndex, timeoutInMonths, {from : from})
    }

    async widthrawMoney(payoutIndex){
        let from = await this.client.coinbase();
      
        this.contract.widthraw(payoutIndex, {from : from}).then((t) => this.loadIndexPage());
    }

    async loadIndexPage(){
        let payoutsCount = (await this.contract.getRequestedPayoutsCount())[0].toNumber();
        let payouts = [];
        for(let i=0; i<payoutsCount; i++){

            let payout = await this.contract.getRequestedPayoutAtIndex(i)
            let timeout = new Date(payout[1].toNumber() * 1000);
            payouts.push({
                 depositIndex : payout[0].toString(),
                 timeout : timeout,
                 payoutPercentage: payout[2].toNumber(),
                 index: i,
                 canWidthraw : timeout.getTime() <  new Date().getTime()
             });
        }

     
       let depositCount =  (await this.contract.getDepositsCount())[0].toNumber();
       let deposits = [];
       for(let i=0; i<depositCount; i++){

           let deposit = await this.contract.getDepositAtIndex(i)
           let payout = payouts.find(p => p.depositIndex == i);
           let timeDeposited =  new Date(deposit[1].toNumber() * 1000);
           let interest = this._calculateInterest(Eth.fromWei(deposit[0].toString(), 'ether'), timeDeposited);
           deposits.push({
                amount : Eth.fromWei(deposit[0].toString(), 'ether'),
                timeDeposited : timeDeposited,
                index: i,
                payoutExists: payout != undefined,
                interest: interest
            });
       }
      
       var self = this;
       $.get('./templates/deposit.html', function (template) {
            var output = Mustache.render(template, {deposits: deposits, payouts: payouts});
            $("#template").html(output);
            
            $("#deposit-form").submit(function(ev){
                let amount = $("#amount").val();
                self.addDeposit(amount);
                $("#exampleModal").modal('hide');
                return false;
            });
        });
    }

    _calculateInterest(input, timeDeposited) {
        let diffrence = Math.floor((new Date().getTime() - timeDeposited.getTime()) / (1000 * 3600 * 24 * 30)) 
        let interest = ((input / 100 ) * diffrence);
       
        return interest;
    }

    _tryAddInjectedWeb3() {
        if (typeof web3 !== 'undefined') {
            console.log('Metamask ON.');

            this.client = new Eth(web3.currentProvider);

            return true;
        }

        return false;
    }
    
    _loadContract() {
        let contractInstance =  this.client.contract(abi)
        .at("0x345ca3e014aaf5dca488057592ee47305d9b3e10");

        this.contract = contractInstance;
    }

    async _bindToEvents(){
        let contract = web3.eth.contract(abi).at("0x345ca3e014aaf5dca488057592ee47305d9b3e10");
        let addedDeposit = contract.AddDeposit();
        addedDeposit.watch(async (e, r) => {
            if(!e){
                let coinbase = await this.client.coinbase();
                if(r.args.owner == coinbase){
                    this.loadIndexPage();
                }
            }
        });

        let requestedPayout = contract.RequestPayout();
        requestedPayout.watch(async (e, r) => {
            if(!e){
                let coinbase = await this.client.coinbase();
                if(r.args.owner == coinbase){
                    this.loadIndexPage();
                }
            }
        })

        let widthraw = contract.Widthraw();
        widthraw.watch(async (e, r) => {
            if(!e){
                let coinbase = await this.client.coinbase();
                if(r.args.owner == coinbase){
                    this.loadIndexPage();
                }
            }
        })
    }
}

var app = null;
window.addEventListener('load', () => {
    app = new App();
    app.loadIndexPage();
})

