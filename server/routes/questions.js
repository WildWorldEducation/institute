/*------------------------------------------
--------------------------------------------
Middleware
--------------------------------------------
--------------------------------------------*/
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const { recordUserAction } = require('../utilities/record-user-action');
// DB
const conn = require('../config/db');

/*------------------------------------------
--------------------------------------------
Router
--------------------------------------------
--------------------------------------------*/

/**
 * Delete Item
 *
 * @return response()
 */
// Delete multiple choice question.
router.delete('/mc/:id', (req, res, next) => {
    if (req.session.userName) {
        const deleteQuery = `UPDATE mc_questions 
        SET is_deleted = 1 
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(deleteQuery, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // Add delete action into user_actions table
                    const actionData = {
                        action: 'delete',
                        content_id: req.params.id,
                        content_type: 'mc_question',
                        user_id: req.session.userId
                    };
                    const addActionQuery = 'INSERT INTO user_actions SET ?';
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Delete essay question.
router.delete('/essay/:id', (req, res, next) => {
    if (req.session.userName) {
        // Delete Query using visibility flag
        const deleteQuestion = `UPDATE essay_questions 
        SET is_deleted = 1 
        WHERE id=${conn.escape(req.params.id)};`;

        conn.query(deleteQuestion, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add delete action into user_tables
                    const actionData = {
                        action: 'delete',
                        content_id: req.params.id,
                        content_type: 'essay_question',
                        user_id: req.session.userId
                    };
                    const addActionQuery = 'INSERT INTO user_actions SET ?';
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Delete image question.
router.delete('/image/:id', (req, res, next) => {
    if (req.session.userName) {
        // Delete Query using visibility flag
        const deleteQuestion = `UPDATE image_questions 
        SET is_deleted = 1 
        WHERE id=${conn.escape(req.params.id)};`;

        conn.query(deleteQuestion, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add delete action into user_tables
                    const actionData = {
                        action: 'delete',
                        content_id: req.params.id,
                        content_type: 'image_question',
                        user_id: req.session.userId
                    };
                    const addActionQuery = 'INSERT INTO user_actions SET ?';
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Show Item
 *
 * @return response()
 */
// Show MC question.
router.get('/mc/show/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT mc_questions.*, skills.name as skill_name, skills.level as skill_level 
            FROM mc_questions 
            JOIN skills 
            ON mc_questions.skill_id = skills.id 
            WHERE mc_questions.id=${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let question = {
                    name: results[0].name,
                    text: results[0].question,
                    explanation: results[0].explanation,
                    correct_answer: results[0].correct_answer,
                    is_random: results[0].is_random ? true : false
                };

                let answers = [
                    { text: results[0].answer_1 },
                    { text: results[0].answer_2 }
                ];
                if (results[0].answer_3) {
                    answers.push({ text: results[0].answer_3 });
                }
                if (results[0].answer_4) {
                    answers.push({ text: results[0].answer_4 });
                }
                if (results[0].answer_5) {
                    answers.push({ text: results[0].answer_5 });
                }
                res.json({
                    skill_name: results[0].skill_name,
                    skill_level: results[0].skill_level,
                    question: question,
                    answers: answers
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

// Show essay question.
router.get('/essay/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT essay_questions.*, skills.name as skill_name, skills.level as skill_level 
        FROM essay_questions 
        JOIN skills 
        ON skills.id = essay_questions.skill_id 
        WHERE essay_questions.id=${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results[0]);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Show image question.
router.get('/image/show/:id', (req, res) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT image_questions.*, skills.name as skill_name, skills.level as skill_level 
            FROM image_questions 
            JOIN skills ON skills.id = image_questions.skill_id 
            WHERE image_questions.id=${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results[0]);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 *
 * @return response()
 */
// Edit MC questions
router.put('/mc/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {};
        data = {
            name: req.body.question.name,
            question: req.body.question.text,
            correct_answer: req.body.question.correct_answer,
            answer_1: req.body.answers[0].text,
            answer_2: req.body.answers[1].text,
            answer_3: req.body.answers[2]?.text || null,
            answer_4: req.body.answers[3]?.text || null,
            answer_5: req.body.answers[4]?.text || null,
            explanation: req.body.question.explanation,
            is_random: req.body.question.is_random,
            is_human_edited: 1
        };
        let sqlQuery = `UPDATE mc_questions 
        SET ?
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add update question action into user_actions table
                    const actionData = {
                        action: 'update',
                        content_type: 'mc_question',
                        content_id: req.params.id,
                        user_id: req.session.userId
                    };
                    const addActionQuery = `INSERT INTO user_actions SET ?`;
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 *
 * @return response()
 */
// Approve MC question edit
router.put('/mc/:id/approve-edits', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {};
        data = {
            name: req.body.question.name,
            question: req.body.question.text,
            correct_answer: req.body.question.correct_answer,
            answer_1: req.body.answers[0].text,
            answer_2: req.body.answers[1].text,
            answer_3: req.body.answers[2]?.text || null,
            answer_4: req.body.answers[3]?.text || null,
            answer_5: req.body.answers[4]?.text || null,
            explanation: req.body.question.explanation,
            is_random: req.body.question.is_random,
            is_human_edited: 1
        };
        let sqlQuery = `UPDATE mc_questions 
        SET ?
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add approve question action into user_actions table
                    recordUserAction(
                        {
                            userId: req.session.userId,
                            userAction: `${
                                req.body.edit ? 'edit_and_approve' : 'approve'
                            }`,
                            contentId: req.params.id,
                            contentType: 'mc_question'
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Submit MC question edit for review.
 */
router.post('/mc/:id/edit-for-review', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {};
        data = {
            mc_question_id: req.params.id,
            user_id: req.body.userId,
            comment: req.body.comment,
            name: req.body.question.name,
            question: req.body.question.text,
            correct_answer: req.body.question.correct_answer,
            answer_1: req.body.answers[0].text,
            answer_2: req.body.answers[1].text,
            answer_3: req.body.answers[2]?.text || null,
            answer_4: req.body.answers[3]?.text || null,
            answer_5: req.body.answers[4]?.text || null,
            explanation: req.body.question.explanation,
            is_random: req.body.question.is_random
        };
        let data2 = {};
        data2 = {
            comment: req.body.comment,
            name: req.body.question.name,
            question: req.body.question.text,
            correct_answer: req.body.question.correct_answer,
            answer_1: req.body.answers[0].text,
            answer_2: req.body.answers[1].text,
            answer_3: req.body.answers[2]?.text || null,
            answer_4: req.body.answers[3]?.text || null,
            answer_5: req.body.answers[4]?.text || null,
            explanation: req.body.question.explanation,
            is_random: req.body.question.is_random
        };
        let sqlQuery = `INSERT INTO mc_questions_awaiting_approval SET ? ON DUPLICATE KEY UPDATE ?, date = CURRENT_TIMESTAMP();`;

        conn.query(sqlQuery, [data, data2], (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    recordUserAction(
                        {
                            userId: req.body.userId,
                            userAction: 'submit_update_for_review',
                            contentType: 'mc_question',
                            contentId: req.params.id
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Get one mc question submitted for review.
 *
 * @return response()
 */
router.get(
    '/mc/submitted-for-review/:mcQuestionId/:userId',
    (req, res, next) => {
        let mcQuestion;
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');
            // Get skill.
            const sqlQuery = `SELECT *
                          FROM mc_questions_awaiting_approval
                          WHERE mc_question_id = ${conn.escape(
                              req.params.mcQuestionId
                          )}
                          AND user_id = ${conn.escape(req.params.userId)};`;

            conn.query(sqlQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }

                    let question = {
                        mc_question_id: results[0].mc_question_id,
                        name: results[0].name,
                        text: results[0].question,
                        explanation: results[0].explanation,
                        correct_answer: results[0].correct_answer,
                        is_random: results[0].is_random ? true : false
                    };

                    let answers = [
                        { text: results[0].answer_1 },
                        { text: results[0].answer_2 }
                    ];
                    if (results[0].answer_3) {
                        answers.push({ text: results[0].answer_3 });
                    }
                    if (results[0].answer_4) {
                        answers.push({ text: results[0].answer_4 });
                    }
                    if (results[0].answer_5) {
                        answers.push({ text: results[0].answer_5 });
                    }
                    res.json({
                        comment: results[0].comment,
                        question: question,
                        answers: answers
                    });
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/**
 * Get one essay question submitted for review.
 *
 * @return response()
 */
router.get(
    '/essay/submitted-for-review/:essayQuestionId/:userId',
    (req, res, next) => {
        let essayQuestion;
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');
            // Get skill.
            const sqlQuery = `SELECT *
                          FROM essay_questions_awaiting_approval
                          WHERE essay_question_id = ${conn.escape(
                              req.params.essayQuestionId
                          )}
                          AND user_id = ${conn.escape(req.params.userId)};`;

            conn.query(sqlQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    essayQuestion = results[0];
                    res.json(essayQuestion);
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/**
 * Get one image question submitted for review.
 *
 * @return response()
 */
router.get(
    '/image/submitted-for-review/:imageQuestionId/:userId',
    (req, res, next) => {
        let imageQuestion;
        if (req.session.userName) {
            res.setHeader('Content-Type', 'application/json');
            // Get skill.
            const sqlQuery = `SELECT *
                              FROM image_questions_awaiting_approval
                              WHERE image_question_id = ${conn.escape(
                                  req.params.imageQuestionId
                              )}
                              AND user_id = ${conn.escape(req.params.userId)};`;

            conn.query(sqlQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    imageQuestion = results[0];
                    res.json(imageQuestion);
                } catch (err) {
                    next(err);
                }
            });
        }
    }
);

/**
 * Delete mc question submitted for review.
 *
 * @return response()
 */
router.delete(
    '/mc/submitted-for-review/:mcQuestionId/:userId',
    (req, res, next) => {
        if (req.session.userName) {
            const deleteQuery = `DELETE 
                             FROM mc_questions_awaiting_approval
                             WHERE mc_question_id = ${conn.escape(
                                 req.params.mcQuestionId
                             )}
                             AND user_id  = ${conn.escape(req.params.userId)};`;

            conn.query(deleteQuery, (err) => {
                try {
                    if (err) {
                        throw err;
                    } else {
                        // Add dismiss actions
                        const actionData = {
                            action: 'dismiss-edit',
                            content_id: req.params.mcQuestionId,
                            user_id: req.session.userId,
                            content_type: 'mc_question'
                        };

                        const addActionQuery = `INSERT INTO user_actions SET ?`;
                        conn.query(addActionQuery, actionData, (err) => {
                            if (err) throw err;
                            res.end();
                        });
                    }
                    res.end();
                } catch (err) {
                    next(err);
                }
            });
        } else {
            res.redirect('/login');
        }
    }
);

/**
 * Delete essay question submitted for review.
 *
 * @return response()
 */
router.delete(
    '/essay/submitted-for-review/:essayQuestionId/:userId',
    (req, res, next) => {
        if (req.session.userName) {
            const deleteQuery = `DELETE 
                             FROM essay_questions_awaiting_approval
                             WHERE essay_question_id = ${conn.escape(
                                 req.params.essayQuestionId
                             )}
                             AND user_id  = ${conn.escape(req.params.userId)};`;

            conn.query(deleteQuery, (err) => {
                try {
                    if (err) {
                        throw err;
                    } else {
                        // Add dismiss actions
                        const actionData = {
                            action: 'dismiss-edit',
                            content_id: req.params.essayQuestionId,
                            user_id: req.session.userId,
                            content_type: 'essay_question'
                        };

                        const addActionQuery = `INSERT INTO user_actions SET ?`;
                        conn.query(addActionQuery, actionData, (err) => {
                            if (err) throw err;
                            res.end();
                        });
                    }
                    res.end();
                } catch (err) {
                    next(err);
                }
            });
        } else {
            res.redirect('/login');
        }
    }
);

/**
 * Delete image question submitted for review.
 *
 * @return response()
 */
router.delete(
    '/image/submitted-for-review/:imageQuestionId/:userId',
    (req, res, next) => {
        if (req.session.userName) {
            const deleteQuery = `DELETE 
                             FROM image_questions_awaiting_approval
                             WHERE image_question_id = ${conn.escape(
                                 req.params.imageQuestionId
                             )}
                             AND user_id = ${conn.escape(req.params.userId)};`;

            conn.query(deleteQuery, (err) => {
                try {
                    if (err) {
                        throw err;
                    } else {
                        // Add dismiss actions
                        const actionData = {
                            action: 'dismiss-edit',
                            content_id: req.params.imageQuestionId,
                            user_id: req.session.userId,
                            content_type: 'image_question'
                        };

                        const addActionQuery = `INSERT INTO user_actions SET ?`;
                        conn.query(addActionQuery, actionData, (err) => {
                            if (err) throw err;
                            res.end();
                        });
                    }
                    res.end();
                } catch (err) {
                    next(err);
                }
            });
        } else {
            res.redirect('/login');
        }
    }
);

// Load all mc type questions.
router.get('/mc/submitted-for-review/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
            SELECT mc_questions_awaiting_approval.*, skills.name AS skill_name
            FROM mc_questions_awaiting_approval
            JOIN mc_questions
            ON mc_questions_awaiting_approval.mc_question_id = mc_questions.id
            JOIN skills
            ON mc_questions.skill_id = skills.id
            ORDER BY mc_questions_awaiting_approval.date DESC
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Edit Essay questions
router.put('/essay/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let sqlQuery = `UPDATE essay_questions 
            SET name= ${conn.escape(req.body.name)}, 
            question = ${conn.escape(req.body.question)},
            is_human_edited = 1 
            WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add edit essay question into user_actions
                    const actionData = {
                        action: 'update',
                        content_type: 'essay_question',
                        content_id: req.params.id,
                        user_id: req.session.userId
                    };

                    const addActionQuery = `INSERT INTO user_actions SET ?`;
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Approve essay question edit submitted for review.
 */
router.put('/essay/:id/approve-edits', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let sqlQuery = `UPDATE essay_questions 
        SET name= ${conn.escape(req.body.name)}, 
        question = ${conn.escape(req.body.question)},
        is_human_edited = 1 
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add approve essay question action into user_actions table
                    recordUserAction(
                        {
                            userId: req.session.userId,
                            userAction: `${
                                req.body.edit ? 'edit_and_approve' : 'approve'
                            }`,
                            contentId: req.params.id,
                            contentType: 'essay_question'
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Submit Essay question edit for review.
 */
router.post('/essay/:id/edit-for-review', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let sqlQuery = `INSERT INTO essay_questions_awaiting_approval (essay_question_id, user_id, name, question, comment)
        VALUES (${conn.escape(req.params.id)}, 
        ${conn.escape(req.body.userId)}, 
        ${conn.escape(req.body.name)}, 
        ${conn.escape(req.body.question)},
        ${conn.escape(req.body.comment)})

        ON DUPLICATE KEY
        UPDATE date = CURRENT_TIMESTAMP(), 
        name = ${conn.escape(req.body.name)}, 
        question = ${conn.escape(req.body.question)}, 
        comment = ${conn.escape(req.body.comment)};`;

        conn.query(sqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    recordUserAction(
                        {
                            userId: req.body.userId,
                            userAction: 'submit_update_for_review',
                            contentType: 'essay_question',
                            contentId: req.params.id
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Load all essay type questions.
router.get('/essay/submitted-for-review/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
            SELECT essay_questions_awaiting_approval.*, skills.name AS skill_name
            FROM essay_questions_awaiting_approval
            JOIN essay_questions
            ON essay_questions_awaiting_approval.essay_question_id = essay_questions.id
            JOIN skills
            ON essay_questions.skill_id = skills.id
            ORDER BY essay_questions_awaiting_approval.date DESC
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Edit Image questions
router.put('/image/:id/edit', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let sqlQuery = `UPDATE image_questions 
        SET name= ${conn.escape(req.body.name)}, 
        question = ${conn.escape(req.body.question)}, 
        num_images_required = ${conn.escape(req.body.num_images_required)},
        is_human_edited = 1
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add edit essay question into user_actions
                    const actionData = {
                        action: 'update',
                        content_type: 'image_question',
                        content_id: req.params.id,
                        user_id: req.session.userId
                    };

                    const addActionQuery = `INSERT INTO user_actions SET ?`;
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Submit Image question edit for review.
 */
router.post('/image/:id/edit-for-review', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let sqlQuery = `INSERT INTO image_questions_awaiting_approval (image_question_id, user_id, name, question, num_images_required, comment)
        VALUES (${conn.escape(req.params.id)},
        ${conn.escape(req.body.userId)},
        ${conn.escape(req.body.name)},
        ${conn.escape(req.body.question)},
        ${conn.escape(req.body.num_images_required)},
        ${conn.escape(req.body.comment)})

        ON DUPLICATE KEY
        UPDATE date = CURRENT_TIMESTAMP(), 
        name = ${conn.escape(req.body.name)}, 
        question = ${conn.escape(req.body.question)}, 
        num_images_required = ${conn.escape(req.body.num_images_required)}, 
        comment = ${conn.escape(req.body.comment)};`;

        conn.query(sqlQuery, (err) => {
            try {
                if (err) {
                    throw err;
                } else {
                    recordUserAction(
                        {
                            userId: req.body.userId,
                            userAction: 'submit_update_for_review',
                            contentType: 'image_question',
                            contentId: req.params.id
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Load all image questions type
router.get('/image-question/submitted-for-review/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
            SELECT image_questions_awaiting_approval.*, skills.name AS skill_name
            FROM image_questions_awaiting_approval
            JOIN image_questions
            ON image_questions_awaiting_approval.image_question_id = image_questions.id
            JOIN skills
            ON image_questions.skill_id = skills.id
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Dynamically create assessments / question banks.
// Load multiple choice type questions.
router.get('/:skillId/multiple-choice', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM mc_questions 
            WHERE skill_id = ${conn.escape(req.params.skillId)}
            AND is_deleted = 0;`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Approve image question edit submitted for review.
 */
router.put('/image/:id/approve-edits', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let sqlQuery = `UPDATE image_questions 
        SET name= ${conn.escape(req.body.name)}, 
        question = ${conn.escape(req.body.question)}, 
        num_images_required = ${conn.escape(req.body.num_images_required)},
        is_human_edited = 1
        WHERE id = ${conn.escape(req.params.id)};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add approve image question action into user_actions table
                    recordUserAction(
                        {
                            userId: req.session.userId,
                            userAction: `${
                                req.body.edit ? 'edit_and_approve' : 'approve'
                            }`,
                            contentId: req.params.id,
                            contentType: 'image_question'
                        },
                        (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.end();
                            }
                        }
                    );
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Load essay type questions.
router.get('/:skillId/essay', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM essay_questions 
            WHERE skill_id = ${conn.escape(req.params.skillId)}
            AND is_deleted = 0;`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Load essay type questions.
router.get('/:skillId/image', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `SELECT * 
            FROM image_questions 
            WHERE skill_id = ${conn.escape(req.params.skillId)}
            AND is_deleted = 0;`;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Used to get flagged essay question AND in mark assessment Component
// Load all essay type questions.
router.get('/essay/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM essay_questions WHERE is_deleted = 0;';
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Load all mc type questions.
router.get('/mc/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM mc_questions WHERE is_deleted = 0;';
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

// Load all image type questions.
router.get('/image/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = 'SELECT * FROM image_questions WHERE is_deleted = 0;';
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Create a single New MC Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/mc-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {};
        data = {
            name: req.body.question.name,
            question: req.body.question.text,
            correct_answer: req.body.question.correct_answer,
            answer_1: req.body.answers[0].text,
            answer_2: req.body.answers[1].text,
            answer_3: req.body.answers[2]?.text || null,
            answer_4: req.body.answers[3]?.text || null,
            answer_5: req.body.answers[4]?.text || null,
            explanation: req.body.question.explanation,
            skill_id: req.body.skill_id,
            is_random: req.body.question.is_random,
            is_human_edited: 1
        };
        let sqlQuery = 'INSERT INTO mc_questions SET ?';
        conn.query(sqlQuery, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add create mc_question action into user_actions
                    const actionData = {
                        content_type: 'mc_question',
                        content_id: results.insertId,
                        action: 'create',
                        user_id: req.session.userId
                    };

                    const addActionQuery = `INSERT INTO user_actions SET ?`;
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Create a single New Essay Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/essay-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {};
        data = {
            name: req.body.name,
            question: req.body.question,
            skill_id: req.body.skill_id,
            answer_type: req.body.answer_type,
            is_human_edited: 1
        };

        let sqlQuery = 'INSERT INTO essay_questions SET ?';
        conn.query(sqlQuery, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add create action into user_actions table
                    const actionData = {
                        action: 'create',
                        content_id: results.insertId,
                        content_type: 'essay_question',
                        user_id: req.session.userId
                    };
                    const addActionQuery = `INSERT INTO user_actions SET?`;
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Create a single New Essay Question Manually (not from CSV.)
 *
 * @return response()
 */
router.post('/image-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        // Add data.
        let data = {};
        data = {
            name: req.body.name,
            question: req.body.question,
            skill_id: req.body.skill_id,
            num_images_required: req.body.num_images_required,
            is_human_edited: 1
        };

        let sqlQuery = 'INSERT INTO image_questions SET ?';
        conn.query(sqlQuery, data, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add create action into user_actions table
                    const actionData = {
                        action: 'create',
                        content_id: results.insertId,
                        content_type: 'image_question',
                        user_id: req.session.userId
                    };
                    const addActionQuery = `INSERT INTO user_actions SET?`;
                    conn.query(addActionQuery, actionData, (err) => {
                        if (err) throw err;
                        else res.end();
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Bulk add MC questions from file.
 *
 * @return response()
 */
router.post('/mc-questions/bulk-add', (req, res, next) => {
    if (req.session.userName) {
        // For each question.
        // No need to escape single quotes for SQL to accept,
        // as using '?'.
        for (let i = 0; i < req.body.questionArray.length; i++) {
            // Add the questions.
            let data = {};
            // Trim whitespace off the CSVs (Generative AI adds whitespace to the questions).
            data = {
                name: req.body.questionArray[i].name.trim(),
                question: req.body.questionArray[i].question.trim(),
                correct_answer: req.body.questionArray[i].correct_answer.trim(),
                incorrect_answer_1:
                    req.body.questionArray[i].incorrect_answer_1.trim(),
                incorrect_answer_2:
                    req.body.questionArray[i].incorrect_answer_2.trim(),
                incorrect_answer_3:
                    req.body.questionArray[i].incorrect_answer_3.trim(),
                incorrect_answer_4:
                    req.body.questionArray[i].incorrect_answer_4.trim(),
                explanation: req.body.questionArray[i].explanation.trim(),
                skill_id: req.body.questionArray[i].skillId
            };
            let sqlQuery = `INSERT INTO mc_questions SET ?`;
            conn.query(sqlQuery, data, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    } else {
                        // add bulk-create action in user_actions table
                        const actionData = {
                            action: 'bulk-create',
                            content_id: results.insertId,
                            content_type: 'mc_question',
                            user_id: req.session.userId
                        };
                        const actionQuery = `INSERT INTO user_actions SET ?`;
                        conn.query(actionQuery, actionData, (err) => {
                            if (err) throw err;
                            else res.end();
                        });
                    }
                } catch (err) {
                    next(err);
                }
            });
        }
    } else {
        res.redirect('/login');
    }
});

// ---------------------------------------------------------------------------------------------------

/**
 * List Student MC Questions
 */
router.get('/student-mc-questions/list', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
        SELECT *
        FROM student_mc_questions
        ORDER BY student_mc_questions.create_date DESC
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                res.json(results);
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * Get One Student MC Question
 */
router.get('/student-mc-questions/:id', (req, res, next) => {
    if (req.session.userName) {
        res.setHeader('Content-Type', 'application/json');
        let sqlQuery = `
        SELECT *
        FROM student_mc_questions
        WHERE id = ${req.params.id};
        `;
        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                }

                let question = {
                    skill_id: results[0].skill_id,
                    student_id: results[0].student_id,
                    name: results[0].name,
                    text: results[0].question,
                    explanation: results[0].explanation,
                    correct_answer: results[0].correct_answer,
                    is_random: results[0].is_random ? true : false
                };

                let answers = [
                    { text: results[0].answer_1 },
                    { text: results[0].answer_2 }
                ];
                if (results[0].answer_3) {
                    answers.push({ text: results[0].answer_3 });
                }
                if (results[0].answer_4) {
                    answers.push({ text: results[0].answer_4 });
                }
                if (results[0].answer_5) {
                    answers.push({ text: results[0].answer_5 });
                }
                res.json({
                    question: question,
                    answers: answers
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

/**
 * List Student MC Questions full data
 */
router.get('/student-mc-questions/full-data-list', (req, res, next) => {
    if (req.session.userName) {
        // extra check for user role
        if ((req.session.role = 'instructor')) {
            res.setHeader('Content-Type', 'application/json');
            let sqlQuery = `SELECT student_mc_questions.*, skills.name AS skillname, users.username AS student
                            FROM student_mc_questions JOIN users ON users.id = student_mc_questions.student_id 
                            JOIN skills ON student_mc_questions.skill_id = skills.id 
                            JOIN instructor_students ON instructor_students.student_id = student_mc_questions.student_id 
                            WHERE instructor_students.instructor_id = ${conn.escape(
                                req.session.userId
                            )};`;

            conn.query(sqlQuery, (err, results) => {
                try {
                    if (err) {
                        throw err;
                    }
                    res.json(results);
                } catch (err) {
                    next(err);
                }
            });
        }
    }
});

/**
 * Add Student MC Questions submitted for review
 */
router.post('/student-mc-questions/add', (req, res, next) => {
    if (req.session.userName) {
        // Add data.
        let data = {};
        data = {
            question: req.body.question.text,
            correct_answer: req.body.question.correct_answer,
            answer_1: req.body.answers[0].text,
            answer_2: req.body.answers[1].text,
            answer_3: req.body.answers[2]?.text || null,
            answer_4: req.body.answers[3]?.text || null,
            answer_5: req.body.answers[4]?.text || null,
            explanation: req.body.question.explanation,
            skill_id: req.body.skill_id,
            is_random: req.body.question.is_random,
            student_id: req.body.student_id
        };

        let sqlQuery = 'INSERT INTO student_mc_questions SET ?';
        conn.query(sqlQuery, data, (err, result) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // add create actions into user-actions table
                    const actionData = {
                        content_id: result.insertId,
                        user_id: data.student_id,
                        action: 'create',
                        content_type: 'student_mc_question'
                    };
                    const actionQuery = 'INSERT INTO user_actions SET ?';
                    conn.query(actionQuery, actionData, (err) => {
                        if (err) {
                            throw err;
                        } else {
                            res.end();
                        }
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Delete Student MC Question
 */
router.delete('/student-mc-questions/:id', (req, res, next) => {
    if (req.session.userName) {
        let sqlQuery = `DELETE FROM student_mc_questions WHERE id= ${conn.escape(
            req.params.id
        )};`;

        conn.query(sqlQuery, (err, results) => {
            try {
                if (err) {
                    throw err;
                } else {
                    // Add delete student-mc-questions action in to user_actions
                    const actionsData = {
                        action: 'delete',
                        content_id: req.params.id,
                        user_id: req.session.userId,
                        content_type: 'student_mc_question'
                    };
                    const actionQuery = `INSERT INTO user_actions SET ?`;
                    conn.query(actionQuery, actionsData, (err) => {
                        if (err) {
                            throw err;
                        } else {
                            res.end();
                        }
                    });
                }
            } catch (err) {
                next(err);
            }
        });
    } else {
        res.redirect('/login');
    }
});

/**
 * Check Questions.
 */
let mcQuestions = [];
let skills = [];

router.get('/check-questions', (req, res, next) => {
    if (req.session.userName) {
        // The user posting the source.
        userId = req.session.userId;
        res.setHeader('Content-Type', 'application/json');
        // Get all MC questions.
        let sqlQuery1 = `SELECT * FROM mc_questions   
        WHERE is_checked = 0
        AND is_deleted = 0
        AND skill_id > 1591
        AND skill_id < 1598      
        ORDER BY skill_id`;
        conn.query(sqlQuery1, (err, results) => {
            try {
                if (err) {
                    throw err;
                }
                mcQuestions = results;
                // Get all skills.
                let sqlQuery2 = `SELECT * FROM skills`;
                let query2 = conn.query(sqlQuery2, (err, results) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        skills = results;

                        for (let i = 0; i < skills.length; i++) {
                            for (let j = 0; j < mcQuestions.length; j++) {
                                if (skills[i].id == mcQuestions[j].skill_id) {
                                    // Get grade info.
                                    if (skills[i].level == 'grade_school') {
                                        mcQuestions[j].level = 'grade school';
                                    } else if (
                                        skills[i].level == 'middle_school'
                                    ) {
                                        mcQuestions[j].level = 'middle school';
                                    } else if (
                                        skills[i].level == 'high_school'
                                    ) {
                                        mcQuestions[j].level = 'high school';
                                    } else if (skills[i].level == 'college') {
                                        mcQuestions[j].level = 'college';
                                    } else if (skills[i].level == 'phd') {
                                        mcQuestions[j].level = 'phd';
                                    }
                                    continue;
                                }
                            }
                        }
                        //console.log(mcQuestions[0], req.session.userId);
                        let index = 0;
                        // Now we ask ChatGPT to check each one.
                        checkQuestion(index, userId);
                    } catch (err) {
                        next(err);
                    }
                });
            } catch (err) {
                next(err);
            }
        });
    }
});

// Using ChatGPT.
// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
// To access the .env file.
require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.CHAT_GPT_API_KEY
});

/**
 * AI Mark essay questions.
 */
router.post('/mark-essay-question', async (req, res, next) => {
    if (req.session.userName) {
        // Error handling to prevent OpenAI from crashing the app
        try {
            let question = req.body.question;
            let answer = req.body.answer;
            // Remove underscores from the variables.
            let level = req.body.level.replace('_', ' ');
            let teacherReview;
            teacherReview = await aiMarkEssayQuestionAnswer(
                question,
                answer,
                level
            );

            let result = {
                isCorrect: teacherReview.is_correct,
                explanation: teacherReview.explanation
            };
            res.json(result);
        } catch {
            // Handle OpenAI crash.
            console.log('error with OpenAI call');
            res.redirect('/');
        }
    } else {
        res.redirect('/login');
    }
});

async function aiMarkEssayQuestionAnswer(question, answer, level) {
    // Create prompt for ChatGPT.
    let prompt = `Please check if '${answer}' answers the question '${question}' correctly.

    Please imagine this answer comes from a student at a '${level}' level, and answer appropriately to that level.
    If it does, please return the variable 'is_correct' as true, if not, please return it as false.
    If the answer is not correct, please explain why, by returning the variable 'explanation', containing a string that explains this.
    `;

    // Prevent the app from crashing if anything goes wrong with the API call.
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a kind and patient teacher of someone at a ' +
                        level +
                        ' level.'
                },
                {
                    role: 'user',
                    content: prompt + ` Please respond with a JSON object.`
                }
            ],
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
        // Convert string to object.
        var responseObj = JSON.parse(escapedResponseJSON);

        return responseObj;
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

/**
 * AI Mark image questions.
 */
router.post('/mark-image-question', async (req, res, next) => {
    if (req.session.userName) {
        // Error handling to prevent OpenAI from crashing the app
        let result;
        try {
            let question = req.body.question;
            let answer = req.body.answer;
            // Remove underscores from the variables.
            let level = req.body.level.replace('_', ' ');
            let teacherReview;
            teacherReview = await aiMarkImageQuestionAnswer(
                question,
                answer,
                level
            );

            result = {
                isCorrect: teacherReview.is_correct,
                explanation: teacherReview.explanation
            };
        } catch {
            console.log('error with OpenAI call');
            result = {
                isError: true
            };
        }
        console.log(result);
        res.json(result);
    } else {
        res.redirect('/login');
    }
});

/**
 * Mark images questions.
 */
async function aiMarkImageQuestionAnswer(question, answer, level) {
    let prompt = `Please check if '${answer}' answers the question '${question}' correctly.

    Please imagine this answer comes from a student at a '${level}' level, and answer appropriately to that level.
    If it does, please return the variable 'is_correct' as true, if not, please return it as false.
    If the answer is not correct, please explain why, by returning the variable 'explanation', containing a string that explains this.
    `;
    // Prevent the app from crashing if anything goes wrong with the API call.
    try {
        let contentArray = [];
        contentArray.push({
            type: 'text',
            text: prompt + ` Please respond with a JSON object.`
        });
        for (let i = 0; i < answer.length; i++) {
            let contentObject = {
                type: 'image_url',
                image_url: {
                    url: answer[i]
                }
            };
            contentArray.push(contentObject);
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a kind and patient teacher of someone at a ' +
                        level +
                        ' level.'
                },
                {
                    role: 'user',
                    content: contentArray
                }
            ],
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
        // Convert string to object.
        var responseObj = JSON.parse(escapedResponseJSON);
        console.log(responseObj);
        return responseObj;
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

async function checkQuestion(index, userId) {
    // Create prompt for ChatGPT.
    let prompt =
        `Please check the following for the quiz question: "` +
        mcQuestions[index].question +
        `" Please review if the following answer is the correct
        answer for this question: "` +
        mcQuestions[index].correct_answer +
        `". Please use the explanation:` +
        mcQuestions[index].explanation +
        `
        to help you decide whether it is correct.
        If it is, please return a variable called 'correct_answer_is_correct' as true, 
        otherwise return it as false. Please also check whether the 
        following four answers are all incorrect answers for this question: "` +
        mcQuestions[index].incorrect_answer_1 +
        `"; "` +
        mcQuestions[index].incorrect_answer_2 +
        `"; "` +
        mcQuestions[index].incorrect_answer_3 +
        '"; "' +
        mcQuestions[index].incorrect_answer_4 +
        `". Return the variable: 'all_incorrect_answers_are_incorrect' as true if so, otherwise, 
        return it as false.`;

    // Please also check for any spelling errors. Please return a variable spelling_correct as true if it is,
    // otherwise, return this as false.`;
    // Lastly please check if the question is appropriate for the following grade: ` +
    // mcQuestions[index].level +
    // `. Please return the variable 'grade_is_correct' as true if it is, otherwise as false.`;

    // Attempting to prevent the app from crashing if anything goes wrong with the API call.
    // ie, error handling.
    try {
        console.log('Checking question: ');
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                {
                    role: 'user',
                    content: prompt + ` Please respond with a JSON object.`
                }
            ],
            model: 'gpt-4o',
            response_format: { type: 'json_object' }
        });
        let responseJSON = completion.choices[0].message.content;
        // Escape newline characters in response.
        escapedResponseJSON = responseJSON.replace(/\\n/g, '\\n');
        // Convert string to object.
        var responseObj = JSON.parse(escapedResponseJSON);
        console.log(responseObj);

        // Check ChatGPT response.
        // If it spots a problem, flag the question.
        if (
            responseObj.correct_answer_is_correct == false ||
            responseObj.all_incorrect_answers_are_incorrect == false
        ) {
            let data = {};
            data = {
                content_type: 'mc_question',
                content_id: mcQuestions[index].id,
                user_id: userId
            };

            let sqlQuery1 = 'INSERT IGNORE INTO content_flags SET ?';
            let query1 = conn.query(sqlQuery1, data, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    // Mark this question as checked.
                    let sqlQuery2 =
                        `
                    UPDATE mc_questions
                    SET is_checked = 1
                    WHERE id = ` +
                        mcQuestions[index].id +
                        `;`;

                    let query2 = conn.query(sqlQuery2, (err) => {
                        try {
                            if (err) {
                                throw err;
                            }
                            console.log(
                                'MC question ' +
                                    mcQuestions[index].id +
                                    ' complete'
                            );
                            // Check the next question.
                            index++;
                            if (index < mcQuestions.length)
                                checkQuestion(index, userId);
                        } catch (err) {
                            console.log('error: ' + err);
                        }
                    });
                } catch (err) {
                    console.log('error: ' + err);
                }
            });
        }
        // If ChatGPT does not spot a problem.
        else {
            // Mark this question as checked.
            let sqlQuery2 =
                `
        UPDATE mc_questions
        SET is_checked = 1
        WHERE id = ` +
                mcQuestions[index].id +
                `;`;

            let query2 = conn.query(sqlQuery2, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    console.log(
                        'MC question ' + mcQuestions[index].id + ' complete'
                    );
                    // Check the next question.
                    index++;
                    if (index < mcQuestions.length)
                        checkQuestion(index, userId);
                } catch (err) {
                    console.log('error: ' + err);
                }
            });
        }
    } catch (err) {
        console.log('Error with ChatGPT API call: ' + err);
        return;
    }
}

module.exports = router;
