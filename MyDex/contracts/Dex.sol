pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet {
    using SafeMath for uint256;

    enum buysell {
        BUY,
        SELL
    }

    struct order {
        uint Id;
        address Trader;
        buysell OrderSide;
        bytes32 Ticker;
        uint Amount;
        uint Price;
    }

    uint public nextOrderId = 0;

    mapping(bytes32 => mapping(buysell => order[])) public OrderBook; 

    function getOrderBook(bytes32 ticker, buysell orderSide) view public returns(order[] memory){
        return OrderBook[ticker][orderSide];
    }

    function halfBubbleSortLowToHigh(order[] memory orders) internal pure {
        uint n = orders.length;
        for (uint i = n-1; i >= 1; i--){
            if (orders[i].Price < orders[i-1].Price){
                order memory x = orders[i-1];
                orders[i-1] = orders[i];
                orders[i] = x;
            }
        }

    }
    function halfBubbleSortHighToLow(order[] memory orders) internal pure {
        uint n = orders.length;
        for (uint i = n-1; i >= 1; i--){
            if (orders[i].Price > orders[i-1].Price){
                order memory x = orders[i-1];
               orders[i-1] = orders[i];
               orders[i] = x;
           }            
        }
    }

    function createLimitOrder(buysell orderSide, bytes32 ticker, uint amount, uint price) public returns(bool success){
        if (orderSide == buysell.BUY){
            require(balances[msg.sender]["ETH"] >= amount.mul(price), "Insufficient balance");   
        }
        else if (orderSide == buysell.SELL){
            require(balances[msg.sender][ticker] >= amount, "Insufficient balance");
        }
        order[] storage orders = OrderBook[ticker][orderSide];
        orders.push(
            order(nextOrderId, msg.sender, orderSide, ticker, amount, price)
            );
        
        if(orderSide == buysell.BUY){
            halfBubbleSortHighToLow(orders);
        }
        else if(orderSide == buysell.SELL){
            halfBubbleSortLowToHigh(orders);
        } 
        OrderBook[ticker][orderSide] = orders;
        nextOrderId++;
        return true;
    }
}