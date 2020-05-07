# VSCode Language Server - Deno

[![tag](https://img.shields.io/github/release/denodev/deno_vscode_languageserver)](https://github.com/denodev/deno_vscode_languageserver/releases)
[![Build Status](https://github.com/denodev/deno_vscode_languageserver/workflows/ci/badge.svg?branch=master)](https://github.com/denodev/deno_vscode_languageserver/actions)
[![license](https://img.shields.io/github/license/denodev/deno_vscode_languageserver)](https://github.com/denodev/deno_vscode_languageserver/blob/master/LICENSE)
[![](https://img.shields.io/badge/deno-v0.41.0-green.svg)](https://github.com/denoland/deno)

Language server protocol implementation for VSCode. This allows implementing language services in JS/TS running on Deno.

This repository contains the code for the following Deno modules:

- [ ] vscode_languageserver: implement a VSCode language server using Deno as a runtime.
- [x] vscode_languageserver_textdocument: implement text documents usable in a LSP server using Deno as a runtime.
- [ ] vscode_languageserver_protocol: the actual language server protocol definition in TypeScript.
- [x] vscode_languageserver_types: data types used by the language server client and server.
- [ ] vscode_jsonrpc: the underlying message protocol to communicate between a client and a server.

**NOTE**: vscode-languageclient: npm module to talk to a VSCode language server from a VSCode extension. _Maybe we don't need to implement it in Deno_.

### License

[deno_vscode_languageserver](https://github.com/denodev/deno_vscode_languageserver) is released under the MIT License. See the bundled [LICENSE](./LICENSE) file for details.
