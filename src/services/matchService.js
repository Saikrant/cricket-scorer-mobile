import { supabase } from '../config/supabase';

/**
 * Match Service
 * Handles all match-related operations including CRUD, scoring, and stats
 */

const matchService = {
    /**
     * Create a new match
     */
    async createMatch(matchData) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .insert([{
                    scorer_id: matchData.scorer_id,
                    match_name: matchData.match_name,
                    location: matchData.location,
                    match_date: matchData.match_date,
                    match_time: matchData.match_time,
                    match_type: matchData.match_type || 'individual',
                    overs_per_player: matchData.overs_per_player,
                    total_overs: matchData.total_overs,
                    status: 'setup',
                }])
                .select()
                .single();

            if (error) throw error;
            return { match: data, error: null };
        } catch (error) {
            console.error('Create match error:', error);
            return { match: null, error: error.message };
        }
    },

    /**
     * Get all matches for a scorer
     */
    async getMatches(scorerId, status = null) {
        try {
            let query = supabase
                .from('matches')
                .select('*')
                .eq('scorer_id', scorerId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { matches: data, error: null };
        } catch (error) {
            console.error('Get matches error:', error);
            return { matches: [], error: error.message };
        }
    },

    /**
     * Get a single match by ID
     */
    async getMatch(matchId) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (error) throw error;
            return { match: data, error: null };
        } catch (error) {
            console.error('Get match error:', error);
            return { match: null, error: error.message };
        }
    },

    /**
     * Update match details
     */
    async updateMatch(matchId, updates) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .update(updates)
                .eq('id', matchId)
                .select()
                .single();

            if (error) throw error;
            return { match: data, error: null };
        } catch (error) {
            console.error('Update match error:', error);
            return { match: null, error: error.message };
        }
    },

    /**
     * Delete a match
     */
    async deleteMatch(matchId) {
        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .eq('id', matchId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error('Delete match error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get match players (batting lineup)
     */
    async getMatchPlayers(matchId) {
        try {
            const { data, error } = await supabase
                .from('match_players')
                .select('*')
                .eq('match_id', matchId)
                .order('batting_order', { ascending: true });

            if (error) throw error;
            return { players: data, error: null };
        } catch (error) {
            console.error('Get match players error:', error);
            return { players: [], error: error.message };
        }
    },

    /**
     * Add players to match
     */
    async addMatchPlayers(matchId, players) {
        try {
            const playersData = players.map((player, index) => ({
                match_id: matchId,
                player_id: player.player_id,
                player_name: player.player_name,
                batting_order: index + 1,
            }));

            const { data, error } = await supabase
                .from('match_players')
                .insert(playersData)
                .select();

            if (error) throw error;
            return { players: data, error: null };
        } catch (error) {
            console.error('Add match players error:', error);
            return { players: null, error: error.message };
        }
    },

    /**
     * Get match bowlers
     */
    async getMatchBowlers(matchId) {
        try {
            const { data, error } = await supabase
                .from('match_bowlers')
                .select('*')
                .eq('match_id', matchId);

            if (error) throw error;
            return { bowlers: data, error: null };
        } catch (error) {
            console.error('Get match bowlers error:', error);
            return { bowlers: [], error: error.message };
        }
    },

    /**
     * Get recent matches with basic stats
     */
    async getRecentMatches(scorerId, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('scorer_id', scorerId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { matches: data, error: null };
        } catch (error) {
            console.error('Get recent matches error:', error);
            return { matches: [], error: error.message };
        }
    },

    /**
     * Get recent matches for a player (where they played)
     */
    async getPlayerMatches(playerId, limit = 10) {
        try {
            // First get the match_ids from match_players
            const { data: playerMatches, error: playerError } = await supabase
                .from('match_players')
                .select('match_id')
                .eq('player_id', playerId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (playerError) throw playerError;

            if (!playerMatches || playerMatches.length === 0) {
                return { matches: [], error: null };
            }

            const matchIds = playerMatches.map(pm => pm.match_id);

            // Then get the match details
            const { data: matches, error: matchError } = await supabase
                .from('matches')
                .select('*')
                .in('id', matchIds)
                .order('created_at', { ascending: false });

            if (matchError) throw matchError;

            return { matches: matches, error: null };
        } catch (error) {
            console.error('Get player matches error:', error);
            return { matches: [], error: error.message };
        }
    },
    /**
     * Update batting stats for a player
     */
    async updateBattingStats(matchId, playerId, stats) {
        try {
            // Stats object should contain: runs, balls, fours, sixes, etc.
            // We need to fetch current stats first to increment? 
            // Or assume the UI passes the NEW total?
            // Safer to use RPC or increment, but for now let's just update with provided values
            // assuming the UI holds the source of truth for the current innings.

            const { data, error } = await supabase
                .from('match_players')
                .update(stats)
                .eq('match_id', matchId)
                .eq('player_id', playerId)
                .select()
                .single();

            if (error) throw error;
            return { player: data, error: null };
        } catch (error) {
            console.error('Update batting stats error:', error);
            return { player: null, error: error.message };
        }
    },

    /**
     * Update bowling stats or create if not exists
     */
    async updateBowlingStats(matchId, playerId, stats) {
        try {
            // Check if bowler exists in match_bowlers
            const { data: existing } = await supabase
                .from('match_bowlers')
                .select('*')
                .eq('match_id', matchId)
                .eq('player_id', playerId)
                .single();

            let result;

            if (existing) {
                // Update
                result = await supabase
                    .from('match_bowlers')
                    .update(stats)
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                // Insert
                result = await supabase
                    .from('match_bowlers')
                    .insert([{
                        match_id: matchId,
                        player_id: playerId,
                        ...stats
                    }])
                    .select()
                    .single();
            }

            if (result.error) throw result.error;
            return { bowler: result.data, error: null };
        } catch (error) {
            console.error('Update bowling stats error:', error);
            return { bowler: null, error: error.message };
        }
    },

    /**
     * Mark player status (batting, out, retired)
     */
    async updatePlayerStatus(matchId, playerId, status) {
        try {
            const { data, error } = await supabase
                .from('match_players')
                .update({ status })
                .eq('match_id', matchId)
                .eq('player_id', playerId)
                .select()
                .single();

            if (error) throw error;
            return { player: data, error: null };
        } catch (error) {
            return { player: null, error: error.message };
        }
    },

    /**
     * Get aggregated career stats for a player
     */
    async getPlayerCareerStats(playerId) {
        try {
            // Fetch all match_player entries for this player
            const { data: participations, error } = await supabase
                .from('match_players')
                .select('runs, balls_faced, fours, sixes, status, match_id')
                .eq('player_id', playerId);

            if (error) throw error;

            let totalRuns = 0;
            let totalBalls = 0;
            let totalFours = 0;
            let totalSixes = 0;
            let matchesPlayed = participations.length;
            let highestScore = 0;
            let dismissalCount = 0; // To calculate average

            participations.forEach(p => {
                const r = p.runs || 0;
                totalRuns += r;
                totalBalls += (p.balls_faced || 0);
                totalFours += (p.fours || 0);
                totalSixes += (p.sixes || 0);
                if (r > highestScore) highestScore = r;
                if (p.status === 'out') dismissalCount++;
            });

            // Fetch bowling stats to get wickets
            const { data: bowlingStats, error: bowlingError } = await supabase
                .from('match_bowlers')
                .select('wickets')
                .eq('player_id', playerId);

            let totalWickets = 0;
            if (!bowlingError && bowlingStats) {
                bowlingStats.forEach(b => {
                    totalWickets += (b.wickets || 0);
                });
            }

            const average = dismissalCount > 0 ? (totalRuns / dismissalCount).toFixed(1) : totalRuns; // If never out, average is total runs
            const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : '0.0';

            return {
                stats: {
                    matches: matchesPlayed,
                    runs: totalRuns,
                    balls: totalBalls,
                    fours: totalFours,
                    sixes: totalSixes,
                    highest: highestScore,
                    average: average,
                    strikeRate: strikeRate,
                    wickets: totalWickets
                },
                error: null
            };
        } catch (error) {
            console.error('Get career stats error:', error);
            return { stats: null, error: error.message };
        }
    },
    /**
     * Get all live matches globally
     */
    async getLiveMatches() {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('status', 'live')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { matches: data, error: null };
        } catch (error) {
            console.error('Get live matches error:', error);
            return { matches: [], error: error.message };
        }
    },

    /**
     * Get match details including overs_per_player
     */
    async getMatchDetails(matchId) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (error) throw error;
            return { match: data, error: null };
        } catch (error) {
            console.error('Get match details error:', error);
            return { match: null, error: error.message };
        }
    },

    /**
     * Save or update bowler stats for a specific over
     * Tracks: overs bowled, runs conceded, wickets taken
     */
    async saveBowlerOverStats(matchId, playerId, playerName, overStats) {
        try {
            // Check if bowler already exists in match_bowlers
            const { data: existing } = await supabase
                .from('match_bowlers')
                .select('*')
                .eq('match_id', matchId)
                .eq('player_id', playerId)
                .single();

            let result;

            if (existing) {
                // Update existing - increment overs, add runs, add wickets
                result = await supabase
                    .from('match_bowlers')
                    .update({
                        overs: (existing.overs || 0) + 1,
                        runs_conceded: (existing.runs_conceded || 0) + (overStats.runs || 0),
                        wickets: (existing.wickets || 0) + (overStats.wickets || 0),
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                // Insert new bowler record
                result = await supabase
                    .from('match_bowlers')
                    .insert([{
                        match_id: matchId,
                        player_id: playerId,
                        player_name: playerName,
                        overs: 1,
                        runs_conceded: overStats.runs || 0,
                        wickets: overStats.wickets || 0,
                    }])
                    .select()
                    .single();
            }

            if (result.error) throw result.error;
            return { bowler: result.data, error: null };
        } catch (error) {
            console.error('Save bowler over stats error:', error);
            return { bowler: null, error: error.message };
        }
    },

    /**
     * Increment wicket count for a bowler (called when wicket falls)
     */
    async addWicketToBowler(matchId, playerId, playerName) {
        try {
            // Check if bowler exists
            const { data: existing } = await supabase
                .from('match_bowlers')
                .select('*')
                .eq('match_id', matchId)
                .eq('player_id', playerId)
                .single();

            let result;

            if (existing) {
                result = await supabase
                    .from('match_bowlers')
                    .update({
                        wickets: (existing.wickets || 0) + 1,
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                // Create new bowler entry with 1 wicket
                result = await supabase
                    .from('match_bowlers')
                    .insert([{
                        match_id: matchId,
                        player_id: playerId,
                        player_name: playerName,
                        overs: 0,
                        runs_conceded: 0,
                        wickets: 1,
                    }])
                    .select()
                    .single();
            }

            if (result.error) throw result.error;
            return { bowler: result.data, error: null };
        } catch (error) {
            console.error('Add wicket to bowler error:', error);
            return { bowler: null, error: error.message };
        }
    },

    /**
     * Save match as a template for reuse
     * Silently fails if table doesn't exist
     */
    async saveMatchTemplate(scorerId, templateName, matchConfig) {
        try {
            const { data, error } = await supabase
                .from('match_templates')
                .insert([{
                    scorer_id: scorerId,
                    template_name: templateName,
                    match_name: matchConfig.match_name,
                    location: matchConfig.location,
                    overs_per_player: matchConfig.overs_per_player,
                    player_ids: matchConfig.player_ids || [],
                    player_names: matchConfig.player_names || [],
                }])
                .select()
                .single();

            // Handle missing table gracefully
            if (error) {
                if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
                    console.log('match_templates table not created yet - skipping save');
                    return { template: null, error: null };
                }
                throw error;
            }
            return { template: data, error: null };
        } catch (error) {
            console.error('Save match template error:', error);
            return { template: null, error: error.message };
        }
    },

    /**
     * Get saved match templates for a scorer
     * Returns empty array if table doesn't exist yet
     */
    async getMatchTemplates(scorerId) {
        try {
            const { data, error } = await supabase
                .from('match_templates')
                .select('*')
                .eq('scorer_id', scorerId)
                .order('created_at', { ascending: false });

            // Handle missing table gracefully
            if (error) {
                if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
                    // Table doesn't exist yet - return empty
                    console.log('match_templates table not created yet');
                    return { templates: [], error: null };
                }
                throw error;
            }
            return { templates: data, error: null };
        } catch (error) {
            console.error('Get match templates error:', error);
            return { templates: [], error: error.message };
        }
    },

    /**
     * Update batsman's overs faced count
     * Silently fails if column doesn't exist
     */
    async updateBatsmanOversFaced(matchId, playerId, oversFaced) {
        try {
            const { data, error } = await supabase
                .from('match_players')
                .update({ overs_faced: oversFaced })
                .eq('match_id', matchId)
                .eq('player_id', playerId)
                .select()
                .single();

            // Handle missing column gracefully
            if (error) {
                if (error.code === 'PGRST204' || error.message?.includes('Could not find')) {
                    // Column doesn't exist - overs tracking handled locally in app
                    return { player: null, error: null };
                }
                throw error;
            }
            return { player: data, error: null };
        } catch (error) {
            console.error('Update batsman overs faced error:', error);
            return { player: null, error: error.message };
        }
    },
};

export default matchService;
