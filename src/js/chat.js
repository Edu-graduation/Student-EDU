// ///////////////// // FIRST Version /////////////////
// import { supaClient } from "./app.js";
// import { getUserName } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const chatName = document.querySelector(".chat__name");
// const chats = document.querySelector(".chats");
// const collapseButton = document.querySelector(".collapse__chat-btn");
// const chatView = document.querySelector(".chat__view");
// const chatListContainer = document.querySelector(".chats__list");
// let currentChatId = null;
// let subscription = null;
// // Track messages we've already seen to prevent duplicates
// let processedMessageIds = new Set();
// // Cache for user names to reduce API calls
// const userNameCache = new Map();

// // Helper function to safely get user names with caching
// async function safeGetUserName(userId) {
//   if (!userId) {
//     return "Unknown User";
//   }

//   // Check cache first
//   if (userNameCache.has(userId)) {
//     return userNameCache.get(userId);
//   }

//   try {
//     const name = await getUserName(userId);
//     userNameCache.set(userId, name); // Cache the result
//     return name;
//   } catch (error) {
//     console.error(`Error getting username for ID ${userId}:`, error);
//     userNameCache.set(userId, "Unknown User"); // Cache the fallback
//     return "Unknown User";
//   }
// }

// function openChat() {
//   chats.classList.add("open");
//   chatView.classList.add("active");
// }

// function closeChat() {
//   chats.classList.remove("open");
//   chatView.classList.remove("active");
//   document.querySelectorAll(".chat__item").forEach((chat) => {
//     chat.classList.remove("active");
//   });
// }

// function attachChatClickListeners() {
//   document.querySelectorAll(".chat__item").forEach((chatItem) => {
//     chatItem.addEventListener("click", async (e) => {
//       // Close chat list and open chat view
//       if (
//         e.target.closest(".chat__item") &&
//         !e.target.closest(".chat__item").classList.contains("active")
//       ) {
//         document.querySelectorAll(".chat__item").forEach((item) => {
//           item.classList.remove("active");
//         });
//         e.target.closest(".chat__item").classList.add("active");
//         openChat();
//       }

//       const chatId = chatItem.getAttribute("data-chat-id");

//       // Don't reload if we're already on this chat
//       if (currentChatId === chatId) {
//         return;
//       }

//       // Unsubscribe from previous chat subscription if exists
//       if (subscription) {
//         subscription.unsubscribe();
//       }

//       currentChatId = chatId;
//       const chatNameText = chatItem.getAttribute("data-chat-name");

//       // Reset processed message IDs when changing chats
//       processedMessageIds = new Set();

//       // Show loading indicator
//       const messagesContainer = document.querySelector(
//         ".chat__messages-container"
//       );
//       messagesContainer.innerHTML =
//         '<div class="loading-messages loader"></div>';

//       // Load chat details
//       const chatDetails = await getChatDetails(chatId);

//       // Render chat details
//       renderChatDetails(chatDetails);

//       try {
//         // Load chat messages
//         const chatMessages = await retrieveChatMessages(chatId);

//         // Only render if this is still the current chat (user didn't switch while loading)
//         if (currentChatId === chatId) {
//           // Render chat messages
//           renderChatMessages(chatMessages, false); // false = no animation on initial load
//         }
//       } catch (error) {
//         console.error("Error loading messages:", error);
//         messagesContainer.innerHTML =
//           '<div class="error-messages">Error loading messages. Please try again.</div>';
//       }

//       // Set up real-time subscription for this chat
//       setupChatSubscription(chatId);

//       // Set up event listener for send button
//       setupSendMessageHandler(chatId);
//     });
//   });

//   collapseButton.addEventListener("click", closeChat);
// }

// function setupSendMessageHandler(chatId) {
//   const sendButton = document.querySelector(".send__message-btn");
//   const messageInput = document.querySelector(".message__input");

//   // First, remove any existing event listeners by cloning the elements
//   const newSendButton = sendButton.cloneNode(true);
//   sendButton.parentNode.replaceChild(newSendButton, sendButton);

//   const newMessageInput = messageInput.cloneNode(true);
//   messageInput.parentNode.replaceChild(newMessageInput, messageInput);

//   // Add event listener to the send button
//   newSendButton.addEventListener("click", async () => {
//     const messageContent = newMessageInput.value.trim();
//     if (messageContent) {
//       await sendMessage(chatId, messageContent);
//       newMessageInput.value = ""; // Clear input after sending
//       newMessageInput.focus(); // Keep focus on input for better UX
//     }
//   });

//   // Add event listener for Enter key
//   newMessageInput.addEventListener("keypress", async (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault(); // Prevent default to avoid form submission
//       const messageContent = newMessageInput.value.trim();
//       if (messageContent) {
//         await sendMessage(chatId, messageContent);
//         newMessageInput.value = ""; // Clear input after sending
//       }
//     }
//   });

//   // Focus the input field for immediate typing
//   newMessageInput.focus();
// }

// let isReconnecting = false;

// function setupChatSubscription(chatId) {
//   // Unsubscribe from any existing subscription first
//   if (subscription) {
//     subscription.unsubscribe();
//   }

//   // Create a more robust subscription with better error handling
//   try {
//     subscription = supaClient
//       .channel(`chat:${chatId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "message",
//           filter: `chat_id=eq.${chatId}`,
//         },
//         (payload) => {
//           // Only process if this is still the current chat
//           if (currentChatId === chatId) {
//             if (!processedMessageIds.has(payload.new.msg_id)) {
//               processedMessageIds.add(payload.new.msg_id);
//               addMessageToChat(payload.new);
//             }
//           }
//         }
//       )
//       .subscribe((status) => {
//         console.log("Subscription status:", status);
//         if (status === "SUBSCRIBED") {
//           console.log(`Successfully subscribed to chat ${chatId}`);
//           isReconnecting = false;
//         } else if (status === "CHANNEL_ERROR" && !isReconnecting) {
//           console.error(`Error subscribing to chat ${chatId}`);
//           isReconnecting = true;
//           // Try to resubscribe after a delay if there was an error
//           setTimeout(() => {
//             if (currentChatId === chatId) {
//               // Only reconnect if still on this chat
//               setupChatSubscription(chatId);
//             }
//           }, 3000);
//         }
//       });
//   } catch (error) {
//     console.error("Error setting up subscription:", error);
//     // Try to resubscribe after a delay
//     if (!isReconnecting) {
//       isReconnecting = true;
//       setTimeout(() => {
//         if (currentChatId === chatId) {
//           // Only reconnect if still on this chat
//           setupChatSubscription(chatId);
//           isReconnecting = false;
//         }
//       }, 3000);
//     }
//   }
// }

// async function addMessageToChat(message) {
//   // First check if we already have this message in the DOM
//   const existingMessage = document.querySelector(
//     `[data-message-id="${message.msg_id}"]`
//   );
//   if (existingMessage) {
//     return; // Skip if already exists
//   }

//   // Create the new message element
//   const messagesContainer = document.querySelector(".chat__messages-container");
//   const messageEl = document.createElement("div");
//   messageEl.setAttribute("data-message-id", message.msg_id);
//   messageEl.setAttribute(
//     "data-timestamp",
//     new Date(message.msg_date_time).getTime()
//   );

//   const messageSenderName = document.createElement("p");
//   const messageContent = document.createElement("p");
//   const messageTime = document.createElement("p");

//   messageSenderName.classList.add("message__sender-name");
//   messageContent.classList.add("message__content");
//   messageTime.classList.add("message__time");

//   messageContent.textContent = message.msg_content;
//   messageTime.textContent = formatDateTime(new Date(message.msg_date_time));

//   messageEl.appendChild(messageSenderName);
//   messageEl.appendChild(messageContent);
//   messageEl.appendChild(messageTime);

//   // Check if the message is from the current user
//   const isSentByCurrentUser = message.senderid === +studentId;
//   if (isSentByCurrentUser) {
//     messageEl.classList.add("sent");
//     messageSenderName.textContent = await safeGetUserName(studentId);
//   } else {
//     messageEl.classList.add("received");
//     messageSenderName.textContent = await safeGetUserName(message.senderid);
//   }

//   messageEl.classList.add("message");

//   // Find the proper position to insert this message chronologically
//   const timestamp = new Date(message.msg_date_time).getTime();
//   const allMessages = Array.from(
//     messagesContainer.querySelectorAll(".message[data-timestamp]")
//   );

//   // Sort by timestamp then by ID if available
//   let inserted = false;

//   for (let i = 0; i < allMessages.length; i++) {
//     const existingMsg = allMessages[i];
//     const existingTimestamp = parseInt(
//       existingMsg.getAttribute("data-timestamp"),
//       10
//     );

//     if (timestamp < existingTimestamp) {
//       messagesContainer.insertBefore(messageEl, existingMsg);
//       inserted = true;
//       break;
//     }

//     if (timestamp === existingTimestamp) {
//       // If timestamps are equal, check msg_id for ordering
//       const existingId = existingMsg.getAttribute("data-message-id");
//       if (existingId && message.msg_id < existingId) {
//         messagesContainer.insertBefore(messageEl, existingMsg);
//         inserted = true;
//         break;
//       }
//     }
//   }

//   // If we didn't find a place to insert it, append it at the end
//   if (!inserted) {
//     messagesContainer.appendChild(messageEl);
//   }

//   // Add with a slight animation effect
//   messageEl.style.opacity = "0";
//   messageEl.style.transform = "translateY(10px)";

//   // Trigger reflow to ensure the animation works
//   void messageEl.offsetWidth;

//   // Apply transition
//   messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
//   messageEl.style.opacity = "1";
//   messageEl.style.transform = "translateY(0)";

//   // Scroll to the bottom to show the new message
//   scrollToBottom();

//   // Update just the chat list item with this message, not the entire chat list
//   updateLastMessageInChatList(
//     message.chat_id,
//     message.msg_content,
//     message.senderid
//   );
// }

// function scrollToBottom() {
//   const messagesContainer = document.querySelector(".chat__messages-container");
//   messagesContainer.scrollTop = messagesContainer.scrollHeight;
// }

// function formatDateTime(date) {
//   // Adjust for local timezone and format
//   const options = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     // day: "2-digit",
//     // month: "2-digit",
//     // year: "numeric",
//   };

//   // Get just the time part for today's messages
//   const today = new Date();
//   if (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   ) {
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Show full date for older messages
//   return date.toLocaleString("en-US", options);
// }

// async function renderChatList() {
//   try {
//     const chats = await getChatList();
//     chatListContainer.innerHTML = '<div class="loader loading-chats"></div>';

//     if (chats.length === 0) {
//       // Display a message when no chats are available
//       chatListContainer.innerHTML = `
//         <li class="no-chats">
//           <p>No chats available</p>
//         </li>
//       `;
//       return;
//     }

//     let markup = "";

//     for (const chat of chats) {
//       // Try to get the last message for this chat
//       const lastMessage = await getLastMessage(chat.chat_id);
//       const lastMessageText = lastMessage
//         ? truncateText(lastMessage.msg_content, 30)
//         : "No messages yet...";

//       // Safely get the sender name
//       let senderPrefix = "";
//       if (lastMessage) {
//         if (+studentId === +lastMessage.senderid) {
//           senderPrefix = "You: ";
//         } else if (lastMessage.senderid) {
//           const senderName = await safeGetUserName(lastMessage.senderid);
//           senderPrefix = `${senderName}: `;
//         }
//       }

//       markup += `
//        <li class="chat__item" data-chat-id="${chat.chat_id}" data-chat-name="${chat.chat_name}">
//                 <div class="chat__img"></div>
//                 <div class="chat__details">
//                   <div class="chat__name">${chat.chat_name}</div>
//                   <div class="chat__last-message">
//                     ${senderPrefix}${lastMessageText}
//                   </div>
//                 </div>
//               </li>`;
//     }

//     chatListContainer.innerHTML = markup;
//     attachChatClickListeners();
//   } catch (error) {
//     console.error("Error rendering chat list:", error);
//     chatListContainer.innerHTML = `
//       <li class="error-message">
//         <p>Error loading chats. Please try again.</p>
//       </li>
//     `;
//   }
// }

// function truncateText(text, maxLength) {
//   if (!text) return "";
//   if (text.length <= maxLength) return text;
//   return text.substring(0, maxLength) + "...";
// }

// async function getLastMessage(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: false })
//     .limit(1);

//   if (error || !data) {
//     return null;
//   }
//   if (data) {
//     // console.log(data[0].msg_content);
//     // console.log(data[0]);
//     return data[0];
//   }
// }

// async function getChatList() {
//   const { data, error } = await supaClient
//     .from("student_chat")
//     .select("*")
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching chat list:", error);
//     return [];
//   }

//   if (data && data.length > 0) {
//     const { data: chats, error } = await supaClient
//       .from("chat")
//       .select("*")
//       .in(
//         "chat_id",
//         data.map((chat) => chat.chat_id)
//       );

//     if (error) {
//       console.error("Error fetching chat details:", error);
//       return [];
//     } else {
//       return chats;
//     }
//   }
//   return [];
// }

// async function getChatDetails(chatId) {
//   const { data, error } = await supaClient
//     .from("chat")
//     .select("*")
//     .eq("chat_id", chatId)
//     .single();

//   if (error) {
//     console.error("Error fetching chat details:", error);
//     return null;
//   } else {
//     return data;
//   }
// }

// function renderChatDetails(chat) {
//   if (chat) {
//     chatName.textContent = chat.chat_name;
//   }
// }

// async function retrieveChatMessages(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: true }) // Primary sort by timestamp
//     .order("msg_id", { ascending: true }); // Secondary sort by message_id for consistency

//   if (error) {
//     console.error("Error fetching chat messages:", error);
//     return [];
//   } else {
//     // Build our processed message IDs set
//     data.forEach((msg) => {
//       if (msg.msg_id) {
//         processedMessageIds.add(msg.msg_id);
//       }
//     });

//     return data;
//   }
// }

// function renderChatMessages(messages, animate = true) {
//   // Get the messages container
//   const messagesContainer = document.querySelector(".chat__messages-container");

//   // Clear existing messages
//   messagesContainer.innerHTML = "";

//   if (!messages || messages.length === 0) {
//     // Show a message when there are no messages
//     const emptyMessage = document.createElement("div");
//     emptyMessage.classList.add("empty-messages");
//     emptyMessage.textContent = "No messages yet. Start the conversation!";
//     messagesContainer.appendChild(emptyMessage);
//     return;
//   }

//   // First ensure messages are properly sorted
//   messages.sort((a, b) => {
//     const timeA = new Date(a.msg_date_time).getTime();
//     const timeB = new Date(b.msg_date_time).getTime();

//     // If timestamps are equal, sort by message_id as secondary criteria
//     if (timeA === timeB) {
//       return a.msg_id - b.msg_id;
//     }

//     return timeA - timeB;
//   });

//   // Performance optimization: Create a document fragment to append all messages at once
//   const fragment = document.createDocumentFragment();

//   // Store promises for user name resolution
//   const namePromises = [];

//   // Render all messages
//   messages.forEach((message, index) => {
//     if (!message) return; // Skip any undefined messages

//     const messageEl = document.createElement("div");
//     messageEl.setAttribute("data-message-id", message.msg_id);
//     messageEl.setAttribute(
//       "data-timestamp",
//       new Date(message.msg_date_time).getTime()
//     );

//     const messageSenderName = document.createElement("p");
//     const messageContent = document.createElement("p");
//     const messageTime = document.createElement("p");

//     messageSenderName.classList.add("message__sender-name");
//     messageContent.classList.add("message__content");
//     messageTime.classList.add("message__time");

//     messageContent.textContent = message.msg_content || "";
//     messageTime.textContent = formatDateTime(new Date(message.msg_date_time));

//     messageEl.appendChild(messageSenderName);
//     messageEl.appendChild(messageContent);
//     messageEl.appendChild(messageTime);

//     // Check if the message is from the current user
//     const isSentByCurrentUser = message.senderid === +studentId;

//     // Add message classes based on sender
//     if (isSentByCurrentUser) {
//       messageEl.classList.add("sent");
//       // Add a promise for resolving the username
//       namePromises.push(
//         safeGetUserName(studentId).then((name) => {
//           messageSenderName.textContent = name;
//         })
//       );
//     } else {
//       messageEl.classList.add("received");
//       // Add a promise for resolving the username
//       namePromises.push(
//         safeGetUserName(message.senderid).then((name) => {
//           messageSenderName.textContent = name;
//         })
//       );
//     }

//     messageEl.classList.add("message");

//     // Only animate if specified
//     if (animate) {
//       // Add initial state for animation
//       messageEl.style.opacity = "0";
//       messageEl.style.transform = "translateY(10px)";

//       // Add to fragment (will be appended to DOM in correct order)
//       fragment.appendChild(messageEl);

//       // Animate in with a staggered delay based on index
//       // Only animate the most recent messages if there are many
//       const shouldAnimate = messages.length - index <= 15;

//       if (shouldAnimate) {
//         setTimeout(() => {
//           messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
//           messageEl.style.opacity = "1";
//           messageEl.style.transform = "translateY(0)";
//         }, Math.min(index * 30, 300)); // Stagger with a max delay of 300ms
//       } else {
//         // Instantly show older messages
//         messageEl.style.opacity = "1";
//         messageEl.style.transform = "translateY(0)";
//       }
//     } else {
//       // No animation - immediately visible
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";
//       fragment.appendChild(messageEl);
//     }
//   });

//   // Append all messages at once for better performance
//   messagesContainer.appendChild(fragment);

