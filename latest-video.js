document.addEventListener("DOMContentLoaded", async () => {
  const API_KEY = 'AIzaSyAnLjIHOFWPoTxXvYy2MGHqEMZdisc10MM';
  const UPLOADS_PLAYLIST_ID = 'UUyzSr6mqFWvt8RlMmqzHtYw';
  const container = document.getElementById('video-container');

   try {
    // 1. Use playlistItems (Cost: 1 unit) instead of search (Cost: 100 units)
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=1`
    );

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return;

    // Data path is slightly different for playlistItems
    const videoId = data.items[0].snippet.resourceId.videoId;
    const videoTitle = data.items[0].snippet.title;
    
    // 2. Smart Thumbnail Logic (VPN Friendly)
    const thumbnails = data.items[0].snippet.thumbnails;
    let thumbUrl = thumbnails.maxres ? thumbnails.maxres.url : thumbnails.high.url;
    
    // Replace domain to avoid ISP blocking (The VPN fix)
    thumbUrl = thumbUrl.replace("i.ytimg.com", "img.youtube.com");

    // 3. Clean Title
    const parser = new DOMParser();
    const cleanTitle = parser.parseFromString(videoTitle, 'text/html').body.textContent;

    // 4. Render (ONLY ONCE)
    container.innerHTML = `
      <img src="${thumbUrl}" alt="${cleanTitle}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
      
      <!-- The Gradient Title -->
      <div class="video-title">${cleanTitle}</div>
      
      <div class="play-button" aria-label="Play Video"></div>
    `;

    // 5. Click Listener
    container.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = videoTitle;
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      
      // Clear container and add iframe
      container.innerHTML = '';
      container.appendChild(iframe);
    });

  } catch (error) {
    console.error('Error:', error);
    // Optional: Add fallback text if API fails
    container.innerHTML = '<p style="color:white; text-align:center; padding:20px;">Video unavailable</p>';
  }
});