const MySQL = require('../../middleware/mysql-service');
const Shared = require('./shared');
const { returnResults, returnSingle, returnError, cleanSelected, getDateOnly } = require('../../middleware/response-handler');
const { getCleanBody, getIdFilter, getMultiFilter, PoolScoreSchema } = require('../../middleware/request-sanitizer');

const getRoundPools = async(req, res) => {
    const eventId = Number(req.params.eventId);
    const eventRoundId = Number(req.params.eventRoundId);
    const query = `SELECT
        p.pool_id,
        CONCAT('Pool ', p.pool_number) pool_name,
        p.referee_id,
        p.assigned_piste,
        (SELECT COUNT(1) FROM beaches.pool_scores ps WHERE ps.pool_id = p.pool_id) matches_num,
        (SELECT COUNT(1) FROM beaches.pool_scores ps WHERE ps.pool_id = p.pool_id
            AND ps.completed = 'Y') completed_matches,
        p.last_update_index
    FROM beaches.pools p
    WHERE p.event_id = ${eventId} AND event_round_id = ${eventRoundId}`;
    const results = await MySQL.runQuery(query);

    for (let pool of results) {
        const athleteQuery = `SELECT
            pa.athlete_id,
            ap.first_name,
            ap.last_name,
            c.club_abbreviation club,
            pa.order_number pool_order,
            era.rank round_rank
        FROM beaches.pool_athletes pa 
        INNER JOIN beaches.athlete_profiles ap ON ap.athlete_id = pa.athlete_id
        LEFT JOIN beaches.clubs c ON c.club_id = ap.club_id
        INNER JOIN beaches.event_round_athletes era ON era.athlete_id = pa.athlete_id 
            AND era.event_id = ${eventId} AND era.event_ranking_round_id = ${eventRoundId - 1}
        WHERE pa.pool_id = ${pool.poolId}
        order by pa.order_number ASC`;
        pool.athletes = await MySQL.runQuery(athleteQuery);
    }
    returnResults(res, results);
}

const getPool = async(req, res) => {
    const poolId = Number(req.params.poolId);
    const getPool = await MySQL.runQuery(`SELECT p.pool_id, p.event_id, p.event_round_id, p.pool_number, p.referee_id, p.assigned_piste, p.last_update_index,
        (SELECT COALESCE(MIN(score_order_num), 1) FROM beaches.pool_scores ps WHERE ps.pool_id = ${poolId} && ps.completed = 'N') current_match,
        er.event_round_status_id
        FROM beaches.pools p 
        INNER JOIN beaches.event_rounds er ON er.event_id = p.event_id AND er.event_round_id = p.event_round_id AND er.round_type_id = 1
        WHERE p.pool_id = ${poolId}`);
    const pool = getPool[0];
    if (!pool) {
        return returnError(res, 'Pool not found');
    }
    const getAthletes = `SELECT
        pa.pool_id,
        pa.athlete_id,
        ap.first_name,
        ap.last_name,
        c.club_abbreviation club,
        pa.order_number pool_order,
        pa.athlete_signature,
        era.rank round_rank,
        era.victories pool_victories,
        (era.victories / era.matches) pool_victory_percent,
        era.matches pool_matches,
        era.hits_scored pool_hits_scored,
        era.hits_received pool_hits_received,
        (era.hits_scored - era.hits_received) pool_diff
    FROM beaches.pool_athletes pa
    INNER JOIN beaches.athlete_profiles ap ON ap.athlete_id = pa.athlete_id
    INNER JOIN beaches.pools p on p.pool_id = pa.pool_id
    INNER JOIN beaches.event_round_athletes era ON era.event_id = p.event_id 
        AND era.event_ranking_round_id = p.event_round_id AND era.athlete_id = pa.athlete_id
    LEFT JOIN beaches.clubs c ON c.club_id = ap.club_id
    WHERE pa.pool_id = ${poolId}
    ORDER BY pa.order_number ASC`;
    pool.athletes = await MySQL.runQuery(getAthletes);

    for (let athlete of pool.athletes) {
        athlete.poolScores = await getPoolScores(poolId, athlete.athleteId);
    }
    const orderQuery = `SELECT 
        ps.athlete1_id,
        CONCAT(pa1.order_number, '-', pa2.order_number) order_text,
        ps.athlete2_id,
        ps.score_order_num,
        ps.completed
        FROM beaches.pool_scores ps 
        INNER JOIN beaches.pool_athletes pa1 ON pa1.pool_id = ps.pool_id AND ps.athlete1_id = pa1.athlete_id
        INNER JOIN beaches.pool_athletes pa2 ON pa2.pool_id = ps.pool_id AND ps.athlete2_id = pa2.athlete_id
        WHERE ps.pool_id = ${poolId}
        ORDER BY score_order_num`;
    pool.boutOrders = await MySQL.runQuery(orderQuery);

    returnSingle(res, pool);
}

