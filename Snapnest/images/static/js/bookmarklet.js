(() => {
    // Frontend URL (React App)
    const frontendUrl = 'http://localhost:3000/';
    // Backend/Static URL for CSS
    const staticBaseUrl = 'http://127.0.0.1:8000/';
    const styleUrl = staticBaseUrl + 'static/css/bookmarklet.css';
    const minWidth = 200; // Increased min size for better quality
    const minHeight = 200;
  
    // Prevent duplicate UI
    if (window.__snapnest_open) {
      document.getElementById('snapnest-bookmarklet')?.remove();
      window.__snapnest_open = false;
      return;
    }
    window.__snapnest_open = true;
  
    // Load CSS
    let head = document.head;
    let oldLink = document.getElementById('snapnest-bookmarklet-css');
    if (oldLink) oldLink.remove();
    let link = document.createElement('link');
    link.id = 'snapnest-bookmarklet-css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = styleUrl + '?r=' + Math.floor(Math.random() * 9999999999999999);
    head.appendChild(link);
  
    // Remove old UI if present
    document.getElementById('snapnest-bookmarklet')?.remove();
  
    // Create UI
    let boxHtml = `
      <div id="snapnest-bookmarklet">
        <div class="snapnest-header">
            <span class="snapnest-logo">SnapNest</span>
            <a href="#" id="snapnest-close">&times;</a>
        </div>
        <div class="snapnest-content">
            <h1>Select an image to bookmark:</h1>
            <div class="snapnest-images"></div>
            <p class="snapnest-info"></p>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', boxHtml);
  
    function bookmarkletLaunch() {
      const bookmarklet = document.getElementById('snapnest-bookmarklet');
      const imagesContainer = bookmarklet.querySelector('.snapnest-images');
      const imagesInfo = bookmarklet.querySelector('.snapnest-info');
      imagesContainer.innerHTML = '';
      bookmarklet.style.display = 'block';
  
      // Close event
      bookmarklet.querySelector('#snapnest-close').addEventListener('click', function(e){
        e.preventDefault();
        bookmarklet.remove();
        window.__snapnest_open = false;
      });
  
      // Find images
      let validCount = 0;
      // Filter out tiny images and svgs (unless relevant)
      document.querySelectorAll('img').forEach(image => {
        if (
          image.naturalWidth >= minWidth &&
          image.naturalHeight >= minHeight &&
          image.src.startsWith('http') // Ensure we only get real URLs
        ) {
          let imgWrapper = document.createElement('div');
          imgWrapper.className = 'snapnest-img-wrapper';

          let imageFound = document.createElement('img');
          imageFound.src = image.src;
          imageFound.alt = image.alt || '';
          imageFound.title = 'Click to bookmark this image';
          
          imageFound.addEventListener('click', function(event){
            bookmarklet.remove();
            window.__snapnest_open = false;
            
            // Redirect to React Upload Page with params
            const targetUrl = frontendUrl + 'images/upload?url=' + 
                encodeURIComponent(event.target.src) + 
                '&title=' + 
                encodeURIComponent(document.title);
            
            window.open(targetUrl, '_blank');
          });

          imgWrapper.appendChild(imageFound);
          imagesContainer.appendChild(imgWrapper);
          validCount++;
        }
      });
  
      imagesInfo.textContent = validCount === 0
        ? `No large images found (${minWidth}x${minHeight}px+).`
        : `Found ${validCount} image(s).`;
    }
  
    bookmarkletLaunch();
})();