const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError, parseHtmlFields } = require('../middleware/response-handler');
const { fitnessProfileSchema ,exerciseLogSchema, exerciseSchema, getCleanBody } = require('../middleware/request-sanitizer');
const getUserId = (req) => (req.session && req.session.user_id) ? req.session.user_id : -1;

const BASE_YEAR = 2019;
const  LEVEL_MULTIPLIER = 2;

const getMyProfiles = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnResults(res, []);
    }
    const query = `SELECT distinct ap.* from beaches.v_athlete_profiles ap
            LEFT JOIN beaches.athlete_users au ON au.athlete_id = ap.athlete_id
            LEFT JOIN beaches.athlete_groups ag ON ag.athlete_id = ap.athlete_id
            WHERE  (au.user_id = ${myUserId} OR 
                (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y' OR
                ag.group_id IN (SELECT uga.group_id FROM beaches.user_group_admins uga WHERE uga.user_id = ${myUserId}) )`;

    const profilesResponse = await MySQL.runQuery(query);

    // mySQL doesn't provide an array aggregator, so do this manually
    const profiles = profilesResponse.map(cleanAthleteProfile);
    returnResults(res, profiles);
};

const cleanAthleteProfile = (profile) => {
    let { athleteId, memberId, firstName, lastName, yearOfBirth, competeGender, lastWorkout, fitnessLevel, typeIds } = profile;
    const cleanedProfile = { athleteId, memberId, firstName, lastName, yearOfBirth, competeGender, lastWorkout, fitnessLevel, typeIds };

    cleanedProfile.stats = JSON.parse(profile.stats);
    if (profile.typeIds) {
        cleanedProfile.typeIds = JSON.parse(profile.typeIds);
    } else {
        cleanedProfile.typeIds = [];
    }
    cleanedProfile.typeIds = JSON.parse(profile.typeIds);
    return cleanedProfile;
}

const calculateProgress = (currentLevel, points, levelsGained) => {
    if (!points) return 0;
    let alreadySpent = (levelsGained * (levelsGained - 1));
    if (alreadySpent < 0) alreadySpent = 0;
    const unusedPoints = points - alreadySpent;
    return Math.floor(100 * unusedPoints / (currentLevel * LEVEL_MULTIPLIER));
}
const getAthleteProfile = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnResults(res, []);
    }
    const athleteId = req.params.athleteId;
    const query = `SELECT distinct ap.* from beaches.v_athlete_profiles ap
            LEFT JOIN beaches.athlete_users au ON au.athlete_id = ap.athlete_id
            LEFT JOIN beaches.athlete_groups ag ON ag.athlete_id = ap.athlete_id
            WHERE ap.athlete_id = ${athleteId}  AND
             (au.user_id = ${myUserId} OR 
             (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y' OR
             ag.group_id IN (SELECT uga.group_id FROM beaches.user_group_admins uga WHERE uga.user_id = ${myUserId}) )`;

    const profileResponse = await MySQL.runQuery(query);
    if (profileResponse && profileResponse.length) {
        const profile = cleanAthleteProfile(profileResponse[0]);
        try {
            // get progress as well
            const progressQuery = `SELECT * FROM beaches.v_exercise_delta where athlete_id = ${athleteId}`;
            let prog = await MySQL.runQuery(progressQuery);
            if (!prog || !prog.length) {
                 return returnSingle(res, profile);
            }
            prog = prog[0];
            profile.weeklyFitness =  prog.weeklyFitness;
            profile.fitnessLevelProgress = calculateProgress(prog.userFitnessLevel, prog.weeklyFitness, prog.weeklyFitnessLevelsGained);
             profile.stats = profile.stats.map((stat) => {
                 const findProgress = statNames.find((item) => item.jsField === stat.name);
                 stat.weeklyProgress = prog[`weekly${findProgress.text}`];
                 stat.progress = calculateProgress(prog[`user${findProgress.text}Level`],
                     prog[`weekly${findProgress.text}`], prog[`weekly${findProgress.text}LevelsGained`]);
                 return stat;
             });
            return returnSingle(res, profile);
        } catch (err) {
            return returnSingle(res, profile);
        }
    } else {
        return returnSingle(res, {});
    }
};

