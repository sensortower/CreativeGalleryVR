async function preloadVideo(src) {
    const res = await fetch(src);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

async function start() {
    const videoElement = document.getElementById('video-element');
    const videoAsset = document.createElement('video');
    const videoUrl =  await preloadVideo('example.mp4');

    videoAsset.setAttribute('id', 'dynamic-video'); // Create a unique id for asset
    videoAsset.setAttribute('src', videoUrl);
    videoAsset.setAttribute('style', 'display: none;')

    // Append the new video to the a-assets, where a-assets id="assets-id"
    document.getElementById('video-container').appendChild(videoAsset);

    // Add the asset to the a-video
    videoElement.setAttribute('src', '#dynamic-video');
    // Start playback
    videoAsset.muted = true;
    videoAsset.play();
}

start();