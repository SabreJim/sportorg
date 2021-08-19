const MySQL = require('../middleware/mysql-service');
const { returnResults, returnSingle, returnError, parseHtmlFields } = require('../middleware/response-handler');
const { newsPostSchema, getCleanBody } = require('../middleware/request-sanitizer');

const addTag = async(req, res) => {
    // check if there are duplicates
    const query = `SELECT * FROM beaches.tags`;
    let currentTags = await MySQL.runQuery(query);

    if (!req.body || !req.body.tagName || !req.body.tagName.length) {
        returnSingle(res, -1); // no content to add
        return;
    }
    const newName = req.body.tagName;
    let alreadyExistsId = 0;
    currentTags.map((tag) => {
        if (tag.tagName.toUpperCase() === newName.toUpperCase()) {
            alreadyExistsId = tag.tagId;
        }
    });
    if (alreadyExistsId > 0) {
        returnSingle(res, alreadyExistsId); // duplicate
        return;
    }
    // if new tag, insert it
    const statement = `INSERT INTO beaches.tags (tag_name) VALUES ('${newName}')`;
    const statementResult = await MySQL.runCommand(statement);
    if (statementResult && statementResult.affectedRows) {
        return returnSingle(res, {affectedRows: statementResult.affectedRows});
    } else {
        returnSingle(res, -1);
    }
}

const getTags = async (req, res) => {
    const query = `SELECT tag_id id, tag_name name, 'tags' lookup FROM beaches.tags`;
    let queryResponse = await MySQL.runQuery(query);
    if (queryResponse && queryResponse.length) {
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
}

const publishPost = async(req, res) => {
    // strip out tags if they exist
    let tagIds = [];
    if (req.body?.tagIds) {
        tagIds = req.body.tagIds;
        delete req.body.tagIds;
    }
    if (!req?.body?.publishDate) { // publish now if no date is set
        req.body.publishDate = (new Date()).toISOString();
    }
    const saveTags = async(tagIds, postId) => {
        if (tagIds.length) {
            const delStatement = `DELETE FROM beaches.post_tags WHERE post_id =  ${postId} AND tag_id NOT IN (${tagIds.join(',')})`;
            await MySQL.runCommand(delStatement);
        }
        for (const tagId of tagIds) {
            const insertStatement = `INSERT IGNORE INTO beaches.post_tags (post_id, tag_id) VALUES (${postId}, ${tagId})`;
            await MySQL.runCommand(insertStatement);
        }
    }
    const cleanPost = getCleanBody(req.body, newsPostSchema);
    if (cleanPost.isValid) {
        let statement;
        let statementResult;
        if (cleanPost.isEdit){
            statement = `UPDATE beaches.posts SET ${cleanPost.setters.join(', ')} WHERE post_id = ${cleanPost.cleanBody.postId}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult && statementResult.affectedRows) {
                await saveTags(tagIds, cleanPost.cleanBody.postId);
                return returnSingle(res, { postId: cleanPost.cleanBody.postId});
            }
        } else {
            statement = `INSERT INTO beaches.posts ${cleanPost.insertValues}`;
            statementResult = await MySQL.runCommand(statement);
            if (statementResult?.insertId) {
                await saveTags(tagIds, statementResult.insertId);
            }
            return returnSingle(res, {postId: statementResult.insertId});
        }
        return returnError(res, 'An error occurred when updating this record');
    } else {
        returnError(res,'Page could not be updated');
    }
};
const unpublishPost = async(req,res) => {
    const postId = req.params.postId;
    if (postId) {
        const unpublishStatement = `UPDATE beaches.posts SET publish_date = null where post_id = ${postId}`;
        const statementResult = await MySQL.runCommand(unpublishStatement);
        if (statementResult?.affectedRows) {
            returnSingle(res, {postId});
        } else {
            returnSingle(res, {postId: -1 });
        }
    } else {
        returnSingle(res, {postId: -1 });
    }
};
const getNewsPost = async(req, res) => {
    const getPostQuery = `SELECT p.*, pt.tag_ids
                            FROM beaches.posts p
                            LEFT JOIN (SELECT JSON_ARRAYAGG(tag_id) tag_ids, post_id
                            FROM beaches.post_tags GROUP BY post_id) pt ON pt.post_id = p.post_id
                            WHERE p.post_id = ${req.params.postId}`;
    if (!req?.params?.postId) {
        returnSingle(res, {});
    } else {
        let queryResponse = await MySQL.runQuery(getPostQuery);
        if (queryResponse && queryResponse.length) {
            queryResponse[0].tagIds = JSON.parse(queryResponse[0].tagIds);
            returnSingle(res, queryResponse[0]);
        } else {
            returnSingle(res, {});
        }
    }
};
const searchNews = async(req, res) => {
    // search by tag
    let tagFilter = '';
    if (req.query?.tagIds?.length) {
        tagFilter = ` INNER JOIN beaches.post_tags tag_filter ON tag_filter.post_id = p.post_id AND tag_filter.tag_id IN (${req.query.tagIds}) `;
    }
    const searchPostsQuery =
        `SELECT DISTINCT
        p.post_id, p.template_type, p.header_content, p.sub_header, SUBSTRING(p.html_content, 1, 500) html_content,
        p.header_background, p.header_text_color, p.link_image_id, SUBSTRING(p.p1, 1, 500) p1 , p.publish_date, pt.tag_ids
        FROM beaches.posts p
        LEFT JOIN (SELECT JSON_ARRAYAGG(tag_id) tag_ids, post_id
            FROM beaches.post_tags GROUP BY post_id) pt ON pt.post_id = p.post_id
        ${tagFilter}
        WHERE p.publish_date IS NOT NULL AND p.publish_date < NOW()
        ORDER BY p.publish_date DESC
    `;
    let queryResponse = await MySQL.runQuery(searchPostsQuery);
    if (queryResponse && queryResponse.length) {
        queryResponse.map((p) => {
            p.tagIds = JSON.parse(p.tagIds);
        });
        returnResults(res, queryResponse);
    } else {
        returnResults(res, []);
    }
};

module.exports = {
    addTag,
    getTags,
    publishPost,
    unpublishPost,
    getNewsPost,
    searchNews
}