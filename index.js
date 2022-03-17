async function preloadResource(creative) {
    const res = await fetch(creative.url);
    const blob = await res.blob();
    const videoUrl = URL.createObjectURL(blob);
    const videoEntity = document.getElementById('video-element');
    const videoDOMElement = document.createElement('video');
    const videoDOMElementId = `dynamic-video-${creative.id}`
    videoDOMElement.setAttribute('id', videoDOMElementId); // Create a unique id for asset
    videoDOMElement.setAttribute('src', videoUrl);
    videoDOMElement.setAttribute('style', 'display: none;')
    videoDOMElement.setAttribute('loop', 'true')
    // Append the new video to the a-assets, where a-assets id="assets-id"
    document.getElementById('video-container').appendChild(videoDOMElement);

    // Add the asset to the a-video
    videoEntity.setAttribute('src', `#${videoDOMElementId}`);
    // Start playback
    videoDOMElement.muted = true;
    await videoDOMElement.play();
}

async function fetchCreatives() {
    return await fetch('creatives.json').then(res => res.json());
}

async function start() {
    // Fetch creatives
    const creativesData = await fetchCreatives();
    [creativesData[Math.floor((Math.random()*creativesData.length))]].forEach(creativeData => preloadResource(creativeData))
}

start();