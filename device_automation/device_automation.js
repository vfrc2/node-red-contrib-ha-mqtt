const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device_automation', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const subtype = cfg.name
            cfg.name = `${subtype}${cfg.action}`
            const ha = new HomeAssistant(this, cfg)
            const node = this
            const { name, state_topic } = ha.config
            node.on('input', function (msg) {
                const { payload } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.state_topic, name, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })

            try {
                let device = null
                if (cfg.device) {
                    const deviceNode = RED.nodes.getNode(cfg.device);
                    device = deviceNode.device_info
                }
                ha.discovery({                    
                    device,
                    name: null,
                    unique_id: null,
                    state_topic: null,
                    json_attr_t: null,
                    automation_type: 'trigger',
                    topic: state_topic,
                    type: cfg.action,
                    subtype
                })
                this.status({ fill: "green", shape: "ring", text: `node-red-contrib-ha-mqtt/common:publish.config` });
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
        }
    })
}