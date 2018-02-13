
var parent = document.getElementById( 'canvas' );
var parentInfo = parent.getBoundingClientRect();
var height = parentInfo.width;
var width = parentInfo.width;
var d = 0;
var MAX_POINTS = 500;
var camera, scene, renderer, mouse, controls, line, geometry, positions, colors, drawCount, time;
var gradientLength, gradientOffset, gradientOffset2;
var dragging = false;
var fibonacci = [3,5,8,13,21,34,55,89,144,233];
var fibonacciMode = true;
var lines = true;
var singleRandomColorMode = false;
var colorChangeSpeed = 4;
var particles, pointsMaterial;
var offset = -40;
var views = {
  "inside":{z:offset},
  "outside":{z:-offset},
  "isometric":{y:-offset},
  "axial":{x:0, y:0}
}

//DOM buttons
var inside = document.getElementById("inside");
var outside = document.getElementById("outside");
var isometric = document.getElementById("isometric");
var axial = document.getElementById("axial");
var viewButtons = document.getElementsByClassName('tool');


for(var i = 0; i < viewButtons.length; i++) {
    var viewButton = viewButtons[i];
    viewButton.onclick = function(event) {
        removeActive();
        event.preventDefault();
        var target = event.target || event.srcElement;
        target.classList.add("tool-active");
        setView(target.id);
    }
}



init();

function init() {

    camera = new THREE.PerspectiveCamera(110, 1, 0.001, 1000);
    camera.position.z = offset;
    camera.position.x = 0;
    camera.position.y = 0;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x151515, 0.0008);

    // let axes = new THREE.AxisHelper( 100 );
    // scene.add( axes );
    
    let ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    ///////////////////
    // PARTICLES  //
    ///////////////////
    
    ///////////////////
    // CONTROLS  //
    ///////////////////
    controls = new THREE.OrbitControls( camera, parent );
    controls.mouseButtons = {
      ZOOM: THREE.MOUSE.MIDDLE,
      ORBIT: THREE.MOUSE.RIGHT
    }
    controls.update();
    ///////////////////
    // EVENT LISTENERS  //
    ///////////////////
    parent.addEventListener('mousemove', onDocumentMouseMove, false);
    parent.addEventListener('mousedown', function(e){ 
      e.preventDefault();
      newGroup();
      // if (Math.random() >0.2){
      //   newGroup();
      // } else {
      //   lines = false;
      // }
      
      dragging = true; 
    });
    parent.addEventListener('mouseup', function(e) {
      e.preventDefault(); 
      dragging = false;
      lines = true; 
    });
    parent.addEventListener('touchstart', onDocumentTouchStart, false);
    window.addEventListener( 'resize', onWindowResize, false );
  
    ///////////////////
    // RENDERER  //
    ///////////////////
    renderer = new THREE.WebGLRenderer( { antialias: true });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, width );
    
    parent.appendChild( renderer.domElement );
    
    mouse = new THREE.Vector2();
    time = 0;
    animate();
}
function newGroup() {
    geometry = new THREE.BufferGeometry();
    // CREATING POSITIONS AND COLORS ARRAY TO MANIPULATE THEIR VALUES LATER ON
    positions = new Float32Array( MAX_POINTS * 3 ); 
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
 
    colors = new Uint8Array( MAX_POINTS * 3);
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true) );


    // SHOWS ONLY POINTS FROM INDEX 0 UP TO DRAW COUNT (WHICH WILL BE GRADUALLY INCREASED)
    drawCount = 0; 
    geometry.setDrawRange( 0, drawCount );

    var material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      vertexColors: THREE.VertexColors
    });

    line = new THREE.Line( geometry,  material );
    line.frustumCulled = false;
    // SETS PROPERTIES FOR COLOR MODE ETC
    setProperties();
    
    // CLONING AND ADDING LINES TO GROUP
    var group = new THREE.Group();
    let angle = getAngle();
    let segments = 2*Math.PI/angle;
    let direction = Math.random()<0.5 ? -1 : 1;
    for (var s = 0; s < segments; s++) {
      let clone = line.clone();

      if (segments <= 21) {
        let config = {
            ease : Elastic.easeOut,
            delay : 0,
            repeat : 0,
            
        }
        
        config["z"] = s*angle*direction;
        TweenMax.to(
            clone.rotation,
            0.2*s,
            config
        );
      } else {
        clone.rotation.z = s*angle;
      }
      group.add( clone );
      
    }
    scene.add( group );
}


