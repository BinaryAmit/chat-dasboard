document.addEventListener("DOMContentLoaded", async function () {
  const chatItemsContainer = document.getElementById("chat-items");
  const chatWrapper = document.getElementById("chat_wrapper");
  const chatNav = document.getElementById("chat-nav");
  const chatMessages = document.getElementById("chat-messages");
  const welcomeMessage = document.getElementById("welcome_msg");
  const messageInput = document.getElementById("message-input");
  const messageBar = document.getElementById("message-bar");
  const leftPanel = document.getElementById("left_pannel");
  const resizer = document.querySelector(".resizer");
  const container = document.getElementById("wrapper");
  const rightPanel = document.getElementById("right_pannel");
  const micIcon = document.getElementById("mic-icon");
  const sendIcon = document.getElementById("send-icon");
  const backIcon = document.getElementById("back-icon");
  const NoContact = document.getElementById("no-chats");
  const wrapper = document.getElementById("wrapper");

  // Message input handling
  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + "px";
  });

  // Chat data loading
  let chatData = [];
  try {
    const response = await fetch("chatData.json");
    chatData = await response.json();
  } catch (error) {
    wrapper.style.display = "none";
    NoContact.style.display = "flex";
    console.error("Failed to load chat data:", error);
  }

  // Resizer functionality
  let isResizing = false;
  resizer.addEventListener("mousedown", () => {
    isResizing = true;
    leftPanel.classList.add("no-transition");
    rightPanel.classList.add("no-transition");
    document.body.style.cursor = "ew-resize";

    const handleMouseMove = (event) => {
      if (!isResizing) return;
      let containerRect = container.getBoundingClientRect();
      let leftWidth = event.clientX - containerRect.left;
      if (leftWidth < 100 || leftWidth > containerRect.width - 100) return;
      let leftPercent = (leftWidth / containerRect.width) * 100;
      let rightPercent = 100 - leftPercent;
      leftPanel.style.width = `${leftPercent}vw`;
      rightPanel.style.width = `${rightPercent}vw`;
    };

    const stopResizing = () => {
      isResizing = false;
      document.body.style.cursor = "default";
      leftPanel.classList.remove("no-transition");
      rightPanel.classList.remove("no-transition");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  });

  // Mobile detection
  function isMobile() {
    return window.innerWidth <= 600;
  }

  // Keyboard handling
  // Enhanced keyboard handling function
  function adjustForKeyboard() {
    if (window.visualViewport.height < window.innerHeight) {
      // Keyboard is open
      const keyboardHeight = window.innerHeight - window.visualViewport.height;

      // Adjust message bar position
      messageBar.style.position = "absolute";
      messageBar.style.bottom = `${keyboardHeight}px`;

      // Adjust chat messages container
      chatMessages.style.paddingBottom = `${
        keyboardHeight + messageBar.offsetHeight
      }px`;
      chatMessages.style.marginBottom = `calc(100vh - ${
        keyboardHeight + messageBar.offsetHeight
      }px)`;

      // Ensure last message is visible
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Prevent viewport resize
      window.addEventListener("resize", handleResize);
    } else {
      // Keyboard is closed
      messageBar.style.position = "";
      messageBar.style.bottom = "";
      chatMessages.style.paddingBottom = "";
      chatMessages.style.marginBottom = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Cleanup resize handler
      window.removeEventListener("resize", handleResize);
    }
  }

  // Handle viewport resize
  function handleResize() {
    window.scrollTo(0, 0);
  }
  // Back button handling
  if (backIcon) {
    backIcon.addEventListener("click", () => {
      document.querySelectorAll(".chat-item").forEach((item) => {
        item.classList.remove("active");
      });
      if (isMobile()) {
        messageInput.blur();
        rightPanel.classList.remove("active");
        setTimeout(() => {
          rightPanel.style.display = "none";
        }, 300);
      }
    });
  }

  // Chat items generation
  chatData.forEach((chat) => {
    const chatItem = document.createElement("div");
    chatItem.classList.add("chat-item");
    chatItem.innerHTML = `
            <div class="avatar">
                <img src="${
                  chat.avatar
                }" onerror="this.onerror=null; this.src='images/noProfilePhoto.png';" alt="${
      chat.name
    }" />
            </div>
            <div class="details">
                <p class="name">${chat.name}</p>
                <p class="last-message">${
                  chat.messages[chat.messages.length - 1].text
                }</p>
            </div>
            <small>${chat.messages[chat.messages.length - 1].time}</small>
        `;
    chatItemsContainer.appendChild(chatItem);

    chatItem.addEventListener("click", function (event) {
      document
        .querySelectorAll(".chat-item")
        .forEach((item) => item.classList.remove("active"));
      chatItem.classList.add("active");

      // Add Ripple Effect
      const rect = chatItem.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add("ripple");

      // Prevent multiple ripples stacking
      chatItem.querySelectorAll(".ripple").forEach((r) => r.remove());
      chatItem.appendChild(ripple);

      setTimeout(() => ripple.remove(), 400);

      chatNav.querySelector(".avatar").innerHTML = `
                <img src="${chat.avatar}" onerror="this.onerror=null; this.src='images/noProfilePhoto.png';" alt="${chat.name}" />
            `;
      chatNav.querySelector("h3").textContent = chat.name;

      chatMessages.innerHTML = chat.messages
        .map(
          (msg) => `
                    <div class="${msg.sender === "You" ? "sent" : "received"}">
                        <strong>${msg.sender}</strong>
                        <p><span>${msg.text}</span>
                        <small>${msg.time}</small></p>
                    </div>
                `
        )
        .join("");

      chatWrapper.style.display = "flex";
      chatMessages.scrollTop = chatMessages.scrollHeight;
      if (welcomeMessage) welcomeMessage.style.display = "none";

      if (isMobile()) {
        rightPanel.style.display = "block";
        setTimeout(() => {
          rightPanel.classList.add("active");
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 10);
      }
    });
  });

  // Message input handling
  function toggleIcons() {
    if (messageInput.value.trim().length > 0) {
      micIcon.style.display = "none";
      sendIcon.style.display = "inline-block";
    } else {
      micIcon.style.display = "inline-block";
      sendIcon.style.display = "none";
    }
  }

  messageInput.addEventListener("input", toggleIcons);

  // Send message functionality
  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const contactName = chatNav.querySelector("h3").textContent;
    const currentChat = chatData.find((chat) => chat.name === contactName);

    if (currentChat) {
      const time = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const newMessage = { sender: "You", text: message, time };

      currentChat.messages.push(newMessage);
      const newMessageElement = document.createElement("div");
      newMessageElement.classList.add("sent");
      newMessageElement.innerHTML = `<strong>You</strong> <p><span>${message}</span> <small>${time}</small></p>`;
      chatMessages.appendChild(newMessageElement);

      messageInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
      messageInput.style.height = "auto";
      toggleIcons();

      if (isMobile()) {
        messageInput.focus(); // Maintain focus after send
        messageInput.style.height = "auto"; // Reset height
      }

      const chatItem = [...chatItemsContainer.children].find(
        (item) => item.querySelector(".name").textContent === contactName
      );
      if (chatItem) {
        const lastMessageElement = chatItem.querySelector(".last-message");
        lastMessageElement.textContent = message;

        // Add these 3 lines right after updating the text
        void lastMessageElement.offsetWidth; // Trigger reflow
        lastMessageElement.style.display = "none";
        lastMessageElement.style.display = "block";
      }
    }
  }

  sendIcon.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        return;
      }

      event.preventDefault();
      if (!isMobile()) {
        sendMessage();
      }
    }
  });

  // Event listeners for keyboard handling
  messageInput.addEventListener("focus", adjustForKeyboard);
  messageInput.addEventListener("blur", adjustForKeyboard);
  window.addEventListener("resize", adjustForKeyboard);
  sendIcon.addEventListener("mousedown", (e) => {
    if (isMobile()) {
      e.preventDefault();
    }
  });
});
