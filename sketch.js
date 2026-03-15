// Game Project 
var gameChar_x;
var gameChar_y;
var floorPos_y;
var gameChar_width;
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var trees;
var clouds;
var moon;
var canyons;
var mountains;
var collectables;
let tiltAmountCollectable = 0;//variable to tilt the collectable 
var flagpole;
var lives; 
var gameOver;
var platform;
var onPlatform;
var stars = [];
var isFound;
var cameraPosX;
var game_score;
var enemies;
var hitByEnemy;
var snowSystem;
let fireSystems = [];
var jumping;
var collect;
var fall;
var enemycollision;
var flagraising;
var bgm;

//sound 
function preload(){
soundFormats('mp3','wav');    
jumping =loadSound("assets/jump.wav");
jumping.setVolume(1);
collect =loadSound("assets/collect.wav");
collect.setVolume(1);
fall =loadSound("assets/fall.wav");
fall.setVolume(1);
enemycollision =loadSound("assets/enemycollision.wav");
enemycollision.setVolume(1);
flagraising =loadSound("assets/flag.wav");
flagraising.setVolume(1); 
bgm=loadSound("assets/bgm.mp3");
bgm.setVolume(1); 
}

//Particle 
class Particle{
constructor(x, y, color, size, lifespan, velocity){
this.x = x;
this.y = y;
this.color = color;
this.size = size;
this.lifespan = lifespan;
this.velocity = velocity;
}
update(){
this.x += this.velocity.x;
this.y += this.velocity.y;
this.lifespan -= 3;
} 
draw(){
noStroke();
fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
ellipse(this.x, this.y, this.size);
}
isDead(){
return this.lifespan <= 0;
}
}
class ParticleSystem{
constructor(x, y, type) 
{
this.particles = [];
this.x = x;
this.y = y;
this.type = type;
}
addParticle(){
if (this.type === "fire"){
var p = new Particle(
this.x + random(-10, 10),
this.y + random(-10, 10),
color(random(300, 255), random(50, 10), 0), random(20, 10),
255,
{x: random(-0.5, 0.5), y: random(-1, -2)}
);
this.particles.push(p);
} else if

(this.type === "rain") {
var p = new Particle(
random(width),
0,
color(0, 102, 204), // Blue color for rain
random(15, 5),
255,
{ x: random(-0.5, 2), y: random(1, 2) }  // Slower fall speed (y-axis velocity is reduced even more)
);
this.particles.push(p);
}
}

update() {
for (var j = this.particles.length - 1; j >= 0; j--) {
this.particles[j].update();
if (this.particles[j].isDead()) {
this.particles.splice(j, 1);
}
}
}

draw() {
for (var p of this.particles) {
p.draw();
}
}
}

//Constructor function: Create enemies
function Enemy(x, y, range) {
this.x = x; 
this.y = y; 
this.range = range;
this.currentX = x;  // Initialize currentX
this.inc = 1;       // Initialize movement increment

this.update = function () {
this.currentX += this.inc;

if (this.currentX > this.x + this.range) {
this.inc = -1; 
}
else if (this.currentX < this.x) {
this.inc = 1; 
}
};

//Draw the enemy 
this.draw = function () {
this.update();
// Body
fill(255,51, 51);
ellipse(this.currentX, this.y, 40, 40);
// Eyes
fill(255);
ellipse(this.currentX - 7, this.y - 5, 7, 10);
ellipse(this.currentX + 7, this.y - 5, 7, 10);
// Smile
fill(0);
arc(this.currentX, this.y + 5, 10, 20, 0, PI);
// Horns 
fill(204,0,0);  // RED horns
// Left Horn
triangle(this.currentX - 15, this.y - 5, this.currentX - 24, this.y - 25, this.currentX - 10, this.y - 15);  
// Right Horn
triangle(this.currentX + 15, this.y - 5, this.currentX + 24, this.y - 25, this.currentX + 10, this.y - 15);  
};

//Interaction between the enemy and character 
this.checkContact = function (gameChar_x, gameChar_y) {
var d = dist(gameChar_x, gameChar_y, this.currentX, this.y);
if (d < 30) {
return true;
}
return false;
};
}

