import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Import Pixi JS.
import * as PIXI from 'pixi.js';
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
    // Visual quality.
    resolution: 1,
    transparent: true,
    // Visual quality.
    antialias: true,
    useContextAlpha: false,
    // Whether the Pixi application will start now.
    // Should only start when being viewd as takes a lot of resources.
    autoStart: false,
    cullable: true,
    // Whether to use the canvas or WebGL.
    forceCanvas: false,
    background: 0x1e293b,
    clearBeforeRender: true
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

// Create Pixi container for skill tree.
app.config.globalProperties.$radialTreeContainer = new PIXI.Container();
viewport.addChild(app.config.globalProperties.$radialTreeContainer);

app.mount('#app');
