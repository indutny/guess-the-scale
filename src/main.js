import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App);

app.directive('focus', {
  mounted(elem) {
    elem.focus();
  }
});

app.mount('#app')
