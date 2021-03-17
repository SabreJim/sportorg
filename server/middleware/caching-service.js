
const cacheResources = async (req, res, next) => {

    if (req.url.startsWith('/images/')) {
        console.log('cached url', req.url);
        if (req.method.toLowerCase() === 'get' || req.method.toLowerCase() === 'head') {
            console.log('METHOD', req.method, req.params, req.query);
            res.setHeader('Cache-Control', `max-age=31536000, no-cache`);
            res.setHeader('Vary', 'ETag, Content-Encoding');
            console.log('check if cached', req.headers['ETag'], req.headers['if-none-match']);
        }
    }
    await next();

}

module.exports = cacheResources;