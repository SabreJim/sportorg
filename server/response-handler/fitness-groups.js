const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError, parseHtmlFields, cleanSelected } = require('../middleware/response-handler');
const { fitnessGroupSchema, getCleanBody } = require('../middleware/request-sanitizer');
const getUserId = (req) =>  req.session.user_id;

const confirmGroupAccess = (groupId, session) => {
    try {
        const groupsToAdmin = JSON.parse(session.fitnessGroupAdmins);
        if (!groupsToAdmin.includes(groupId)){
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

const getMyGroups = async (req, res) => {
    const myUserId = getUserId(req);
    const athleteId = parseInt(req.params.athleteId);
    // get groups that an athlete can join
    let statement = `SELECT distinct
                        fg.group_id,
                        fg.name,
                        fg.description,
                        fg.is_closed,
                        (CASE WHEN ai.invitee_id IS NOT NULL THEN 'Y' ELSE 'N' END) is_invited,
                        (CASE WHEN ag.athlete_id IS NOT NULL THEN 'Y' ELSE 'N' END) is_selected
                    FROM beaches.fitness_groups fg
                        LEFT JOIN beaches.athlete_groups ag ON ag.group_id = fg.group_id AND ag.athlete_id = ${athleteId}
                        LEFT JOIN beaches.access_invites ai ON ai.invite_offer_type = 'fitness_group' 
                            AND ai.invite_offered_id = fg.group_id AND ai.invitee_id = ${athleteId} AND ai.expire_date >= CURDATE()
                    WHERE fg.is_closed = 'N' 
                        OR (fg.is_closed = 'Y' AND (ag.athlete_id IS NOT NULL OR ai.invitee_id IS NOT NULL))`;
    let queryResult = await MySQL.runQuery(statement, [myUserId]);
    if (queryResult && queryResult.length) {
        returnResults(res, cleanSelected(queryResult, ['isSelected']));
    } else {
        returnResults(res, []);
    }
}
const getGroupsAdmin = async (req, res) => {
    const myUserId = getUserId(req);
    // get groups that the user is allowed to see and administer
    let statement = `SELECT distinct
                        fg.group_id,
                        fg.name,
                        fg.description,
                        fg.is_closed,
                        (CASE WHEN uga.user_id IS NULL THEN 'N' ELSE 'Y' END) is_admin,
                        ag.group_members
                    FROM beaches.fitness_groups fg
                        INNER JOIN beaches.user_group_admins uga ON uga.group_id = fg.group_id AND uga.user_id = ?
                        LEFT JOIN (SELECT count(ag.athlete_id) group_members, ag.group_id from beaches.athlete_groups ag 
                            GROUP BY ag.group_id) ag ON ag.group_id = fg.group_id`;
    let queryResult = await MySQL.runQuery(statement, [myUserId]);
    if (queryResult && queryResult.length) {
        queryResult = queryResult.map((group) => {
            group.isAdmin = (group.isAdmin === 'Y');
            group.isClosed = (group.isClosed === 'Y');
            return group;
        });
        returnResults(res, queryResult);
    } else {
        returnResults(res, []);
    }
}

const getGroupExercises = async (req, res) => {
    const myUserId = getUserId(req);
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return returnResults(res, []);
    // get exercises and their selected state for a group
    const statement = `SELECT distinct
            e.*,
            (CASE WHEN eg.exercise_id IS NULL THEN 'N' ELSE 'Y' END) is_selected,
            (CASE WHEN e.owner_group_id = ${groupId} THEN 'Y' ELSE 'N' END) row_edit
            FROM beaches.exercises e
            LEFT JOIN beaches.exercise_groups eg on eg.exercise_id = e.exercise_id  AND group_id = ${groupId} 
            INNER JOIN beaches.user_group_admins uga ON uga.group_id = ${groupId} AND uga.user_id = ${myUserId}
        WHERE e.is_deleted = 'N' `;
    let queryResult = await MySQL.runQuery(statement);
    queryResult = parseHtmlFields(queryResult, ['description']);
    returnResults(res, cleanSelected(queryResult, ['isSelected', 'rowEdit']));
}
const getGroupTypes = async (req, res) => {
    const myUserId = getUserId(req);
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return returnResults(res, []);
    // get athlete types and their selected state for a group
    const statement = `SELECT distinct
            at.athlete_type_id,
            at.type_name,
            (CASE WHEN atg.athlete_type_id IS NULL THEN 'N' ELSE 'Y' END) is_selected
            FROM beaches.athlete_types at
            LEFT JOIN beaches.athlete_type_groups atg on atg.athlete_type_id = at.athlete_type_id AND group_id = ${groupId}
            INNER JOIN beaches.user_group_admins uga ON uga.group_id = ${groupId} AND uga.user_id = ${myUserId}
`;
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult, ['isSelected']));
}
const getGroupAges = async (req, res) => {
    const myUserId = getUserId(req);
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return returnResults(res, []);
    // get athlete types and their selected state for a group
    const statement = `SELECT distinct
            ag.age_id,
            ag.label,
            ag.min,
            ag.max,
            (CASE WHEN acg.age_id IS NULL THEN 'N' ELSE 'Y' END) is_selected
        FROM beaches.age_categories ag
            LEFT JOIN beaches.age_category_groups acg on acg.age_id = ag.age_id AND group_id = ${groupId}
            INNER JOIN beaches.user_group_admins uga ON (${groupId} = -1 OR uga.group_id = ${groupId}) AND uga.user_id = ${myUserId}
    `;
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult, ['isSelected']));
}
const getGroupAthletes = async (req, res) => {
    const myUserId = getUserId(req);
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return returnResults(res, []);
    // get athlete types and their selected state for a group
    const statement = `SELECT distinct
            ap.athlete_id,
            CONCAT(UPPER(ap.last_name), ', ', ap.first_name) athlete_name,
            ap.year_of_birth,
            g.gender_name,
            ap.fitness_level,
            (CASE WHEN COALESCE(ag.athlete_id, ai.invitee_id) IS NULL THEN 'N' ELSE 'Y' END) is_selected
        FROM beaches.athlete_profiles ap
            INNER JOIN beaches.genders g ON g.gender_id = ap.compete_gender_id
            LEFT JOIN beaches.athlete_groups ag ON ag.athlete_id = ap.athlete_id AND group_id = ${groupId}
            LEFT JOIN beaches.access_invites ai ON ai.invite_offer_type = 'fitness_group' 
                AND ai.invite_offered_id = ${groupId} AND invitee_type = 'athlete' AND invitee_id = ap.athlete_id
                AND ai.expire_date >= CURDATE()
            INNER JOIN beaches.user_group_admins uga ON uga.group_id = ${groupId} AND uga.user_id = ${myUserId}
    `;
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult, ['isSelected']));
}

