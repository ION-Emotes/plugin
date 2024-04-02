// Helper functions for getting emotes from Discord

const fs = require('fs');
const fpath = "temp/temp.json";

async function getUserEmotes(token) {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: token }
    });

    const data = await response.json();
    const guildsEmojis = [];

    for (const { id } of data) {
        try {
            const r = await fetch(`https://discord.com/api/guilds/${id}/emojis`, { headers: { Authorization: token } });
            const guildEmojis = await r.json();
            guildsEmojis.push(...guildEmojis.map(eRaw => ({ name: eRaw.name, id: eRaw.id, guildId: id, animated: eRaw.animated })));
        }
        catch { console.error };
    }

    fs.writeFileSync(fpath, JSON.stringify(guildsEmojis));
}


function checkForCollisions() {
    const data = JSON.parse(fs.readFileSync(fpath));
    const o = {};
    const collisions = [];

    for (const obj of data) {
        let { name } = obj;
        let i = 0;
        name = name.toLowerCase();

        if (name in o) {
            while (`${name}_${i}` in o) { i++; }
            name += `_${i}`;
        }

        const nOld = obj.name;
        delete obj.name;
        obj.oldName = nOld;
        o[name] = obj;
    }

    if (collisions.length) {
        fs.writeFile("collisions.json", JSON.stringify(collisions.sort((a, b) => a.name.localeCompare(b.name))), (err) => {
            if (err) console.error(err);
            else console.log("DONE WITH COLLISION WRITING");
        });
    }

    fs.writeFile("temp/noncollisions.json", JSON.stringify(o), (err) => {
        if (err) console.error(err);
        else console.log("DONE WITH NON-COLLISION WRITING");
    });
}


function groupByFirstLetterArr() {
    const items = JSON.parse(fs.readFileSync("temp/noncollisions.json"));
    if (!items) return console.error("ITEMS NOT FOUND!");

    const itemsByFirstChar = items.reduce((acc, item) => {
        const firstLetter = item.name[0];
        // Initialize the array if this is the first time the letter is encountered
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(item);
        return acc;
    }, {});

    for (const fChar in itemsByFirstChar) {
        fs.writeFileSync(`data/${fChar}.json`, JSON.stringify(itemsByFirstChar[fChar]));
    }
}

function groupByFirstLetterOfKey() {
    const items = JSON.parse(fs.readFileSync("temp/noncollisions.json"));
    if (!items) return console.error("ITEMS NOT FOUND!");

    const grouped = {};

    // Iterate over each key in the object
    Object.keys(items).forEach(key => {
        const firstLetter = key[0];

        if (!grouped[firstLetter]) {
            grouped[firstLetter] = {};
        }

        // Add the current property to the group corresponding to its first letter
        grouped[firstLetter][key] = items[key];
    });

    for (const fChar in grouped) {
        fs.writeFileSync(`data/${fChar}.json`, JSON.stringify(grouped[fChar]));
    }
}

groupByFirstLetterOfKey();