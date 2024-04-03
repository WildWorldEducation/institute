
-- To check which skills have questions, but not enough of them.
SELECT COUNT(skill_id), skill_id
FROM mc_questions
GROUP By skill_id
HAVING COUNT(skill_id) < 60


-- To check which skills, that should have questions, dont.
SELECT skills.id, skills.name 
FROM skills
LEFT JOIN mc_questions
ON skills.id = mc_questions.skill_id
WHERE skills.type <> 'super' 
AND skills.type <> 'domain'
AND skills.id NOT IN
(SELECT skill_id
FROM mc_questions)