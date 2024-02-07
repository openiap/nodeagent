import { openiap } from '@openiap/nodeapi';
import * as net from 'net';
export class CacheItem {
  public seq: number;
  public data: Buffer;
}
export class HostConnection {
  public id: string;
  public seq: number;
  public sendseq: number;  
  public replyqueue: string;
  public created: Date;
  public lastUsed: Date;
  public socket: net.Socket;
  public cache: CacheItem[];
}
export class ClientConnection {
  public id: string;
  public seq: number;
  public sendseq: number;  
  public replyqueue: string;
  public created: Date;
  public lastUsed: Date;
  public socket: net.Socket;
  public cache: CacheItem[];
}
// export async function FindFreePort(prefered: number): Promise<number> {
//   return new Promise(res => {
//       const srv = net.createServer();
//       srv.listen(0, () => {
//           // @ts-ignore
//           const port = srv.address().port
//           srv.close((err) => res(port))
//       });
//   })
// }
export async function FindFreePort(preferred: number): Promise<number> {
  return new Promise((resolve, reject) => {
    let srv = net.createServer();
    try {
      srv.on('error', (err) => {
        if (err.message.includes('EADDRINUSE')) {
          srv = net.createServer();
          // If preferred port is in use, listen on a random free port by specifying port 0
          srv.listen(0, () => {
            var a = srv.address();
            // @ts-ignore
            const port = a.port;
            srv.close(() => resolve(port));
          });
        } else {
          // If other error, reject the promise
          reject(err);
        }
      });
  
      srv.listen(preferred, () => {
        // @ts-ignore
        const port = srv.address().port;
        // Preferred port is available, use it
        srv.close(() => resolve(port));
      });
    } catch (error) {
        // If preferred port is in use, listen on a random free port by specifying port 0
        srv.listen(0, () => {
          // @ts-ignore
          const port = srv.address().port;
          srv.close(() => resolve(port));
        });
    }
  });
}

export class HostPortMapper {
  connections = new Map<string, HostConnection>();
  sendTimer: NodeJS.Timer;
  running: boolean = true;
  created = new Date();
  lastUsed = new Date();
  id: string = "";
  constructor(public client: openiap, public port: number, public portname: string, public host: string, public streamid: string) {
    this.id = Math.random().toString(36).substring(7);
  }
  dispose() {
    this.running = false;
    if (this.sendTimer) {
      clearTimeout(this.sendTimer as any);
    }
    this.connections.forEach((connection, id) => {
      this.removeConnection(id);
    });
  }
  newConnection(id: string, replyqueue: string) {
    let connection = this.connections.get(id);
    if (connection) {
      return connection;
    }
    connection = new HostConnection();
    connection.cache = [];
    connection.id = id;
    connection.seq = 0;
    connection.sendseq = 0;
    connection.replyqueue = replyqueue;
    connection.created = new Date();
    connection.lastUsed = new Date();
    connection.socket = net.connect({  host: this.host, port: this.port});
    connection.socket.on('error', (error) => {
      console.error(id, "HostPortMapper", error.message);
      try {
        this.removeConnection(id);
      } catch (error) {        
      }
    });
    connection.socket.on('close', () => {
      console.log(id, "HostPortMapper", "closed");
      try {
        this.removeConnection(id);
      } catch (error) {        
      }
    });
    connection.socket.on('data', (data) => {
      var a = Array.from(data);
      if(a.length > 60000) {
        while(a.length > 0) {
          const subarr = a.slice(0, 60000);
          a = a.slice(60000);
          console.log(id, connection.sendseq, "send", subarr.length, "cunk", "port connections", this.connections.size);
          this.client.QueueMessage({queuename: connection.replyqueue, data: {"command": "portdata", id, seq: connection.sendseq.toString(), "buf": subarr}}).catch((error) => {
            console.error(id, "HostPortMapper", error.message);
            try {
              this.removeConnection(id);
            } catch (error) {        
            }
          });
          connection.sendseq++;
        }
      } else {
        console.log(id, connection.sendseq, "send", a.length, "port connections", this.connections.size);
        this.client.QueueMessage({queuename: connection.replyqueue, data: {"command": "portdata", id, seq: connection.sendseq.toString(), "buf": a}}).catch((error) => {
          console.error(id, "HostPortMapper", error.message);
          try {
            this.removeConnection(id);
          } catch (error) {        
          }
        });
        connection.sendseq++;
      }
    });
    if (this.sendTimer == null) {
      this.SendCache();
    }
    this.connections.set(id, connection);
  }

