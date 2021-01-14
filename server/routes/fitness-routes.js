const { adminRequired, addSession, requireSession } = require('./authentication');
const express = require('express');
const Fitness = require('../response-handler/fitness');
const FitnessGroups = require('../response-handler/fitness-groups');

const addFitnessRoutes = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();

    // fitness-tracker app
    router.get('/my-fitness-profiles', addSession, Fitness.getMyProfiles);
    router.put('/fitness-profile/reset/:athleteId', addSession, Fitness.resetProfile);
    router.get('/fitness-profile/:athleteId', addSession, Fitness.getAthleteProfile);
    router.put('/fitness-profile', jsonBody, addSession, Fitness.upsertProfile);
    router.get('/fitness-logs/:athleteId', addSession, Fitness.getLogs);
    router.put('/exercise-event', jsonBody, addSession, Fitness.recordExercise);
    router.delete('/exercise-event/:eventId', addSession, Fitness.deleteExerciseEvent);
    router.get('/my-exercises/:athleteId', Fitness.getMyExercises);
    router.get('/my-age-categories/:athleteId', requireSession, Fitness.getMyAgeCategories);
    router.get('/my-athlete-types/:athleteId', requireSession, Fitness.getMyAthleteTypes);
    router.get('/compare-fitness/:athleteId', addSession, Fitness.compareFitness);
    router.put('/exercise', jsonBody, addSession, Fitness.upsertExercise);
    router.delete('/exercise/:exerciseId', requireSession, Fitness.deleteExercise);


    router.get('/my-groups/:athleteId', requireSession, FitnessGroups.getMyGroups);
    router.get('/groups/admin', requireSession, FitnessGroups.getGroupsAdmin);
    router.get('/group/exercises/:groupId', requireSession, FitnessGroups.getGroupExercises);
    router.get('/groups/athlete-types/:groupId', requireSession, FitnessGroups.getGroupTypes);
    router.get('/groups/age-categories/:groupId', requireSession, FitnessGroups.getGroupAges);
    router.get('/groups/athletes/:groupId', requireSession, FitnessGroups.getGroupAthletes);

    router.put('/fitness-profile/groups', requireSession, FitnessGroups.assignProfileGroups);
    router.put('/groups/admins', requireSession, FitnessGroups.setGroupAdmins);
    router.put('/groups', jsonBody, requireSession, FitnessGroups.upsertGroup);
    router.put('/groups/invite', jsonBody, requireSession, FitnessGroups.inviteToGroup);
    router.put('/groups/remove', jsonBody, requireSession, FitnessGroups.removeFromGroup);
    router.put('/groups/join', jsonBody, requireSession, FitnessGroups.joinGroup);
    router.put('/groups/leave', jsonBody, requireSession, FitnessGroups.removeFromGroup);
    router.put('/exercise-group', jsonBody, requireSession, FitnessGroups.selectExerciseGroup);

    return router;
};

module.exports = addFitnessRoutes;