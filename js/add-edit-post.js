import postApi from './api/postApi.js';
import constant from './appConstants.js';

const submitPost = async (editId) => {
    document.querySelector("#postTitle").classList.remove("is-invalid")
    document.querySelector("#postAuthor").classList.remove("is-invalid")
    document.querySelector("#postDescription").classList.remove("is-invalid")

    let title = document.querySelector("#postTitle").value
    if (!title) {
        document.querySelector("#postTitle").classList.add("is-invalid")
        return
    }

    let author = document.querySelector("#postAuthor").value
    if (!author) {
        document.querySelector("#postAuthor").classList.add("is-invalid")
        return
    }

    let description = document.querySelector("#postDescription").value
    if (!description) {
        document.querySelector("#postDescription").classList.add("is-invalid")
        return
    }

    let image = document.querySelector("#postHeroImage").style.backgroundImage

    if (editId && editId.length > 0) {
        await postApi.update({
            title: title,
            author: author,
            description: description,
            imageUrl: image ? image.substring(5, image.length - 2) : "",
            id: editId,
        });
        const editPageUrl = `/`;
        window.location = editPageUrl;

        alert('Save post successfully');
    } else {
        const newPost = await postApi.add({
            title: title,
            author: author,
            description: description,
            imageUrl: image ? image.substring(5, image.length - 2) : ""
        });

        const editPageUrl = `add-edit-post.html?editId=${newPost.id}`;
        window.location = editPageUrl;

        alert('Add new post successfully');
    }
};

function renderPostForm(post) {
    // set title
    const titleElement = document.querySelector("#postTitle");
    if (titleElement) {
        titleElement.value = post.title;
    }

    // set author
    const authorElement = document.querySelector("#postAuthor");
    if (authorElement) {
        authorElement.value = post.author;
    }

    // set description
    const descElement = document.querySelector("#postDescription");
    if (descElement) {
        descElement.value = post.description;
    }

    // set background
    const backgroundElement = document.querySelector('#postHeroImage');
    if (backgroundElement) {
        backgroundElement.style.backgroundImage = `url(${post.imageUrl})`;
    }
}

function randomImage() {
    const randomNumber = Math.trunc(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/id/${randomNumber}/${constant.DEFAULT_IMAGE_WIDTH}/${constant.DEFAULT_IMAGE_HEIGHT}`;

    const backgroundElement = document.querySelector('#postHeroImage');
    if (backgroundElement) {
        backgroundElement.style.backgroundImage = `url(${imageUrl})`;
    }
}

const main = async () => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');

    if (editId && editId.length > 0) {
        const post = await postApi.get(editId);

        renderPostForm(post)

        // Show view detail link
        const goToDetailPageLink = document.querySelector('#goToDetailPageLink');
        goToDetailPageLink.href = `post-detail.html?postId=${editId}`;
        goToDetailPageLink.innerHTML = '<i class="fas fa-eye mr-1"></i> View post detail';
    } else {
        randomImage()
    }

    const changeImageButton = document.querySelector('#postChangeImage');
    if (changeImageButton) {
        changeImageButton.addEventListener('click', randomImage);
    }

    const postForm = document.querySelector('#postForm');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            submitPost(editId);
            e.preventDefault();
        });
    }
};
main();
