// Helper functions for getting emotes from Discord

async function getUserEmotes(token, serverId=null) {
    const getGuildEmotes = async (id) => {
        try {
            const r = await fetch(`https://discord.com/api/guilds/${id}/emojis`, { headers: { Authorization: token } });
            const guildEmojis = await r.json();
            return guildEmojis.map(eRaw => ({ name: eRaw.name, id: eRaw.id, guildId: id, animated: eRaw.animated }));
        }
        catch { console.error };
    }

    if (serverId) return await getGuildEmotes(serverId);

    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: token }
    });

    const data = await response.json();
    const guildsEmojis = [];
    
    for (const { id } of data) {
        try {
            guildsEmojis.push(...(await getGuildEmotes(id)));
        }
        catch { console.error };
    }

    return guildsEmojis;
}


async function handleCollisions(data) {
    const o = {};

    for (const obj of data) {
        let { name } = obj;
        let i = 0;
        name = name.toLowerCase();

        // get the corresponding file in the db
        const res = await fetch(`https://raw.githubusercontent.com/ION606/streamelements/main/data/${name[0]}.json`);
        const data = await res.json();
        const keys = Object.keys(data);

        if (name in o || keys.find((eName) => (eName == name))) {
            while (`${name}_${i}` in o) { i++; }
            name += `_${i}`;
        }

        const nOld = obj.name;
        delete obj.name;
        obj.oldName = nOld;
        o[name] = obj;
    }

    return o;
}


/**
 * @deprecated
 */
function groupByFirstLetterArr(items) {
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

    return itemsByFirstChar;
}


function groupByFirstLetterOfKey(items) {
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

    return grouped;
}


/*
(async () => {
    const a = await getUserEmotes(process.env.TOKEN),
    b = await handleCollisions(a),
    c = groupByFirstLetterOfKey(b);
    for (const k in c) {
        require('fs').writeFile(`data/${k}.json`, JSON.stringify(c[k]), console.error);
    }
});
*/