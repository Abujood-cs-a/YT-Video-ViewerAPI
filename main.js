
const API_KEY = 'AIzaSyDJccle39RWUFu8YuaaIVkPeITjusxmXS8';

function extractVideoId(input) {
    if (!input) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) return match[1];
    }
    return input;
}

function showLoading() {
    document.getElementById('content').innerHTML = `
        <div class="loading">
            <p>Loading video information...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById('content').innerHTML = `
        <div class="error">
            <p>${message}</p>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
}

function showVideo(videoId, videoData) {
    const snippet = videoData.snippet;
    const statistics = videoData.statistics || {};
    
    const publishDate = new Date(snippet.publishedAt).toLocaleDateString();
    const description = snippet.description || 'No description available';
    
    document.getElementById('content').innerHTML = `
        <div class="video-container">
            <iframe 
                class="video-player"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        </div>
        
        <div class="video-info">
            <h2 class="video-title">${snippet.title}</h2>
            
            <div class="video-meta">
                <div class="meta-item">
                    <div class="meta-label">Channel</div>
                    <div>${snippet.channelTitle}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Published</div>
                    <div>${publishDate}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Views</div>
                    <div>${formatNumber(statistics.viewCount)} views</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Likes</div>
                    <div>${formatNumber(statistics.likeCount)} likes</div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem;">
                <div class="meta-label" style="margin-bottom: 0.5rem;">Description</div>
                <p style="line-height: 1.6; opacity: 0.9;">
                    ${description.length > 300 ? description.substring(0, 300) + '...' : description}
                </p>
            </div>
        </div>
    `;
}

async function loadVideo() {
    const input = document.getElementById('videoInput').value.trim();
    const videoId = extractVideoId(input);
    
    if (!videoId) {
        showError('Please enter a valid YouTube URL or Video ID');
        return;
    }

    showLoading();

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            showVideo(videoId, data.items[0]);
        } else {
            showError('Video not found. Please check the URL or Video ID.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load video. Please check your connection and try again.');
    }
}

// Auto-load the default video on page load
window.addEventListener('load', () => {
    setTimeout(loadVideo, 1000);
});

// Allow Enter key to load video
document.getElementById('videoInput').addEventListener('keypress', (ele) => { 
    if(ele.key === 'Enter') { 
        loadVideo();
    }
});