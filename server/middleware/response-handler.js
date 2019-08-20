const returnResults = (response, data) => {
    if (data && data.length) {
        response.status = 200;
        response.json({data: data });
    } else {
        response.status = 204;
        response.json({ data: [] });
    }
};

module.exports = {
    returnResults
}