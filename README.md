# ScriptsRun VS Code extension

`Run package.json scripts`

- npm
- pnpm
- yarn

## Install or Download

[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=LIUeng.scripts-run)

## Support

- Multiple workspace folders
- Current package.json scripts
- Custom scripts
- Nvm - switch node version

## Demo

> Multiple workspace folders

https://github.com/user-attachments/assets/88c1e983-b12c-4312-b62a-0b0ccf6a7a91

> Package.json scripts

![image](https://github.com/user-attachments/assets/f7965a72-6dc1-4726-8c07-5345ac9dd10b)
![image](https://github.com/user-attachments/assets/b189f937-d7a1-4a37-b778-ea7c7d9452f9)


> Custom scripts

https://github.com/user-attachments/assets/86be8721-0159-4b4d-8036-ac73701cc748

> Switch node version if nvm installed

https://github.com/user-attachments/assets/202213b8-ed58-4f17-a943-767a1562569a

## Settings

| ID                                                       | Description                                              | Default                                        |
| -------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| scriptsRun.cache                                         | Storage workspace scripts                                | true                                           |
| scriptsRun.excludeFiles                                  | Exclude search scripts files(use glob pattern)           | ["node_modules/\*\*", "bower_components/\*\*"] |
| scriptsRun.showTerminal                                  | Run show terminal window(background)                     | true                                           |
| scriptsRun.treeMap                                       | Depth tree search the scripts support                    | false                                          |
| scriptsRun.whichNvmThe nvm where install default(~/.nvm) | scriptsRun.whichNvmThe nvm where install default(~/.nvm) | ~/.nvm                                         |

## LICENSE

MIT

