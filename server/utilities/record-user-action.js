// Database Connection
const conn = require('../config/db');
const recordUserAction = ({userAction, contentType, contentId, userId}, callback) => {
    const actionData = {
        action: userAction,
        content_id: contentId,
        user_id: userId,
        content_type: contentType
    };
    const actionQuery = 'INSERT INTO user_actions SET ?';

    conn.query(actionQuery, actionData, (err) => {
        if (err) return callback(err);
        callback(null);
    });
};

module.exports = {recordUserAction}