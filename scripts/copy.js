// get screenshot of tab
// get coordinates of selected area
// crop the screenshot
// send to the ocr api
// return text and update into clipboard

const button = document.getElementById("button")
button.addEventListener("click", () => {
  getScreen()
})

// get uri of screenshot image
function getScreen() {
  let capture = chrome.tabs.captureVisibleTab()
  capture.then(onCaptured, onError)
}

function onCaptured(uri) {
  const canvas = document.getElementById("can")
  const context = canvas.getContext("2d") //https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext

  // get coordinates of crop (message inejcted content script)
  coordinates = getCoordinates()

  let image = new Image()
  image.src = uri

  image.onload = () => {
    // basically everything has to go in here now-----------------------------------------------

    // crop

    context.drawImage(image, 0, 0, 2500, 2500, 0, 0, 2500, 2500)
    document.getElementById("hi").innerHTML = canvas.toDataURL("image/jpeg")
  }
}

function onError(error) {
  console.log("There was an error capturing the screen")
  document.getElementById("hi").innerHTML = error
}

function getCoordinates() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    messageContentScript(tabs[0].id, "getCoordinates")
  })
}

function messageContentScript(tabID, message) {
  console.log("Message sent to content script")

  chrome.tabs.sendMessage(tabID, { message: message}, function (response) {
    console.log("Recieved response")
    document.getElementById("test").innerHTML = response.msg.start[0]
    console.log(response.msg.start, response.msg.end)
  })
}
