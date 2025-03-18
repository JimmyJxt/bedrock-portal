const { Module } = require('../module')

class InviteAll extends Module {
    constructor(portal, options = {}) {
        super(portal, options)
    }

    async start() {
        console.log('[InviteAll] Module started')
        this.portal.on('playerJoin', async (player) => {
            console.log(`[InviteAll] Inviting ${player.name} to the game`)
            await this.portal.addFriend(player.xuid)
            await this.portal.invitePlayer(player.xuid)
        })
    }
}

module.exports = InviteAll
