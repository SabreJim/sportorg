const express = require('express');
const Classes = require('./response-handler/classes');
const PageContent = require('./response-handler/page-content');
const Programs = require('./response-handler/programs');
const Members = require('./response-handler/members');
const Users = require('./response-handler/users');
const Enrollment = require('./response-handler/enrollments');
const Lookups = require('./response-handler/lookups');
const Fitness = require('./response-handler/fitness');
const FitnessGroups = require('./response-handler/fitness-groups');
const Authentication = require('./middleware/server-authentication');
const ResponseHandler = require('./middleware/response-handler');

const { curry } = require('ramda');

const createRouter = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();

// middleware that is specific to this router
//     router.use(function timeLog (req, res, next) {
//         console.log('Time: ', Date.now(), req.originalUrl);
//         next();
//     });

    const adminRequired = async (req, res, next) => {
        const session = await Authentication.getSessionFromHeader(req);
        if (!session || session.isAdmin !== 'Y') {
            ResponseHandler.returnError(res, 'This request requires admin access', 403);
        } else {
            next();
        }
    };

    const addSession = async (req, res, next) => {
        await Authentication.getSessionFromHeader(req);
        next();
    };

    const requireSession = async (req, res, next) => {
        const getUserId = (req) => (req.session && req.session.user_id) ? req.session.user_id : -1;
        await Authentication.getSessionFromHeader(req);
        const myUserId = getUserId(req);
        if (myUserId === -1) { // not logged in
            return ResponseHandler.returnSingle(res, {});
        } else {
            next();
        }
    };

    // lookup item getters
    router.get('/fees', adminRequired, Lookups.getFeeStructures);
    router.put('/fees', adminRequired, jsonBody, Lookups.upsertFeeStructures);
    router.delete('/fees/:feeId', adminRequired, Lookups.deleteFee);
    router.get('/lookups', Lookups.getLookupValues);
    router.get('/menus', Lookups.getMenus);
    router.get('/app-status', Lookups.getAppStatus);

    // Class getters and setters
    router.get('/all-classes', addSession, Classes.getAllClasses);
    router.put('/classes', jsonBody, adminRequired, Classes.upsertClass);
    router.delete('/classes/:scheduleId', adminRequired, Classes.deleteClass);

    // Program getters and setters
    router.get('/all-programs', addSession, Programs.getAllPrograms);
    router.get('/programs', Programs.getActivePrograms);
    router.put('/programs', jsonBody, adminRequired, Programs.upsertProgram);
    router.delete('/programs/:programId', adminRequired, Programs.deleteProgram);

    // member/athlete endpoints
    router.get('/my-members', requireSession, Members.getMyMembers);
    router.get('/members', addSession, Members.getAnonymousMembers); // for listing public data
    router.put('/members', jsonBody, addSession, Members.upsertMember);
    router.delete('/members/:memberId', adminRequired, Members.deleteMember);
    router.get('/my-members/attendance', requireSession, Members.getMemberAttendance);
    router.put('/my-members/attendance', requireSession, jsonBody, Members.logAttendance);
    router.put('/my-members/consent', requireSession, jsonBody, Members.recordConsent);
    router.get('/my-members/screening-questions/:questions', requireSession, Members.getScreeningQuestions);

    // user endpoints
    router.get('/users', adminRequired, Users.getUsers);
    router.put('/user', jsonBody, adminRequired, Users.updateUser);
    router.delete('/members/:userId', adminRequired, Users.deleteUser);
    router.get('/member-users', adminRequired, Users.getMemberUsers);
    router.put('/member-users/member/:memberId/user/:userId/link/:setStatus', adminRequired, Users.linkMembers);

    // event endpoints

    // dynamic page content
    router.get('/page-content/:pageName', PageContent.getPage);
    router.get('/all-pages', adminRequired, PageContent.getAllPages);
    router.put('/page-content', jsonBody, adminRequired, PageContent.upsertPage);
    router.delete('/page-content/:pageId', adminRequired, PageContent.deletePage);
    router.get('/menu-list', adminRequired, PageContent.getMenuAdmin);
    router.put('/menus', jsonBody, adminRequired, PageContent.upsertMenu);
    router.delete('/menus/:menuId', adminRequired, PageContent.deleteMenu);
    router.get('/all-banners', adminRequired, PageContent.getAllBanners);
    router.put('/banners', jsonBody, adminRequired, PageContent.upsertBanner);
    router.delete('/banners/:statusId', adminRequired, PageContent.deleteBanner);

    // tooltips
    router.get('/tool-tip/:tipName', PageContent.getToolTip);
    router.get('/all-tool-tips', adminRequired, PageContent.getAllToolTips);
    router.put('/tool-tip', jsonBody, adminRequired, PageContent.upsertToolTip);
    router.delete('/tool-tip/:tipId', adminRequired, PageContent.deleteToolTip);

    // enrollment endpoints
    router.get('/my-enrollments', addSession, Enrollment.getMyEnrollments);
    router.put('/enroll-class', jsonBody, addSession, Enrollment.enrollInClass);

    // session management
    router.get('/session-token', Authentication.verifyToken);
    router.put('/end-session', jsonBody, Authentication.endSession);

    // fitness-tracker app
    router.get('/my-fitness-profiles', addSession, Fitness.getMyProfiles);
    router.put('/fitness-profile/reset/:athleteId', addSession, Fitness.resetProfile);
    router.get('/fitness-profile/:athleteId', addSession, Fitness.getAthleteProfile);
    router.put('/fitness-profile', jsonBody, addSession, Fitness.upsertProfile);
    router.get('/fitness-logs/:athleteId', addSession, Fitness.getLogs);
    router.put('/exercise-event', jsonBody, addSession, Fitness.recordExercise);
    router.delete('/exercise-event/:eventId', addSession, Fitness.deleteExerciseEvent);
    router.get('/fitness/my-exercises/:athleteId', Fitness.getMyExercises);
    router.get('/fitness/my-age-categories/:athleteId', requireSession, Fitness.getMyAgeCategories);
    router.get('/fitness/my-athlete-types/:athleteId', requireSession, Fitness.getMyAthleteTypes);
    router.get('/compare-fitness/:athleteId', addSession, Fitness.compareFitness);
    router.put('/exercise', jsonBody, addSession, Fitness.upsertExercise);
    router.delete('/exercise/:exerciseId', requireSession, Fitness.deleteExercise);


    router.get('/my-groups/:athleteId', requireSession, FitnessGroups.getMyGroups);
    router.get('/fitness/groups/admin', requireSession, FitnessGroups.getGroupsAdmin);
    router.get('/fitness/group/exercises/:groupId', requireSession, FitnessGroups.getGroupExercises);
    router.get('/fitness/groups/athlete-types/:groupId', requireSession, FitnessGroups.getGroupTypes);
    router.get('/fitness/groups/age-categories/:groupId', requireSession, FitnessGroups.getGroupAges);
    router.get('/fitness/groups/athletes/:groupId', requireSession, FitnessGroups.getGroupAthletes);

    router.put('/fitness-profile/groups', requireSession, FitnessGroups.assignProfileGroups);
    router.put('/fitness/groups/admins', requireSession, FitnessGroups.setGroupAdmins);
    router.put('/fitness/groups', jsonBody, requireSession, FitnessGroups.upsertGroup);
    router.put('/fitness/groups/invite', jsonBody, requireSession, FitnessGroups.inviteToGroup);
    router.put('/fitness/groups/remove', jsonBody, requireSession, FitnessGroups.removeFromGroup);
    router.put('/fitness/groups/join', jsonBody, requireSession, FitnessGroups.joinGroup);
    router.put('/fitness/groups/leave', jsonBody, requireSession, FitnessGroups.removeFromGroup);
    router.put('/fitness/exercise-group', jsonBody, requireSession, FitnessGroups.selectExerciseGroup);


    return router;
};


module.exports = createRouter;