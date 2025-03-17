// Database connection
const conn = require('../config/db');

function findParentHaveHiddenChild(userSkills, childName) {

    const hiddenChild = userSkills.find(skill => {
        return skill.skill_name.toLowerCase() === childName.toLowerCase()
    })
    const resultsArray = [];
    findHideChildPath(hiddenChild, resultsArray, userSkills)
    return resultsArray;
}

// function to find the path of a node with name
function findHideChildPath(skillNode, resultsArray, userSkills) {
    let stopFlag = false;
    let currentNode = skillNode;

    while (!stopFlag) {
        if (currentNode.show_children == 0) {
            resultsArray.push(currentNode)
        }
        const parentNode = findNode(userSkills, currentNode.parent)
        // stop condition
        if (!parentNode) {
            stopFlag = true
        }
        else {
            currentNode = parentNode
        }
    }
}

// function to find the path of inaccessible skill
function findInaccessiblePath(skillNode, resultsArray, userSkills) {
    let stopFlag = false;
    let currentNode = skillNode;

    // loop thought all skill node parent to find the one that get is_accessible flag turn off
    // we just need to find parent that is inaccessible and turn them on
    while (!stopFlag) {
        if (!currentNode.is_accessible) {
            resultsArray.push(currentNode)
        }
        const parentNode = findNode(userSkills, currentNode.parent)
        // stop condition
        if (!parentNode) {
            stopFlag = true
        }
        else {
            currentNode = parentNode
        }
    }
}


function findNode(userSkills, skillId) {
    const node = userSkills.find(skill => {
        return skill.id === skillId
    })
    return node
}

function findNodeByName(userSkills, skillName) {
    const node = userSkills.find(skill => {
        return skill.skill_name === skillName
    })
    return node
}

function showChildren(userId, skillId) {
    let sqlQuery = `
        INSERT INTO user_skills (user_id, skill_id, show_children) 
        VALUES(${conn.escape(userId)}, ${conn.escape(
        skillId)}, 1) 
        ON DUPLICATE KEY UPDATE show_children=1;
        `;

    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
        } catch (err) {
            console.error(err)
            next(err);
        }
    });
}

function showHiddenChildFromParent(parentPath, userId) {
    let promises = [];
    for (let index = parentPath.length - 1; index >= 0; index--) {
        const node = parentPath[index];
        promises.push(showChildren(userId, node.id))
    }
    Promise.all(promises)

}

function convertNodesToArray(nodes) {
    let childNodes = nodes
    let results = [];
    while (childNodes.length > 0) {
        let currentNode = childNodes.pop();

        results.push(currentNode);
        if (currentNode.children.length > 0) {
            childNodes = childNodes.concat(currentNode.children);
        }
    }

    return results;
}




module.exports = { findParentHaveHiddenChild, showHiddenChildFromParent, convertNodesToArray, findNodeByName, findInaccessiblePath, findNode };