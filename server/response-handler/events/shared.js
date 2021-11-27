const MySQL = require('../../middleware/mysql-service');
const purgePoolRound = async(eventId, eventRoundId) => {
    await MySQL.runCommand(`DELETE FROM beaches.pool_scores where pool_id IN 
        (select pool_id from beaches.pools where event_id = ${eventId} AND event_round_id = ${eventRoundId})`);
    await MySQL.runCommand(`DELETE FROM beaches.pool_athletes where pool_id IN 
        (select pool_id from beaches.pools where event_id = ${eventId} AND event_round_id = ${eventRoundId})`);
    await MySQL.runCommand(`DELETE FROM beaches.pools where event_id = ${eventId} AND event_round_id = ${eventRoundId}`);
    await MySQL.runCommand(`DELETE FROM beaches.event_round_athletes where event_id = ${eventId} AND event_ranking_round_id = ${eventRoundId}`);
};

const requestRegisteredAthletes = async (eventId, myUserId) => {
    const athletesQuery = `SELECT 
            er.event_id,
            er.athlete_id,
            CONCAT(ap.first_name, ' ', UPPER(ap.last_name)) athlete_name,
            c.club_abbreviation club,
            c.club_name,
            er.checked_in,
            er.consent_signed,
            er.registration_paid,
            era.rank entry_ranking,
            CASE WHEN (
                EXISTS (SELECT au.user_id FROM beaches.athlete_users au WHERE au.user_id = ${myUserId} AND au.athlete_id = er.athlete_id)
                OR (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y'
                OR EXISTS(select role_id FROM beaches.user_roles where role_id = 3 AND user_id = ${myUserId}))
            THEN 'Y' ELSE 'N' END has_access
            FROM beaches.event_registrations er 
            INNER JOIN beaches.athlete_profiles ap ON ap.athlete_id = er.athlete_id
            LEFT JOIN beaches.clubs c ON c.club_id = ap.club_id
            LEFT JOIN beaches.event_round_athletes era ON era.event_ranking_round_id = 0 AND era.event_id = er.event_id AND era.athlete_id = er.athlete_id
            WHERE er.event_id = ${eventId}
            ORDER BY -era.rank DESC,  CONCAT(ap.first_name, ' ', UPPER(ap.last_name))`;
    return await MySQL.runQuery(athletesQuery);
}

module.exports = {
    purgePoolRound,
    requestRegisteredAthletes
}