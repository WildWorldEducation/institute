function findParentHaveHiddenChild(userSkills, childName) {
    const hiddenChild = userSkills.find(skill => {
        return skill.name === childName
    })
    const resultsArray = [];
    findHideChildPath(hiddenChild, resultsArray, userSkills)
    console.log(resultsArray)
}

// function to find the path of name node
function findHideChildPath(skillNode, resultsArray, userSkills) {
    let stopFlag = false;
    let currentNode = skillNode;
    while (!stopFlag) {
        if (currentNode.show_children === 0) {
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
        return skill.skill_id === skillId
    })
    return node
}

module.exports = { findParentHaveHiddenChild };