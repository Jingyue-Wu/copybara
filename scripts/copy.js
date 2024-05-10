activated = false

const button = document.getElementById("button")
button.addEventListener("click", activateExtension)

function activateExtension() {
  if (!activated) {
    getScreen()
    messageContentScript("message", "getCoordinates")
    activated = true
  }
}

function messageContentScript(key, message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { from: "popup", [key]: message },
      function (response) {
        console.log("sent message to content script", response)
      }
    )
  })
  console.log("sending to content script")
}

// get uri of screenshot image
function getScreen() {
  let capture = chrome.tabs.captureVisibleTab({ format: "png" })
  capture.then((uri) => {
    console.log("URI:", uri)
    messageContentScript("message", uri)
  })
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.from == "content" && request.data == "done") {
    console.log("message recieved: done")
    activated = false
  } else if (request.from == "background" && request.data == "shortcut") {
    activateExtension()
  }

  sendResponse({ message: "sent successfully to popup" })
})
