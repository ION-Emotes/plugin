const getCDNLink = (id, animated) => `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "webp"}`;
const clearInps = () => {
    document.getElementById('emojis').style.marginBottom = "0px";
    document.getElementById("emojis").innerHTML = "";
    document.getElementById('emojiSearch').value = ''
}


const toggleLoad = () => {
    const img = document.querySelector("#loadingif");

    if (img) img.remove();
    else document.getElementById("emojis").innerHTML = '<img id="loadingif" src="https://github.com/ION-Emotes/data/blob/main/loading.gif?raw=true" style="width: 300px; height: 300px;">';
}


async function displayEmojis(emojiKey) {
    const res = await fetch(`https://raw.githubusercontent.com/ION-Emotes/data/main/data/${emojiKey}`);
    const emotes = await res.json();

    toggleLoad();

    // Find the container in the document
    const container = document.getElementById('emojis');

    // Clear previous content
    container.innerHTML = '';

    // Iterate through each emoji in the data
    Object.entries(emotes).forEach(([eName, emoji]) => {
        // Create an img element for the emoji
        const img = document.createElement('img');
        // Construct the URL using the emoji id
        img.src = getCDNLink(emoji.id, emoji.animated);
        img.alt = eName;
        img.style.width = '48px'; // Set the image size
        img.style.height = '48px';
        img.setAttribute('data-tooltip', emoji.oldName);

        // Create a caption for the emoji name
        const caption = document.createElement('p');
        caption.textContent = emoji.oldName;

        // Create a div to wrap the img and caption
        const div = document.createElement('div');
        div.appendChild(img);
        div.appendChild(caption);

        // Append the div to the container
        container.appendChild(div);
    });
}


function displayEmojisArr(emotes) {
    // Find the container in the document
    const container = document.getElementById('emojis');

    // Clear previous content
    container.innerHTML = '';

    container.style.marginBottom = "0px";
    if (!emotes.length) return container.innerHTML = "<h1>No Results Found!</h1>";

    // Iterate through each emoji in the data
    emotes.forEach(emoji => {
        // Create an img element for the emoji
        const img = document.createElement('img');
        img.src = getCDNLink(emoji.id, emoji.animated);
        img.alt = emoji.name;
        img.style.width = '48px'; // Set the image size
        img.style.height = '48px';
        img.setAttribute('data-tooltip', emoji.oldName);
        img.onclick = (e) => {
            createModal(emoji, img.src);
            // alert(`Original Name: ${emoji.oldName}\nLookup ID: ${emoji.name}`);
        }

        // Create a caption for the emoji name
        const caption = document.createElement('p');
        caption.textContent = emoji.name;

        // Create a div to wrap the img and caption
        const div = document.createElement('div');
        div.appendChild(img);
        div.appendChild(caption);

        // Append the div to the container
        container.appendChild(div);
    });

    container.style.marginBottom = "40px";
}


async function displayKeys() {
    toggleLoad();

    const el = document.getElementById("emojis");
    const apiUrl = 'https://api.github.com/repos/ION-Emotes/data/contents/data';
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        el.innerHTML = "";

        const fileListElement = document.getElementById('fileList');

        data.forEach(item => {
            if (item.type === 'file') {
                const fileButton = document.createElement('button');
                fileButton.classList.add('file-button');
                fileButton.textContent = item.name.replace(".json", "");

                fileButton.addEventListener('click', function () {
                    const input = document.querySelector('#emojiSearch');
                    input.value = item.name.replace('.json', '');
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
                fileListElement.appendChild(fileButton);
            }
        });
    } catch (error) {
        console.error('Error fetching directory contents:', error);
    }
}


function inviteBot() {
    if (["http://127.0.0.1:5500", "http://localhost:5500"].includes(window.location.origin)) {
        window.location.href = "https://discord.com/oauth2/authorize?client_id=1224772542359933058&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5500%2Faddemote.html&scope=identify+bot&permissions=0";
    }
    else {
        window.location.href = "https://discord.com/oauth2/authorize?client_id=1224772542359933058&response_type=code&redirect_uri=https%3A%2F%2Fstreamelements.ion606.com%2Faddemote.html&scope=identify+bot&permissions=0";
    }
}


window.addEventListener("DOMContentLoaded", async () => {
    toggleLoad();
    displayKeys();

    // Attach an event listener to the search input
    let debounceTimer;

    document.getElementById('emojiSearch').addEventListener('input', (e) => {
        const el = document.getElementById("emojis");

        // Clear the existing timer on each input event
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value.toLowerCase();
        if (!searchTerm || !searchTerm[0]) return el.innerHTML = "";

        el.innerHTML = '<img src="https://github.com/ION-Emotes/data/blob/main/loading.gif?raw=true" style="width: 300px; height: 300px;">';

        // Set a new timer
        debounceTimer = setTimeout(async () => {
            const res = await fetch(`https://raw.githubusercontent.com/ION-Emotes/data/main/data/${searchTerm[0]}.json`);
            const emotes = await res.json();

            const filteredData = Object.keys(emotes).filter(key => key.includes(searchTerm.trim().toLowerCase())).reduce((obj, key) => {
                const o2 = emotes[key];
                o2.name = key;
                obj.push(o2);
                return obj;
            }, []);

            displayEmojisArr(filteredData);
        }, 1500);
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    if (query) {
        const inpEl = document.getElementById('emojiSearch');
        inpEl.value = query;
        inpEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
});


function createModal(emoji, src) {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];

    // id: "937079880473014362", guildId: "812878192465018891", animated: true, oldName: "pink_Nodders", name: "pink_nodders"
    // https://discord.com/channels/533782975079251999

    modal.querySelector(".modal-header").querySelector("h2").textContent = `${emoji.name}`;
    const forContent = modal.querySelector("[data-for='content']");
    const forImg = modal.querySelector("[data-for='img']");

    forContent.innerHTML = ``;

    forImg.style.backgroundImage = `url(${src})`;

    for (const [keyRaw, valueRaw] of Object.entries(emoji)) {
        let key, value;
        if (keyRaw === "guildId") key = "Server Id";
        else if (keyRaw === "oldName") key = "OG Name";
        else key = keyRaw;

        if (keyRaw === "guildId") value = `<a href="https://discord.com/channels/${valueRaw}" target="_blank">${valueRaw}</a>`;
        else value = valueRaw;

        const paragraph = document.createElement('p');
        paragraph.innerHTML = `<b>${key.charAt(0).toUpperCase() + key.slice(1)}:</b> ${value}`;
        forContent.appendChild(paragraph);
    }

    modal.querySelector(".modal-footer").querySelector("h3").innerHTML = `Use <code>:${emoji['name']}:</code> in chat!`;

    modal.style.display = "block";
    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}