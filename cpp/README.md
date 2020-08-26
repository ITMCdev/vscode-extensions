# Extension Pack for Visual Studio Code

Includes the basic extensions to get started with [C](https://en.wikipedia.org/wiki/C_(programming_language))/[C++](https://en.wikipedia.org/wiki/C%2B%2B) development in Visual Studio Code.

## Extensions

Extension | Objective
--------- | ---------
[C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) | C/C++ IntelliSense, debugging, and code browsing.
[C/C++ Snippets](https://marketplace.visualstudio.com/items?itemName=hars.CppSnippets) | Code snippets for C/C++
[clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) | C and C++ completion, navigation, and insights browsing.
<!-- [you-complete-me](https://marketplace.visualstudio.com/items?itemName=RichardHe.you-complete-me) | YouCompleteMe for vscode -->

## Configuration

### clangd

Install the packages required by the extension, which will give you a similar config:
```json
    "clangd.path": "c:\\Users\\youruser\\AppData\\Roaming\\Code\\User\\globalStorage\\llvm-vs-code-extensions.vscode-clangd\\install\\10.0.0\\clangd_10.0.0\\bin\\clangd.exe",
```

In order to be able to read the definitions of the libraries you're using, add in your config a `clangd.arguments` key, having similar properties as the one bellow (which is an example for developing a nodejs addon with nan)

```json
    "clangd.arguments": [
        "-IC:/Users/dragosc/Workspace/exploit-server-llsign/node_modules/nan",
        "-IC:/Users/dragosc/AppData/Local/node-gyp/Cache/12.16.2/include/node"
    ]
```

## Contact

Please file any [issues](https://github.com/itmcdev/vscode-extensions/issues).