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
    if (data.map) { // presumably an array
        return data.map((row) => {
            fieldNames.map((fieldName) => { // update each html field
                row[fieldName] = row[fieldName].replace(/&quot;/g, '"');
            });
            return row;
        })
    } else { // presumably a singleObject
        fieldNames.map((fieldName) => {
            data[fieldName] = data[fieldName].replace(/&quot;/g, '"');
        });
        return data;
    }
}

module.exports = {
    returnResults,
    returnSingle,
    returnSuccess,
    returnError,
    parseHtmlFields
}