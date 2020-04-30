/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import { serve } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@v0.41.0/ws/mod.ts";

Deno.listenTLS
Deno.connectTLS

import { Message } from './messages.ts';
import { Event, Emitter } from './events.ts';
import * as Is from './is.ts';

let ContentLength: string = 'Content-Length: ';
let CRLF = '\r\n';

export interface MessageWriter {
	readonly onError: Event<[Error, Message | undefined, number | undefined]>;
	readonly onClose: Event<void>;
	write(msg: Message): void;
	dispose(): void;
}

export namespace MessageWriter {
	export function is(value: any): value is MessageWriter {
		let candidate: MessageWriter = value;
		return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) &&
			Is.func(candidate.onError) && Is.func(candidate.write);
	}
}

export abstract class AbstractMessageWriter {

	private errorEmitter: Emitter<[Error, Message | undefined, number | undefined]>;
	private closeEmitter: Emitter<void>;

	constructor() {
		this.errorEmitter = new Emitter<[Error, Message, number]>();
		this.closeEmitter = new Emitter<void>();
	}

	public dispose(): void {
		this.errorEmitter.dispose();
		this.closeEmitter.dispose();
	}

	public get onError(): Event<[Error, Message | undefined, number | undefined]> {
		return this.errorEmitter.event;
	}

	protected fireError(error: any, message?: Message, count?: number): void {
		this.errorEmitter.fire([this.asError(error), message, count]);
	}

	public get onClose(): Event<void> {
		return this.closeEmitter.event;
	}

	protected fireClose(): void {
		this.closeEmitter.fire(undefined);
	}

	private asError(error: any): Error {
		if (error instanceof Error) {
			return error;
		} else {
			return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : 'unknown'}`);
		}
	}
}

export class StreamMessageWriter extends AbstractMessageWriter implements MessageWriter {

	private writable: NodeJS.WritableStream;
	private encoding: BufferEncoding;
	private errorCount: number;

	public constructor(writable: NodeJS.WritableStream, encoding: BufferEncoding = 'utf8') {
		super();
		this.writable = writable;
		this.encoding = encoding;
		this.errorCount = 0;
		this.writable.on('error', (error: any) => this.fireError(error));
		this.writable.on('close', () => this.fireClose());
	}

	public write(msg: Message): void {
		let json = JSON.stringify(msg);
		let contentLength = Buffer.byteLength(json, this.encoding);

		let headers: string[] = [
			ContentLength, contentLength.toString(), CRLF,
			CRLF
		];
		try {
			// Header must be written in ASCII encoding
			this.writable.write(headers.join(''), 'ascii');
			// Now write the content. This can be written in any encoding
			this.writable.write(json, this.encoding);
			this.errorCount = 0;
		} catch (error) {
			this.errorCount++;
			this.fireError(error, msg, this.errorCount);
		}
	}
}

export class SocketMessageWriter extends AbstractMessageWriter implements MessageWriter {

	private socket: Socket;
	private queue: Message[];
	private sending: boolean;
	private encoding: BufferEncoding;
	private errorCount: number;

	public constructor(socket: Socket, encoding: BufferEncoding = 'utf8') {
		super();
		this.socket = socket;
		this.queue = [];
		this.sending = false;
		this.encoding = encoding;
		this.errorCount = 0;
		this.socket.on('error', (error: any) => this.fireError(error));
		this.socket.on('close', () => this.fireClose());
	}

	public dispose(): void {
		super.dispose();
		this.socket.destroy();
	}

	public write(msg: Message): void {
		if (!this.sending && this.queue.length === 0) {
			// See https://github.com/nodejs/node/issues/7657
			this.doWriteMessage(msg);
		} else {
			this.queue.push(msg);
		}
	}

	public doWriteMessage(msg: Message): void {
		let json = JSON.stringify(msg);
		let contentLength = Buffer.byteLength(json, this.encoding);

		let headers: string[] = [
			ContentLength, contentLength.toString(), CRLF,
			CRLF
		];
		try {
			// Header must be written in ASCII encoding
			this.sending = true;
			this.socket.write(headers.join(''), 'ascii', (error: any) => {
				if (error) {
					this.handleError(error, msg);
				}
				try {
					// Now write the content. This can be written in any encoding
					this.socket.write(json, this.encoding, (error: any) => {
						this.sending = false;
						if (error) {
							this.handleError(error, msg);
						} else {
							this.errorCount = 0;
						}
						if (this.queue.length > 0) {
							this.doWriteMessage(this.queue.shift()!);
						}
					});
				} catch (error) {
					this.handleError(error, msg);
				}
			});
		} catch (error) {
			this.handleError(error, msg);
		}
	}

	private handleError(error: any, msg: Message): void {
		this.errorCount++;
		this.fireError(error, msg, this.errorCount);
	}
}
