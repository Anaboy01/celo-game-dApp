import { expect } from "chai";
import { parseEther } from "viem";
import hre from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("GameContract", function () {
  async function deployGameContractFixture() {
    const [owner, player1, player2] = await hre.viem.getWalletClients();

    const gameDuration = 3600;
    const minReward = parseEther("0.001");
    const maxReward = parseEther("0.1");

    const gameContract = await hre.viem.deployContract("GameContract", [
      gameDuration,
      minReward,
      maxReward,
    ], {
      value: parseEther("1"),
    });

    const publicClient = await hre.viem.getPublicClient();

    return {
      gameContract,
      owner,
      player1,
      player2,
      publicClient,
      gameDuration,
      minReward,
      maxReward,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { gameContract, owner } = await loadFixture(deployGameContractFixture);
      const contractOwner = await gameContract.read.owner();
      expect(contractOwner.toLowerCase()).to.equal(owner.account.address.toLowerCase());
    });

    it("Should set game duration correctly", async function () {
      const { gameContract, gameDuration } = await loadFixture(deployGameContractFixture);
      expect(await gameContract.read.gameDuration()).to.equal(BigInt(gameDuration));
    });

    it("Should set reward limits correctly", async function () {
      const { gameContract, minReward, maxReward } = await loadFixture(deployGameContractFixture);
      expect(await gameContract.read.minRewardAmount()).to.equal(minReward);
      expect(await gameContract.read.maxRewardAmount()).to.equal(maxReward);
    });
  });

  describe("Game Template Management", function () {
    it("Should allow owner to add game template", async function () {
      const { gameContract, owner } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      const templateCount = await gameContract.read.getActiveGameTemplateCount();
      expect(templateCount).to.equal(1n);
    });

    it("Should not allow non-owner to add game template", async function () {
      const { gameContract, player1 } = await loadFixture(deployGameContractFixture);

      const answerHash = await gameContract.read.calculateAnswerHash(["test"]);
      const baseReward = parseEther("0.01");

      await expect(
        gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
          account: player1.account,
        })
      ).to.be.rejectedWith("Not owner");
    });
  });

  describe("Game Play", function () {
    it("Should auto-start game on first guess", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      // Submit incorrect guess first to verify game auto-starts
      await gameContract.write.submitGuess(["wrong"], {
        account: player1.account,
      });

      const game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });
      expect(game.gameId).to.be.greaterThan(0n);
      expect(game.isActive).to.be.true;
    });

    it("Should reward player for correct answer", async function () {
      const { gameContract, owner, player1, publicClient } = await loadFixture(
        deployGameContractFixture
      );

      const answer = "correct";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      const balanceBefore = await publicClient.getBalance({
        address: player1.account.address,
      });

      const tx = await gameContract.write.submitGuess([answer], {
        account: player1.account,
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const balanceAfter = await publicClient.getBalance({
        address: player1.account.address,
      });

      // Balance should increase by reward minus gas
      const netChange = balanceAfter - balanceBefore;
      expect(netChange + gasUsed).to.be.greaterThan(0n);

      const stats = await gameContract.read.getPlayerStats([player1.account.address]);
      expect(stats.correctAnswers).to.equal(1n);
      expect(stats.totalRewardsEarned).to.be.greaterThan(0n);
    });

    it("Should not reward player for incorrect answer", async function () {
      const { gameContract, owner, player1, publicClient } = await loadFixture(
        deployGameContractFixture
      );

      const answer = "correct";
      const wrongGuess = "wrong";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      const balanceBefore = await publicClient.getBalance({
        address: player1.account.address,
      });

      const tx = await gameContract.write.submitGuess([wrongGuess], {
        account: player1.account,
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const balanceAfter = await publicClient.getBalance({
        address: player1.account.address,
      });

      // Balance should decrease only by gas (no reward)
      expect(balanceAfter).to.equal(balanceBefore - gasUsed);

      const stats = await gameContract.read.getPlayerStats([player1.account.address]);
      expect(stats.correctAnswers).to.equal(0n);
    });

    it("Should normalize guess (case insensitive)", async function () {
      const { gameContract, owner, player1, publicClient } = await loadFixture(
        deployGameContractFixture
      );

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      const balanceBefore = await publicClient.getBalance({
        address: player1.account.address,
      });

      const tx = await gameContract.write.submitGuess(["TEST"], {
        account: player1.account,
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const balanceAfter = await publicClient.getBalance({
        address: player1.account.address,
      });

      // Should receive reward (balance increase minus gas)
      expect(balanceAfter - balanceBefore + gasUsed).to.be.greaterThan(0n);
    });

    it("Should allow multiple guesses until correct", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      await gameContract.write.submitGuess(["wrong1"], {
        account: player1.account,
      });

      let game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });
      expect(game.totalSubmissions).to.equal(1n);

      await gameContract.write.submitGuess(["wrong2"], {
        account: player1.account,
      });

      game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });
      expect(game.totalSubmissions).to.equal(2n);

      await gameContract.write.submitGuess([answer], {
        account: player1.account,
      });

      game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });
      expect(game.isActive).to.be.false;
      // After completion, getCurrentGame returns empty struct, so check via getPlayerGame
      const playerGame = await gameContract.read.getPlayerGame([player1.account.address]);
      expect(playerGame.totalSubmissions).to.equal(3n);
    });

    it("Should require getNewGame after completion", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      await gameContract.write.submitGuess([answer], {
        account: player1.account,
      });

      await expect(
        gameContract.write.submitGuess(["new"], {
          account: player1.account,
        })
      ).to.be.rejectedWith("Game completed");
    });

    it("Should allow new game after completion", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer1 = "test1";
      const answer2 = "test2";
      const answerHash1 = await gameContract.read.calculateAnswerHash([answer1]);
      const answerHash2 = await gameContract.read.calculateAnswerHash([answer2]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash1, baseReward, 0], {
        account: owner.account,
      });
      await gameContract.write.addGameTemplate([answerHash2, baseReward, 0], {
        account: owner.account,
      });

      await gameContract.write.submitGuess([answer1], {
        account: player1.account,
      });

      await gameContract.write.getNewGame({
        account: player1.account,
      });

      const game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });
      expect(game.isActive).to.be.true;
    });
  });

  describe("Hints", function () {
    it("Should allow player to buy hint", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      await gameContract.write.submitGuess(["wrong"], {
        account: player1.account,
      });

      const game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });

      await gameContract.write.buyHint({
        account: player1.account,
        value: game.hintCost,
      });

      const hasBought = await gameContract.read.hasPlayerBoughtHint([player1.account.address]);
      expect(hasBought).to.be.true;
    });

    it("Should not allow buying hint twice", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      await gameContract.write.submitGuess(["wrong"], {
        account: player1.account,
      });

      const game = await gameContract.read.getCurrentGame({
        account: player1.account,
      });

      await gameContract.write.buyHint({
        account: player1.account,
        value: game.hintCost,
      });

      await expect(
        gameContract.write.buyHint({
          account: player1.account,
          value: game.hintCost,
        })
      ).to.be.rejectedWith("Hint purchased");
    });
  });

  describe("Social Features", function () {
    it("Should allow adding friends", async function () {
      const { gameContract, player1, player2 } = await loadFixture(deployGameContractFixture);

      await gameContract.write.addFriend([player2.account.address], {
        account: player1.account,
      });

      const areFriends = await gameContract.read.areFriends([
        player1.account.address,
        player2.account.address,
      ]);
      expect(areFriends).to.be.true;
    });

    it("Should allow removing friends", async function () {
      const { gameContract, player1, player2 } = await loadFixture(deployGameContractFixture);

      await gameContract.write.addFriend([player2.account.address], {
        account: player1.account,
      });

      await gameContract.write.removeFriend([player2.account.address], {
        account: player1.account,
      });

      const areFriends = await gameContract.read.areFriends([
        player1.account.address,
        player2.account.address,
      ]);
      expect(areFriends).to.be.false;
    });
  });

  describe("Leaderboard", function () {
    it("Should update leaderboard on correct answer", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployGameContractFixture);

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 0], {
        account: owner.account,
      });

      await gameContract.write.submitGuess([answer], {
        account: player1.account,
      });

      const score = await gameContract.read.getPlayerScore([player1.account.address]);
      expect(score).to.be.greaterThan(0n);

      const topPlayers = await gameContract.read.getTopPlayers([10n]);
      expect(topPlayers.length).to.be.greaterThan(0);
    });
  });

  describe("Funds Management", function () {
    it("Should allow deposits", async function () {
      const { gameContract, player1 } = await loadFixture(deployGameContractFixture);

      const depositAmount = parseEther("0.5");
      const balanceBefore = await gameContract.read.getContractBalance();

      await gameContract.write.depositFunds({
        account: player1.account,
        value: depositAmount,
      });

      const balanceAfter = await gameContract.read.getContractBalance();
      expect(balanceAfter - balanceBefore).to.equal(depositAmount);
    });

    it("Should allow owner to withdraw funds", async function () {
      const { gameContract, owner, player1, publicClient } = await loadFixture(deployGameContractFixture);

      // Deposit more funds to meet reserve requirement
      await gameContract.write.depositFunds({
        account: player1.account,
        value: parseEther("2"),
      });

      const withdrawAmount = parseEther("0.1");
      const contractBalance = await gameContract.read.getContractBalance();

      if (contractBalance >= withdrawAmount) {
        const ownerBalanceBefore = await publicClient.getBalance({
          address: owner.account.address,
        });

        const tx = await gameContract.write.withdrawFunds([withdrawAmount], {
          account: owner.account,
        });
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

        const ownerBalanceAfter = await publicClient.getBalance({
          address: owner.account.address,
        });

        // Balance should increase by withdraw amount minus gas
        expect(ownerBalanceAfter - ownerBalanceBefore + gasUsed).to.be.greaterThanOrEqual(withdrawAmount);
      }
    });
  });

  describe("Difficulty Levels", function () {
    it("Should apply difficulty multipliers correctly", async function () {
      const { gameContract, owner, player1, publicClient } = await loadFixture(
        deployGameContractFixture
      );

      const answer = "test";
      const answerHash = await gameContract.read.calculateAnswerHash([answer]);
      const baseReward = parseEther("0.01");

      await gameContract.write.addGameTemplate([answerHash, baseReward, 2], {
        account: owner.account,
      });

      const balanceBefore = await publicClient.getBalance({
        address: player1.account.address,
      });

      const tx = await gameContract.write.submitGuess([answer], {
        account: player1.account,
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const balanceAfter = await publicClient.getBalance({
        address: player1.account.address,
      });

      // Reward should be greater than base reward (Hard difficulty = 2x multiplier)
      const netReward = balanceAfter - balanceBefore + gasUsed;
      expect(netReward).to.be.greaterThan(baseReward);
    });
  });
});
