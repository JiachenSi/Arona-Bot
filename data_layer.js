const fs = require('node:fs');
const { guildId } = require("./config.json");

let user_data = null;

// Initialize data storage with all members on the server
const initiateStorage = async (readyClient) => {
    const server = readyClient.guilds.cache.get(guildId)
    const membersDirty = await server.members.fetch()
    const members = membersDirty.filter((member) => !member.user.bot);
    const memberData = {}
    
    // Create a new obj for each member
    // Level: 1, Exp: 0
    for(const [id, member] of members) {
        const record = {};
        record.username = member.user.username;
        record.level = 1;
        record.currentExp = 0;
        memberData[id] = record;
    }        
    fs.writeFileSync('./data.json', JSON.stringify(memberData, null, 2));

    loadUserData();
}

const loadUserData = () => {
    if(!user_data && fs.existsSync('./data.json')) {
        user_data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
    }
}

const getMember = (id) => {
    return user_data[id];
}

const updateMember = (id, member) => {
    if(user_data) {
        user_data[id] = member;
    }
    fs.writeFileSync('./data.json', JSON.stringify(user_data, null, 2));
}

module.exports = {
    initiateStorage,
    loadUserData,
    getMember,
    updateMember
}