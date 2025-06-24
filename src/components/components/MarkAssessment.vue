<script>
export default {
    props: {
        assessments: {
            type: Array,
            required: true
        }
    },
    setup() {
        return {};
    },
    data() {
        return {};
    },
    computed: {},
    methods: {}
};
</script>

<template>
    <div class="container-fluid">
        <h2 class="secondary-heading white-heading h4">Mark Assessments</h2>
        <div id="list-body">
            <div v-if="assessments.length > 0">
                <div class="assessment" v-for="assessment in this.assessments">
                    <RouterLink
                        class="assessment-link"
                        :to="'/mark-assessment/' + assessment.id"
                    >
                        <span id="student-name">
                            {{ assessment.studentUsername }},
                        </span>
                        <span id="skill-name">
                            {{ assessment.skillName }},
                        </span>
                        <span id="date">
                            {{ assessment.date }}
                        </span>
                    </RouterLink>
                </div>
            </div>
            <div v-else class="empty-message">
                There are no assessments to be marked currently.
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Base styles */
.assessment {
    border: 1px solid var(--item-border, #dbd0f9);
    margin: 0px 0px 8px 0px;
    padding: 12px 16px;
    border-radius: 6px;
    transition: all 0.2s ease;
    background: var(--item-bg, rgba(255, 255, 255, 0.8));
}

.assessment:hover {
    transform: translateY(-1px);
    box-shadow: var(--item-hover-shadow, 0 4px 12px rgba(95, 49, 221, 0.15));
    border-color: var(--item-hover-border, #8f7bd6);
    background: var(--item-hover-bg, initial);
}

.assessment-link {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 500;
    line-height: 28px;
    text-decoration: none;
    color: var(--text-color, #667085);
    display: block;
}

#student-name {
    color: var(--student-color, #8f7bd6);
    font-weight: 600;
    text-shadow: var(--student-shadow, none);
}

#skill-name {
    color: var(--skill-color, #667085);
}
#date {
    color: var(--date-color, #667085);
    font-size: 14px;
}

.assessment-link:hover,
.assessment-link:hover #student-name,
.assessment-link:hover #skill-name,
.assessment-link:hover #date {
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

#list-body {
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
.instructor-theme .assessment-link:hover #skill-name {
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
.editor-theme .assessment {
    backdrop-filter: blur(10px);
}
.editor-theme .assessment-link:hover #student-name {
    color: #d4c5ff;
    text-shadow: 0 0 12px rgba(212, 197, 255, 0.5);
}
.editor-theme .assessment-link:hover #skill-name {
    color: #ffea00;
}
.editor-theme .assessment-link:hover #date {
    color: #e0e0e0;
}
.editor-theme .empty-message {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #a0a0a0;
}
</style>