//   // Resolve all name promises in parallel
//   Promise.all(namePromises).catch((error) => {
//     console.error("Error resolving usernames:", error);
//   });

//   // Scroll to the bottom of the messages container
//   // Use a small timeout to ensure it happens after rendering
//   setTimeout(scrollToBottom, 100);
// }

// // Updated function to handle last message in chat list with sender ID
// async function updateLastMessageInChatList(chatId, messageContent, senderId) {
//   const chatItem = document.querySelector(
//     `.chat__item[data-chat-id="${chatId}"]`
//   );
//   if (chatItem) {
//     const lastMessageEl = chatItem.querySelector(".chat__last-message");
//     if (lastMessageEl) {
//       let prefix = "";

//       // Determine the prefix based on sender
//       if (senderId === +studentId) {
//         prefix = "You: ";
//       } else if (senderId) {
//         try {
//           const senderName = await safeGetUserName(senderId);
//           prefix = senderName ? `${senderName}: ` : "";
//         } catch (error) {
//           console.error("Error getting sender name:", error);
//           prefix = "";
//         }
//       }

//       lastMessageEl.textContent = prefix + truncateText(messageContent, 30);

//       // Move this chat to the top of the list (most recent)
//       const chatsList = chatItem.parentElement;
//       if (chatsList && chatsList.firstChild !== chatItem) {
//         chatsList.insertBefore(chatItem, chatsList.firstChild);
//       }
//     }
//   }
// }

// async function sendMessage(chatId, messageContent) {
//   try {
//     const timestamp = new Date();

//     // Create a temporary visual placeholder for the message with a unique ID
//     const tempMessageId = `temp-${Date.now()}`;
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );

//     // Remove any "empty messages" placeholder if it exists
//     const emptyPlaceholder = messagesContainer.querySelector(".empty-messages");
//     if (emptyPlaceholder) {
//       emptyPlaceholder.remove();
//     }

//     const messageEl = document.createElement("div");
//     messageEl.id = tempMessageId;
//     messageEl.classList.add("message", "sent", "pending");
//     // Add timestamp as data attribute for sorting
//     messageEl.setAttribute("data-timestamp", timestamp.getTime());

//     const messageSenderName = document.createElement("p");
//     messageSenderName.classList.add("message__sender-name");
//     messageSenderName.textContent = await safeGetUserName(studentId);

//     const messageContent_el = document.createElement("p");
//     messageContent_el.classList.add("message__content");
//     messageContent_el.textContent = messageContent;

//     const messageTime = document.createElement("p");
//     messageTime.classList.add("message__time");
//     messageTime.textContent = formatDateTime(timestamp);

//     messageEl.appendChild(messageSenderName);
//     messageEl.appendChild(messageContent_el);
//     messageEl.appendChild(messageTime);

//     // Find the proper position to insert the message chronologically
//     const allMessages = Array.from(
//       messagesContainer.querySelectorAll(".message[data-timestamp]")
//     );
//     let inserted = false;

//     for (const existingMsg of allMessages) {
//       const existingTimestamp = parseInt(
//         existingMsg.getAttribute("data-timestamp"),
//         10
//       );

//       if (timestamp.getTime() < existingTimestamp) {
//         messagesContainer.insertBefore(messageEl, existingMsg);
//         inserted = true;
//         break;
//       }
//     }

//     // If we didn't find a place to insert it, append it at the end
//     if (!inserted) {
//       messagesContainer.appendChild(messageEl);
//     }

//     // Add animation
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Trigger reflow
//     void messageEl.offsetWidth;

//     // Animate in
//     messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
//     messageEl.style.opacity = "1";
//     messageEl.style.transform = "translateY(0)";

//     // Scroll to the bottom to show the new message
//     scrollToBottom();

//     // Send the actual message to the database
//     const { data, error } = await supaClient
//       .from("message")
//       .insert({
//         chat_id: chatId,
//         msg_content: messageContent,
//         senderid: studentId,
//         msg_date_time: timestamp.toISOString(),
//       })
//       .select();

//     if (error) {
//       console.error("Error sending message:", error);
//       messageEl.classList.add("error");
//       messageTime.textContent = "Failed to send";

//       // Add retry button
//       const retryButton = document.createElement("button");
//       retryButton.classList.add("retry-button");
//       retryButton.textContent = "Retry";
//       retryButton.addEventListener("click", () => {
//         // Remove the failed message
//         messageEl.remove();
//         // Try sending again
//         sendMessage(chatId, messageContent);
//       });
//       messageEl.appendChild(retryButton);
//     } else {
//       console.log("Message sent:", data);

//       // Instead of removing the placeholder, just mark it as confirmed and add the ID
//       messageEl.classList.remove("pending");
//       messageEl.classList.add("confirmed");
//       messageEl.setAttribute("data-message-id", data[0].msg_id);

//       // Add this message ID to our processed set to prevent duplication
//       if (data && data[0] && data[0].msg_id) {
//         processedMessageIds.add(data[0].msg_id);
//       }

//       // Update just the chat list item with this message
//       updateLastMessageInChatList(chatId, messageContent, studentId);
//     }
//   } catch (err) {
//     console.error("Exception sending message:", err);
//   }
// }

// // Initialize chat list
// renderChatList();

// // When the page is about to be unloaded, unsubscribe from any active subscription
// window.addEventListener("beforeunload", () => {
//   if (subscription) {
//     subscription.unsubscribe();
//   }
// });

// // A more intelligent visibility change handler that doesn't cause flickering
// let visibilityTimeout = null;
// document.addEventListener("visibilitychange", () => {
//   // Clear any pending timeout
//   if (visibilityTimeout) {
//     clearTimeout(visibilityTimeout);
//   }

//   if (document.visibilityState === "visible" && currentChatId) {
//     console.log("Tab visible again, checking connection status");

//     // Set a short delay before checking to avoid unnecessary reloads
//     visibilityTimeout = setTimeout(async () => {
//       // First check if our subscription is still active
//       if (!subscription || subscription.status !== "SUBSCRIBED") {
//         console.log("Reestablishing subscription");
//         setupChatSubscription(currentChatId);

//         // Only fetch new messages, don't completely re-render
//         try {
//           const lastMessageEl = document.querySelector(
//             ".message[data-message-id]:last-child"
//           );
//           let lastTimestamp = null;

//           if (lastMessageEl) {
//             const lastMsgId = lastMessageEl.getAttribute("data-message-id");

//             // Get messages newer than our last message
//             const { data: newMessages, error } = await supaClient
//               .from("message")
//               .select("*")
//               .eq("chat_id", currentChatId)
//               .gt("msg_id", lastMsgId)
//               .order("msg_date_time", { ascending: true })
//               .order("msg_id", { ascending: true });

//             if (!error && newMessages && newMessages.length > 0) {
//               console.log(
//                 `Found ${newMessages.length} new messages while away`
//               );

//               // Add only the new messages without re-rendering everything
//               for (const message of newMessages) {
//                 if (!processedMessageIds.has(message.msg_id)) {
//                   processedMessageIds.add(message.msg_id);
//                   await addMessageToChat(message);
//                 }
//               }
//             }
//           } else {
//             // If there are no messages, do a full refresh
//             const messages = await retrieveChatMessages(currentChatId);
//             renderChatMessages(messages, false); // no animation
//           }
//         } catch (error) {
//           console.error("Error refreshing messages:", error);
//         }
//       }
//     }, 500); // Short delay to avoid unnecessary work
//   }
// });

//////////////////// V2 ////////////////////
// import { supaClient } from "./app.js";
// import { getUserName } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const chatName = document.querySelector(".chat__name");
// const chats = document.querySelector(".chats");
// const collapseButton = document.querySelector(".collapse__chat-btn");
// const chatView = document.querySelector(".chat__view");
// const chatListContainer = document.querySelector(".chats__list");
// let currentChatId = null;
// let subscription = null;
// // Track messages we've already seen to prevent duplicates
// let processedMessageIds = new Set();
// // Cache for user names to reduce API calls
// const userNameCache = new Map();

// // Prefetch the current user's name and cache it
// if (studentId) {
//   getUserName(studentId)
//     .then((name) => {
//       userNameCache.set(studentId, name);
//     })
//     .catch(() => {
//       userNameCache.set(studentId, "Unknown User");
//     });
// }

// // Helper function to safely get user names with caching
// async function safeGetUserName(userId) {
//   if (!userId) {
//     return "Unknown User";
//   }

//   // Check cache first
//   if (userNameCache.has(userId)) {
//     return userNameCache.get(userId);
//   }

//   try {
//     const name = await getUserName(userId);
//     userNameCache.set(userId, name); // Cache the result
//     return name;
//   } catch (error) {
//     console.error(`Error getting username for ID ${userId}:`, error);
//     userNameCache.set(userId, "Unknown User"); // Cache the fallback
//     return "Unknown User";
//   }
// }

// // Batch username loading to avoid multiple sequential requests
// async function loadUserNames(userIds) {
//   const uniqueIds = [...new Set(userIds)].filter(
//     (id) => id && !userNameCache.has(id)
//   );

//   if (uniqueIds.length === 0) return;

//   // Load user names in parallel
//   const promises = uniqueIds.map(async (userId) => {
//     try {
//       const name = await getUserName(userId);
//       userNameCache.set(userId, name);
//     } catch (error) {
//       userNameCache.set(userId, "Unknown User");
//     }
//   });

//   await Promise.all(promises);
// }

// function openChat() {
//   chats.classList.add("open");
//   chatView.classList.add("active");
// }

// function closeChat() {
//   chats.classList.remove("open");
//   chatView.classList.remove("active");
//   document.querySelectorAll(".chat__item").forEach((chat) => {
//     chat.classList.remove("active");
//   });
// }

// function attachChatClickListeners() {
//   document.querySelectorAll(".chat__item").forEach((chatItem) => {
//     chatItem.addEventListener("click", async (e) => {
//       // Close chat list and open chat view
//       if (
//         e.target.closest(".chat__item") &&
//         !e.target.closest(".chat__item").classList.contains("active")
//       ) {
//         document.querySelectorAll(".chat__item").forEach((item) => {
//           item.classList.remove("active");
//         });
//         e.target.closest(".chat__item").classList.add("active");
//         openChat();
//       }

//       const chatId = chatItem.getAttribute("data-chat-id");

//       // Don't reload if we're already on this chat
//       if (currentChatId === chatId) {
//         return;
//       }

//       // Unsubscribe from previous chat subscription if exists
//       if (subscription) {
//         subscription.unsubscribe();
//       }

//       currentChatId = chatId;
//       const chatNameText = chatItem.getAttribute("data-chat-name");

//       // Reset processed message IDs when changing chats
//       processedMessageIds = new Set();

//       // Show loading indicator
//       const messagesContainer = document.querySelector(
//         ".chat__messages-container"
//       );
//       messagesContainer.innerHTML =
//         '<div class="loading-messages loader"></div>';

//       // Load chat details
//       const chatDetailsPromise = getChatDetails(chatId);
//       const messagesPromise = retrieveChatMessages(chatId);

//       // Load chat details and messages in parallel
//       try {
//         const [chatDetails, chatMessages] = await Promise.all([
//           chatDetailsPromise,
//           messagesPromise,
//         ]);

//         // Render chat details
//         renderChatDetails(chatDetails);

//         // Extract all user IDs for parallel name loading
//         const userIds = chatMessages.map((msg) => msg.senderid);
//         userIds.push(studentId); // Include current user

//         // Prefetch all user names in parallel before rendering messages
//         await loadUserNames(userIds);

//         // Only render if this is still the current chat
//         if (currentChatId === chatId) {
//           // Render chat messages
//           renderChatMessages(chatMessages, false); // false = no animation on initial load
//         }
//       } catch (error) {
//         console.error("Error loading messages:", error);
//         messagesContainer.innerHTML =
//           '<div class="error-messages">Error loading messages. Please try again.</div>';
//       }

//       // Set up real-time subscription for this chat
//       setupChatSubscription(chatId);

//       // Set up event listener for send button
//       setupSendMessageHandler(chatId);
//     });
//   });

//   collapseButton.addEventListener("click", closeChat);
// }

// function setupSendMessageHandler(chatId) {
//   const sendButton = document.querySelector(".send__message-btn");
//   const messageInput = document.querySelector(".message__input");

//   // First, remove any existing event listeners by cloning the elements
//   const newSendButton = sendButton.cloneNode(true);
//   sendButton.parentNode.replaceChild(newSendButton, sendButton);

//   const newMessageInput = messageInput.cloneNode(true);
//   messageInput.parentNode.replaceChild(newMessageInput, messageInput);

//   // Add event listener to the send button
//   newSendButton.addEventListener("click", async () => {
//     const messageContent = newMessageInput.value.trim();
//     if (messageContent) {
//       await sendMessage(chatId, messageContent);
//       newMessageInput.value = ""; // Clear input after sending
//       newMessageInput.focus(); // Keep focus on input for better UX
//     }
//   });

//   // Add event listener for Enter key
//   newMessageInput.addEventListener("keypress", async (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault(); // Prevent default to avoid form submission
//       const messageContent = newMessageInput.value.trim();
//       if (messageContent) {
//         await sendMessage(chatId, messageContent);
//         newMessageInput.value = ""; // Clear input after sending
//       }
//     }
//   });

//   // Focus the input field for immediate typing
//   newMessageInput.focus();
// }

// let isReconnecting = false;

// function setupChatSubscription(chatId) {
//   // Unsubscribe from any existing subscription first
//   if (subscription) {
//     subscription.unsubscribe();
//   }

//   // Create a more robust subscription with better error handling
//   try {
//     subscription = supaClient
//       .channel(`chat:${chatId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "message",
//           filter: `chat_id=eq.${chatId}`,
//         },
//         (payload) => {
//           // Only process if this is still the current chat
//           if (currentChatId === chatId) {
//             if (!processedMessageIds.has(payload.new.msg_id)) {
//               processedMessageIds.add(payload.new.msg_id);

//               // Pre-load the sender's name if needed before adding the message
//               if (
//                 payload.new.senderid &&
//                 !userNameCache.has(payload.new.senderid)
//               ) {
//                 safeGetUserName(payload.new.senderid).then(() => {
//                   addMessageToChat(payload.new);
//                 });
//               } else {
//                 addMessageToChat(payload.new);
//               }
//             }
//           }
//         }
//       )
//       .subscribe((status) => {
//         console.log("Subscription status:", status);
//         if (status === "SUBSCRIBED") {
//           console.log(`Successfully subscribed to chat ${chatId}`);
//           isReconnecting = false;
//         } else if (status === "CHANNEL_ERROR" && !isReconnecting) {
//           console.error(`Error subscribing to chat ${chatId}`);
//           isReconnecting = true;
//           // Try to resubscribe after a delay if there was an error
//           setTimeout(() => {
//             if (currentChatId === chatId) {
//               // Only reconnect if still on this chat
//               setupChatSubscription(chatId);
//             }
//           }, 3000);
//         }
//       });
//   } catch (error) {
//     console.error("Error setting up subscription:", error);
//     // Try to resubscribe after a delay
//     if (!isReconnecting) {
//       isReconnecting = true;
//       setTimeout(() => {
//         if (currentChatId === chatId) {
//           // Only reconnect if still on this chat
//           setupChatSubscription(chatId);
//           isReconnecting = false;
//         }
//       }, 3000);
//     }
//   }
// }

// // Create a single message element for faster DOM operations
// function createMessageElement(message, animate = true) {
//   // Create the new message element
//   const messageEl = document.createElement("div");
//   messageEl.setAttribute("data-message-id", message.msg_id);
//   messageEl.setAttribute(
//     "data-timestamp",
//     new Date(message.msg_date_time).getTime()
//   );

//   const messageSenderName = document.createElement("p");
//   const messageContent = document.createElement("p");
//   const messageTime = document.createElement("p");

//   messageSenderName.classList.add("message__sender-name");
//   messageContent.classList.add("message__content");
//   messageTime.classList.add("message__time");

//   messageContent.textContent = message.msg_content || "";
//   messageTime.textContent = formatDateTime(new Date(message.msg_date_time));

//   // Check if the message is from the current user
//   const isSentByCurrentUser = message.senderid === +studentId;

//   // Add message classes based on sender
//   if (isSentByCurrentUser) {
//     messageEl.classList.add("sent");
//     messageSenderName.textContent = userNameCache.get(studentId) || "You";
//   } else {
//     messageEl.classList.add("received");
//     messageSenderName.textContent =
//       userNameCache.get(message.senderid) || "User";
//   }

//   messageEl.classList.add("message");

//   messageEl.appendChild(messageSenderName);
//   messageEl.appendChild(messageContent);
//   messageEl.appendChild(messageTime);

//   // Add animation if needed
//   if (animate) {
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Use requestAnimationFrame for smoother animations
//     requestAnimationFrame(() => {
//       messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";
//     });
//   }

//   return messageEl;
// }

// async function addMessageToChat(message) {
//   // First check if we already have this message in the DOM
//   const existingMessage = document.querySelector(
//     `[data-message-id="${message.msg_id}"]`
//   );
//   if (existingMessage) {
//     return; // Skip if already exists
//   }

//   // Create the message element
//   const messagesContainer = document.querySelector(".chat__messages-container");
//   const messageEl = createMessageElement(message, true);

//   // Find the proper position to insert this message chronologically
//   const timestamp = new Date(message.msg_date_time).getTime();
//   const allMessages = Array.from(
//     messagesContainer.querySelectorAll(".message[data-timestamp]")
//   );

//   // Sort by timestamp then by ID if available
//   let inserted = false;