const getPoolScores = async(poolId, athleteId) => {
    const getScores = `SELECT 
            ps.pool_id,
            ps.athlete1_id athlete_id,
            athlete1_score score,
            ps.athlete2_id vs_athlete,
            ps.athlete2_score vs_score,
            ps.score_order_num,
            pa.order_number vs_order,
            ps.completed
        FROM beaches.pool_scores ps
        INNER JOIN beaches.pool_athletes pa ON pa.pool_id = ps.pool_id AND pa.athlete_id = ps.athlete2_id 
        WHERE ps.pool_id = ${poolId} AND ps.athlete1_id = ${athleteId}
        UNION ALL 
        SELECT 
            ps.pool_id,
            ps.athlete2_id athlete_id,
            athlete2_score score,
            ps.athlete1_id vs_athlete,
            ps.athlete1_score vs_score,
            ps.score_order_num,
            pa.order_number vs_order,
            ps.completed
        FROM beaches.pool_scores ps
        INNER JOIN beaches.pool_athletes pa ON pa.pool_id = ps.pool_id AND pa.athlete_id = ps.athlete1_id 
        WHERE ps.pool_id = ${poolId} AND ps.athlete2_id = ${athleteId}
        UNION ALL 
        SELECT pa.pool_id, pa.athlete_id, null, pa.athlete_id, null, -1, pa.order_number, 'N'
        FROM beaches.pool_athletes pa WHERE pa.pool_id = ${poolId} AND pa.athlete_id = ${athleteId}
        ORDER BY vs_order ASC`;
    return await MySQL.runQuery(getScores);
}

