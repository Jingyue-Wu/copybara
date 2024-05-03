// get screenshot of tab
// get coordinates of selected area
// crop the screenshot
// send to the ocr api
// return text and update into clipboard

// chrome.storage.local.set({ coordinates: "bonjour" })

// store("coordinates", "bonjour")
// ;(async function () {
//   document.getElementById("test").innerHTML = await load("coordinates")
// })()

// ;(async function () {
//   const s = await load("screenshot")
//   document.getElementById("hi").innerHTML = s
//   console.log(s)
// })()

messageSent = false

const button = document.getElementById("button")
button.addEventListener("click", () => {
  if (!messageSent) {
    getScreen()
    getCoordinates()
    messageSent = true
  }
})

// send message to content script to tell it to get coordinates
// and then give the coordinates to background
function getCoordinates() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    messageContentScript(tabs[0].id, "getCoordinates")
  })
}

function messageContentScript(tabID, message) {
  console.log("sending to content script")
  chrome.tabs.sendMessage(
    tabID,
    { from: "popup", message: message },
    function (response) {
      console.log("sent message to content script", response)
      messageSent = false
    }
  )
}

// get uri of screenshot image
function getScreen() {
  let capture = chrome.tabs.captureVisibleTab()
  capture.then((uri) => {
    console.log("URIIIIIII", uri)
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      messageContentScript(tabs[0].id, uri)
    })
  })
}

function messageBackground(message) {
  console.log("sending to background")
  chrome.runtime.sendMessage(
    { from: "popup", data: message },
    function (response) {
      console.log("sent message to background", response)
      messageSent = false
    }
  )
}

// function store(key, value) {
//   chrome.storage.session.set({ [key]: value })
// }

// async function load(key) {
//   return new Promise((resolve, reject) => {
//     chrome.storage.session.get([key], function (response) {
//       console.log(response)
//       if (response[key] != undefined) {
//         resolve(response[key])
//       } else {
//         reject()
//       }
//     })
//   })
// }
