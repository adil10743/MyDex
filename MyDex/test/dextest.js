const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link");
const truffleAssert = require('truffle-assertions');

contract("Dex", accounts => {
    //The user must have Eth deposited such that deposited eth .= buy order value
    it( "should throw an error if ETH balance is too low when creating BUY limit order", async () => {
        let dex = Dex.deployed();
        let link = Link.deployed();
        await truffleAssert.reverts(
            dex.createLimitOrder(BUY, web.utils.fromUt8("LINK"), 10, 1)
        )
        dex.depositEth({vale:10})
        await truffleAssert.passes(
            dex.createLimitOrder(BUY,web3.utils.fromUtf8("LINK"), 10, 1)
        )
    })

    //The user must have enough tokens deposited such that token balance >= sell order amount
    it( "should throw an error if token balance is too low when createing SELL limit order", async () => {
        let dex = Dex.deployed();
        let link = Link.deployed();
        await truffleAssert.reverts(
            dex.createLimitOrder(SELL,web3.utils.fromUtf8("LINK"), 10,1)
        )
        await link.approve(dex.address,500);
        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        await dex.deposit(10, web3.utils.fromUtf8("LINK"))
        await truffleAssert.passes(
            dex.createLimitOrder(SELL,web3.utils.fromUtf8("LINK"), 10, 1)
        )
    })

    //The BUY order book should be ordered on price from highest to lowest starting at index 0
    it("The BUY order book should be ordered on priced from highest to lowest starting at index 0", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await dex .depositEth({value:3000});
        await dex.createLimitOrder(BUY, web3.utils.fromUtf8("LINK"), 1, 300);
        await dex.createLimitOrder(BUY, web3.utils.fromUtf8("LINK"), 1, 100);
        await dex.createLimitOrder(BUY, web3.utils.fromUtf8("LINK"), 1, 200);

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), BUY);
        assert(orderbook.length > 0);
        console.log(orderbook);
        for (let i = 0; i < orderbook.length -1; i++) {
            assert(orderbook[i].price >= orderbook[i+1].price, "not right order in buy book")
        }
    })

    //The SELL order book should be ordered from lowest to highest starting at index 0
    it("The SELL order book should be ordered on priced from highest to lowest starting at index 0", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await link.approve(dex.address, 500);
        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        await dex.deposit(500, web3.utils.fromUtf8("LINK"))
        await dex.createLimitOrder(SELL, web3.utils.fromUtf8("LINK"), 1, 300);
        await dex.createLimitOrder(SELL, web3.utils.fromUtf8("LINK"), 1, 100);
        await dex.createLimitOrder(SELL, web3.utils.fromUtf8("LINK"), 1, 200);

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), SELL);
        assert(orderbook.length > 0);
        console.log(orderbook);
        for (let i = 0; i < orderbook.length -1; i++) {
            assert(orderbook[i].price <= orderbook[i+1].price, "not right order in sell  book")
        }
    })
})