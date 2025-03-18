import type { BedrockPortal } from '../index'
import { XboxMessage } from 'xbox-message'
import Module from '../classes/Module'
import Host from '../classes/Host'

export default class InviteAll extends Module {

  public clients: Map<string, XboxMessage>

  constructor(portal: BedrockPortal) {
    super(portal, 'inviteAll', 'Automatically invite all online players to the server')

    this.clients = new Map<string, XboxMessage>()
  }

  async run() {

    const xboxMessageHandler = async (host: Host) => {

      const client = new XboxMessage({ authflow: host.authflow })

      this.clients.set(host.authflow.username, client)

      // Fetch online players and invite them
      client.on('onlinePlayers', async (players) => {

        this.debug(`Found ${players.length} online players`)

        for (const player of players) {
          // Invite all online players
          await this.portal.invitePlayer(player.xuid)
          this.debug(`Sent invite to ${player.gamertag}`)
        }

      })

      await client.connect()

    }

    // Handle main account
    xboxMessageHandler(this.portal.host)

    // Handle multiple accounts (if needed)
    const multipleAccounts = this.portal.modules.get('multipleAccounts')

    if (multipleAccounts) {
      for (const account of multipleAccounts.peers.values()) {
        xboxMessageHandler(account)
          .catch(error => this.debug(`Error: ${error.message}`, error))
      }
    }

  }

  async stop() {
    super.stop()

    for (const client of this.clients.values()) {
      await client.destroy()
    }
  }
}
