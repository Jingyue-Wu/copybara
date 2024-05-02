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
  document.body.classList.add("crosshair")

  activated = false
  point1 = []
  point2 = []
  mouseX = null
  mouseY = null

  const mouseMove = (event) => {
    mouseX = event.clientX
    mouseY = event.clientY
  }

  const mouseDown = () => {
    if (!activated) {
      point1 = [mouseX, mouseY]
      activated = true
    }
  }

  const mouseUp = () => {
    if (activated) {
      point2 = [mouseX, mouseY]
      document.body.classList.remove("crosshair")

      data = {
        start: point1,
        end: point2,
        width: window.innerWidth,
        height: window.innerHeight,
      }

      sendResponse(data)

      document.removeEventListener("mousemove", mouseMove)
      document.removeEventListener("mousedown", mouseDown)
      document.removeEventListener("mouseup", mouseUp)
    }
  }
  document.addEventListener("mousemove", mouseMove)
  document.addEventListener("mousedown", mouseDown)
  document.addEventListener("mouseup", mouseUp)
}
