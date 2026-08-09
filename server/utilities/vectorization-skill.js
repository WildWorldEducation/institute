// Using ChatGPT.
// Import OpenAI package.
const { openai, models } = require('../config/aiConfig');

// Database connection
const conn = require('../config/db');




const getVectorData = async (skillData) => {
    const response = await openai.embeddings.create({
        model: models.embedding,
        input: skillData.name,
        dimensions: 720
    });
    const skillWithVector = {
        id: skillData.id,
        name: skillData.name,
        vector: response.data[0].embedding
    }

    return skillWithVector
}

const insertSkillsVectorIntoDataBase = (skillVector) => {

    let sqlQuery = `INSERT INTO skills_vector (skill_id, skill_name, embedding)
                   VALUES ('${skillVector.id}',
                   ${conn.escape(skillVector.name)},
                   VEC_FromText('[${skillVector.vector}]'))`
    conn.query(sqlQuery, (err, results) => {
        if (err) {
            console.error(err)
            throw err
        }
    })
}

module.exports = { getVectorData, insertSkillsVectorIntoDataBase }