document.addEventListener("DOMContentLoaded", () => {
    const topicInput = document.getElementById("topic-input");
    const topicList = document.getElementById("topic-list");
    const topics = JSON.parse(sessionStorage.getItem("topics")) || [];

    function renderTopics() {
        topicList.innerHTML = "";
        topics.forEach((topic, index) => {
            const li = document.createElement("li");
            li.textContent = topic;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "x";
            removeBtn.classList.add("remove-button");
            removeBtn.onclick = () => {
                topics.splice(index, 1);
                sessionStorage.setItem("topics", JSON.stringify(topics));
                renderTopics();
            };

            li.appendChild(removeBtn);
            topicList.appendChild(li);
        });
    }

    document.getElementById("add-topic").addEventListener("click", () => {
        const newTopic = topicInput.value.trim();
        if (newTopic) {
            topics.push(newTopic);
            sessionStorage.setItem("topics", JSON.stringify(topics));
            topicInput.value = "";
            renderTopics();
        }
    });

    document.getElementById("proceed").addEventListener("click", () => {
        window.location.href = "upload.html";
    });

    renderTopics();
});
