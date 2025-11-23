"use client";

import { GameBoard } from "@/components/game/game-board";
import { Card } from "@/components/ui/card";
import { Zap, Trophy, Flame, Loader2, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { usePlayerStats } from "@/hooks/use-player-stats";
import { usePlayerScore } from "@/hooks/use-player-score";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useIsOwner } from "@/hooks/use-is-owner";
import { formatCELO } from "@/lib/contract-helpers";
import { UserBalance } from "@/components/user-balance";

export default function GamePage() {
  const { address } = useAccount();
  const { isOwner, isLoading: isCheckingOwner } = useIsOwner();
  const { stats, isLoading: isStatsLoading } = usePlayerStats(address);
  const { score, isLoading: isScoreLoading } = usePlayerScore(address);
  const { entries: leaderboardEntries, isLoading: isLeaderboardLoading } =
    useLeaderboard(100);

  // Calculate rank
  const playerRank =
    address && leaderboardEntries
      ? leaderboardEntries.findIndex(
          (entry) => entry.player.toLowerCase() === address.toLowerCase()
        ) + 1
      : null;

  // Show message if user is the owner
  if (isCheckingOwner) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
            <Card className="p-8 border-border bg-card">
              <div className="space-y-6 text-center py-12">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    Admin Account
                  </h3>
                  <p className="text-muted-foreground">
                    Platform admins cannot play the game. Use a different wallet
                    to play.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Visit the{" "}
                    <a href="/admin" className="text-primary hover:underline">
                      Admin Dashboard
                    </a>{" "}
                    to manage game templates and funds.
                  </p>
                </div>
              </div>
            </Card>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border bg-card">
              <GameBoard />
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  {isStatsLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-lg font-bold text-foreground">
                      {stats ? Number(stats.currentStreak) : 0} games
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  {isScoreLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-lg font-bold text-foreground">
                      {score ? Number(score).toLocaleString() : "0"}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {playerRank && (
              <Card className="p-6 border-border bg-card/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rank</p>
                    <p className="text-lg font-bold text-foreground">
                      #{playerRank}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {stats && (
              <Card className="p-6 border-border bg-card/50">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Total Earnings
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {formatCELO(stats.totalRewardsEarned)} CELO
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