  removeConnection(id: string) {
    let connection = this.connections.get(id);
    if (connection) {
      if(connection.socket != null) {
        connection.socket.removeAllListeners();
        connection.socket.destroy();
        connection.socket = null;
        this.client.QueueMessage({queuename: connection.replyqueue, data: {"command": "portclose", id, seq: connection.sendseq.toString()}}).catch((error) => {
        });

      }
      this.connections.delete(id);
    }
  }
  RemoveOldConnections() {
    const now = new Date();
    this.connections.forEach((connection, id) => {
      if (now.getTime() - connection.lastUsed.getTime() > 1000 * 60 * 10) { // 10 minutes
        console.log(id, "HostPortMapper", "idle timeout");
        this.removeConnection(id);
      }
    });
  }
  IncommingData(id: string, seq: number, data: Buffer) {
    const connection = this.connections.get(id);
    if (connection) {
      this.lastUsed = new Date();
      connection.cache.push({ seq, data });
      connection.lastUsed = new Date();
    }
  }
  SendCache() {
    try {
      if(this.running == false) {
        return;
      }
      this.connections.forEach((connection, id) => {
        if (connection.socket != null) {
          while (connection.cache.length > 0) {
            const item = connection.cache.find(x => x.seq == connection.seq);
            if(item != null) {
              connection.socket.write(item.data);
              connection.cache.splice(connection.cache.indexOf(item), 1);
              connection.seq++;
            }
          }
        }
      });
    } catch (error) {
      console.error("SendCache.send", error.message);
    }
    try {
      this.RemoveOldConnections()
    } catch (error) {
      console.error("SendCache.cleanup", error.message);
    }
    this.sendTimer = setTimeout(() => this.SendCache(), 100);
  }
}