const createPools = async(req, res) => {
    const eventId = Number(req.params.eventId);
    const eventRoundId = Number(req.params.eventRoundId);
    const getRound = await MySQL.runQuery(`SELECT * FROM beaches.event_rounds 
        WHERE event_id = ${eventId} AND event_round_id = ${eventRoundId} AND round_type_id = 1`);
    if (!getRound?.length) {
        return returnError(res, 'No Pool round found');
    }
    if (getRound[0].eventRoundStatusId > 1) { // pools already created, so get rid of them and reset the status
        await Shared.purgePoolRound(eventId, eventRoundId);
        await MySQL.runCommand(`UPDATE beaches.event_rounds set event_round_status_id = 1
            WHERE event_id = ${eventId} AND event_round_id = ${eventRoundId} AND round_type_id = 1`);
        return returnSingle(res, { poolsCleared: true});
    }

    const numberOfPools = getRound[0].numberOfPools;
    if (!numberOfPools) {
        return returnError(res, 'Pools could not be created without more details');
    }
    const registeredAthletes = await Shared.requestRegisteredAthletes(eventId, -1);
    const checkedInFencers = registeredAthletes.filter(a => a.checkedIn === 'Y');

    const putInPools = (fencers) => {
        const pools = [];
        let currentDirection = 1;
        let currentPoolId = 0;
        for (let i = 0; i < numberOfPools; i++) {
            pools.push({ index: i, totalRank: 0, maxByClub: 0, maxClub: null, athletes: []}); // create the buckets
        }
        for (let athlete of fencers) {
            pools[currentPoolId].athletes.push(athlete);
            currentPoolId = currentPoolId + currentDirection;
            if (currentPoolId >= pools.length) {
                currentDirection = -1;
                currentPoolId = pools.length -1;
            } else if (currentPoolId < 0) {
                currentDirection = 1;
                currentPoolId = 0;
            }
        }
        return pools;
    }
    const createdPools = putInPools(checkedInFencers); // slot each fencer into pools

    // attempt to move fencers to reduce club collisions
    const analyzePools = (pools) => {
        for (let pool of pools) {
            pool.clubCounts = {};
            pool.maxByClub = 0;
            pool.maxClub = null;
            for (let athlete of pool.athletes) {
                if (athlete.entryRanking) {
                    pool.totalRank = pool.totalRank + athlete.entryRanking;
                }
                if (pool.clubCounts[athlete.club]) {
                    pool.clubCounts[athlete.club] = pool.clubCounts[athlete.club] + 1;
                } else {
                    pool.clubCounts[athlete.club] = 1;
                }
            }
            for (const [key, value] of Object.entries(pool.clubCounts)) {
                if (value > pool.maxByClub) {
                    pool.maxByClub = value;
                    pool.maxClub = key;
                }
            }
        }
    }

    const attemptSwaps = (pools) => {
        // check if any pools are more weighted by club than others
        let mostClub = 0;
        let mostPool = null;
        let mostClubName = null;
        for (let pool of pools) {
            if (pool.maxByClub > mostClub) {
                mostClub = pool.maxByClub;
                mostPool = pool.index;
                mostClubName = pool.maxClub;
            }
        }
        let findSwapCandidate = pools.find((p) => {
            return p.index !== mostPool && p.maxClub !== mostClubName;
        }); // candidate pool with a different max club
        if (!findSwapCandidate) { // try to find a pool with the same maxClub but at least 2 less members
            findSwapCandidate = pools.find((p) => {
                return p.index !== mostPool && p.maxClub === mostClubName
                    && (mostClub - p.maxByClub) > 1 ;
            });
        }
        if (!findSwapCandidate) {
            return true; // no viable swaps found, so stop checking
        }
        // find the last candidate from the most weighted pool, and the last candidate from the swap pool
        const getLast = (pool) => {
            const tempArr = pool.athletes.slice().reverse();
            const foundLast = tempArr.find(a => a.club === pool.maxClub);
            const reducedArr = pool.athletes.filter(a => a.athleteId !== foundLast.athleteId);
            return { athlete: foundLast, pool: reducedArr, index: pool.index };
        }
        const main = getLast(pools[mostPool]);
        const swap = getLast(findSwapCandidate);
        // swap these two athletes
        pools[main.index].athletes = main.pool; // remove main athlete
        pools[main.index].athletes.push(swap.athlete); // push in swap
        pools[swap.index].athletes = swap.pool;
        pools[swap.index].athletes.push(main.athlete);
        return false;
    }
    const MAX_ATTEMPTS = 10;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        analyzePools(createdPools);
        const result = attemptSwaps(createdPools);
        if (result) {
            break;
        }
    }
    // pools are ready and as protected by club as possible
    // delete all pools, pool_athletes and pool_scores for this round
    await Shared.purgePoolRound(eventId, eventRoundId);

    for (let pool of createdPools) {
        const createPool = await MySQL.runCommand(`INSERT INTO beaches.pools (event_id, event_round_id, pool_number)
            VALUES (${eventId}, ${eventRoundId}, ${pool.index + 1 })`);
        const newPoolId = createPool.insertId;
        let orderNum = 1;
        for (let athlete of pool.athletes) {
            await MySQL.runCommand(`INSERT INTO beaches.pool_athletes (pool_id, athlete_id, order_number)
                VALUES (${newPoolId}, ${athlete.athleteId}, ${orderNum})`);
            orderNum = orderNum + 1;
        }

        const getBoutOrder = await MySQL.runQuery(`SELECT order_string from beaches.pool_match_orders where pool_size = ${pool.athletes.length}`);
        const boutArr = (getBoutOrder[0].orderString).split(',');
        let orderIndex = 1;
        for (let order of boutArr) {
            const ids = order.split('-');
            const athlete1 = pool.athletes[Number(ids[0]) - 1];
            const athlete2 = pool.athletes[Number(ids[1]) - 1];
            await MySQL.runCommand(`INSERT INTO beaches.pool_scores (pool_id, athlete1_id, athlete2_id, score_order_num)
                VALUES (${newPoolId}, ${athlete1.athleteId}, ${athlete2.athleteId}, ${orderIndex})`);
            orderIndex = orderIndex + 1;
        }
        // add empty ranking entries
        await rankCurrentPool(newPoolId);
    }
    // mark the round as 'created'
    await MySQL.runCommand(`UPDATE beaches.event_rounds set event_round_status_id = 2 where event_id = ${eventId} AND event_round_id = ${eventRoundId}`);
    returnSingle(res, {poolsCreated: true});
}

