// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SplittingToken.sol";
import "./USDT.sol";

contract TokenSale is Ownable {
    IERC20 public token;
    IERC20 public usdt;
    uint256 public totalSupply;

    enum Rank {
        Basic,
        Bronze,
        Silver,
        Gold
    }
    struct Package {
        uint256 priceUsdt;
        uint256 tokens;
    }

    mapping(Rank => Package) public packages;

    constructor(address _tokenAddress, address _usdtAddress) {
        token = IERC20(_tokenAddress);
        usdt = IERC20(_usdtAddress);
        packages[Rank.Basic] = Package(100 * 10 ** 18, 10000 * 10 ** 18); // 1000 USDT, 10,000 tokens
        packages[Rank.Bronze] = Package(1000 * 10 ** 18, 100000 * 10 ** 18); // 10,000 USDT, 100,000 tokens
        packages[Rank.Silver] = Package(2000 * 10 ** 18, 200000 * 10 ** 18); // 20,000 USDT, 200,000 tokens
        packages[Rank.Gold] = Package(4500 * 10 ** 18, 450000 * 10 ** 18); // 45,000 USDT, 450,000 tokens
    }

    function buyPackage(uint256 _packageName, uint _usdtSend) external {
        require(
            token.balanceOf(address(this)) >=
                packages[Rank(_packageName)].tokens,
            "TokenSale: not enough tokens"
        );

        if (Rank(_packageName) == Rank.Basic) {
            if (totalSupply <= 1000) {
                require(
                    _usdtSend >= 100 * 10 ** 18,
                    "TokenSale: invalid price"
                );
                require(
                    usdt.transferFrom(msg.sender, address(this), _usdtSend),
                    "TokenSale: transfer failed"
                );
            }
            totalSupply += 1;
        } else {
            require(
                usdt.transferFrom(
                    msg.sender,
                    address(this),
                    packages[Rank(_packageName)].priceUsdt
                ),
                "TokenSale: transfer failed"
            );
        }

        token.transfer(msg.sender, packages[Rank(_packageName)].tokens);
    }

    function checkSlotBasic() external view returns (uint256) {
        return totalSupply;
    }

    function setPackage(
        uint256 _packageName,
        uint256 _priceUsdt,
        uint256 _tokens
    ) external onlyOwner {
        packages[Rank(_packageName)] = Package(_priceUsdt, _tokens);
    }

    function getPrice(uint256 _packageName) external view returns (uint256) {
        if (Rank(_packageName) == Rank.Basic && totalSupply < 1000) {
            return 100 * 10 ** 18;
        }
        return packages[Rank(_packageName)].priceUsdt;
    }

    function withdrawEther() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawUSDT() external onlyOwner {
        usdt.transfer(owner(), usdt.balanceOf(address(this)));
    }
}
