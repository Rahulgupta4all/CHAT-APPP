const socket = io()

const handleFormSubmit = (e) => {
    e.preventDefault()
    document.getElementById("formButton").disabled = true
    socket.emit("messageSubmitted", e.target.txt_userMsg.value, acknowledgeFunction)
}

const msgTemplate = document.getElementById("msg-template").innerHTML
const msgDiv = document.getElementById("chat-messages")
const linkTemplate = document.getElementById("link-template").innerHTML
const leftPanelTemplate = document.getElementById("left-panel-template").innerHTML

const autoScrollDownWindow = () => {
    const $newReceivedMessage = msgDiv.lastElementChild

    const newMessageStyles = getComputedStyle($newReceivedMessage)
    const newMessageBottomMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newReceivedMessage.offsetHeight + newMessageBottomMargin

    const visibleHeight = msgDiv.offsetHeight

    const containerHeight = msgDiv.scrollHeight

    const scrollOffset = msgDiv.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        msgDiv.scrollTop = msgDiv.scrollHeight
    }
}

const { username, chatroom } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('updateChatWindow', (messageFromServer) => {
    const template = Mustache.render(msgTemplate, {
        messageFromServer: messageFromServer.body,
        timestamp: moment(messageFromServer.timestamp).format('hh:mm a'),
        username: messageFromServer.username
    })
    msgDiv.insertAdjacentHTML('beforeend', template)
    autoScrollDownWindow()
})


socket.on('leftPanelUserData', ({ chatroom, users }) => {
    const template = Mustache.render(leftPanelTemplate, {
        chatroom,
        users
    })
    document.getElementById('left-user-panel').innerHTML = template
})

socket.on('updateChatWindowWithLink', (linkFromServer) => {
    const template = Mustache.render(linkTemplate, {
        linkFromServer,
        msg: "User location on google map"
    })
    msgDiv.insertAdjacentHTML('beforeend', template)
    autoScrollDownWindow()
})

const userLocation = () => {
    if (!navigator.geolocation) {
        return alert("Geo location feature not supported by your browser")
    }

    navigator.geolocation.getCurrentPosition((location) => {
        socket.emit('userLocation', {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        }, acknowledgeFunction)
    })
}

const acknowledgeFunction = (msg) => {
    msg && console.log(msg)
    document.getElementById("formButton").disabled = false
    document.getElementById("txt_userMsg").value = ""
    document.getElementById("txt_userMsg").focus()
}
userLocation()

socket.emit('joinChatroom', { username, chatroom }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})