import * as http from "http"
import * as https from "https"
export class agenttools {
  static async AddRequestToken(url: string) {
    var tokenkey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var u: URL = new URL(url);
    var host = u.host;
    if (host.startsWith("grpc.")) host = host.substring(5);
    var base = u.protocol + "//" + host;
    if (u.protocol == "wss:") {
      base = "https://" + host;
    } else if (u.protocol == "ws:") {
      base = "http://" + host;
    }
    var addtokenurl = base + "/AddTokenRequest";
    var signinurl = base + "/login?key=" + tokenkey;
    var result = await agenttools.post(null, null, addtokenurl, JSON.stringify({ key: tokenkey }));
    var res = JSON.parse(result)
    return [tokenkey, signinurl];
  }
  static async WaitForToken(url: string, tokenkey: string) {
    return new Promise<string>((resolve, reject) => {
      var u: URL = new URL(url);
      var host = u.host;
      if (host.startsWith("grpc.")) host = host.substring(5);
      var base = u.protocol + "//" + host;
      if (u.protocol == "wss:") {
        base = "https://" + host;
      } else if (u.protocol == "ws:") {
        base = "http://" + host;
      }
      var gettokenurl = base + "/GetTokenRequest?key=" + tokenkey;
      const id = setInterval(async () => {
        var result = await agenttools.get(gettokenurl);
        var res = JSON.parse(result)
        if (res.jwt != "" && res.jwt != null) {
          clearInterval(id);
          resolve(res.jwt);
        }
      }, 2500);
    });
  }
  static get(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      var provider = http;
      if (url.startsWith("https")) {
        // @ts-ignore
        provider = https;
      }
      provider.get(url, (resp: any) => {
        let data = "";
        resp.on("data", (chunk: any) => {
          data += chunk;
        });
        resp.on("end", () => {
          resolve(data);
        });
      }).on("error", (err: any) => {
        reject(err);
      });
    })
  }
  static post(jwt: string, agent: any, url: string, body: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        var provider = http;
        var u = new URL(url);
        var options = {
          rejectUnauthorized: false,
          agent: agent,
          hostname: u.hostname,
          port: u.port,
          path: u.pathname,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
          }
        };
        if (agent == null) {
          delete options.agent;
        }
        if (jwt != null && jwt != "") {
          // @ts-ignore
          options.headers["Authorization"] = "Bearer " + jwt;
        }
        if (url.startsWith("https")) {
          delete options.agent;
          // @ts-ignore
          provider = https;
        }
        var req = provider.request(url, options, (res: any) => {
          var o = options;
          var b = body;
          res.setEncoding("utf8");
          if (res.statusCode != 200) {
            return reject(new Error("HTTP Error: " + res.statusCode + " " + res.statusMessage));
          }
          var _body = "";
          res.on("data", (chunk: any) => {
            _body += chunk;
          });
          res.on("end", () => {
            var r = res;
            resolve(_body);
          });
        }
        );
        req.write(body);
        req.end();

      } catch (error) {
        reject(error);
      }
    })
  }
}
