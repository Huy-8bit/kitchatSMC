// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("SocialFI", "SF") {
        _mint(msg.sender, 500000000 * 10 ** 18);
    }
}
