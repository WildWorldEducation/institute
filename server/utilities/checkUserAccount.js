require('dotenv').config();
const masterEditor = process.env.MASTER_EDITOR_ACCOUNT;
// Database Connection
const isMasterEditor = (userName) => {
    if (userName === masterEditor) {
        return true
    }
    return false
};

module.exports = { isMasterEditor }