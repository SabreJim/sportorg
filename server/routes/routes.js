const express = require('express');
const Classes = require('../response-handler/classes');
const PageContent = require('../response-handler/page-content');
const Programs = require('../response-handler/programs');
const Members = require('../response-handler/members');
const Users = require('../response-handler/users');
const Enrollment = require('../response-handler/enrollments');
const Finances = require('../response-handler/finance');
const Lookups = require('../response-handler/lookups');
const Authentication = require('../middleware/server-authentication');

const { adminRequired, addSession, requireSession } = require('./authentication');

const createRouter = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();

// middleware that is specific to this router
//     router.use(function timeLog (req, res, next) {
//         console.log('Time: ', Date.now(), req.originalUrl);
//         next();
//     });

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
    router.get('/my-user-profile', requireSession, Users.getMyProfile);
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
    router.get('/all-questions', adminRequired, PageContent.getAllQuestions);
    router.put('/questions', jsonBody, adminRequired, PageContent.upsertQuestion);
    router.delete('/questions/:questionId', adminRequired, PageContent.deleteQuestion);

    // tooltips
    router.get('/tool-tip/:tipName', PageContent.getToolTip);
    router.get('/all-tool-tips', adminRequired, PageContent.getAllToolTips);
    router.put('/tool-tip', jsonBody, adminRequired, PageContent.upsertToolTip);
    router.delete('/tool-tip/:tipId', adminRequired, PageContent.deleteToolTip);

    // enrollment endpoints
    router.put('/enroll-class', jsonBody, requireSession, Enrollment.enrollInClass);
    router.delete('/enroll-class', jsonBody, requireSession, Enrollment.deleteEnrollment);
    router.get('/my-enrollments/', requireSession, Enrollment.getMyMemberEnrollments);
    router.get('/my-enrollments/members/:seasonId', requireSession, Enrollment.getMyMembersEnrolled);

    // financial requests
    router.put('/payment', jsonBody, adminRequired, Finances.recordPayment);
    router.get('/my-invoices/user/:userId', adminRequired, Finances.getUsersInvoices);
    router.get('/my-invoices/', requireSession, Finances.getMyInvoices);
    router.put('/invoice/cancel/:invoiceId', adminRequired, Finances.cancelInvoice);
    router.get('/my-payments/user/:userId', adminRequired, Finances.getUsersPayments);
    router.get('/my-payments/', requireSession, Finances.getMyPayments);

    // session management
    router.get('/session-token', Authentication.verifyToken);
    router.put('/end-session', jsonBody, Authentication.endSession);

    return router;
};


module.exports = createRouter;