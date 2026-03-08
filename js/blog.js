// ===========================
// Nick Shields — Blog JS
// Loads posts from posts.json
// Renders markdown via marked.js
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const blogGrid = document.getElementById('blogGrid');
  const blogContent = document.getElementById('blogContent');

  if (!blogGrid || !blogContent) return;

  // Check if we're viewing a specific post via URL hash
  const hash = window.location.hash;
  if (hash && hash.startsWith('#post/')) {
    const slug = hash.replace('#post/', '');
    loadPost(slug, blogContent);
  } else {
    loadPostList(blogGrid);
  }

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash;
    if (newHash && newHash.startsWith('#post/')) {
      const slug = newHash.replace('#post/', '');
      loadPost(slug, blogContent);
    } else {
      location.reload();
    }
  });
});

/**
 * Load and display the blog post listing
 */
async function loadPostList(container) {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Could not load posts.');

    const posts = await response.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="no-posts">
          <h2>No posts yet</h2>
          <p>Check back soon for new content!</p>
        </div>
      `;
      return;
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = posts.map(post => `
      <a href="#post/${post.slug}" class="blog-card">
        <div class="blog-date">${formatDate(post.date)}</div>
        <h2>${escapeHtml(post.title)}</h2>
        <p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>
        <span class="read-more">Read more &rarr;</span>
      </a>
    `).join('');

  } catch (err) {
    container.innerHTML = `
      <div class="no-posts">
        <h2>No posts yet</h2>
        <p>Check back soon for new content!</p>
      </div>
    `;
  }
}

/**
 * Load and render a single blog post
 */
async function loadPost(slug, container) {
  try {
    // First get the post metadata
    const metaResponse = await fetch('posts.json');
    const posts = await metaResponse.json();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      container.innerHTML = `
        <div class="no-posts">
          <h2>Post not found</h2>
          <p><a href="blog.html" style="color: var(--color-accent);">&larr; Back to blog</a></p>
        </div>
      `;
      return;
    }

    // Fetch the markdown file
    const mdResponse = await fetch(`blog/posts/${slug}.md`);
    if (!mdResponse.ok) throw new Error('Could not load post content.');

    const markdown = await mdResponse.text();
    const htmlContent = marked.parse(markdown);

    container.innerHTML = `
      <section class="blog-post-view">
        <div class="container">
          <div class="blog-post-content">
            <div class="post-meta">
              <a href="blog.html" class="back-link">&larr; Back to all posts</a>
              <h1>${escapeHtml(post.title)}</h1>
              <p class="date">${formatDate(post.date)}</p>
            </div>
            <div class="post-body">
              ${htmlContent}
            </div>
          </div>
        </div>
      </section>
    `;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    container.innerHTML = `
      <div class="no-posts">
        <h2>Error loading post</h2>
        <p><a href="blog.html" style="color: var(--color-accent);">&larr; Back to blog</a></p>
      </div>
    `;
  }
}

/**
 * Format a date string (YYYY-MM-DD) into a readable format
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Basic HTML escaping for safety
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
