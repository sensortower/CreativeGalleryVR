const panels = new Map();
let panelsArr = [];
let scene;
let creativesData = [];
let rotationPaused = false;
let openedEntity;
let rotationInterval;
let startComplete = false;

async function createPanel(creative, position, rotation, rowEntity) {
    const res = await fetch(creative.url);
    const blob = await res.blob();
    const videoBlobUrl = URL.createObjectURL(blob);
    const videoDOMElement = createVideoDOMElement(creative, videoBlobUrl);
    const { videoEntity, id } = createVideoEntity(creative, position, rotation, rowEntity);

    // Add the asset to the a-video
    videoEntity.setAttribute('src', `#${videoDOMElement.id}`);

    videoDOMElement.muted = true;
    await videoDOMElement.play();
    await videoDOMElement.pause();
    return { videoEntity, id }
}

function createVideoDOMElement(creative, videoBlobUrl) {
    const videoDOMElement = document.createElement('video');
    const videoDOMElementId = `dynamic-video-${creative.id}`
    videoDOMElement.setAttribute('id', videoDOMElementId);
    videoDOMElement.setAttribute('src', videoBlobUrl);
    videoDOMElement.setAttribute('style', 'display: none;')
    videoDOMElement.setAttribute('loop', 'true')
    // Append the new video to the a-assets, where a-assets id="assets-id"
    document.getElementById('scene-assets').appendChild(videoDOMElement);

    return videoDOMElement;
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
            rotation += 0.003
        // }
    });
}

function getVideoDOMElement(videoEntity) {
    const id = videoEntity.id.substring(13);
    return document.getElementById(`dynamic-video-${id}`);
}

function playVideo(videoEntity) {
    getVideoDOMElement(videoEntity).play();
}

function pauseVideo(videoEntity) {
    getVideoDOMElement(videoEntity).pause();
}

function muteVideo(videoEntity) {
    getVideoDOMElement(videoEntity).muted = true;
}

function unmuteVideo(videoEntity) {
    getVideoDOMElement(videoEntity).muted = false;
}

function emitEvent(videoEntity, event) {
    console.log(event);
    videoEntity.emit(event, null, false);
}

function createVideoEntity(creative, position, rotation, rowEntity) {
    const videoEntity = document.createElement('a-video');    
    const videoEntityId = `video-entity-${creative.id}`
    videoEntity.setAttribute('id', videoEntityId);
    videoEntity.setAttribute('position', position.join(" "));
    videoEntity.setAttribute('rotation', rotation.join(" "));
    videoEntity.setAttribute('width', '1.8');
    videoEntity.setAttribute('height', '3.2');
    videoEntity.setAttribute('animation', 'property: components.material.material.opacity; from: 0; to: 1; dur: 750; easing: easeOutQuad');
    videoEntity.setAttribute('animation__mouseenter', 'property: scale; to: 1.25 1.25 1.25; dur: 350; startEvents: highlightEntity');
    videoEntity.setAttribute('animation__mouseleave', 'property: scale; to: 1 1 1; dur: 350; startEvents: unhighlightEntity');

    rowEntity.appendChild(videoEntity);

    videoEntity.addEventListener('mouseenter', onPanelMouseEnter);

    videoEntity.addEventListener('mouseleave', onPanelMouseLeave);

    videoEntity.addEventListener('click', onPanelClick);

    return { videoEntity, id: videoEntityId };
}

function onPanelMouseEnter({ srcElement }) {
    if (!openedEntity) {
        highlightEntity(srcElement);
    }
}

function onPanelMouseLeave({ srcElement }) {
    if (openedEntity && openedEntity === srcElement) {
        closeEntity(srcElement);
    } else {
        unhighlightEntity(srcElement);
    }
}

function onPanelClick({ srcElement }) {
    if (openedEntity && openedEntity === srcElement) {
        closeEntity(videoEntity);
        return;
    }
    openEntity(srcElement);
}

function highlightEntity(videoEntity) {
    emitEvent(videoEntity, 'highlightEntity');
    playVideo(videoEntity);
}

function unhighlightEntity(videoEntity) {
    emitEvent(videoEntity, 'unhighlightEntity');
    pauseVideo(videoEntity);
}

function openEntity(videoEntity) {
    rotationPaused = !rotationPaused;
    openedEntity = videoEntity;

    const observerPosition = new THREE.Vector3(0, 1, 0);
    const newPositionVector = getCloserPosition(videoEntity.object3D.position, observerPosition, 3.5);
    const currentPosition = videoEntity.getAttribute('position');
    const currentPositionString = `${currentPosition.x} ${currentPosition.y} ${currentPosition.z}`
    videoEntity.setAttribute('animation__close-entity', `property: position; to: ${currentPositionString}; dur: 150; startEvents: closeEntity`);
    videoEntity.setAttribute('animation__open-entity', `property: position; to: ${newPositionVector.join(' ')}; dur: 150; startEvents: openEntity`);

    emitEvent(videoEntity, 'openEntity');
    unmuteVideo(videoEntity)

    const id = videoEntity.id.substring(13);
    const creative = creativesData.find(x => x.id === id);
    if (creative) {
        document.getElementById('title').textContent = creative.title;
    }
}

