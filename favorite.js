const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = BASE_URL + "/api/v1/users/";

const dataPanel = document.querySelector("#data-panel");

function renderCard(data) {
  let card = ``;

  data.forEach((item) => {
    card += `
       <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${item.avatar}"
              class="card-img-top"
              alt="User Poster"
            />
            <div class="card-body">
              <h5 class="card-title" style="display:flex;justify-content:center">${item.name}</h5>
            </div>
            <div class="card-footer">
              <button
                class="btn btn-primary btn-show-user"
                data-bs-toggle="modal"
                data-bs-target="#user-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <button class="btn btn-info btn-danger btn-add-favorite" data-id="${item.id}">-</button>
            </div>
          </div>
          </div>
          </div>
          
      `;
  });

  dataPanel.innerHTML = card;
}

//////頁面初始化///////////////////////////

/////定義使用者資料/////////////
const users = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
let filteredUsers = [];

///////分頁設定///////////////
const USERS_PER_PAGE = 12; //新增這行
const paginator = document.querySelector("#paginator");

function getUsersByPage(page) {
  //計算起始 index
  const data = filteredUsers.length ? filteredUsers : users;

  const startIndex = (page - 1) * USERS_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

// 回傳 Pagination 的號碼

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

/////列印初始頁面/////////////////////

renderCard(getUsersByPage(1)); // Only Print First Page
renderPaginator(users.length); // Create Paginator

//////add Modal Listener/////////////

function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalBirthday = document.querySelector("#user-modal-region");
  const modalCreateAt = document.querySelector("#user-modal-create-at");
  const modalUpdateAt = document.querySelector("#user-modal-update-at");

  axios.get(SHOW_URL + id).then((response) => {
    const data = response.data;

    modalTitle.innerText = `${data.surname} ${data.name}`;

    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-poster" class="img-fluid">`;

    modalEmail.innerText = `Email:  ${data.email}`;
    modalGender.innerText = `Gender:  ${data.gender}`;
    modalAge.innerText = `Age:  ${data.age}`;
    modalRegion.innerText = `Region:  ${data.region}`;
    modalBirthday.innerText = `Birthday:  ${data.birthday}`;
    modalCreateAt.innerText = `Create At:  ${data.created_at}`;
    modalUpdateAt.innerText = `Update At:  ${data.updated_at}`;
  });
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    deleteFavorite(Number(event.target.dataset.id));
  }
});

/////search form///////////////

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
//監聽表單提交事件

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault();
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase();

  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert("請輸入有效字串！");
  }
  //條件篩選
  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  );
  //重新輸出至畫面
  renderPaginator(filteredUsers.length);
  renderCard(getUsersByPage(1));
});

/////設計分頁//////////

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面
  renderCard(getUsersByPage(page));
});

//// 刪除收藏清單//////////////////

//新增函式
function deleteFavorite(id) {
  const targetIndex = users.findIndex((user) => {
    return user.id === id;
  });

  if (targetIndex !== -1) {
    users.splice(targetIndex, 1);
    renderCard(getUsersByPage(1)); //重新產生畫面
    localStorage.setItem("favoriteUsers", JSON.stringify(users)); // Reset Local Storages
  }
}
