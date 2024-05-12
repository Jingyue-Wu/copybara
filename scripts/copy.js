activated = false

const button = document.getElementById("copyButton")
button.addEventListener("click", activateExtension)

function activateExtension() {
  if (!activated) {
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.from == "content" && request.data == "done") {
    console.log("message recieved: done")
    activated = false
  } else if (request.from == "background" && request.data == "shortcut") {
    activateExtension()
  }
  sendResponse({ message: "sent successfully to popup" })
})
