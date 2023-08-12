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

test running in console
```bash
npx -y @openiap/nodeagent -service
```