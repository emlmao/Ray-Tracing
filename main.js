import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

// Scene setup
const scene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance',
  samples: 4 });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-3, 8, 18);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Add scene
const loader = new RGBELoader();
loader.load(
  "https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  }
);

// Add floor
const floorGeometry = new THREE.PlaneGeometry(25, 20);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // floor color
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat
floorMesh.receiveShadow = true; // Enable shadows
scene.add(floorMesh);

const topGeometry = new THREE.PlaneGeometry(25, 20);
const top = new THREE.Mesh( topGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
top.position.y = 10;
top.receiveShadow = true;
top.rotateX( Math.PI / 2 );
scene.add( top );

// Add directional light
const light = new THREE.DirectionalLight(0xffffff, 1, 100);
light.position.set(2, 10, 7);
light.target.position.set(0, 0, 0);
light.castShadow = true; 
light.shadow.mapSize.width = 2048; // Shadow resolution
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5; // define clipping planes of shadow cameras
light.shadow.camera.far = 20;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;
light.shadow.bias = -0.001;
scene.add(light);
scene.add(light.target); 

// First Cylinder
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 4, 32); // Top radius: 1, Bottom radius: 1, Height: 2, Segments: 32
const cylinderMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x000000,
  metalness: 1.0,
  roughness: 0.2,
  envMap: scene.environment,
  envMapIntensity: 1.0
});
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.set(-2, 2, 0); // Position it above the floor
cylinder.castShadow = true;
scene.add(cylinder);


//https://github.com/mrdoob/three.js/tree/master/examples/textures/planets
const textureLoader2 = new THREE.TextureLoader();
const earthD = textureLoader2.load('images/earth_day_4096.jpg');
const earthB = textureLoader2.load('images/earth_bump_roughness_clouds_4096.jpg');
const earthS = textureLoader2.load('images/earth_specular_2048.jpg');
const earthN = textureLoader2.load('images/earth_normal_2048.jpg');
// Second Sphere
const sphereGeometry2 = new THREE.SphereGeometry(1, 32, 32); // Same geometry, can reuse if needed
const sphereMaterial2 = new THREE.MeshStandardMaterial({
  metalness: 0.4, // less metallic
  roughness: 0.2, // Rougher surface
  map: earthD,
  bumpMap: earthB,
  bumpScale: 0.3,
  normalMap: earthN,
  bumpScale: 0.6, 
  specularMap: earthS,
  emissive: 0x111111,
  emissiveIntensity: 0.4,
  envMap: scene.environment,
  envMapIntensity: 1.0,
});
const sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
sphere2.position.set(7, 1, 7);
sphere2.castShadow = true;
scene.add(sphere2);

// glass/transparent sphere
const sphereGeometry3 = new THREE.SphereGeometry(1, 32, 32); // Same geometry, can reuse if needed
const sphereMaterial3 = new THREE.MeshPhysicalMaterial({
  transmission: 1.0,
  metalness: 0.0, // no metallic
  roughness: 0.0, // no roughness
  ior: 2.0,
  clearcoat: 1.0,
  thickness: 10.0
});
const sphere3 = new THREE.Mesh(sphereGeometry3, sphereMaterial3);
sphere3.position.set(-5, 3, -4); // Different position
sphere3.scale.set(2,2,2)
sphere3.castShadow = true;
sphere3.receiveShadow = false;
scene.add(sphere3);

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_mirror.html
const geometry = new THREE.PlaneGeometry(25, 10);
const verticalMirror = new Reflector( geometry, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: 0xc1cbcb
});
verticalMirror.position.set(0, 5, -10);
scene.add(verticalMirror);

