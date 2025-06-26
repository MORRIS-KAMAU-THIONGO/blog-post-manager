const baseUrl = 'http://localhost:3000/posts';

function displayPosts() {
  fetch(baseUrl)
    .then(response => response.json())
    .then(posts => {
      const postList = document.getElementById('post-list');
      postList.innerHTML = '';
      posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        postItem.dataset.id = post.id;
        postItem.innerHTML = `
          <img src="${post.image || 'https://via.placeholder.com/50'}" alt="${post.title}">
          <span>${post.title}</span>
        `;
        postItem.addEventListener('click', () => handlePostClick(post.id));
        postList.appendChild(postItem);
      });
      // Advanced: Display first post on load
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    })
    .catch(error => console.error('Error fetching posts:', error));
}

function handlePostClick(postId) {
  fetch(`${baseUrl}/${postId}`)
    .then(response => response.json())
    .then(post => {
      const detailTitle = document.getElementById('detail-title');
      const detailAuthor = document.getElementById('detail-author');
      const detailContent = document.getElementById('detail-content');
      const editButton = document.getElementById('edit-button');
      const deleteButton = document.getElementById('delete-button');

      detailTitle.textContent = post.title;
      detailAuthor.textContent = `By ${post.author}`;
      detailContent.textContent = post.content;
      editButton.classList.remove('hidden');
      deleteButton.classList.remove('hidden');

      // Store current post ID for edit/delete
      document.getElementById('edit-post-form').dataset.id = post.id;
      document.getElementById('delete-button').dataset.id = post.id;
    })
    .catch(error => console.error('Error fetching post:', error));
}

function addNewPostListener() {
  const form = document.getElementById('new-post-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const content = document.getElementById('new-content').value.trim();
    const author = document.getElementById('new-author').value.trim();
    const image = document.getElementById('new-image').value.trim() || 'https://via.placeholder.com/50';

    const newPost = { title, content, author, image };

    // Persist to server (Extra Advanced)
    fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
      .then(response => response.json())
      .then(post => {
        const postList = document.getElementById('post-list');
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        postItem.dataset.id = post.id;
        postItem.innerHTML = `
          <img src="${post.image}" alt="${post.title}">
          <span>${post.title}</span>
        `;
        postItem.addEventListener('click', () => handlePostClick(post.id));
        postList.appendChild(postItem);
        form.reset();
      })
      .catch(error => console.error('Error creating post:', error));
  });
}

function addEditPostListener() {
  const editButton = document.getElementById('edit-button');
  const editForm = document.getElementById('edit-post-form');
  const cancelButton = document.getElementById('cancel-edit');

  editButton.addEventListener('click', () => {
    const title = document.getElementById('detail-title').textContent;
    const content = document.getElementById('detail-content').textContent;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-content').value = content;
    editForm.classList.remove('hidden');
  });

  cancelButton.addEventListener('click', () => {
    editForm.classList.add('hidden');
  });

  editForm.addEventListener('submit', event => {
    event.preventDefault();
    const postId = editForm.dataset.id;
    const updatedPost = {
      title: document.getElementById('edit-title').value.trim(),
      content: document.getElementById('edit-content').value.trim()
    };

    // Persist to server (Extra Advanced)
    fetch(`${baseUrl}/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost)
    })
      .then(response => response.json())
      .then(post => {
        // Update post list
        const postItem = document.querySelector(`.post-item[data-id="${post.id}"] span`);
        postItem.textContent = post.title;
        // Update detail view
        document.getElementById('detail-title').textContent = post.title;
        document.getElementById('detail-content').textContent = post.content;
        editForm.classList.add('hidden');
      })
      .catch(error => console.error('Error updating post:', error));
  });
}

function addDeletePostListener() {
  const deleteButton = document.getElementById('delete-button');
  deleteButton.addEventListener('click', () => {
    const postId = deleteButton.dataset.id;

    // Persist to server (Extra Advanced)
    fetch(`${baseUrl}/${postId}`, {
      method: 'DELETE'
    })
      .then(() => {
        // Remove from post list
        const postItem = document.querySelector(`.post-item[data-id="${postId}"]`);
        postItem.remove();
        // Clear detail view
        document.getElementById('detail-title').textContent = '';
        document.getElementById('detail-author').textContent = '';
        document.getElementById('detail-content').textContent = '';
        document.getElementById('edit-button').classList.add('hidden');
        document.getElementById('delete-button').classList.add('hidden');
        document.getElementById('edit-post-form').classList.add('hidden');
      })
      .catch(error => console.error('Error deleting post:', error));
  });
}

function main() {
  displayPosts();
  addNewPostListener();
  addEditPostListener();
  addDeletePostListener();
}

document.addEventListener('DOMContentLoaded', main);
