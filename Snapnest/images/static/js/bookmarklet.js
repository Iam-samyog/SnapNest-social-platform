(() => {
  // Use HTTP for local development
  const siteUrl = '//127.0.0.1:8000/';
  const styleUrl = siteUrl + 'static/css/bookmarklet.css';
  const minWidth = 100;
  const minHeight = 100;

  // Prevent duplicate UI
  if (window.__snapnest_open) {
    document.getElementById('bookmarklet')?.remove();
    window.__snapnest_open = false;
    return;
  }
  window.__snapnest_open = true;

  // Load CSS (remove old if present)
  let head = document.head;
  let oldLink = document.getElementById('bookmarklet-css');
  if (oldLink) oldLink.remove();
  let link = document.createElement('link');
  link.id = 'bookmarklet-css';
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = styleUrl + '?r=' + Math.floor(Math.random() * 9999999999999999);
  head.appendChild(link);

  // Remove old UI if present
  document.getElementById('bookmarklet')?.remove();

  // Create UI
  let boxHtml = `
    <div id="bookmarklet">
      <a href="#" id="close">&times;</a>
      <h1>Select an image to bookmark:</h1>
      <div class="images"></div>
      <p class="images-info"></p>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', boxHtml);

  function bookmarkletLaunch() {
    const bookmarklet = document.getElementById('bookmarklet');
    const imagesFound = bookmarklet.querySelector('.images');
    const imagesInfo = bookmarklet.querySelector('.images-info');
    imagesFound.innerHTML = '';
    bookmarklet.style.display = 'block';

    // Close event
    bookmarklet.querySelector('#close').addEventListener('click', function(e){
      e.preventDefault();
      bookmarklet.style.display = 'none';
      window.__snapnest_open = false;
    });

    // Find images in the DOM with the minimum dimensions
    let validCount = 0;
    document.querySelectorAll('img').forEach(image => {
      if (
        image.naturalWidth >= minWidth &&
        image.naturalHeight >= minHeight
      ) {
        let imageFound = document.createElement('img');
        imageFound.src = image.src;
        imageFound.alt = image.alt || '';
        imageFound.title = 'Click to bookmark this image';
        imageFound.style.opacity = '0.85';
        imageFound.onload = function() { this.style.opacity = '1'; };
        imageFound.onerror = function() { this.remove(); };
        imageFound.addEventListener('click', function(event){
          bookmarklet.style.display = 'none';
          window.__snapnest_open = false;
          window.open(
            siteUrl + 'images/create/?url=' +
            encodeURIComponent(event.target.src) +
            '&title=' +
            encodeURIComponent(document.title),
            '_blank'
          );
        });
        imagesFound.appendChild(imageFound);
        validCount++;
      }
    });

    imagesInfo.textContent = validCount === 0
      ? `No images found matching the minimum size (${minWidth}x${minHeight}px).`
      : `Found ${validCount} image(s). Click to bookmark.`;
  }

  window.bookmarkletLaunch = bookmarkletLaunch;
  bookmarkletLaunch();
})();