const assignProfileGroups = async (req, res) => {
    // TODO: user joins a group. Remove any pending invites
    returnResults(res, []);
}
const setGroupAdmins = async (req, res) => { returnResults(res, []); }
const upsertGroup = async (req, res) => {
    const myUserId = getUserId(req);
    // fitness admin required to add group
    if (req.session.isFitnessAdmin !== 'Y') {
        return returnSingle(res, {message: 'not permitted to add or edit groups'});
    }
    if (req.body.groupId > 0) {
        if (!confirmGroupAccess(req.body.groupId, req.session)){
            return returnSingle(res, {message: 'not permitted to edit this group'});
        }
    }

    try {
        const cleanGroup = getCleanBody(req.body, fitnessGroupSchema).cleanBody;
        if (cleanGroup.description == null) {
            cleanGroup.description = ' ';
        }
        let statement = `INSERT INTO beaches.fitness_groups (name, description, is_closed) 
                         VALUES ('${cleanGroup.name}', '${cleanGroup.description}','${cleanGroup.isClosed}')`;
        let statementResult;
        if (cleanGroup.groupId > 0) {
            statement = `UPDATE beaches.fitness_groups SET 
                         name = '${cleanGroup.name}', 
                         description = '${cleanGroup.description}',
                         is_closed = '${cleanGroup.isClosed}'
                         WHERE group_id = ${cleanGroup.groupId}`;
            statementResult = await MySQL.runCommand(statement);
        } else {
            // insert and add permissions
            statementResult = await MySQL.runCommand(statement);
            cleanGroup.groupId = statementResult.insertId;
            statement = `INSERT INTO beaches.user_group_admins (user_id, group_id) VALUES (${myUserId}, ${cleanGroup.groupId})`;
            statementResult = await MySQL.runCommand(statement);
        }
        if (statementResult && statementResult.affectedRows) {
            // continue updating intersection tables
            statement = `DELETE FROM beaches.athlete_type_groups WHERE group_id = ${cleanGroup.groupId}`;
            await MySQL.runCommand(statement);
            for (let i = 0; i < cleanGroup.athleteTypeIds.length; i++) {
                statement = `INSERT INTO beaches.athlete_type_groups (athlete_type_id, group_id) 
                            VALUES (${cleanGroup.athleteTypeIds[i]}, ${cleanGroup.groupId})`;
                statementResult = await MySQL.runCommand(statement);
            }
            statement = `DELETE FROM beaches.age_category_groups WHERE group_id = ${cleanGroup.groupId}`;
            await MySQL.runCommand(statement);
            for (let i = 0; i < cleanGroup.ageCategoryIds.length; i++) {
                statement = `INSERT INTO beaches.age_category_groups (age_id, group_id) 
                            VALUES (${cleanGroup.ageCategoryIds[i]}, ${cleanGroup.groupId})`;
                statementResult = await MySQL.runCommand(statement);
            }
            returnSingle(res, true);
        } else {
            return returnError(res, 'An error occurred when updating this record');
        }
    } catch (err) {
        console.log('error saving group', err);
        returnSingle(res, {message: 'error attempting to edit group'});
    }
}