const resetProfile = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnSingle(res, {});
    }
    if (!req.session && req.session.isFitnessAdmin !== 'Y') { // not a fitness admin
        return returnSingle(res, {});
    }
    const resetAthlete = req.params.athleteId;
    let statement = 'SELECT beaches.reset_fitness_profile( ? ) as affectedRows';
    const statementResult = await MySQL.runCommand(statement, [resetAthlete ]);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when resetting this profile');
    }
}

const upsertProfile = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnSingle(res, {});
    }
    let body = getCleanBody(req.body, fitnessProfileSchema);
    if (!body.cleanBody.memberId) body.cleanBody.memberId = -1;
    if (!body.cleanBody.typeIds) body.cleanBody.typeIds = [];

    let statement = 'SELECT beaches.upsert_fitness_profile( ? , ? ) as new_id';
    const statementResult = await MySQL.runCommand(statement,
        [myUserId, JSON.stringify(body.cleanBody) ]);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnError(res, 'An error occurred when updating this record');
    }
};

const getLogs = async(req, res, next) => {
    returnResults(res, []);
};
const getMyExercises = async(req, res, next) => {
    // get exercises in any groups I am part of
    const athleteId = req.params.athleteId || -1;
    if (athleteId === -1) return returnSingle(res, []);

    const query = `SELECT distinct e.* FROM beaches.exercises e
        LEFT JOIN beaches.exercise_groups eg ON eg.exercise_id = e.exercise_id
        WHERE eg.group_id IN (SELECT ag.group_id FROM beaches.athlete_groups ag WHERE ag.athlete_id = ${athleteId})`;
    let exerciseResponse = await MySQL.runQuery(query);
    if (exerciseResponse && exerciseResponse.length) {
        exerciseResponse = parseHtmlFields(exerciseResponse, ['description']);
        returnResults(res, exerciseResponse);
    } else {
        returnResults(res, []);
    }
};

const getMyAgeCategories = async (req, res) => {
    const athleteId = req.params.athleteId || -1;
    if (athleteId === -1) return returnSingle(res, []);
    const query = `SELECT distinct
        ac.age_id,
        ac.name,
        ac.label,
        ac.min,
        ac.max
    FROM beaches.age_categories ac
    LEFT JOIN beaches.age_category_groups acg ON acg.age_id = ac.age_id
    WHERE acg.group_id IN (SELECT ag.group_id FROM beaches.athlete_groups ag WHERE ag.athlete_id = ${athleteId})`;
    const queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}
const getMyAthleteTypes = async (req, res) => {
    const athleteId = req.params.athleteId || -1;
    if (athleteId === -1) return returnSingle(res, []);
    const query = `SELECT distinct
        at.athlete_type_id,
        at.type_name
    FROM beaches.athlete_types at
    LEFT JOIN beaches.athlete_type_groups atg ON atg.athlete_type_id = at.athlete_type_id
    WHERE atg.group_id IN (SELECT ag.group_id FROM beaches.athlete_groups ag WHERE ag.athlete_id = ${athleteId})`;
    const queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}

const makeCompareString = (statName) => {
    const compatibleName = (statName === 'fitness_level') ? 'fitness' : statName;
    const jsName = (compatibleName === 'foot_speed') ? 'footSpeed' :
        (compatibleName === 'hand_speed') ? 'handSpeed' : compatibleName;
    return `JSON_OBJECT(
        'name', '${jsName}',
        'averageLevel', AVG(ex.user_${compatibleName}_level),
        'maxLevel', MAX(ex.user_${compatibleName}_level),
        'averageGains', AVG(ex.weekly_${compatibleName}),
        'maxGains', MAX(ex.weekly_${compatibleName})
        ),`;
}

