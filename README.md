## Ethereum Dicegame 

### Install

Install [testrpc](https://github.com/ethereumjs/testrpc)

```
$ npm install -g ethereumjs-testrpc
```

Install [truffle](https://github.com/consensys/truffle):

```
$ npm install -g truffle 
```

Install [webpack](https://webpack.github.io/):
```
$ npm install -g webpack
```

(OPTIONAL - this takes a while and is not necessary for the rest of the tutorial)       
Check if you have [solc](https://github.com/ethereum/go-ethereum/wiki/Contract-Tutorial#using-an-online-compiler):      
```
$ which solc
$ brew tap ethereum/ethereum
$ brew install solidity
```

### Run

Run testrpc in one console window:

```
$ testrpc
```
In another console window run truffle from project root directory:

```
$ truffle compile
$ truffle migrate
$ truffle test
$ npm run dev
$ OR: truffle serve // server at localhost:8080
```
