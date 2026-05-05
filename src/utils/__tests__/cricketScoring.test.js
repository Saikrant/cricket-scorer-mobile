import { describe, expect, it } from 'vitest';
import {
    applyBallToBattingStats,
    applyBallToBowlerOverStats,
    calculateOversRemaining,
    calculateStrikeRate,
    calculateTargetScore,
    countLegalBalls,
    getBallOutcome,
    isOverComplete,
    summarizeOver,
} from '../cricketScoring';

describe('cricket scoring helpers', () => {
    it('classifies normal scoring shots and boundaries', () => {
        expect(getBallOutcome(4)).toEqual({
            value: '4',
            type: 'boundary',
            batsmanRuns: 4,
            extraRuns: 0,
            isLegalBall: true,
            isBoundary: true,
            isWicket: false,
        });

        expect(getBallOutcome(2).type).toBe('run');
    });

    it('classifies wides, no-balls, and wickets using cricket ball-counting rules', () => {
        expect(getBallOutcome(1, { isExtra: true, extraType: 'wd' })).toMatchObject({
            value: 'wd',
            type: 'extra',
            extraRuns: 1,
            isLegalBall: false,
        });

        expect(getBallOutcome(0, { isWicket: true })).toMatchObject({
            value: 'W',
            type: 'wicket',
            isLegalBall: true,
            isWicket: true,
        });
    });

    it('updates batting stats without crediting extras to the batsman', () => {
        const initial = { runs: 10, balls: 5, fours: 1, sixes: 0, isOut: false };

        expect(applyBallToBattingStats(initial, getBallOutcome(6))).toEqual({
            runs: 16,
            balls: 6,
            fours: 1,
            sixes: 1,
            isOut: false,
        });

        expect(applyBallToBattingStats(initial, getBallOutcome(1, { isExtra: true, extraType: 'nb' }))).toEqual({
            runs: 10,
            balls: 5,
            fours: 1,
            sixes: 0,
            isOut: false,
        });
    });

    it('updates bowler over stats with extras and wickets', () => {
        const initial = { runs: 4, wickets: 0, extras: 0 };

        expect(applyBallToBowlerOverStats(initial, getBallOutcome(1, { isExtra: true, extraType: 'wd' }))).toEqual({
            runs: 5,
            wickets: 0,
            extras: 1,
        });

        expect(applyBallToBowlerOverStats(initial, getBallOutcome(0, { isWicket: true }))).toEqual({
            runs: 4,
            wickets: 1,
            extras: 0,
        });
    });

    it('counts only legal balls when deciding whether an over is complete', () => {
        const over = [
            { value: '0' },
            { value: 'wd' },
            { value: '1' },
            { value: 'nb' },
            { value: '4' },
            { value: 'W' },
            { value: '2' },
            { value: '1' },
        ];

        expect(countLegalBalls(over)).toBe(6);
        expect(isOverComplete(over)).toBe(true);
    });

    it('summarizes an over for the over-complete modal', () => {
        const summary = summarizeOver([
            { value: '1' },
            { value: 'wd' },
            { value: '4' },
            { value: 'W' },
            { value: 'nb' },
            { value: '0' },
        ]);

        expect(summary).toEqual({ runs: 7, wickets: 1, extras: 2, legalBalls: 4 });
    });

    it('calculates strike rate, target score, and remaining overs', () => {
        expect(calculateStrikeRate(25, 10)).toBe('250.0');
        expect(calculateStrikeRate(0, 0)).toBe('0.0');

        expect(calculateTargetScore([
            { player_id: 'a', runs: 31 },
            { player_id: 'b', runs: 45 },
            { player_id: 'c', runs: 12 },
        ], 'c')).toBe(46);

        expect(calculateOversRemaining(3, 1)).toBe(1);
        expect(calculateOversRemaining(2, 5)).toBe(0);
    });
});
