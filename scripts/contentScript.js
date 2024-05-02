console.log("CONTENT SCRIPT")

// document.body.style.backgroundColor = "blue"
// document.body.classList.add("ch")

document.querySelectorAll("p").forEach(function (p) {
  p.classList.add("hi")
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("message recieved:")
  console.log(request.message)

  cursorPos = null

  if (request.message == "getCoordinates") {
    getCursor((cursorPos) => {
      sendResponse({ msg: cursorPos })
      console.log("sent response back")
    })
  }

  // if (cursorPos != null) {
  //   sendResponse({ msg: cursorPos })
  //   console.log("sent response back")
  // }

  // setTimeout(() => {
  //   sendResponse({ msg: "sussy" })
  //   console.log("sent response back")
  // }, 5000)

  return true
})

function getCursor(sendResponse) {
  document.body.classList.add("crosshair")

  activated = false
  point1 = []
  point2 = []
  mouseX = null
  mouseY = null

  // setInterval(() => {
  //   console.log(mouseX, mouseY)
  //   console.log(point1)
  //   console.log(point2)
  // }, 100)

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

      cursorPos = {
        start: point1,
        end: point2,
      }

      sendResponse(cursorPos)
      document.removeEventListener("mousemove", mouseMove)
      document.removeEventListener("mousedown", mouseDown)
      document.removeEventListener("mouseup", mouseUp)
    }
  }

  document.addEventListener("mousemove", mouseMove)
  document.addEventListener("mousedown", mouseDown)
  document.addEventListener("mouseup", mouseUp)
}

function messagePopup(cursorPos) {
  sendResponse({ msg: cursorPos })
  console.log("sent response back")
}