function setup() {
createCanvas(1024, 576);
lives=3;
gameOver= false;
fireSystems.push(new ParticleSystem(115, 555, "fire"));
fireSystems.push(new ParticleSystem(425, 555, "fire"));
fireSystems.push(new ParticleSystem(975, 555, "fire"));
snowSystem = new ParticleSystem(0, 0, "rain");
bgm.play();
init();
}

//INITIALISING PLATFORM
class Platform {
constructor(x, y, length) {
this.x = x;
this.y = y;
this.length = length;
this.height = 20; 
this.curve = 5; // Slightly rounded edges 
}
//draw platform
draw() {
fill(50, 50, 50, 150);  
noStroke();
rect(this.x + 5, this.y + 5, this.length, this.height, this.curve); // Slight shadow shift
this.drawPlatfromColor();

// Platform outline 
stroke(0);
strokeWeight(2);
noFill();
rect(this.x, this.y, this.length, this.height, this.curve);
}

drawPlatfromColor() {
//  purple gradient 
for (let g = 0; g < this.height; g++) {
let inter = map(g, 0, this.height, 0, 1);
let c = lerpColor(color(255, 102, 0), color(128, 0, 128), inter); 
stroke(c);
line(this.x, this.y + g, this.x + this.length, this.y + g);
}
}

//Interaction between platform and character 
checkContact(gameChar_x, gameChar_y) {
if (gameChar_x > this.x && gameChar_x < this.x + this.length) {
let d = gameChar_y - this.y;
if (d >= 0 && d <= this.height) {  // allows for a slight overlap before landing
return true;
}
}
return false;
}
}

function init(){
floorPos_y = height * 3/4;
gameChar_x = width / 2;
gameChar_y = floorPos_y;
gameChar_width= 40;

//Enemy 
enemies = [];
enemies.push(createEnemy(200, floorPos_y -10, 100));
enemies.push(createEnemy(670, floorPos_y -10, 100));

//Interactions 
isLeft = false;
isRight = false;
isFalling = false;
isPlummeting = false;
onPlatform=false;
hitByEnemy=false;

//Intializing arrays and variables 
canyons = [
{x: 80, y: floorPos_y, width: 60, depth: 144},
{x: 400, y: floorPos_y, width: 60, depth: 144},
{x: 950, y: floorPos_y, width: 60, depth: 144},
];

clouds = [
{x: 300, y: 40, size: 70,speed:0.7},
{x: 600, y: 35, size: 70,speed:0.6},
{x: 900, y: 35, size: 70,speed:0.7},
{x: 1200, y: 35, size: 70,speed:0.8},
];

mountains = [
{x: 400, y: floorPos_y, width: 200, height: 270},
{x: 800, y: floorPos_y, width: 200, height: 270},
{x: 1200, y: floorPos_y, width: 200, height: 270},
{x: 1600, y: floorPos_y, width: 200, height: 270}
];

trees = [
{x: 150, y: floorPos_y, width: 70, height: 100},
{x: 900, y: floorPos_y, width: 70, height: 100},
{x: 1200, y: floorPos_y, width: 70, height: 100},
{x: 1500, y: floorPos_y, width: 70, height: 100},
{x: 1800, y: floorPos_y, width: 70, height: 100},
];

collectables = [
{ x: 90, y:  floorPos_y-200, size: 43, isFound: false },
{ x: 290, y: floorPos_y-110, size: 43, isFound: false },
{ x: 500, y: floorPos_y-200, size: 43, isFound: false },
{ x: 630, y: floorPos_y-220, size: 43, isFound: false }
];
//Platfroms
platform = [];
platform.push(new Platform(50, floorPos_y - 100, 100));
platform.push(new Platform(450, floorPos_y - 100, 100));
platform.push(new Platform(580, floorPos_y - 130, 100));

// Loop for stars
for (let i = 0; i < 200; i++) 
{
stars.push({
pos_x: random(0,width), // Random x position of star //width*2
pos_y: random(0,height), // Random y position of star //height*0.75
size: random(1,4) // Random size of star
});
}
flagpole ={x: 1200, isReached:false};
//Camera scrolling 
cameraPosX=0;

// Game Score
game_score = 0;

//////////////DRAW and Loop for objects////////////////////////
}
///////////////ARRAY////////////////////////

