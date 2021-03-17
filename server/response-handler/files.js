const MySQL = require('../middleware/mysql-service');
const { getUserId, returnResults, returnSingle, returnError, parseHtmlFields } = require('../middleware/response-handler');
const { getCleanBody } = require('../middleware/request-sanitizer');
const Sharp = require('sharp');

const createThumbnail = async (originalImage, imageType) => {
    // strip the meta data
    const justData = originalImage.split(';base64,').pop();
    const srcBuffer = Buffer.from(justData, 'base64');
    console.log('file type', imageType);
    const thumbBuffer = await Sharp(srcBuffer)
        .resize(300)
        .toBuffer();
    return 'data:image/png;base64,' + thumbBuffer.toString('base64');
};

const uploadFile = async(req, res, next) => {
    const metaData = {
        updatedBy: getUserId(req),
        fileName: req.body.name,
        fileType: req.body.type,
        assetType: (req.body.type).toUpperCase().indexOf('IMAGE') > -1 ? 'image' : 'document',
        category: (req.query.category || 'all').toLowerCase(),
        fileId: req.query.fileId || -1
    };
    const requestType = req.query.requestType;
    console.log('got request type', requestType, metaData);
    // if the category of file matches the user's permissions, they can proceed
    switch (requestType) {
        case 'FITNESS':
            if (req.session.isFitnessAdmin !== 'Y' && req.session.isAdmin !== 'Y') {
                return returnSingle(res, {message: 'not allowed to upload fitness files'});
            }
            break;
        case 'EVENT':
            if (req.session.eventAdmin !== 'Y' && req.session.isAdmin !== 'Y') {
                return returnSingle(res, {message: 'not allowed to upload event files'});
            }
            break;
        default:
            if (req.session.isAdmin !== 'Y'){
                return returnSingle(res, {message: 'not allowed to upload this type of file'});
            }
    }
    // save the file with its metadata
    const saveFile = `SELECT upload_file(?, ?, ?) as newId;`;
    const thumbnail = await createThumbnail(req.body.data, metaData.fileType);
    const statementResult = await MySQL.runCommand(saveFile,
        [JSON.stringify(metaData), req.body.data, thumbnail]);
    if (statementResult.newId) {
        returnSingle(res, {success: true, newId: statementResult.newId });
    } else {
        returnError(res, 'File could not be uploaded');
    }
};

const getImage = async(req, res, next) => {
    const imageId = req.params.id;
    if (!imageId) returnSingle(res, {message: 'No image id provided'});
    const isPreview = req.query.isPreview;
    let query;
    // check if image being requested by id or fileName
    if (imageId === parseInt(imageId).toString()) {
        if (isPreview === 'true') {
            query = `SELECT file_name, file_type, preview as data FROM beaches.files where file_id = ${parseInt(imageId, 10)}`;
        } else {
            query = `SELECT file_name, file_type, data FROM beaches.files where file_id = ${parseInt(imageId, 10)}`;
        }
    } else {
        returnError(res, {message: 'Not a valid ID'});
    }
    // note that if the user is flagged once, they are flagged for the entire day
    const statementResult = await MySQL.runCommand(query);
    // return the base64 encoded string as part of a JSON response
    // a directive on the front end will inject that directly into the <img src="" /> value
    if (statementResult.data) {
        res.setHeader('Content-Type', statementResult.file_type);

        // let lastModHash = getSHA1(imageId.toString());
        // response.setHeader('ETag', lastModHash);
        const buff = Buffer.from(statementResult.data, 'base64');
        res.send({data: buff.toString('ascii')});
    } else {
        returnError(res, 'Image could not be found');
    }
}

const getFile = async(req, res, next) => {
    const fileId = req.params.id;
    if (!fileId) returnSingle(res, {message: 'No file id provided'});

    console.log('got id?', fileId, typeof fileId);
    const query = `SELECT file_name, data FROM beaches.files where file_id = ${parseInt(fileId, 10)}`;
    console.log('got query', query);
    // note that if the user is flagged once, they are flagged for the entire day
    const statementResult = await MySQL.runCommand(query);
    console.log('got result?', !!statementResult);
    if (statementResult.data) {
        const buff = Buffer.from(statementResult.data, 'base64');
        const text = buff.toString('ascii');
        console.log('find metadata?', text.slice(0, 40));
        const nometaData = buff.slice(text.indexOf(';base64,') + 8, buff.length);

        const noTagBuffer = Buffer.from(nometaData, 'base64');

        // res.writeHead(200, {
        //     'Content-Type': 'image/jpeg',
        //     'Content-Length': noTagBuffer.length,
        //     'Accept-Ranges': 'bytes'
        // });
        // res.end(noTagBuffer);


        // res.writeHead(200, {
        //     'Content-Type': 'image/jpg',
        //     'Content-Length': buff.length
        // });

        // FRT for pdf
        // res.set('Content-Type', 'image/*');
        // res.set('Content-Disposition', 'inline');
        // res.attachment(statementResult. filename); // for attachments
        // return res.end(text);

    } else {
        returnError(res, 'File could not be found');
    }
}
const getAllFiles = async(req, res, next) => {
    const fileType = req.params.fileType || 'all';
    const category = (req.query.category || 'all').toLowerCase();

    const query = `SELECT file_id, file_name, file_type, asset_type, category 
                    FROM beaches.files where asset_type = '${fileType.toLowerCase()}'
                    AND ('${category}' = 'all' OR (category = 'all' OR category = '${category.toLowerCase()}'))`;
    // note that if the user is flagged once, they are flagged for the entire day
    const fileInfo = await MySQL.runQuery(query);
    if (fileInfo) {
        returnResults(res, fileInfo);
    } else {
        returnError(res, 'Files could not be found');
    }
}

module.exports = {
    uploadFile,
    getImage,
    getFile,
    getAllFiles
};