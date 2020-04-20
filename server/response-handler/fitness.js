const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError } = require('../middleware/response-handler');
const { fitnessProfileSchema ,exerciseLogSchema, getCleanBody } = require('../middleware/request-sanitizer');
const getUserId = (req) => (req.session && req.session.user_id) ? req.session.user_id : -1;

const  LEVEL_MULTIPLIER = 2;
const getMyProfiles = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnResults(res, []);
    }
    const query = `SELECT * FROM beaches.v_athlete_profiles
        WHERE allowed_user_id = ${myUserId} OR 
    (allowed_user_id != ${myUserId} AND (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y')`;

    const profilesResponse = await MySQL.runQuery(query);

    // mySQL doesn't provide an array aggregator, so do this manually
    const profiles = profilesResponse.map(cleanAthleteProfile);
    returnResults(res, profiles);
};

const cleanAthleteProfile = (profile) => {
    let { athleteId, memberId, firstName, lastName, yearOfBirth, competeGender, lastWorkout, fitnessLevel } = profile;
    const cleanedProfile = { athleteId, memberId, firstName, lastName, yearOfBirth, competeGender, lastWorkout, fitnessLevel };

    cleanedProfile.stats = JSON.parse(profile.stats);
    cleanedProfile.isEpee = (profile.isEpee > 0) ? 'Y' : 'N';
    cleanedProfile.isFoil = (profile.isFoil > 0) ? 'Y' : 'N';
    cleanedProfile.isSabre = (profile.isSabre > 0) ? 'Y' : 'N';
    cleanedProfile.generatedFromMember = profile.generatedFromMember === 1;
    return cleanedProfile;
}

const calculateProgress = (currentLevel, points, levelsGained) => {
    if (!points) return 0;
    let alreadySpent = (levelsGained * (levelsGained - 1));
    if (alreadySpent < 0) alreadySpent = 0;
    const unusedPoints = points - alreadySpent;
    return 100 * unusedPoints / (currentLevel * LEVEL_MULTIPLIER);
}
const getAthleteProfile = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnResults(res, []);
    }
    const athleteId = req.params.athleteId;

    const query = `SELECT * from beaches.v_athlete_profiles WHERE athlete_id = ${athleteId} 
                    AND (allowed_user_id = ${myUserId} OR 
                    (allowed_user_id != ${myUserId} AND (SELECT u.is_admin FROM beaches.users u where u.user_id = ${myUserId}) = 'Y') )`;

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
            profile.fitnessLevelProgress = calculateProgress(prog.userFitnessLevel, prog.weeklyFitness, prog.weeklyFitnessLevelsGained);
             profile.stats = profile.stats.map((stat) => {
                 const findProgress = statNames.find((item) => item.jsField === stat.name);
                 stat.progress = calculateProgress(prog[`user${findProgress.text}Level`],
                     prog[`weekly${findProgress.text}`], prog[`weekly${findProgress.text}LevelsGained`]);
                 return stat;
             });
            return returnSingle(res, profile);
        } catch (err) {
            console.log('error getting progress', err);
            return returnSingle(res, profile);
        }
    } else {
        return returnSingle(res, {});
    }
};

const createProfile = async(req, res, next) => {
    const myUserId = getUserId(req);
    if (myUserId === -1) { // not logged in
        return returnSingle(res, {});
    }
    let body = getCleanBody(req.body, fitnessProfileSchema);
    if (!body.cleanBody.memberId) body.cleanBody.memberId = -1;

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
const getExercises = async(req, res, next) => {
    const query = `SELECT * from beaches.exercises`;
    const exerciseResponse = await MySQL.runQuery(query);
    if (exerciseResponse && exerciseResponse.length) {
        returnResults(res, exerciseResponse);
    } else {
        returnResults(res, []);
    }
};

const compareFitness = async(req, res, next) => {
    returnResults(res, []);
};

// helper function to calculate any new levels that have been earned
const updateLevels = (points, levelsGained, level) => {
    let currentLevel = level;
    let nextTarget = currentLevel * LEVEL_MULTIPLIER;
    let newLevels = 0;
    let alreadySpent = (levelsGained * (levelsGained - 1));
    if (alreadySpent < 0) alreadySpent = 0;
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
    returnSingle(res, {});
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

module.exports = {
    getMyProfiles,
    getAthleteProfile,
    createProfile,
    getLogs,
    recordExercise,
    deleteExerciseEvent,
    getExercises,
    compareFitness,
    upsertExercise
};