//   for (let i = 0; i < allMessages.length; i++) {
//     const existingMsg = allMessages[i];
//     const existingTimestamp = parseInt(
//       existingMsg.getAttribute("data-timestamp"),
//       10
//     );

//     if (timestamp < existingTimestamp) {
//       messagesContainer.insertBefore(messageEl, existingMsg);
//       inserted = true;
//       break;
//     }

//     if (timestamp === existingTimestamp) {
//       // If timestamps are equal, check msg_id for ordering
//       const existingId = existingMsg.getAttribute("data-message-id");
//       if (existingId && message.msg_id < existingId) {
//         messagesContainer.insertBefore(messageEl, existingMsg);
//         inserted = true;
//         break;
//       }
//     }
//   }

//   // If we didn't find a place to insert it, append it at the end
//   if (!inserted) {
//     messagesContainer.appendChild(messageEl);
//   }

//   // Scroll to the bottom to show the new message
//   scrollToBottom();

//   // Update just the chat list item with this message, not the entire chat list
//   updateLastMessageInChatList(
//     message.chat_id,
//     message.msg_content,
//     message.senderid
//   );
// }

// // Use a more efficient scrolling method with requestAnimationFrame
// function scrollToBottom() {
//   requestAnimationFrame(() => {
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
//   });
// }

// function formatDateTime(date) {
//   // Adjust for local timezone and format
//   const options = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   };

//   // Get just the time part for today's messages
//   const today = new Date();
//   if (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   ) {
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Show full date for older messages
//   return date.toLocaleString("en-US", options);
// }

// async function renderChatList() {
//   try {
//     chatListContainer.innerHTML = '<div class="loader loading-chats"></div>';
//     const chats = await getChatList();

//     if (chats.length === 0) {
//       // Display a message when no chats are available
//       chatListContainer.innerHTML = `
//         <li class="no-chats">
//           <p>No chats available</p>
//         </li>
//       `;
//       return;
//     }

//     // Create a document fragment for batch DOM updates
//     const fragment = document.createDocumentFragment();
//     const pendingChats = [];

//     // First render the basic chat list structure
//     for (const chat of chats) {
//       const chatItem = document.createElement("li");
//       chatItem.className = "chat__item";
//       chatItem.setAttribute("data-chat-id", chat.chat_id);
//       chatItem.setAttribute("data-chat-name", chat.chat_name);

//       chatItem.innerHTML = `
//         <div class="chat__img"></div>
//         <div class="chat__details">
//           <div class="chat__name">${chat.chat_name}</div>
//           <div class="chat__last-message">Loading...</div>
//         </div>
//       `;

//       fragment.appendChild(chatItem);
//       pendingChats.push(chat.chat_id);
//     }

//     // Update the DOM once with all chat items
//     chatListContainer.innerHTML = "";
//     chatListContainer.appendChild(fragment);

//     // Attach click listeners immediately
//     attachChatClickListeners();

//     // Then load last messages for each chat in parallel
//     const lastMessagePromises = pendingChats.map(async (chatId) => {
//       const lastMessage = await getLastMessage(chatId);
//       if (lastMessage) {
//         // Ensure we have the sender name
//         if (lastMessage.senderid && !userNameCache.has(lastMessage.senderid)) {
//           await safeGetUserName(lastMessage.senderid);
//         }
//         return { chatId, lastMessage };
//       }
//       return { chatId, lastMessage: null };
//     });

//     // Update last messages as they come in
//     const results = await Promise.all(lastMessagePromises);

//     // Update the UI with last message data
//     for (const { chatId, lastMessage } of results) {
//       const chatItem = document.querySelector(
//         `.chat__item[data-chat-id="${chatId}"]`
//       );
//       if (!chatItem) continue;

//       const lastMessageEl = chatItem.querySelector(".chat__last-message");
//       if (!lastMessageEl) continue;

//       let messageText = "No messages yet...";
//       let senderPrefix = "";

//       if (lastMessage) {
//         messageText = truncateText(lastMessage.msg_content, 30);

//         if (+studentId === +lastMessage.senderid) {
//           senderPrefix = "You: ";
//         } else if (
//           lastMessage.senderid &&
//           userNameCache.has(lastMessage.senderid)
//         ) {
//           senderPrefix = `${userNameCache.get(lastMessage.senderid)}: `;
//         }
//       }

//       lastMessageEl.textContent = senderPrefix + messageText;
//     }
//   } catch (error) {
//     console.error("Error rendering chat list:", error);
//     chatListContainer.innerHTML = `
//       <li class="error-message">
//         <p>Error loading chats. Please try again.</p>
//       </li>
//     `;
//   }
// }

// function truncateText(text, maxLength) {
//   if (!text) return "";
//   if (text.length <= maxLength) return text;
//   return text.substring(0, maxLength) + "...";
// }

// async function getLastMessage(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: false })
//     .limit(1);

//   if (error || !data || data.length === 0) {
//     return null;
//   }
//   return data[0];
// }

// async function getChatList() {
//   const { data, error } = await supaClient
//     .from("student_chat")
//     .select("*")
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching chat list:", error);
//     return [];
//   }

//   if (data && data.length > 0) {
//     const { data: chats, error } = await supaClient
//       .from("chat")
//       .select("*")
//       .in(
//         "chat_id",
//         data.map((chat) => chat.chat_id)
//       );

//     if (error) {
//       console.error("Error fetching chat details:", error);
//       return [];
//     } else {
//       return chats;
//     }
//   }
//   return [];
// }

// async function getChatDetails(chatId) {
//   const { data, error } = await supaClient
//     .from("chat")
//     .select("*")
//     .eq("chat_id", chatId)
//     .single();

//   if (error) {
//     console.error("Error fetching chat details:", error);
//     return null;
//   } else {
//     return data;
//   }
// }

// function renderChatDetails(chat) {
//   if (chat) {
//     chatName.textContent = chat.chat_name;
//   }
// }

// async function retrieveChatMessages(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: true }) // Primary sort by timestamp
//     .order("msg_id", { ascending: true }); // Secondary sort by message_id for consistency

//   if (error) {
//     console.error("Error fetching chat messages:", error);
//     return [];
//   } else {
//     // Build our processed message IDs set
//     data.forEach((msg) => {
//       if (msg.msg_id) {
//         processedMessageIds.add(msg.msg_id);
//       }
//     });

//     return data;
//   }
// }

// function renderChatMessages(messages, animate = true) {
//   // Get the messages container
//   const messagesContainer = document.querySelector(".chat__messages-container");

//   // Clear existing messages
//   messagesContainer.innerHTML = "";

//   if (!messages || messages.length === 0) {
//     // Show a message when there are no messages
//     const emptyMessage = document.createElement("div");
//     emptyMessage.classList.add("empty-messages");
//     emptyMessage.textContent = "No messages yet. Start the conversation!";
//     messagesContainer.appendChild(emptyMessage);
//     return;
//   }

//   // First ensure messages are properly sorted
//   messages.sort((a, b) => {
//     const timeA = new Date(a.msg_date_time).getTime();
//     const timeB = new Date(b.msg_date_time).getTime();

//     // If timestamps are equal, sort by message_id as secondary criteria
//     if (timeA === timeB) {
//       return a.msg_id - b.msg_id;
//     }

//     return timeA - timeB;
//   });

//   // Performance optimization: Create a document fragment and batch render
//   const fragment = document.createDocumentFragment();

//   // For large message sets, use virtual rendering
//   const shouldVirtualize = messages.length > 100;

//   // If virtualizing, only render the last 50 messages initially
//   const messagesToRender = shouldVirtualize ? messages.slice(-50) : messages;

//   // Render messages in batches using requestAnimationFrame for better performance
//   const renderBatch = (startIdx, endIdx) => {
//     for (let i = startIdx; i < endIdx && i < messagesToRender.length; i++) {
//       const message = messagesToRender[i];
//       if (!message) continue;

//       const messageEl = createMessageElement(message, false); // Don't animate batches
//       fragment.appendChild(messageEl);
//     }

//     // Add this batch to the container
//     messagesContainer.appendChild(fragment);
//   };

//   // For small message sets, render all at once
//   if (!shouldVirtualize) {
//     renderBatch(0, messagesToRender.length);
//   } else {
//     // For large message sets, render in batches of 20
//     let currentBatch = 0;
//     const batchSize = 20;

//     const processNextBatch = () => {
//       const startIdx = currentBatch * batchSize;
//       const endIdx = startIdx + batchSize;

//       if (startIdx < messagesToRender.length) {
//         renderBatch(startIdx, endIdx);
//         currentBatch++;
//         requestAnimationFrame(processNextBatch);
//       } else {
//         // All batches processed
//         scrollToBottom();
//       }
//     };

//     // Start rendering batches
//     processNextBatch();
//   }

//   // Scroll to the bottom immediately for small message sets
//   if (!shouldVirtualize) {
//     scrollToBottom();
//   }
// }

// // Updated function to handle last message in chat list with sender ID
// async function updateLastMessageInChatList(chatId, messageContent, senderId) {
//   const chatItem = document.querySelector(
//     `.chat__item[data-chat-id="${chatId}"]`
//   );
//   if (chatItem) {
//     const lastMessageEl = chatItem.querySelector(".chat__last-message");
//     if (lastMessageEl) {
//       let prefix = "";

//       // Determine the prefix based on sender
//       if (senderId === +studentId) {
//         prefix = "You: ";
//       } else if (senderId && userNameCache.has(senderId)) {
//         prefix = `${userNameCache.get(senderId)}: `;
//       }

//       lastMessageEl.textContent = prefix + truncateText(messageContent, 30);

//       // Move this chat to the top of the list (most recent)
//       const chatsList = chatItem.parentElement;
//       if (chatsList && chatsList.firstChild !== chatItem) {
//         // Use animation API for smoother transitions
//         chatItem.style.transition = "none";
//         chatItem.style.opacity = "0.7";

//         // Move to top
//         chatsList.insertBefore(chatItem, chatsList.firstChild);

//         // Trigger reflow
//         void chatItem.offsetWidth;

//         // Animate back to normal
//         chatItem.style.transition = "opacity 0.3s ease";
//         chatItem.style.opacity = "1";
//       }
//     }
//   }
// }

// async function sendMessage(chatId, messageContent) {
//   try {
//     const timestamp = new Date();

//     // Create a temporary visual placeholder for the message with a unique ID
//     const tempMessageId = `temp-${Date.now()}`;
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );

//     // Remove any "empty messages" placeholder if it exists
//     const emptyPlaceholder = messagesContainer.querySelector(".empty-messages");
//     if (emptyPlaceholder) {
//       emptyPlaceholder.remove();
//     }

//     // If we don't have the current user's name yet, get it
//     if (!userNameCache.has(studentId)) {
//       await safeGetUserName(studentId);
//     }

//     // Create temporary message element
//     const messageEl = document.createElement("div");
//     messageEl.id = tempMessageId;
//     messageEl.classList.add("message", "sent", "pending");
//     // Add timestamp as data attribute for sorting
//     messageEl.setAttribute("data-timestamp", timestamp.getTime());

//     const messageSenderName = document.createElement("p");
//     messageSenderName.classList.add("message__sender-name");
//     messageSenderName.textContent = userNameCache.get(studentId) || "You";

//     const messageContent_el = document.createElement("p");
//     messageContent_el.classList.add("message__content");
//     messageContent_el.textContent = messageContent;

//     const messageTime = document.createElement("p");
//     messageTime.classList.add("message__time");
//     messageTime.textContent = formatDateTime(timestamp);

//     messageEl.appendChild(messageSenderName);
//     messageEl.appendChild(messageContent_el);
//     messageEl.appendChild(messageTime);

//     // Append message to the end for immediate feedback
//     messagesContainer.appendChild(messageEl);

//     // Add animation for a smoother appearance
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Use requestAnimationFrame for smoother animations
//     requestAnimationFrame(() => {
//       messageEl.style.transition = "opacity 0.2s ease, transform 0.2s ease";
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";

//       // Scroll to bottom to show the new message
//       scrollToBottom();
//     });

//     // Send the actual message to the database
//     const { data, error } = await supaClient
//       .from("message")
//       .insert({
//         chat_id: chatId,
//         msg_content: messageContent,
//         senderid: studentId,
//         msg_date_time: timestamp.toISOString(),
//       })
//       .select();

//     if (error) {
//       console.error("Error sending message:", error);
//       messageEl.classList.add("error");
//       messageTime.textContent = "Failed to send";

//       // Add retry button
//       const retryButton = document.createElement("button");
//       retryButton.classList.add("retry-button");
//       retryButton.textContent = "Retry";
//       retryButton.addEventListener("click", () => {
//         // Remove the failed message
//         messageEl.remove();
//         // Try sending again
//         sendMessage(chatId, messageContent);
//       });
//       messageEl.appendChild(retryButton);
//     } else {
//       console.log("Message sent:", data);

//       // Instead of removing the placeholder, just mark it as confirmed and add the ID
//       messageEl.classList.remove("pending");
//       messageEl.classList.add("confirmed");
//       messageEl.setAttribute("data-message-id", data[0].msg_id);

//       // Add this message ID to our processed set to prevent duplication
//       if (data && data[0] && data[0].msg_id) {
//         processedMessageIds.add(data[0].msg_id);
//       }

//       // Update just the chat list item with this message
//       updateLastMessageInChatList(chatId, messageContent, studentId);
//     }
//   } catch (err) {
//     console.error("Exception sending message:", err);
//   }
// }

// // Initialize chat list
// renderChatList();

// // When the page is about to be unloaded, unsubscribe from any active subscription
// window.addEventListener("beforeunload", () => {
//   if (subscription) {
//     subscription.unsubscribe();
//   }
// });

// // A more intelligent visibility change handler that doesn't cause flickering
// let visibilityTimeout = null;
// document.addEventListener("visibilitychange", () => {
//   // Clear any pending timeout
//   if (visibilityTimeout) {
//     clearTimeout(visibilityTimeout);
//   }

//   if (document.visibilityState === "visible" && currentChatId) {
//     console.log("Tab visible again, checking connection status");

//     // Set a short delay before checking to avoid unnecessary reloads
//     visibilityTimeout = setTimeout(async () => {
//       // First check if our subscription is still active
//       if (!subscription || subscription.status !== "SUBSCRIBED") {
//         console.log("Reestablishing subscription");
//         setupChatSubscription(currentChatId);

//         // Only fetch new messages, don't completely re-render
//         try {
//           const lastMessageEl = document.querySelector(
//             ".message[data-message-id]:last-child"
//           );

//           if (lastMessageEl) {
//             const lastMsgId = lastMessageEl.getAttribute("data-message-id");

//             // Get messages newer than our last message
//             const { data: newMessages, error } = await supaClient
//               .from("message")
//               .select("*")
//               .eq("chat_id", currentChatId)
//               .gt("msg_id", lastMsgId)
//               .order("msg_date_time", { ascending: true })
//               .order("msg_id", { ascending: true });

//             if (!error && newMessages && newMessages.length > 0) {
//               console.log(
//                 `Found ${newMessages.length} new messages while away`
//               );

//               // Preload all usernames before rendering
//               const userIds = newMessages.map((msg) => msg.senderid);
//               await loadUserNames(userIds);

//               // Add only the new messages without re-rendering everything
//               for (const message of newMessages) {
//                 if (!processedMessageIds.has(message.msg_id)) {
//                   processedMessageIds.add(message.msg_id);
//                   await addMessageToChat(message);
//                 }
//               }
//             }
//           } else {
//             // If there are no messages, do a full refresh
//             const messages = await retrieveChatMessages(currentChatId);

//             // Preload all usernames before rendering
//             const userIds = messages.map((msg) => msg.senderid);
//             await loadUserNames(userIds);

//             renderChatMessages(messages, true); // no animation
//           }
//         } catch (error) {
//           console.error("Error refreshing messages:", error);
//         }
//       }
//     }, 500); // Short delay to avoid unnecessary work
//   }
// });

/////////////////////////// V3 ////////////////////
// import { supaClient } from "./app.js";
// import { getUserName } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const chatName = document.querySelector(".chat__name");
// const chats = document.querySelector(".chats");
// const collapseButton = document.querySelector(".collapse__chat-btn");
// const chatView = document.querySelector(".chat__view");
// const chatListContainer = document.querySelector(".chats__list");
// // const courseId = sessionStorage.getItem("courseId");
// let currentChatId = null;
// let subscription = null;
// // Track messages we've already seen to prevent duplicates
// let processedMessageIds = new Set();
// // Cache for user names to reduce API calls
// const userNameCache = new Map();

// // Prefetch the current user's name and cache it
// if (studentId) {
//   getUserName(studentId)
//     .then((name) => {
//       userNameCache.set(studentId, name);
//     })
//     .catch(() => {
//       userNameCache.set(studentId, "Unknown User");
//     });
// }

// // Helper function to safely get user names with caching
// async function safeGetUserName(userId) {
//   if (!userId) {
//     return "Unknown User";
//   }

//   // Check cache first
//   if (userNameCache.has(userId)) {
//     return userNameCache.get(userId);
//   }

//   try {
//     const name = await getUserName(userId);
//     userNameCache.set(userId, name); // Cache the result
//     return name;
//   } catch (error) {
//     console.error(`Error getting username for ID ${userId}:`, error);
//     userNameCache.set(userId, "Unknown User"); // Cache the fallback
//     return "Unknown User";
//   }
// }

// // Batch username loading to avoid multiple sequential requests
// async function loadUserNames(userIds) {
//   const uniqueIds = [...new Set(userIds)].filter(
//     (id) => id && !userNameCache.has(id)
//   );

//   if (uniqueIds.length === 0) return;

