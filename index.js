const panels = new Map();
const panelsArr = [];
let scene;
let creativesData = [];

async function createPanel(creative, position, rotation, rowEntity) {
    const { videoEntity, id } = createVideoEntity(creative, position, rotation, rowEntity);

    // Add the asset to the a-video
    videoEntity.setAttribute('src', creative.url);

    // Start playback
    // await videoEntity.play();
    return { videoEntity, id }
}

let rotation = 0
function rotatePanels() {
    panelsArr.forEach((row, rowIndex) => {
        const rowEntity = row.rowEntity;
        const isOdd = rowIndex % 2 !== 0;
        // const isThird = rowIndex % 3 === 0;

        // if (!isThird) { // keep every third row stationary
            const newRotation = isOdd ? rotation * -1 : rotation
            rowEntity.setAttribute('rotation', `0 ${newRotation} 0`);
            rotation += 0.005
        // }
    });
}

function createVideoEntity(creative, position, rotation, rowEntity) {
    const videoEntity = document.createElement('a-video');    
    const videoEntityId = `video-entity-${creative.id}`
    videoEntity.setAttribute('id', videoEntityId);
    videoEntity.setAttribute('position', position.join(" "));
    videoEntity.setAttribute('rotation', rotation.join(" "));
    videoEntity.setAttribute('width', '4');
    videoEntity.setAttribute('height', '2');
    videoEntity.setAttribute('animation', 'property: components.material.material.opacity; from: 0; to: 1; dur: 750; easing: easeOutQuad');

    rowEntity.appendChild(videoEntity);

    videoEntity.addEventListener('click', evt => {
        console.log('click', videoEntityId)
        const id = videoEntityId.substring(13);
        const creative = creativesData.find(x => x.id === id)
        if (creative) {
            document.getElementById('title').textContent = creative.title;
        }
    });

    return { videoEntity, id: videoEntityId };
}

// Type: 'image' | 'video'
async function fetchCreatives(type) {
    return await fetch(`${type}_creatives.json`).then(res => res.json());
}

function getItemRotation(hAngle, vAngle) {
    const x = -vAngle;
    const y = hAngle;
    const z = 0;
    return [x, y, z];
}

function position(radius, angle_h, angle_v) {
    rads_h = angle_h * Math.PI / 180.0
    rads_v = angle_v * Math.PI / 180.0
    x = Math.sin(rads_h)
    z = Math.cos(rads_h)
    y = Math.sin(rads_v)
	h_projection = Math.cos(rads_v)
    module = Math.sqrt(x*x + y*y + z*z)
    resultX = x * radius * h_projection / module
    resultY = y * radius
    resultZ = z * radius * h_projection / module

    return [resultX, resultY, resultZ]
}


// Index goes from 0 to nItems - 1
function getHAngle(index, nItems) {
    return (360 / nItems) * index;
}

async function start() {
    scene = document.getElementById('my-scene');

    // Fetch creatives
    creativesData = await fetchCreatives('video');

    addPanels(creativesData);
    // const randomStartIndex = Math.floor(Math.random() * (creativesData.length - nItems))

    setInterval(() => {
        rotatePanels()
    }, 16.67); // 60 fps
}

function addPanels(creativesData) {
    const nItemsBase = 16;
    const rows = Array.from(Array(8).keys());
    const circumference = 15;
    let panelIndex = 0;

    rows.forEach(rowIndex => {
        const nItems = Math.floor(nItemsBase - (rowIndex + (panelIndex / Math.PI / 9)));
        const rowEntity = document.createElement('a-entity');
        rowEntity.setAttribute('id', `row-entity-${rowIndex}`);
        rowEntity.setAttribute('rotation', '0 45 0');
        scene.appendChild(rowEntity);
        panelsArr.push({ rowEntity, panelIds: new Array(nItems)});

        creativesData
            .slice(panelIndex, panelIndex + nItems)
            .forEach(async (creative, index) => {
                const hAngle = getHAngle(index, nItems);
                const vAngle = circumference * (rowIndex / (Math.PI / 2));
                const { videoEntity, id } = await createPanel(
                    creative, 
                    position(circumference, hAngle, vAngle), 
                    getItemRotation(hAngle, vAngle),
                    rowEntity);
                panels.set(id, videoEntity);
                panelsArr[rowIndex].panelIds[index] = id;
            });
        panelIndex += nItems;
    })
    console.log(panelsArr);
}

start();