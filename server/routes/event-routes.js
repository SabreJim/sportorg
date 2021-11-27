const express = require('express');
const Events = require('../response-handler/events/event');
const Rankings = require('../response-handler/events/rankings');
const Pools = require('../response-handler/events/pools');
const { adminRequired, requireRole, addSession, requireSession } = require('./authentication');

const addEventRoutes = (config) => {
    const router = express.Router();
    const jsonBody = require('body-parser').json();

    // event endpoints
    router.get('/scheduled-event/:eventId', Events.getScheduledEvent);
    router.get('/scheduled-event-lookup/', Events.getEventsLookup);
    router.get('/scheduled-events', Events.searchAllScheduledEvents);
    router.put('/scheduled-event/', jsonBody, requireRole('admin_event'), Events.upsertScheduledEvent);
    router.delete('/scheduled-event/:eventId', adminRequired, Events.deleteScheduledEvent);
    router.get('/event-items/:scheduledEventId', Events.getEventsList);
    router.get('/event-item/:eventId', Events.getEventItem);
    router.put('/event-item', jsonBody, requireRole('admin_event'), Events.upsertEventItem);
    router.get('/event-config/:eventId', Events.getEventConfig);
    router.get('/event-config/athletes/:eventId', addSession, Events.getEventRegisteredAthletes);
    router.get('/my-event-athletes/:eventId', addSession, Events.getMyAthletesByEvent);
    router.put('/event-athlete/status/:eventId/:athleteId', jsonBody, requireSession, Events.setEventAthleteStatus);
    router.put('/event-item/add-round/:eventId', requireRole('admin_event'), Events.addEventRound);
    router.put('/event/:eventId/status/:eventStatusId', requireRole('admin_event'), Events.setEventStatus);
    router.put('/event/:eventId/round/:eventRoundId/status/:eventRoundStatusId', requireRole('admin_event'), Events.setEventRoundStatus);
    router.put('/event/:eventId/round/:eventRoundId/promote-athletes', requireRole('admin_event'), Events.promoteRoundAthletes);
    router.put('/event-item/run-rankings/:eventId', jsonBody, requireRole('admin_event'), Events.rerunRankings);
    router.delete('/event-item/delete-round/:eventId/:eventRoundId', requireRole('admin_event'), Events.deleteEventRound);
    router.put('/event-item/update-round/:eventId', jsonBody, requireRole('admin_event'), Events.updateEventRound);

    // rankings/circuit endpoints
    router.get('/all-rankings/', Rankings.getRankingsList);
    router.get('/ranking/:circuitId', Rankings.getRanking);
    router.put('/ranking/event', jsonBody, requireRole('admin_event'), Rankings.updateRanking);
    router.put('/ranking/request-update', jsonBody, adminRequired, Rankings.requestUpdateRankings);
    router.put('/circuit/', jsonBody, requireRole('admin_event'), Rankings.updateCircuit);
    router.get('/circuit/:circuitId', Rankings.getCircuit);
    router.get('/ranking/event/:eventId/round/:eventRoundId', Rankings.getEventRoundRankings);

    // pool endpoints
    router.put('/event-item/create-pools/:eventId/round/:eventRoundId', requireRole('admin_event'), Pools.createPools);
    router.get('/pool-round/:eventId/round/:eventRoundId', Pools.getRoundPools);
    router.get('/pool-details/:poolId', Pools.getPool);
    router.put('/pool-details/match-score/:poolId', jsonBody, requireRole('admin_event'), Pools.recordPoolScore);

    return router;
};

module.exports = addEventRoutes;