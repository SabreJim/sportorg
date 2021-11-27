const MySQL = require('../../middleware/mysql-service');
const { returnResults, returnSingle, returnError, cleanSelected, getDateOnly } = require('../../middleware/response-handler');
const { getCleanBody, getIdFilter, getMultiFilter } = require('../../middleware/request-sanitizer');
const Got = require('got');


const getRankingsList = async(req, res) => {
    let weaponFilter = getIdFilter('athleteType', req.query, 'c.athlete_type_id');
    let ageFilter = getIdFilter('age', req.query, 'c.age_category_id');
    let genderFilter = getIdFilter('gender', req.query, 'c.gender_id');
    let searchFilter = '';
    if (req.query.search && req.query.search.length) {
        searchFilter = ` AND UPPER(c.circuit_name) LIKE UPPER('%${req.query.search}%')`;
    }
    const searchQuery = `SELECT
        c.circuit_id,
        c.circuit_name,
        c.athlete_type_id,
        at.type_name weapon,
        c.age_category_id,
        ac.name age_category,
        c.gender_id,
        g.gender_name gender
        FROM beaches.circuits c
        INNER JOIN beaches.athlete_types at ON at.athlete_type_id = c.athlete_type_id 
        INNER JOIN beaches.age_categories ac ON ac.age_id = c.age_category_id 
        INNER JOIN beaches.genders g ON g.gender_id = c.gender_id 
        WHERE 1 = 1 ${searchFilter} ${weaponFilter}  ${ageFilter} ${genderFilter}`;
    const rankings = await MySQL.runQuery(searchQuery);
    if (rankings) {
        returnSingle(res, rankings);
    } else {
        returnError(res, 'Unable to find the requested event');
    }
};

const getRanking = async (req, res) => {
    const circuitId = req.params.circuitId;
    const ranking = await requestRanking(circuitId);
    returnResults(res, ranking);
};
const requestRanking = async (circuitId) => {
    const searchQuery = `SELECT 
        cr.athlete_id,
        ap.last_name,
        ap.first_name,
        cl.club_abbreviation athlete_club,
        r.region_code athlete_region,
        SUM(cr.points) total_points,
        JSON_ARRAYAGG(JSON_OBJECT(
                    'eventId',  cr.event_id,
                    'eventName',  e.event_name,
                    'points',  cr.points)
                    ) events
        FROM beaches.circuit_results cr
        INNER JOIN beaches.athlete_profiles ap ON ap.athlete_id = cr.athlete_id
        INNER JOIN beaches.events e ON e.event_id = cr.event_id
        LEFT JOIN beaches.clubs cl ON cl.club_id = ap.club_id
        LEFT JOIN beaches.regions r ON r.region_id = ap.region_id
        WHERE cr.circuit_id = ${circuitId}
        GROUP BY cr.athlete_id, ap.last_name, ap.first_name, cl.club_abbreviation, r.region_code
        ORDER BY SUM(cr.points) DESC;`;
    const ranking = await MySQL.runQuery(searchQuery);
    try {
        ranking.map((row, index) => {
            row.events = JSON.parse(row.events); // parse out child JSON
            row.athleteName = `${row.lastName.toUpperCase()}, ${row.firstName}`;
            row.ranking = index + 1;
        });
        return ranking;
    } catch (parseError) {
        return ranking;
    }
}

