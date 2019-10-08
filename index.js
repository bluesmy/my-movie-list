(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchBtn = document.getElementById('submit-search')
  const searchInput = document.getElementById('search')
  const displayMode = document.getElementById('display-mode')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let currentPage // 設定currentPage方便之後於localStorage調整目前頁面
  let currentType
  let currentResults

  // 設定初始頁面
  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    getPageData(1, data, 'card') // 預設為第一頁、card介面
    localStorage.setItem('page', 1) // 將目前設定存入localStorage
    localStorage.setItem('type', 'card')
    localStorage.setItem('results', JSON.stringify(data))
    currentPage = localStorage.getItem('page')
    currentType = localStorage.getItem('type')
    currentResults = JSON.parse(localStorage.getItem('results'))
  }).catch((err) => console.log(err))

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
              <h6 class="card-title">${item.title}</h6>
            </div>
            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button --> 
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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
            <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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

  // 將電影加入最愛清單
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))
    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
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
    } else if (event.target.matches('.btn-add-favorite')) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {
    event.preventDefault()
    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    getTotalPages(results)
    getPageData(1, results, localStorage.getItem('type'))
    localStorage.setItem('results', JSON.stringify(results))
  })

  // listen to display mode click event
  displayMode.addEventListener('click', function () {
    currentPage = localStorage.getItem('page')
    currentResults = JSON.parse(localStorage.getItem('results'))

    if (event.target.matches('.list-mode')) {
      localStorage.setItem('type', 'list')
      currentType = localStorage.getItem('type')
      getPageData(currentPage, currentResults, currentType)
      console.log('list')
    } else if (event.target.matches('.card-mode')) {
      localStorage.setItem('type', 'card')
      currentType = localStorage.getItem('type')
      getPageData(currentPage, currentResults, currentType)
      console.log('card')
    }
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    currentPage = event.target.dataset.page
    currentType = localStorage.getItem('type')
    currentResults = JSON.parse(localStorage.getItem('results'))
    console.log(currentPage)
    if (event.target.tagName === 'A') {
      getPageData(currentPage, currentResults, currentType)
      localStorage.setItem('page', currentPage)
    }
  })

})()