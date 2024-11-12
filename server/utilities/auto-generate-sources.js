const Exa = require('exa-js');
const exa = new Exa.default(process.env.EXA_API_KEY);
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

    const prompt = `Please provide a website or youtube video or paper on the subject
    ${skillAspect}, as described by ${aspectDescription}, aimed at ages ${ageRange}, and at a ${level} level.`;

    const result = await exa.searchAndContents(prompt, {
        type: 'neural',
        useAutoprompt: true,
        numResults: 3,
        text: false
    });
    console.log(result);
};

module.exports = { autoGenerateSource };
