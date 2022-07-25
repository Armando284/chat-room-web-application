// const PASSWORD = "MyPassword"

// import { io } from "./node_modules/socket.io-client"
const newMessageForm = document.getElementById('message-form')
const message = document.getElementById('message')
const messagesList = document.getElementById('messages-list')
const userIdEl = document.getElementById('user-id')

const privateRoomForm = document.getElementById('room-form')
const room = document.getElementById('room')

const roomSelector = document.getElementById('room-select')
let selectedRoom = 'Public'
roomSelector.addEventListener('change', () => {
    selectedRoom = roomSelector.value
    messagesList.innerHTML = ''
    messages[selectedRoom].forEach(message => {
        showMessage(message.id, message.message, true)
    })
})

const socket = io('https://anonymous-chat-room-server.herokuapp.com')
// const socket = io('http://localhost:3000')

let userId = ''

const messages = { 'Public': [] }

// wait for the connection to be done in order to have an id
socket.on('connect', () => {
    userId = socket.id?.slice(0, 4)
    console.log("🚀 ~ file: app.js ~ line 10 ~ userId", userId)
    userIdEl.innerText = `Apareces como: ${userId}`
    console.clear()
})

socket.on('message', data => {
    console.log("🚀 ~ file: app.js ~ line 30 ~ data", data)
    // const decrypted = CryptoJS.AES.decrypt(data.message, PASSWORD)
    // const message = decrypted.toString()
    if (!messages[data.room]) return
    messages[data.room].push({ id: data.id, messageId: data.messageId, message: data.message })
    if (selectedRoom === data.room) {
        showMessage(data.id, data.message)
    }
})

newMessageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = message.value
    if (isJsInjection(text)) {
        alert('Tu texto incluye caracteres prohibidos')
        newMessageForm.reset()
        return
    }
    switch (text) {
        case '/creator':
            nameCreator()
            newMessageForm.reset()
            return
        case '/help':
            help()
            newMessageForm.reset()
            return
        default:

            break;
    }
    const textId = 0
    const sended = showMessage(userId, text)
    // Todo add end to end encryption
    // const encrypted = CryptoJS.AES.encrypt(text, PASSWORD)
    socket.emit('message', { messageId: textId, message: text }, selectedRoom, done => {
        if (done === 'sended') {
            sended.classList.remove('sending')
            sended.innerHTML = `&#10003`
        }
    })
    newMessageForm.reset()
    if (!messages[selectedRoom]) return
    messages[selectedRoom].push({ id: userId, messageId: textId, message: text })

})

privateRoomForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (isJsInjection(room.value)) {
        alert('Tu texto incluye caracteres prohibidos')
        privateRoomForm.reset()
        return
    }
    socket.emit('join-room', room.value, message => {
        messages[room.value] = []
        const option = document.createElement('option')
        option.value = room.value
        option.innerText = room.value
        Array.from(roomSelector.children).forEach(childOption => {
            if (childOption.selected) childOption.selected = false
        })
        option.selected = true
        roomSelector.append(option)
        selectedRoom = room.value
        messagesList.innerHTML = ''
        showRoomMessage(message)
        privateRoomForm.reset()
    })
})

function isJsInjection(message) {
    if (message.includes('<') || message.includes('>')) return true
    return false
}

function showMessage(_id, _message, _isOld = false) {
    if (!_id || !_message) return
    const isMyMessage = _id === userId
    const li = document.createElement('li')
    li.classList.add('message', 'alert', 'row')
    li.classList.add(isMyMessage ? 'alert-success' : 'alert-primary')
    const text = document.createElement('div')
    text.classList.add('col-11')
    text.innerHTML = _message
    li.append(text)
    let sended
    if (isMyMessage) {
        sended = document.createElement('div')
        sended.classList.add('col-1', 'confirmation', 'sending')
        if (_isOld) {
            sended.classList.remove('sending')
            sended.innerHTML = `&#10003`
        }
        sended.setAttribute('name', 'confirmation')
        li.append(sended)
    }
    messagesList.append(li)
    return sended
}

function showRoomMessage(_room) {
    if (!_room) return
    const li = document.createElement('li')
    li.classList.add('message', 'alert', 'alert-dark')
    li.innerHTML = _room
    messagesList.append(li)
}

function nameCreator() {
    const li = document.createElement('li')
    li.classList.add('message', 'alert', 'alert-danger')
    li.innerHTML = `<strong><i>App creator is:</i></strong> Armando J. Peña Tamayo`
    messagesList.append(li)
}

function help() {
    const li = document.createElement('li')
    li.classList.add('message', 'alert', 'alert-warning')
    li.innerHTML = `<strong><i>Current functions are:</i></strong> /creator : Shows the creator of this app's name`
    messagesList.append(li)
}