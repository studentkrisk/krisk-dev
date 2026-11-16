import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const hobbies = ["programmer", "space pirate", "linguist", "conlanger", "card counter", "crocheter", "earthbounder", "FOSSer", "3d printer", "toki ponist", "wannabe polymath"]

const now = new Date();
const dayOfYear = (Math.floor(now/8.64e7) % 365)/365 * 360;
$("html")[0].style.setProperty('--accent', `hsl(${dayOfYear}deg 86% 47%)`);

function updateGradient(x, y) {
  let content = $("#content")[0];
  content.setAttribute("style", `background: radial-gradient(circle at ${x - content.getBoundingClientRect().left}px ${y - content.getBoundingClientRect().top}px, var(--primary) 0, var(--accent) 2.5vw, var(--text) 5vw); background-clip: text; -webkit-background-clip: text;`);
}

onmousemove = (e) => {
  if (!matchMedia('(pointer:fine)').matches) return
  updateGradient(e.x, e.y)
  onscroll = (e2) => {
    updateGradient(e.x, e.y)
  }
};



onload = () => {
  setInterval(() => {
    let switchTo = ""
    do {
      switchTo = hobbies[Math.floor(Math.random()*hobbies.length)]
    } while (switchTo == $("#switcher").html())
    $("#switcher").html(switchTo)
  }, 1000)

  let exppar = $("exp");
  exppar.children("exs").css("display", "none")
  for (let par of exppar) {
    $(par).on("click", () => {
      if ($(par).children("exs").css("display") == "none") {
        $(par).children("exs").css("display", "inline")
        $(par).children("exs").before("<p id='extra-space'> </p>")
      } else {
        $(par).children("exs").css("display", "none")
        $(par).children("#extra-space").remove()
      }
    })
  }

  const node_ids = [
    {"id": "website", "tags": ["web", "3d"], "desc": "my portfolio (and the website you're currently on!). made with html, jquery, js, and css!", "link": "https://studentkrisk.github.io"},
    {"id": "trail", "tags": ["hackclub"], "desc": "a pcb that creates a simulacrum of the internet to message others, made for hackclub's trail hackathon. i designed the networking! made with micropython.", "link": "https://trail.hackclub.com"},
    {"id": "blot", "tags": ["hackclub", "3d"], "desc": "a 3d renderer for a pen plotter, with shading and hidden surface removal, made for hackclub. made with js!", "link": "https://blot.hackclub.com/editor?src=https://raw.githubusercontent.com/hackclub/blot/main/art/knight-krisk/index.js"},
    {"id": "quicklearn", "tags": ["math"], "desc": "an app to practice mental arithmetic and calculus. made with swift. still in progress!", "link": ""},
    {"id": "lambda", "tags": ["math"], "desc": "a lambda calculus interpreter, made for a programming language jam. made with python!", "link": "https://github.com/studentkrisk/lambda"},
    {"id": "controller instrument", "tags": ["bodge", "music"], "desc": "a small program to turn a xbox or ps3 controller into an instrument. made with python!", "link": "https://github.com/studentkrisk/controller-instrument"},
    {"id": "hack hour clock", "tags": ["electronics", "hackclub"], "desc": "a clock that records how many hours i've programmed for. made with micropython!", "link": "https://github.com/studentkrisk/hackhourclock/tree/main"},
    {"id": "circuits", "tags": ["math"], "desc": "a research project to improve factoring efficiency. made in python!", "link": "https://link.springer.com/chapter/10.1007/978-3-642-03816-7_15"},
    {"id": "domino", "tags": ["bodge", "godot"], "desc": "a small godot project to simulate dominos! made in godot.", "link": ""},
    {"id": "planet sim", "tags": ["bodge", "godot"], "desc": "a small godot project to simulate gravity, and eventually the atmosphere! made in godot. still in progress.", "link": "https://github.com/studentkrisk/planet-sim"},
    {"id": "xkcd guessr", "tags": ["web", "bodge"], "desc": "a quick website that makes geoguessr for xkcd comics. made in svelte!", "link": "https://github.com/studentkrisk/xkcd-guessr"},
    {"id": "desmos3d", "tags": ["3d", "math"], "desc": "a 3d renderer for desmos (before desmos3d came out). made with math!", "link": "https://www.desmos.com/calculator/53p5gdfgqh"}
  ]

  let nodes = [{
    "id": node_ids[0].id,
    "tags": node_ids[0].tags,
    "desc": node_ids[0].desc,
    "link": node_ids[0].link,
    "x": 0,
    "y": 0,
    "z": 0,
    "vx": 0,
    "vy": 0,
    "vz": 0,
    "fx": 0,
    "fy": 0,
    "fz": 0
  }]
  for (let i of node_ids.slice(1)) {
    nodes.push({
      "id": i.id,
      "tags": i.tags,
      "desc": i.desc,
      "link": i.link,
      "x": 0/0,
      "y": 0/0,
      "z": 0/0,
      "vx": 0,
      "vy": 0,
      "vz": 0
    })
  }
  const simulation = d3.forceSimulation(nodes, 3)
  .force("charge", d3.forceManyBody().strength(-5))
  .force("center", d3.forceCenter());

  nodes = simulation.nodes()
  let links = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i+1; j < nodes.length; j++) {
      if (nodes[i].tags.some(r => nodes[j].tags.includes(r))) links.push({"source": i, "target": j})
    }
  }
  simulation.force("link", d3.forceLink(links).distance(5))
  simulation.on("tick", () => {
    nodes = simulation.nodes()
    links = simulation.force("link").links()
  })

  let camera = new THREE.PerspectiveCamera( 70, 1/1, 0.1, 100 );
  camera.position.z = -40;

  let scene = new THREE.Scene();

  let boxes = []
  for (let n of nodes) {
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshBasicMaterial();

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(n.x, n.y, n.z)
    scene.add(mesh);
    boxes.push(mesh)
  }

  let lines = []
  for (let l of links) {
    let geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(l.source.x, l.source.y, l.source.z), new THREE.Vector3(l.target.x, l.target.y, l.target.z)])
    let material = new THREE.LineBasicMaterial({color: 0x0000ff});

    let mesh = new THREE.Line(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh)
    lines.push(mesh)
  }
  

  let renderer = new THREE.WebGLRenderer({antialias: true, canvas: $("#3d-graph").get(0)})
  renderer.setClearColor("#00000", 0)
  renderer.setPixelRatio(window.devicePixelRatio * 1/3);
  renderer.setSize($("#content").width(), $("#content").width())
  renderer.setAnimationLoop(animate);

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.autoRotate = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.maxDistance = 10
  controls.minDistance = 10
  controls.enableDamping = true

  let current = 0

  changeTargetTo()

  function animate() {

    for (let i = 0; i < boxes.length; i++) {
      boxes[i].position.set(nodes[i].x, nodes[i].y, nodes[i].z)
      boxes[i].rotation.x -= 0.005;
      boxes[i].rotation.y -= 0.01;
    }

    for (let i = 0; i < lines.length; i++) {
      let l = links[i]
      lines[i].geometry.setFromPoints([new THREE.Vector3(l.source.x, l.source.y, l.source.z), new THREE.Vector3(l.target.x, l.target.y, l.target.z)])
    }

    controls.update()
    renderer.render(scene, camera);

  }

  function changeTargetTo() {
    let box = boxes[current]
    let counter = 0
    let interval = setInterval(() => {
      controls.target.lerp(box.position, (++counter)/10)
      if (counter >= 10) clearInterval(interval)
    }, 25)
    if (nodes[current].link != "") $("#info-card-header").html(`<a target="_blank" href="${nodes[current].link}">${nodes[current].id}</a>`)
    else $("#info-card-header").html(nodes[current].id)
    $("#info-card-next").html("")
    $("#info-card-text").html(nodes[current].desc)
    for (let n = 0; n < nodes.length; n++) {
      let node = nodes[n]
      if (node != nodes[current] && node.tags.some(r => nodes[current].tags.includes(r))) {
        $("#info-card-next").append(`<div class="info-card-btn">${node.id}</div>`)
        $("#info-card-next").children().last().on("click", (
            () => {
              current = n
              changeTargetTo()
            })) // hacky workaround
      }
    }
    $("#info-card-next").children().first().css("border-top-left-radius", "15px")
    $("#info-card-next").children().first().css("border-top-right-radius", "15px")
    $("#info-card-next").children().last().css("border-bottom-left-radius", "15px")
    $("#info-card-next").children().last().css("border-bottom-right-radius", "15px")
  }
}