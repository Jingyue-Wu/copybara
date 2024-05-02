// get screenshot of tab
// get coordinates of selected area
// crop the screenshot
// send to the ocr api
// return text and update into clipboard

// chrome.storage.local.set({ coordinates: {} })
// chrome.storage.local.get("coordinates", function (response) {
//   console.log(response)
//   document.getElementById("test").innerHTML = response.start[0]
// })

messageSent = false

const button = document.getElementById("button")
button.addEventListener("click", () => {
  if (!messageSent) {
    getCoordinates()
    messageSent = true
  }
  // getScreen()
})

// get uri of screenshot image
function getScreen(data) {
  let capture = chrome.tabs.captureVisibleTab()
  capture.then((uri) => onCaptured(uri, data), onError)
}

function onCaptured(uri, data) {
  const canvas = document.getElementById("can")
  const context = canvas.getContext("2d") //https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext

  // get coordinates of crop (message inejcted content script)
  document.getElementById("test").innerHTML = data.start[0]
  console.log(data)

  let image = new Image()
  image.src = uri

  image.onload = () => {
    // crop
    startX = Math.min(data.start[0], data.end[0])
    startY = Math.min(data.start[1], data.end[1])

    endX = Math.max(data.start[0], data.end[0])
    endY = Math.max(data.start[1], data.end[1])

    sWidth = endX - startX
    sHeight = endY - startY

    canvas.width = sWidth
    canvas.height = sHeight

    console.log(startX, startY, endX, endY, sWidth, sHeight)

    context.drawImage(
      image,
      startX,
      startY,
      sWidth,
      sHeight,
      0,
      0,
      sWidth,
      sHeight
    )
    document.getElementById("hi").innerHTML = canvas.toDataURL("image/jpeg")
    document.getElementById("bye").innerHTML = data.height + " " + data.width
  }
}

function onError(error) {
  console.log("There was an error capturing the screen")
  document.getElementById("hi").innerHTML = error
}

function getCoordinates() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    mousePos = messageContentScript(tabs[0].id, "getCoordinates")
  })
}

function messageContentScript(tabID, message) {
  console.log("Message sent to content script")
  chrome.tabs.sendMessage(tabID, { message: message }, function (response) {
    console.log("Recieved response")
    // document.getElementById("test").innerHTML = response.msg.start[0]
    console.log(response.msg.start, response.msg.end)

    getScreen(response.msg)
    messageSent = false
  })
}

async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.log("Error writing to clipboard: " + error.message)
  }
}
