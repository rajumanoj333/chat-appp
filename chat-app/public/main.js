const socket = io()

const clientsTotal = document.getElementById('clients-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const messageTone = new Audio('/message-tone.mp3')

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total clients: ${data}`
})

function sendMessage() {
  if (messageInput.value === '') return
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  }
  socket.emit('message', data)
  addMessageToUI(true, data)
  messageInput.value = ''
}

socket.on('chat-message', (data) => {
  messageTone.play()
  addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
    clearFeedback();
    const messageBubble = document.createElement('div');
    messageBubble.className = `message-bubble ${isOwnMessage ? 'me' : 'them'}`;
    
    let messageStatusIcon = '';
    if (isOwnMessage) {
        messageStatusIcon = '<i class="fas fa-check"></i>';
    }

    messageBubble.innerHTML = `
        <div class="message-content">
            <p class="name">${isOwnMessage ? '' : data.name}</p>
            <p>${data.message}</p>
            <div class="message-meta">
                <span>${moment(data.dateTime).fromNow()}</span>
                ${messageStatusIcon}
            </div>
        </div>
    `;
    messageContainer.appendChild(messageBubble);
    scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})
messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  })
})

socket.on('feedback', (data) => {
  clearFeedback()
  if (data.feedback === '') {
    return;
  }
  const element = `
    <div class="message-bubble them" id="feedback">
        <div class="message-content">
            <p class="name">${data.feedback}</p>
        </div>
    </div>
  `
  messageContainer.innerHTML += element
})

function clearFeedback() {
  document.querySelectorAll('#feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}