const rankCurrentPool = async (poolId) => {
    const getAthletes = await MySQL.runQuery(`SELECT pa.athlete_id, p.event_id, p.event_round_id 
        FROM beaches.pool_athletes pa
        INNER JOIN beaches.pools p on p.pool_id = pa.pool_id
        WHERE pa.pool_id = ${poolId}`);
    const eventId = getAthletes[0].eventId;
    const eventRoundId = getAthletes[0].eventRoundId;

    for (let athlete of getAthletes) {
        const athleteScores = await getPoolScores(poolId, athlete.athleteId);
        let hs = 0;
        let hr = 0;
        let v = 0;
        let matches = 0;
        for (let score of athleteScores) {
            if (score.scoreOrderNum > 0) { // blank entry for self-match is skipped
                hs = hs + score.score;
                hr = hr + score.vsScore;
                matches = matches + 1;
                if (score.completed === 'Y' && score.score > score.vsScore) {
                    v = v + 1;
                }
            }
        }
        const foundRanking = await MySQL.runQuery(`SELECT athlete_id FROM beaches.event_round_athletes
            WHERE event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId} AND athlete_id = ${athlete.athleteId}`);
        if (foundRanking?.length) {
            // update the ranking
            await MySQL.runCommand(`UPDATE beaches.event_round_athletes
                SET victories = ${v}, matches = ${matches}, hits_scored = ${hs}, hits_received = ${hr}
                WHERE event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId} AND athlete_id = ${athlete.athleteId}`);
        } else {
            // insert a new ranking
            await MySQL.runCommand(`INSERT INTO beaches.event_round_athletes
                (event_id, event_ranking_round_id, athlete_id, victories, matches, hits_scored, hits_received)
                VALUES
                (${eventId}, ${eventRoundId}, ${athlete.athleteId}, ${v}, ${matches}, ${hs}, ${hr})`);
        }
    }
    // pass over the rankings for this round and update all ranks
    const getRoundRanks = await MySQL.runQuery(`SELECT * FROM beaches.event_round_athletes WHERE event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId}`);
    getRoundRanks.sort((a, b) => {
        const aV = a.victories / a.matches;
        const bV = b.victories / b.matches;
        if (aV > bV){
            return -1; // a higher
        } else if (bV > aV) {
            return 1; // b higher
        } else { // by indicators
            const aInd = a.hitScored - a.hitsReceived;
            const bInd = b.hitsScored - b.hitsReceived;
            if (aInd > bInd) {
                return -1;
            } else if (bInd > aInd) {
                return 1;
            } else if (a.hitScored > b.hitScored) {
                return -1; // tie-break on hits scored
            }
            return 0; // complete tie
        }
    });
    let tempRank = 1;
    for (let ranking of getRoundRanks) {
        await MySQL.runCommand(`UPDATE beaches.event_round_athletes SET rank = ${tempRank}
            WHERE event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId} AND athlete_id = ${ranking.athleteId}`);
        tempRank = tempRank + 1;
    }
};

