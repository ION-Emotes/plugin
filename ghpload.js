// for the bot
const {ghtoken} = require('./config.json');
if (!ghtoken) throw "NO GITHUB TOKEN FOUND!";

const axios = require('axios');
const base64 = require('base-64');

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
 * @param {{serverId: String, key: String}} delObj 
 * @returns 
 */
async function updateJsonFile(owner, repo, path, newData, delObj = null) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    try {
        // Get the current file content
        const response = await axios.get(url, {
            headers: { 'Authorization': `token ${ghtoken}` }
        });

        // Decode the base64 content to a string
        const content = base64.decode(response.data.content);

        let json = JSON.parse(content);

        if (delObj) {
            if (json[delObj.key].serverId !== delObj.serverId) return null;
            delete json[delObj.key];
        }
        else json[newData.key] = newData.val;

        // Convert the modified JSON back to a string and then to base64
        const newContent = base64.encode(JSON.stringify(json));

        // Prepare the commit
        const updateData = {
            message: `Update emote for ${url} via bot`,
            content: newContent,
            sha: response.data.sha // SHA of the file you're replacing, to ensure you're updating the right version
        };

        // Commit the update
        const updateResponse = await axios.put(url, updateData, {
            headers: { 'Authorization': `token ${ghtoken}` }
        });

        return {fpath: updateResponse.data.content.html_url};
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function add(newData) {
    const owner = 'ion606';
    const repo = 'streamelements';
    const dataNew = Object.entries(await handleCollisions(newData));

    for (const [key, val] of dataNew) {
        const path = `data/${key[0]}.json`;
        updateJsonFile(owner, repo, path, {key, val});
    }
}


async function rem(key, serverId) {
    const owner = 'ion606';
    const repo = 'streamelements';
    const path = `data/${key[0]}.json`;
    updateJsonFile(owner, repo, path, null, {key, serverId});
}



// add([{ id: '1025090058585395231', name: 'ion_bot_old', animated: false, serverId: '533782975079251999' }]);
// rem("ion_bot_old_0", "533782975079251999");

module.exports = {rem, add};
