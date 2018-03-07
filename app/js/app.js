`strict_mode`

const promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );
    

class App {
    constructor()
    {
        this._tryAddInjectedWeb3();
        if(this.client != undefined) {
            this._loadContract();
            this._bindToEvents();
          
            if(this.client.eth.coinbase != null ){    
                this.loadIndexPage();
            }
            else {
                this.loadMetamaskNotLoggedIn();
            }

            this._listenForAccountChanges();
        }

        if(this.client == undefined) {
            this.loadMetamaskNotFound();
        }
    }

    async addDeposit(amount) {
        let value = Eth.toWei(amount, 'ether');

        await promisify(a => this.contract.addDeposit({ value: value}, a));
    }

    async rquestPayout(depositIndex, timeoutInMonths) {
        if(timeoutInMonths == undefined){
            $("#payout-deposit-index").val(depositIndex);
            $("#payout").modal();
        }
        else
        {
            await promisify(a => this.contract.rquestPayout(depositIndex, timeoutInMonths, a));
        }
    }

    async widthrawMoney(payoutIndex){
        await promisify(a => this.contract.widthraw(payoutIndex, a));
    }

    async loadIndexPage(){
        let payoutsCount = (await promisify(a => this.contract.getRequestedPayoutsCount(a))).toNumber();
        let payouts = [];
        for(let i=0; i<payoutsCount; i++){           
            let payout = await promisify(a => this.contract.getRequestedPayoutAtIndex(i, a));
            let timeout = new Date(payout[1].toNumber() * 1000);
            
            payouts.push({
                 depositIndex : payout[0].toString(),
                 timeout : timeout,
                 payoutPercentage: payout[2].toNumber(),
                 index: i,
                 canWidthraw : timeout.getTime() <  new Date().getTime()
             });
        }

       let depositCount =  (await promisify(a => this.contract.getDepositsCount(a))).toNumber();
       let deposits = [];
       for(let i=0; i<depositCount; i++){
           let deposit = await promisify(a => this.contract.getDepositAtIndex(i, a));
           let payout = payouts.find(p => p.depositIndex == i);
           let timeDeposited =  new Date(deposit[1].toNumber() * 1000);
           let interest = this._calculateInterest(web3.fromWei(deposit[0].toString(), 'ether'), timeDeposited);

           deposits.push({
                amount : web3.fromWei(deposit[0].toString(), 'ether'),
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

    loadMetamaskNotLoggedIn(){
        $.get('./templates/metamask_not_logged_in.html', function (template) {
            var output = Mustache.render(template);
            $("#template").html(output);
        });
    }

    loadMetamaskNotFound(){
        $.get('./templates/metamask_not_found.html', function (template) {
            var output = Mustache.render(template);
            $("#template").html(output);
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

            this.client = web3;

            return true;
        }

        return false;
    }
    
    _loadContract() {
        let contractInstance =  web3.eth.contract(abi).at("0x03fBE06C3688AA6e87311f4a3e73EC9d2288f58D");

        this.contract = contractInstance;
    }

    async _bindToEvents(){
        let addedDeposit = this.contract.AddDeposit();
        addedDeposit.watch(async (e, r) => {
            if(!e){
                let coinbase = this.client.eth.coinbase;
                if(r.args.owner == coinbase){
                    this.loadIndexPage();
                }
            }
        });

        let requestedPayout = this.contract.RequestPayout();
        requestedPayout.watch(async (e, r) => {
            if(!e){
                let coinbase = this.client.eth.coinbase;
                if(r.args.owner == coinbase){
                    this.loadIndexPage();
                }
            }
        })

        let widthraw = this.contract.Widthraw();
        widthraw.watch(async (e, r) => {
            if(!e){
                let coinbase = this.client.eth.coinbase;
                if(r.args.owner == coinbase){
                    this.loadIndexPage();
                }
            }
        })
    }

    _listenForAccountChanges(){
        let account = this.client.eth.accounts[0];
        let self = this;
        let accountInterval = setInterval(function() {
            if (self.client.eth.accounts[0] !== account) {
                account = self.client.eth.accounts[0];
                if(account != null ){    
                    self.loadIndexPage();
                }
                else {
                    self.loadMetamaskNotLoggedIn();
                }
            }
        }, 100);
    }
}

var app = null;
window.addEventListener('load', () => {
    app = new App();
})