const recordPoolScore = async(req, res) => {
    const cleanScore = getCleanBody(req.body, PoolScoreSchema);
    const poolId = Number(req.params.poolId);
    if (cleanScore.isValid) {
        if (cleanScore.isEdit) {
            const statement = `UPDATE beaches.pool_scores SET ${cleanScore.setters.join(', ')} 
                WHERE pool_id = ${poolId} 
                AND athlete1_id = ${cleanScore.cleanBody.athlete1Id}
                AND athlete2_id = ${cleanScore.cleanBody.athlete2Id}`;
            const statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                // mark the pool as updated
                const getCompletedCount = await MySQL.runQuery(`SELECT 
                    (SELECT count(1) FROM beaches.pool_scores ps WHERE ps.completed = 'N' and ps.pool_id = ${poolId}) pending,
                    (SELECT count(1) FROM beaches.pool_scores where pool_id = ${poolId}) total`);
                const completed = (getCompletedCount[0].pending === 0 && getCompletedCount[0].total > 0) ? 'Y' : 'N';
                await MySQL.runCommand(`UPDATE beaches.pools SET 
                    last_update_index = last_update_index + 1, 
                    current_match = ${cleanScore.cleanBody.scoreOrderNum},
                    completed = '${completed}'
                    WHERE pool_id = ${poolId}`);

                // run rankings for any completed pools. Save rankings in event_round_athletes where round_id = this round
                await rankCurrentPool(poolId);

                if (completed === 'Y') {
                    // if all pools are completed, set the event_round status = 4, other wise set it to 3 (running)
                    const allCompleted = await MySQL.runQuery(`SELECT DISTINCT 
                        round_pools.count_pending , round_pools.pool_id, p.event_id, p.event_round_id
                        FROM beaches.pools p
                        INNER JOIN (SELECT SUM(CASE WHEN ps2.completed = 'N' THEN 1 ELSE 0 END) count_pending, p2.pool_id, p2.event_id, p2.event_round_id 
                            FROM beaches.pool_scores ps2
                            INNER JOIN beaches.pools p2 ON p2.pool_id = ps2.pool_id
                            GROUP BY p2.pool_id, p2.event_id, p2.event_round_id) round_pools 
                        ON round_pools.event_id = p.event_id AND round_pools.event_round_id = p.event_round_id
                        WHERE p.pool_id = ${poolId}`);
                    let roundStatusId = 4;
                    let eventId;
                    let eventRoundId;
                    for (let count of allCompleted) {
                        eventId = count.eventId;
                        eventRoundId = count.eventRoundId;
                        if (count.countPending > 0) {
                            roundStatusId = 3;
                        }
                    }
                    await MySQL.runCommand(`UPDATE beaches.event_rounds set event_round_status_id = ${roundStatusId}
                        WHERE event_id = ${eventId} AND event_round_id = ${eventRoundId}`);
                }

                return returnSingle(res, {
                    poolId: cleanScore.cleanBody.poolId,
                    athlete1Id: cleanScore.cleanBody.athlete1Id,
                    athlete2Id: cleanScore.cleanBody.athlete2Id,
                });
            } else {
                returnError(res, 'Pool Score could not be updated');
            }
        }
    } else {
        returnError(res, 'Pool Score could not be updated');
    }
}

const recordPoolSignature = async(req, res) => {

}

module.exports = {
    getRoundPools,
    getPool,
    createPools,
    recordPoolScore,
    recordPoolSignature
}