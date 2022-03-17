async function preloadResource(creative) {
    const res = await fetch(creative.url);
    const blob = await res.blob();
    const videoBlobUrl = URL.createObjectURL(blob);

    const videoEntity = createVideoEntity(creative);
    const videoDOMElement = createVideoDOMElement(creative, videoBlobUrl);

    // Add the asset to the a-video
    videoEntity.setAttribute('src', `#${videoDOMElement.id}`);

    // Start playback
    videoDOMElement.muted = true;
    await videoDOMElement.play();
}

function createVideoEntity(creative) {
    const videoEntity = document.createElement('a-video');
    const videoEntityId = `video-entity-${creative.id}`
    videoEntity.setAttribute('id', videoEntityId);
    videoEntity.setAttribute('position', '0 3 -4');
    videoEntity.setAttribute('rotation', '0 0 0');
    videoEntity.setAttribute('width', '4');
    videoEntity.setAttribute('height', '2');
    videoEntity.setAttribute('animation', 'property: components.material.material.opacity; from: 0; to: 1; dur: 750; easing: easeOutQuad');

    document.getElementById('my-scene').appendChild(videoEntity);

    return videoEntity;
}

function createVideoDOMElement(creative, videoBlobUrl) {
    const videoDOMElement = document.createElement('video');
    const videoDOMElementId = `dynamic-video-${creative.id}`
    videoDOMElement.setAttribute('id', videoDOMElementId);
    videoDOMElement.setAttribute('src', videoBlobUrl);
    videoDOMElement.setAttribute('style', 'display: none;')
    videoDOMElement.setAttribute('loop', 'true')
    // Append the new video to the a-assets, where a-assets id="assets-id"
    document.getElementById('video-container').appendChild(videoDOMElement);

    return videoDOMElement;
}

// Type: 'image' | 'video'
async function fetchCreatives(type) {
    return await fetch(`${type}_creatives.json`).then(res => res.json());
}

async function start() {
    // Fetch creatives
    const creativesData = await fetchCreatives('video');
    [creativesData[Math.floor((Math.random()*creativesData.length))]].forEach(creativeData => preloadResource(creativeData))
}

start();