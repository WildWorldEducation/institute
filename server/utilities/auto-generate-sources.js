const Exa = require('exa-js');
const exa = new Exa.default(process.env.EXA_API_KEY);
// DB
const conn = require('../config/db');

const aspectJSON = require('./open_ai.json');


const exaGetSource = async (subjectName, aspect, aspectDescription, ageRange, level, resultsList) => {
    const prompt = `Please provide a youtube video link on aspect ${aspect} of the subject
    ${subjectName}, as described by ${aspectDescription}, aimed at ages ${ageRange}, and at a ${level} level.`;

    const result = await exa.searchAndContents(prompt, {
        type: 'neural',
        useAutoprompt: true,
        numResults: 3,
        text: false
    });
    console.log(result)
    resultsList.push({ ...result, aspect: aspect })
}

const insertIntoDataBase = async (skillName, skillAspect, url) => {
    let sqlQuery = `INSERT INTO exa_ai_report (skill_name, skill_aspect, url)
                    VALUES (${conn.escape(skillName)}, ${conn.escape(skillAspect)}, ${conn.escape(url)});`;
    conn.query(sqlQuery, (err, results) => {
        try {
            if (err) {
                throw err;
            }
            console.log(results)
        } catch (err) {

            console.err(err)
        }
    });
}


/**
 *  Get source from Exa.AI
 *
 * @param {*} skillId ID of the skill
 * @param {*} skillLevel level of the skill
 * @param {*} skillAspect the name of the part of the source we are asking about
 * @param {*} aspectDescription the description of the part of the source we are asking about
 *
 * @return “title”, “url”, and “summary” from EXA.AI results. ENSURE NO DUPLICATES.
 */
const autoGenerateSource = async (
    skillId,
    skillLevel,
    skillAspect,
    aspectDescription
) => {
    let ageRange = '';
    let level = '';
    switch (skillLevel) {
        case 'grade_school':
            ageRange = '5 - 10';
            level = 'grade school';
            break;
        case 'middle_school':
            ageRange = '11 - 14';
            level = 'middle school';
            break;
        case 'high_school':
            ageRange = '15 - 18';
            level = 'high school';
            break;
        case 'college':
            ageRange = '19 - 24';
            level = 'college';
            break;
        case 'phd':
            ageRange = 'over 24';
            level = 'PHD';
    }

    let promises = [];
    const resultList = [];
    const skillName = aspectJSON.subject
    for (let index = 0; index < aspectJSON.core_aspects.length; index++) {
        const description = aspectJSON.core_aspects[index].description;
        const aspect = aspectJSON.core_aspects[index].aspect;
        promises.push(exaGetSource(skillName, aspect, description, ageRange, level, resultList))
    }
    await Promise.all(promises);
    let dbPromises = []
    resultList.forEach(resultObj => {
        resultObj.results.forEach(result => {
            dbPromises.push(insertIntoDataBase(skillName, resultObj.aspect, result.url))
        })
    })
    await Promise.all(dbPromises)
    return resultList
};

module.exports = { autoGenerateSource };
