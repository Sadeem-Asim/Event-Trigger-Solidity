// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ItemManager.sol";


contract Item{
    uint public priceInWei;
    uint public pricePaid;
    uint public index;
    ItemManager parentContract;
    constructor(ItemManager _parentContract , uint _priceInWei, uint _index){
    parentContract = _parentContract;
    priceInWei = _priceInWei;
    index = _index;
    }
    receive()external payable{
        require(pricePaid == 0, "Item is Paid Already");
        require(priceInWei == msg.value , "Only Full Payments Allowed");
        pricePaid += msg.value;
       (bool success ,) = address(parentContract).call{value: msg.value}(abi.encodeWithSignature("triggerPayment(uint256)",index));
       require(success , "The Transaction Wasn't Successful");
    }
    fallback()external{}
}
