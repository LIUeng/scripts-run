# VSCode 脚本运行插件

运行 package.json 文件中包含的 scripts 属性

- npm
- pnpm
- yarn
- bun
- ...(自定义)

## 安装下载

[VS Code 插件市场 scripts-run](https://marketplace.visualstudio.com/items?itemName=LIUeng.scripts-run)

## 支持

- 多个文件夹
    - 遍历含有 package.json 文件中的 scripts
- 自定义脚本
- 使用 Nvm 控制 Node 版本

## 演示

> 多个文件夹支持

需要设置

✅ Scripts Run: Tree Map

<video controls autoplay src="https://github.com/user-attachments/assets/88c1e983-b12c-4312-b62a-0b0ccf6a7a91"></video>

> 当前脚本列表

![image](https://github.com/user-attachments/assets/f7965a72-6dc1-4726-8c07-5345ac9dd10b)
![image](https://github.com/user-attachments/assets/b189f937-d7a1-4a37-b778-ea7c7d9452f9)

> 自定义脚本

<video controls autoplay src="https://github.com/user-attachments/assets/86be8721-0159-4b4d-8036-ac73701cc748"></video>

> 切换 Node 版本运行脚本

<video controls autoplay src="https://github.com/user-attachments/assets/202213b8-ed58-4f17-a943-767a1562569a"></video>

## 配置如下

| ID                      | Description                                              | Default                                        |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| scriptsRun.cache        | 是否缓存运行（删除）或者自定义添加的脚本                 | true                                           |
| scriptsRun.excludeFiles | 排除文件夹下的 package.json 文件                         | ["node_modules/\*\*", "bower_components/\*\*"] |
| scriptsRun.showTerminal | 是否后台运行                                             | true                                           |
| scriptsRun.treeMap      | 只显示根目录或者深层次遍历文件夹                         | false                                          |
| scriptsRun.whichNvm     | Nvm 安装的位置                                           | ~/.nvm                                         |
| scriptsRun.whichType    | 脚本运行的类型，如果设定了以设定优先，否则会自动判断类型 | npm                                            |
