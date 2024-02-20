import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Import Pixi JS.
//import * as PIXI from 'pixi.js';
import * as PIXI from 'pixi.js-legacy';

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
    cullable: true,
    // We are using the canvas, as it seems to give much better performance than WebGL.
    forceCanvas: false,
    background: '#FFF'
});

app.config.globalProperties.$pixiApp = pixiApp;

app.mount('#app');