const selectExerciseGroup = async (req, res) => {
    const groupId = req.body.groupId || -1;
    const exerciseId = req.body.exerciseId || -1;
    const state = (req.body.state === true);
    if (groupId < 0 || exerciseId < 0) return returnResults(res, []);
    // remove all links for that exercise, group pair
    let statement = `DELETE FROM beaches.exercise_groups WHERE group_id = ${groupId} AND exercise_id = ${exerciseId}`;
    await MySQL.runCommand(statement);
    // add back in if state === true
    if (state) {
        statement = `INSERT INTO beaches.exercise_groups (group_id, exercise_id) VALUES (${groupId}, ${exerciseId})`;
        await MySQL.runCommand(statement);
    }
    returnResults(res, true);
}

const inviteToGroup = async (req, res) => {
    const groupId = req.body.groupId || -1;
    const athleteId = req.body.athleteId || -1;
    if (!confirmGroupAccess(groupId, req.session)){
        return returnSingle(res, {message: 'not permitted to edit this group'});
    }
    // delete any existing invites
    let statement = `DELETE FROM beaches.access_invites 
        WHERE invite_offer_type = 'fitness_group' AND invite_offered_id = ${groupId}
        AND invitee_type = 'athlete' AND invitee_id = ${athleteId}
    `;
    await MySQL.runCommand(statement);
    // add a new invite that expires in 7 days
    statement = `INSERT INTO beaches.access_invites
        (invite_offer_type, invite_offered_id, invitee_type, invitee_id, offer_date, expire_date)
        VALUES
        ('fitness_group', ${groupId}, 'athlete', ${athleteId}, CURDATE(), CURDATE() + interval 7 day);
    `;
    let statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        return returnSingle(res, true);
    } else {
        return returnSingle(res, false);
    }
}
const removeFromGroup = async (req, res) => {
    const groupId = req.body.groupId || -1;
    const athleteId = req.body.athleteId || -1;
    // delete any existing invites
    let statement = `DELETE FROM beaches.access_invites 
        WHERE invite_offer_type = 'fitness_group' AND invite_offered_id = ${groupId}
        AND invitee_type = 'athlete' AND invitee_id = ${athleteId}
    `;
    await MySQL.runCommand(statement);
    // also delete any athlete_group records
    statement = `DELETE FROM beaches.athlete_groups 
        WHERE group_id = ${groupId} AND athlete_id = ${athleteId}
    `;
    await MySQL.runCommand(statement);
    returnSingle(res, true);
}

const joinGroup = async (req, res) => {
    const groupId = req.body.groupId || -1;
    const athleteId = req.body.athleteId || -1;
    // delete any existing invites
    let statement = `DELETE FROM beaches.access_invites 
        WHERE invite_offer_type = 'fitness_group' AND invite_offered_id = ${groupId}
        AND invitee_type = 'athlete' AND invitee_id = ${athleteId}
    `;
    await MySQL.runCommand(statement);
    // add the athleteGroup record if one doesn't exist
    statement = `INSERT INTO beaches.athlete_groups (athlete_id, group_id) 
        (SELECT ${athleteId}, ${groupId} where 
            (SELECT count(*) FROM beaches.athlete_groups 
                WHERE athlete_id = ${athleteId} AND group_id = ${groupId}) = 0)`;
    let statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        return returnSingle(res, true);
    } else {
        return returnSingle(res, false);
    }
}

module.exports = {
    getMyGroups,
    getGroupsAdmin,
    getGroupExercises,
    getGroupTypes,
    getGroupAges,
    getGroupAthletes,
    assignProfileGroups,
    setGroupAdmins,
    upsertGroup,
    selectExerciseGroup,
    inviteToGroup,
    removeFromGroup,
    joinGroup
};