//   // Load user names in parallel
//   const promises = uniqueIds.map(async (userId) => {
//     try {
//       const name = await getUserName(userId);
//       userNameCache.set(userId, name);
//     } catch (error) {
//       userNameCache.set(userId, "Unknown User");
//     }
//   });

//   await Promise.all(promises);
// }

// function openChat() {
//   chats.classList.add("open");
//   chatView.classList.add("active");
// }

// function closeChat() {
//   chats.classList.remove("open");
//   chatView.classList.remove("active");
//   document.querySelectorAll(".chat__item").forEach((chat) => {
//     chat.classList.remove("active");
//   });
// }

// function attachChatClickListeners() {
//   document.querySelectorAll(".chat__item").forEach((chatItem) => {
//     chatItem.addEventListener("click", async (e) => {
//       // Close chat list and open chat view
//       if (
//         e.target.closest(".chat__item") &&
//         !e.target.closest(".chat__item").classList.contains("active")
//       ) {
//         document.querySelectorAll(".chat__item").forEach((item) => {
//           item.classList.remove("active");
//         });
//         e.target.closest(".chat__item").classList.add("active");
//         openChat();
//       }

//       const chatId = chatItem.getAttribute("data-chat-id");

//       // Don't reload if we're already on this chat
//       if (currentChatId === chatId) {
//         return;
//       }

//       // Unsubscribe from previous chat subscription if exists
//       if (subscription) {
//         subscription.unsubscribe();
//       }

//       currentChatId = chatId;
//       const chatNameText = chatItem.getAttribute("data-chat-name");

//       // Reset processed message IDs when changing chats
//       processedMessageIds = new Set();

//       // Show loading indicator
//       const messagesContainer = document.querySelector(
//         ".chat__messages-container"
//       );
//       messagesContainer.innerHTML =
//         '<div class="loading-messages loader"></div>';

//       // Load chat details
//       const chatDetailsPromise = getChatDetails(chatId);
//       const messagesPromise = retrieveChatMessages(chatId);

//       // Load chat details and messages in parallel
//       try {
//         const [chatDetails, chatMessages] = await Promise.all([
//           chatDetailsPromise,
//           messagesPromise,
//         ]);

//         // Render chat details
//         renderChatDetails(chatDetails);

//         // Extract all user IDs for parallel name loading
//         const userIds = chatMessages.map((msg) => msg.senderid);
//         userIds.push(studentId); // Include current user

//         // Prefetch all user names in parallel before rendering messages
//         await loadUserNames(userIds);

//         // Only render if this is still the current chat
//         if (currentChatId === chatId) {
//           // Render chat messages
//           renderChatMessages(chatMessages, false); // false = no animation on initial load
//         }
//       } catch (error) {
//         console.error("Error loading messages:", error);
//         messagesContainer.innerHTML =
//           '<div class="error-messages">Error loading messages. Please try again.</div>';
//       }

//       // Set up real-time subscription for this chat
//       setupChatSubscription(chatId);

//       // Set up event listener for send button
//       setupSendMessageHandler(chatId);
//     });
//   });

//   collapseButton.addEventListener("click", closeChat);
// }

// function setupSendMessageHandler(chatId) {
//   const sendButton = document.querySelector(".send__message-btn");
//   const messageInput = document.querySelector(".message__input");

//   // First, remove any existing event listeners by cloning the elements
//   const newSendButton = sendButton.cloneNode(true);
//   sendButton.parentNode.replaceChild(newSendButton, sendButton);

//   const newMessageInput = messageInput.cloneNode(true);
//   messageInput.parentNode.replaceChild(newMessageInput, messageInput);

//   // Add event listener to the send button
//   newSendButton.addEventListener("click", async () => {
//     const messageContent = newMessageInput.value.trim();
//     if (messageContent) {
//       await sendMessage(chatId, messageContent);
//       newMessageInput.value = ""; // Clear input after sending
//       newMessageInput.focus(); // Keep focus on input for better UX
//     }
//   });

//   // Add event listener for Enter key
//   newMessageInput.addEventListener("keypress", async (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault(); // Prevent default to avoid form submission
//       const messageContent = newMessageInput.value.trim();
//       if (messageContent) {
//         await sendMessage(chatId, messageContent);
//         newMessageInput.value = ""; // Clear input after sending
//       }
//     }
//   });

//   // Focus the input field for immediate typing
//   newMessageInput.focus();
// }

// let isReconnecting = false;

// function setupChatSubscription(chatId) {
//   // Unsubscribe from any existing subscription first
//   if (subscription) {
//     subscription.unsubscribe();
//   }

//   // Create a more robust subscription with better error handling
//   try {
//     subscription = supaClient
//       .channel(`chat:${chatId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "message",
//           filter: `chat_id=eq.${chatId}`,
//         },
//         (payload) => {
//           // Only process if this is still the current chat
//           if (currentChatId === chatId) {
//             if (!processedMessageIds.has(payload.new.msg_id)) {
//               processedMessageIds.add(payload.new.msg_id);

//               // Pre-load the sender's name if needed before adding the message
//               if (
//                 payload.new.senderid &&
//                 !userNameCache.has(payload.new.senderid)
//               ) {
//                 safeGetUserName(payload.new.senderid).then(() => {
//                   addMessageToChat(payload.new);
//                 });
//               } else {
//                 addMessageToChat(payload.new);
//               }
//             }
//           }
//         }
//       )
//       .subscribe((status) => {
//         console.log("Subscription status:", status);
//         if (status === "SUBSCRIBED") {
//           console.log(`Successfully subscribed to chat ${chatId}`);
//           isReconnecting = false;
//         } else if (status === "CHANNEL_ERROR" && !isReconnecting) {
//           console.error(`Error subscribing to chat ${chatId}`);
//           isReconnecting = true;
//           // Try to resubscribe after a delay if there was an error
//           setTimeout(() => {
//             if (currentChatId === chatId) {
//               // Only reconnect if still on this chat
//               setupChatSubscription(chatId);
//             }
//           }, 3000);
//         }
//       });
//   } catch (error) {
//     console.error("Error setting up subscription:", error);
//     // Try to resubscribe after a delay
//     if (!isReconnecting) {
//       isReconnecting = true;
//       setTimeout(() => {
//         if (currentChatId === chatId) {
//           // Only reconnect if still on this chat
//           setupChatSubscription(chatId);
//           isReconnecting = false;
//         }
//       }, 3000);
//     }
//   }
// }

// // Create a single message element for faster DOM operations
// function createMessageElement(message, animate = true) {
//   // Create the new message element
//   const messageEl = document.createElement("div");
//   messageEl.setAttribute("data-message-id", message.msg_id);
//   messageEl.setAttribute(
//     "data-timestamp",
//     new Date(message.msg_date_time).getTime()
//   );

//   const messageSenderName = document.createElement("p");
//   const messageContent = document.createElement("p");
//   const messageTime = document.createElement("p");

//   messageSenderName.classList.add("message__sender-name");
//   messageContent.classList.add("message__content");
//   messageTime.classList.add("message__time");

//   messageContent.textContent = message.msg_content || "";
//   messageTime.textContent = formatDateTime(new Date(message.msg_date_time));

//   // Check if the message is from the current user
//   const isSentByCurrentUser = message.senderid === +studentId;

//   // Add message classes based on sender
//   if (isSentByCurrentUser) {
//     messageEl.classList.add("sent");
//     messageSenderName.textContent = userNameCache.get(studentId) || "You";
//   } else {
//     messageEl.classList.add("received");
//     messageSenderName.textContent =
//       userNameCache.get(message.senderid) || "User";
//   }

//   messageEl.classList.add("message");

//   messageEl.appendChild(messageSenderName);
//   messageEl.appendChild(messageContent);
//   messageEl.appendChild(messageTime);

//   // Add animation if needed
//   if (animate) {
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Use requestAnimationFrame for smoother animations
//     requestAnimationFrame(() => {
//       messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";
//     });
//   }

//   return messageEl;
// }

// async function addMessageToChat(message) {
//   // First check if we already have this message in the DOM
//   const existingMessage = document.querySelector(
//     `[data-message-id="${message.msg_id}"]`
//   );
//   if (existingMessage) {
//     return; // Skip if already exists
//   }

//   // Create the message element
//   const messagesContainer = document.querySelector(".chat__messages-container");
//   const messageEl = createMessageElement(message, true);

//   // Modified: Always append the message at the end (chronological order)
//   messagesContainer.appendChild(messageEl);

//   // Scroll to the bottom to show the new message
//   scrollToBottom();

//   // Update just the chat list item with this message, not the entire chat list
//   updateLastMessageInChatList(
//     message.chat_id,
//     message.msg_content,
//     message.senderid
//   );
// }

// // Use a more efficient scrolling method with requestAnimationFrame
// function scrollToBottom() {
//   requestAnimationFrame(() => {
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
//   });
// }

// function formatDateTime(date) {
//   // Adjust for local timezone and format
//   const options = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   };

//   // Get just the time part for today's messages
//   const today = new Date();
//   if (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   ) {
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Show full date for older messages
//   return date.toLocaleString("en-US", options);
// }

// async function renderChatList() {
//   try {
//     chatListContainer.innerHTML = '<div class="loader loading-chats"></div>';
//     const chats = await getChatList();

//     if (chats.length === 0) {
//       // Display a message when no chats are available
//       chatListContainer.innerHTML = `
//         <li class="no-chats">
//           <p>No chats available</p>
//         </li>
//       `;
//       return;
//     }

//     // Create a document fragment for batch DOM updates
//     const fragment = document.createDocumentFragment();
//     const pendingChats = [];
//     // const chatImg
//     // First render the basic chat list structure
//     for (const chat of chats) {
//       const chatItem = document.createElement("li");
//       chatItem.className = "chat__item";
//       chatItem.setAttribute("data-chat-id", chat.chat_id);
//       chatItem.setAttribute("data-chat-name", chat.chat_name);

//       chatItem.innerHTML = `
//         <div class="chat__img"></div>
//         <div class="chat__details">
//           <div class="chat__name">${chat.chat_name}</div>
//           <div class="chat__last-message">Loading...</div>
//         </div>
//       `;

//       fragment.appendChild(chatItem);
//       pendingChats.push(chat.chat_id);
//     }

//     // Update the DOM once with all chat items
//     chatListContainer.innerHTML = "";
//     chatListContainer.appendChild(fragment);

//     // Attach click listeners immediately
//     attachChatClickListeners();

//     // Then load last messages for each chat in parallel
//     const lastMessagePromises = pendingChats.map(async (chatId) => {
//       const lastMessage = await getLastMessage(chatId);
//       if (lastMessage) {
//         // Ensure we have the sender name
//         if (lastMessage.senderid && !userNameCache.has(lastMessage.senderid)) {
//           await safeGetUserName(lastMessage.senderid);
//         }
//         return { chatId, lastMessage };
//       }
//       return { chatId, lastMessage: null };
//     });

//     // Update last messages as they come in
//     const results = await Promise.all(lastMessagePromises);

//     // Update the UI with last message data
//     for (const { chatId, lastMessage } of results) {
//       const chatItem = document.querySelector(
//         `.chat__item[data-chat-id="${chatId}"]`
//       );
//       if (!chatItem) continue;

//       const lastMessageEl = chatItem.querySelector(".chat__last-message");
//       if (!lastMessageEl) continue;

//       let messageText = "No messages yet...";
//       let senderPrefix = "";

//       if (lastMessage) {
//         messageText = truncateText(lastMessage.msg_content, 30);

//         if (+studentId === +lastMessage.senderid) {
//           senderPrefix = "You: ";
//         } else if (
//           lastMessage.senderid &&
//           userNameCache.has(lastMessage.senderid)
//         ) {
//           senderPrefix = `${userNameCache.get(lastMessage.senderid)}: `;
//         }
//       }

//       lastMessageEl.textContent = senderPrefix + messageText;
//     }
//   } catch (error) {
//     console.error("Error rendering chat list:", error);
//     chatListContainer.innerHTML = `
//       <li class="error-message">
//         <p>Error loading chats. Please try again.</p>
//       </li>
//     `;
//   }
// }

// function truncateText(text, maxLength) {
//   if (!text) return "";
//   if (text.length <= maxLength) return text;
//   return text.substring(0, maxLength) + "...";
// }

// async function getLastMessage(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: false })
//     .limit(1);

//   if (error || !data || data.length === 0) {
//     return null;
//   }
//   return data[0];
// }

// async function getChatList() {
//   const { data, error } = await supaClient
//     .from("student_chat")
//     .select("*")
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching chat list:", error);
//     return [];
//   }

//   if (data && data.length > 0) {
//     const { data: chats, error } = await supaClient
//       .from("chat")
//       .select("*")
//       .in(
//         "chat_id",
//         data.map((chat) => chat.chat_id)
//       );

//     if (error) {
//       console.error("Error fetching chat details:", error);
//       return [];
//     } else {
//       return chats;
//     }
//   }
//   return [];
// }

// async function getChatDetails(chatId) {
//   const { data, error } = await supaClient
//     .from("chat")
//     .select("*")
//     .eq("chat_id", chatId)
//     .single();

//   if (error) {
//     console.error("Error fetching chat details:", error);
//     return null;
//   } else {
//     return data;
//   }
// }

// function renderChatDetails(chat) {
//   if (chat) {
//     chatName.textContent = chat.chat_name;
//   }
// }

// async function retrieveChatMessages(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: true }) // Primary sort by timestamp
//     .order("msg_id", { ascending: true }); // Secondary sort by message_id for consistency

//   if (error) {
//     console.error("Error fetching chat messages:", error);
//     return [];
//   } else {
//     // Build our processed message IDs set
//     data.forEach((msg) => {
//       if (msg.msg_id) {
//         processedMessageIds.add(msg.msg_id);
//       }
//     });

//     return data;
//   }
// }

// function renderChatMessages(messages, animate = true) {
//   // Get the messages container
//   const messagesContainer = document.querySelector(".chat__messages-container");

//   // Clear existing messages
//   messagesContainer.innerHTML = "";

//   if (!messages || messages.length === 0) {
//     // Show a message when there are no messages
//     const emptyMessage = document.createElement("div");
//     emptyMessage.classList.add("empty-messages");
//     emptyMessage.textContent = "No messages yet. Start the conversation!";
//     messagesContainer.appendChild(emptyMessage);
//     return;
//   }

//   // Modified: Ensure messages are properly sorted by timestamp (oldest to newest)
//   messages.sort((a, b) => {
//     const timeA = new Date(a.msg_date_time).getTime();
//     const timeB = new Date(b.msg_date_time).getTime();

//     // If timestamps are equal, sort by message_id as secondary criteria
//     if (timeA === timeB) {
//       return a.msg_id - b.msg_id;
//     }

//     return timeA - timeB;
//   });

//   // Performance optimization: Create a document fragment and batch render
//   const fragment = document.createDocumentFragment();

//   // For large message sets, use virtual rendering
//   const shouldVirtualize = messages.length > 100;

//   // If virtualizing, only render the last 50 messages initially
//   const messagesToRender = shouldVirtualize ? messages.slice(-50) : messages;

//   // Render messages in batches using requestAnimationFrame for better performance
//   const renderBatch = (startIdx, endIdx) => {
//     for (let i = startIdx; i < endIdx && i < messagesToRender.length; i++) {
//       const message = messagesToRender[i];
//       if (!message) continue;

//       const messageEl = createMessageElement(message, false); // Don't animate batches
//       fragment.appendChild(messageEl);
//     }

//     // Add this batch to the container
//     messagesContainer.appendChild(fragment);
//   };

//   // For small message sets, render all at once
//   if (!shouldVirtualize) {
//     renderBatch(0, messagesToRender.length);
//   } else {
//     // For large message sets, render in batches of 20
//     let currentBatch = 0;
//     const batchSize = 20;

//     const processNextBatch = () => {
//       const startIdx = currentBatch * batchSize;
//       const endIdx = startIdx + batchSize;

//       if (startIdx < messagesToRender.length) {
//         renderBatch(startIdx, endIdx);
//         currentBatch++;
//         requestAnimationFrame(processNextBatch);
//       } else {
//         // All batches processed
//         scrollToBottom();
//       }
//     };

//     // Start rendering batches
//     processNextBatch();
//   }

//   // Scroll to the bottom immediately for small message sets
//   if (!shouldVirtualize) {
//     scrollToBottom();
//   }
// }

// // Updated function to handle last message in chat list with sender ID
// async function updateLastMessageInChatList(chatId, messageContent, senderId) {
//   const chatItem = document.querySelector(
//     `.chat__item[data-chat-id="${chatId}"]`
//   );
//   if (chatItem) {
//     const lastMessageEl = chatItem.querySelector(".chat__last-message");
//     if (lastMessageEl) {
//       let prefix = "";

//       // Determine the prefix based on sender
//       if (senderId === +studentId) {
//         prefix = "You: ";
//       } else if (senderId && userNameCache.has(senderId)) {
//         prefix = `${userNameCache.get(senderId)}: `;
//       }

//       lastMessageEl.textContent = prefix + truncateText(messageContent, 30);

//       // Move this chat to the top of the list (most recent)
//       const chatsList = chatItem.parentElement;
//       if (chatsList && chatsList.firstChild !== chatItem) {
//         // Use animation API for smoother transitions
//         chatItem.style.transition = "none";
//         chatItem.style.opacity = "0.7";

//         // Move to top
//         chatsList.insertBefore(chatItem, chatsList.firstChild);

//         // Trigger reflow
//         void chatItem.offsetWidth;

