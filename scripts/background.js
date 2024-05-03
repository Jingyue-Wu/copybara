chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("message recieved:")
  console.log(message.data)

  store("screenshot", message.data)

  sendResponse({ message: "response from background" })
})

function store(key, value) {
  chrome.storage.session.set({ [key]: value })
}

async function load(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get([key], function (response) {
      console.log(response)
      // document.getElementById("test").innerHTML = response[key]
      if (response[key] != undefined) {
        resolve(response[key])
      } else {
        reject()
      }
    })
  })
}
