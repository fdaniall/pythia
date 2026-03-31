// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract PredictionMarketTest is Test {
    PredictionMarket public pm;

    address owner = address(this);
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");

    uint256 constant DEADLINE = 1 days;

    receive() external payable {}

    function setUp() public {
        pm = new PredictionMarket();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }

    function _createMarket() internal returns (uint256) {
        return pm.createMarket("Will BTC hit $100K?", block.timestamp + DEADLINE);
    }

    // ── Market Creation ─────────────────────────────────────────

    function test_createMarket() public {
        uint256 id = _createMarket();
        assertEq(id, 0);
        assertEq(pm.marketCount(), 1);

        PredictionMarket.Market memory m = pm.getMarket(0);
        assertEq(m.question, "Will BTC hit $100K?");
        assertEq(m.deadline, block.timestamp + DEADLINE);
        assertEq(m.creator, address(this));
        assertFalse(m.resolved);
    }

    function test_createMultipleMarkets() public {
        _createMarket();
        pm.createMarket("Will ETH flip BTC?", block.timestamp + 2 days);
        assertEq(pm.marketCount(), 2);
    }

    function test_revert_createMarketPastDeadline() public {
        vm.expectRevert(PredictionMarket.InvalidDeadline.selector);
        pm.createMarket("Old question", block.timestamp - 1);
    }

    // ── Betting ─────────────────────────────────────────────────

    function test_placeBetYes() public {
        _createMarket();

        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);

        PredictionMarket.Market memory m = pm.getMarket(0);
        assertEq(m.totalYesPool, 1 ether);
        assertEq(m.totalNoPool, 0);

        PredictionMarket.Bet memory b = pm.getBet(0, alice);
        assertEq(b.yesAmount, 1 ether);
    }

    function test_placeBetNo() public {
        _createMarket();

        vm.prank(bob);
        pm.placeBet{value: 2 ether}(0, false);

        PredictionMarket.Market memory m = pm.getMarket(0);
        assertEq(m.totalNoPool, 2 ether);
    }

    function test_multipleBetsSameUser() public {
        _createMarket();

        vm.startPrank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        pm.placeBet{value: 2 ether}(0, true);
        vm.stopPrank();

        PredictionMarket.Bet memory b = pm.getBet(0, alice);
        assertEq(b.yesAmount, 3 ether);
    }

    function test_betBothSides() public {
        _createMarket();

        vm.startPrank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        pm.placeBet{value: 1 ether}(0, false);
        vm.stopPrank();

        PredictionMarket.Bet memory b = pm.getBet(0, alice);
        assertEq(b.yesAmount, 1 ether);
        assertEq(b.noAmount, 1 ether);
    }

    function test_revert_betZeroAmount() public {
        _createMarket();
        vm.prank(alice);
        vm.expectRevert(PredictionMarket.BetAmountZero.selector);
        pm.placeBet{value: 0}(0, true);
    }

    function test_revert_betAfterDeadline() public {
        _createMarket();
        vm.warp(block.timestamp + DEADLINE + 1);
        vm.prank(alice);
        vm.expectRevert(PredictionMarket.MarketExpired.selector);
        pm.placeBet{value: 1 ether}(0, true);
    }

    function test_revert_betOnResolved() public {
        _createMarket();
        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        pm.resolveMarket(0, true);

        vm.prank(bob);
        vm.expectRevert(PredictionMarket.MarketAlreadyResolved.selector);
        pm.placeBet{value: 1 ether}(0, true);
    }

    function test_revert_betNonexistentMarket() public {
        vm.prank(alice);
        vm.expectRevert(PredictionMarket.MarketDoesNotExist.selector);
        pm.placeBet{value: 1 ether}(999, true);
    }

    // ── Resolution ──────────────────────────────────────────────

    function test_resolveMarket() public {
        _createMarket();
        pm.resolveMarket(0, true);

        PredictionMarket.Market memory m = pm.getMarket(0);
        assertTrue(m.resolved);
        assertTrue(m.outcome);
    }

    function test_revert_resolveNotOwner() public {
        _createMarket();
        vm.prank(alice);
        vm.expectRevert(PredictionMarket.NotOwner.selector);
        pm.resolveMarket(0, true);
    }

    function test_revert_resolveAlreadyResolved() public {
        _createMarket();
        pm.resolveMarket(0, true);
        vm.expectRevert(PredictionMarket.MarketAlreadyResolved.selector);
        pm.resolveMarket(0, false);
    }

    // ── Claiming ────────────────────────────────────────────────

    function test_claimWinningsYes() public {
        _createMarket();

        // Alice bets 1 ETH Yes, Bob bets 3 ETH No
        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        vm.prank(bob);
        pm.placeBet{value: 3 ether}(0, false);

        // Yes wins → Alice wins
        pm.resolveMarket(0, true);

        uint256 balBefore = alice.balance;
        vm.prank(alice);
        pm.claimWinnings(0);

        // Total pool = 4 ETH, Alice's share = 4 ETH, fee = 2% = 0.08 ETH
        // Payout = 3.92 ETH
        uint256 expectedPayout = 3.92 ether;
        assertEq(alice.balance - balBefore, expectedPayout);
    }

    function test_claimWinningsNo() public {
        _createMarket();

        vm.prank(alice);
        pm.placeBet{value: 3 ether}(0, true);
        vm.prank(bob);
        pm.placeBet{value: 1 ether}(0, false);

        // No wins → Bob wins
        pm.resolveMarket(0, false);

        uint256 balBefore = bob.balance;
        vm.prank(bob);
        pm.claimWinnings(0);

        // Total pool = 4 ETH, Bob gets all = 4 ETH, fee = 0.08 ETH
        uint256 expectedPayout = 3.92 ether;
        assertEq(bob.balance - balBefore, expectedPayout);
    }

    function test_claimProportionalPayout() public {
        _createMarket();

        // Alice 1 ETH Yes, Charlie 3 ETH Yes, Bob 4 ETH No
        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        vm.prank(charlie);
        pm.placeBet{value: 3 ether}(0, true);
        vm.prank(bob);
        pm.placeBet{value: 4 ether}(0, false);

        pm.resolveMarket(0, true);

        // Total pool = 8 ETH, Yes pool = 4 ETH
        // Alice: (1/4) * 8 = 2 ETH gross, 1.96 net
        // Charlie: (3/4) * 8 = 6 ETH gross, 5.88 net
        uint256 aliceBefore = alice.balance;
        vm.prank(alice);
        pm.claimWinnings(0);
        assertEq(alice.balance - aliceBefore, 1.96 ether);

        uint256 charlieBefore = charlie.balance;
        vm.prank(charlie);
        pm.claimWinnings(0);
        assertEq(charlie.balance - charlieBefore, 5.88 ether);
    }

    function test_revert_claimNotResolved() public {
        _createMarket();
        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);

        vm.prank(alice);
        vm.expectRevert(PredictionMarket.MarketNotResolved.selector);
        pm.claimWinnings(0);
    }

    function test_revert_claimLoser() public {
        _createMarket();
        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        pm.resolveMarket(0, false); // No wins, Alice loses

        vm.prank(alice);
        vm.expectRevert(PredictionMarket.NothingToClaim.selector);
        pm.claimWinnings(0);
    }

    function test_revert_doubleClaim() public {
        _createMarket();
        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        pm.resolveMarket(0, true);

        vm.startPrank(alice);
        pm.claimWinnings(0);
        vm.expectRevert(PredictionMarket.AlreadyClaimed.selector);
        pm.claimWinnings(0);
        vm.stopPrank();
    }

    // ── Admin ───────────────────────────────────────────────────

    function test_setPlatformFee() public {
        pm.setPlatformFee(500); // 5%
        assertEq(pm.platformFeeBps(), 500);
    }

    function test_revert_setFeeOver10Percent() public {
        vm.expectRevert(PredictionMarket.InvalidFeeBps.selector);
        pm.setPlatformFee(1001);
    }

    function test_transferOwnership() public {
        pm.transferOwnership(alice);
        assertEq(pm.owner(), alice);
    }

    function test_withdrawFees() public {
        _createMarket();

        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        vm.prank(bob);
        pm.placeBet{value: 1 ether}(0, false);

        pm.resolveMarket(0, true);

        vm.prank(alice);
        pm.claimWinnings(0);

        // Contract should have fee remaining
        uint256 contractBal = address(pm).balance;
        assertTrue(contractBal > 0);

        uint256 ownerBefore = owner.balance;
        pm.withdrawFees();
        assertEq(owner.balance - ownerBefore, contractBal);
    }

    // ── View Functions ──────────────────────────────────────────

    function test_calculatePayout() public {
        _createMarket();

        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        vm.prank(bob);
        pm.placeBet{value: 3 ether}(0, false);

        pm.resolveMarket(0, true);

        uint256 payout = pm.calculatePayout(0, alice);
        assertEq(payout, 3.92 ether);
    }

    function test_getMarketBettors() public {
        _createMarket();

        vm.prank(alice);
        pm.placeBet{value: 1 ether}(0, true);
        vm.prank(bob);
        pm.placeBet{value: 1 ether}(0, false);

        address[] memory bettors = pm.getMarketBettors(0);
        assertEq(bettors.length, 2);
        assertEq(bettors[0], alice);
        assertEq(bettors[1], bob);
    }
}
