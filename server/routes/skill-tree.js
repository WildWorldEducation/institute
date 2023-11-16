const express = require('express')
const router = express.Router()
const mysql = require('mysql');

router.use(express.json({ limit: '25mb' }));
router.use(express.urlencoded({ limit: '25mb', extended: true }));

/*------------------------------------------
--------------------------------------------
Database Connection
--------------------------------------------
--------------------------------------------*/
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C0ll1ns1n5t1tut32022',
    password: 'password',
    database: 'skill_tree'
});

/*------------------------------------------
--------------------------------------------
Shows Mysql Connect
--------------------------------------------
--------------------------------------------*/
conn.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MariaDB connected...');
});


// Individual skill tree data per user.
router.get('/:id', (req, res, next) => {
    if (req.session.userName) {

        var skillDegradationDays;
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery1 = `
    SELECT skill_degradation_days FROM skill_tree.settings;`;
        let query1 = conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                else {
                    //console.log(results[0].skill_degradation_days);
                    skillDegradationDays = results[0].skill_degradation_days;
                }
            } catch (err) {
                next(err)
            }
        });

        var skilltreeTheme;

        let sqlQuery2 = `
    SELECT skilltree_theme FROM skill_tree.users
    WHERE id =` + req.params.id;
        let query2 = conn.query(sqlQuery2, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                else {
                    skilltreeTheme = results[0].skilltree_theme;
                }
            } catch (err) {
                next(err)
            }
        });

        let sqlQuery = `
    SELECT skill_tree.skills.id, name, parent, is_accessible, is_mastered, icon, description, grade, grade_date, image
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =`  + req.params.id + `

    UNION
    SELECT skill_tree.skills.id, name, parent, "", "", icon, description, "", "", image
    FROM skill_tree.skills
    WHERE skill_tree.skills.id NOT IN

    (SELECT skill_tree.skills.id
    FROM skill_tree.skills
    LEFT OUTER JOIN skill_tree.user_skills
    ON skill_tree.skills.id = skill_tree.user_skills.skill_id
    WHERE skill_tree.user_skills.user_id =` + req.params.id + `)
    ORDER BY id;`

        let query = conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                var differenceInDays;

                for (let i = 0; i < results.length; i++) {
                    // Working out if the colour needs to degrade due to time passed since the assessment -----------
                    // Working out today's date.        
                    var todaysDate = new Date();

                    // Checking if there is a grading date.        
                    gradeDate = new Date(results[i].grade_date);
                    if (Object.prototype.toString.call(gradeDate) === "[object Date]") {
                        // it is a date
                        if (isNaN(gradeDate)) {
                            // date object is not valid
                        } else {
                            // Working out the difference.
                            // Not that accurate.
                            const diffTime = Math.abs(todaysDate - gradeDate);
                            differenceInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        }
                    } else {
                        // not a date object
                    }

                    // Working out the colour of the SVG icon for each skill. -------------------------
                    var iconColour = "";

                    // Working out the initial colour, based on accessibility, mastery, and grade -----------
                    if (results[i].is_accessible == 0) {
                        skilltreeTheme == "light" ? iconColour = "DarkSlateGrey" : iconColour = "White";
                    }
                    else if (results[i].is_accessible == 1) {
                        if (results[i].is_mastered) {
                            if (results[i].grade < 70) {
                                iconColour = "GreenYellow";
                            }
                            else if (results[i].grade > 70 && results[i].grade < 85) {
                                if (differenceInDays > skillDegradationDays) {
                                    iconColour = "GreenYellow";
                                }
                                else {
                                    iconColour = "LimeGreen";
                                }
                            }
                            else if (results[i].grade > 85) {
                                if (differenceInDays > skillDegradationDays) {
                                    iconColour = "GreenYellow";
                                }
                                else if (differenceInDays > skillDegradationDays) {
                                    iconColour = "LimeGreen";
                                }
                                else {
                                    iconColour = "Green";
                                }
                            }
                            else {
                                iconColour = "GreenYellow";
                            }
                        }
                        else {
                            iconColour = "LightGrey";
                        }
                    }
                    else {
                        skilltreeTheme == "light" ? iconColour = "DarkSlateGrey" : iconColour = "White";
                    }

                    results[i].icon_colour = iconColour;
                }

                // Create object to send.
                var userSkillTree = {
                    userSkills: [],
                    theme: ""
                }
                userSkillTree.userSkills = results;
                userSkillTree.theme = skilltreeTheme;

                res.json(userSkillTree);
            } catch (err) {
                next(err)
            }
        });
    }
})


// router.get('*', (req, res) => {
//     res.redirect('/');
// });

module.exports = router