// rock cylinder
// texture maps downloaded from Poly Haven (https://polyhaven.com/a/rustic_stone_wall_02)
const textureLoader = new THREE.TextureLoader();
const rockDiffuse = textureLoader.load(
  "images/rustic_stone_wall_02_diff_4k.jpg"
);
const rockNormal = textureLoader.load(
  "images/rustic_stone_wall_02_nor_gl_4k.jpg"
);
const rockRoughness = textureLoader.load(
  "images/rustic_stone_wall_02_rough_4k.png"
);
const rockDisplacement = textureLoader.load(
  "images/rustic_stone_wall_02_disp_4k.png"
);
const rockAO = textureLoader.load("images/rustic_stone_wall_02_ao_4k.png");

const rockMaterial = new THREE.MeshPhysicalMaterial({
  map: rockDiffuse,
  normalMap: rockNormal,
  normalScale: new THREE.Vector2(1.0, 2.0),
  roughnessMap: rockRoughness,
  displacementMap: rockDisplacement,
  aoMap: rockAO,
  aoMapIntensity: 1.0,
  displacementScale: 0.4,
  displacementBias: -0.33,
  roughness: 1.0,
  metalness: 0.0,
});

let rockGeometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 64, 64);
const rockCylinder = new THREE.Mesh(rockGeometry, rockMaterial);
rockCylinder.position.set(4, 1.5, 4);
rockCylinder.castShadow = true;
rockCylinder.receiveShadow = true;
scene.add(rockCylinder);

// const textureLoader = new THREE.TextureLoader();
//maps are downloaded from Poly Haven (https://polyhaven.com/a/wood_planks)
const woodDiffuse = textureLoader.load("images/wood_planks_diff_4k.png");
const woodNormal = textureLoader.load("images/wood_planks_nor_gl_4k.png");
const woodRoughness = textureLoader.load("images/wood_plants_rough_4k.jpg");
const woodDisplacement = textureLoader.load("images/wood_planks_disp_4k.png");
const woodAO = textureLoader.load("images/wood_planks_ao_4k.png");

const woodMaterial = new THREE.MeshStandardMaterial({
  map: woodDiffuse,
  normalMap: woodNormal,
  roughnessMap: woodRoughness,
  displacementMap: woodDisplacement,
  displacementScale: 0.0,
  aoMap: woodAO,
  roughness: 10.0,
  metalness: 0.0,
});

const woodGeometry = new THREE.BoxGeometry(3, 3, 3);
const woodCube = new THREE.Mesh(woodGeometry, woodMaterial);
woodCube.position.set(8, 1.5, 1);
woodCube.rotation.y = 10;
woodCube.castShadow = true;
scene.add(woodCube);
woodGeometry.attributes.uv2 = woodGeometry.attributes.uv; // for AO maps

// rubber cone
const rubberDiffuse = textureLoader.load("images/rubberized_track_diff_4k.png");
const rubberNormal = textureLoader.load(
  "images/rubberized_track_nor_gl_4k.png"
);
const rubberRoughness = textureLoader.load(
  "images/rubberized_track_rough_4k.png"
);
const rubberDisplacement = textureLoader.load(
  "images/rubberized_track_diff_4k.png"
);
const rubberAO = textureLoader.load("images/rubberized_track_ao_4k.png");

const rubberMaterial = new THREE.MeshStandardMaterial({
  map: rubberDiffuse,
  normalMap: rubberNormal,
  roughnessMap: rubberRoughness,
  displacementMap: rubberDisplacement,
  aoMap: rubberAO,
  displacementScale: 0.005, // small displacement value so that there
  displacementBias: -0.002,
  roughness: 0.8, // Matte appearance
  metalness: 0.1, // Low metalness for rubber
});
let coneGeometry = new THREE.ConeGeometry(1, 2, 64, 64);
const rubberCone = new THREE.Mesh(coneGeometry, rubberMaterial);
rubberCone.position.set(1, 1, 2);
rubberCone.castShadow = true;
rubberCone.receiveShadow = true;
scene.add(rubberCone);

