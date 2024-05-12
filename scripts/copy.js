activated = false
let currentList = null

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

load("cb")

function updateListItems(content) {
  const list = document.getElementById("clipboard")
  list.replaceChildren()

  content.forEach((value) => {
    const listItem = document.createElement("div")
    listItem.classList.add("listItem")

    const text = document.createElement("h3")

    if (value.length > 60) {
      value = value.substring(0, 60)
      value = value + "..."
    }

    text.textContent = value
    listItem.appendChild(text)

    const button = document.createElement("button")
    button.classList.add("whiteButton")
    button.innerText = "Copy"
    listItem.appendChild(button)

    list.appendChild(listItem)
  })
}

function store(key, value) {
  chrome.storage.sync.set({ [key]: value })
}

async function load(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function (response) {
      console.log(response)
      if (response[key] != undefined) {
        currentList = response.cb.data
        console.log(currentList)

        updateListItems(currentList)

        resolve(response[key])
      } else {
        reject()
      }
    })
  })
}

function updateStorage(newValue) {
  load("cb").then(function () {
    currentList.push(newValue)
    updateListItems(currentList)
    store("cb", { data: currentList })
  })
}

document.addEventListener("DOMContentLoaded", clearList, false)

function clearList() {
  document.getElementById("clearButton").addEventListener("click", () => {
    console.log("button clicked")
    store("cb", { data: [] })
    load("cb")

    const list = document.getElementById("clipboard")
    list.replaceChildren()
  })
}

let saveForm = document.getElementById("saveForm")

saveForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const input = document.getElementById("saveInput").value
  updateStorage(input)
})
