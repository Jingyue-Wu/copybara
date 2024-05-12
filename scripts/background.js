let screenshotUri = null
let result = null
let currentCopiedText = null
activated = false

chrome.commands.onCommand.addListener((command) => {
  if (command == "activate-copy" && activated == false) {
    messageContentScript("message", "shortcutGetCoordinates")
    activated = true
  }
})

// Initialize clipboard
// store("cb", { data: [] })

load("cb").then(function () {
  if (currentCb == undefined) {
    store("cb", currentCb)
    console.log("new client")
  }
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (
    message.from == "content" &&
    message.data != "done" &&
    message.data != "getScreen"
  ) {
    console.log("cropped uri recieved:")
    console.log(message.data)

    screenshotUri = message.data
    ;(async function () {
      currentCopiedText = await getText(screenshotUri)
      console.log("text: ", currentCopiedText)
      messageContentScript("text", currentCopiedText)

      if (currentCopiedText != "") {
        updateStorage(currentCopiedText)
      }
    })()
  } else if (message.from == "content" && message.data == "getScreen") {
    let capture = chrome.tabs.captureVisibleTab({ format: "png" })
    capture.then((uri) => {
      console.log("URI:", uri)

      messageContentScript("uri", uri)
    })
  }

  sendResponse({
    from: "background",
    message: "sent successfully to background",
  })
})

async function getText(imageBase64) {
  const apiKey = "K83669950088957"
  const url =
    "https://api.ocr.space/parse/image?language=eng&OCREngine=2&isOverlayRequired=false&scale=true"

  let myHeaders = new Headers()
  myHeaders.append("apikey", apiKey)

  let formdata = new FormData()
  formdata.append("base64image", imageBase64)
  formdata.append("scale", "true")

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  }

  activated = false

  try {
    const response = await fetch(url, requestOptions)
    const result = await response.text()
    const text = JSON.parse(result).ParsedResults[0].ParsedText
    console.log(result)
    return text
  } catch (error) {
    console.log("error", error)
    return {}
  }
}

function messageContentScript(key, message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { from: "background", [key]: message },
      function (response) {
        console.log("sent message to content script", response)
        messageSent = false
      }
    )
  })
}

function messageOtherScript(message) {
  chrome.runtime.sendMessage({ from: "background", data: message })
}

// browser storage

let currentCb = null

function store(key, value) {
  chrome.storage.sync.set({ [key]: value })
}

async function load(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function (response) {
      console.log(response)
      if (response[key] != undefined) {
        currentCb = response[key]
        resolve(response[key])
      } else {
        reject()
      }
    })
  })
}

function updateStorage(newValue) {
  load("cb").then(function () {
    currentCb.data.push(newValue)
    store("cb", currentCb)
  })
}

// setInterval(() => {
//   console.log(currentCb)
//   load("cb")
// }, 500)
