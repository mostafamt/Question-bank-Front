import React, { useState } from "react";
import styles from "./chat.module.scss";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { id: Date.now(), sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulated Bot Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: "Received: " + input },
      ]);
    }, 800);
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatCard}>
        {/* Chat History Box */}
        <div className={styles.chatHistory}>
          {messages.length === 0 ? (
            <div className={styles.placeholderText}>Chat History</div>
          ) : (
            <div className={styles.messageList}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${
                    msg.sender === "user" ? styles.user : styles.bot
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ask a Question Box */}
        <form className={styles.inputBox} onSubmit={handleSend}>
          <textarea
            placeholder="Ask a Question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <div className={styles.inputActions}>
            <button type="submit" className={styles.sendBtn}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
