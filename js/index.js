"use strict";

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var baseUrl = "img/";

var loader = new PIXI.loaders.Loader(baseUrl).add("face", "spacecat.png").load(init);

var lastLoop = new Date;
var loopCounter = 0;
var loopLimit = 60;

var info = document.getElementById("info");

var threshold = 30;
var warmup = true;
var catsRendered = 1;

var minX = 0;
var minY = 0;
var maxX = window.innerWidth;
var maxY = window.innerHeight;

var gravity = 0.5;
var total = 0;
var batch = 12;
var limit = 5000;

var ease = Power0.easeNone;

var faces = [];
var isAdding = false;

var view = document.querySelector("canvas");

var stage = new PIXI.Container();

var renderer = PIXI.autoDetectRenderer(maxX, maxY, { view: view });

var container = new PIXI.ParticleContainer(limit, {
    scale: true,
    position: true,
    rotation: true,
    uvs: false,
    alpha: true
});

var texture;

stage.addChild(container);

//
// SPACE CAT
// ========================================================================

var SpaceCat = (function(_PIXI$Sprite) {
    _inherits(SpaceCat, _PIXI$Sprite);

    function SpaceCat(texture) {
        _classCallCheck(this, SpaceCat);

        _PIXI$Sprite.call(this, texture);

        var repeat = -1;
        var yoyo = true;

        var time1 = _.random(0.5, 3);
        var time2 = _.random(2, 4.5);
        var time3 = _.random(2, 4.5);

        var prog1 = _.random(1, true);
        var prog2 = _.random(1, true);
        var prog3 = _.random(1, true);

        var scale = _.random(0.5);
        var alpha = _.random(0.4, 1);

        var speedX = _.random(-10, 10, true);
        var speedY = _.random(2, 10, true);

        var startX = _.random(maxX);
        var angle = _.randomSign() * Math.PI * 2;

        this.anchor.set(0.5);
        this.pivot.set(0.5);
        this.scale.set(0.1);

        this.x = startX;
        this.alpha = alpha;
        this.rotation = 0;

        this.speed = new PIXI.Point(speedX, speedY);

        TweenMax.to(this, time1, { repeat: repeat, ease: ease, rotation: angle }).progress(prog1);
        TweenMax.to(this, time2, { repeat: repeat, ease: ease, yoyo: yoyo, alpha: 1 }).progress(prog2);
        TweenMax.to(this.scale, time3, { repeat: repeat, ease: ease, yoyo: yoyo, x: 1, y: 1 }).progress(prog3);
    }

    //
    // INIT
    // ========================================================================

    SpaceCat.prototype.update = function update() {

        this.x += this.speed.x;
        this.y += this.speed.y;
        this.speed.y += gravity;

        if (this.x > maxX) {

            this.x = maxX;
            this.speed.x *= -1;
        } else if (this.x < minX) {

            this.x = minX;
            this.speed.x *= -1;
        }

        if (this.y > maxY) {

            this.y = maxY;
            this.speed.y *= -1;
        } else if (this.y < minY) {

            this.y = minY;
            this.speed.y = 0;
        }
    };

    return SpaceCat;
})(PIXI.Sprite);

function init(loader, assets) {

    texture = assets.face.texture;

    var visible = true;

    var toggle = function toggle(event) {

        isAdding = !isAdding;

        if (visible) {
            visible = false;
            TweenLite.to("#info", 1, { autoAlpha: 0 });
        }
    };
    window.addEventListener("resize", resize);
    TweenLite.ticker.addEventListener("tick", render);
    TweenLite.set("main", { autoAlpha: 1 });

    createCats(1);
}

//
// CREATE FACES
// ========================================================================
function createCats(count) {

    catsRendered += count;

    for (var i = 0; i < count; i++) {

        TweenLite.delayedCall(_.random(0.5), createCat);
    }

    function createCat() {

        var face = new SpaceCat(texture);

        faces.push(face);
        container.addChild(face);
        total++;
    }
}

//
// RESIZE
// ========================================================================
function resize() {

    maxX = window.innerWidth;
    maxY = window.innerHeight;

    renderer.resize(maxX, maxY);
}

//
// RENDER
// ========================================================================
function render() {

    var thisLoop = new Date;
    var fps = 1000 / (thisLoop - lastLoop);
    lastLoop = thisLoop;

    for (var i = 0; i < total; i++) {
        faces[i].update();
    }

    if(warmup && catsRendered > 120){
       warmup = false;
       catsRendered = 0;
    }

    if (fps > threshold) {
        renderer.render(stage);
        createCats(1);
        info.innerHTML = Math.floor(fps) + ' FPS';
    }
    else if(!warmup){
        info.innerHTML = 'Benchmark finished, SCORE: ' + catsRendered +' cats';
        threshold = 1000;
    }

}