//         // Animate back to normal
//         chatItem.style.transition = "opacity 0.3s ease";
//         chatItem.style.opacity = "1";
//       }
//     }
//   }
// }

// async function sendMessage(chatId, messageContent) {
//   try {
//     const timestamp = new Date();

//     // Create a temporary visual placeholder for the message with a unique ID
//     const tempMessageId = `temp-${Date.now()}`;
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );

//     // Remove any "empty messages" placeholder if it exists
//     const emptyPlaceholder = messagesContainer.querySelector(".empty-messages");
//     if (emptyPlaceholder) {
//       emptyPlaceholder.remove();
//     }

//     // If we don't have the current user's name yet, get it
//     if (!userNameCache.has(studentId)) {
//       await safeGetUserName(studentId);
//     }

//     // Create temporary message element
//     const messageEl = document.createElement("div");
//     messageEl.id = tempMessageId;
//     messageEl.classList.add("message", "sent", "pending");
//     // Add timestamp as data attribute for sorting
//     messageEl.setAttribute("data-timestamp", timestamp.getTime());

//     const messageSenderName = document.createElement("p");
//     messageSenderName.classList.add("message__sender-name");
//     messageSenderName.textContent = userNameCache.get(studentId) || "You";

//     const messageContent_el = document.createElement("p");
//     messageContent_el.classList.add("message__content");
//     messageContent_el.textContent = messageContent;

//     const messageTime = document.createElement("p");
//     messageTime.classList.add("message__time");
//     messageTime.textContent = formatDateTime(timestamp);

//     messageEl.appendChild(messageSenderName);
//     messageEl.appendChild(messageContent_el);
//     messageEl.appendChild(messageTime);

//     // Modified: Append message to the end for chronological order
//     messagesContainer.appendChild(messageEl);

//     // Add animation for a smoother appearance
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Use requestAnimationFrame for smoother animations
//     requestAnimationFrame(() => {
//       messageEl.style.transition = "opacity 0.2s ease, transform 0.2s ease";
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";

//       // Scroll to bottom to show the new message
//       scrollToBottom();
//     });

//     // Send the actual message to the database
//     const { data, error } = await supaClient
//       .from("message")
//       .insert({
//         chat_id: chatId,
//         msg_content: messageContent,
//         senderid: studentId,
//         msg_date_time: timestamp.toISOString(),
//       })
//       .select();

//     if (error) {
//       console.error("Error sending message:", error);
//       messageEl.classList.add("error");
//       messageTime.textContent = "Failed to send";

//       // Add retry button
//       const retryButton = document.createElement("button");
//       retryButton.classList.add("retry-button");
//       retryButton.textContent = "Retry";
//       retryButton.addEventListener("click", () => {
//         // Remove the failed message
//         messageEl.remove();
//         // Try sending again
//         sendMessage(chatId, messageContent);
//       });
//       messageEl.appendChild(retryButton);
//     } else {
//       console.log("Message sent:", data);

//       // Instead of removing the placeholder, just mark it as confirmed and add the ID
//       messageEl.classList.remove("pending");
//       messageEl.classList.add("confirmed");
//       messageEl.setAttribute("data-message-id", data[0].msg_id);

//       // Add this message ID to our processed set to prevent duplication
//       if (data && data[0] && data[0].msg_id) {
//         processedMessageIds.add(data[0].msg_id);
//       }

//       // Update just the chat list item with this message
//       updateLastMessageInChatList(chatId, messageContent, studentId);
//     }
//   } catch (err) {
//     console.error("Exception sending message:", err);
//   }
// }

// // Initialize chat list
// renderChatList();

// // When the page is about to be unloaded, unsubscribe from any active subscription
// window.addEventListener("beforeunload", () => {
//   if (subscription) {
//     subscription.unsubscribe();
//   }
// });

// // A more intelligent visibility change handler that doesn't cause flickering
// let visibilityTimeout = null;
// document.addEventListener("visibilitychange", () => {
//   // Clear any pending timeout
//   if (visibilityTimeout) {
//     clearTimeout(visibilityTimeout);
//   }

//   if (document.visibilityState === "visible" && currentChatId) {
//     console.log("Tab visible again, checking connection status");

//     // Set a short delay before checking to avoid unnecessary reloads
//     visibilityTimeout = setTimeout(async () => {
//       // First check if our subscription is still active
//       if (!subscription || subscription.status !== "SUBSCRIBED") {
//         console.log("Reestablishing subscription");
//         setupChatSubscription(currentChatId);

//         // Only fetch new messages, don't completely re-render
//         try {
//           const lastMessageEl = document.querySelector(
//             ".message[data-message-id]:last-child"
//           );

//           if (lastMessageEl) {
//             const lastMsgId = lastMessageEl.getAttribute("data-message-id");

//             // Get messages newer than our last message
//             const { data: newMessages, error } = await supaClient
//               .from("message")
//               .select("*")
//               .eq("chat_id", currentChatId)
//               .gt("msg_id", lastMsgId)
//               .order("msg_date_time", { ascending: true })
//               .order("msg_id", { ascending: true });

//             if (!error && newMessages && newMessages.length > 0) {
//               console.log(
//                 `Found ${newMessages.length} new messages while away`
//               );

//               // Preload all usernames before rendering
//               const userIds = newMessages.map((msg) => msg.senderid);
//               await loadUserNames(userIds);

//               // Add only the new messages without re-rendering everything
//               for (const message of newMessages) {
//                 if (!processedMessageIds.has(message.msg_id)) {
//                   processedMessageIds.add(message.msg_id);
//                   await addMessageToChat(message);
//                 }
//               }
//             }
//           } else {
//             // If there are no messages, do a full refresh
//             const messages = await retrieveChatMessages(currentChatId);

//             // Preload all usernames before rendering
//             const userIds = messages.map((msg) => msg.senderid);
//             await loadUserNames(userIds);

//             renderChatMessages(messages, true); // no animation
//           }
//         } catch (error) {
//           console.error("Error refreshing messages:", error);
//         }
//       }
//     }, 500); // Short delay to avoid unnecessary work
//   }
// });

////////////////////// V4 ///////////////////////
// import { supaClient } from "./app.js";
// import { getUserName } from "./app.js";
// const studentId = sessionStorage.getItem("studentId");
// const chatName = document.querySelector(".chat__name");
// const chats = document.querySelector(".chats");
// const collapseButton = document.querySelector(".collapse__chat-btn");
// const chatView = document.querySelector(".chat__view");
// const chatListContainer = document.querySelector(".chats__list");
// let currentChatId = null;
// let subscription = null;
// // Track messages we've already seen to prevent duplicates
// let processedMessageIds = new Set();
// // Cache for user names to reduce API calls
// const userNameCache = new Map();

// // NEW: Track all active chat IDs the user is part of
// let userChats = [];
// // NEW: Store subscriptions for all chats
// const chatSubscriptions = {};

// // Prefetch the current user's name and cache it
// if (studentId) {
//   getUserName(studentId)
//     .then((name) => {
//       userNameCache.set(studentId, name);
//     })
//     .catch(() => {
//       userNameCache.set(studentId, "Unknown User");
//     });
// }

// // Helper function to safely get user names with caching
// async function safeGetUserName(userId) {
//   if (!userId) {
//     return "Unknown User";
//   }

//   // Check cache first
//   if (userNameCache.has(userId)) {
//     return userNameCache.get(userId);
//   }

//   try {
//     const name = await getUserName(userId);
//     userNameCache.set(userId, name); // Cache the result
//     return name;
//   } catch (error) {
//     console.error(`Error getting username for ID ${userId}:`, error);
//     userNameCache.set(userId, "Unknown User"); // Cache the fallback
//     return "Unknown User";
//   }
// }

// // Batch username loading to avoid multiple sequential requests
// async function loadUserNames(userIds) {
//   const uniqueIds = [...new Set(userIds)].filter(
//     (id) => id && !userNameCache.has(id)
//   );

//   if (uniqueIds.length === 0) return;

//   // Load user names in parallel
//   const promises = uniqueIds.map(async (userId) => {
//     try {
//       const name = await getUserName(userId);
//       userNameCache.set(userId, name);
//     } catch (error) {
//       userNameCache.set(userId, "Unknown User");
//     }
//   });

//   await Promise.all(promises);
// }

// function openChat() {
//   chats.classList.add("open");
//   chatView.classList.add("active");
// }

// function closeChat() {
//   chats.classList.remove("open");
//   chatView.classList.remove("active");
//   document.querySelectorAll(".chat__item").forEach((chat) => {
//     chat.classList.remove("active");
//   });
// }

// function attachChatClickListeners() {
//   document.querySelectorAll(".chat__item").forEach((chatItem) => {
//     chatItem.addEventListener("click", async (e) => {
//       // Close chat list and open chat view
//       if (
//         e.target.closest(".chat__item") &&
//         !e.target.closest(".chat__item").classList.contains("active")
//       ) {
//         document.querySelectorAll(".chat__item").forEach((item) => {
//           item.classList.remove("active");
//         });
//         e.target.closest(".chat__item").classList.add("active");
//         openChat();
//       }

//       const chatId = chatItem.getAttribute("data-chat-id");

//       // Don't reload if we're already on this chat
//       if (currentChatId === chatId) {
//         return;
//       }

//       // Unsubscribe from previous chat subscription if exists
//       if (subscription) {
//         subscription.unsubscribe();
//       }

//       currentChatId = chatId;
//       const chatNameText = chatItem.getAttribute("data-chat-name");

//       // Reset processed message IDs when changing chats
//       processedMessageIds = new Set();

//       // Show loading indicator
//       const messagesContainer = document.querySelector(
//         ".chat__messages-container"
//       );
//       messagesContainer.innerHTML =
//         '<div class="loading-messages loader"></div>';

//       // Load chat details
//       const chatDetailsPromise = getChatDetails(chatId);
//       const messagesPromise = retrieveChatMessages(chatId);

//       // Load chat details and messages in parallel
//       try {
//         const [chatDetails, chatMessages] = await Promise.all([
//           chatDetailsPromise,
//           messagesPromise,
//         ]);

//         // Render chat details
//         renderChatDetails(chatDetails);

//         // Extract all user IDs for parallel name loading
//         const userIds = chatMessages.map((msg) => msg.senderid);
//         userIds.push(studentId); // Include current user

//         // Prefetch all user names in parallel before rendering messages
//         await loadUserNames(userIds);

//         // Only render if this is still the current chat
//         if (currentChatId === chatId) {
//           // Render chat messages
//           renderChatMessages(chatMessages, false); // false = no animation on initial load
//         }
//       } catch (error) {
//         console.error("Error loading messages:", error);
//         messagesContainer.innerHTML =
//           '<div class="error-messages">Error loading messages. Please try again.</div>';
//       }

//       // Set up event listener for send button
//       setupSendMessageHandler(chatId);
//     });
//   });

//   collapseButton.addEventListener("click", closeChat);
// }

// function setupSendMessageHandler(chatId) {
//   const sendButton = document.querySelector(".send__message-btn");
//   const messageInput = document.querySelector(".message__input");

//   // First, remove any existing event listeners by cloning the elements
//   const newSendButton = sendButton.cloneNode(true);
//   sendButton.parentNode.replaceChild(newSendButton, sendButton);

//   const newMessageInput = messageInput.cloneNode(true);
//   messageInput.parentNode.replaceChild(newMessageInput, messageInput);

//   // Add event listener to the send button
//   newSendButton.addEventListener("click", async () => {
//     const messageContent = newMessageInput.value.trim();
//     if (messageContent) {
//       await sendMessage(chatId, messageContent);
//       newMessageInput.value = ""; // Clear input after sending
//       newMessageInput.focus(); // Keep focus on input for better UX
//     }
//   });

//   // Add event listener for Enter key
//   newMessageInput.addEventListener("keypress", async (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault(); // Prevent default to avoid form submission
//       const messageContent = newMessageInput.value.trim();
//       if (messageContent) {
//         await sendMessage(chatId, messageContent);
//         newMessageInput.value = ""; // Clear input after sending
//       }
//     }
//   });

//   // Focus the input field for immediate typing
//   newMessageInput.focus();
// }

// let isReconnecting = false;

// // NEW: Set up subscriptions for all user chats
// function setupAllChatSubscriptions() {
//   // Clean up existing subscriptions
//   Object.values(chatSubscriptions).forEach((sub) => {
//     if (sub) sub.unsubscribe();
//   });

//   // Set up a subscription for each chat
//   userChats.forEach((chatId) => {
//     setupChatSubscription(chatId);
//   });
// }

// function setupChatSubscription(chatId) {
//   // Unsubscribe from any existing subscription for this chat
//   if (chatSubscriptions[chatId]) {
//     chatSubscriptions[chatId].unsubscribe();
//   }

//   // Create a more robust subscription with better error handling
//   try {
//     chatSubscriptions[chatId] = supaClient
//       .channel(`chat:${chatId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "message",
//           filter: `chat_id=eq.${chatId}`,
//         },
//         (payload) => {
//           if (!processedMessageIds.has(payload.new.msg_id)) {
//             processedMessageIds.add(payload.new.msg_id);

//             // Pre-load the sender's name if needed before processing the message
//             if (
//               payload.new.senderid &&
//               !userNameCache.has(payload.new.senderid)
//             ) {
//               safeGetUserName(payload.new.senderid).then(() => {
//                 // If this is the current open chat, add message to chat view
//                 if (currentChatId === chatId) {
//                   addMessageToChat(payload.new);
//                 }

//                 // Update the chat list item with this message regardless
//                 updateLastMessageInChatList(
//                   chatId,
//                   payload.new.msg_content,
//                   payload.new.senderid
//                 );
//               });
//             } else {
//               // If this is the current open chat, add message to chat view
//               if (currentChatId === chatId) {
//                 addMessageToChat(payload.new);
//               }

//               // Update the chat list item with this message regardless
//               updateLastMessageInChatList(
//                 chatId,
//                 payload.new.msg_content,
//                 payload.new.senderid
//               );
//             }
//           }
//         }
//       )
//       .subscribe((status) => {
//         console.log(`Subscription status for chat ${chatId}:`, status);
//         if (status === "SUBSCRIBED") {
//           console.log(`Successfully subscribed to chat ${chatId}`);
//           isReconnecting = false;
//         } else if (status === "CHANNEL_ERROR" && !isReconnecting) {
//           console.error(`Error subscribing to chat ${chatId}`);
//           isReconnecting = true;
//           // Try to resubscribe after a delay if there was an error
//           setTimeout(() => {
//             setupChatSubscription(chatId);
//             isReconnecting = false;
//           }, 3000);
//         }
//       });

//     // Store the subscription reference
//     if (chatId === currentChatId) {
//       subscription = chatSubscriptions[chatId];
//     }
//   } catch (error) {
//     console.error(`Error setting up subscription for chat ${chatId}:`, error);
//     // Try to resubscribe after a delay
//     if (!isReconnecting) {
//       isReconnecting = true;
//       setTimeout(() => {
//         setupChatSubscription(chatId);
//         isReconnecting = false;
//       }, 3000);
//     }
//   }
// }

// // Create a single message element for faster DOM operations
// function createMessageElement(message, animate = true) {
//   // Create the new message element
//   const messageEl = document.createElement("div");
//   messageEl.setAttribute("data-message-id", message.msg_id);
//   messageEl.setAttribute(
//     "data-timestamp",
//     new Date(message.msg_date_time).getTime()
//   );

//   const messageSenderName = document.createElement("p");
//   const messageContent = document.createElement("p");
//   const messageTime = document.createElement("p");

//   messageSenderName.classList.add("message__sender-name");
//   messageContent.classList.add("message__content");
//   messageTime.classList.add("message__time");

//   messageContent.textContent = message.msg_content || "";
//   messageTime.textContent = formatDateTime(new Date(message.msg_date_time));

//   // Check if the message is from the current user
//   const isSentByCurrentUser = message.senderid === +studentId;

//   // Add message classes based on sender
//   if (isSentByCurrentUser) {
//     messageEl.classList.add("sent");
//     messageSenderName.textContent = userNameCache.get(studentId) || "You";
//   } else {
//     messageEl.classList.add("received");
//     messageSenderName.textContent =
//       userNameCache.get(message.senderid) || "User";
//   }

//   messageEl.classList.add("message");

//   messageEl.appendChild(messageSenderName);
//   messageEl.appendChild(messageContent);
//   messageEl.appendChild(messageTime);

//   // Add animation if needed
//   if (animate) {
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Use requestAnimationFrame for smoother animations
//     requestAnimationFrame(() => {
//       messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";
//     });
//   }

//   return messageEl;
// }

// async function addMessageToChat(message) {
//   // First check if we already have this message in the DOM
//   const existingMessage = document.querySelector(
//     `[data-message-id="${message.msg_id}"]`
//   );
//   if (existingMessage) {
//     return; // Skip if already exists
//   }

//   // Create the message element
//   const messagesContainer = document.querySelector(".chat__messages-container");
//   const messageEl = createMessageElement(message, true);

//   // Modified: Always append the message at the end (chronological order)
//   messagesContainer.appendChild(messageEl);

//   // Scroll to the bottom to show the new message
//   scrollToBottom();
// }

// // Use a more efficient scrolling method with requestAnimationFrame
// function scrollToBottom() {
//   requestAnimationFrame(() => {
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
//   });
// }

// function formatDateTime(date) {
//   // Adjust for local timezone and format
//   const options = {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   };

//   // Get just the time part for today's messages
//   const today = new Date();
//   if (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   ) {
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   }

//   // Show full date for older messages
//   return date.toLocaleString("en-US", options);
// }

