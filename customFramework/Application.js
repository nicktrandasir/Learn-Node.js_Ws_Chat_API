const http = require("http");
const EventEmitter = require("events");

// endpoint = {
//   "/users": {
//     "GET": handler
//   }
// }

module.exports = class Application {
  constructor() {
    this.emitter = new EventEmitter();
    this.server = this._createServer();
  }

  listen(port, callback) {
    this.server.listen(port, callback)
  }

  addRouter(router) {
    Object.keys(router.endpoints).forEach(path => {
      const endpoint = router.endpoints[path];
      Object.keys(endpoint).forEach((method) => {
        const handler = endpoint[method];
        this.emitter.on(this._getRouteMask(path, method), (res, req) => {
          handler(res, req)
        })
      })
    })
  }

  _createServer() {
    return http.createServer((req, res) => {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf8"
      })
      const emitted = this.emitter.emit(this._getRouteMask(req.url, req.method), req, res)
      if (!emitted) {
        res.end()
      }
    })
  }

  _getRouteMask(path, method) {
    return `[${path}]:[${method}]`
  }
}