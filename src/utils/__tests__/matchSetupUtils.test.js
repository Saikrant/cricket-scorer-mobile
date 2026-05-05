import { describe, expect, it } from 'vitest';
import {
    addPlayerToLineup,
    assignBattingOrder,
    buildPlayersToAdd,
    calculateTotalOvers,
    filterAvailablePlayers,
    movePlayerInLineup,
    removePlayerFromLineup,
} from '../matchSetupUtils';

const players = [
    { id: 'p1', full_name: 'Virat Kohli' },
    { id: 'p2', full_name: 'Rohit Sharma' },
    { id: 'p3', full_name: 'Jasprit Bumrah' },
];

describe('match setup helpers', () => {
    it('calculates total overs from overs per player and lineup size', () => {
        expect(calculateTotalOvers(2, players)).toBe(6);
        expect(calculateTotalOvers('', players)).toBe(0);
    });

    it('assigns batting order from current lineup order', () => {
        expect(assignBattingOrder(players)).toEqual([
            { id: 'p1', full_name: 'Virat Kohli', battingOrder: 1 },
            { id: 'p2', full_name: 'Rohit Sharma', battingOrder: 2 },
            { id: 'p3', full_name: 'Jasprit Bumrah', battingOrder: 3 },
        ]);
    });

    it('adds a player only when they are not already selected', () => {
        const selected = [players[0]];

        expect(addPlayerToLineup(selected, players[1])).toEqual({
            added: true,
            players: [
                { id: 'p1', full_name: 'Virat Kohli', battingOrder: 1 },
                { id: 'p2', full_name: 'Rohit Sharma', battingOrder: 2 },
            ],
        });

        expect(addPlayerToLineup(selected, players[0])).toEqual({
            added: false,
            players: selected,
        });
    });

    it('removes players and reassigns batting order', () => {
        const ordered = assignBattingOrder(players);

        expect(removePlayerFromLineup(ordered, 'p2')).toEqual([
            { id: 'p1', full_name: 'Virat Kohli', battingOrder: 1 },
            { id: 'p3', full_name: 'Jasprit Bumrah', battingOrder: 2 },
        ]);
    });

    it('moves players and keeps batting order contiguous', () => {
        const ordered = assignBattingOrder(players);

        expect(movePlayerInLineup(ordered, 2, 0)).toEqual([
            { id: 'p3', full_name: 'Jasprit Bumrah', battingOrder: 1 },
            { id: 'p1', full_name: 'Virat Kohli', battingOrder: 2 },
            { id: 'p2', full_name: 'Rohit Sharma', battingOrder: 3 },
        ]);
    });

    it('filters out already selected players and applies search text', () => {
        const selected = [players[0]];

        expect(filterAvailablePlayers(players, selected, 'ro')).toEqual([
            { id: 'p2', full_name: 'Rohit Sharma' },
        ]);
    });

    it('builds payloads for match player insertion', () => {
        expect(buildPlayersToAdd(players.slice(0, 2))).toEqual([
            { player_id: 'p1', player_name: 'Virat Kohli', batting_order: 1 },
            { player_id: 'p2', player_name: 'Rohit Sharma', batting_order: 2 },
        ]);
    });
});