//Clouds 
function drawClouds() {
for (let c = 0; c < clouds.length; c++) {
noStroke();

// Gradient 
let Color1 = color(255, 255, 255, 200);  
let Color2 = color(200, 200, 255, 150);  

// Fluffy clouds 
fill(Color1);
ellipse(clouds[c].x, clouds[c].y, clouds[c].size, clouds[c].size * 0.8); // Base cloud

// More details 
fill(Color2);
ellipse(clouds[c].x - 20, clouds[c].y - 10, clouds[c].size * 0.8, clouds[c].size * 0.7);
ellipse(clouds[c].x + 20, clouds[c].y - 10, clouds[c].size * 0.8, clouds[c].size * 0.7);
ellipse(clouds[c].x + 15, clouds[c].y - 10, clouds[c].size * 0.6, clouds[c].size * 0.5);
ellipse(clouds[c].x - 15, clouds[c].y - 10, clouds[c].size * 0.6, clouds[c].size * 0.5);
}
}
//Moving clouds 
function animateClouds() {
for (let c = 0; c < clouds.length; c++) {
clouds[c].x += clouds[c].speed; // Move clouds to the right

if (clouds[c].x > width + 50) {
clouds[c].x = -50;
clouds[c].y = random(50, 200); // Randomize cloud's y position 
}
}
}

//mountains 
function drawMountains(){
for (var m=0;m<mountains.length;m++)
{
fill(255,128,0);
triangle(
mountains[m].x , mountains[m].y - mountains[m].height-40,
mountains[m].x - mountains[m].width / 2-30 , mountains[m].y,
mountains[m].x + mountains[m].width / 2 , mountains[m].y);
fill(183,105,28);
triangle(
mountains[m].x + 100 , mountains[m].y - mountains[m].height - 100,
mountains[m].x + 100 - mountains[m].width / 2 , mountains[m].y,
mountains[m].x + 100 + mountains[m].width / 2 , mountains[m].y);
fill(124,71,18);
triangle(
mountains[m].x + 50 , mountains[m].y - mountains[m].height,
mountains[m].x - 30 - mountains[m].width / 4 , mountains[m].y,
mountains[m].x + 50 + mountains[m].width / 4 ,mountains[m].y);
}
}

//trees
function drawTrees() {
for (let i = 0; i < trees.length; i++) {
fill(34, 139, 34); // Green leaves
triangle(
trees[i].x+35, trees[i].y-180, 
trees[i].x - 60, trees[i].y-100,
trees[i].x + 120, trees[i].y-100
);

triangle(
trees[i].x+35, trees[i].y-200, 
trees[i].x - 60,trees[i].y-130, 
trees[i].x + 120, trees[i].y-130
);
triangle(
trees[i].x+35, trees[i].y-220, 
trees[i].x- 60, trees[i].y-160, 
trees[i].x + 120, trees[i].y-160
);

fill(102, 52, 0);//Brown trunk 
rect(trees[i].x + 15,trees[i].y, trees[i].width/1.75, trees[i].height - 200);

}
}
//Canyon
function drawCanyons() {
for (let i = 0; i < canyons.length; i++) {
fill(255,204, 153);
quad(
canyons[i].x,
canyons[i].y,
canyons[i].x + canyons[i].width,
canyons[i].y,
canyons[i].x + canyons[i].width + 30,
canyons[i].y + canyons[i].depth,
canyons[i].x - 20,
canyons[i].y + canyons[i].depth)
;
fill(255,128, 0);;
// circle for the flame
circle(canyons[i].x, canyons[i].y + canyons[i].depth - 15, 30);
circle(canyons[i].x + canyons[i].width, canyons[i].y + canyons[i].depth - 15, 30);
circle(canyons[i].x + canyons[i].width - 30, canyons[i].y + canyons[i].depth - 15, 30);

// Draw the flame inside each circle
drawFire(canyons[i].x, canyons[i].y + canyons[i].depth - 15, 15); 
drawFire(canyons[i].x + canyons[i].width, canyons[i].y + canyons[i].depth - 15, 15);
drawFire(canyons[i].x + canyons[i].width - 30, canyons[i].y + canyons[i].depth - 15, 15);
}
}