function animate() {
    updateBoundingClient();
    time++;
    controls.update();
    render();
    requestAnimationFrame( animate );
    d += 0.2;
    scene.position.z = -d;
}

function render() {
    renderer.render( scene, camera );
}


function setProperties() {
	gradientLength = MAX_POINTS / colorChangeSpeed;
	gradientOffset = Math.floor(Math.random()*MAX_POINTS);
	gradientOffset2 = Math.floor(Math.random()*MAX_POINTS);
}
function getAngle() {
  if (fibonacciMode) {
    return (Math.PI*2/fibonacci[Math.floor(Math.random()*fibonacci.length)]);
  } else {
    return (Math.PI*2/segmentsNumber);
  }
}

// MAP FUNCTION MAKES SMOOTH TRANSITION FROM ONE COLOR TO THE OTHER
function map(value, maxOne, maxTwo) {
	let dir = Math.pow(-1, Math.floor(value/maxTwo));
  let reducedValue = value-Math.floor(value/maxTwo)*maxTwo;
	let finalValue = maxOne*(reducedValue/maxTwo);
  return dir == -1 ? 255-finalValue:finalValue;
}

function setPosition(x, y, z, index) {
  
	var positionsArr = line.geometry.attributes.position.array;

	positionsArr[ index ] = x;
	positionsArr[ index + 1 ] = y;
	positionsArr[ index + 2 ] = z;
}

function setColor(x, y, z, index) {
  var colorsArr = line.geometry.attributes.color.array;

  if (singleRandomColorMode) {
    colorsArr[ index ] = 255;
    colorsArr[ index +1 ] = 255;
    colorsArr[ index +2 ] = 255;
  } else {
    colorsArr[ index  ] = map(index +gradientOffset, 255, gradientLength);
    colorsArr[ index +1 ] =255-colorsArr[ index  ];
    colorsArr[ index +2 ] =  map(index +gradientOffset2, 255, gradientLength*4);
  }
}

function onWindowResize() {
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    width = parentInfo.width;
    renderer.setSize( width, width );
    render();
}


//EVENTS

function onDocumentTouchStart( event ) {
  event.preventDefault();
  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseDown (event );
}

function onDocumentMouseMove( event ) {
 event.preventDefault();
   if (dragging & event.which == 1){
     mouse.x = ((event.clientX-parentInfo.left)/ renderer.domElement.width ) * 2 - 1;
     mouse.y = - ((event.clientY-parentInfo.top)/ renderer.domElement.height ) * 2 + 1;

     // DEALING WITH PERSPECTIVE - TRANSLATING MOUSE POS ON SCREEN TO TRUE POINT POSITION ON OFFSET PLANE
     var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
     vector.unproject( camera );
     var dir = vector.sub( camera.position ).normalize();
     var distance = - (camera.position.z )/ dir.z;
     var pos = camera.position.clone().add( dir.multiplyScalar( distance ) ); 

     
    if(lines) {
      // SETTING POSITION OF THE NEXT POINT
      setPosition( pos.x, pos.y, camera.position.z-offset+d, drawCount*3);
      setColor( pos.x, pos.y, camera.position.z-offset+d, drawCount*3);
      line.geometry.setDrawRange( 0, drawCount );
      line.geometry.attributes.position.needsUpdate = true;
      line.geometry.attributes.color.needsUpdate = true;

       // MOVING SCENE DOWN, UPDATING DRAW COUNT
      drawCount ++;
    } 
    else {
      pointsMaterial = new THREE.PointsMaterial( { size: 0.3, color: Math.random() * 0xffffff } );
      let particleGeometry = new THREE.Geometry();
      
      let particlePosition = new THREE.Vector3(pos.x, pos.y, camera.position.z-offset+d);
      particleGeometry.vertices.push(particlePosition);
      let star = new THREE.Points(particleGeometry, pointsMaterial);
      scene.add( star );
    } 
   }
}

function updateBoundingClient() {
  parentInfo = parent.getBoundingClientRect();
}



// DOM MANIPULATION
function removeActive() {
  var elems = document.querySelectorAll(".tool");
  [].forEach.call(elems, function(el) {
      el.classList.remove("tool-active");
  });
}
function setView(v){
  let config = {
      ease : Elastic.easeOut,
      delay : 0,
      repeat : 0 
  } 
  for(var propt in views[v]){
    if (propt == "z") {
      offset = views[v][propt];
    }
    console.log(propt + ': ' + views[v][propt]);
    config[propt] = views[v][propt];
    TweenMax.to(
        camera.position,
        1,
        config
    );
  }
}


