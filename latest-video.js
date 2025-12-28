document.addEventListener("DOMContentLoaded", async () => {
  // Please don't abuse my simple website :-)
  const API_KEY = 'AIzaSyAnLjIHOFWPoTxXvYy2MGHqEMZdisc10MM'; 
  const UPLOADS_PLAYLIST_ID = 'UUyzSr6mqFWvt8RlMmqzHtYw';
  const container = document.getElementById('video-container');

   try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=1`
    );

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return;

    const videoId = data.items[0].snippet.resourceId.videoId;
    const videoTitle = data.items[0].snippet.title;
    
    // Thumbnail Logic
    const thumbnails = data.items[0].snippet.thumbnails;
    let thumbUrl = thumbnails.maxres ? thumbnails.maxres.url : thumbnails.high.url;
    
    // VPN/ISP Blocking Fix
    thumbUrl = thumbUrl.replace("i.ytimg.com", "img.youtube.com");

    // Clean Title
    const parser = new DOMParser();
    const cleanTitle = parser.parseFromString(videoTitle, 'text/html').body.textContent;
    
    // Populate Container
    container.innerHTML = `
      <img 
        src="${thumbUrl}" 
        alt="${cleanTitle}" 
        fetchpriority="high" 
        style="width:100%; height:100%; object-fit:cover; display:block;"
      >
      
      <div class="video-title">${cleanTitle}</div>
      <div class="play-button" aria-label="Play Video"></div>
    `;

    // Click Listener
    container.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      iframe.title = videoTitle;
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      
      container.innerHTML = '';
      container.appendChild(iframe);
    });

  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Video unavailable</p>';
  }
});