const compareFitness = async(req, res, next) => {
    const myUserId = getUserId(req);
    const requestAthlete = (req.params.athleteId) ? req.params.athleteId : -1;
    const ageCategory = req.query.ageCategory;
    const athleteTypes = req.query.athleteTypes;
    const groupId = req.query.groupId || -1;
    if (myUserId === -1 || requestAthlete === -1) { // not logged in
        return returnSingle(res, {});
    }

    const getFitnessProfile = `SELECT * FROM beaches.athlete_profiles where athlete_id = ${requestAthlete}`;
    let profile = await MySQL.runQuery(getFitnessProfile);
    if (profile && profile.length > 0) {
        // get the compared values for the chosen comparison
        profile = profile[0];
        let compareQuery = 'SELECT JSON_ARRAY(';
        statNames.map((stat) => {
            compareQuery = compareQuery + makeCompareString(stat.field);
        });
        compareQuery = compareQuery.slice(0, compareQuery.length -1); // trim the comma
        compareQuery = compareQuery + `) as 'compareStats',
                        COUNT(distinct ap.athlete_id) as 'participants'
                        FROM beaches.v_exercise_delta ex
                        INNER JOIN beaches.athlete_profiles ap ON ap.athlete_id = ex.athlete_id`;

        // restrict to athlete types
        if (athleteTypes && athleteTypes.length) {
            compareQuery = compareQuery + ` INNER JOIN beaches.athlete_profile_types apt 
            ON apt.athlete_id = ex.athlete_id AND apt.athlete_type_id IN ( ${athleteTypes} ) `;
        }

        if (groupId > 0) {
            compareQuery = compareQuery + ` INNER JOIN beaches.athlete_groups ag 
            ON ag.athlete_id = ex.athlete_id AND ag.group_id =  ${groupId} `;
        }

        // restrict to the requested age category: WHERE CLAUSE has to be added last
        if (ageCategory && ageCategory.length) {
            // restrict to a set of age categories
            const AGE_CATEGORIES = await MySQL.runQuery('SELECT * FROM beaches.age_categories ORDER BY age_id');
            const foundAge = AGE_CATEGORIES.find((age) => age.ageId == ageCategory);
            if (foundAge) {
                compareQuery = compareQuery + ` WHERE (${BASE_YEAR} - ap.year_of_birth) >= ${foundAge.min} 
                                            AND (${BASE_YEAR} - ap.year_of_birth) <= ${foundAge.max} `;
            }
        }
        const compareResponse = await MySQL.runQuery(compareQuery);
        if (compareResponse && compareResponse.length) {
            res.status = 200;
            res.json({data: `{"compareStats": ${compareResponse[0].compareStats}, "participants": ${compareResponse[0].participants} }` });
            return;
        }
    }
    // something went wrong
    returnSingle(res, {});
};

// helper function to calculate any new levels that have been earned
const updateLevels = (points, levelsGained, level) => {
    let currentLevel = level;
    let nextTarget = currentLevel * LEVEL_MULTIPLIER;
    let newLevels = 0;
    let alreadySpent = (levelsGained * (levelsGained - 1));
    if (alreadySpent <= 0) alreadySpent = 0;
    let pointsRemaining = points - alreadySpent;
    while (pointsRemaining >= nextTarget) {
        newLevels = newLevels + 1;
        pointsRemaining = pointsRemaining - nextTarget;
        currentLevel = currentLevel + 1;
        nextTarget = currentLevel * LEVEL_MULTIPLIER;
    }
    return newLevels;
}
// static value mappings
const statNames = [
    {text: 'Fitness', field: 'fitness_level', jsField: 'fitnessLevel'},
    {text: 'Balance', field: 'balance', jsField: 'balance'},
    {text: 'Flexibility', field: 'flexibility', jsField: 'flexibility'},
    {text: 'Power', field: 'power', jsField: 'power'},
    {text: 'Endurance', field: 'endurance', jsField: 'endurance'},
    {text: 'HandSpeed', field: 'hand_speed', jsField: 'handSpeed'},
    {text: 'FootSpeed', field: 'foot_speed', jsField: 'footSpeed'}];

