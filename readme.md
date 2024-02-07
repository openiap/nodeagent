Package for handling packages.
Used to run packakes in [docker](https://hub.docker.com/r/openiap/nodeagent), native on the os as a daemon, and in user desktop with [assistant](https://github.com/openiap/assistant)

```bash
npm i @openiap/nodeagent
```

# run as 

to install on linux/macos/windows
```bash
npx -y @openiap/nodeagent
```

Run this to clean npx cache on macos/linux
```bash
rm -rf $(npm get cache)/_npx && sudo rm -rf /root/.npm/_npx
```
Run this to clean npx cache on windows
```bash
npm cache clean --force
npx clear-npx-cache
```

test running in console
```bash
npx -y @openiap/nodeagent -service
```

To remove service
```bash
npx -y @openiap/nodeagent -uninstall
```
To remove service, and remove from system
```bash
npx -y @openiap/nodeagent -uninstall
npx clear-npx-cache
```

To re-install service
```bash
npx -y @openiap/nodeagent -uninstall
npx clear-npx-cache
npx -y @openiap/nodeagent
```

To proxy a port from another agent, you first supply the agentname and next the port name.
You define the port name when you publish the package, (see [ports](#ports))
```bash
npx @openiap/nodeagent agent1:web
```

When a package gets published from vs.code it should have these fields in your package.json
```json
    "openiap": {
        "language": "nodejs",
        "typescript": true,
        "daemon": false,
        "chromium": false
    }
```
- language - tell the agent what runtime to use when executing the code
- typescript - not used at the moment, but is intented to be used when typescrip has not been compiles and is run using node-ts
- daemon - is used by the agent and openflow to determine if this is a never ending process ( like something listning on a port, or waiting on events )
- chromium - used by openflow to control what packages to show for an agent. Will only allow this package to run on agents that has an chrome or chromium browser.

## ports
You can also add a map of ports you will be listening on
```json
    "openiap": {
        "ports": [
            {"port": 3000, "portname": "web", "protocol": "TCP", "web": true}
        ]
    }
```
if port is left empty, and random free port will be used.
If port is already in use, a new free port number will be used, and injected as an envoriment variable into the host using the portname
So in above example an envoriment variable named "web" will contain the value of the port the package should use.

## protocol and web is not used right now.
- protocol is used when support for UDP has been added.
- web is intented to be used when agents gets support for sharing the same port between multiple packages using a common webserver.

