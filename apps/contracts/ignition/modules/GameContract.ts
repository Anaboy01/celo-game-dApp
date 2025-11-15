// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";


const DEFAULT_GAME_DURATION = 3600;
const DEFAULT_MIN_REWARD = parseEther("0.001");
const DEFAULT_MAX_REWARD = parseEther("0.1");

const GameContractModule = buildModule("GameContractModule", (m) => {
  const gameDuration = m.getParameter("gameDuration", DEFAULT_GAME_DURATION);
  const minRewardAmount = m.getParameter("minRewardAmount", DEFAULT_MIN_REWARD);
  const maxRewardAmount = m.getParameter("maxRewardAmount", DEFAULT_MAX_REWARD);

  const gameContract = m.contract("GameContract", [
    gameDuration,
    minRewardAmount,
    maxRewardAmount,
  ], {
    value: parseEther("1"), // Fund contract with 1 CELO for rewards
  });

  return { gameContract };
});

export default GameContractModule;

