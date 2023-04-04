# Extension Pack for Visual Studio Code

Includes the basic extensions to get started with [C](<https://en.wikipedia.org/wiki/C_(programming_language)>)/[C++](https://en.wikipedia.org/wiki/C%2B%2B) development in Visual Studio Code.

## Extensions

<!-- +Extensions -->
* [Microsoft](https://marketplace.visualstudio.com/publishers/ms-vscode) [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) :: C/C++ IntelliSense, debugging, and code browsing.
* [twxs](https://marketplace.visualstudio.com/publishers/twxs) [CMake](https://marketplace.visualstudio.com/items?itemName=twxs.cmake) :: CMake langage support for Visual Studio Code
* [Microsoft](https://marketplace.visualstudio.com/publishers/ms-vscode) [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools) :: Extended CMake support in Visual Studio Code
* [Jeff Hykin](https://marketplace.visualstudio.com/publishers/jeff-hykin) [Better C++ Syntax](https://marketplace.visualstudio.com/items?itemName=jeff-hykin.better-cpp-syntax) :: The bleeding edge of the C++ syntax
* [Vadim Chugunov](https://marketplace.visualstudio.com/publishers/vadimcn) [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) :: A native debugger powered by LLDB.  Debug C++, Rust and other compiled languages.
* [Harsh](https://marketplace.visualstudio.com/publishers/hars) [C/C++ Snippets](https://marketplace.visualstudio.com/items?itemName=hars.CppSnippets) :: Code snippets for C/C++
* [LLVM](https://marketplace.visualstudio.com/publishers/llvm-vs-code-extensions) [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) :: C/C++ completion, navigation, and insights
* [WebFreak](https://marketplace.visualstudio.com/publishers/webfreak) [Native Debug](https://marketplace.visualstudio.com/items?itemName=webfreak.debug) :: GDB, LLDB & Mago-MI Debugger support for VSCode
* [Mate Pek](https://marketplace.visualstudio.com/publishers/matepek) [C++ TestMate](https://marketplace.visualstudio.com/items?itemName=matepek.vscode-catch2-test-adapter) :: Run GoogleTest, Catch2 and DOCtest tests from VSCode
* [amir](https://marketplace.visualstudio.com/publishers/amiralizadeh9480) [C++ Helper](https://marketplace.visualstudio.com/items?itemName=amiralizadeh9480.cpp-helper) :: Create implementation for c++ function prototypes.
* [David Brötje](https://marketplace.visualstudio.com/publishers/davidbroetje) [C++ Algorithm Mnemonics](https://marketplace.visualstudio.com/items?itemName=davidbroetje.algorithm-mnemonics-vscode) :: C++ Algorithm Mnemonics as VSCode snippets.
* [itmcdev](https://marketplace.visualstudio.com/publishers/itmcdev) [ITMCDev Generic Extension Pack](https://marketplace.visualstudio.com/items?itemName=itmcdev.generic-extension-pack) :: A collection of generic extensions for development inside ITMC
<!-- -Extensions -->

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