function drawFire(x, y, size) {
noStroke();

// offset for the flame triangle
let offset = size * 0.8;

// Draw the first flame triangle
fill(255,128, 0);
triangle(
x - offset-2, y + offset-20,    // Left point
x + offset-15, y + offset-18,    // Right point 
x-8, y - size-10               // Top point 
);

// Draw the middle flame  triangle
fill(255,128, 0);
triangle(
x - offset * 0.7, y + offset * 0.7-15,  // Left point
x + offset * 0.7, y + offset * 0.7-13,  // Right point
x+2, y - size * 0.7-20                // Top point
);

// Draw the last flame triangle
fill(255,128, 0);
triangle(
x + offset * 0.4, y + offset * 0.4-10,  // Left point
x - offset * 0.4+20, y + offset * 0.4-8,  // Right point
x+10, y - size * 0.4-20               // Top point

);
}
/////////////////INTERACTIONS BETWEEN CHRACTER AND CANYONS///////////

function checkIfGamecharIsOverCanyons(){
for (let i = 0; i < canyons.length; i++) {
let canyon = canyons[i];  
let cond1 = gameChar_y == floorPos_y;
let cond2 = gameChar_x - gameChar_width / 2 > canyon.x;
let cond3 = gameChar_x + gameChar_width / 2 < canyon.x + canyon.width;

if (cond1 && cond2 && cond3) {
isPlummeting = true;
}
}
}

////////////ENEMY//////////////
function createEnemy(x,y,range){
return new Enemy(x,y,range);
}

function drawEnemies(){
for (var i=0; i<enemies.length; i++){
enemies[i].draw();
}
}

//INTERACTIONS BETWEEN ENEMY AND CHRACTER 
function checkIfGameCharHitByAnyEnemy() {
for (var i = 0; i < enemies.length; i++) {
var isContact = enemies[i].checkContact(gameChar_x, gameChar_y);
if (isContact) {
lives--;  // Reduce lives
gameChar_x = width / 2; // Reset character position
gameChar_y = floorPos_y;
hitByEnemy = false; // Reset hit flag
enemycollision.play();
if (lives <= 0) {
gameOver = true;  // If no lives left, game over
}
break;  // Stop checking after first hit
}
}
}

//SCORE
function drawGameScore()
{
fill(255);
textSize(30);
text("Score:"+game_score,cameraPosX + 850, 30);
}

//LIVES
function checkIsPlayerDead(){
if(gameChar_y>height){
lives--;
if(lives>0){
init();
}else{
gameOver=true
}
}
}

function drawLifeTokens() {
fill(255, 0, 0); // Red color for hearts
noStroke();

for (var i = 0; i < lives; i++) {
let x = cameraPosX + 50 * i + 840 ;
let y = 50; // Adjusted for better alignment

// Draw two circles for the top part of the heart
ellipse(x, y, 20, 20);
ellipse(x + 10, y, 20, 20);

// Draw a triangle for the bottom part of the heart
triangle(x - 10, y + 3, x+21, y, x + 5, y + 20);
}
}

//GAME OVER 
function drawGameOver(){
fill(255);
textSize(100);
text("Game over",250,height/2-100);

if(lives>0){
text("You win!🏆",300,height/2);
}else{
text("You lose!👎",300,height/2);
}
}