// async function renderChatList() {
//   try {
//     chatListContainer.innerHTML = '<div class="loader loading-chats"></div>';
//     const chats = await getChatList();

//     // Store the chat IDs for subscription
//     userChats = chats.map((chat) => chat.chat_id);

//     if (chats.length === 0) {
//       // Display a message when no chats are available
//       chatListContainer.innerHTML = `
//         <li class="no-chats">
//           <p>No chats available</p>
//         </li>
//       `;
//       return;
//     }

//     // Create a document fragment for batch DOM updates
//     const fragment = document.createDocumentFragment();
//     const pendingChats = [];

//     // First render the basic chat list structure
//     for (const chat of chats) {
//       const chatItem = document.createElement("li");
//       chatItem.className = "chat__item";
//       chatItem.setAttribute("data-chat-id", chat.chat_id);
//       chatItem.setAttribute("data-chat-name", chat.chat_name);

//       chatItem.innerHTML = `
//         <div class="chat__img"></div>
//         <div class="chat__details">
//           <div class="chat__name">${chat.chat_name}</div>
//           <div class="chat__last-message">Loading...</div>
//         </div>
//       `;

//       fragment.appendChild(chatItem);
//       pendingChats.push(chat.chat_id);
//     }

//     // Update the DOM once with all chat items
//     chatListContainer.innerHTML = "";
//     chatListContainer.appendChild(fragment);

//     // Attach click listeners immediately
//     attachChatClickListeners();

//     // Set up subscriptions for all chats
//     setupAllChatSubscriptions();

//     // Then load last messages for each chat in parallel
//     const lastMessagePromises = pendingChats.map(async (chatId) => {
//       const lastMessage = await getLastMessage(chatId);
//       if (lastMessage) {
//         // Ensure we have the sender name
//         if (lastMessage.senderid && !userNameCache.has(lastMessage.senderid)) {
//           await safeGetUserName(lastMessage.senderid);
//         }
//         return { chatId, lastMessage };
//       }
//       return { chatId, lastMessage: null };
//     });

//     // Update last messages as they come in
//     const results = await Promise.all(lastMessagePromises);

//     // Update the UI with last message data
//     for (const { chatId, lastMessage } of results) {
//       const chatItem = document.querySelector(
//         `.chat__item[data-chat-id="${chatId}"]`
//       );
//       if (!chatItem) continue;

//       const lastMessageEl = chatItem.querySelector(".chat__last-message");
//       if (!lastMessageEl) continue;

//       updateChatLastMessageDisplay(lastMessageEl, lastMessage);
//     }
//   } catch (error) {
//     console.error("Error rendering chat list:", error);
//     chatListContainer.innerHTML = `
//       <li class="error-message">
//         <p>Error loading chats. Please try again.</p>
//       </li>
//     `;
//   }
// }

// // NEW: Helper function to update last message display
// function updateChatLastMessageDisplay(lastMessageEl, lastMessage) {
//   let messageText = "No messages yet...";
//   let senderPrefix = "";

//   if (lastMessage) {
//     messageText = truncateText(lastMessage.msg_content, 30);

//     // Properly determine the sender prefix
//     if (+studentId === +lastMessage.senderid) {
//       senderPrefix = "You: ";
//     } else if (
//       lastMessage.senderid &&
//       userNameCache.has(lastMessage.senderid)
//     ) {
//       senderPrefix = `${userNameCache.get(lastMessage.senderid)}: `;
//     }
//   }

//   lastMessageEl.textContent = senderPrefix + messageText;
// }

// function truncateText(text, maxLength) {
//   if (!text) return "";
//   if (text.length <= maxLength) return text;
//   return text.substring(0, maxLength) + "...";
// }

// async function getLastMessage(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: false })
//     .limit(1);

//   if (error || !data || data.length === 0) {
//     return null;
//   }
//   return data[0];
// }

// async function getChatList() {
//   const { data, error } = await supaClient
//     .from("student_chat")
//     .select("*")
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching chat list:", error);
//     return [];
//   }

//   if (data && data.length > 0) {
//     const { data: chats, error } = await supaClient
//       .from("chat")
//       .select("*")
//       .in(
//         "chat_id",
//         data.map((chat) => chat.chat_id)
//       );

//     if (error) {
//       console.error("Error fetching chat details:", error);
//       return [];
//     } else {
//       return chats;
//     }
//   }
//   return [];
// }

// async function getChatDetails(chatId) {
//   const { data, error } = await supaClient
//     .from("chat")
//     .select("*")
//     .eq("chat_id", chatId)
//     .single();

//   if (error) {
//     console.error("Error fetching chat details:", error);
//     return null;
//   } else {
//     return data;
//   }
// }

// function renderChatDetails(chat) {
//   if (chat) {
//     chatName.textContent = chat.chat_name;
//   }
// }

// async function retrieveChatMessages(chatId) {
//   const { data, error } = await supaClient
//     .from("message")
//     .select("*")
//     .eq("chat_id", chatId)
//     .order("msg_date_time", { ascending: true }) // Primary sort by timestamp
//     .order("msg_id", { ascending: true }); // Secondary sort by message_id for consistency

//   if (error) {
//     console.error("Error fetching chat messages:", error);
//     return [];
//   } else {
//     // Build our processed message IDs set
//     data.forEach((msg) => {
//       if (msg.msg_id) {
//         processedMessageIds.add(msg.msg_id);
//       }
//     });

//     return data;
//   }
// }

// function renderChatMessages(messages, animate = true) {
//   // Get the messages container
//   const messagesContainer = document.querySelector(".chat__messages-container");

//   // Clear existing messages
//   messagesContainer.innerHTML = "";

//   if (!messages || messages.length === 0) {
//     // Show a message when there are no messages
//     const emptyMessage = document.createElement("div");
//     emptyMessage.classList.add("empty-messages");
//     emptyMessage.textContent = "No messages yet. Start the conversation!";
//     messagesContainer.appendChild(emptyMessage);
//     return;
//   }

//   // Modified: Ensure messages are properly sorted by timestamp (oldest to newest)
//   messages.sort((a, b) => {
//     const timeA = new Date(a.msg_date_time).getTime();
//     const timeB = new Date(b.msg_date_time).getTime();

//     // If timestamps are equal, sort by message_id as secondary criteria
//     if (timeA === timeB) {
//       return a.msg_id - b.msg_id;
//     }

//     return timeA - timeB;
//   });

//   // Performance optimization: Create a document fragment and batch render
//   const fragment = document.createDocumentFragment();

//   // For large message sets, use virtual rendering
//   const shouldVirtualize = messages.length > 100;

//   // If virtualizing, only render the last 50 messages initially
//   const messagesToRender = shouldVirtualize ? messages.slice(-50) : messages;

//   // Render messages in batches using requestAnimationFrame for better performance
//   const renderBatch = (startIdx, endIdx) => {
//     for (let i = startIdx; i < endIdx && i < messagesToRender.length; i++) {
//       const message = messagesToRender[i];
//       if (!message) continue;

//       const messageEl = createMessageElement(message, false); // Don't animate batches
//       fragment.appendChild(messageEl);
//     }

//     // Add this batch to the container
//     messagesContainer.appendChild(fragment);
//   };

//   // For small message sets, render all at once
//   if (!shouldVirtualize) {
//     renderBatch(0, messagesToRender.length);
//   } else {
//     // For large message sets, render in batches of 20
//     let currentBatch = 0;
//     const batchSize = 20;

//     const processNextBatch = () => {
//       const startIdx = currentBatch * batchSize;
//       const endIdx = startIdx + batchSize;

//       if (startIdx < messagesToRender.length) {
//         renderBatch(startIdx, endIdx);
//         currentBatch++;
//         requestAnimationFrame(processNextBatch);
//       } else {
//         // All batches processed
//         scrollToBottom();
//       }
//     };

//     // Start rendering batches
//     processNextBatch();
//   }

//   // Scroll to the bottom immediately for small message sets
//   if (!shouldVirtualize) {
//     scrollToBottom();
//   }
// }

// // FIXED: Updated function to correctly handle sender prefix in chat list
// async function updateLastMessageInChatList(chatId, messageContent, senderId) {
//   const chatItem = document.querySelector(
//     `.chat__item[data-chat-id="${chatId}"]`
//   );

//   if (chatItem) {
//     const lastMessageEl = chatItem.querySelector(".chat__last-message");
//     if (lastMessageEl) {
//       let prefix = "";

//       // Ensure we have the correct prefix based on the sender
//       if (+senderId === +studentId) {
//         prefix = "You: ";
//       } else if (senderId && userNameCache.has(senderId)) {
//         prefix = `${userNameCache.get(senderId)}: `;
//       } else if (senderId) {
//         // If we don't have the name cached, fetch it first
//         const senderName = await safeGetUserName(senderId);
//         prefix = `${senderName}: `;
//       }

//       lastMessageEl.textContent = prefix + truncateText(messageContent, 30);

//       // Move this chat to the top of the list (most recent)
//       const chatsList = chatItem.parentElement;
//       if (chatsList && chatsList.firstChild !== chatItem) {
//         // Use animation API for smoother transitions
//         chatItem.style.transition = "none";
//         chatItem.style.opacity = "0.7";

//         // Move to top
//         chatsList.insertBefore(chatItem, chatsList.firstChild);

//         // Trigger reflow
//         void chatItem.offsetWidth;

//         // Animate back to normal
//         chatItem.style.transition = "opacity 0.3s ease";
//         chatItem.style.opacity = "1";
//       }
//     }
//   }
// }

// async function sendMessage(chatId, messageContent) {
//   try {
//     const timestamp = new Date();

//     // Create a temporary visual placeholder for the message with a unique ID
//     const tempMessageId = `temp-${Date.now()}`;
//     const messagesContainer = document.querySelector(
//       ".chat__messages-container"
//     );

//     // Remove any "empty messages" placeholder if it exists
//     const emptyPlaceholder = messagesContainer.querySelector(".empty-messages");
//     if (emptyPlaceholder) {
//       emptyPlaceholder.remove();
//     }

//     // If we don't have the current user's name yet, get it
//     if (!userNameCache.has(studentId)) {
//       await safeGetUserName(studentId);
//     }

//     // Create temporary message element
//     const messageEl = document.createElement("div");
//     messageEl.id = tempMessageId;
//     messageEl.classList.add("message", "sent", "pending");
//     // Add timestamp as data attribute for sorting
//     messageEl.setAttribute("data-timestamp", timestamp.getTime());

//     const messageSenderName = document.createElement("p");
//     messageSenderName.classList.add("message__sender-name");
//     messageSenderName.textContent = userNameCache.get(studentId) || "You";

//     const messageContent_el = document.createElement("p");
//     messageContent_el.classList.add("message__content");
//     messageContent_el.textContent = messageContent;

//     const messageTime = document.createElement("p");
//     messageTime.classList.add("message__time");
//     messageTime.textContent = formatDateTime(timestamp);

//     messageEl.appendChild(messageSenderName);
//     messageEl.appendChild(messageContent_el);
//     messageEl.appendChild(messageTime);

//     // Modified: Append message to the end for chronological order
//     messagesContainer.appendChild(messageEl);

//     // Add animation for a smoother appearance
//     messageEl.style.opacity = "0";
//     messageEl.style.transform = "translateY(10px)";

//     // Use requestAnimationFrame for smoother animations
//     requestAnimationFrame(() => {
//       messageEl.style.transition = "opacity 0.2s ease, transform 0.2s ease";
//       messageEl.style.opacity = "1";
//       messageEl.style.transform = "translateY(0)";

//       // Scroll to bottom to show the new message
//       scrollToBottom();
//     });

//     // Send the actual message to the database
//     const { data, error } = await supaClient
//       .from("message")
//       .insert({
//         chat_id: chatId,
//         msg_content: messageContent,
//         senderid: studentId,
//         msg_date_time: timestamp.toISOString(),
//       })
//       .select();

//     if (error) {
//       console.error("Error sending message:", error);
//       messageEl.classList.add("error");
//       messageTime.textContent = "Failed to send";

//       // Add retry button
//       const retryButton = document.createElement("button");
//       retryButton.classList.add("retry-button");
//       retryButton.textContent = "Retry";
//       retryButton.addEventListener("click", () => {
//         // Remove the failed message
//         messageEl.remove();
//         // Try sending again
//         sendMessage(chatId, messageContent);
//       });
//       messageEl.appendChild(retryButton);
//     } else {
//       console.log("Message sent:", data);

//       // Instead of removing the placeholder, just mark it as confirmed and add the ID
//       messageEl.classList.remove("pending");
//       messageEl.classList.add("confirmed");
//       messageEl.setAttribute("data-message-id", data[0].msg_id);

//       // Add this message ID to our processed set to prevent duplication
//       if (data && data[0] && data[0].msg_id) {
//         processedMessageIds.add(data[0].msg_id);
//       }

//       // The database trigger should handle updating the chat list via subscription
//       // But we also update manually in case the subscription is slow
//       updateLastMessageInChatList(chatId, messageContent, studentId);
//     }
//   } catch (err) {
//     console.error("Exception sending message:", err);
//   }
// }

// // Initialize chat list
// renderChatList();

// // When the page is about to be unloaded, unsubscribe from any active subscription
// window.addEventListener("beforeunload", () => {
//   // Unsubscribe from all chat subscriptions
//   Object.values(chatSubscriptions).forEach((sub) => {
//     if (sub) sub.unsubscribe();
//   });
// });

// // A more intelligent visibility change handler that doesn't cause flickering
// let visibilityTimeout = null;
// document.addEventListener("visibilitychange", () => {
//   // Clear any pending timeout
//   if (visibilityTimeout) {
//     clearTimeout(visibilityTimeout);
//   }

//   if (document.visibilityState === "visible") {
//     console.log("Tab visible again, checking connection status");

//     // Set a short delay before checking to avoid unnecessary reloads
//     visibilityTimeout = setTimeout(async () => {
//       // Check all subscriptions
//       let needsResubscription = false;

//       // Check if any subscriptions need to be refreshed
//       Object.keys(chatSubscriptions).forEach((chatId) => {
//         if (
//           !chatSubscriptions[chatId] ||
//           chatSubscriptions[chatId].status !== "SUBSCRIBED"
//         ) {
//           needsResubscription = true;
//         }
//       });

//       if (needsResubscription) {
//         console.log("Reestablishing subscriptions for all chats");
//         setupAllChatSubscriptions();
//       }

//       // If we have an open chat, check for missed messages
//       if (currentChatId) {
//         try {
//           const lastMessageEl = document.querySelector(
//             ".message[data-message-id]:last-child"
//           );

//           if (lastMessageEl) {
//             const lastMsgId = lastMessageEl.getAttribute("data-message-id");

//             // Get messages newer than our last message
//             const { data: newMessages, error } = await supaClient
//               .from("message")
//               .select("*")
//               .eq("chat_id", currentChatId)
//               .gt("msg_id", lastMsgId)
//               .order("msg_date_time", { ascending: true })
//               .order("msg_id", { ascending: true });

//             if (!error && newMessages && newMessages.length > 0) {
//               console.log(
//                 `Found ${newMessages.length} new messages while away`
//               );

//               // Preload all usernames before rendering
//               const userIds = newMessages.map((msg) => msg.senderid);
//               await loadUserNames(userIds);

//               // Only process if this is still the current chat
//               if (
//                 currentChatId === lastMessageEl.getAttribute("data-chat-id")
//               ) {
//                 // Add only the new messages without re-rendering everything
//                 for (const message of newMessages) {
//                   if (!processedMessageIds.has(message.msg_id)) {
//                     processedMessageIds.add(message.msg_id);
//                     await addMessageToChat(message);
//                   }
//                 }
//               }
//             }
//           } else {
//             // If there are no messages, do a full refresh
//             const messages = await retrieveChatMessages(currentChatId);

//             // Preload all usernames before rendering
//             const userIds = messages.map((msg) => msg.senderid);
//             await loadUserNames(userIds);

//             // Only render if this is still the current chat
//             if (currentChatId) {
//               renderChatMessages(messages, false); // no animation on reload
//             }
//           }
//         } catch (error) {
//           console.error("Error refreshing messages:", error);
//         }
//       }

//       // Also refresh the chat list status - get latest messages for all chats
//       refreshChatListStatus();
//     }, 500); // Short delay to avoid unnecessary work
//   }
// });

// // NEW: Helper function to refresh the status of all chats in the list
// async function refreshChatListStatus() {
//   try {
//     // Get the latest message for each chat in the list
//     const promises = userChats.map(async (chatId) => {
//       const lastMessage = await getLastMessage(chatId);
//       if (lastMessage) {
//         // Ensure we have the sender name
//         if (lastMessage.senderid && !userNameCache.has(lastMessage.senderid)) {
//           await safeGetUserName(lastMessage.senderid);
//         }
//         return { chatId, lastMessage };
//       }
//       return { chatId, lastMessage: null };
//     });

//     const results = await Promise.all(promises);

//     // Update the UI with last message data
//     for (const { chatId, lastMessage } of results) {
//       const chatItem = document.querySelector(
//         `.chat__item[data-chat-id="${chatId}"]`
//       );
//       if (!chatItem) continue;

//       const lastMessageEl = chatItem.querySelector(".chat__last-message");
//       if (!lastMessageEl) continue;

//       if (lastMessage) {
//         // Update the last message text
//         let prefix = "";

//         // Determine sender prefix
//         if (+studentId === +lastMessage.senderid) {
//           prefix = "You: ";
//         } else if (
//           lastMessage.senderid &&
//           userNameCache.has(lastMessage.senderid)
//         ) {
//           prefix = `${userNameCache.get(lastMessage.senderid)}: `;
//         }

