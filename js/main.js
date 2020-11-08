import postAPI from "./api/postApi.js";
import constant from "./appConstants.js";

function timeConverter(timestamp) {
    var a = new Date(timestamp);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var time = `${hour}:${min} ${date}/${month}/${year}`;
    return time;
}

const renderPostList = (postList) => {
    const ulElement = document.querySelector("#postsList");
    ulElement.innerHTML = ""

    for (let post of postList) {
        const templateElement = document.querySelector("#postItemTemplate");
        if (!templateElement) {
            return;
        }

        // Clone li
        const liElementFromTemplate = templateElement.content.querySelector("li");
        const newLiElement = liElementFromTemplate.cloneNode(true);

        // Fill data
        // set title
        const titleElement = newLiElement.querySelector("#postItemTitle");
        if (titleElement) {
            titleElement.textContent = post.title;
        }

        // set description
        const descriptionElement = newLiElement.querySelector("#postItemDescription");
        if (descriptionElement) {
            descriptionElement.textContent = post.description ? `${post.description.slice(0, 90)}...` : "";
        }

        // set author
        const authorElement = newLiElement.querySelector("#postItemAuthor");
        if (authorElement) {
            authorElement.textContent = post.author;
        }

        // set image
        const imageElement = newLiElement.querySelector("#postItemImage");
        if (imageElement) {
            imageElement.src = post.imageUrl;
        }

        //set timespan
        const postTimeElement = newLiElement.querySelector("#postItemTimeSpan")
        if (postTimeElement) {
            postTimeElement.textContent = timeConverter(post.updatedAt);
        }

        newLiElement.addEventListener('click', () => {
            const detailPageUrl = `post-detail.html?postId=${post.id}`;

            // Go to detail page
            window.location = detailPageUrl;
        });

        // Go to edit page when click on edit icon
        const editIcon = newLiElement.querySelector('#postItemEdit');
        editIcon.addEventListener('click', (e) => {
            const editPageUrl = `add-edit-post.html?editId=${post.id}`;

            // Go to detail page
            window.location = editPageUrl;

            // Prevent bubbling click event on parent element
            e.stopPropagation();
        });

        const removeIcon = newLiElement.querySelector('#postItemRemove');
        removeIcon.addEventListener('click', async (e) => {
            // Prevent bubbling click event on parent element
            e.stopPropagation();
            if (window.confirm(`Remove this post ${post.title}. Really?!`)) {
                await postAPI.remove(post.id);
                window.location.reload();

            }

        });
        // Append li to ul
        ulElement.appendChild(newLiElement);
    }
};

const getPageList = (pagination) => {
    const { _limit, _totalRows, _page } = pagination;
    const totalPages = Math.ceil(_totalRows / _limit);
    let prevPage = -1;

    //invalid page detected
    if (_page < 1 || _page > totalPages) return [0, -1, -1, -1, 0];

    if (_page === 1) prevPage = 1;
    else if (_page === totalPages) prevPage = _page - 2 > 0 ? _page - 2 : 1;
    else prevPage = _page - 1;

    const currPage = prevPage + 1 > totalPages ? -1 : prevPage + 1;
    const nextPage = prevPage + 2 > totalPages ? -1 : prevPage + 2;

    return [
        _page === 1 ? -1 : _page - 1,
        prevPage,
        currPage,
        nextPage,
        _page === totalPages || totalPages === _page ? -1 : _page + 1,
    ];
};

const renderPagination = (pagination) => {
    const postPagination = document.querySelector('#post-pagination');
    if (postPagination) {
        const pageList = getPageList(pagination);
        const { _page, _limit } = pagination;
        const pageItems = postPagination.querySelectorAll('.page-item');
        if (pageItems.length === 5) {
            pageItems.forEach((item, idx) => {
                if (pageList[idx] === -1) {
                    item.setAttribute('hidden', '');
                    return;
                }

                if (pageList[idx] === 0) {
                    item.classList.add('disabled');
                    return;
                }

                const pageLink = item.querySelector('.page-link');
                if (pageLink) {
                    pageLink.href = `?_page=${pageList[idx]}&_limit=${_limit}`;

                    if (idx > 0 && idx < 4) {
                        pageLink.textContent = pageList[idx];
                    }
                }

                if (idx > 0 && idx < 4 && pageList[idx] === _page) {
                    item.classList.add('active');
                }
            });

            postPagination.removeAttribute('hidden');
        }
    }
};

function renderLoadingPostList() {
    const ulElement = document.querySelector("#postsList");

    const templateElement = document.querySelector("#loadingTemplate");
    if (!templateElement) {
        return;
    }

    // Clone li
    const liElementFromTemplate = templateElement.content.querySelector("li");
    const newLiElement = liElementFromTemplate.cloneNode(true);
    // Append li to ul
    ulElement.appendChild(newLiElement);

}

(async function () {
    renderLoadingPostList();
    console.log("renderLoading");
    const urlParam = new URLSearchParams(window.location.search);
    const page = urlParam.get('_page');
    const limit = urlParam.get('_limit');

    const params = {
        _page: page || constant.DEFAULT_PAGE,
        _limit: limit || constant.DEFAULT_LIMIT,
        _sort: "updatedAt",
        _order: "desc",
    };
    const response = await postAPI.getAll(params)
    renderPagination(response.pagination);
    renderPostList(response.data)
})()
