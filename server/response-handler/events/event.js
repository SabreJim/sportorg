const MySQL = require('../../middleware/mysql-service');
const { returnResults, returnSingle, returnError, cleanSelected, getDateOnly } = require('../../middleware/response-handler');
const { scheduledEventSchema, EventItemSchema, EventRoundSchema, getCleanBody, getMultiFilter } = require('../../middleware/request-sanitizer');
const Ranking = require('./rankings');
const Shared = require('./shared');

const logAction = async (entityId, entity, action, value, id, userId) => {
    let logStatement;
    try {
        logStatement = `INSERT INTO beaches.log_actions
            (entity_id, entity_type, action_name, ${value ? 'new_value' : 'new_id'}, user_id )
            VALUES
            (${entityId}, '${entity}', '${action}', ${value ? "'" + value + "'" : id }, ${userId})`;
        await MySQL.runCommand(logStatement);
    } catch (logError) {
        console.log('error logging action', logStatement);
    }

}

const getScheduledEvent = async(req, res) => {
    const eventId = req.params.eventId;
    const searchQuery = `SELECT 
        scheduled_event_name, scheduled_event_id, host_club_id, host_club_name, event_logo_id, location_name, location_address, start_date, end_date,
        registration_deadline_date, map_link_url, contact_email, external_registration_link, description_html, registration_open
        FROM beaches.v_scheduled_events se
        WHERE scheduled_event_id = ${eventId}`;
    const selectedEvent = await MySQL.runQuery(searchQuery);
    if (selectedEvent?.length === 1) {
        returnSingle(res, selectedEvent[0]);
    } else {
        returnError(res, 'Unable to find the requested event');
    }
};

const getEventsLookup = async (req, res) => {
    const searchQuery = `SELECT 
        scheduled_event_name, scheduled_event_id, start_date
        FROM beaches.v_scheduled_events
        ORDER BY scheduled_event_name DESC
        ;`;
    const allEvents = await MySQL.runQuery(searchQuery);
    returnResults(res, allEvents);
};

const searchAllScheduledEvents = async(req, res) => {
    let weaponFilter = getMultiFilter('athleteType', req.query,
        'se.event_types', 'SELECT type_name FROM beaches.athlete_types WHERE athlete_type_id');
    let ageFilter = getMultiFilter('age', req.query,
        'se.ages', 'SELECT label FROM beaches.age_categories WHERE age_id');

    let searchFilter = '';
    if (req.query.search && req.query.search.length) {
        searchFilter = ` AND UPPER(se.scheduled_event_name) LIKE UPPER('%${req.query.search}%')`;
    }
    const searchQuery = `SELECT 
        scheduled_event_name, scheduled_event_id, host_club_name, location_name, location_address, start_date, end_date,
        registration_deadline_date, ages, event_types
        FROM beaches.v_scheduled_events se
        WHERE 1 = 1  ${ageFilter} ${weaponFilter} ${searchFilter}
        ORDER BY se.start_date DESC
        ;`;
    const allEvents = await MySQL.runQuery(searchQuery);
    returnResults(res, allEvents);
};