//         lastMessageEl.textContent =
//           prefix + truncateText(lastMessage.msg_content, 30);
//       }
//     }
//   } catch (error) {
//     console.error("Error refreshing chat list status:", error);
//   }
// }

//////////////////////////////// V5 ///////////////////////////////
import { supaClient } from "./app.js";
import { getUserName } from "./app.js";
const studentId = sessionStorage.getItem("studentId");
const courseId = JSON.parse(sessionStorage.getItem("courseId"));
const chatName = document.querySelector(".chat__name");
const chats = document.querySelector(".chats");
const collapseButton = document.querySelector(".collapse__chat-btn");
const chatView = document.querySelector(".chat__view");
const chatListContainer = document.querySelector(".chats__list");
const chatImgEl = document.querySelector(".chat__img img");
let currentChatId = null;
let subscription = null;
// Track messages we've already seen to prevent duplicates
let processedMessageIds = new Set();
// Cache for user names to reduce API calls
const userNameCache = new Map();
// Images array
// Track all active chat IDs the user is part of
let userChats = [];
// Store subscriptions for all chats
const chatSubscriptions = {};

// Connection status tracking
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// Prefetch the current user's name and cache it
if (studentId) {
  getUserName(studentId)
    .then((name) => {
      userNameCache.set(studentId, name);
    })
    .catch(() => {
      userNameCache.set(studentId, "Unknown User");
    });
}
async function OpenIfClickedFromCourse() {
  if (courseId && isUserComingFrom("courses.html")) {
    const chatName = await getCourseName();
    openChatByName(chatName);
    sessionStorage.setItem("courseId", null);
  }
}
OpenIfClickedFromCourse();
// Chat search functionality
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".chats__search");
  const chatsList = document.querySelector(".chats__list");

  // Function to handle search
  function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const chatItems = document.querySelectorAll(".chat__item");
    // console.log(searchTerm);
    // console.log(chatItems);
    if (chatItems.length === 0) {
      // No chat items loaded yet
      return;
    }

    // Show all chats if search term is empty
    if (searchTerm === "") {
      chatItems.forEach((item) => {
        item.style.display = "flex";
      });
      return;
    }

    // Filter chats based on search term
    chatItems.forEach((item) => {
      const chatName = item
        .querySelector(".chat__name")
        .textContent.toLowerCase();

      // If you have chat preview text, you can include it in the search as well
      const chatPreview = item.querySelector(".chat__preview")
        ? item.querySelector(".chat__preview").textContent.toLowerCase()
        : "";

      if (chatName.includes(searchTerm) || chatPreview.includes(searchTerm)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Add event listener for search input
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
    // Add clear search functionality when clicking the X (if supported by browser)
    searchInput.addEventListener("search", function () {
      handleSearch({ target: searchInput });
    });
  }

  // Optionally, highlight the search term in results
  function highlightSearchTerm(element, searchTerm) {
    if (!searchTerm) return;

    const innerHTML = element.innerHTML;
    const index = innerHTML.toLowerCase().indexOf(searchTerm);

    if (index >= 0) {
      const highlighted =
        innerHTML.substring(0, index) +
        '<span class="highlight">' +
        innerHTML.substring(index, index + searchTerm.length) +
        "</span>" +
        innerHTML.substring(index + searchTerm.length);
      element.innerHTML = highlighted;
    }
  }

  // Add highlight style to your CSS
  const style = document.createElement("style");
  style.textContent = `
    .highlight {
      background-color: rgba(89, 85, 179, 0.2);
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
});
// Add a custom clear button
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".chats__search");
  const inputGroup = searchInput.closest(".input__group");

  // Create custom clear button
  const clearButton = document.createElement("button");
  clearButton.className = "search__clear-btn";
  clearButton.innerHTML = "×"; // Use × character or an SVG icon
  clearButton.style.display = "none"; // Hide initially

  // Insert the button into the DOM
  inputGroup.appendChild(clearButton);

  // Style the button with inline styles (or add to your CSS)
  Object.assign(clearButton.style, {
    position: "absolute",
    right: "6rem",
    background: "none",
    border: "none",
    fontSize: "2.8rem",
    cursor: "pointer",
    color: "#999aaa",
  });

  // Show/hide the clear button based on input content
  searchInput.addEventListener("input", function () {
    clearButton.style.display = this.value ? "block" : "none";
  });

  // Clear the input when button is clicked
  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    clearButton.style.display = "none";
    searchInput.focus();

    // Trigger the search event to update results
    const event = new Event("input");
    searchInput.dispatchEvent(event);
  });
});
// Helper function to safely get user names with caching
async function safeGetUserName(userId) {
  if (!userId) {
    return "Unknown User";
  }

  // Check cache first
  if (userNameCache.has(userId)) {
    return userNameCache.get(userId);
  }

  try {
    const name = await getUserName(userId);
    userNameCache.set(userId, name); // Cache the result
    return name;
  } catch (error) {
    console.error(`Error getting username for ID ${userId}:`, error);
    userNameCache.set(userId, "Unknown User"); // Cache the fallback
    return "Unknown User";
  }
}

// Batch username loading to avoid multiple sequential requests
async function loadUserNames(userIds) {
  const uniqueIds = [...new Set(userIds)].filter(
    (id) => id && !userNameCache.has(id)
  );

  if (uniqueIds.length === 0) return;

  // Load user names in parallel
  const promises = uniqueIds.map(async (userId) => {
    try {
      const name = await getUserName(userId);
      userNameCache.set(userId, name);
    } catch (error) {
      userNameCache.set(userId, "Unknown User");
    }
  });

  await Promise.all(promises);
}

function openChat() {
  chats.classList.add("open");
  chatView.classList.add("active");
}

function closeChat() {
  chats.classList.remove("open");
  chatView.classList.remove("active");
  document.querySelectorAll(".chat__item").forEach((chat) => {
    chat.classList.remove("active");
  });
}

function attachChatClickListeners() {
  document.querySelectorAll(".chat__item").forEach((chatItem) => {
    const img = chatItem.querySelector("img");
    chatItem.addEventListener("click", async (e) => {
      // Close chat list and open chat view
      chatImgEl.src = img.src;
      if (
        e.target.closest(".chat__item") &&
        !e.target.closest(".chat__item").classList.contains("active")
      ) {
        document.querySelectorAll(".chat__item").forEach((item) => {
          item.classList.remove("active");
        });
        e.target.closest(".chat__item").classList.add("active");
        openChat();
      }

      const chatId = chatItem.getAttribute("data-chat-id");

      // Don't reload if we're already on this chat
      if (currentChatId === chatId) {
        return;
      }

      // Unsubscribe from previous chat subscription if exists
      if (subscription) {
        subscription.unsubscribe();
      }

      currentChatId = chatId;
      const chatNameText = chatItem.getAttribute("data-chat-name");

      // Reset processed message IDs when changing chats
      processedMessageIds = new Set();

      // Show loading indicator
      const messagesContainer = document.querySelector(
        ".chat__messages-container"
      );
      messagesContainer.innerHTML =
        '<div class="loading-messages loader"></div>';

      // Load chat details
      const chatDetailsPromise = getChatDetails(chatId);
      const messagesPromise = retrieveChatMessages(chatId);

      // Load chat details and messages in parallel
      try {
        const [chatDetails, chatMessages] = await Promise.all([
          chatDetailsPromise,
          messagesPromise,
        ]);

        // Render chat details
        renderChatDetails(chatDetails);

        // Extract all user IDs for parallel name loading
        const userIds = chatMessages.map((msg) => msg.senderid);
        userIds.push(studentId); // Include current user

        // Prefetch all user names in parallel before rendering messages
        await loadUserNames(userIds);

        // Only render if this is still the current chat
        if (currentChatId === chatId) {
          // Render chat messages
          renderChatMessages(chatMessages, false); // false = no animation on initial load
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        messagesContainer.innerHTML =
          '<div class="error-messages">Error loading messages. Please try again.</div>';
      }

      // Set up event listener for send button
      setupSendMessageHandler(chatId);

      // Make sure subscription is active for this chat
      setupChatSubscription(chatId);
    });
  });

  collapseButton.addEventListener("click", closeChat);
}

function setupSendMessageHandler(chatId) {
  const sendButton = document.querySelector(".send__message-btn");
  const messageInput = document.querySelector(".message__input");

  // First, remove any existing event listeners by cloning the elements
  const newSendButton = sendButton.cloneNode(true);
  sendButton.parentNode.replaceChild(newSendButton, sendButton);

  const newMessageInput = messageInput.cloneNode(true);
  messageInput.parentNode.replaceChild(newMessageInput, messageInput);

  // Add event listener to the send button
  newSendButton.addEventListener("click", async () => {
    const messageContent = newMessageInput.value.trim();
    if (messageContent) {
      await sendMessage(chatId, messageContent);
      newMessageInput.value = ""; // Clear input after sending
      newMessageInput.focus(); // Keep focus on input for better UX
    }
  });

  // Add event listener for Enter key
  newMessageInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default to avoid form submission
      const messageContent = newMessageInput.value.trim();
      if (messageContent) {
        await sendMessage(chatId, messageContent);
        newMessageInput.value = ""; // Clear input after sending
      }
    }
  });

  // Focus the input field for immediate typing
  newMessageInput.focus();
}

// Set up subscriptions for all user chats
function setupAllChatSubscriptions() {
  // Clean up existing subscriptions
  Object.values(chatSubscriptions).forEach((sub) => {
    if (sub) sub.unsubscribe();
  });

  // Reset subscription objects
  Object.keys(chatSubscriptions).forEach((key) => {
    delete chatSubscriptions[key];
  });

  // Set up a subscription for each chat
  userChats.forEach((chatId) => {
    setupChatSubscription(chatId);
  });

  // Reset reconnection attempts on successful setup
  reconnectAttempts = 0;
}

function setupChatSubscription(chatId) {
  // Unsubscribe from any existing subscription for this chat
  if (chatSubscriptions[chatId]) {
    chatSubscriptions[chatId].unsubscribe();
    delete chatSubscriptions[chatId];
  }

  // Create a more robust subscription with better error handling
  try {
    // Create a new channel for this chat
    const channel = supaClient.channel(`chat:${chatId}`);

    // Subscribe to changes
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `chat_id=eq.${chatId}`,
        },
        handleNewMessage
      )
      .subscribe((status) => {
        console.log(`Subscription status for chat ${chatId}:`, status);

        if (status === "SUBSCRIBED") {
          console.log(`Successfully subscribed to chat ${chatId}`);
          isConnected = true;
          reconnectAttempts = 0;
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "CLOSED" ||
          status === "TIMED_OUT"
        ) {
          console.error(
            `Error with subscription for chat ${chatId}: ${status}`
          );
          isConnected = false;

          // Try to resubscribe after a delay if there was an error
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(
              `Attempt ${reconnectAttempts} to reconnect chat ${chatId} in ${RECONNECT_INTERVAL}ms`
            );

            setTimeout(() => {
              if (!isConnected) {
                setupChatSubscription(chatId);
              }
            }, RECONNECT_INTERVAL);
          } else {
            console.error(
              `Maximum reconnection attempts reached for chat ${chatId}`
            );
          }
        }
      });

    // Store the subscription reference
    chatSubscriptions[chatId] = channel;

    // Update the current chat subscription reference
    if (chatId === currentChatId) {
      subscription = channel;
    }
  } catch (error) {
    console.error(`Error setting up subscription for chat ${chatId}:`, error);

    // Try to resubscribe after a delay
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => {
        if (!isConnected) {
          setupChatSubscription(chatId);
        }
      }, RECONNECT_INTERVAL);
    }
  }
}

// Centralized function to handle new messages
function handleNewMessage(payload) {
  if (!payload || !payload.new || !payload.new.msg_id) {
    console.error("Invalid message payload received:", payload);
    return;
  }

  const message = payload.new;

  // Skip if we've already processed this message
  if (processedMessageIds.has(message.msg_id)) {
    console.log(`Skipping duplicate message ${message.msg_id}`);
    return;
  }

  // Mark as processed to prevent duplicates
  processedMessageIds.add(message.msg_id);

  console.log(`New message received in chat ${message.chat_id}:`, message);

  // Pre-load sender name if needed before processing the message
  if (message.senderid && !userNameCache.has(message.senderid)) {
    safeGetUserName(message.senderid).then(() => {
      processMessageUpdate(message);
    });
  } else {
    // Process immediately if sender info is available
    processMessageUpdate(message);
  }
}

// Process message updates in UI
function processMessageUpdate(message) {
  // If this is the current open chat, add message to chat view
  if (currentChatId === message.chat_id) {
    addMessageToChat(message);
  }

  // Update the chat list item with this message regardless
  updateLastMessageInChatList(
    message.chat_id,
    message.msg_content,
    message.senderid
  );
}

// Create a single message element for faster DOM operations
function createMessageElement(message, animate = true) {
  // Create the new message element
  const messageEl = document.createElement("div");
  messageEl.setAttribute("data-message-id", message.msg_id);
  messageEl.setAttribute(
    "data-timestamp",
    new Date(message.msg_date_time).getTime()
  );

  const messageSenderName = document.createElement("p");
  const messageContent = document.createElement("p");
  const messageTime = document.createElement("p");

  messageSenderName.classList.add("message__sender-name");
  messageContent.classList.add("message__content");
  messageTime.classList.add("message__time");

  messageContent.textContent = message.msg_content || "";
  messageTime.textContent = formatDateTime(new Date(message.msg_date_time));

  // Check if the message is from the current user
  const isSentByCurrentUser = message.senderid === +studentId;

  // Add message classes based on sender
  if (isSentByCurrentUser) {
    messageEl.classList.add("sent");
    messageSenderName.textContent = userNameCache.get(studentId) || "You";
  } else {
    messageEl.classList.add("received");
    messageSenderName.textContent =
      userNameCache.get(message.senderid) || "User";
  }

  messageEl.classList.add("message");

  messageEl.appendChild(messageSenderName);
  messageEl.appendChild(messageContent);
  messageEl.appendChild(messageTime);

  // Add animation if needed
  if (animate) {
    messageEl.style.opacity = "0";
    messageEl.style.transform = "translateY(10px)";

    // Use requestAnimationFrame for smoother animations
    requestAnimationFrame(() => {
      messageEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      messageEl.style.opacity = "1";
      messageEl.style.transform = "translateY(0)";
    });
  }

  return messageEl;
}

async function addMessageToChat(message) {
  // First check if we already have this message in the DOM
  const existingMessage = document.querySelector(
    `[data-message-id="${message.msg_id}"]`
  );
  if (existingMessage) {
    return; // Skip if already exists
  }

  // Create the message element
  const messagesContainer = document.querySelector(".chat__messages-container");

  // Check if we have a container
  if (!messagesContainer) {
    console.error("Messages container not found");
    return;
  }

  const messageEl = createMessageElement(message, true);

  // Always append the message at the end (chronological order)
  messagesContainer.appendChild(messageEl);

  // Scroll to the bottom to show the new message
  scrollToBottom();
}

// Use a more efficient scrolling method with requestAnimationFrame
function scrollToBottom() {
  requestAnimationFrame(() => {
    const messagesContainer = document.querySelector(
      ".chat__messages-container"
    );
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
}

function formatDateTime(date) {
  // Adjust for local timezone and format
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  // Get just the time part for today's messages
  const today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Show full date for older messages
  return date.toLocaleString("en-US", options);
}

async function renderChatList() {
  try {
    chatListContainer.innerHTML = '<div class="loader loading-chats"></div>';
    const chats = await getChatList();

    // Store the chat IDs for subscription
    userChats = chats.map((chat) => chat.chat_id);

    if (chats.length === 0) {
      // Display a message when no chats are available
      chatListContainer.innerHTML = `
        <li class="no-chats">
          <p>No chats available</p>
        </li>
      `;
      return;
    }

    // Create a document fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    const pendingChats = [];

    // First render the basic chat list structure
    for (const chat of chats) {
      const chatItem = document.createElement("li");
      chatItem.className = "chat__item";
      chatItem.setAttribute("data-chat-id", chat.chat_id);
      chatItem.setAttribute("data-chat-name", chat.chat_name);
      chatItem.innerHTML = `
        <div class="chat__img">
        <img src="src/images/Courses/${chat.chat_name.toUpperCase()}.png" alt="${
        chat.chat_name
      }">
        </div>
        <div class="chat__details">
          <div class="chat__name">${chat.chat_name}</div>
          <div class="chat__last-message">Loading...</div>
        </div>
      `;

      fragment.appendChild(chatItem);
      pendingChats.push(chat.chat_id);
    }

    // Update the DOM once with all chat items
    chatListContainer.innerHTML = "";
    chatListContainer.appendChild(fragment);

    // Attach click listeners immediately
    attachChatClickListeners();

    // Set up subscriptions for all chats
    setupAllChatSubscriptions();

    // Then load last messages for each chat in parallel
    const lastMessagePromises = pendingChats.map(async (chatId) => {
      const lastMessage = await getLastMessage(chatId);
      if (lastMessage) {
        // Ensure we have the sender name
        if (lastMessage.senderid && !userNameCache.has(lastMessage.senderid)) {
          await safeGetUserName(lastMessage.senderid);
        }
        return { chatId, lastMessage };
      }
      return { chatId, lastMessage: null };
    });

    // Update last messages as they come in
    const results = await Promise.all(lastMessagePromises);

    // Update the UI with last message data
    for (const { chatId, lastMessage } of results) {
      const chatItem = document.querySelector(
        `.chat__item[data-chat-id="${chatId}"]`
      );
      if (!chatItem) continue;

      const lastMessageEl = chatItem.querySelector(".chat__last-message");
      if (!lastMessageEl) continue;

      updateChatLastMessageDisplay(lastMessageEl, lastMessage);
    }
  } catch (error) {
    console.error("Error rendering chat list:", error);
    chatListContainer.innerHTML = `
      <li class="error-message">
        <p>Error loading chats. Please try again.</p>
      </li>
    `;
  }
}

// Helper function to update last message display
function updateChatLastMessageDisplay(lastMessageEl, lastMessage) {
  let messageText = "No messages yet...";
  let senderPrefix = "";

  if (lastMessage) {
    messageText = truncateText(lastMessage.msg_content, 30);

    // Properly determine the sender prefix
    if (+studentId === +lastMessage.senderid) {
      senderPrefix = "You: ";
    } else if (
      lastMessage.senderid &&
      userNameCache.has(lastMessage.senderid)
    ) {
      senderPrefix = `${userNameCache.get(lastMessage.senderid)}: `;
    }
  }

  lastMessageEl.textContent = senderPrefix + messageText;
}

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

async function getLastMessage(chatId) {
  const { data, error } = await supaClient
    .from("message")
    .select("*")
    .eq("chat_id", chatId)
    .order("msg_date_time", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }
  return data[0];
}

async function getChatList() {
  const { data, error } = await supaClient
    .from("student_chat")
    .select("*")
    .eq("student_id", studentId);

  if (error) {
    console.error("Error fetching chat list:", error);
    return [];
  }

  if (data && data.length > 0) {
    const { data: chats, error } = await supaClient
      .from("chat")
      .select("*")
      .in(
        "chat_id",
        data.map((chat) => chat.chat_id)
      );

    if (error) {
      console.error("Error fetching chat details:", error);
      return [];
    } else {
      return chats;
    }
  }
  return [];
}

async function getChatDetails(chatId) {
  const { data, error } = await supaClient
    .from("chat")
    .select("*")
    .eq("chat_id", chatId)
    .single();

  if (error) {
    console.error("Error fetching chat details:", error);
    return null;
  } else {
    return data;
  }
}

function renderChatDetails(chat) {
  if (chat) {
    chatName.textContent = chat.chat_name;
  }
}

async function retrieveChatMessages(chatId) {
  const { data, error } = await supaClient
    .from("message")
    .select("*")
    .eq("chat_id", chatId)
    .order("msg_date_time", { ascending: true }) // Primary sort by timestamp
    .order("msg_id", { ascending: true }); // Secondary sort by message_id for consistency

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  } else {
    // Build our processed message IDs set
    data.forEach((msg) => {
      if (msg.msg_id) {
        processedMessageIds.add(msg.msg_id);
      }
    });

    return data;
  }
}

function renderChatMessages(messages, animate = true) {
  // Get the messages container
  const messagesContainer = document.querySelector(".chat__messages-container");

  // Clear existing messages
  messagesContainer.innerHTML = "";

  if (!messages || messages.length === 0) {
    // Show a message when there are no messages
    const emptyMessage = document.createElement("div");
    emptyMessage.classList.add("empty-messages");
    emptyMessage.textContent = "No messages yet. Start the conversation!";
    messagesContainer.appendChild(emptyMessage);
    return;
  }

  // Modified: Ensure messages are properly sorted by timestamp (oldest to newest)
  messages.sort((a, b) => {
    const timeA = new Date(a.msg_date_time).getTime();
    const timeB = new Date(b.msg_date_time).getTime();

    // If timestamps are equal, sort by message_id as secondary criteria
    if (timeA === timeB) {
      return a.msg_id - b.msg_id;
    }

    return timeA - timeB;
  });

  // Performance optimization: Create a document fragment and batch render
  const fragment = document.createDocumentFragment();

  // For large message sets, use virtual rendering
  const shouldVirtualize = messages.length > 100;

  // If virtualizing, only render the last 50 messages initially
  const messagesToRender = shouldVirtualize ? messages.slice(-50) : messages;

  // Render messages in batches using requestAnimationFrame for better performance
  const renderBatch = (startIdx, endIdx) => {
    for (let i = startIdx; i < endIdx && i < messagesToRender.length; i++) {
      const message = messagesToRender[i];
      if (!message) continue;

      const messageEl = createMessageElement(message, false); // Don't animate batches
      fragment.appendChild(messageEl);
    }

    // Add this batch to the container
    messagesContainer.appendChild(fragment);
  };

  // For small message sets, render all at once
  if (!shouldVirtualize) {
    renderBatch(0, messagesToRender.length);
  } else {
    // For large message sets, render in batches of 20
    let currentBatch = 0;
    const batchSize = 20;

    const processNextBatch = () => {
      const startIdx = currentBatch * batchSize;
      const endIdx = startIdx + batchSize;

      if (startIdx < messagesToRender.length) {
        renderBatch(startIdx, endIdx);
        currentBatch++;
        requestAnimationFrame(processNextBatch);
      } else {
        // All batches processed
        scrollToBottom();
      }
    };

    // Start rendering batches
    processNextBatch();
  }

  // Scroll to the bottom immediately for small message sets
  if (!shouldVirtualize) {
    scrollToBottom();
  }
}

// Helper function to update last message in chat list
async function updateLastMessageInChatList(chatId, messageContent, senderId) {
  const chatItem = document.querySelector(
    `.chat__item[data-chat-id="${chatId}"]`
  );

  if (chatItem) {
    const lastMessageEl = chatItem.querySelector(".chat__last-message");
    if (lastMessageEl) {
      let prefix = "";

      // Ensure we have the correct prefix based on the sender
      if (+senderId === +studentId) {
        prefix = "You: ";
      } else if (senderId && userNameCache.has(senderId)) {
        prefix = `${userNameCache.get(senderId)}: `;
      } else if (senderId) {
        // If we don't have the name cached, fetch it first
        const senderName = await safeGetUserName(senderId);
        prefix = `${senderName}: `;
      }

      lastMessageEl.textContent = prefix + truncateText(messageContent, 30);

      // Move this chat to the top of the list (most recent)
      const chatsList = chatItem.parentElement;
      if (chatsList && chatsList.firstChild !== chatItem) {
        // Use animation API for smoother transitions
        chatItem.style.transition = "none";
        chatItem.style.opacity = "0.7";

        // Move to top
        chatsList.insertBefore(chatItem, chatsList.firstChild);

        // Trigger reflow
        void chatItem.offsetWidth;

        // Animate back to normal
        chatItem.style.transition = "opacity 0.3s ease";
        chatItem.style.opacity = "1";
      }
    }
  }
}

async function sendMessage(chatId, messageContent) {
  try {
    const timestamp = new Date();

    // Create a temporary visual placeholder for the message with a unique ID
    const tempMessageId = `temp-${Date.now()}`;
    const messagesContainer = document.querySelector(
      ".chat__messages-container"
    );

    // Remove any "empty messages" placeholder if it exists
    const emptyPlaceholder = messagesContainer.querySelector(".empty-messages");
    if (emptyPlaceholder) {
      emptyPlaceholder.remove();
    }

    // If we don't have the current user's name yet, get it
    if (!userNameCache.has(studentId)) {
      await safeGetUserName(studentId);
    }

    // Create temporary message element
    const messageEl = document.createElement("div");
    messageEl.id = tempMessageId;
    messageEl.classList.add("message", "sent", "pending");
    // Add timestamp as data attribute for sorting
    messageEl.setAttribute("data-timestamp", timestamp.getTime());

    const messageSenderName = document.createElement("p");
    messageSenderName.classList.add("message__sender-name");
    messageSenderName.textContent = userNameCache.get(studentId) || "You";

    const messageContent_el = document.createElement("p");
    messageContent_el.classList.add("message__content");
    messageContent_el.textContent = messageContent;

    const messageTime = document.createElement("p");
    messageTime.classList.add("message__time");
    messageTime.textContent = formatDateTime(timestamp);

    messageEl.appendChild(messageSenderName);
    messageEl.appendChild(messageContent_el);
    messageEl.appendChild(messageTime);

    // Append message to the end for chronological order
    messagesContainer.appendChild(messageEl);

    // Add animation for a smoother appearance
    messageEl.style.opacity = "0";
    messageEl.style.transform = "translateY(10px)";

    // Use requestAnimationFrame for smoother animations
    requestAnimationFrame(() => {
      messageEl.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      messageEl.style.opacity = "1";
      messageEl.style.transform = "translateY(0)";

      // Scroll to bottom to show the new message
      scrollToBottom();
    });

    // Send the actual message to the database
    const { data, error } = await supaClient
      .from("message")
      .insert({
        chat_id: chatId,
        msg_content: messageContent,
        senderid: studentId,
        msg_date_time: timestamp.toISOString(),
      })
      .select();

    if (error) {
      console.error("Error sending message:", error);
      messageEl.classList.add("error");
      messageTime.textContent = "Failed to send";

      // Add retry button
      const retryButton = document.createElement("button");
      retryButton.classList.add("retry-button");
      retryButton.textContent = "Retry";
      retryButton.addEventListener("click", () => {
        // Remove the failed message
        messageEl.remove();
        // Try sending again
        sendMessage(chatId, messageContent);
      });
      messageEl.appendChild(retryButton);
    } else {
      console.log("Message sent:", data);

      // Instead of removing the placeholder, just mark it as confirmed and add the ID
      messageEl.classList.remove("pending");
      messageEl.classList.add("confirmed");

      if (data && data[0] && data[0].msg_id) {
        messageEl.setAttribute("data-message-id", data[0].msg_id);

        // Add this message ID to our processed set to prevent duplication
        processedMessageIds.add(data[0].msg_id);
      }

      // Update the chat list manually in case the subscription is slow
      updateLastMessageInChatList(chatId, messageContent, studentId);
    }
  } catch (err) {
    console.error("Exception sending message:", err);
  }
}

// Check and restore Supabase connection
function checkConnection() {
  // Check all subscriptions
  const needsReconnection = Object.keys(chatSubscriptions).some((chatId) => {
    const sub = chatSubscriptions[chatId];
    return !sub || sub.closed || sub.errored;
  });

  if (needsReconnection) {
    console.log("Restoring chat subscriptions");
    setupAllChatSubscriptions();
  }
}

// Initialize chat list
renderChatList();

// Set up regular connection checks
setInterval(checkConnection, 30000); // Check connection every 30 seconds

// When the page is about to be unloaded, unsubscribe from any active subscription
window.addEventListener("beforeunload", () => {
  // Unsubscribe from all chat subscriptions
  Object.values(chatSubscriptions).forEach((sub) => {
    if (sub) sub.unsubscribe();
  });
});

// A more intelligent visibility change handler that doesn't cause flickering
let visibilityTimeout = null;
document.addEventListener("visibilitychange", () => {
  // Clear any pending timeout
  if (visibilityTimeout) {
    clearTimeout(visibilityTimeout);
  }

  // If the page becomes visible again
  if (document.visibilityState === "visible") {
    // Slight delay to prevent too many reconnection attempts
    visibilityTimeout = setTimeout(() => {
      // Check if we need to reconnect
      if (!isConnected) {
        console.log("Page visible, checking connections");
        checkConnection();
      }

      // If we have an active chat, check for any messages we might have missed
      if (currentChatId) {
        retrieveChatMessages(currentChatId).then((messages) => {
          if (messages && messages.length > 0) {
            renderChatMessages(messages, false);
          }
        });
      }
    }, 10);
  }
});
/**
 * Opens a specific chat by its name
 * @param {string} chatName - The name of the chat to open
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if successful
 */

/**
 * Checks if the user is coming from a specific page
 * @param {string} pageUrl - The URL or partial URL to check against
 * @returns {boolean} - Returns true if the user came from the specified page
 */
function isUserComingFrom(pageUrl) {
  const referrer = document.referrer;

  // If there's no referrer, the user either typed the URL directly,
  // used a bookmark, or came from an HTTPS page to an HTTP page
  if (!referrer) {
    return false;
  }

  // Check if the referrer contains the pageUrl string
  // This works for both exact URLs and partial matches
  return referrer.includes(pageUrl);
}

// Example usage:
if (isUserComingFrom("courses.html")) {
  console.log("User came from the courses page");
  // You could automatically open a specific chat
  // openChatByName('Chemistry');
}
function openChatByName(chatName) {
  console.log(`Attempting to open chat: "${chatName}"`);

  // First make sure the chat list is loaded
  return new Promise((resolve, reject) => {
    // Function to check if chats are loaded and find our target
    const findAndOpenChat = () => {
      // Normalize the chat name for case-insensitive comparison
      const normalizedChatName = chatName.trim().toLowerCase();
      console.log(
        `Looking for chat with normalized name: "${normalizedChatName}"`
      );

      // Find the chat item with matching name
      const chatItems = document.querySelectorAll(".chat__item");
      console.log(`Found ${chatItems.length} chat items`);

      let targetChat = null;

      // Log all chat items for debugging
      chatItems.forEach((item) => {
        const itemName = item.getAttribute("data-chat-name");
        console.log(`Available chat: "${itemName}"`);

        if (itemName && itemName.toLowerCase() === normalizedChatName) {
          targetChat = item;
        }
      });

      // If chat not found, try to reload the chat list
      if (!targetChat) {
        console.log(
          `Chat "${chatName}" not found, checking if we need to load chats`
        );

        // Check if chat list is still loading
        const loader = document.querySelector(".loading-chats");
        if (loader) {
          console.log("Chat list is still loading, will retry in 500ms");
          setTimeout(findAndOpenChat, 500);
          return;
        }

        // If no loader but still no chats, try to reload the list
        if (chatItems.length === 0) {
          console.log("No chats found, attempting to reload chat list");
          renderChatList().then(() => {
            setTimeout(findAndOpenChat, 500);
          });
          return;
        }

        console.error(`Chat "${chatName}" not found in the available chats`);
        resolve(false);
        return;
      }

      console.log(`Found target chat: "${chatName}"`);

      // Get the chat image to update the main chat display
      const chatImg = targetChat.querySelector(".chat__img img");
      if (chatImg) {
        chatImgEl.src = chatImg.src;
        console.log("Updated chat image");
      }

      // Remove active class from all chats
      document.querySelectorAll(".chat__item").forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to the target chat
      targetChat.classList.add("active");
      console.log("Updated active chat classes");

      // Open the chat view
      openChat();
      console.log("Opened chat view");

      const chatId = targetChat.getAttribute("data-chat-id");
      console.log(`Target chat ID: ${chatId}`);

      // Don't reload if we're already on this chat
      if (currentChatId === chatId) {
        console.log("Already on this chat, not reloading");
        resolve(true);
        return;
      }

      // Unsubscribe from previous chat subscription if exists
      if (subscription) {
        subscription.unsubscribe();
        console.log("Unsubscribed from previous chat");
      }

      currentChatId = chatId;

      // Reset processed message IDs when changing chats
      processedMessageIds = new Set();

      // Show loading indicator
      const messagesContainer = document.querySelector(
        ".chat__messages-container"
      );
      if (messagesContainer) {
        messagesContainer.innerHTML =
          '<div class="loading-messages loader"></div>';
        console.log("Added loading indicator");
      }

      // Load chat details and messages
      Promise.all([getChatDetails(chatId), retrieveChatMessages(chatId)])
        .then(([chatDetails, chatMessages]) => {
          console.log("Loaded chat details and messages");

          // Render chat details
          renderChatDetails(chatDetails);

          // Extract all user IDs for parallel name loading
          const userIds = chatMessages.map((msg) => msg.senderid);
          userIds.push(studentId); // Include current user

          // Prefetch all user names before rendering messages
          loadUserNames(userIds).then(() => {
            // Only render if this is still the current chat
            if (currentChatId === chatId) {
              // Render chat messages
              renderChatMessages(chatMessages, false);
              console.log("Rendered chat messages");
            }

            resolve(true);
          });

          // Set up event listener for send button
          setupSendMessageHandler(chatId);

          // Make sure subscription is active for this chat
          setupChatSubscription(chatId);
        })
        .catch((error) => {
          console.error("Error loading messages:", error);
          if (messagesContainer) {
            messagesContainer.innerHTML =
              '<div class="error-messages">Error loading messages. Please try again.</div>';
          }
          resolve(false);
        });
    };

    // Start the process
    findAndOpenChat();
  });
}
// Alternative version that directly simulates a click on the chat item
function openChatByNameSimple(chatName) {
  console.log(`Looking for chat: "${chatName}"`);

  // Wait for the chat list to be loaded
  if (document.querySelector(".loading-chats")) {
    console.log("Chat list still loading, retrying in 500ms");
    setTimeout(() => openChatByNameSimple(chatName), 500);
    return false;
  }

  // Find the chat item with the matching name
  const chatItems = document.querySelectorAll(".chat__item");
  let found = false;

  chatItems.forEach((item) => {
    const itemName = item.getAttribute("data-chat-name");
    if (itemName && itemName.toLowerCase() === chatName.toLowerCase()) {
      console.log(`Found chat "${itemName}", clicking it`);
      // Simulate a click on the chat item
      item.click();
      found = true;
    }
  });

  if (!found) {
    console.error(`Chat "${chatName}" not found`);
    return false;
  }

  return true;
}
async function getCourseName() {
  if (courseId) {
    console.log(courseId);
    const { data, error } = await supaClient
      .from("course")
      .select("*")
      .eq("course_id", courseId);

    if (error) {
      console.error("Error fetching course name:", error);
      showToast("Failed to load course information", "error");
      return;
    }

    if (data && data.length > 0) {
      console.log(data[0].course_name);
      return data[0].course_name;
    }
  }
}
