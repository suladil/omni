export default function decorate(block) {
  const videoUrl = 'https://player.vimeo.com/video/1182681963?background=1&autoplay=1&loop=1&muted=1&controls=0';

  const iframe = document.createElement('iframe');
  iframe.src = videoUrl;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'autoplay; fullscreen');
  iframe.setAttribute('allowfullscreen', '');
  iframe.classList.add('hero-video');

  // Hide the static image row (first row) when video is used
  const imageRow = block.querySelector(':scope > div:first-child');
  if (imageRow) {
    imageRow.style.display = 'none';
  }

  block.prepend(iframe);
}