const recordExercise = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnSingle(res, {});
    }
    req.body.userLoggedId = myUserId;
    let body = getCleanBody(req.body, exerciseLogSchema);
    const athleteId = body.cleanBody.athleteId || -1;
    const exerciseId = body.cleanBody.exerciseId || -1;
    const quantity = body.cleanBody.exerciseQuantity || 0;
    let statement = 'SELECT beaches.record_exercise( ?, ?, ?, ? ) as newEventId';
    await MySQL.runCommand(statement, [athleteId, exerciseId, myUserId, quantity]);

    const userNotices = [];
    let resetLevels = `UPDATE beaches.athlete_profiles SET `;
    try {
        // get the current state of the fitness and stat levels
        const statusQuery = `SELECT * FROM beaches.v_exercise_delta WHERE athlete_id = ${athleteId}`;
        let queryResult = await MySQL.runQuery(statusQuery);

        // setup a query to run if there is a problem and we need to reset the profile state
        statNames.map((stat) => {
            // update levels and remaining points
            resetLevels = resetLevels + `${stat.field} = ${queryResult['user' + stat.text + 'Level']}, `;
        });
        if (queryResult && queryResult.length === 1) {
            queryResult = queryResult[0];
            let updateStatStatement = `UPDATE beaches.athlete_profiles SET `;
            const logStatements = [];
            statNames.map((stat) => {
                let outcome = updateLevels(queryResult['weekly' + stat.text],
                    queryResult['weekly' + stat.text +'LevelsGained'],
                    queryResult['user' + stat.text + 'Level']);
                // update levels and remaining points
                updateStatStatement = updateStatStatement + `${stat.field} = ${outcome + queryResult['user' + stat.text + 'Level']}, `;
                for (let i = 0; i < outcome; i++) {
                    logStatements.push(`INSERT INTO beaches.level_up_logs (athlete_id, stat_name, level_up_date) VALUES (${athleteId}, '${stat.field}', CURDATE() )`);
                    userNotices.push(`Level up! ${stat.text} increased.`);
                }
            });
            updateStatStatement = updateStatStatement + ` athlete_id = ${athleteId} WHERE athlete_id = ${athleteId}`;
            await MySQL.runCommand(updateStatStatement);
            for (let log = 0; log < logStatements.length; log++) {
                await MySQL.runCommand(logStatements[log]);
            }
        }
        returnSingle(res, { levelUps: userNotices });
    } catch (err) {
        console.log('error updating levels', err);
        await MySQL.runCommand(resetLevels + `athlete_id = ${athleteId} WHERE athlete_id = ${athleteId}`);
        returnError(res, 'An error occurred when updating this record');
    }
    // returnSingle(res, {});
};

const upsertExercise = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnSingle(res, {message: 'not logged int'});
    }
    if (req.session.isFitnessAdmin !== 'Y') {
        return returnSingle(res, {message: 'not permitted to edit exercises'});
    }

    const cleanExercise = getCleanBody(req.body, exerciseSchema);
    if (cleanExercise.isValid) {
        let statement;
        let statementResult;
        if (cleanExercise.isEdit){
            statement = `UPDATE beaches.exercises SET ${cleanExercise.setters.join(', ')} WHERE exercise_id = ${cleanExercise.cleanBody.exerciseId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                return returnSingle(res, {affectedRows: statementResult.affectedRows});
            }
        } else {
            statement = `INSERT INTO beaches.exercises ${cleanExercise.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.insertId) {
                statement = `INSERT INTO beaches.exercise_groups (exercise_id, group_id) 
                VALUES (${statementResult.insertId}, ${cleanExercise.cleanBody.ownerGroupId})`;
                await MySQL.runCommand(statement);
                if (statementResult && statementResult.affectedRows) {
                    return returnSingle(res, {affectedRows: statementResult.affectedRows});
                }
            }
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'Exercise could not be updated');
    }
};
const deleteExerciseEvent = async (req, res) => {
    // const scheduleId = req.params.scheduleId;
    // if (!scheduleId) {
    //     return returnError(res, 'A class schedule ID is required');
    // }
    // const statement = `DELETE FROM program_schedules WHERE schedule_id = ${scheduleId}`;
    // const statementResult = await MySQL.runCommand(statement);
    // if (statementResult && statementResult.affectedRows) {
    //     returnSingle(res, {affectedRows: statementResult.affectedRows});
    // } else {
    //     returnError(res, 'An error occurred when deleting this record');
    // }
    returnSingle(res, {});
};
const deleteExercise = async (req, res) => {
    const myUserId = getUserId(req);
    const exerciseId = req.params.exerciseId || -1;

    let statement = `DELETE FROM beaches.exercise_groups 
        WHERE  EXISTS (SELECT 1 from beaches.user_group_admins uga WHERE uga.user_id = ${myUserId} AND uga.group_id = group_id)
            AND (SELECT e.owner_group_id FROM beaches.exercises e WHERE e.exercise_id = ${exerciseId}) = group_id
            AND exercise_id = ${exerciseId}  `;
    let statementResult = await MySQL.runCommand(statement);

    statement = `UPDATE  beaches.exercises SET is_deleted = 'Y' WHERE exercise_id = ${exerciseId}`;
    statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnSingle(res, 'Not able to delete this exercise');
    }
};

module.exports = {
    getMyProfiles,
    getAthleteProfile,
    getMyAgeCategories,
    getMyAthleteTypes,
    resetProfile,
    upsertProfile,
    getLogs,
    recordExercise,
    deleteExerciseEvent,
    getMyExercises,
    compareFitness,
    upsertExercise,
    deleteExercise
};