const updateRanking = async (req, res) => {
    const searchQuery = `SELECT 
        scheduled_event_name, scheduled_event_id, start_date
        FROM beaches.v_scheduled_events
        ORDER BY scheduled_event_name DESC
        ;`;
    const allEvents = await MySQL.runQuery(searchQuery);
    returnResults(res, allEvents);
};
const requestUpdateRankings = async (req, res) => {
    const cffUrl = 'http://fencing.ca/wp-content/results-csv/Ranking 20-Jan-2020.csv';
    try {
        const {body} = await Got(cffUrl);
        const lines = body.split(/\n/);
        let headerRow = lines.shift();
        headerRow = headerRow.split(',');
        const records = [];
        lines.map((row, rowIndex) => {
            const rowArr = row.split(',');
            if (rowArr?.length >= headerRow.length) {
                const rowObj = {};
                headerRow.map((fieldName, headerIndex) => {
                    if (rowArr?.length >= headerIndex) {
                        rowObj[fieldName] = rowArr[headerIndex];
                    }
                });
                records.push(rowObj);
            }
        });
        // split into groupings by weapon/age/gender
        const rankings = {};
        records.map((record) => {
            if (!rankings[record['Event']]) {
                rankings[record['Event']] = [];
            }
            rankings[record['Event']].push(record);
        });

        const definedRankings =  [
            'MMF',   'MME',   'MMS',   'CMF',   'CME',
            'CMS',   'JMF',   'JME',   'JMS',   'U23MF',
            'U23ME', 'U23MS', 'SMF',   'SME',   'SMS',
            'VMF',   'VME',   'VMS',   'V50MF', 'V50ME',
            'V50MS', 'V60MF', 'V60ME', 'V60MS', 'V70MF',
            'V70ME', 'V70MS', 'MWF',   'MWE',   'MWS',
            'CWF',   'CWE',   'CWS',   'JWF',   'JWE',
            'JWS',   'U23WF', 'U23WE', 'U23WS', 'SWF',
            'SWE',   'SWS',   'VWF',   'VWE',   'VWS',
            'V50WF', 'V50WE', 'V50WS', 'V60WF', 'V60WE',
            'V60WS'
        ];

        // go through each ranking and determine if there is an event/circuit to hold those values
        for (const [key, value] of Object.entries(rankings)) {
            const getCircuit = await MySQL.runQuery(`SELECT circuit_id, athlete_type_id, gender_id, age_category_id FROM
                beaches.circuits where national_code = '${key}'`);
            if (!getCircuit?.length || !getCircuit[0].circuitId) {
                continue;
            }
            const circuit = getCircuit[0];
            const getEvent = await MySQL.runQuery(`SELECT MIN(event_id) event_id FROM
                beaches.events where scheduled_event_id IS NULL 
                AND athlete_type_id = ${circuit.athleteTypeId}
                AND gender_id = ${circuit.genderId}
                AND primary_age_category_id = ${circuit.ageCategoryId}`);
            if (!getEvent?.length || !getEvent[0].eventId) {
                continue; // no event found to attach results to
            }
            const eventId = getEvent[0].eventId;

            // for each athlete in the ranking, get their athleteId or add a new athlete record
            for (const athlete of value) {
                const statement = `CALL beaches.update_ranking(
                    '${athlete['First Name']}', '${athlete['Last Name']}', '${athlete['CFF Licence'] || ''}', ${athlete['Total']},
                    '${athlete['Club']}', '${athlete['Prov']}', ${circuit.circuitId}, ${eventId})`;
                const addedRanking = await MySQL.runCommand(statement);
            }
        }

    } catch (restError) {
        console.error('attempting to read in 3rd party rankings', cffUrl, restError)
    }
    returnResults(res, []);
};
const updateCircuit = async (req, res) => {
    const searchQuery = `SELECT 
        scheduled_event_name, scheduled_event_id, start_date
        FROM beaches.v_scheduled_events
        ORDER BY scheduled_event_name DESC
        ;`;
    const allEvents = await MySQL.runQuery(searchQuery);
    returnResults(res, allEvents);
};
// get one specific circuit
const getCircuit = async (req, res) => {
    const circuitId = req.params.circuitId;
    const searchQuery = `SELECT 
        circuit_id, circuit_name, athlete_type_id, age_category_id, event_region_id, max_event_num, gender_id, national_code
        FROM beaches.circuits
        WHERE circuit_id = ${circuitId}`;
    const circuits = await MySQL.runQuery(searchQuery);
    if (circuits?.length === 1) {
        returnSingle(res, circuits[0]);
    } else {
        returnError(res, 'Event circuit could not be found');
    }
};

const getEventRoundRankings = async(req, res) => {
    const eventId = Number(req.params.eventId);
    const eventRoundId = Number(req.params.eventRoundId);
    const rankingQuery = `SELECT
            era.athlete_id,
            ap.first_name,
            ap.last_name,
            c.club_abbreviation club,
            era.rank round_rank,
            era.victories pool_victories,
            (era.victories / era.matches) pool_victory_percent,
            era.matches pool_matches,
            era.hits_scored pool_hits_scored,
            era.hits_received pool_hits_received,
            (era.hits_scored - era.hits_received) pool_diff,
            era.promoted
        FROM beaches.event_round_athletes era 
        INNER JOIN beaches.athlete_profiles ap ON ap.athlete_id = era.athlete_id
        LEFT JOIN beaches.clubs c ON c.club_id = ap.club_id
        WHERE era.event_id = ${eventId} and era.event_ranking_round_id = ${eventRoundId}
        ORDER BY era.rank ASC;`
    const rankings = await MySQL.runQuery(rankingQuery);
    returnResults(res, rankings);
}

module.exports = {
    getRankingsList,
    getRanking,
    requestRanking,
    updateRanking,
    requestUpdateRankings,
    updateCircuit,
    getCircuit,
    getEventRoundRankings
}