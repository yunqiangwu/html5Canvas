(function(window) {

    var WebSocketClient = {};

    WebSocketClient.init = function(options) {
        let connected = false
        let events = {}
        let messageCache = []
        let _ws = ''
        const init = () => {
            this._ws = new window.WebSocket(options.path)
            _ws = this._ws
            this._ws.onopen = (e) => {
                connected = true
                options._open()
                options.open.call(this, e)
            }
            this._ws.onmessage = ({ data }) => {
                const message = JSON.parse(data)
                event('message', message)
                if (message.id) {
                    event(message.id, message)
                } else {
                    event(message.type, message.data)
                }
            }
            this._ws.onclose = (e) => {
                connected = false
                options._close()
                options.close.call(this, e)
            }
            this._ws.onerror = (e) => {
                options.error.call(this, e)
            }
        }

        const opt = {
                open() {},
                _open() { sendMessageCache() },
                _close() {
                    setTimeout(init, 5000)
                },
                close() {},
                message() {},
                error() {}
            }
            // options = {...opt, ...options}
        options = Object.assign({}, opt,options);

        this.send = (data, type = -1) => {
            let msg = { data, type }
            sendMsg(msg)
        }

        function sendMessageCache() {
            if (messageCache.length) {
                let msg = messageCache.shift()
                sendMsg(msg)
                sendMessageCache()
            }
        }

        function sendMsg(msg) {
            if (connected) {
                _ws.send(JSON.stringify(msg))
            } else {
                messageCache.push(msg)
            }
        }


        this.on = (name, fn) => {
            if (typeof fn === 'function') {
                if (!events[name]) events[name] = []
                events[name].push(fn)
            }
        }

        this.off = (name, fn) => {
            const eventsArray = events[name]
            if (eventsArray) {
                eventsArray.every(eventFn => {
                    if (eventFn === fn) {
                        eventsArray.splice(eventsArray.indexOf(eventFn), 1)
                        return false
                    }
                    return true
                })
            }
        }


        function event(name, data) {
            let eventsArray = events[name]
            eventsArray && eventsArray.forEach(fn => fn(data))
        }

        init()
        return this
    }

    window.WebSocketClient = WebSocketClient;


})(window);
// console.log(window.WebSocketClient)