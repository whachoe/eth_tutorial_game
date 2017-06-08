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

If you don't have solc you can get it [here](https://github.com/ethereum/go-ethereum/wiki/Contract-Tutorial#using-an-online-compiler)

Install [webpack](https://webpack.github.io/):
```
$ npm install -g webpack
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
$ truffle serve // server at localhost:8080
```
