console.log("CONTENT SCRIPT INJECTED")

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("message recieved:")
  console.log(request.message)

  cursorPos = null

  if (request.message == "getCoordinates") {
    getCursor((data) => {
      sendResponse({ msg: data })
      console.log("sent response back")
    })
  }

  return true
})

function getCursor(sendResponse) {
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
  // canvas.style.backgroundColor = "black"
  // canvas.style.opacity = "0.1"

  document.documentElement.appendChild(canvas)

  activated = false
  point1 = []
  point2 = []
  mouseX = null
  mouseY = null

  let startX
  let startY

  let prevStartX = 0
  let prevStartY = 0

  let prevWidth = 0
  let prevHeight = 0

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

      prevStartX = startX
      prevStartY = startY

      prevWidth = rectWidth
      prevHeight = rectHeight
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
      // messageBackground("content script message amogus")

      chrome.runtime.sendMessage({ data: "RAHHHHH" }, function (response) {
        console.log("Recieved response: ")
        console.log(response.message)
      })

      setTimeout(() => sendResponse(data), 10)
    }
  }

  canvas.addEventListener("mousemove", mouseMove)
  canvas.addEventListener("mousedown", mouseDown)
  canvas.addEventListener("mouseup", mouseUp)
}

function messageBackground(message) {
  console.log("Message sent to background")
  chrome.runtime.sendMessage({ message: message }, function (response) {
    console.log("Recieved response")

    console.log(response.message)
  })
}
