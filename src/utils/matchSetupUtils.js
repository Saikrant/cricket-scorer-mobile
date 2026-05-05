export function calculateTotalOvers(oversPerPlayer, selectedPlayers) {
    return Math.max(0, Number(oversPerPlayer) || 0) * selectedPlayers.length;
}

export function assignBattingOrder(players) {
    return players.map((player, index) => ({
        ...player,
        battingOrder: index + 1,
    }));
}

export function addPlayerToLineup(selectedPlayers, player) {
    if (selectedPlayers.some((selected) => selected.id === player.id)) {
        return { players: selectedPlayers, added: false };
    }

    return {
        players: assignBattingOrder([...selectedPlayers, player]),
        added: true,
    };
}

export function removePlayerFromLineup(selectedPlayers, playerId) {
    return assignBattingOrder(selectedPlayers.filter((player) => player.id !== playerId));
}

export function movePlayerInLineup(selectedPlayers, fromIndex, toIndex) {
    if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= selectedPlayers.length ||
        toIndex >= selectedPlayers.length
    ) {
        return assignBattingOrder(selectedPlayers);
    }

    const updated = [...selectedPlayers];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    return assignBattingOrder(updated);
}

export function filterAvailablePlayers(availablePlayers, selectedPlayers, searchQuery = '') {
    const selectedIds = new Set(selectedPlayers.map((player) => player.id));
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return availablePlayers
        .filter((player) => !selectedIds.has(player.id))
        .filter((player) => player.full_name.toLowerCase().includes(normalizedQuery));
}

export function buildPlayersToAdd(selectedPlayers) {
    return selectedPlayers.map((player, index) => ({
        player_id: player.id,
        player_name: player.full_name,
        batting_order: index + 1,
    }));
}
