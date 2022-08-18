// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable{
    string _value = "Hello World";
    event SupplyChainStep(uint _itemIndex , uint _step , address item);
    enum SupplyChainState{Created , Paid , Delievered}
    struct S_Item{
        Item item;
        string identifier;
        uint itemPrice;
        SupplyChainState state;
    }
    mapping(uint => S_Item) public items;
    uint public itemIndex;
        function createItem(string memory _identifier , uint _itemPrice)public onlyOwner{
        Item _item = new Item(this , _itemPrice , itemIndex);
        items[itemIndex].item = _item; 
        items[itemIndex].identifier = _identifier; 
        items[itemIndex].itemPrice = _itemPrice;
        items[itemIndex].state = SupplyChainState.Created;
        emit SupplyChainStep(itemIndex ,uint(items[itemIndex].state) , address(_item));
        itemIndex++;
        }
        
        function getValue() view public returns (string memory) {
        return _value;
        }
        function triggerPayment(uint _itemIndex)public payable{
        require(items[_itemIndex].itemPrice == msg.value , "Contract Accept Full Payments");
        require(items[_itemIndex].state == SupplyChainState.Created , "Item is further in the chain");
        items[_itemIndex].state = SupplyChainState.Paid;
        emit SupplyChainStep(_itemIndex ,uint(items[_itemIndex].state) ,address( items[_itemIndex].item));

        }
        function triggerDelievery(uint _itemIndex)public onlyOwner{
        require(items[_itemIndex].state == SupplyChainState.Paid , "Item Is Not Purchased Yet");
        items[_itemIndex].state = SupplyChainState.Delievered;
        emit SupplyChainStep(_itemIndex ,uint(items[_itemIndex].state),address( items[_itemIndex].item));
        }

}