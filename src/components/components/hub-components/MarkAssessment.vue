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
        <h2 class="secondary-heading h4">Mark Assessments</h2>
        <div id="list-body">
            <div class="assessment" v-for="assessment in this.assessments">
                <RouterLink
                    class="assessment-link"
                    :to="'/mark-assessment/' + assessment.id"
                >
                    <span id="student-name">
                        {{ assessment.studentUsername }},
                    </span>
                    <span id="skill-name"> {{ assessment.skillName }}, </span>
                    <span id="date">
                        {{ assessment.date }}
                    </span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.assessment {
    border: 1px solid #dbd0f9;
    margin: 0px;
    padding: 10px 6px;
}

.assessment-link {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    text-decoration: none;
    color: #667085;
}

#student-name {
    color: #8f7bd6;
}

.assessment-link:hover #date {
    color: #7f56d9;
    cursor: pointer;
}

.assessment-link:hover {
    color: #7f56d9;
    cursor: pointer;
}

.assessment-link:hover #student-name {
    color: #7f56d9;
    cursor: pointer;
}

#list-body {
    overflow: auto;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}
</style>