export class ClientPortMapper {
  connections = new Map<string, ClientConnection>();
  sendTimer: NodeJS.Timer;
  running: boolean = true;
  server: net.Server;
  constructor(public client: openiap, public localport: number, public portname: string, public remoteport: number, public hostqueue: string) {
    if(this.remoteport === null || this.remoteport === undefined || this.remoteport < 1) {
      this.remoteport = undefined;
    }
    this.server = net.createServer().listen(localport);
    // @ts-ignore
    console.log("ClientPortMapper", "listening on localport", this.server.address().port, "http://127.0.0.1:" + this.server.address().port);
    console.log("forwarded to", hostqueue, "portname:", portname, "remoteport:", remoteport || "auto");
    this.server.on('connection', async (socket) => {
      const id = Math.random().toString(36).substring(7);
      let connection = this.connections.get(id);
      if (connection) {
        return connection;
      }
      connection = new ClientConnection();
      connection.cache = [];
      connection.id = id;
      connection.seq = 0;
      connection.sendseq = 0;
      connection.replyqueue = await client.RegisterQueue({queuename: ""}, async (msg, payload, user, jwt) => {
        if(payload.error != null) {
          console.error(id, "remote error", payload.error);
          try {
            this.removeConnection(id);
          } catch (error) {        
          }
          return;
        }
        if(payload.command === "portclose") {
          console.log(id, "remote", "portclose");
          try {
            this.removeConnection(id);
          } catch (error) {        
          }
          return;
        }
        if(payload.command === "portdata") {
          if(payload.buf == null) {
            return; // confirmed
          }
          console.log(id, payload.seq, "recv", payload.buf.length, "port connections", this.connections.size);
          connection.cache.push({ seq: parseInt(payload.seq), data: Buffer.from(payload.buf) });
          return;
        }
        if(payload.seq === null || payload.seq === undefined || payload.buf == null) {
          console.log(id, "remote", payload.command, "invalid ?");
          return;
        }
      });
      connection.created = new Date();
      connection.lastUsed = new Date();
      connection.socket = socket;
      connection.socket.on('error', (error) => {
        console.error(id, "ClientPortMapper", error.message);
        try {
          this.removeConnection(id);
        } catch (error) {        
        }
      });
      connection.socket.on('close', () => {
        console.log(id, "ClientPortMapper", "closed");
        try {
          this.removeConnection(id);
        } catch (error) {        
        }
      });
      connection.socket.on('data', (data) => {
        var a = Array.from(data);
        if(a.length > 60000) {
          while(a.length > 0) {
            const subarr = a.slice(0, 60000);
            a = a.slice(60000);
            console.log(id, connection.sendseq, "send", subarr.length, "cunk", "port connections", this.connections.size);
            this.client.QueueMessage({queuename: hostqueue, replyto: connection.replyqueue, 
              data: {command: "portdata", id, portname: this.portname, port: this.remoteport, seq: connection.sendseq, "buf": subarr}}).catch((error) => {
              console.error(id, "sendError", error);
              try {
                this.removeConnection(id);
              } catch (error) {        
              }
              });
            connection.sendseq++;
          }
        } else {
          console.log(id, connection.sendseq, "send", a.length, "port connections", this.connections.size);
          this.client.QueueMessage({queuename: hostqueue, replyto: connection.replyqueue, 
            data: {command: "portdata", id, portname: this.portname, port: this.remoteport, seq: connection.sendseq, "buf": a}}).catch((error) => {
              console.error(id, "sendError", error);
              try {
                this.removeConnection(id);
              } catch (error) {        
              }
            });
          connection.sendseq++;
        }
      });
      if (this.sendTimer == null) {
        this.SendCache();
      }
      this.connections.set(id, connection);
    });
  }    
  dispose() {
    this.running = false;
    if (this.sendTimer) {
      clearTimeout(this.sendTimer as any);
    }
    this.connections.forEach((connection, id) => {
      this.removeConnection(id);
    });
  }
  removeConnection(id: string) {
    let connection = this.connections.get(id);
    if (connection) {
      if(connection.socket != null) {
        connection.socket.removeAllListeners();
        connection.socket.destroy();
        connection.socket = null;
        this.client.QueueMessage({queuename: this.hostqueue, data: {command: "portclose", id, portname: this.portname, port: this.remoteport}}).catch((error) => {
        });
      }
      this.connections.delete(id);
    }
  }
  RemoveOldConnections() {
    const now = new Date();
    this.connections.forEach((connection, id) => {
      if (now.getTime() - connection.lastUsed.getTime() > 1000 * 60) {
        this.removeConnection(id);
      }
    });
  }
  IncommingData(id: string, seq: number, data: Buffer) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.cache.push({ seq, data });
      connection.lastUsed = new Date();
    }
  }
  SendCache() {
    if(this.running == false) {
      return;
    }
    try {
      this.connections.forEach((connection, id) => {
        if (connection.socket != null) {
          while (connection.cache.length > 0) {
            const item = connection.cache.find(x => x.seq == connection.seq);
            if(item != null) {
              connection.socket.write(item.data);
              connection.cache.splice(connection.cache.indexOf(item), 1);
              connection.seq++;
            }
          }
        }
      });
    } catch (error) {
      console.error("SendCache.send", error.message);
    }
    try {
      this.RemoveOldConnections()
    } catch (error) {
      console.error("SendCache.cleanup", error.message);
    }
    this.sendTimer = setTimeout(() => this.SendCache(), 100);
  }
}
