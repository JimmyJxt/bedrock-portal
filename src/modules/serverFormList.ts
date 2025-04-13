import { BedrockPortal } from '..'
import Module from '../classes/Module'
import { start_game } from '../common/start_game'

export default class ServerFromList extends Module {

  public options: {
    /**
     * The server to redirect the player to
    */
    redirect: {
      ip: string,
      port: number
    }
  }

  constructor(portal: BedrockPortal) {
    super(portal, 'serverFromList', 'Redirects players immediately on join')
    this.options = {
      redirect: {
        ip: 'bedrock.opblocks.com', // Change to your desired target
        port: 19132
      }
    }
  }

  async run() {
    this.portal.onServerConnection = (client) => {
      client.once('join', () => this.handleJoin(client))
    }
  }

  private handleJoin(client: any) {
    // Send minimal required packets to maintain joinability
    client.write('resource_packs_info', {
      must_accept: false,
      has_scripts: false,
      behaviour_packs: [],
      world_template: { uuid: '550e8400-e29b-41d4-a716-446655440000', version: '' },
      texture_packs: [],
      resource_pack_links: [],
    })

    client.write('resource_pack_stack', {
      must_accept: false,
      behavior_packs: [],
      resource_packs: [],
      game_version: '',
      experiments: [],
      experiments_previously_used: false
    })

    client.once('resource_pack_client_response', async () => {
      // Optionally start game for presence, then transfer
      client.write('start_game', start_game)
      client.write('item_registry', { itemstates: [] })
      client.write('play_status', { status: 'player_spawn' })

      setTimeout(() => {
        client.write('transfer', {
          server_address: this.options.redirect.ip,
          port: this.options.redirect.port
        })
      }, 500) // small delay to ensure visibility
    })
  }
}
