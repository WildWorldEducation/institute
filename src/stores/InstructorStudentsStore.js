import { defineStore } from 'pinia'

export const useInstructorStudentsStore = defineStore("instructorStudents", {
    state: () => {
        return {
            instructorStudentsList: []
        }
    },
    actions: {
        async getInstructorStudentsList() {
            const result = await fetch('/instructor-students/list');
            const data = await result.json();

            this.instructorStudentsList = data;

            return this.$state;
        },
        // async deleteInstructorStudentsRecords() {
        //     const result = await fetch('/assessments/' + id,
        //         {
        //             method: 'DELETE',
        //         })

        //     if (result.error) {
        //         console.log(result.error)
        //     }
        // }
    }
});