// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SplittingToken is ERC20("Splitting Me", "RWA"), Ownable {
    uint256 private cap = 100_000_000_000 * 10 ** 18;

    constructor() {
        _mint(msg.sender, cap);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        require(
            ERC20.totalSupply() + _amount <= cap,
            "SplittingToken: cap exceeded"
        );
        _mint(_to, _amount);
    }
}
