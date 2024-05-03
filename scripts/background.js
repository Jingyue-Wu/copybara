let screenshotUri = null

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.from == "content") {
    console.log("cropped uri recieved:")
    console.log(message.data)

    store("screenshot", message.data)

    screenshotUri = message.data
  }

  sendResponse({
    from: "background",
    message: "sent successfully to background",
  })
})

function store(key, value) {
  chrome.storage.session.set({ [key]: value })
}

async function load(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get([key], function (response) {
      console.log(response)
      if (response[key] != undefined) {
        resolve(response[key])
      } else {
        reject()
      }
    })
  })
}

// ----------------------------------------------------

async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.log("Error writing to clipboard: " + error.message)
  }
}
