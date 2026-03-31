// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Pythia Prediction Market
/// @notice Binary prediction markets on Initia appchain
contract PredictionMarket is ReentrancyGuard {
    struct Market {
        string question;
        uint256 deadline;
        uint256 totalYesPool;
        uint256 totalNoPool;
        bool resolved;
        bool outcome;
        address creator;
        uint256 createdAt;
    }

    struct Bet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    address public owner;
    uint256 public platformFeeBps = 200; // 2%
    uint256 public marketCount;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public marketBettors;

    event MarketCreated(uint256 indexed marketId, string question, uint256 deadline, address creator);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, bool position, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed bettor, uint256 payout);
    event PlatformFeeUpdated(uint256 newFeeBps);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error MarketDoesNotExist();
    error MarketAlreadyResolved();
    error MarketNotResolved();
    error MarketExpired();
    error MarketNotExpired();
    error BetAmountZero();
    error NothingToClaim();
    error AlreadyClaimed();
    error NotOwner();
    error InvalidDeadline();
    error InvalidFeeBps();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier marketExists(uint256 marketId) {
        if (marketId >= marketCount) revert MarketDoesNotExist();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Create a new binary prediction market
    /// @param question The question to bet on
    /// @param deadline Unix timestamp when betting closes
    function createMarket(string calldata question, uint256 deadline) external returns (uint256 marketId) {
        if (deadline <= block.timestamp) revert InvalidDeadline();

        marketId = marketCount++;
        markets[marketId] = Market({
            question: question,
            deadline: deadline,
            totalYesPool: 0,
            totalNoPool: 0,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit MarketCreated(marketId, question, deadline, msg.sender);
    }

    /// @notice Place a bet on a market
    /// @param marketId The market to bet on
    /// @param position true = Yes, false = No
    function placeBet(uint256 marketId, bool position) external payable marketExists(marketId) {
        Market storage market = markets[marketId];
        if (market.resolved) revert MarketAlreadyResolved();
        if (block.timestamp >= market.deadline) revert MarketExpired();
        if (msg.value == 0) revert BetAmountZero();

        Bet storage bet = bets[marketId][msg.sender];

        // Track new bettors
        if (bet.yesAmount == 0 && bet.noAmount == 0) {
            marketBettors[marketId].push(msg.sender);
        }

        if (position) {
            bet.yesAmount += msg.value;
            market.totalYesPool += msg.value;
        } else {
            bet.noAmount += msg.value;
            market.totalNoPool += msg.value;
        }

        emit BetPlaced(marketId, msg.sender, position, msg.value);
    }

    /// @notice Resolve a market (admin only)
    /// @param marketId The market to resolve
    /// @param outcome true = Yes wins, false = No wins
    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner marketExists(marketId) {
        Market storage market = markets[marketId];
        if (market.resolved) revert MarketAlreadyResolved();

        market.resolved = true;
        market.outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    /// @notice Claim winnings from a resolved market
    /// @param marketId The market to claim from
    function claimWinnings(uint256 marketId) external nonReentrant marketExists(marketId) {
        Market storage market = markets[marketId];
        if (!market.resolved) revert MarketNotResolved();

        Bet storage bet = bets[marketId][msg.sender];
        if (bet.claimed) revert AlreadyClaimed();

        uint256 winningAmount = market.outcome ? bet.yesAmount : bet.noAmount;
        if (winningAmount == 0) revert NothingToClaim();

        bet.claimed = true;

        uint256 totalPool = market.totalYesPool + market.totalNoPool;
        uint256 winningPool = market.outcome ? market.totalYesPool : market.totalNoPool;

        // payout = (userBet / winningPool) * totalPool * (1 - fee)
        uint256 grossPayout = (winningAmount * totalPool) / winningPool;
        uint256 fee = (grossPayout * platformFeeBps) / 10000;
        uint256 payout = grossPayout - fee;

        emit WinningsClaimed(marketId, msg.sender, payout);

        (bool success,) = msg.sender.call{value: payout}("");
        if (!success) revert TransferFailed();
    }

    // ── View Functions ──────────────────────────────────────────

    function getMarket(uint256 marketId) external view marketExists(marketId) returns (Market memory) {
        return markets[marketId];
    }

    function getBet(uint256 marketId, address bettor) external view marketExists(marketId) returns (Bet memory) {
        return bets[marketId][bettor];
    }

    function getMarketBettors(uint256 marketId) external view marketExists(marketId) returns (address[] memory) {
        return marketBettors[marketId];
    }

    function calculatePayout(uint256 marketId, address bettor) external view marketExists(marketId) returns (uint256) {
        Market storage market = markets[marketId];
        if (!market.resolved) return 0;

        Bet storage bet = bets[marketId][bettor];
        uint256 winningAmount = market.outcome ? bet.yesAmount : bet.noAmount;
        if (winningAmount == 0) return 0;

        uint256 totalPool = market.totalYesPool + market.totalNoPool;
        uint256 winningPool = market.outcome ? market.totalYesPool : market.totalNoPool;

        uint256 grossPayout = (winningAmount * totalPool) / winningPool;
        uint256 fee = (grossPayout * platformFeeBps) / 10000;
        return grossPayout - fee;
    }

    // ── Admin Functions ─────────────────────────────────────────

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert InvalidFeeBps(); // max 10%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Withdraw accumulated platform fees
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success,) = owner.call{value: balance}("");
        if (!success) revert TransferFailed();
    }
}
