messageSent = false

const button = document.getElementById("button")
button.addEventListener("click", () => {
  if (!messageSent) {
    getScreen()
    messageContentScript("message", "getCoordinates")
    messageSent = true
  }
})

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
    messageSent = false
  })
}

// function messageBackground(message) {
//   console.log("sending to background")
//   chrome.runtime.sendMessage(
//     { from: "popup", data: message },
//     function (response) {
//       console.log("sent message to background", response)
//       messageSent = false
//     }
//   )
// }