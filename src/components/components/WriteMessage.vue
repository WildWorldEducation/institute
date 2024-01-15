<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore';

export default {
  props: ['userId'],
  setup() {
    const usersStore = useUsersStore();
    // Run the GET request.
    if (usersStore.users.length < 1) usersStore.getUsers();
    return {
      usersStore,
    };
  },
  data() {
    return {
      message: '',
    };
  },
  computed: {},
  methods: {
    SendMessage(userId) {
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: this.message,
        }),
      };

      var url = '/users/' + this.userId + '/edit-message';
      fetch(url, requestOptions).then(() => {
        this.message = '';
        alert('Message sent');
      });
    },
  },
};
</script>

<template>
  <div id="message-container" class="container mt-3">
    <label class="form-label">Personal Message</label>
    <textarea
      v-model="message"
      class="form-control"
      rows="4"
      placeholder="Type here..."
    ></textarea>
    <button class="btn green-btn" @click="SendMessage(userId)">Send</button>
  </div>
</template>

<style scoped>
.green-btn {
  margin-top: 10px;
  margin-left: auto;
  margin-right: 0px;
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
}

#message-container {
  margin-bottom: 40px;
  background-color: #e4ecf4;
  border-radius: 12px;
  padding: 33px 28px;
}

.form-label {
  color: #344054;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Poppins' sans-serif;
}
</style>
