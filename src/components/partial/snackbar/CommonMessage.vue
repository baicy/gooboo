<template>
  <v-card color="transparent" flat>
    <v-card-text class="pa-0 white--text">
      <v-icon>{{ message.icon || 'mdi-help' }}</v-icon>
      {{ message.message }}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  },
}
</script>
