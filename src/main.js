import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Import Pixi JS.
import * as PIXI from 'pixi.js';
//import * as PIXI from 'pixi.js-legacy';
// Import Pixi Viewprt.
import { Viewport } from 'pixi-viewport';

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

// Make the Pixi app a global variable available everywhere in the Vue app.
app.config.globalProperties.$pixiApp = pixiApp;

// Create the viewport in Pixi, for panning and zooming.
const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: window.innerWidth,
    worldHeight: window.innerHeight,
    events: pixiApp.renderer.events
});

pixiApp.stage.addChild(viewport);

viewport.center = new PIXI.Point(100, 0);
viewport.setZoom(0.1);
viewport
    .drag({
        wheelScroll: 2,
        factor: 2
    })
    .pinch({
        percent: 2,
        factor: 2
    })
    .wheel()
    .decelerate()
    .clampZoom({ minScale: 0.001, maxScale: 10 });

// Create Pixi containers for each skill tree.
// So as to be able to hide them when the user moves to a different one,
// so they dont print over one another.
// Rather than clearing and rebuilding them, which would take time.
// A bit like 2 scenes.
app.config.globalProperties.$tidyTreeContainer = new PIXI.Container();
viewport.addChild(app.config.globalProperties.$tidyTreeContainer);
app.config.globalProperties.$radialTreeContainer = new PIXI.Container();
viewport.addChild(app.config.globalProperties.$radialTreeContainer);

app.mount('#app');
