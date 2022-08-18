// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


contract Ownable{
  address owner;

  constructor(){
    owner = msg.sender;
  }

    modifier onlyOwner(){
        require(owner == msg.sender , "you are not the owner");
        _;
    }
}