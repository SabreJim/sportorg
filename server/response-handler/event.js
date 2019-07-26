// handle CRUD operations on Events


const getAllEvents = async function(ctx){
    ctx.status = 200;
    ctx.body = {session: ctx.query.session, events: [1,2,3]};
};

const getEvent = async function(ctx){
    ctx.status = 200;
    ctx.body = {gotEvent: true };
};

const createEvent = async function(ctx) {
    ctx.status = 200;
    ctx.body = {createdEvent: true};
};
const updateEvent = async function(ctx) {
    ctx.status = 200;
    ctx.body = {updateEvent: true};
};

module.exports = Object.freeze({
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent
});