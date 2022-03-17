async function createPanel(creative, position, rotation) {
    const res = await fetch(creative.url);
    const blob = await res.blob();

    const videoEntity = createVideoEntity(creative, position, rotation);

    // Add the asset to the a-video
    videoEntity.setAttribute('src', creative.url);

    // Start playback
    // await videoEntity.play();
}

function createVideoEntity(creative, position, rotation) {
    const videoEntity = document.createElement('a-video');
    const videoEntityId = `video-entity-${creative.id}`
    videoEntity.setAttribute('id', videoEntityId);
    videoEntity.setAttribute('position', '0 3 -4');
    videoEntity.setAttribute('rotation', rotation.join(" "));
    videoEntity.setAttribute('width', '4');
    videoEntity.setAttribute('height', '2');
    videoEntity.setAttribute('animation', 'property: components.material.material.opacity; from: 0; to: 1; dur: 750; easing: easeOutQuad');

    document.getElementById('my-scene').appendChild(videoEntity);

    return videoEntity;
}

// Type: 'image' | 'video'
async function fetchCreatives(type) {
    return await fetch(`${type}_creatives.json`).then(res => res.json());
}

function getItemRotation(hAngle, vAngle) {
    const x = vAngle;
    const y = -hAngle;
    const z = 0;
    return [x, y, z];
}

// Index goes from 0 to nItems - 1
function getHAngle(index, nItems) {
    return (360 / nItems) * index;
}

async function start() {
    const nItems = 16;

    // Fetch creatives
    const creativesData = await fetchCreatives('video');
    const randomStartIndex = Math.floor(Math.random() * (creativesData.length - nItems))
    creativesData.slice(randomStartIndex, randomStartIndex + nItems).forEach((creative, index) => {
       createPanel(creative, "0 0 0", getItemRotation(getHAngle(index, nItems), 0));
    });
}

start();