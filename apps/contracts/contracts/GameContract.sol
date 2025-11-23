// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GameContract {
    enum Difficulty {
        Easy,
        Medium,
        Hard
    }

    enum Achievement {
        FirstWin,
        TenWins,
        FiftyWins,
        HundredWins,
        PerfectStreak,
        HintMaster,
        SocialButterfly
    }

    struct Game {
        uint256 gameId;
        bytes32 answerHash;
        uint256 startTime;
        uint256 endTime;
        uint256 rewardAmount;
        Difficulty difficulty;
        uint256 hintCost;
        bool isActive;
        uint256 totalSubmissions;
        uint256 correctAnswers;
    }

    struct PlayerStats {
        uint256 totalGamesPlayed;
        uint256 correctAnswers;
        uint256 totalRewardsEarned;
        uint256 lastPlayedTime;
        uint256 hintsPurchased;
        uint256 currentStreak;
        uint256 bestStreak;
        mapping(Achievement => bool) achievements;
    }

    struct PlayerStatsView {
        uint256 totalGamesPlayed;
        uint256 correctAnswers;
        uint256 totalRewardsEarned;
        uint256 lastPlayedTime;
        uint256 hintsPurchased;
        uint256 currentStreak;
        uint256 bestStreak;
    }

    struct LeaderboardEntry {
        address player;
        uint256 score;
    }

    struct FriendLeaderboardEntry {
        address player;
        uint256 score;
        bool isFriend;
    }

    struct GameTemplate {
        bytes32 answerHash;
        uint256 baseRewardAmount;
        Difficulty difficulty;
        bool isActive;
    }

    address public owner;
    uint256 private _status;

    uint256 public gameDuration;
    uint256 public minRewardAmount;
    uint256 public maxRewardAmount;
    uint256 public constant MAX_FRIENDS = 100;

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    mapping(Difficulty => uint256) public difficultyMultipliers;
    mapping(Difficulty => uint256) public hintCosts;

    uint256 public nextGameTemplateId;
    mapping(uint256 => GameTemplate) public gameTemplates;
    uint256[] public activeGameTemplateIds;

    mapping(address => Game) public playerGames;
    mapping(address => bool) public hasActiveGame;
    mapping(address => uint256) public playerGameTemplateId;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool) public hasBoughtHint;
    mapping(address => mapping(uint256 => bool)) public hasWon;

    address[] public topPlayers;
    mapping(address => uint256) public playerScores;

    mapping(address => address[]) public friends;
    mapping(address => mapping(address => bool)) public isFriend;
    mapping(address => uint256) public friendCount;

    event GameStarted(
        address indexed player,
        bytes32 answerHash,
        uint256 startTime,
        uint256 endTime,
        uint256 rewardAmount,
        Difficulty difficulty,
        uint256 hintCost
    );

    event GameTemplateAdded(
        uint256 indexed templateId,
        bytes32 answerHash,
        Difficulty difficulty,
        uint256 baseRewardAmount
    );

    event GuessSubmitted(
        address indexed player,
        string guess,
        uint256 timestamp
    );
    event AnswerCorrect(
        address indexed player,
        uint256 rewardAmount,
        uint256 timestamp
    );
    event AnswerIncorrect(address indexed player, uint256 timestamp);
    event GameCompleted(
        address indexed player,
        uint256 totalSubmissions,
        uint256 timestamp
    );
    event HintPurchased(
        address indexed player,
        uint256 cost,
        uint256 timestamp
    );
    event FriendAdded(
        address indexed player,
        address indexed friend,
        uint256 timestamp
    );
    event FriendRemoved(
        address indexed player,
        address indexed friend,
        uint256 timestamp
    );
    event AchievementUnlocked(
        address indexed player,
        Achievement achievement,
        uint256 timestamp
    );
    event RewardAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event GameDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner, "Owner cannot play");
        _;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor(
        uint256 _gameDuration,
        uint256 _minRewardAmount,
        uint256 _maxRewardAmount
    ) payable {
        owner = msg.sender;
        _status = _NOT_ENTERED;
        require(_gameDuration > 0, "Invalid duration");
        require(_minRewardAmount > 0, "Invalid min reward");
        require(_maxRewardAmount >= _minRewardAmount, "Invalid max reward");

        gameDuration = _gameDuration;
        minRewardAmount = _minRewardAmount;
        maxRewardAmount = _maxRewardAmount;

        difficultyMultipliers[Difficulty.Easy] = 10000;
        difficultyMultipliers[Difficulty.Medium] = 15000;
        difficultyMultipliers[Difficulty.Hard] = 20000;

        hintCosts[Difficulty.Easy] = 1e14;
        hintCosts[Difficulty.Medium] = 5e14;
        hintCosts[Difficulty.Hard] = 1e15;
    }

    function addGameTemplate(
        bytes32 _answerHash,
        uint256 _baseRewardAmount,
        Difficulty _difficulty
    ) external onlyOwner {
        require(_answerHash != bytes32(0), "Invalid hash");
        require(
            _baseRewardAmount >= minRewardAmount &&
                _baseRewardAmount <= maxRewardAmount,
            "Invalid reward"
        );

        uint256 templateId = nextGameTemplateId++;
        gameTemplates[templateId] = GameTemplate({
            answerHash: _answerHash,
            baseRewardAmount: _baseRewardAmount,
            difficulty: _difficulty,
            isActive: true
        });

        activeGameTemplateIds.push(templateId);
        emit GameTemplateAdded(
            templateId,
            _answerHash,
            _difficulty,
            _baseRewardAmount
        );
    }

    function startPlayerGame() public notOwner {
        require(!hasActiveGame[msg.sender], "Game active");
        require(activeGameTemplateIds.length > 0, "No games");

        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    msg.sender,
                    block.prevrandao,
                    block.number
                )
            )
        ) % activeGameTemplateIds.length;
        uint256 templateId = activeGameTemplateIds[randomIndex];
        GameTemplate storage template = gameTemplates[templateId];
        require(template.isActive, "Template inactive");

        uint256 multiplier = difficultyMultipliers[template.difficulty];
        uint256 actualReward = (template.baseRewardAmount * multiplier) / 10000;

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + gameDuration;
        uint256 hintCost = hintCosts[template.difficulty];

        playerGames[msg.sender] = Game({
            gameId: templateId,
            answerHash: template.answerHash,
            startTime: startTime,
            endTime: endTime,
            rewardAmount: actualReward,
            difficulty: template.difficulty,
            hintCost: hintCost,
            isActive: true,
            totalSubmissions: 0,
            correctAnswers: 0
        });

        hasActiveGame[msg.sender] = true;
        playerGameTemplateId[msg.sender] = templateId;
        hasBoughtHint[msg.sender] = false;

        emit GameStarted(
            msg.sender,
            template.answerHash,
            startTime,
            endTime,
            actualReward,
            template.difficulty,
            hintCost
        );
    }

    function submitGuess(string memory _guess) external nonReentrant notOwner {
        require(bytes(_guess).length > 0, "Empty guess");

        if (!hasActiveGame[msg.sender]) {
            startPlayerGame();
        } else {
            Game storage currentGame = playerGames[msg.sender];
            if (block.timestamp > currentGame.endTime && currentGame.isActive) {
                currentGame.isActive = false;
                hasActiveGame[msg.sender] = false;
                startPlayerGame();
            } else if (!currentGame.isActive) {
                revert("Game completed");
            }
        }

        Game storage game = playerGames[msg.sender];
        require(game.isActive, "Game inactive");
        require(block.timestamp >= game.startTime, "Not started");
        require(block.timestamp <= game.endTime, "Game ended");

        game.totalSubmissions++;
        string memory normalizedGuess = _normalizeString(_guess);
        bytes32 guessHash = keccak256(bytes(normalizedGuess));

        emit GuessSubmitted(msg.sender, normalizedGuess, block.timestamp);

        if (guessHash == game.answerHash) {
            _handleCorrectAnswer(msg.sender);
        } else {
            _resetStreak(msg.sender);
            emit AnswerIncorrect(msg.sender, block.timestamp);
        }

        PlayerStats storage stats = playerStats[msg.sender];
        stats.lastPlayedTime = block.timestamp;
        _checkAchievements(msg.sender);
    }

    function buyHint() external payable nonReentrant notOwner {
        if (!hasActiveGame[msg.sender]) {
            startPlayerGame();
        } else {
            Game storage currentGame = playerGames[msg.sender];
            if (block.timestamp > currentGame.endTime && currentGame.isActive) {
                currentGame.isActive = false;
                hasActiveGame[msg.sender] = false;
                startPlayerGame();
            } else if (!currentGame.isActive) {
                revert("Game completed");
            }
        }

        require(!hasBoughtHint[msg.sender], "Hint purchased");
        Game storage game = playerGames[msg.sender];
        require(game.isActive, "Game inactive");
        require(block.timestamp >= game.startTime, "Not started");
        require(block.timestamp <= game.endTime, "Game ended");
        require(msg.value >= game.hintCost, "Insufficient payment");

        hasBoughtHint[msg.sender] = true;
        PlayerStats storage stats = playerStats[msg.sender];
        stats.hintsPurchased++;

        if (msg.value > game.hintCost) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - game.hintCost
            }("");
            require(success, "Refund failed");
        }

        emit HintPurchased(msg.sender, game.hintCost, block.timestamp);

        if (
            stats.hintsPurchased >= 10 &&
            !stats.achievements[Achievement.HintMaster]
        ) {
            stats.achievements[Achievement.HintMaster] = true;
            emit AchievementUnlocked(
                msg.sender,
                Achievement.HintMaster,
                block.timestamp
            );
        }
    }

    function addFriend(address _friend) external {
        require(_friend != address(0), "Invalid address");
        require(_friend != msg.sender, "Cannot add self");
        require(!isFriend[msg.sender][_friend], "Already friends");
        require(friendCount[msg.sender] < MAX_FRIENDS, "Max friends");

        friends[msg.sender].push(_friend);
        isFriend[msg.sender][_friend] = true;
        friendCount[msg.sender]++;

        emit FriendAdded(msg.sender, _friend, block.timestamp);

        PlayerStats storage stats = playerStats[msg.sender];
        if (
            friendCount[msg.sender] >= 10 &&
            !stats.achievements[Achievement.SocialButterfly]
        ) {
            stats.achievements[Achievement.SocialButterfly] = true;
            emit AchievementUnlocked(
                msg.sender,
                Achievement.SocialButterfly,
                block.timestamp
            );
        }
    }

    function removeFriend(address _friend) external {
        require(isFriend[msg.sender][_friend], "Not a friend");

        address[] storage friendList = friends[msg.sender];
        uint256 length = friendList.length;
        for (uint256 i = 0; i < length; i++) {
            if (friendList[i] == _friend) {
                friendList[i] = friendList[length - 1];
                friendList.pop();
                break;
            }
        }

        isFriend[msg.sender][_friend] = false;
        friendCount[msg.sender]--;
        emit FriendRemoved(msg.sender, _friend, block.timestamp);
    }

    function getNewGame() external notOwner {
        if (hasActiveGame[msg.sender]) {
            Game storage currentGame = playerGames[msg.sender];
            if (currentGame.isActive) {
                currentGame.isActive = false;
                emit GameCompleted(
                    msg.sender,
                    currentGame.totalSubmissions,
                    block.timestamp
                );
            }
        }

        hasActiveGame[msg.sender] = false;
        hasBoughtHint[msg.sender] = false;
        startPlayerGame();
    }

    function depositFunds() external payable {
        require(msg.value > 0, "Must send CELO");
        emit FundsDeposited(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= address(this).balance, "Insufficient balance");
        require(_amount > 0, "Invalid amount");

        uint256 estimatedReserve = maxRewardAmount * 20;
        require(
            address(this).balance - _amount >= estimatedReserve,
            "Insufficient reserve"
        );

        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(owner, _amount);
    }

    function getCurrentGame() external view returns (Game memory) {
        if (!hasActiveGame[msg.sender]) {
            return _emptyGame();
        }
        return playerGames[msg.sender];
    }

    function getPlayerGame(
        address _player
    ) external view returns (Game memory) {
        if (!hasActiveGame[_player]) {
            return _emptyGame();
        }
        return playerGames[_player];
    }

    function getPlayerStats(
        address _player
    ) external view returns (PlayerStatsView memory) {
        PlayerStats storage stats = playerStats[_player];
        return
            PlayerStatsView({
                totalGamesPlayed: stats.totalGamesPlayed,
                correctAnswers: stats.correctAnswers,
                totalRewardsEarned: stats.totalRewardsEarned,
                lastPlayedTime: stats.lastPlayedTime,
                hintsPurchased: stats.hintsPurchased,
                currentStreak: stats.currentStreak,
                bestStreak: stats.bestStreak
            });
    }

    function getPlayerScore(address _player) external view returns (uint256) {
        return playerScores[_player];
    }

    function playerHasActiveGame(address _player) external view returns (bool) {
        return hasActiveGame[_player];
    }

    function getTopPlayers(
        uint256 _count
    ) external view returns (LeaderboardEntry[] memory) {
        require(_count > 0, "Invalid count");
        uint256 length = topPlayers.length;
        if (_count > length) {
            _count = length;
        }

        LeaderboardEntry[] memory top = new LeaderboardEntry[](_count);
        for (uint256 i = 0; i < _count; i++) {
            top[i] = LeaderboardEntry({
                player: topPlayers[i],
                score: playerScores[topPlayers[i]]
            });
        }
        return top;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function calculateAnswerHash(
        string memory _answer
    ) external pure returns (bytes32) {
        string memory normalized = _normalizeString(_answer);
        return keccak256(bytes(normalized));
    }

    function hasPlayerBoughtHint(address _player) external view returns (bool) {
        return hasBoughtHint[_player];
    }

    function getFriends(
        address _player
    ) external view returns (address[] memory) {
        return friends[_player];
    }

    function areFriends(
        address _player1,
        address _player2
    ) external view returns (bool) {
        return isFriend[_player1][_player2];
    }

    function getFriendLeaderboard(
        address _player,
        uint256 _count
    ) external view returns (FriendLeaderboardEntry[] memory) {
        require(_count > 0, "Invalid count");
        uint256 length = topPlayers.length;
        if (_count > length) {
            _count = length;
        }

        FriendLeaderboardEntry[] memory entries = new FriendLeaderboardEntry[](
            _count
        );
        for (uint256 i = 0; i < _count; i++) {
            address player = topPlayers[i];
            entries[i] = FriendLeaderboardEntry({
                player: player,
                score: playerScores[player],
                isFriend: isFriend[_player][player]
            });
        }
        return entries;
    }

    function hasAchievement(
        address _player,
        Achievement _achievement
    ) external view returns (bool) {
        return playerStats[_player].achievements[_achievement];
    }

    function getPlayerAchievements(
        address _player
    ) external view returns (bool[] memory) {
        bool[] memory achievements = new bool[](7);
        PlayerStats storage stats = playerStats[_player];

        achievements[0] = stats.achievements[Achievement.FirstWin];
        achievements[1] = stats.achievements[Achievement.TenWins];
        achievements[2] = stats.achievements[Achievement.FiftyWins];
        achievements[3] = stats.achievements[Achievement.HundredWins];
        achievements[4] = stats.achievements[Achievement.PerfectStreak];
        achievements[5] = stats.achievements[Achievement.HintMaster];
        achievements[6] = stats.achievements[Achievement.SocialButterfly];

        return achievements;
    }

    function _handleCorrectAnswer(address _player) internal {
        Game storage game = playerGames[_player];
        uint256 templateId = playerGameTemplateId[_player];

        require(!hasWon[_player][templateId], "Already won");

        game.correctAnswers++;
        hasWon[_player][templateId] = true;
        game.isActive = false;

        PlayerStats storage stats = playerStats[_player];
        stats.correctAnswers++;
        stats.totalGamesPlayed++;
        stats.totalRewardsEarned += game.rewardAmount;

        stats.currentStreak++;
        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }

        uint256 baseScore = 1;
        if (game.difficulty == Difficulty.Medium) {
            baseScore = 2;
        } else if (game.difficulty == Difficulty.Hard) {
            baseScore = 3;
        }
        playerScores[_player] += baseScore;
        _updateLeaderboard(_player);

        require(
            address(this).balance >= game.rewardAmount,
            "Insufficient balance"
        );
        (bool success, ) = payable(_player).call{value: game.rewardAmount}("");
        require(success, "Transfer failed");

        emit AnswerCorrect(_player, game.rewardAmount, block.timestamp);
        emit GameCompleted(_player, game.totalSubmissions, block.timestamp);
        hasActiveGame[_player] = false;
    }

    function _resetStreak(address _player) internal {
        playerStats[_player].currentStreak = 0;
    }

    function _checkAchievements(address _player) internal {
        PlayerStats storage stats = playerStats[_player];

        if (
            stats.correctAnswers == 1 &&
            !stats.achievements[Achievement.FirstWin]
        ) {
            stats.achievements[Achievement.FirstWin] = true;
            emit AchievementUnlocked(
                _player,
                Achievement.FirstWin,
                block.timestamp
            );
        }

        if (
            stats.correctAnswers == 10 &&
            !stats.achievements[Achievement.TenWins]
        ) {
            stats.achievements[Achievement.TenWins] = true;
            emit AchievementUnlocked(
                _player,
                Achievement.TenWins,
                block.timestamp
            );
        }

        if (
            stats.correctAnswers == 50 &&
            !stats.achievements[Achievement.FiftyWins]
        ) {
            stats.achievements[Achievement.FiftyWins] = true;
            emit AchievementUnlocked(
                _player,
                Achievement.FiftyWins,
                block.timestamp
            );
        }

        if (
            stats.correctAnswers == 100 &&
            !stats.achievements[Achievement.HundredWins]
        ) {
            stats.achievements[Achievement.HundredWins] = true;
            emit AchievementUnlocked(
                _player,
                Achievement.HundredWins,
                block.timestamp
            );
        }

        if (
            stats.currentStreak >= 10 &&
            !stats.achievements[Achievement.PerfectStreak]
        ) {
            stats.achievements[Achievement.PerfectStreak] = true;
            emit AchievementUnlocked(
                _player,
                Achievement.PerfectStreak,
                block.timestamp
            );
        }
    }

    function _updateLeaderboard(address _player) internal {
        bool found = false;
        uint256 length = topPlayers.length;
        for (uint256 i = 0; i < length; i++) {
            if (topPlayers[i] == _player) {
                found = true;
                break;
            }
        }

        if (!found) {
            topPlayers.push(_player);
        }

        _sortLeaderboard();
    }

    function _sortLeaderboard() internal {
        uint256 n = topPlayers.length;
        if (n <= 1) return;

        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (
                    playerScores[topPlayers[j]] <
                    playerScores[topPlayers[j + 1]]
                ) {
                    address temp = topPlayers[j];
                    topPlayers[j] = topPlayers[j + 1];
                    topPlayers[j + 1] = temp;
                }
            }
        }
    }

    function _normalizeString(
        string memory _str
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        if (strBytes.length == 0) {
            return _str;
        }

        uint256 start = 0;
        while (start < strBytes.length && strBytes[start] == " ") {
            start++;
        }

        uint256 end = strBytes.length;
        while (end > start && strBytes[end - 1] == " ") {
            end--;
        }

        bytes memory normalized = new bytes(end - start);
        for (uint256 i = start; i < end; i++) {
            if (strBytes[i] >= 0x41 && strBytes[i] <= 0x5A) {
                normalized[i - start] = bytes1(uint8(strBytes[i]) + 32);
            } else {
                normalized[i - start] = strBytes[i];
            }
        }

        return string(normalized);
    }

    function _emptyGame() internal pure returns (Game memory) {
        return
            Game({
                gameId: 0,
                answerHash: bytes32(0),
                startTime: 0,
                endTime: 0,
                rewardAmount: 0,
                difficulty: Difficulty.Easy,
                hintCost: 0,
                isActive: false,
                totalSubmissions: 0,
                correctAnswers: 0
            });
    }

    function setGameDuration(uint256 _newDuration) external onlyOwner {
        require(_newDuration > 0, "Invalid duration");
        uint256 oldDuration = gameDuration;
        gameDuration = _newDuration;
        emit GameDurationUpdated(oldDuration, _newDuration);
    }

    function setRewardLimits(
        uint256 _minReward,
        uint256 _maxReward
    ) external onlyOwner {
        require(_minReward > 0, "Invalid min reward");
        require(_maxReward >= _minReward, "Invalid max reward");
        minRewardAmount = _minReward;
        maxRewardAmount = _maxReward;
    }

    function setDifficultyMultiplier(
        Difficulty _difficulty,
        uint256 _multiplier
    ) external onlyOwner {
        require(_multiplier >= 10000, "Multiplier too low");
        require(_multiplier <= 50000, "Multiplier too high");
        difficultyMultipliers[_difficulty] = _multiplier;
    }

    function setHintCost(
        Difficulty _difficulty,
        uint256 _cost
    ) external onlyOwner {
        require(_cost > 0, "Invalid cost");
        hintCosts[_difficulty] = _cost;
    }

    function deactivateGameTemplate(uint256 _templateId) external onlyOwner {
        require(gameTemplates[_templateId].isActive, "Already inactive");
        gameTemplates[_templateId].isActive = false;

        uint256 length = activeGameTemplateIds.length;
        for (uint256 i = 0; i < length; i++) {
            if (activeGameTemplateIds[i] == _templateId) {
                activeGameTemplateIds[i] = activeGameTemplateIds[length - 1];
                activeGameTemplateIds.pop();
                break;
            }
        }
    }

    function getActiveGameTemplateCount() external view returns (uint256) {
        return activeGameTemplateIds.length;
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}
