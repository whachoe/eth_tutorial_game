var DiceGame = artifacts.require("./DiceGame.sol");
var fromWei = web3._extend.utils.fromWei;
var toWei = web3._extend.utils.toWei;

contract('DiceGame', function (accounts) {
    it('Should pay double when winning', function () {
        var ourInstance;
        var account1 = accounts[0];
        var account2 = accounts[1];
        var account2InitialBalance;
        var bidAmount = toWei(1, 'ether');

        return DiceGame.deployed()
            .then(function (instance) {
                ourInstance = instance;

                var initialBalance = web3.eth.getBalance(ourInstance.address).toNumber();
                account2InitialBalance = web3.eth.getBalance(account2).toNumber();

                assert.equal(initialBalance, 0, 'Initial balance should be 0');
                assert.isAtLeast(account2InitialBalance, toWei(1, 'ether'), 'Account2 should have at least 1 ether');
                console.log("Ether in account2: ", fromWei(account2InitialBalance, 'ether'));

                return ourInstance.send(toWei(5, 'ether')); // make sure we have some money in the bank
            }).then(function (result) {
                var initialBalance = web3.eth.getBalance(ourInstance.address).toNumber();
                assert.equal(initialBalance, toWei(5, 'ether'), 'We should have 5 ether in the bank');
                return ourInstance.minimumBet.call();
            })
            .then(function (minimumBet) {
                assert.equal(minimumBet.valueOf(), bidAmount, "Minimumbet should be 1 ether");

                return ourInstance.guessNumber(42, {from: account2, value: bidAmount});
            }).then(function (guessnumber) {
                var newBalance = web3.eth.getBalance(ourInstance.address).toNumber();
                var account2NewBalance = web3.eth.getBalance(account2).toNumber();

                assert.equal(newBalance, toWei(4, 'ether'), 'The bank should have lost 2 ether');

                console.log("Orig/New/Winst: ", account2InitialBalance, account2NewBalance, account2NewBalance - account2InitialBalance);
                console.log("Ether in account2: ", fromWei(account2NewBalance, 'ether'));
                assert.isAbove(account2NewBalance, account2InitialBalance, 'Account2 should have more money now');
                // console.log(guessnumber.logs);
                assert.lengthOf(guessnumber.logs, 1, 'We should have 1 log now');
                assert.equal(guessnumber.logs[0].event, 'Win', 'We should have 1 WIN log');
            });
    });

    it('Should pay less when guessing wrong');
    it('Should pay balance to owner when destroying the contract');
});
