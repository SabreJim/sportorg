const getUserId = (req) => (req.session && req.session.user_id) ? req.session.user_id : -1;

const returnResults = (response, data) => {
    if (data && data.length) {
        response.status = 200;
        response.json({data: data });
    } else {
        response.status = 204;
        response.json({ data: [] });
    }
};

const getDateOnly = (d) => {
    const offset = (new Date().getTimezoneOffset()) / 60;
    let requestDate = new Date();
    if (d && !isNaN(new Date(d))) {
        requestDate = new Date(d.substring(0, 10));
    } else {
        requestDate.setHours(requestDate.getHours() - offset); // adjust for local timezone
    }
    return requestDate.toISOString().substring(0, 10);
}

const returnSingle = (response, data) => {
    if (data) {
        response.status = 200;
        response.json({data: data });
    } else {
        response.status = 204;
        response.json({ data: 'success' });
    }
};
const returnSuccess = (response, success) => {
    response.status = 200;
    response.json({data: success });
};

const returnError = (response, errorMessage, errorCode = 500) => {
    response.status = errorCode;
    response.json({data: null, message: errorMessage});
};

const parseHtmlFields = (data, fieldNames) => {
    try {
        if (data.map) { // presumably an array
            return data.map((row) => {
                fieldNames.map((fieldName) => { // update each html field
                    row[fieldName] = row[fieldName].replace(/&quot;/g, '"');
                    row[fieldName] = row[fieldName].replace(/"&quot;/g, '"');
                });
                return row;
            })
        } else { // presumably a singleObject
            fieldNames.map((fieldName) => {
                data[fieldName] = data[fieldName].replace(/&quot;/g, '"');
                data[fieldName] = data[fieldName].replace(/"&quot;/g, '"');
            });
            return data;
        }
    } catch (err) {
        return data;
    }
}
const cleanSelected = (queryResult, booleanFields = []) => {
    if (queryResult && queryResult.length) {
        return queryResult.map((type) => {

            booleanFields.map((fieldName) => {
                type[fieldName] = (type[fieldName] === 'Y');
            });
            return type;
        });
    } else {
        return [];
    }
}

module.exports = {
    getUserId,
    returnResults,
    returnSingle,
    returnSuccess,
    returnError,
    parseHtmlFields,
    cleanSelected,
    getDateOnly
}