// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import dicegame_artifacts from '../../build/contracts/DiceGame.json';

// DiceGame is our usable abstraction, which we'll use through the code below.
var DiceGame = contract(dicegame_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var owner;
var bidAmount;

window.App = {
    start: function () {
        var self = this;
        bidAmount = web3.toWei(1, 'ether');

        // Bootstrap the DiceGame abstraction for Use.
        DiceGame.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            owner = accounts[0];
            account = accounts[1];

            document.getElementById('address').value = account;
            self.tipOff();
            self.getBalance();
            self.getMoneyInTheBank();
        });


        // Events
        DiceGame.deployed().then(function (instance) {
            // Or pass a callback to start watching immediately
            var events = instance.allEvents({}, function (error, log) {
                if (error) {
                    console.log("Error: " + error);
                } else {
                    if (log.event == 'Lose') {
                        self.setStatus("Too bad. Please try again");
                    }

                    if (log.event == 'Win') {
                        self.setStatus("You guessed RIGHT. More money in the BANK!");
                    }
                }
            });
        });
    },

    tipOff: function () {
        DiceGame.deployed().then(function (instance) {
            var balance = web3.eth.getBalance(instance.address).toNumber();
            if (balance < web3.toWei(2, 'ether')) {
                instance.send(web3.toWei(5, 'ether'), {from: owner});
            }
        });
    },

    getMoneyInTheBank: function () {
        DiceGame.deployed().then(function (instance) {
            var balance = web3.eth.getBalance(instance.address).toNumber();
            document.getElementById('bank').innerHTML = balance;
        });
    },

    setStatus: function (message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
    },

    guessNumber: function () {
        var self = this;

        var amount = parseInt(document.getElementById("amount").value);

        this.setStatus("Initiating transaction... (please wait)");

        var dicegame;
        DiceGame.deployed().then(function (instance) {
            dicegame = instance;
            return dicegame.guessNumber(amount, {from: document.getElementById('address').value, value: bidAmount});
        }).then(function () {
            self.getMoneyInTheBank();
            self.getBalance();
        }).catch(function (e) {
            console.log(e);
            self.setStatus("Error sending guess. See logs");
        });
    },

    getBalance: function () {
        var account2InitialBalance = web3.eth.getBalance(document.getElementById('address').value).toNumber();
        document.getElementById("balance").innerHTML = account2InitialBalance;
        return account2InitialBalance;
    }
};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 DiceGame, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});
