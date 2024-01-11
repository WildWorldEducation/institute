<script>
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
  setup() {
    const userDetailsStore = useUserDetailsStore();
    // Run the GET request.
    userDetailsStore.getUserDetails();
    return {
      userDetailsStore,
    };
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<template>
  <table class="table table-bordered">
    <thead>
      <tr>
        <th scope="col">My Messages</th>
      </tr>
    </thead>
    <tbody id="message-table-body">
      <tr>
        <td class="text-break">
          {{
            userDetailsStore.message
            ? userDetailsStore.message
            : 'You have no messages'
          }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
th {
  background-color: #8f7bd6;
  border-color: #7058c2;
  color: #e8e2f9;
}

td {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: #667085;
}

#message-table-body>tr {
  width: fit-content;
  padding-top: 10px;
  padding-bottom: 10px;
}

#message-table-body td {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>
