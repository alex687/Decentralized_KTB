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

    async rquestPayout(depositIndex, timeoutInMonths) {
        if(timeoutInMonths == undefined){
            $("#payout-deposit-index").val(depositIndex);
            $("#payout").modal();
        }
        else
        {
            let from = await this.client.coinbase();

            this.contract.rquestPayout(depositIndex, timeoutInMonths, {from : from})
        }
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


            $("#payout-form").submit(function(ev){
                let timeoutInMonths = $("#payout-time").val();
                let depositIndex = $("#payout-deposit-index").val();                
                self.rquestPayout(depositIndex, timeoutInMonths);
                $("#payout").modal('hide');
                return false;
            });

            $('#payout-time').slider();
            $("#payout-time").on("slide", function(slideEvt) {
                $("#payout-percentage").text(slideEvt.value * 10 + 50);
                if(slideEvt.value == 0){
                    $("#payout-timeout").text("Now");
                }
                else{
                    $("#payout-timeout").text("After " + slideEvt.value + " Months");
                }
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
        .at("0xf12b5dd4ead5f743c6baa640b0216200e89b60da");

        this.contract = contractInstance;
    }

    async _bindToEvents(){
        let contract = web3.eth.contract(abi).at("0xf12b5dd4ead5f743c6baa640b0216200e89b60da");
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