const upsertScheduledEvent = async(req, res) => {
    const cleanEvent = getCleanBody(req.body, scheduledEventSchema);
    if (cleanEvent.isValid) {
        let statement;
        let statementResult;
        if (cleanEvent.isEdit){
            statement = `UPDATE beaches.scheduled_events SET ${cleanEvent.setters.join(', ')} WHERE scheduled_event_id = ${cleanEvent.cleanBody.scheduledEventId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, { scheduledEventId: cleanEvent.cleanBody.scheduledEventId});
            }
        } else {
            statement = `INSERT INTO beaches.scheduled_events ${cleanEvent.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            return returnSingle(res, {scheduledEventId: statementResult.insertId});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'Event could not be updated');
    }
};

const deleteScheduledEvent = async(req, res) => {
    ctx.status = 200;
    ctx.body = {updateEvent: true};
    // TODO: implement some way to delete events and all child records
};

// get the events (eg: open sabre) under a scheduledEvent (eg: Fundy Open 2021)
const getEventsList = async(req, res) => {
    const scheduledEventId = req.params.scheduledEventId;
    const searchQuery = `SELECT 
        e.event_id,
        e.event_name,
        e.scheduled_event_id,
        ac.label primary_age_category,
        at.type_name athlete_type,
        DATE_FORMAT(e.event_date, '%b %e, %Y') event_date,
        e.start_time,
        COUNT(er.athlete_id) num_registered
    FROM beaches.events e
    LEFT JOIN beaches.age_categories ac ON ac.age_id = e.primary_age_category_id
    LEFT JOIN beaches.athlete_types at ON at.athlete_type_id = e.athlete_type_id
    LEFT JOIN beaches.event_registrations er ON er.event_id = e.event_id
    WHERE e.scheduled_event_id = ${scheduledEventId}
    GROUP BY e.event_id,
        e.event_name,
        e.scheduled_event_id,
        ac.label,
        at.type_name,
        e.event_date,
        e.start_time; `;

    const selectedEvents = await MySQL.runQuery(searchQuery);
    if (selectedEvents) {
        returnResults(res, selectedEvents);
    } else {
        returnError(res, 'Unable to find the requested event');
    }
};
const getEventItem = async(req, res) => {
    const eventId = req.params.eventId;
    const searchQuery = `SELECT
        e.event_id,
        e.event_name,
        e.scheduled_event_id,
        e.primary_age_category_id,
        e.athlete_type_id,
        e.gender_id,
        DATE_FORMAT(e.event_date, '%b %e, %Y') event_date,
        DATE_FORMAT(se.start_date, '%b %e, %Y') start_date,
        DATE_FORMAT(se.end_date, '%b %e, %Y') end_date,
        e.start_time,
        JSON_ARRAYAGG(ec.circuit_id) selected_circuits
    FROM beaches.events e
    INNER JOIN beaches.scheduled_events se ON se.scheduled_event_id = e.scheduled_event_id
    LEFT JOIN beaches.event_circuits ec ON ec.event_id = e.event_id
    WHERE e.event_id = ${eventId}
    GROUP BY e.event_id`;
    const selectedEvent = await MySQL.runQuery(searchQuery);
    if (selectedEvent?.length === 1) {
        returnSingle(res, selectedEvent[0]);
    } else {
        returnError(res, 'Unable to find the requested event');
    }
}
const upsertEventItem = async(req, res) => {
    const cleanEvent = getCleanBody(req.body, EventItemSchema);
    if (cleanEvent.isValid) {
        let statement;
        let statementResult;
        if (cleanEvent.isEdit) {
            statement = `UPDATE beaches.events SET ${cleanEvent.setters.join(', ')} WHERE event_id = ${cleanEvent.cleanBody.eventId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {eventId: cleanEvent.cleanBody.eventId});
            }
        } else {
            statement = `INSERT INTO beaches.events ${cleanEvent.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            return returnSingle(res, {eventId: statementResult.insertId});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res, 'Event could not be updated');
    }
}

const getEventConfig = async (req, res) => {
    const eventId = req.params.eventId;
    const searchQuery = `SELECT 
        e.event_id,
        e.event_name,
        e.scheduled_event_id,
        e.primary_age_category_id,
        ac.label event_age_category,
        e.athlete_type_id,
        at.type_name athlete_type,
        e.gender_id,
        g.gender_name gender,
        DATE_FORMAT(e.event_date, '%b %e, %Y') event_date,
        e.start_time,
        JSON_ARRAYAGG(c.circuit_id) event_rank_circuit_ids,
        JSON_ARRAYAGG(c.circuit_name) event_rank_circuits,
        e.event_status_id,
        es.status_name event_status,
        e.consent_required,
        (SELECT COUNT(athlete_id) FROM beaches.event_registrations er WHERE er.event_id = e.event_id) registered_num,
            (SELECT COUNT(athlete_id) FROM beaches.event_registrations er WHERE er.event_id = e.event_id 
                    AND er.checked_in = 'Y') checked_in_num,
        (SELECT COUNT(athlete_id) FROM beaches.event_round_athletes era WHERE era.event_id = e.event_id
            AND era.event_ranking_round_id = 0) ranked_num
        FROM beaches.events e
        INNER JOIN beaches.age_categories ac ON ac.age_id = e.primary_age_category_id 
        INNER JOIN beaches.athlete_types at ON at.athlete_type_id = e.athlete_type_id 
        INNER JOIN beaches.genders g ON g.gender_id = e.gender_id
        INNER JOIN beaches.event_statuses es ON es.event_status_id = e.event_status_id 
        LEFT JOIN beaches.event_circuits ec ON ec.event_id = e.event_id
        LEFT JOIN beaches.circuits c ON c.circuit_id = ec.circuit_id
        WHERE e.event_id =  ${eventId}
        GROUP BY e.event_id`;
    const eventResults = await MySQL.runQuery(searchQuery);
    if (eventResults?.length === 1) {
        const selectedEvent = eventResults[0];
        // parse JSON values
        const parseArr = (arrString) => {
            const arr = JSON.parse(arrString);
            return !arr.length || !arr[0] ? [] : arr;
        }
        selectedEvent.eventRankCircuitIds = parseArr(selectedEvent.eventRankCircuitIds);
        selectedEvent.eventRankCircuits = parseArr(selectedEvent.eventRankCircuits);
        // get format values and registered fencers values
        const roundsQuery = `SELECT 
            er.*,
            (SELECT count(1) FROM beaches.event_round_athletes era
                WHERE era.event_id = er.event_id AND era.event_ranking_round_id = er.event_round_id -1) athletes_in_round,
            (SELECT count(1) FROM beaches.event_round_athletes era
                WHERE era.event_id = er.event_id AND era.event_ranking_round_id = er.event_round_id -1
                AND era.promoted = 'Y') athletes_ready,
                CASE WHEN er.round_type_id = 3 THEN 
                    (SELECT er2.event_round_status_id FROM beaches.event_rounds er2 
                    WHERE er2.event_id = er.event_id AND er2.event_round_id = er.event_round_id AND er2.round_type_id != 3) 
                ELSE 0 END related_round_status_id
        FROM beaches.event_rounds er 
        WHERE er.event_id = ${eventId}`;
        selectedEvent.rounds = await MySQL.runQuery(roundsQuery);

        // TODO: add in pools completed/total, DE complete/TOTAL
        for (let round of selectedEvent.rounds) {
           if (round.roundTypeId === 1) {
               const poolCounts = await MySQL.runQuery(`SELECT
                    COUNT(p.pool_id) total_pools,
                    IFNULL(SUM(CASE WHEN p.completed = 'Y' THEN 1 ELSE 0 END), 0) completed_pools,
                    GROUP_CONCAT(pa2.pool_size SEPARATOR ', ') pool_sizes
                    FROM beaches.event_rounds er
                    LEFT JOIN beaches.pools p on p.event_id = er.event_id AND p.event_round_id = er.event_round_id
                    LEFT JOIN (SELECT pa.pool_id, count(pa.athlete_id) pool_size FROM
                    beaches.pool_athletes pa GROUP BY pa.pool_id) pa2 on pa2.pool_id = p.pool_id
                    WHERE er.event_id = ${eventId} AND er.event_round_id = ${round.eventRoundId} AND er.round_type_id = 1`);
               round.poolCount = poolCounts[0].totalPools;
               round.completedPools = poolCounts[0].completedPools;
               round.poolSizes = poolCounts[0].poolSizes;
           }
        }
        returnSingle(res, selectedEvent);
    } else {
        returnError(res, 'Unable to find the requested event');
    }
}

const getEventRegisteredAthletes = async(req, res) => {
    const eventId = req.params.eventId;
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const athletes = await Shared.requestRegisteredAthletes(eventId, myUserId);
    if (athletes) {
    returnResults(res, athletes);
    } else {
        returnError(res, 'Unable to find the requested event athletes');
    }
}

const getMyAthletesByEvent = async(req, res) => {
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const eventId = req.params.eventId;
    const searchQuery = `SELECT DISTINCT
        ap.athlete_id,
        ap.first_name,
        ap.last_name,
        ap.club,
        CASE WHEN EXISTS(SELECT er.athlete_id FROM beaches.event_registrations er 
            WHERE er.event_id = e.event_id AND er.athlete_id = ap.athlete_id)
            THEN 'Y' ELSE 'N' END is_registered
        FROM beaches.v_athlete_profiles ap
        CROSS JOIN beaches.events e
        LEFT JOIN beaches.athlete_users au ON au.athlete_id = ap.athlete_id
        INNER JOIN beaches.age_categories ac ON ac.age_id = e.primary_age_category_id
        WHERE  (au.user_id = ${myUserId} OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS(select role_id FROM beaches.user_roles where role_id = 3 AND user_id = ${myUserId}))
            AND (e.gender_id = 3 OR ap.compete_gender_id = e.gender_id)
            AND (((select private_key from beaches.projects where private_key_id = 'currentYear') - ap.year_of_birth) >= ac.min
            AND ((select private_key from beaches.projects where private_key_id = 'currentYear') - ap.year_of_birth) <= ac.max)
            AND e.event_id = ${eventId}
        ORDER BY ap.last_name ASC, ap.first_name ASC`;
    const selectedAthletes = await MySQL.runQuery(searchQuery);
    if (selectedAthletes) {
        returnResults(res, selectedAthletes);
    } else {
        returnError(res, 'Unable to find your athletes');
    }
}

const setEventAthleteStatus = async (req, res) => {
    const eventId = req.params.eventId;
    const athleteId = req.params.athleteId;
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const status = req.body;
    let statement, statementResult;
    // if registration is being set to true,  add a record
    if (status.hasOwnProperty('registered')) {
        if (status.registered) {
            statement = `INSERT INTO beaches.event_registrations (athlete_id, event_id)
                SELECT ap.athlete_id, e.event_id FROM beaches.athlete_profiles ap
                CROSS JOIN beaches.events e
                LEFT JOIN beaches.athlete_users au ON au.athlete_id = ap.athlete_id
                INNER JOIN beaches.age_categories ac ON ac.age_id = e.primary_age_category_id
                WHERE  (au.user_id = ${myUserId} OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
                    OR EXISTS(select role_id FROM beaches.user_roles where role_id = 3 AND user_id = ${myUserId}))
                AND (e.gender_id = 3 OR ap.compete_gender_id = e.gender_id)
                AND (((select private_key from beaches.projects where private_key_id = 'currentYear') - ap.year_of_birth) >= ac.min
                AND ((select private_key from beaches.projects where private_key_id = 'currentYear') - ap.year_of_birth) <= ac.max)
                AND e.event_id = ${eventId}
                AND ap.athlete_id = ${athleteId}
            ON DUPLICATE KEY UPDATE checked_in = 'N'`;
        await logAction(eventId, 'event', 'register', null, athleteId, myUserId);
        } else {
            statement = `DELETE FROM beaches.event_registrations
            WHERE athlete_id = ${athleteId} AND event_id = ${eventId}
            AND ((SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
            OR EXISTS(select role_id FROM beaches.user_roles where role_id = 3 AND user_id = ${myUserId})
            OR EXISTS (SELECT au.user_id FROM beaches.athlete_users au WHERE au.athlete_id = ${athleteId} AND au.user_id = ${myUserId}))`;
            await logAction(eventId, 'event', 'deregister', null, athleteId, myUserId);
        }
        statementResult = await MySQL.runCommand(statement);
        return returnSingle(res, {eventId: statementResult.insertId});
    } else {
        // all other status setters
        if (status.hasOwnProperty('consentSigned')) {
            // mark the athlete as consentSigned
            const consentStatement = `UPDATE beaches.event_registrations SET consent_signed = '${status.consentSigned ? 'Y' : 'N'}' 
                WHERE event_id = ${eventId} AND athlete_id = ${athleteId};`
            await MySQL.runCommand(consentStatement);
            await logAction(eventId, 'event', 'sign-consent', null, athleteId, myUserId);
            return returnSingle(res, { success: true});
        } else if (status.hasOwnProperty('checkedIn')) {
            // mark the athlete as checkedIn
            const checkinStatement = `UPDATE beaches.event_registrations SET checked_in = '${status.checkedIn ? 'Y' : 'N'}' 
                WHERE event_id = ${eventId} AND athlete_id = ${athleteId};`
            await MySQL.runCommand(checkinStatement);
            await logAction(eventId, 'event', 'check-in', null, athleteId, myUserId);
            return returnSingle(res, { success: true});
        }
    }
}
const setEventStatus = async(req, res) => {
    const eventId = Number(req.params.eventId);
    const eventStatusId = Number(req.params.eventStatusId);
    await MySQL.runCommand(`UPDATE beaches.events SET event_status_id = ${eventStatusId} WHERE event_id = ${eventId}`);
    return returnSingle(res, { success: true});
}
const setEventRoundStatus = async(req, res) => {
    const eventId = Number(req.params.eventId);
    const eventRoundId = Number(req.params.eventRoundId);
    const eventRoundStatusId = Number(req.params.eventRoundStatusId);
    await MySQL.runCommand(`UPDATE beaches.event_rounds SET event_round_status_id = ${eventRoundStatusId} 
        WHERE event_id = ${eventId} AND event_round_id = ${eventRoundId}`);
    if (eventRoundStatusId === 3) {
        await MySQL.runCommand(`UPDATE beaches.events SET event_status = 4 WHERE event_id = ${eventId}`);
    }
    return returnSingle(res, { success: true});
}
const promoteRoundAthletes = async(req, res) => {
    const eventId = Number(req.params.eventId);
    const eventRoundId = Number(req.params.eventRoundId);
    // get the promoted percent
    const config = await MySQL.runQuery(`SELECT promoted_percent FROM beaches.event_rounds
        WHERE event_id = ${eventId} AND event_round_id = ${eventRoundId} AND round_type_id = 3`);
    const promotedPercent = (config && config[0].promotedPercent) ? config[0].promotedPercent : 100;

    // confirm the previous round is ended?

    // get all ranked athletes from the round and promote everyone above the cut-off
    const roundAthletes = await MySQL.runQuery(`SELECT * FROM beaches.event_round_athletes 
        WHERE event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId}
        ORDER BY rank ASC`);
    const promotedNumber = Math.ceil(roundAthletes.length * (promotedPercent/100));

    // update each promoted athlete
    for (let athlete of roundAthletes) {
        let promoted = 'N';
        if (athlete.rank <= promotedNumber) {
            promoted = 'Y';
        }
        await MySQL.runCommand(`UPDATE beaches.event_round_athletes SET promoted = '${promoted}'
            WHERE event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId} AND athlete_id = ${athlete.athleteId}`);
    }

    return returnSingle(res, { success: true});
}

const addEventRound = async (req, res) => {
    const eventId = req.params.eventId;
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    let getMaxRound = `SELECT IFNULL(MAX(er2.event_round_id), 0) current_round
        FROM beaches.events e
        LEFT JOIN beaches.event_rounds er2 ON er2.event_id = e.event_id
        WHERE e.event_id = ${eventId};`;
    const result = await MySQL.runQuery(getMaxRound);
    let roundId = 1;
    let preferredPool = 7;
    if (result && result[0]?.currentRound > 0) {
        roundId = result[0]?.currentRound + 1;
    }
    const insertStatement = `INSERT INTO beaches.event_rounds (event_id, event_round_id, round_type_id, event_round_status_id, preferred_pool_size )
            VALUES (${eventId}, ${roundId}, 1, 1, ${preferredPool})`;
    await MySQL.runCommand(insertStatement);
    // also create a ranking_round record
    await MySQL.runCommand(`INSERT INTO beaches.event_rounds (event_id, event_round_id, round_type_id, event_round_status_id, preferred_pool_size )
            VALUES (${eventId}, ${roundId}, 3, 1, null)`);

    return returnSingle(res, { success: true});
}

const rerunRankings = async (req, res) => {
    const eventId = Number(req.params.eventId);
    const myUserId = (req.session && req.session.user_id) ? req.session.user_id : -1;
    const getStatus = await MySQL.runQuery(`SELECT event_status_id FROM beaches.events where event_id = ${eventId}`);
    if (getStatus && getStatus.eventStatusId > 2) {     // if the event has started, refuse to run rankings
        return returnError(res, 'Rankings cannot be re-run once the event has started');
    }
    const hasRanking = await MySQL.runQuery(`SELECT COUNT(1) count_ranked FROM beaches.event_round_athletes
            WHERE event_id = ${eventId} AND event_ranking_round_id = 0`);
    if (hasRanking[0].countRanked > 0 ) { // already ranked, so clear the rankings instead
        await MySQL.runCommand(`DELETE FROM beaches.event_round_athletes WHERE event_id = ${eventId} AND event_ranking_round_id = 0`);
        return returnSingle(res, { rankingCleared: true});
    }

    let circuitIds = [];
    if (req.body.circuitIds) { // save the updated circuitIds
        await MySQL.runCommand(`DELETE FROM beaches.event_circuits WHERE event_id = ${eventId}`);
        for (let circuitId of req.body.circuitIds) {
            await MySQL.runCommand(`INSERT INTO beaches.event_circuits (event_id, circuit_id) VALUES (${eventId}, ${circuitId})`);
        }
        circuitIds = req.body.circuitIds;
    }
    // get all registered athletes
    const athletes = await Shared.requestRegisteredAthletes(eventId, myUserId);

    const allRankings = [];
    let maxLength = 1;
    // get rankings for each selected circuit
    for (let circuitId of circuitIds) {
        const foundRanking = await Ranking.requestRanking(circuitId);
        allRankings.push(foundRanking);
        if (foundRanking.length > maxLength) {
            maxLength = foundRanking.length;
        }
    }

    // pro-rate rankings if there are multiples
    for (let ranking of allRankings) {
        const currentLength = ranking.length;
        ranking.map((row) => {
            const matchedAthlete = athletes.find(a => a.athleteId === row.athleteId);
            if (matchedAthlete) {
                const scaledRanking = (row.ranking / currentLength) * maxLength;
                if (!matchedAthlete.ranking || scaledRanking < matchedAthlete.ranking) {
                    matchedAthlete.ranking = scaledRanking;
                }
            }
        });
    }
    // purge existing first round rankings
    await MySQL.runCommand(`DELETE FROM beaches.event_round_athletes WHERE event_id = ${eventId} AND event_ranking_round_id = 0`);

    // update each event-ranking
    for (let athleteRanking of athletes) {
        if (!athleteRanking.ranking) { // include unranked athletes
            athleteRanking.ranking = null;
        }
        const promoted = athleteRanking.checkedIn;
        const createRanking = `INSERT INTO beaches.event_round_athletes
            (event_id, event_ranking_round_id, athlete_id, rank, promoted)
            VALUES
            (${eventId}, 0, ${athleteRanking.athleteId}, ${athleteRanking.ranking}, '${promoted}')`;
        await MySQL.runCommand(createRanking);
        // TODO: also pre-calculate the number of athletes in each subsequent round, based on promotedPercent?
    }
    returnSingle(res, { rankingRun: true});
}


const updateEventRound = async (req, res) => {
    const cleanRound = getCleanBody(req.body, EventRoundSchema);
    if (cleanRound.isValid) {
        if (cleanRound.isEdit) {
            let statement = `UPDATE beaches.event_rounds SET ${cleanRound.setters.join(', ')} 
                WHERE event_id = ${cleanRound.cleanBody.eventId} AND event_round_id = ${cleanRound.cleanBody.eventRoundId}
                AND round_type_id = ${cleanRound.cleanBody.roundTypeId}`;
            let statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {eventId: cleanRound.cleanBody.eventRoundId});
            } else { // if changing type, we change the one row that isn't type = 3
                statement = `UPDATE beaches.event_rounds SET ${cleanRound.setters.join(', ')} 
                    WHERE event_id = ${cleanRound.cleanBody.eventId} AND event_round_id = ${cleanRound.cleanBody.eventRoundId}
                    AND round_type_id != 3`;
                await MySQL.runCommand(statement);
                return returnSingle(res, {eventId: cleanRound.cleanBody.eventRoundId});
            }
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res, 'Event Round could not be updated');
    }
}

