console.log("CONTENT SCRIPT INJECTED")

let screenshotUri = null

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  cursorPos = null

  // Receive command to activate area selection with cursor from popup
  if (request.from == "popup" && request.message == "getCoordinates") {
    console.log("message recieved:")
    console.log(request.message)
    getCursor()
  }

  // Receive full viewport screenshot from popup
  else if (request.from == "popup") {
    console.log("uri recieved:")
    console.log(request.message)
    screenshotUri = request.message
  }

  // Receive OCR text from background
  else if (request.from == "background") {
    writeToClipboard(request.text)
  }

  sendResponse({ message: "sent successfully to content script" })
})

function getCursor() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  setInterval(() => {
    console.log(windowWidth, windowHeight)
  }, 1000)

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d") // returns drawing context on canvas
  context.canvas.width = windowWidth
  context.canvas.height = windowHeight

  canvas.classList.add("crosshair")

  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.margin = "0"
  canvas.style.border = "0"
  canvas.style.padding = "0"
  canvas.style.outline = "none"
  canvas.style.position = "fixed"
  canvas.style.zIndex = "2147483647"

  document.documentElement.appendChild(canvas)

  activated = false
  point1 = []
  point2 = []
  mouseX = null
  mouseY = null

  let startX
  let startY

  const mouseMove = (event) => {
    event.preventDefault()
    event.stopPropagation()

    mouseX = event.clientX
    mouseY = event.clientY

    let rectWidth = mouseX - startX
    let rectHeight = mouseY - startY

    if (activated) {
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = "rgba(0, 0, 0, 0.15)"
      context.fillRect(startX, startY, rectWidth, rectHeight)
    }
  }

  const mouseDown = (event) => {
    startX = event.clientX
    startY = event.clientY

    if (!activated) {
      point1 = [mouseX, mouseY]
      activated = true
    }
  }

  const mouseUp = () => {
    if (activated) {
      point2 = [mouseX, mouseY]

      data = {
        start: point1,
        end: point2,
        width: windowWidth,
        height: windowHeight,
      }

      canvas.removeEventListener("mousemove", mouseMove)
      canvas.removeEventListener("mousedown", mouseDown)
      canvas.removeEventListener("mouseup", mouseUp)

      document.documentElement.removeChild(canvas)

      console.log("sending message to background...")

      crop(screenshotUri, data)
    }
  }

  canvas.addEventListener("mousemove", mouseMove)
  canvas.addEventListener("mousedown", mouseDown)
  canvas.addEventListener("mouseup", mouseUp)
}

function messageBackground(message) {
  // console.log("Message sent to background")
  chrome.runtime.sendMessage(
    { from: "content", data: message },
    function (response) {
      console.log(response.message)
    }
  )
}

function crop(uri, data) {
  const screenshotCanvas = document.createElement("canvas")
  const context = screenshotCanvas.getContext("2d")

  // get coordinates of crop

  console.log(data)

  let image = new Image()
  image.src = uri

  image.onload = () => {
    startX = Math.min(data.start[0], data.end[0])
    startY = Math.min(data.start[1], data.end[1])

    endX = Math.max(data.start[0], data.end[0])
    endY = Math.max(data.start[1], data.end[1])

    sWidth = endX - startX
    sHeight = endY - startY

    screenshotCanvas.width = sWidth
    screenshotCanvas.height = sHeight

    // console.log(startX, startY, endX, endY, sWidth, sHeight)

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

    let baseUrl = screenshotCanvas.toDataURL("image/jpeg")
    console.log("CROPPED SUCCESSFULLY: ")
    console.log(baseUrl)

    messageBackground(baseUrl)
  }
}

async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log("writing to clipboard", text)
  } catch (error) {
    console.log("Error writing to clipboard: " + error.message)
  }
}
