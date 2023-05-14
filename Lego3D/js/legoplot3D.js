$( document ).ready(function() {
    // init
    var adjust_x = -5.5;    var adjust_y = -1.5;  var adjust_z = -3.5;
    var renderWidth = 1000; var renderHeight = 720;  // Close to A4 Size (1084.7px x 755.9px)       
    // Mouse detect
    var mouse = new THREE.Vector2(), INTERSECTED;
    mouse.x = -1; mouse.y=1; // init it point to left top
    var raycaster = new THREE.Raycaster();
            
    //var renderWidth = window.innerWidth; var renderHeight = window.innerHeight;
    var scene = new THREE.Scene();

    // Add camera
    //var camera = new THREE.PerspectiveCamera( 50, renderWidth/renderHeight, 0.1, 1000 );// Perspective
    var camera = new THREE.OrthographicCamera( renderWidth / - 110, renderWidth / 110, renderHeight / 110, renderHeight / - 110, 0.1, 1000 ); 
    
    var objects_list = [], plane;
    var textlabel = [];
    var temptextlabel = "";
    
    var keys = [];
    var rotation_flag = 0;
    var showVal = false;
    
    init_keypress(keys);

    // Renderer
    //var renderer = new THREE.WebGLRenderer({antialias:true,  alpha: true});
    var renderer = new THREE.WebGLRenderer({antialias:true,  alpha: true, preserveDrawingBuffer : true});            
    renderer.domElement.id = 'logoplot3D';
    renderer.setSize( renderWidth, renderHeight );
    renderer.setClearColor( 0Xffffff, 0 );
    //document.body.appendChild( renderer.domElement );

    document.getElementById("legoplot_new").appendChild( renderer.domElement );
    
    // Add mouse mouve
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    // Print screen by Key P
    THREEx.Screenshot.bindKey(renderer, { charCode:145 });


    // Add AmbientLight
    scene.add( new THREE.AmbientLight( 0x909090 ) );

    // Add SpotLight
    var SpotLight1 = new THREE.SpotLight( 0xffffff, 0.5 );
        SpotLight1.position.set( -15, 15, 15 );     SpotLight1.castShadow = true;
        scene.add( SpotLight1 );

    var SpotLight2 = new THREE.SpotLight( 0xffffff, 0.4);
        SpotLight2.position.set( 18, 19, -15 );     SpotLight2.castShadow = true;				
        scene.add( SpotLight2 );
              

    // Create a group to pack all box
    group = new THREE.Group();  group.position.set(0, 0, 0);    //scene.add( group );

    // Add Centerpoint box at 0,0,0 as ref point            
    var geometry = new THREE.BoxGeometry( 0.05, 0.05, 0.05 );
    var material = new THREE.MeshLambertMaterial( { color: 0x999999 } );
    var centerpoint = new THREE.Mesh( geometry, material );
    centerpoint.position.set(0, 0, 0);
			
            
    // ADD Each Cubes
        var groupcolor = [ 0x727cc9 , 0x57cffd , 0x7bc657 , 0xfdb667 , 0xf96a52 , 0x9a9792 ];
        for (g = 0; g <= 5; g++) {                 
            for (x = 0; x <= 3; x++) {                     
                for (z = 0; z <= 3; z++) {

                    if (g>=3){
                        half = g-3;
                        var randomheight = (Math.random() * (g-2)) ;
                        var tempcube = makeCube(scene, (half*4)+x, 0, z+4, randomheight, groupcolor[g], adjust_x, adjust_y, adjust_z);
                    }else{
                        var randomheight = (Math.random() * (g+2)) ;                            
                        var tempcube = makeCube(scene, (g*4)+x, 0, z, randomheight, groupcolor[g], adjust_x, adjust_y, adjust_z);
                                                   
                    }
                    
                    objects_list.push( tempcube );
                    
                    // Add label show it's value
                    var txSprite = makeTextSprite( randomheight.toFixed(2) , ((g%3)*4)+x, randomheight+0.3, z + Math.floor(g/3)*4 , 
                          { fontsize: 72, fillColor: {r:255, g:255, b:255, a:0.9}, borderColor: {r:255, g:255, b:255, a:0.1},                           textColor: {r:128, g:128, b:128, a:1}, radius:20, vAlign:"center", hAlign:"center" } ); 
                    group.add( txSprite );
                    txSprite.visible = false;
                    
                    //console.log(tempcube.uuid);
                    textlabel[tempcube.uuid] = txSprite;
                    
                    //console.log("g="+g+" "+x+z);
                    //console.log(tempcube.position.get);
                }
            }
        }
        //console.log( ColorLuminance(groupcolor[5].toString(16), 0) );            
        //console.log( groupcolor[6].toString(16) );            
        //console.log(0xAABBCC);
            
    // Draw Line grid
    //var material_basicline = new THREE.LineBasicMaterial( { color: 0xFF0000 } );
    var material_basicline = new THREE.LineDashedMaterial ( {color: 0x999999, dashSize: 0.15, gapSize: 0.04, opacity: 0.75} );
    var adjustgird_z = -1;
    var plot_height = 5;    var axis_z_length =7.75;
            
        // Draw Horizontal line （height label)
        for (var level = 0; level <= 5; level++) {  
            var geometry = new THREE.Geometry();    var gridArray = geometry.vertices;  
            gridArray.push( new THREE.Vector3( -0.5, level, adjustgird_z ), 
                           new THREE.Vector3( 11.5, level, adjustgird_z ), new THREE.Vector3( 11.5, level, axis_z_length )
            );
            var line = new THREE.Line( geometry, material_basicline ); geometry.computeLineDistances();
            group.add( line );
            
            var txSprite = makeTextSprite( " "+(level)+" ", -0.70, level, -1, 
              { fontsize: 64, fillColor: {r:255, g:255, b:255, a:0.7}, borderColor: {r:255, g:255, b:255, a:0.1}, textColor: {r:119, g:119, b:119, a:1},
               borderThickness:3, radius:20, vAlign:"center", hAlign:"left" } ); 
            group.add( txSprite ); 
        }

        // Draw Vertcial line X axis (1-12)
        for (var level = 0; level <= 11; level++) {  
            var geometry = new THREE.Geometry();    var gridArray = geometry.vertices;
            gridArray.push( new THREE.Vector3( level, plot_height, adjustgird_z ), 
                           new THREE.Vector3( level, 0, adjustgird_z ),  new THREE.Vector3( level, 0, axis_z_length )
            );
            var line = new THREE.Line( geometry, material_basicline );  geometry.computeLineDistances();
            group.add( line );
            
            var txSprite = makeTextSprite( " "+(level+1)+" ", (level), -0.15, 8, 
              { fontsize: 72, fillColor: {r:255, g:255, b:255, a:0.7}, borderColor: {r:255, g:255, b:255, a:0.1}, textColor: {r:203, g:152, b:16, a:0.7}, vAlign:"center", hAlign:"center" } ); 
            group.add( txSprite ); 
            //console.log(level);
        }

        // Draw Vertcial line Z axis (1-8)
        for (var level = 0; level <= 7; level++) {  
            var geometry = new THREE.Geometry();    var gridArray = geometry.vertices;
            gridArray.push( new THREE.Vector3( 11.5, plot_height, level ), 
                           new THREE.Vector3( 11.5, 0, level ), new THREE.Vector3( -0.75, 0, level )
            );
            var line = new THREE.Line( geometry, material_basicline );  geometry.computeLineDistances();
            group.add( line );
            
            var txSprite = makeTextSprite( " "+(level+1)+" ", -0.85, -0.15, level, 
              { fontsize: 72, fillColor: {r:255, g:255, b:255, a:0.7}, borderColor: {r:255, g:255, b:255, a:0.1}, textColor: {r:114, g:124, b:201, a:0.7}, vAlign:"center", hAlign:"center" } ); 
            group.add( txSprite ); 
            //console.log(level);
        }
            
            // Add label (Mutations/Mb)
            var txSprite = makeTextSprite( " Mutations / Mb ", -1.8, 3, -1.2, 
              { fontsize: 81, fillColor: {r:255, g:255, b:255, a:0.7}, borderColor: {r:255, g:255, b:255, a:0.1}, 
               textColor: {r:119, g:119, b:119, a:1}, borderThickness:20, radius:20, vAlign:"center", hAlign:"center", 
               rotation:-1, Sprite_width:1800, Sprite_height:300 } );             
            group.add( txSprite );                      
            
            
            // Pack group with pivot pack to change pivot point
            var pivot = new THREE.Object3D();
            group.position.set(adjust_x, adjust_y, adjust_z);
            //pivot.add( spritey );
            pivot.add( centerpoint );
            pivot.add( group );            
            scene.add( pivot );
            
            // Init Position            
            camera.position.set(0, 9, 19);
            scene.rotation.y = 0.70;            
            
            // Add OrbitControls so that we can pan around with the mouse.
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            // Limit OrbitControls
            controls.minDistance = 12;  controls.maxDistance = 1000; // Zoom in / zoom out            
            controls.maxPolarAngle = Math.PI/2.0;  // Limit rotation don't go underground (Math.PI/2.2)
    
            // Change the camera rotate center point if need
            adjust_camera();            
        
            // mouse move
            function onDocumentMouseMove( event ) {
				event.preventDefault();
				//mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				//mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                
                mouse.x = ( (event.clientX - renderer.domElement.getBoundingClientRect().left )/ renderWidth ) * 2 - 1;
				mouse.y = - ((event.clientY - renderer.domElement.getBoundingClientRect().top ) / renderHeight ) * 2 + 1;
                
                // console.log("event.clientX="+event.clientX+" window.innerWidth="+window.innerWidth + "event.clientY="+event.clientY+" window.innerHeight="+window.innerHeight );
            }
    
			var render = function () {
				requestAnimationFrame( render );                
                
                // find intersections
                // update the picking ray with the camera and mouse position	
                raycaster.setFromCamera( mouse, camera );
                
                // calculate objects intersecting the picking ray
				//var intersects = raycaster.intersectObjects( scene.children );
				var intersects = raycaster.intersectObjects( objects_list );
                
                
				if ( intersects.length > 0 ) {                
					if ( INTERSECTED != intersects[ 0 ].object ) {
						if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                        if (!showVal) temptextlabel.visible = false;
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
						INTERSECTED.material.emissive.setHex( 0x444444 );
                        
                        //console.log(INTERSECTED.uuid);
                        temptextlabel = textlabel[ INTERSECTED.uuid ];
                        if (!showVal) temptextlabel.visible = true;
					}
				} else {   
                    if (!showVal) temptextlabel.visible = false;
					if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );                    
					INTERSECTED = null;
				}
                 //console.log (INTERSECTED);
                
				//cube.rotation.x += 0;     //cube.rotation.y += 0.02;      //cube.rotation.z += 0;                
                //cube1.rotation.y += 0.02; //cube2.rotation.y += 0.02;     //group.rotation.y += 0.01;
                //scene.rotation.y += 0.001;
                scene.rotation.y += rotation_flag;

				renderer.render(scene, camera);
			};

			render();
    
            addGlobalHotkey(function(){                
                rotation_flag = (rotation_flag)? 0 : 0.002 ;
            },[16,82]); // key code + key code + key code
            addGlobalHotkey(function(){
                showVal = (showVal)? false : true ;
                for (var keyid in textlabel) { textlabel[keyid].visible = showVal; };                
            },[16,78]); // key code + key code + key code
});
// -----  --------  -------
// -----  Function  -------
// -----  --------  -------

        

        // Function for create each cube
        function makeCube (scene, x, y, z, height, boxcolor, adjust_x, adjust_y, adjust_z) {
            height = typeof height !== 'undefined' ? height : 0.001;
            boxcolor = typeof boxcolor !== 'undefined' ? boxcolor : 0xcccccc;

            var basicMaterial = new THREE.MeshLambertMaterial( {color: boxcolor} );
            var wireframeMaterial = new THREE.MeshLambertMaterial( {color: boxcolor, wireframe: true, transparent: true} ); 
            // var multiMaterial = [ basicMaterial, wireframeMaterial ];

            var cube = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, height, 0.6, 1, 1, 1), basicMaterial                    
            );

            //cube.position.set(0, 0, 0).add( new THREE.Vector3(x, height/2, z) );
            cube.position.set(x, height/2, z).add( new THREE.Vector3(0, 0, 0) );
            //scene.add(cube);
            //console.log(cube);
            group.add(cube);            

            // add border for each cube
            var darkerbordercolor = ColorLuminance( boxcolor.toString(16) , -0.35 ); // adjust color for border
            var cubeborder = new THREE.EdgesHelper( cube, darkerbordercolor );                
            cubeborder.matrixAutoUpdate = true;
            cubeborder.position.set(cube.position.x+adjust_x, cube.position.y+adjust_y, cube.position.z+adjust_z);       
            scene.add(cubeborder);

            return cube;
        };

        // Function for adjust the brightness for cube border color
        function ColorLuminance(hex, lum) {
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            lum = lum || 0;
            // convert to decimal and change luminosity                
            var rgb = "", c, i; //var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i*2,2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00"+c).substr(c.length);
            }
            return parseInt (rgb,16);  // Return in 0x000000 hex value
        }

        // fucntion for create label
        function makeTextSprite( message, x, y, z, parameters ) { 
             if ( parameters === undefined ) parameters = {}; 

             var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Arial"; 
             var fontsize = parameters.hasOwnProperty("fontsize") ?  parameters["fontsize"] : 18; 

             var borderThickness = parameters.hasOwnProperty("borderThickness") ?  parameters["borderThickness"] : 3; 
             var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:255, g:255, b:255, a:0.3 }; 

             var fillColor = parameters.hasOwnProperty("fillColor") ? parameters["fillColor"] : undefined; 
             var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r:30, g:30, b:30, a:1.0 }; 

             var radius = parameters.hasOwnProperty("radius") ? parameters["radius"] : 3; 
             var vAlign = parameters.hasOwnProperty("vAlign") ? parameters["vAlign"] : "center"; 
             var hAlign = parameters.hasOwnProperty("hAlign") ? parameters["hAlign"] : "center"; 
             var rotation = parameters.hasOwnProperty("rotation") ? parameters["rotation"] : 0; 
        
            var Sprite_width = parameters.hasOwnProperty("Sprite_width") ? parameters["Sprite_width"] : 600;  
            var Sprite_height = parameters.hasOwnProperty("Sprite_height") ? parameters["Sprite_height"] : Sprite_width / 2; 

             var canvas = document.createElement('canvas'); 
             var context = canvas.getContext('2d');             
             var DESCENDER_ADJUST = 1.28; 
            
            
             // set a large-enough fixed-size canvas        
                if (rotation == -1){//rotation
                    canvas.width = Sprite_height; 
                    canvas.height = Sprite_width;             
                }else{
                    // default
                    canvas.width = Sprite_width; 
                    canvas.height= Sprite_height;            
                }

             context.font = fontsize + "px " + fontface; 
             context.textBaseline = "alphabetic"; 
             context.textAlign = "left";
            
            //rotation
            if (rotation == -1){
                //console.log("Rcanvas.width="+canvas.width+" Rcanvas.height="+canvas.height);
                context.translate(canvas.width/2, canvas.height/2);
                context.rotate(-90 * Math.PI / 180);
                context.translate(-canvas.width/2, -canvas.height/2);
                //context.rotate( -90 * Math.PI / 180 ); //1.58 
                //context.translate( canvas.height/2 * -1, canvas.width * -1.5); // X , Y of it  before roate            
            }            

             // get size data (height depends only on font size) 
             var metrics = context.measureText( message ); 
             var textWidth = metrics.width; 

             /* 
             // need to ensure that our canvas is always large enough 
             // to support the borders and justification, if any 
             // Note that this will fail for vertical text (e.g. Japanese)
             // The other problem with this approach is that the size of the canvas 
             // varies with the length of the text, so 72-point text is different 
             // sizes for different text strings.  There are ways around this 
             // by dynamically adjust the sprite scale etc. but not in this demo...
             var larger = textWidth > fontsize ? textWidth : fontsize;
             canvas.width = larger * 4; 
             canvas.height = larger * 2; 
             // need to re-fetch and refresh the context after resizing the canvas 
             context = canvas.getContext('2d'); 
             context.font = fontsize + "px " + fontface; 
             context.textBaseline = "alphabetic"; 
             context.textAlign = "left"; 
              metrics = context.measureText( message ); 
             textWidth = metrics.width; 

              console.log("canvas: " + canvas.width + ", " + canvas.height + ", texW: " + textWidth);
             */ 

             // find the center of the canvas and the half of the font width and height 
             // we do it this way because the sprite's position is the CENTER of the sprite 
             var cx = canvas.width / 2; 
             var cy = canvas.height / 2; 
             var tx = textWidth/ 2.0; 
             var ty = fontsize / 2.0; 

             // then adjust for the justification 
             if ( vAlign == "bottom") 
                 ty = 0; 
             else if (vAlign == "top") 
                 ty = fontsize; 

             if (hAlign == "left") 
                 tx = textWidth; 
             else if (hAlign == "right") 
                 tx = 0; 

             // the DESCENDER_ADJUST is extra height factor for text below baseline: g,j,p,q. since we don't know the true bbox 
             roundRect(context, cx - tx , cy + ty + 0.28 * fontsize,  
                     textWidth, fontsize * DESCENDER_ADJUST, radius, borderThickness, borderColor, fillColor); 

             // text color.  Note that we have to do this AFTER the round-rect as it also uses the "fillstyle" of the canvas 
             context.fillStyle = getCanvasColor(textColor); 

             context.fillText( message, cx - tx, cy + ty); 

             // draw some visual references - debug only 
             //drawCrossHairs( context, cx, cy );     
             // outlineCanvas(context, canvas); 
             //addSphere(x,y,z); 

             // canvas contents will be used for a texture 
             var texture = new THREE.Texture(canvas) 
             texture.needsUpdate = true; 

             var spriteMaterial = new THREE.SpriteMaterial( { map: texture } ); 
             var sprite = new THREE.Sprite( spriteMaterial ); 

             // the sprite itself is square: 1.0 by 1.0 
             // Note also that the size of the scale factors controls the actual size of the text-label          
             if (rotation == -1) sprite.scale.set(1, canvas.height/canvas.width, 1);
                else sprite.scale.set(canvas.width/canvas.height, 1, 1); /* sprite.scale.set(4,2,1);  */

             // set the sprite's position.  Note that this position is in the CENTER of the sprite 
             sprite.position.set(x, y, z); 

             return sprite;     
        } 

        function getCanvasColor ( color ) { 
            return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")"; 
        } 

        function drawCrossHairs ( context, cx, cy ) {
             context.strokeStyle = "rgba(0,255,0,1)"; 
             context.lineWidth = 2; 
             context.beginPath();  
             context.moveTo(cx-150,cy); 
             context.lineTo(cx+150,cy); 
             context.stroke(); 

             context.strokeStyle = "rgba(0,255,0,1)"; 
             context.lineWidth = 2; 
             context.beginPath();  
             context.moveTo(cx,cy-150); 
             context.lineTo(cx,cy+150); 
             context.stroke(); 
             context.strokeStyle = "rgba(0,255,0,1)"; 
             context.lineWidth = 2; 
             context.beginPath();  
             context.moveTo(cx-150,cy); 
             context.lineTo(cx+150,cy); 
             context.stroke(); 

             context.strokeStyle = "rgba(0,255,0,1)"; 
             context.lineWidth = 2; 
             context.beginPath();  
             context.moveTo(cx,cy-150); 
             context.lineTo(cx,cy+150); 
             context.stroke(); 
         } 

        function addSphere( x, y, z, size ) { 
             if (size == undefined) 
                 size = 0.01; 

             var sphere = new THREE.Mesh( new THREE.SphereGeometry(size, 32, 32), new THREE.MeshNormalMaterial()); 
             sphere.position.set(x, y, z); 
             group.add(sphere); 
         } 

        function roundRect(ctx, x, y, w, h, r, borderThickness, borderColor, fillColor) { 
            // no point in drawing it if it isn't going to be rendered 
            if (fillColor == undefined && borderColor == undefined)  
             return; 

            x -= borderThickness + r; 
            y += borderThickness + r; 
            w += borderThickness * 2 + r * 2; 
            h += borderThickness * 2 + r * 2; 

            ctx.beginPath(); 
            ctx.moveTo(x+r, y); 
            ctx.lineTo(x+w-r, y); 
            ctx.quadraticCurveTo(x+w, y, x+w, y-r); 
            ctx.lineTo(x+w, y-h+r); 
            ctx.quadraticCurveTo(x+w, y-h, x+w-r, y-h); 
            ctx.lineTo(x+r, y-h); 
            ctx.quadraticCurveTo(x, y-h, x, y-h+r); 
            ctx.lineTo(x, y-r); 
            ctx.quadraticCurveTo(x, y, x+r, y); 
            ctx.closePath(); 

            ctx.lineWidth = borderThickness; 

            // background color 
            // border color 

            // if the fill color is defined, then fill it 
            if (fillColor != undefined) { 
                ctx.fillStyle = getCanvasColor(fillColor); 
                ctx.fill(); 
            } 

            if (borderThickness > 0 && borderColor != undefined) { 
                ctx.strokeStyle = getCanvasColor(borderColor); 
                ctx.stroke(); 
            } 
        } 

        function adjust_camera () {
            distance = new THREE.Vector3(-0.5, 1, 0); 
            controls.object.position.add( distance ); 
            controls.center.add( distance );
            //console.log("adjust_camera");
        }
        function reset_scene () {
            controls.reset();
            adjust_camera();        
        }

        function init_keypress(keys){
            window.executeHotkeyTest = function(callback,keyValues){
                if(typeof callback !== "function")
                    throw new TypeError("Expected callback as first argument");
                if(typeof keyValues !== "object" && (!Array.isArray || Array.isArray(keyValues)))
                    throw new TypeError("Expected array as second argument");

                var allKeysValid = true;

                for(var i = 0; i < keyValues.length; ++i)
                    allKeysValid = allKeysValid && keys[keyValues[i]];

                if(allKeysValid)
                    callback();
            };

            window.addGlobalHotkey = function(callback,keyValues){
                if(typeof keyValues === "number")
                    keyValues = [keyValues];

                var fnc = function(cb,val){
                    return function(e){
                        keys[e.keyCode] = true;
                        executeHotkeyTest(cb,val);
                    };        
                }(callback,keyValues);
                window.addEventListener('keydown',fnc);
                return fnc;
            };

            window.addEventListener('keyup',function(e){
                keys[e.keyCode] = false;
            });
        }
        
            