const deleteEventRound = async (req, res) => {
    const eventId = Number(req.params.eventId);
    const eventRoundId = Number(req.params.eventRoundId);
    await purgeRoundRecords(eventId, eventRoundId);

    const deleteRound = `DELETE FROM beaches.event_rounds where event_id = ${eventId} AND event_round_id = ${eventRoundId}`;
    await MySQL.runCommand(deleteRound);
    returnSingle(res, {eventRoundId: eventRoundId});

}
const purgeRoundRecords = async(eventId, eventRoundId) => {
    // delete all child records of a round
    // when resetting or deleting a round, clean up any child records
    await Shared.purgePoolRound(eventId, eventRoundId);

    // same for DE records

    // purge any rankings from event_round_athletes

}
module.exports = Object.freeze({
    getScheduledEvent,
    getEventsLookup,
    searchAllScheduledEvents,
    upsertScheduledEvent,
    deleteScheduledEvent,
    getEventsList,
    getEventItem,
    upsertEventItem,
    getEventConfig,
    getEventRegisteredAthletes,
    getMyAthletesByEvent,
    setEventAthleteStatus,
    setEventStatus,
    setEventRoundStatus,
    promoteRoundAthletes,
    addEventRound,
    rerunRankings,
    updateEventRound,
    deleteEventRound
});