import { createApp } from 'vue'
import { createPinia } from 'pinia'
import mitt from 'mitt'

import App from './App.vue'
import router from './router'

// Import Pixi JS.
import * as PIXI from 'pixi.js';
/**
 * Create the  a Vue global variable.
 * Using event bus in Vue 3 to calling method globally
 */
const emitter = mitt();
const app = createApp(App);

app.use(createPinia());
app.use(router);

// Create the Pixi application as a Vue global variable.
// Have to do this, as otherwise get propagation error when try to access this
// in different methods on the component.
var pixiApp = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 1,
    transparent: true,
    antialias: true,
    useContextAlpha: false,
    autoStart: true,
    cullable: true
});

app.config.globalProperties.$pixiApp = pixiApp;
app.config.globalProperties.emitter = emitter;
app.mount('#app')

