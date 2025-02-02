/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
// DB
const conn = require('../config/db');

//Middlewares
const isAuthenticated = require('../middlewares/authMiddleware');

/*------------------------------------------
--------------------------------------------
Routes
--------------------------------------------
--------------------------------------------*/
router.post('/:userId/create', isAuthenticated, async (req, res, next) => {
    try {
        let userId = req.params.userId;
        let name = req.body.name;
        let skills = req.body.skills;

        let createLearningTrackQuery = `INSERT INTO learning_tracks (user_id, name)
        VALUES ('${userId}', '${name}');
        `;

        conn.query(createLearningTrackQuery, (err, result) => {
            if (err) {
                throw err;
            }

            // Function to allow for awaiting each SQL insertion.
            function queryPromise(query) {
                return new Promise((resolve, reject) => {
                    conn.query(query, (err, result) => {
                        if (err) {
                            return reject(err);
                        }

                        return resolve(result);
                    });
                });
            }

            // Insert rows for the learning track skills
            conn.connect(async (err) => {
                await Promise.all(
                    skills.map((_, i) => {
                        return queryPromise(
                            `INSERT INTO learning_track_skills (learning_track_id, skill_id)
                            VALUES (${result.insertId}, ${skills[i]})`
                        );
                    })
                );
                res.end();
            });
        });
    } catch (error) {
        console.error(error);
        res.status = 500;
        res.end;
    }
});
// Export the router for app to use.
module.exports = router;
