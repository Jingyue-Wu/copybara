let screenshotUri = null
let result = null
let currentCopiedText = null

chrome.commands.onCommand.addListener((command) => {
  if (command == "activate-copy") {
    messageOtherScript("shortcut")
    console.log("amogus")
  }
})

// chrome.commands.onCommand.addListener(function (command) {
//   switch (command) {
//     case "activate-copy":
//       messageOtherScript("shortcut")
//       console.log("amogus")
//       break
//     default:
//       console.log(`Command ${command} not found`)
//   }
// })

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.from == "content" && message.data != "done") {
    console.log("cropped uri recieved:")
    console.log(message.data)

    screenshotUri = message.data
    ;(async function () {
      currentCopiedText = await getText(screenshotUri)
      console.log("text: ", currentCopiedText)
      messageContentScript("text", currentCopiedText)
    })()
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
  // console.log("Message sent to background")
  chrome.runtime.sendMessage({ from: "background", data: message })
}
