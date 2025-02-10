document.addEventListener("DOMContentLoaded", async function () {
  const chatItemsContainer = document.getElementById("chat-items");
  const chatWrapper = document.getElementById("chat_wrapper");
  const chatNav = document.getElementById("chat-nav");
  const chatMessages = document.getElementById("chat-messages");
  const welcomeMessage = document.getElementById("welcome_msg");
  const messageInput = document.getElementById("message-input");
  const leftPanel = document.getElementById("left_pannel");
  const rightPanel = document.getElementById("right_pannel");
  const micIcon = document.getElementById("mic-icon");
  const sendIcon = document.getElementById("send-icon");
  const backIcon = document.getElementById("back-icon");
  let chatData = [];

  // Fetch chat data
  try {
    const response = await fetch("chatData.json");
    chatData = await response.json();
  } catch (error) {
    console.error("Failed to load chat data:", error);
  }

  backIcon.addEventListener("click", () => {
    rightPanel.style.display = "none";
    leftPanel.style.display = "block"; // Change from 'flex' to 'block' for consistency
  });

  // Dynamically generate chat items
  chatData.forEach((chat) => {
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-item");
    chatItem.innerHTML = `
            <div class="avatar">
                <img src="${chat.avatar}" onerror="this.onerror=null; this.src='images/noProfilePhoto.png'; " alt="${chat.name} " />
            </div>
            <div class="details">
                <p class="name">${chat.name}</p>
                <p class="last-message">${
                  chat.messages[chat.messages.length - 1].text
                }</p>
            </div>
        `;

    chatItemsContainer.appendChild(chatItem);

    // Click event for chat item
    chatItem.addEventListener("click", function () {
      document
        .querySelectorAll(".chat-item")
        .forEach((item) => item.classList.remove("active"));
      chatItem.classList.add("active");

      chatNav.querySelector(".avatar").innerHTML = `
        <img src="${chat.avatar}" onerror="this.onerror=null; this.src='images/noProfilePhoto.png'; " alt="${chat.name}" />
      `;

      chatNav.querySelector("h3").textContent = chat.name;

      // Display messages
      chatMessages.innerHTML = chat.messages
        .map(
          (msg) => `
                    <p class="${msg.sender === "You" ? "sent" : "received"}">
                        <strong>${msg.sender}</strong>
                        <span>${msg.text}</span>
                        <small>${msg.time}</small>
                    </p>
                `
        )
        .join("");

      // Scroll to the latest message
      chatMessages.scrollTop = chatMessages.scrollHeight;

      chatWrapper.style.display = "flex";
      if (welcomeMessage) welcomeMessage.style.display = "none";

      // Show right panel & hide left panel on mobile
      if (window.innerWidth <= 600) {
        leftPanel.style.display = "none";
        rightPanel.style.display = "flex";
        history.pushState({ chatOpen: true }, "", "#chat");
      }
    });
  });

  // Function to toggle between mic and send button
  function toggleIcons() {
    if (messageInput.value.trim().length > 0) {
      micIcon.style.display = "none";
      sendIcon.style.display = "inline-block";
    } else {
      micIcon.style.display = "inline-block";
      sendIcon.style.display = "none";
    }
  }

  // Event listener for input change
  messageInput.addEventListener("input", toggleIcons);

  // Function to send a message
  function sendMessage() {
    const message = messageInput.value.trim();

    if (message) {
      const contactName = chatNav.querySelector("h3").textContent;
      const currentChat = chatData.find((chat) => chat.name === contactName);

      if (currentChat) {
        const time = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const newMessage = { sender: "You", text: message, time };

        currentChat.messages.push(newMessage);

        const newMessageElement = document.createElement("p");
        newMessageElement.classList.add("sent");
        newMessageElement.innerHTML = `<strong>You</strong> <span>${message}</span> <small>${time}</small>`;
        chatMessages.appendChild(newMessageElement);

        messageInput.value = ""; // Clear input
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom

        toggleIcons(); // Reset icons after sending message

        // Update last message in chat list
        const chatItem = [...chatItemsContainer.children].find(
          (item) => item.querySelector(".name").textContent === contactName
        );
        if (chatItem) {
          chatItem.querySelector(".last-message").textContent = message;
        }
      }
    }
  }

  // Send message on clicking send button
  sendIcon.addEventListener("click", sendMessage);

  // Send message on pressing Enter
  messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  // Handle back navigation on mobile
  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.chatOpen) {
      rightPanel.style.display = "none";
      leftPanel.style.display = "block";
      history.replaceState(null, "", "#");
    }
  });
});
