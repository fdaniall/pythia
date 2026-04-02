// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract DeployPredictionMarket is Script {
    function run() external returns (PredictionMarket) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        PredictionMarket market = new PredictionMarket();
        console.log("PredictionMarket deployed at:", address(market));
        console.log("Owner:", market.owner());
        console.log("Platform fee:", market.platformFeeBps(), "bps");

        vm.stopBroadcast();

        return market;
    }
}
