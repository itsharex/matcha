/* eslint-disable camelcase */
import { Adapter } from '@/adapter/adapter'
import { useStatusStore } from '@/stores'
import { getTimestamp } from '@/utils'

import { ActionHandler } from './action'
import { EventHandler, LifeCycleMetaEvent, HeartbeatMetaEvent } from './event'

import type { OneBotHeaders } from '@/adapter/adapter'

interface OneBotV11Headers extends OneBotHeaders {
  'X-Self-ID': string
  'X-Client-Role': 'API' | 'Event' | 'Universal'
}

export class OneBotV11 extends Adapter {
  readonly protocolName = 'OneBot V11 标准'
  readonly protocolId = 'OneBot.V11.Standard'
  readonly protocolUrl = ''
  readonly supportMode = 'websocketClient'
  readonly actionHandler = new ActionHandler()
  readonly eventHandler = new EventHandler()

  getConnectHeaders(): OneBotV11Headers {
    const status = useStatusStore()
    return {
      'X-Self-ID': status.assignBot.toString(),
      'X-Client-Role': 'Universal',
    }
  }

  async onConnect(): Promise<void> {
    const connectEvent: LifeCycleMetaEvent = {
      post_type: 'meta_event',
      meta_event_type: 'lifecycle',
      sub_type: 'connect',
      time: getTimestamp(),
      self_id: Number(this.status.assignBot),
    }
    await this.send(connectEvent)
  }

  async onHeartbeat(): Promise<void> {
    const HeartbeatEvent: HeartbeatMetaEvent = {
      post_type: 'meta_event',
      meta_event_type: 'heartbeat',
      time: getTimestamp(),
      interval: this.config.heartbeatInterval,
      self_id: Number(this.status.assignBot),
      status: {
        online: true,
        good: true,
      },
    }
    await this.send(HeartbeatEvent)
  }
}
