// handle login, logout, and session renewal requests

const login = async function(ctx){
    console.log("login", ctx.query);
    ctx.status = 200;
    ctx.body = {userName: ctx.query.user, isLoggedIn: true};
};

const logout = async function(ctx){
    console.log("logout", ctx.query);
    ctx.status = 200;
    ctx.body = {isLoggedIn: false };
};


module.exports = Object.freeze({
    login,
    logout
});