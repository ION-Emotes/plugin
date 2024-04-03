async function getCustomEmote(query) {
    try {
        if (!query) return null;
        const res = await fetch(`https://raw.githubusercontent.com/ION-Emotes/data/main/data/${query[0]}.json`)
        const data = await res.json();
        const o = Object.entries(data).find(([eName, emoji]) => eName == query.toLowerCase());

        if (!o) return null;

        return `https://cdn.discordapp.com/emojis/${o[1].id}.${o[1].animated ? "gif" : "webp"}?size=48&quality=lossless`
    }
    catch (err) {
        console.error(err);
        return null;
    }
}


async function placeCustomEmotes(msgInp) {
    try {
        const msgParts = [];
        // deal with emotes
        for (const msgPart of msgInp.split(" ")) {
            if (msgPart.startsWith(":") && msgPart.endsWith(":")) {
                const cEmote = await getCustomEmote(msgPart.replaceAll(":", ""));

                if (cEmote) msgParts.push(`<img class="badge" src="${cEmote}" alt="${msgPart.replaceAll(":", "")}">`);
                else msgParts.push(msgPart);
            }
            else msgParts.push(msgPart);
        }

        return msgParts.join(" ");
    }
    catch (err) { return err.message; }
}