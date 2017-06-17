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
var ourInstance;
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

        if (account)
            document.getElementById('address').value = account;

        document.getElementById('address').addEventListener('change', function (event) {
            account = document.getElementById('address').value;
            self.getBalance();
        });

        // Make new contract and hook in the event-listeners
        DiceGame.deployed().then((instance) => {
            ourInstance = instance;
            instance.owner.call().then ((error, result) => {
                owner = result;
            }).then(function () {
                instance.Win({}, {fromBlock:'latest', toBlock:'latest'}).watch((error, log) => {
                    console.log(error, log);
                    self.setStatus("You guessed RIGHT. More money in the BANK!");
                });

                instance.Lose({}, {fromBlock:'latest', toBlock:'latest'}).watch(function (error, log) {
                    console.log(error, log);
                    self.setStatus("Too bad. Please try again");
                });

                self.getMoneyInTheBank();
                self.getBalance();
            });
        });
    },

    // // Send money from the owner to the contract.
    // // This logic should be sitting in a contract and not in the frontend. But #famouslylazyjo is still a thing
    // tipOff: function () {
    //     web3.eth.getBalance(ourInstance.address, function (error, balance) {
    //         if (balance.toNumber() < web3.toWei(2, 'ether')) {
    //             ourInstance.send(web3.toWei(5, "ether")).then(function (result) {
    //             });
    //         }
    //     });
    // },

// Let's see how many money the contract has and print it
    getMoneyInTheBank: function () {
        web3.eth.getBalance(ourInstance.address, function (error, balance) {
            console.log(error, balance);
            document.getElementById('bank').innerHTML = balance.toNumber();
            document.getElementById('bankEth').innerHTML = web3.fromWei(balance, 'ether');
        });
    },

// Print message to screen after spinning the wheel
    setStatus: function (message) {
        var status = document.getElementById("status");
        status.innerHTML = message;
    },

// Call the contract with a certain number
    guessNumber: function (wheelNumber) {
        var self = this;

        this.setStatus("Initiating transaction... (please wait)");

        ourInstance.guessNumber(wheelNumber, {
            from: document.getElementById('address').value,
            value: bidAmount
        }).then(function () {
            self.getMoneyInTheBank();
            self.getBalance();
        }).catch(function (e) {
            console.log(e);
            self.setStatus("Error sending guess. See logs");
        });
    },

    getBalance: function () {
        web3.eth.getBalance(document.getElementById('address').value, function (error, balance) {

            document.getElementById("balance").innerHTML = balance.toNumber();
            document.getElementById('balanceEth').innerHTML = web3.fromWei(balance.toNumber(), 'ether');

            return balance;
        });
    }
};

// Load the correct Web3 instance: Either locally (tesrpc) or through the Mist/Metamask browser plugin
window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 ETH, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);

        account = "";

        App.start();
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

        // Use some default accounts
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

            // Set up a default from-address when sending money directly into the contract (this is needed in self.tipOff)
            DiceGame.defaults({from: owner});

            App.start();
        });
    }
});