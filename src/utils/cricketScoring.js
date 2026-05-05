export const EXTRA_TYPES = new Set(['wd', 'nb']);

export function getBallOutcome(runValue, options = {}) {
    const { isExtra = false, extraType = null, isWicket = false } = options;

    if (isWicket) {
        return {
            value: 'W',
            type: 'wicket',
            batsmanRuns: 0,
            extraRuns: 0,
            isLegalBall: true,
            isBoundary: false,
            isWicket: true,
        };
    }

    if (isExtra) {
        const value = extraType === 'nb' ? 'nb' : 'wd';
        return {
            value,
            type: 'extra',
            batsmanRuns: 0,
            extraRuns: 1,
            isLegalBall: false,
            isBoundary: false,
            isWicket: false,
        };
    }

    const runs = Number(runValue) || 0;
    return {
        value: String(runs),
        type: runs === 4 || runs === 6 ? 'boundary' : 'run',
        batsmanRuns: runs,
        extraRuns: 0,
        isLegalBall: true,
        isBoundary: runs === 4 || runs === 6,
        isWicket: false,
    };
}

export function applyBallToBattingStats(currentStats, outcome) {
    return {
        runs: (currentStats.runs || 0) + outcome.batsmanRuns,
        balls: (currentStats.balls || 0) + (outcome.isLegalBall ? 1 : 0),
        fours: (currentStats.fours || 0) + (outcome.value === '4' && !outcome.isWicket ? 1 : 0),
        sixes: (currentStats.sixes || 0) + (outcome.value === '6' && !outcome.isWicket ? 1 : 0),
        isOut: Boolean(outcome.isWicket),
    };
}

export function applyBallToBowlerOverStats(currentStats, outcome) {
    return {
        runs: (currentStats.runs || 0) + outcome.batsmanRuns + outcome.extraRuns,
        wickets: (currentStats.wickets || 0) + (outcome.isWicket ? 1 : 0),
        extras: (currentStats.extras || 0) + outcome.extraRuns,
    };
}

export function countLegalBalls(overBalls) {
    return overBalls.filter((ball) => !EXTRA_TYPES.has(ball.value)).length;
}

export function isOverComplete(overBalls, ballsPerOver = 6) {
    return countLegalBalls(overBalls) >= ballsPerOver;
}

export function summarizeOver(overBalls) {
    return overBalls.reduce(
        (summary, ball) => {
            if (ball.value === 'W') {
                summary.wickets += 1;
                summary.legalBalls += 1;
                return summary;
            }

            if (EXTRA_TYPES.has(ball.value)) {
                summary.runs += 1;
                summary.extras += 1;
                return summary;
            }

            summary.runs += Number(ball.value) || 0;
            summary.legalBalls += 1;
            return summary;
        },
        { runs: 0, wickets: 0, extras: 0, legalBalls: 0 }
    );
}

export function calculateStrikeRate(runs, balls) {
    return balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
}

export function calculateTargetScore(players, strikerPlayerId) {
    const otherPlayers = players.filter((player) => player.player_id !== strikerPlayerId);

    if (otherPlayers.length === 0) {
        return null;
    }

    return Math.max(...otherPlayers.map((player) => player.runs || 0)) + 1;
}

export function calculateOversRemaining(oversPerBatsman, oversAlreadyFaced) {
    return Math.max(0, oversPerBatsman - oversAlreadyFaced - 1);
}