//PLATFORMS
function drawPlatform(){
for(var i=0; i<platform.length;i++){
platform[i].draw();
}
}

function checkIfCharacterIsOnAnyPlatform(){
if(isFalling)
{
var isContact = false;
onPlatform = false;
for (var i=0; i<platform.length; i++){
isContact = platform[i].checkContact(gameChar_x,gameChar_y);
if(isContact){
onPlatform = true;
gameChar_y = platform[i].y; // Stop falling
isFalling = false;
break;
}
}
if(!isContact){
gameChar_y += 3;
}
}
}

//FLAGPOLE
function drawFlagpole() {
// Draw pole
fill(125); // Gray pole
rect(flagpole.x, floorPos_y - 400, 10, 400); 

// Draw base
fill(80);
rect(flagpole.x - 10, floorPos_y, 30, 10); 

// Flag position 
if(flagpole.isReached){
fill(255, 0, 0); // Red flag
triangle(
flagpole.x + 10, floorPos_y - 400,      // Left point (attached to pole)
flagpole.x + 70, floorPos_y - 400 + 20, // Far right point
flagpole.x + 10, floorPos_y - 400 + 40); // Bottom point (attached to pole)
}
else{ 
fill(153, 0, 0); // Red flag
triangle(
flagpole.x + 10, floorPos_y - 50,      // Left point (attached to pole)
flagpole.x + 70, floorPos_y - 50 + 20, // Far right point
flagpole.x + 10, floorPos_y - 50 + 40);  // Bottom point (attached to pole)
}
}

function checkIfGameCharReachFlagpole() {
if (!flagpole.isReached) {  
var d = abs(flagpole.x - gameChar_x);
if (d < 15) {
if (checkAllCollectablesCollected()) { 
flagpole.isReached = true;
gameOver = true;
flagraising.play();
}
}
}
}

function checkAllCollectablesCollected() { 
for (var i = 0; i < collectables.length; i++) {
if (!collectables[i].isFound) { // If any collectable is not found, return false
return false;
}
}
return true; // If the loop completes, all are collected
}

////////////////INTERACTION BETWEEN CHARACTER AND COLLECTABLE//////////

function drawCollectables() {
for (var i = 0; i < collectables.length; i++) { 
if (!collectables[i].isFound) {
push();  
translate(collectables[i].x, collectables[i].y);  
let tilt = sin(tiltAmountCollectable) * 10; 
translate(tilt, 0);  

// Candy (tilted)
fill(255, 255, 0);
circle(0, 0, collectables[i].size - 20);
triangle(0, 0, 30, 20, 30, -20);
triangle(0, 0, -30, 20, -30, -20);

pop();  

tiltAmountCollectable += 0.02;  // tilt angle
}
}
}
function checkIfGameCharInCollectablesRange(){
for (let i = 0; i < collectables.length; i++) {
let d = dist(gameChar_x, gameChar_y, collectables[i].x, collectables[i].y);
if (d < 25 && !collectables[i].isFound) {  
collectables[i].isFound = true;
collect.play();
game_score+=10;
}
if (isFound== false)
{
drawCollectables()
}
}
}

/////BACKGROUND////

