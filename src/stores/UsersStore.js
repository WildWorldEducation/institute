import { defineStore } from 'pinia';

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [],
        usersIncludingDeleted: [],
        instructors: [],
        editors: [],
        studentsOfInstructor: [],
        studentsPerTenant: [],
        selectedUserId: null, // Add this to track selected user,
        partners: []
    }),
    actions: {
        setSelectedUser(id) {
            this.selectedUserId = id;
        },
        clearSelectedUser(id) {
            this.selectedUserId = null;
        },
        async getUsers() {
            const result = await fetch('/users/list');
            const data = await result.json();
            this.users = data;
        },
        async getStudentsPerTenant(tenant) {
            const result = await fetch(
                '/users/tenant/' + tenant + '/students/list'
            );
            const data = await result.json();
            this.studentsPerTenant = data;
        },
        async getUsersIncludingDeleted() {
            const result = await fetch('/users/list-including-deleted');
            const data = await result.json();
            this.usersIncludingDeleted = data;
        },
        async getInstructors() {
            const result = await fetch('/users/instructors/list');
            const data = await result.json();
            this.instructors = data;
        },
        async getInstructorsByTenant(tenantId) {           
            const result = await fetch(
                '/users/instructors/tenant/' + tenantId + '/list'
            );
            const data = await result.json()      
            this.instructors = data;
        },
        async getEditors() {
            const result = await fetch('/users/editors/list');
            const data = await result.json();
            this.editors = data;
        },
        async getStudentsOfUser(instructorId) {
            const result = await fetch(
                `/users/student-of-instructors/${instructorId}`
            );
            const data = await result.json();

            this.studentsOfInstructor = data;
        },
        async deleteUser(id) {
            this.users = this.users.filter((u) => {
                return u.id !== id;
            });

            const result = fetch('/users/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }
        },
        async removeStudentFromInstructor(studentId, instructorId) {
            this.studentsOfInstructor = this.studentsOfInstructor.filter(
                (u) => {
                    return u.id !== studentId;
                }
            );
            const result = await fetch(
                `/users/${studentId}/remove/instructor`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instructor_id: instructorId
                    })
                }
            );
            if (result.error) {
                console.log(result.error);
            } else {
                this.studentsOfInstructor = this.studentsOfInstructor.filter(
                    (u) => {
                        return u.id !== studentId;
                    }
                );
            }
        },
        async getPartners() {
            await fetch('/users/partners')
                .then(async function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    this.partners = data;
                });
        }, 
       async editTeacher(teacher) {
            try {               
                const reqOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: teacher.username,
                        email: teacher.email,
                        first_name: teacher.first_name,
                        last_name: teacher.last_name,
                        tenant_id: teacher.tenant_id,
                        role: teacher.role
                    })
                };
                await fetch(`/users/${teacher.id}/edit`, reqOptions);
            } catch (error) {
                console.error('Error updating teacher:', error);
            }
        }
    }
});
