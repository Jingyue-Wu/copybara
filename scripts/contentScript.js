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

  // Receive activate comand via shortcut
  else if (
    request.from == "background" &&
    request.message == "shortcutGetCoordinates"
  ) {
    console.log("test")
    getCursor()
  }

  // Receive uri from background
  else if (request.from == "background" && request.uri != undefined) {
    console.log(request.uri)
    screenshotUri = request.uri
  }

  // Receive OCR text from background
  else if (request.from == "background") {
    console.log("RECIEVED OCR TEXT")
    writeToClipboard(request.text)
  }

  sendResponse({ message: "sent successfully to content script" })
})

function getCursor() {
  let windowWidth = window.innerWidth / window.devicePixelRatio
  let windowHeight = window.innerHeight / window.devicePixelRatio

  setInterval(() => {
    console.log(canvas.width, canvas.height, window.devicePixelRatio)
  }, 1000)

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  updateCanvasSize()
  window.addEventListener("resize", updateCanvasSize)

  function updateCanvasSize() {
    windowWidth = window.innerWidth / window.devicePixelRatio
    windowHeight = window.innerHeight / window.devicePixelRatio
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

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
  boxX = null
  boxY = null

  let startX
  let startY

  let boxStartX
  let boxStartY

  const mouseMove = (event) => {
    event.preventDefault()
    event.stopPropagation()

    boxX = event.clientX
    boxY = event.clientY

    mouseX = event.clientX * window.devicePixelRatio
    mouseY = event.clientY * window.devicePixelRatio

    let rectWidth = boxX - boxStartX
    let rectHeight = boxY - boxStartY

    if (activated) {
      context.clearRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = "rgba(0, 0, 0, 0.15)"
      context.fillRect(boxStartX, boxStartY, rectWidth, rectHeight)
    }
  }

  const mouseDown = (event) => {
    getScreen()

    boxStartX = event.clientX
    boxStartY = event.clientY

    startX = event.clientX * window.devicePixelRatio
    startY = event.clientY * window.devicePixelRatio

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
        width: canvas.width,
        height: canvas.height,
      }

      canvas.removeEventListener("mousemove", mouseMove)
      canvas.removeEventListener("mousedown", mouseDown)
      canvas.removeEventListener("mouseup", mouseUp)

      document.documentElement.removeChild(canvas)

      console.log("sending message to background...")

      crop(screenshotUri, data)

      document.body.style.cursor = 'wait';
    }
  }

  canvas.addEventListener("mousemove", mouseMove)
  canvas.addEventListener("mousedown", mouseDown)
  canvas.addEventListener("mouseup", mouseUp)
}

function messageOtherScript(message) {
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

    context.filter = "brightness(0.9) contrast(1.5)"

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

    messageOtherScript(baseUrl)
  }
}

function getScreen() {
  chrome.runtime.sendMessage({ from: "content", data: "getScreen" })
}

async function writeToClipboard(text) {
  messageOtherScript("done")

  try {
    await navigator.clipboard.writeText(text)
    console.log("writing to clipboard", text)
    document.body.style.cursor = 'default';
  } catch (error) {
    console.log("Error writing to clipboard: " + error.message)
  }
}
