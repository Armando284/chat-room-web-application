// import { io } from "./node_modules/socket.io-client"

const newMessageForm = document.getElementById('message-form')
const message = document.getElementById('message')
const messagesList = document.getElementById('messages-list')
const userIdEl = document.getElementById('user-id')

const privateRoomForm = document.getElementById('room-form')
const room = document.getElementById('room')

const socket = io('ws://chat-room-server.vercel.app')
let userId = ''

// wait for the connection to be done in order to have an id
socket.on('connect', () => {
    userId = socket.id?.slice(0, 4)
    console.log("🚀 ~ file: app.js ~ line 10 ~ userId", userId)
    userIdEl.innerText = `User ID: ${userId}`
})

socket.on('message', data => {
    showMessage(data.id, data.message)
})

newMessageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const text = message.value
    if (text === '/creator') {
        nameCreator()
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
            showMessage(userId, text)
            break;
    }

    // Todo add end to end encryption
    socket.emit('message', text, room.value)
    newMessageForm.reset()
})

privateRoomForm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('join-room', room.value, message => {
        showRoomMessage(message)
    })
    privateRoomForm.reset()
})

function showMessage(_id, _message) {
    if (!_id || !_message) return
    const li = document.createElement('li')
    li.classList.add('message', 'alert')
    li.classList.add(_id === userId ? 'alert-success' : 'alert-primary')
    li.innerHTML = _message
    messagesList.append(li)
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