function draw() {
cameraPosX = gameChar_x - width / 2;

//background 
background(51, 0, 102);
noStroke();

//loop for stars
noStroke();
fill(255);
for (let s = 0; s < stars.length; s++) {
ellipse(stars[s].pos_x, stars[s].pos_y, stars[s].size, stars[s].size);
}

//ground
fill(32, 32, 32); 
rect(0, floorPos_y, 1024, 144);

push();
translate(-cameraPosX, 0);

// moon
fill(204, 102, 0);
circle(80, 70, 85);

// bat
fill(0);//main body
ellipse(210, 160, 30, 50);
triangle(210, 160, 175, 140, 175, 180);
triangle(210, 160, 245, 140, 245, 180);
fill(255);//eyes for the bat
circle(202, 140, 15, 20);
circle(220, 140, 15, 20);
fill(0);//inner eyes for the bat
circle(202, 140, 9, 12);
circle(220, 140, 9, 12);

//calling for functions
//animate clouds 
animateClouds();
// clouds
drawClouds(); 
//mountains
drawMountains();
//trees
drawTrees();
//canyons()
drawCanyons();
//collectables()
drawCollectables();
//platfroms
drawPlatform();
//Score 
drawGameScore();
//Flagpole
drawFlagpole();
//life tokens
drawLifeTokens();
//Enemy 
drawEnemies();


if(gameOver){
drawGameOver();
gameChar_x= width/2;
gameChar_y= floorPos_y;
return;
}
//////////////////the game character logic//////////////////

if (onPlatform && isLeft){
//walking left code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 28, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 27, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 27, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 27, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 40, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 40, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 8, gameChar_y - 36, 6, 9);
ellipse(gameChar_x + 4, gameChar_y - 36, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 17, 15, 20);
fill(255,153,153);
ellipse(gameChar_x - 3, gameChar_y - 22, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x - 3, gameChar_y - 10, 10, 7); // Tongue

}else if (onPlatform && isRight){

//walking right code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 28, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 27, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 27, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 27, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 40, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 40, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 4, gameChar_y - 36, 6, 9);
ellipse(gameChar_x + 8, gameChar_y - 36, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 17, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 3, gameChar_y - 22, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 3, gameChar_y - 10, 10, 7); // Tongue  

}else if (isLeft && isFalling){

// jumping-left code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 38, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 35, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 37, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 37, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 50, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 50, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 4, gameChar_y - 46, 6, 9);
ellipse(gameChar_x + 8, gameChar_y - 46, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 27, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 3, gameChar_y - 32, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 3, gameChar_y - 20, 10, 7); // Tongue

}else if (isRight && isFalling){

//jumping-right code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 38, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 35, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 37, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 37, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 50, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 50, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 4, gameChar_y - 46, 6, 9);
ellipse(gameChar_x + 8, gameChar_y - 46, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 27, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 3, gameChar_y - 32, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 3, gameChar_y - 20, 10, 7); // Tongue

}else if (isLeft){

//walking left code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 28, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 27, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 27, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 27, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 40, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 40, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 8, gameChar_y - 36, 6, 9);
ellipse(gameChar_x + 4, gameChar_y - 36, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 17, 15, 20);
fill(255,153,153);
ellipse(gameChar_x - 3, gameChar_y - 22, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x - 3, gameChar_y - 10, 10, 7); // Tongue 

}else if (isRight){

//walking right code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 28, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 27, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 27, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 27, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 40, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 40, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 4, gameChar_y - 36, 6, 9);
ellipse(gameChar_x + 8, gameChar_y - 36, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 17, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 3, gameChar_y - 22, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 3, gameChar_y - 10, 10, 7); // Tongue 

}else if (onPlatform){

// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 28, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 26, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 27, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 27, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 40, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 40, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 6, gameChar_y - 36, 6, 9);
ellipse(gameChar_x + 6, gameChar_y - 36, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 17, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 0, gameChar_y - 22, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 0, gameChar_y - 10, 10, 7);

}else if (isFalling || isPlummeting){

//jumping facing forwards code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 38, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 35, 37, 60);
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 50, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 50, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 6, gameChar_y - 46, 6, 9);
ellipse(gameChar_x + 6, gameChar_y - 46, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 25, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 0, gameChar_y - 30, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 0, gameChar_y - 18, 10, 7);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 36, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 36, 6, 10);
}else{

//standing front-facing code
// Body
fill(255,153,153);
rect(gameChar_x - 18, gameChar_y - 28, 36, 28);
ellipse(gameChar_x - 0, gameChar_y - 26, 37, 60);
// Blush cheeks
fill(255, 102, 102);
ellipse(gameChar_x - 12, gameChar_y - 27, 6, 10);
ellipse(gameChar_x + 12, gameChar_y - 27, 6, 10);
// Eyes
fill(255);
ellipse(gameChar_x - 6, gameChar_y - 40, 9, 14);
ellipse(gameChar_x + 6, gameChar_y - 40, 9, 14);
// Inside the eyes
fill(0);
ellipse(gameChar_x - 6, gameChar_y - 36, 6, 9);
ellipse(gameChar_x + 6, gameChar_y - 36, 6, 9);
// Crown
fill(255, 215, 0);
stroke(1);
beginShape();
vertex(gameChar_x - 10, gameChar_y - 66);
vertex(gameChar_x - 5, gameChar_y - 59);
vertex(gameChar_x + 0, gameChar_y - 71);
vertex(gameChar_x + 5, gameChar_y - 59);
vertex(gameChar_x + 10, gameChar_y - 66);
vertex(gameChar_x + 10, gameChar_y - 61);
vertex(gameChar_x + 10, gameChar_y - 51);
vertex(gameChar_x - 10, gameChar_y - 51);
strokeWeight(1);
endShape(CLOSE);
// Mouth
noStroke();
fill(255);
ellipse(gameChar_x + 0, gameChar_y - 17, 15, 20);
fill(255,153,153);
ellipse(gameChar_x + 0, gameChar_y - 22, 15, 15);
fill(255, 0, 0);
ellipse(gameChar_x + 0, gameChar_y - 10, 10, 7);
}

