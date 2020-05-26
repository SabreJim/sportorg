const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { fitnessGroupSchema, getCleanBody } = require('../middleware/request-sanitizer');
const getUserId = (req) =>  req.session.user_id;
const cleanSelected = (queryResult) => {
    if (queryResult && queryResult.length) {
        return queryResult.map((type) => {
            type.isSelected = (type.isSelected === 'Y');
            return type;
        });
    } else {
        return [];
    }
}

const getMyGroups = async (req, res) => {
    const myUserId = getUserId(req);
    // get groups that the user is allowed to see and/or administer
    let statement = `SELECT distinct
                        fg.group_id,
                        fg.name,
                        fg.description,
                        fg.is_closed,
                        (CASE WHEN uga.user_id IS NULL THEN 'N' ELSE 'Y' END) is_admin,
                        ag.group_members
                    FROM beaches.fitness_groups fg
                        LEFT JOIN (SELECT user_id, group_id FROM beaches.user_group_admins WHERE user_id = ?) uga ON uga.group_id = fg.group_id 
                        LEFT JOIN (SELECT count(ag.athlete_id) group_members, ag.group_id from beaches.athlete_groups ag GROUP BY ag.group_id) ag ON ag.group_id = fg.group_id
                        WHERE fg.is_closed = 'N' 
                            OR (fg.is_closed = 'Y' AND uga.user_id IS NOT NULL)`;
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
const getMyAgeCategories = async (req, res) => { returnResults(res, []); }
const getMyAthleteTypes = async (req, res) => {
    returnResults(res, []);
}
const getGroupExercises = async (req, res) => {
    const myUserId = getUserId(req);
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) return returnResults(res, []);
    // get exercises and their selected state for a group
    const statement = `SELECT distinct
            e.*,
            (CASE WHEN eg.exercise_id IS NULL THEN 'N' ELSE 'Y' END) is_selected
            FROM beaches.exercises e
            LEFT JOIN (SELECT exercise_id FROM beaches.exercise_groups where group_id = ${groupId}) eg on eg.exercise_id = e.exercise_id
            INNER JOIN beaches.user_group_admins uga ON (${groupId} = -1 OR uga.group_id = ${groupId}) AND uga.user_id = ${myUserId}
        WHERE e.is_deleted = 'N'
`;
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult));
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
            LEFT JOIN (SELECT athlete_type_id FROM beaches.athlete_type_groups where group_id = ${groupId}) atg on atg.athlete_type_id = at.athlete_type_id
            INNER JOIN beaches.user_group_admins uga ON (${groupId} = -1 OR uga.group_id = ${groupId}) AND uga.user_id = ${myUserId}
`;
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult));
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
            LEFT JOIN (SELECT age_id FROM beaches.age_category_groups where group_id = ${groupId}) acg on acg.age_id = ag.age_id
            INNER JOIN beaches.user_group_admins uga ON (${groupId} = -1 OR uga.group_id = ${groupId}) AND uga.user_id = ${myUserId}
    `;
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult));
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
            ap.compete_gender,
            ap.fitness_level,
            (CASE WHEN ag.athlete_id IS NULL THEN 'N' ELSE 'Y' END) is_selected
        FROM beaches.athlete_profiles ap
            INNER JOIN (SELECT athlete_id FROM beaches.athlete_groups where group_id = ${groupId}) ag on ag.athlete_id = ag.athlete_id
            INNER JOIN beaches.user_group_admins uga ON (${groupId} = -1 OR uga.group_id = ${groupId}) AND uga.user_id = ${myUserId}
    `;
    // TODO: to see non-selected athletes, switch first join from INNER to LEFT
    let queryResult = await MySQL.runQuery(statement);
    returnResults(res, cleanSelected(queryResult));
}

const assignProfileGroups = async (req, res) => { returnResults(res, []); }
const setGroupAdmins = async (req, res) => { returnResults(res, []); }
const upsertGroup = async (req, res) => {
    const myUserId = getUserId(req);
    // fitness admin required to add group
    if (req.session.isFitnessAdmin !== 'Y') {
        return returnSingle(res, {message: 'not permitted to add or edit groups'});
    }
    if (req.body.groupId > 0) {
        try {
            const groupsToAdmin = JSON.parse(req.session.fitnessGroupAdmins);
            if (!groupsToAdmin.contains(req.body.groupId)){
                return returnSingle(res, {message: 'not permitted to edit this group'});
            }
        } catch (err) {
            console.log('error reading groups to admin', err);
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
    const myUserId = getUserId(req);
    const groupId = req.body.groupId || -1;
    const exerciseId = req.body.exerciseId || -1;
    const state = (req.body.state === true);
    console.log('GOT state request', groupId, exerciseId, state);
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


module.exports = {
    getMyGroups,
    getMyAgeCategories,
    getMyAthleteTypes,
    getGroupExercises,
    getGroupTypes,
    getGroupAges,
    getGroupAthletes,
    assignProfileGroups,
    setGroupAdmins,
    upsertGroup,
    selectExerciseGroup
};