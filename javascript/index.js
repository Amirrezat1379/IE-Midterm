// initialize DOM components
const userName = document.getElementById("name")
const userLink = document.getElementById("link")
const userLocation = document.getElementById("location")
const userProfile = document.getElementById("profile")
const userBio = document.getElementById("bio")
const submitButton = document.getElementById("submit")
const searchLink = document.getElementById("search")
const userAlert = document.getElementById("alert")
const userRepos = document.getElementById("repos")
const userFavorite = document.getElementById("favorite")

async function runLink() {
  // create user link to fetch
  const url = 'https://api.github.com/users/' + searchLink.value
  // if inputbox is empty, it will show error message
  if (searchLink.value == '') {
    setTimeout(() => {
      userAlert.innerHTML = ""
    }, 1500);
    userAlert.innerHTML = "Enter Username !!!"
    return
  }
  // if items saved in local storage, it will load information from here and show some message to you :))
  if (window.localStorage[searchLink.value.toLowerCase()] != undefined) {
    setTimeout(() => {
      userAlert.innerHTML = ""
    }, 1500);
    userAlert.innerHTML = "Data from local storage"
    let thisData = JSON.parse(window.localStorage[searchLink.value.toLowerCase()])
    userName.innerHTML = "Name: " + thisData['name']
    userLink.innerHTML = "Link: " + thisData['blog']
    userLocation.innerHTML = "Location: " + thisData['location']
    userProfile.src = thisData['avatar_url']
    userBio.innerHTML = "Bio: " + thisData['bio']
    userRepos.innerHTML = "User repos: <br>" + thisData['repos']
    userFavorite.innerHTML = "Favorite language" + thisData['favorite']
    return
  }
  try {
    // try to fetch url
    var response = await fetch(url);
  } catch (error) {
    // if we have some errors, it will show message to you
    setTimeout(() => {
      userAlert.innerHTML = ""
    }, 1500);
    userAlert.innerHTML = error.message
    return
  }
  let data = await response.json();
  // this part will handle the users that they are not exist
  if (data['message'] == "Not Found") {
    setTimeout(() => {
      userAlert.innerHTML = ""
      searchLink.value = ""
    }, 1500);
    userAlert.innerHTML = "User not found !!!"
    return
  }
  // we will come here if we have user :D
  // create dictionary to store oure information
  let dict = {}
  if (data['name'] != null) {
    userName.innerHTML = "Name: " + data['name']
    dict['name'] = data['name']
  }
  else {
    userName.innerHTML = "Name:"
    dict['name'] = ''
  }
  if (data['blog'] != null) {
    userLink.innerHTML = "Link: " +  data['blog']
    dict['blog'] = data['blog']
  }
  else {
    userLink.innerHTML = "Link:"
    dict['blog'] = ''
  }
  if (data['location'] != null) {
    userLocation.innerHTML = "Location: " + data['location']
    dict['location'] = data['location']
  }
  else {
    userLocation.innerHTML = "Location:"
    dict['location'] = ''
  }
  if (data['bio'] != null) {
    userBio.innerHTML = "Bio: " + data['bio'].replace('\r\n', '<br>')
    dict['bio'] = data['bio'].replace('\r\n', '<br>')
  }
  else {
    userBio.innerHTML = "Bio:"
    dict['bio'] = ''
  }
  userProfile.src = data['avatar_url']
  let repos = await getRepos(data)
  let reposPart = ''
  let max = 5
  if (repos.length < max)
    max = repos.length
  // this part will find last five repos and will show them with their languages
  // notice that some repos have not any language !!! so we have to handle that
  if (repos.length > 0) {
    for (let i = 0; i < max; i++) {
      if (repos[i]['language'] != null) {
        if (repos[i]['language'] != undefined)
          reposPart += repos[i]['name'] + '     language: ' + repos[i]['language'] + '<br>'
        else
          reposPart += repos[i]['name'] + '     language: No language !!' + '<br>'
      }
      else {
        let languagesRes = await fetch(repos[i]['languages_url'])
        let languages = await languagesRes.json()
        if (Object.keys(languages)[0] != undefined)
          reposPart += repos[i]['name'] + '     language: ' + Object.keys(languages)[0] + '<br>'
        else
          reposPart += repos[i]['name'] + '     language: No language !!' + '<br>'
      }
    }
  }
  userRepos.innerHTML = "User repos: <br>" + reposPart
  let favorite = await findFavorite(repos)
  if (favorite[0] != undefined) {
    userFavorite.innerHTML = "Favorite language: " + favorite[0]
    dict['favorite'] = favorite[0]
  }
  else {
    userFavorite.innerHTML = "Favorite language:"
    dict['favorite'] = ''
  }
  dict['avatar_url'] = data['avatar_url']
  dict['repos'] = reposPart
  // store them into localstorage by using username as key
  window.localStorage.setItem(data['login'].toLowerCase(), JSON.stringify(dict))
}

// function to find user's repos
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
}

// function to find user's favorite programming language
async function findFavorite(array) {
  let languages = []
  for (let i of array) {
    if (i['language'] != null)
      languages.push(i['language'])
    else {
      let languagesRes = await fetch(i['languages_url'])
      let language = await languagesRes.json()
      for (let j in Object.keys(language))
        languages.push(j)
    }
  }
  languages = sortByFrequency(languages)
  return languages
}

// function to sort array items by their frequency
function sortByFrequency(array) {
  var frequency = {};

  array.forEach(function (value) { frequency[value] = 0; });

  var uniques = array.filter(function (value) {
    return ++frequency[value] == 1;
  });

  return uniques.sort(function (a, b) {
    return frequency[b] - frequency[a];
  });
}

// function to sorn repos by their last pushing time
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
  for (i of array) {
    console.log(i['updated_at'])
  }
  return array
}

// set event listener to button
submitButton.addEventListener("click", runLink)