const userName = document.getElementById("name")
const userLink = document.getElementById("link")
const userLocation = document.getElementById("location")
const userProfile = document.getElementById("profile")
const userBio = document.getElementById("bio")
const submitButton = document.getElementById("submit")
const searchLink = document.getElementById("search")
const userAlert = document.getElementById("alert")
const userRepos = document.getElementById("repos")

window.localStorage.clear()
userAlert.style.top = ((window.outerHeight / 2) - 100) + 'px'

async function runLink() {
  const url = 'https://api.github.com/users/' + searchLink.value
  if (searchLink.value == '') {
    setTimeout(() => {
      userAlert.innerHTML = "User Not Found !!!"
      userAlert.style.display = 'none'
    }, 1000);
    userAlert.style.display = 'block'
    userAlert.innerHTML = "Enter Username !!!"
    return
  }
  if (window.localStorage[searchLink.value.toLowerCase()] != undefined) {
    console.log("sevda")
    let thisData = JSON.parse(window.localStorage[searchLink.value.toLowerCase()])
    // console.log(thisData)
    userName.innerHTML = thisData['name']
    userLink.innerHTML = thisData['blog']
    userLocation.innerHTML = thisData['location']
    userProfile.src = thisData['avatar_url']
    userBio.innerHTML = thisData['bio']
    if (thisData[bio] != null)
      userBio.innerHTML = thisData['bio'].replace('\r\n', '<br>')
    return
  }
  try {
    var response = await fetch(url);
  } catch (error) {
    setTimeout(() => {
      userAlert.innerHTML = "User Not Found !!!"
      userAlert.style.display = 'none'
    }, 1000);
    userAlert.style.display = 'block'
    userAlert.innerHTML = error.message
    return
  }
  let data = await response.json();
  console.log(data)
  if (data['message'] == "Not Found") {
    setTimeout(() => {
      userAlert.style.display = 'none'
      searchLink.value = ""
    }, 1000);
    userAlert.style.display = 'block'
    return
  }
  userName.innerHTML = data['name']
  userLink.innerHTML = data['blog']
  userLocation.innerHTML = data['location']
  userProfile.src = data['avatar_url']
  userBio.innerHTML = data['bio']
  let repos = await getRepos(data)
  let reposPart = ''
  console.log(repos)
  for (let i = 0; i < 5; i ++) {
    console.log(repos[i]['language'])
    if (repos[i]['language'] != null)
      reposPart += repos[i]['name'] + '     language: ' + repos[i]['language'] + '<br>'
    else {
      let languagesRes = await fetch(repos[i]['languages_url'])
      let languages = await languagesRes.json()
      reposPart += repos[i]['name'] + '     language: ' + Object.keys(languages)[0] + '<br>'
    }
  }
  userRepos.innerHTML = reposPart
  if (data['bio'] != null)
    userBio.innerHTML = data['bio'].replace('\r\n', '<br>')
  let dict = {}
  dict['name'] = data['name']
  dict['blog'] = data['blog']
  dict['location'] = data['location']
  dict['avatar_url'] = data['avatar_url']
  dict['bio'] = data['bio']
  dict['repos'] = reposPart
  window.localStorage.setItem(data['login'].toLowerCase(), JSON.stringify(dict))
  console.log(window.localStorage)
}

async function getRepos(data) {
  try {
    var reposResponce = await fetch(data['repos_url'])
  } catch (error) {
    console.log(error.message)
    return false
  }
  let repos = await reposResponce.json()
  repos = sort(repos)
  return repos
  // repos.sort(function(a, b) {return repos[a]['updated_at'] - repos[b]['updated_at']})
}

function findFavorite(array) {
  
}

function sort(array) {
  let i = 0, j = 0
  let k = {};
  for (i = 0; i < array.length; i++) {
    for (j = i; j < array.length; j++) {
      if (array[i]['updated_at'] < array[j]['updated_at']) {
        k = array[j]
        array[j] = array[i]
        array[i] = k
      }
    }
  }
  return array
}

// getRepos('https://api.github.com/users/erfanmajedi/repos')
submitButton.addEventListener("click", runLink)