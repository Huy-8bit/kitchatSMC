// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Launchpad is Ownable, Pausable, ReentrancyGuard {
    address public launchPadadmin;

    struct projectListed {
        uint256 id;
        address tokenAddress;
        address owner;
        uint256 tokenPrice;
        uint256 maxTokenPerUser;
        uint256 maxCapacity;
        uint256 minTokenPerUser;
        uint256 startTime;
        uint256 endTime;
        uint256 totalInvestment;
    }
    struct investment {
        uint256 id;
        address investor;
        uint256 amount;
        uint256 timestamp;
    }

    using SafeMath for uint256;

    using SafeERC20 for IERC20;

    uint256 public projectCount;

    mapping(uint256 => projectListed) public projects;

    mapping(uint256 => investment[]) public investments;

    mapping(address => uint256[]) public listProjects;

    event projectListedEvent(
        uint256 id,
        address tokenAddress,
        address owner,
        uint256 tokenPrice,
        uint256 maxTokenPerUser,
        uint256 maxCapacity,
        uint256 minTokenPerUser,
        uint256 startTime,
        uint256 endTime,
        uint256 totalInvestment
    );

    event investmentEvent(
        uint256 id,
        address investor,
        uint256 amount,
        uint256 timestamp
    );

    event Swept(address to, uint256 value);

    constructor() {
        launchPadadmin = msg.sender;
    }

    function listed(
        IERC20 _tokenAddress,
        uint256 _tokenPrice,
        uint256 _maxTokenPerUser,
        uint256 _maxCapacity,
        uint256 _minTokenPerUser,
        uint256 _startTime,
        uint256 _endTime
    ) external whenNotPaused {
        require(
            _tokenPrice > 0,
            "launchpad: token price must be greater than zero"
        );
        require(
            _maxTokenPerUser > 0,
            "launchpad: max token per user must be greater than zero"
        );
        require(
            _maxCapacity > 0,
            "launchpad: max capacity must be greater than zero"
        );
        require(
            _minTokenPerUser > 0,
            "launchpad: min token per user must be greater than zero"
        );
        require(
            _startTime > 0,
            "launchpad: start time must be greater than zero"
        );
        require(_endTime > 0, "launchpad: end time must be greater than zero");
        require(
            _startTime < _endTime,
            "launchpad: start time must be less than end time"
        );
        require(
            _tokenAddress.balanceOf(msg.sender) >= _maxCapacity,
            "launchpad: you must have enough token to list"
        );
        require(
            _tokenAddress.allowance(msg.sender, address(this)) >= _maxCapacity,
            "launchpad: you must approve token to contract"
        );
        require(
            _tokenAddress.balanceOf(address(this)) >= _maxCapacity,
            "launchpad: contract must have enough token"
        );
        require(
            _tokenAddress.transferFrom(msg.sender, address(this), _maxCapacity),
            "launchpad: token transfer failed"
        );
        projectCount++;
        projects[projectCount] = projectListed(
            projectCount,
            address(_tokenAddress),
            msg.sender,
            _tokenPrice,
            _maxTokenPerUser,
            _maxCapacity,
            _minTokenPerUser,
            _startTime,
            _endTime,
            0
        );
        listProjects[msg.sender].push(projectCount);
        emit projectListedEvent(
            projectCount,
            address(_tokenAddress),
            msg.sender,
            _tokenPrice,
            _maxTokenPerUser,
            _maxCapacity,
            _minTokenPerUser,
            _startTime,
            _endTime,
            0
        );
    }

    function invest(
        uint256 _id,
        uint256 _amount
    ) external payable whenNotPaused nonReentrant {
        require(
            _id > 0 && _id <= projectCount,
            "launchpad: invalid project id"
        );
        require(
            projects[_id].startTime <= block.timestamp,
            "launchpad: project not started yet"
        );
        require(
            projects[_id].endTime >= block.timestamp,
            "launchpad: project already ended"
        );
        require(
            projects[_id].totalInvestment < projects[_id].maxCapacity,
            "launchpad: project already filled"
        );
        require(
            _amount > 0,
            "launchpad: investment amount must be greater than zero"
        );
        require(
            _amount >= projects[_id].minTokenPerUser,
            "launchpad: investment amount must be greater than min token per user"
        );
        require(
            _amount <= projects[_id].maxTokenPerUser,
            "launchpad: investment amount must be less than max token per user"
        );
        require(
            projects[_id].totalInvestment.add(_amount) <=
                projects[_id].maxCapacity,
            "launchpad: investment amount must be less than max capacity"
        );
        require(
            IERC20(projects[_id].tokenAddress).balanceOf(msg.sender) >= _amount,
            "launchpad: you must have enough token to invest"
        );
        require(
            IERC20(projects[_id].tokenAddress).allowance(
                msg.sender,
                address(this)
            ) >= _amount,
            "launchpad: you must approve token to contract"
        );
        require(
            IERC20(projects[_id].tokenAddress).balanceOf(address(this)) >=
                _amount,
            "launchpad: contract must have enough token"
        );
        require(
            IERC20(projects[_id].tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "launchpad: token transfer failed"
        );
        projects[_id].totalInvestment = projects[_id].totalInvestment.add(
            _amount
        );
        investments[_id].push(
            investment(_id, msg.sender, _amount, block.timestamp)
        );
        emit investmentEvent(_id, msg.sender, _amount, block.timestamp);
    }

    function claim(uint256 _id) external whenNotPaused nonReentrant {
        require(
            _id > 0 && _id <= projectCount,
            "launchpad: invalid project id"
        );
        require(
            projects[_id].endTime < block.timestamp,
            "launchpad: project not ended yet"
        );
        require(
            projects[_id].totalInvestment > 0,
            "launchpad: project not invested yet"
        );
        require(
            projects[_id].owner == msg.sender,
            "launchpad: you are not owner of project"
        );
        uint256 totalInvestment = projects[_id].totalInvestment;
        uint256 totalToken = totalInvestment.div(projects[_id].tokenPrice);
        uint256 totalTokenPerUser = totalToken.div(
            projects[_id].totalInvestment
        );
        for (uint256 i = 0; i < investments[_id].length; i++) {
            uint256 amount = totalTokenPerUser.mul(investments[_id][i].amount);
            IERC20(projects[_id].tokenAddress).safeTransfer(
                investments[_id][i].investor,
                amount
            );
        }
        emit Swept(msg.sender, totalInvestment);
    }

    function withdraw(uint256 _id) external whenNotPaused nonReentrant {
        require(
            _id > 0 && _id <= projectCount,
            "launchpad: invalid project id"
        );
        require(
            projects[_id].endTime < block.timestamp,
            "launchpad: project not ended yet"
        );
        require(
            projects[_id].totalInvestment > 0,
            "launchpad: project not invested yet"
        );
        require(
            projects[_id].owner == msg.sender,
            "launchpad: you are not owner of project"
        );
        uint256 totalInvestment = projects[_id].totalInvestment;
        IERC20(projects[_id].tokenAddress).safeTransfer(
            projects[_id].owner,
            totalInvestment
        );
        emit Swept(msg.sender, totalInvestment);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function sweep(address _to, uint256 _value) external onlyOwner {
        require(_to != address(0), "launchpad: can not sweep to zero address");
        require(_value > 0, "launchpad: can not sweep zero or negative value");
        IERC20(projects[1].tokenAddress).safeTransfer(_to, _value);
        emit Swept(_to, _value);
    }

    function updateAdmin(address _newAdmin) external onlyOwner {
        require(
            _newAdmin != address(0),
            "launchpad: can not set zero address as admin"
        );
        launchPadadmin = _newAdmin;
    }

    function updateProject(
        uint256 _id,
        uint256 _tokenPrice,
        uint256 _maxTokenPerUser,
        uint256 _maxCapacity,
        uint256 _minTokenPerUser,
        uint256 _startTime,
        uint256 _endTime
    ) external whenNotPaused {
        require(
            _id > 0 && _id <= projectCount,
            "launchpad: invalid project id"
        );
        require(
            projects[_id].owner == msg.sender,
            "launchpad: you are not owner of project"
        );
        require(
            _tokenPrice > 0,
            "launchpad: token price must be greater than zero"
        );
        require(
            _maxTokenPerUser > 0,
            "launchpad: max token per user must be greater than zero"
        );
        require(
            _maxCapacity > 0,
            "launchpad: max capacity must be greater than zero"
        );
        require(
            _minTokenPerUser > 0,
            "launchpad: min token per user must be greater than zero"
        );
        require(
            _startTime > 0,
            "launchpad: start time must be greater than zero"
        );
        require(_endTime > 0, "launchpad: end time must be greater than zero");
        require(
            _startTime < _endTime,
            "launchpad: start time must be less than end time"
        );
        projects[_id].tokenPrice = _tokenPrice;
        projects[_id].maxTokenPerUser = _maxTokenPerUser;
        projects[_id].maxCapacity = _maxCapacity;
        projects[_id].minTokenPerUser = _minTokenPerUser;
        projects[_id].startTime = _startTime;
        projects[_id].endTime = _endTime;
    }
}
