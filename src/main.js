import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import Pixi JS.
import * as PIXI from 'pixi.js';

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Create the Pixi application as a Vue global variable.
// Have to do this, as otherwise get propagation error when try to access this
// in different methods on the component.
var pixiApp = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: 2,
    transparent: true,
    antialias: true,
    useContextAlpha: false,
    autoStart: true,
    cullable: true
});

app.config.globalProperties.$pixiApp = pixiApp;

app.mount('#app')
