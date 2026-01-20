# Internal Scoring Formula

The ranking system uses a composite score to evaluate players based on performance, quantity of play, and consistency.
Unlike simple win percentage, this system rewards active participation and sustained performance.

## Formula

```javascript
Score = (Wins * 300) + (Draws * 100) + (GoalDiff * 10) + (MatchesPlayed * 5)
```

### Breakdown
- **Wins**: 300 points (Primary value factor)
- **Draws**: 100 points
- **Goal Difference (Goals Scored - Goals Conceded)**: 10 points per unit.
  - This rewards dominant wins and penalizes heavy losses.
- **Matches Played**: 5 points per match.
  - This acts as a slight "consistency/activity" bonus.
  - Helps resolve ties favoring the more active player.
  - Contributes to the "Anti Small Sample" mechanism by ensuring that a player with very few games (even if won) cannot overtake a player with a solid history easily.

## Anti Small Sample Mechanism
The cumulative nature of the score inherently handles small samples.
- **One Game Wonder**: 1 Win = 300 + ~20 (GD) + 5 (Activity) ≈ 325 points.
- **Regular Player**: 10 Games (5W, 5L) = 1500 + ~0 (GD) + 50 (Activity) ≈ 1550 points.
The Regular Player is accurately ranked higher than the One Game Wonder.
