const returnResults = (response, data) => {
    if (data && data.length) {
        response.status = 200;
        response.json({data: data });
    } else {
        response.status = 204;
        response.json({ data: [] });
    }
};

const returnSingle = (response, data) => {
    if (data) {
        response.status = 200;
        response.json({data: data });
    } else {
        response.status = 204;
        response.json({ data: 'success' });
    }
}
const returnSuccess = (response, success) => {
    response.status = 200;
    response.json({data: success });
}

const returnError = (response, errorMessage, errorCode = 500) => {
    response.status = errorCode;
    response.json({data: null, errorMessage: errorMessage});
}

module.exports = {
    returnResults,
    returnSingle,
    returnSuccess,
    returnError
}