//Fire particles
for (let fireSystem of fireSystems) {
fireSystem.addParticle();
fireSystem.update();
fireSystem.draw();
}

// Draw and update snow system
snowSystem.addParticle();
snowSystem.update();
snowSystem.draw();
pop();

///////////INTERACTION CODE//////////

// Character Movement
if(gameChar_y < floorPos_y)
{
isFalling = true;
}
else
{
isFalling = false;
}
if (isLeft==true)
{
gameChar_x -= 4;
}
else if(isRight==true)
{
gameChar_x += 4;

}

//calling for functions
checkIfGamecharIsOverCanyons();
checkIfGameCharInCollectablesRange();
checkIfGameCharReachFlagpole();
checkIfCharacterIsOnAnyPlatform();
checkIfGameCharHitByAnyEnemy();

//Canyon Collision
for (i = 0; i < canyons.length; i++) {
if (
gameChar_x > canyons[i].x &&
gameChar_x < canyons[i].x + canyons[i].width &&
gameChar_y >= floorPos_y
) {
isPlummeting = true;
}
}
if(hitByEnemy){
fill(0);
textSize(50);
text("Game over!",width/2-100,height/2);
return;
}

if (isPlummeting) {
gameChar_y += 10; //7
fall.play();
checkIsPlayerDead();
return;
}
if (gameChar_y > height) { // When the character falls off the screen
isPlummeting = false;

}



///////////////END OF INTERATION CODE//////////////
}
function keyPressed() 
{
if(gameOver){
return;
}
// Log the key and keyCode for debugging
console.log("keyPressed: " + key);
console.log("keyPressed: " + keyCode);

// Check which key is pressed
if (isPlummeting == false)
{
if (keyCode === 37)
{
console.log("left arrow");
isLeft = true; // Move left
}
else if (keyCode === 39) 
{
console.log("right arrow");
isRight = true; // Move right
}
if (keyCode === 38 && isFalling == false)
{
if(gameChar_y >= floorPos_y || onPlatform)
{
console.log("up arrow");         
gameChar_y -= 100; // Jump
jumping.play();
}
}
}
}
function keyReleased()
{
if(gameOver)
{
return;
}
// Log the key and keyCode for debugging
console.log("keyReleased: " + key);
console.log("keyReleased: " + keyCode);

// Check which key is released
if (keyCode === 37) 
{
console.log("left arrow released");
isLeft = false; // Stop moving left
} 
else if (keyCode === 39) 
{
console.log("right arrow released");
isRight = false; // Stop moving right
}
}

