# VSCode JSON RPC for Deno

[![tag](https://img.shields.io/github/release/denodev/deno_vscode_languageserver)](https://github.com/denodev/deno_vscode_languageserver/releases)
[![Build Status](https://github.com/denodev/deno_vscode_languageserver/workflows/ci/badge.svg?branch=master)](https://github.com/denodev/deno_vscode_languageserver/actions)

This Deno module implements the base messaging protocol spoken between a VSCode language server and a VSCode language client.

The Deno module can also be used standalone to establish a [JSON-RPC](http://www.jsonrpc.org/) channel between
a client and a server. Below an example how to setup a JSON-RPC connection. First the client side.

**Modified from [microsoft/vscode-languageserver-node's JSON RPC @1c1f6cd](https://github.com/microsoft/vscode-languageserver-node/tree/1c1f6cd/jsonrpc)**.

```ts
import * as cp from 'child_process';
import * as rpc from 'vscode-jsonrpc';

let childProcess = cp.spawn(...);

// Use stdin and stdout for communication:
let connection = rpc.createMessageConnection(
	new rpc.StreamMessageReader(childProcess.stdout),
	new rpc.StreamMessageWriter(childProcess.stdin));

let notification = new rpc.NotificationType<string, void>('testNotification');

connection.listen();

connection.sendNotification(notification, 'Hello World');
```

The server side looks very symmetrical:

```ts
import * as rpc from 'vscode-jsonrpc';


let connection = rpc.createMessageConnection(
	new rpc.StreamMessageReader(process.stdin),
	new rpc.StreamMessageWriter(process.stdout));

let notification = new rpc.NotificationType<string, void>('testNotification');
connection.onNotification(notification, (param: string) => {
	console.log(param); // This prints Hello World
});

connection.listen();
```

# History

### 5.0.0

- add progress support
- move JS target to ES2017

### 4.0.0

- move JS target to ES6.

### 3.0.0:

- converted the NPM module to use TypeScript 2.0.3.
- added strict null support.
- support for passing more than one parameter to a request or notification.
- Breaking changes:
  - due to the use of TypeScript 2.0.3 and differences in d.ts generation users of the new version need to move to
    TypeScript 2.0.3 as well.

## License
[MIT](https://github.com/Microsoft/vscode-languageserver-node/blob/master/License.txt)