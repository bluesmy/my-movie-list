(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const dataPanel = document.getElementById('data-panel')
  const data = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const searchBtn = document.getElementById('submit-search')
  const searchInput = document.getElementById('search')
  const displayMode = document.getElementById('display-mode')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let currentPage // 設定currentPage方便之後於localStorage調整目前頁面
  let currentType
  let currentFavoriteMoviesDisplay // 設定此變數，便於搜尋後切換頁面、展示方式、刪除電影時，仍能維持原有搜尋結果，不會刷新整個版面而回到所有最愛電影清單
  getTotalPages(data)
  getPageData(1, data, 'card')
  localStorage.setItem('favoriteMoviesSearch', JSON.stringify(data)) // 預設搜尋結果為所有最愛電影


  // Functions

  // display card mode
  function displayCardMode(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
      <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  // display list mode
  function displayListMode(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
        <div class="container">
          <hr>
          <div class="row list py-1">
            <div class="col-sm-9 pt-2">
              <h6 class="card-title">${item.title}</h6>
            </div>
            <!-- "More" button -->
            <div class="col-sm-3">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  // 顯示電影詳細資料
  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')
    // set request url
    const url = INDEX_URL + id
    console.log(url)
    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)
      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  // 將電影移除最愛
  function removeFavoriteItem(id) {
    // find movie by id
    const index = data.findIndex(item => item.id === Number(id))
    if (index === -1) return

    // removie movie and update localStorage
    data.splice(index, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(data))

    // find movie id in search result and update favoriteMovieSearch localStorage
    let currentFavoriteMoviesDisplay = JSON.parse(localStorage.getItem('favoriteMoviesSearch'))
    let currentFavoriteMoviesDisplayIndex = currentFavoriteMoviesDisplay.findIndex(item => item.id === Number(id))
    currentFavoriteMoviesDisplay.splice(currentFavoriteMoviesDisplayIndex, 1) // 同步移除搜尋結果之該電影
    localStorage.setItem('favoriteMoviesSearch', JSON.stringify(currentFavoriteMoviesDisplay))

    // repaint dataList
    currentPage = localStorage.getItem('page')
    currentFavoriteMoviesDisplay = JSON.parse(localStorage.getItem('favoriteMoviesSearch'))
    currentType = localStorage.getItem('type')
    getTotalPages(currentFavoriteMoviesDisplay)
    getPageData(currentPage, currentFavoriteMoviesDisplay, currentType)
  }

  // 顯示頁面數量 
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  // 檢視特定頁面的資料與展示類型
  function getPageData(pageNum, data, type) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    if (type === 'list') {
      displayListMode(pageData)
    } else if (type === 'card') {
      displayCardMode(pageData)
    }
  }


  // 監聽器設置

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-remove-favorite')) {
      removeFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {
    event.preventDefault()
    let favoriteMoviesSearch = []
    const regex = new RegExp(searchInput.value, 'i')

    favoriteMoviesSearch = data.filter(movie => movie.title.match(regex))
    console.log(favoriteMoviesSearch)
    getTotalPages(favoriteMoviesSearch)
    getPageData(1, favoriteMoviesSearch, localStorage.getItem('type'))
    localStorage.setItem('favoriteMoviesSearch', JSON.stringify(favoriteMoviesSearch)) // 儲存搜尋結果於favoriteMoviesSearch，而不影響最愛電影清單，這樣刷新頁面時，還能顯示所有最愛
  })

  // listen to display mode click event
  displayMode.addEventListener('click', function () {
    currentPage = localStorage.getItem('page')
    currentFavoriteMoviesDisplay = JSON.parse(localStorage.getItem('favoriteMoviesSearch'))

    if (event.target.matches('.list-mode')) {
      localStorage.setItem('type', 'list')
      currentType = localStorage.getItem('type')
      getPageData(currentPage, currentFavoriteMoviesDisplay, currentType)
      console.log('list')
    } else if (event.target.matches('.card-mode')) {
      localStorage.setItem('type', 'card')
      currentType = localStorage.getItem('type')
      getPageData(currentPage, currentFavoriteMoviesDisplay, currentType)
      console.log('card')
    }
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    currentPage = event.target.dataset.page
    currentType = localStorage.getItem('type')
    currentFavoriteMoviesDisplay = JSON.parse(localStorage.getItem('favoriteMoviesSearch'))
    console.log(currentPage)
    if (event.target.tagName === 'A') {
      getPageData(currentPage, currentFavoriteMoviesDisplay, currentType)
      localStorage.setItem('page', currentPage)
    }
  })

})()