// fence
const fenceTexture1 = new THREE.TextureLoader().load("images/woodtexture.webp"); // Load wood texture
const fenceMaterial1 = new THREE.MeshStandardMaterial({
  map: fenceTexture1,
  roughness: 1.6,
  metalness: 1.0,
});
const fenceCube1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 10), fenceMaterial1); // Cube of size 2x2x2
fenceCube1.position.set(-4, 0.25, 5); // Position it in the scene
fenceCube1.rotation.y = Math.PI;
fenceCube1.castShadow = true;
scene.add(fenceCube1);

const fenceTexture2 = new THREE.TextureLoader().load("images/woodtexture.webp"); // Load wood texture
const fenceMaterial2 = new THREE.MeshStandardMaterial({
  map: fenceTexture2,
  roughness: 1.6,
  metalness: 1.0,
});
const fenceCube2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 9.3), fenceMaterial2); // Cube of size 2x2x2
fenceCube2.position.set(-7.8, 0.25, 1); // Position it in the scene
fenceCube2.rotation.y = 300;
fenceCube2.castShadow = true;
scene.add(fenceCube2);


const modelsambientLight = new THREE.AmbientLight(0xffffff, 1); 
scene.add(modelsambientLight);

//https://www.youtube.com/watch?v=q2dhg1e8kpw
const mtlloader = new MTLLoader();
mtlloader.load("spot_triangulated.mtl", function(materials){
  materials.preload();
  const objloader = new OBJLoader();
  objloader.setMaterials(materials);
  objloader.load("spot_triangulated.obj", function(mesh){
    mesh.position.set(-6, 1.1, 7);
    mesh.rotation.y = 4*Math.PI/3;
    mesh.scale.set(1.5,1.5,1.5);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(mesh);
  });

});

// metallic prism cow
const mtlloader2 = new MTLLoader();
mtlloader2.load("spot_triangulated.mtl", function(materials){
  materials.preload();
  const objloader = new OBJLoader();
  objloader.setMaterials(materials);
  objloader.load("spot_triangulated.obj", function(mesh){
    mesh.position.set(-10, 1.1, 7);
    mesh.rotation.y = 2*Math.PI/3;
    mesh.scale.set(1.5,1.5,1.5);
    mesh.castShadow = true;
    mesh.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          roughness: 0.0,
          opacity: 0.7,
          metalness: 1.0,
          refractionRatio: 0.40,
          clearcoat: 1.0,
          thickness: 5.0,
          ior: 1.2,
          clearcoatRoughness: 0.0,
          emissive: 0x111111,
          emissiveIntensity: 0.4,
        });
      }
    });
    scene.add(mesh);
  });

});

const mtlloader3 = new MTLLoader();
mtlloader3.load("giraffe.mtl", function(materials){
  materials.preload();
  const objloader = new OBJLoader();
  objloader.setMaterials(materials);
  objloader.load("giraffe.obj", function(mesh){
    mesh.position.set(-7, 1, 4);
    mesh.rotation.y= 6*Math.PI/4;
    mesh.scale.set(2,2,2);
    mesh.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(mesh);
  });

});

// Metallic torus
const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100); 

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
scene.add(cubeCamera);

const metalMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa, 
  metalness: 1.0, 
  roughness: 0.1,
  envMap: cubeRenderTarget.texture, 
});

const metalTorus = new THREE.Mesh(torusGeometry, metalMaterial);
metalTorus.position.set(4, 3, -2); 
metalTorus.rotation.y = Math.PI;
metalTorus.scale.set(2, 2, 2);
metalTorus.castShadow = true;
scene.add(metalTorus);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  //https://github.com/mrdoob/three.js/blob/master/examples/webgl_mirror.html
  const time = Date.now() * 0.01;
  sphere3.position.set(-5,Math.abs( Math.cos( time * 0.15 ) ) * 5+2,-4);
  sphere2.rotation.y += 0.1;
  controls.update();
  renderer.render(scene, camera);

  // torus
  metalTorus.visible = false;
  cubeCamera.position.copy(metalTorus.position); 
  cubeCamera.update(renderer, scene);
  metalTorus.visible = true; 
}
animate();
