<script>
export default {
    props: {
        questions: {
            type: Array,
            required: true
        }
    },
    methods: {
        formatDate(unformattedDate) {
            // Prep the date and time data ---------------
            // Split timestamp into [ Y, M, D, h, m, s ]
            var date = unformattedDate.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            // Apply each element to the Date function
            var finalDate = new Date(
                Date.UTC(
                    newDate[0],
                    newDate[1] - 1,
                    newDate[2],
                    newDate[3],
                    newDate[4],
                    newDate[5]
                )
            );
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <h2 class="secondary-heading white-heading h4">Check New Questions</h2>

        <div class="list-body pt-2">
            <div v-if="questions.length > 0">
                <div class="question" v-for="question in questions">
                    <RouterLink
                        class="question-link"
                        :to="`/check-student-question/${question.id}`"
                    >
                        <span class="student-name">
                            {{ question.student }},
                        </span>
                        <span class="skill-name">
                            {{ question.skillname }},
                        </span>
                        <span class="date">{{
                            formatDate(question.create_date)
                        }}</span>
                    </RouterLink>
                </div>
            </div>
            <div v-else class="empty-message">
                There are no student submitted questions to be checked
                currently.
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-div {
    padding: 0 15px;
}

.question {
    border: 1px solid var(--item-border, #dbd0f9);
    margin: 0px 0px 8px 0px;
    padding: 12px 16px;
    border-radius: 6px;
    transition: all 0.2s ease;
    background: var(--item-bg, rgba(255, 255, 255, 0.8));
}

.question:hover {
    transform: translateY(-1px);
    box-shadow: var(--item-hover-shadow, 0 4px 12px rgba(95, 49, 221, 0.15));
    border-color: var(--item-hover-border, #8f7bd6);
    background: var(--item-hover-bg, initial);
}

.question-link {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 500;
    line-height: 28px;
    text-decoration: none;
    color: var(--text-color, #667085);
    display: block;
}

.student-name {
    color: var(--student-color, #8f7bd6);
    font-weight: 600;
    text-shadow: var(--student-shadow, none);
}

.skill-name {
    color: var(--skill-color, #667085);
}
.date {
    color: var(--date-color, #667085);
    font-size: 14px;
}

.question-link:hover,
.question-link:hover .student-name,
.question-link:hover .skill-name,
.question-link:hover .date {
    color: var(--hover-color, #7f56d9);
    cursor: pointer;
}

.empty-message {
    color: var(--text-color, #667085);
    text-align: center;
    padding: 40px 20px;
    font-style: italic;
    background: var(--item-bg, rgba(255, 255, 255, 0.8));
    border: 1px solid var(--item-border, #dbd0f9);
    border-radius: 8px;
}

.list-body {
    overflow: auto;
}

/* Theme overrides */
.instructor-theme {
    --item-border: #040095;
    --item-bg: rgba(255, 255, 255, 0.9);
    --item-hover-bg: rgba(255, 255, 255, 0.95);
    --item-hover-shadow: 0 4px 12px rgba(4, 0, 149, 0.2);
    --student-color: #040095;
    --skill-color: #b8860b;
    --date-color: #666;
    --hover-color: #0066cc;
}
.instructor-theme .question-link:hover .skill-name {
    color: #daa520;
}

.editor-theme {
    --item-border: #555;
    --item-bg: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.04) 100%
    );
    --item-hover-bg: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.12) 0%,
        rgba(255, 255, 255, 0.08) 100%
    );
    --item-hover-border: #777;
    --item-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    --text-color: #e0e0e0;
    --student-color: #b8a3ff;
    --student-shadow: 0 0 8px rgba(184, 163, 255, 0.3);
    --skill-color: #ffd700;
    --date-color: #c0c0c0;
    --hover-color: #f0f0f0;
}
.editor-theme .question {
    backdrop-filter: blur(10px);
}
.editor-theme .question-link:hover .student-name {
    color: #d4c5ff;
    text-shadow: 0 0 12px rgba(212, 197, 255, 0.5);
}
.editor-theme .question-link:hover .skill-name {
    color: #ffea00;
}
.editor-theme .question-link:hover .date {
    color: #e0e0e0;
}
.editor-theme .empty-message {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
}
</style>