function closeEntity(videoEntity) {
    emitEvent(videoEntity, 'closeEntity');
    emitEvent(videoEntity, 'unhighlightEntity');
    muteVideo(videoEntity);
    pauseVideo(videoEntity);
    openedEntity = null
    rotationPaused = false
    document.getElementById('title').textContent = ''
}

// Type: 'image' | 'video'
async function fetchCreatives(type) {
    return shuffleCreatives(await fetch(`${type}_creatives.json`).then(res => res.json()));
}

function getItemRotation(hAngle, vAngle) {
    const x = vAngle;
    const y = hAngle + 180;
    const z = 0;
    return [x, y, z];
}

function getItemPosition(radius, hAngle, vAngle) {
    const hRads = hAngle * Math.PI / 180.0
    const vRads = vAngle * Math.PI / 180.0
    const x = Math.sin(hRads)
    const z = Math.cos(hRads)
    const y = Math.sin(vRads)
    const hProjection = Math.cos(vRads)
    const module = Math.sqrt(x*x + y*y + z*z)
    const resultX = x * radius * hProjection / module
    const resultY = y * radius
    const resultZ = z * radius * hProjection / module

    return [resultX, resultY, resultZ]
}

// targetPosition: THREE.Vector3
// observerPosition: THREE.Vector3
function getCloserPosition(targetPosition, observerPosition, distance) {
    let dx = targetPosition.x - observerPosition.x
    let dy = targetPosition.y - observerPosition.y
    let dz = targetPosition.z - observerPosition.z
    const module = Math.sqrt(dx*dx + dy*dy + dz*dz)
    dx *= (distance / module)
    dy *= (distance / module)
    dz *= (distance / module)
    const resultX = observerPosition.x + dx
    const resultY = observerPosition.y + dy
    const resultZ = observerPosition.z + dz

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

    rotationInterval = setInterval(() => {
        !rotationPaused && rotatePanels()
    }, 16.67); // 60 fps

    await addPanels(creativesData);
    startComplete = true
}

function reset() {
    if (!startComplete) {
        return;
    }
    startComplete = false;
    clearInterval(rotationInterval);
    removePanels();

    start();
}

async function addPanels(creativesData) {
    const nItemsBase = 32;
    const rows = Array.from(Array(4).keys());
    const circumference = 13;
    let panelIndex = 0;

    await Promise.all(rows.flatMap(rowIndex => {
        const nItems = Math.floor(nItemsBase - (rowIndex + (panelIndex / Math.PI / 1.5)));
        const rowEntity = document.createElement('a-entity');
        rowEntity.setAttribute('id', `row-entity-${rowIndex}`);
        rowEntity.setAttribute('rotation', '0 45 0');
        scene.appendChild(rowEntity);
        panelsArr.push({ rowEntity, panelIds: new Array(nItems)});

        const promises = creativesData
            .slice(panelIndex, panelIndex + nItems)
            .map((creative, index) => {
                return new Promise(async (resolve) => {
                    const hAngle = getHAngle(index, nItems);
                    const vAngle = circumference * (rowIndex / (Math.PI / 4)) + 7.5;
                    const { videoEntity, id } = await createPanel(
                        creative,
                        getItemPosition(circumference, hAngle, vAngle),
                        getItemRotation(hAngle, vAngle),
                        rowEntity);
                    panels.set(id, videoEntity);
                    panelsArr[rowIndex].panelIds[index] = id;
                    console.log('Resolved');
                    resolve();
                });
            });
        panelIndex += nItems;
        return promises;
    }));
}

function removePanels() {
    clearEventListeners();
    panelsArr.forEach(({rowEntity}) => {
        rowEntity.parentElement.removeChild(rowEntity);
    });
    panelsArr = [];
}

function clearEventListeners() {
    panelsArr
        .flatMap(({panelIds}) => panelIds)
        .forEach(panelId => {
            document.getElementById(panelId).removeEventListener('mouseenter', onPanelMouseEnter);
            document.getElementById(panelId).removeEventListener('mouseleave', onPanelMouseLeave);
            document.getElementById(panelId).removeEventListener('click', onPanelClick);
    });
}

function shuffleCreatives(creatives) {
    return creatives
        .map(creative => ({creative, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({creative}) => creative);
}

start();