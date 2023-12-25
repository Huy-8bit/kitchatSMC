// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Launchpad is Ownable, Pausable, ReentrancyGuard {
    address public launchPadadmin;
    uint256 public totalProject;

    struct Project {
        uint256 id;
        address tokenAddress;
        address tokenInvested;
        address owner;
        uint256 tokenPrice;
        uint256 maxTokenPerUser;
        uint256 maxCapacity;
        uint256 minTokenPerUser;
        uint256 startTime;
        uint256 endTime;
        uint256 totalInvestment;
        bool withdraw;
        bool claim;
    }

    struct Investment {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => Investment)) public investments;
    mapping(uint256 => address[]) public investors;

    event ProjectListed(
        uint256 indexed id,
        address indexed tokenAddress,
        address indexed tokenInvested,
        address owner,
        uint256 tokenPrice,
        uint256 maxTokenPerUser,
        uint256 maxCapacity,
        uint256 minTokenPerUser,
        uint256 startTime,
        uint256 endTime
    );
    event ProjectInvested(
        uint256 indexed id,
        address indexed investor,
        uint256 amount,
        uint256 timestamp
    );

    function createProject(
        address _tokenAddress,
        address _tokenInvested,
        uint256 _tokenPrice,
        uint256 _maxTokenPerUser,
        uint256 _maxCapacity,
        uint256 _minTokenPerUser,
        uint256 _startTime,
        uint256 _endTime
    ) external whenNotPaused {
        require(_tokenAddress != address(0), "Launchpad: zero token address");
        require(_tokenPrice > 0, "Launchpad: zero token price");
        require(_maxTokenPerUser > 0, "Launchpad: zero max token/user");
        require(_maxCapacity > 0, "Launchpad: zero max capacity");
        require(_minTokenPerUser > 0, "Launchpad: zero min token/user");
        require(
            _startTime > 0 && _endTime > _startTime,
            "Launchpad: invalid time"
        );

        totalProject++;
        projects[totalProject] = Project(
            totalProject,
            _tokenAddress,
            _tokenInvested,
            msg.sender,
            _tokenPrice,
            _maxTokenPerUser,
            _maxCapacity,
            _minTokenPerUser,
            _startTime,
            _endTime,
            0,
            false,
            false
        );
        emit ProjectListed(
            totalProject,
            _tokenAddress,
            _tokenInvested,
            msg.sender,
            _tokenPrice,
            _maxTokenPerUser,
            _maxCapacity,
            _minTokenPerUser,
            _startTime,
            _endTime
        );
    }

    function invest(
        uint256 _id,
        uint256 _amount
    ) external payable whenNotPaused nonReentrant {
        require(_id > 0 && _id <= totalProject, "Launchpad: invalid id");
        require(
            block.timestamp >= projects[_id].startTime &&
                block.timestamp <= projects[_id].endTime,
            "Launchpad: invalid time"
        );
        require(
            projects[_id].totalInvestment < projects[_id].maxCapacity,
            "Launchpad: full capacity"
        );
        require(
            _amount >= projects[_id].minTokenPerUser &&
                _amount <= projects[_id].maxTokenPerUser,
            "Launchpad: invalid amount"
        );
        require(
            projects[_id].totalInvestment + _amount <=
                projects[_id].maxCapacity,
            "Launchpad: exceeding capacity"
        );
        require(
            !projects[_id].withdraw && !projects[_id].claim,
            "Launchpad: project closed"
        );

        if (projects[_id].tokenInvested != address(0)) {
            SafeERC20.safeTransferFrom(
                IERC20(projects[_id].tokenInvested),
                msg.sender,
                address(this),
                _amount
            );
        } else {
            require(msg.value == _amount, "Launchpad: mismatched value");
        }

        projects[_id].totalInvestment += _amount;
        investors[_id].push(msg.sender);
        investments[_id][msg.sender] = Investment(_amount, block.timestamp);
        emit ProjectInvested(_id, msg.sender, _amount, block.timestamp);
    }

    function withdrawProject(uint256 _id) external whenNotPaused nonReentrant {
        require(
            _id > 0 && _id <= totalProject,
            "Launchpad: invalid project id"
        );
        require(
            msg.sender == projects[_id].owner,
            "Launchpad: only owner can withdraw"
        );
        require(
            block.timestamp >= projects[_id].endTime,
            "Launchpad: project not ended yet"
        );
        require(
            projects[_id].withdraw == false,
            "Launchpad: already withdrawn"
        );
        projects[_id].withdraw = true;
        if (projects[_id].tokenInvested != address(0)) {
            SafeERC20.safeTransfer(
                IERC20(projects[_id].tokenInvested),
                msg.sender,
                projects[_id].totalInvestment
            );
        } else if (projects[_id].tokenInvested == address(0)) {
            payable(msg.sender).transfer(projects[_id].totalInvestment);
        } else {
            revert("Launchpad: invalid token address");
        }
    }

    function claimProject(uint256 _id) external whenNotPaused nonReentrant {
        require(
            _id > 0 && _id <= totalProject,
            "Launchpad: invalid project id"
        );
        require(
            block.timestamp >= projects[_id].endTime,
            "Launchpad: project not ended yet"
        );
        require(projects[_id].claim == false, "Launchpad: already claimed");
        require(
            msg.sender == projects[_id].owner,
            "Launchpad: only owner claim"
        );
        projects[_id].claim = true;
        for (uint256 i = 0; i < investors[_id].length; i++) {
            uint256 amount = investments[_id][investors[_id][i]].amount;
            if (amount > 0) {
                if (projects[_id].tokenInvested != address(0)) {
                    SafeERC20.safeTransfer(
                        IERC20(projects[_id].tokenAddress),
                        investors[_id][i],
                        amount * projects[_id].tokenPrice
                    );
                } else if (projects[_id].tokenInvested == address(0)) {
                    payable(investors[_id][i]).transfer(
                        amount * projects[_id].tokenPrice
                    );
                } else {
                    revert("Launchpad: invalid token address");
                }
            }
        }
    }
}
