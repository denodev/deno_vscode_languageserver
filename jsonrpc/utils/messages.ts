/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as is from './is.ts';

/**
 * A language server message
 */
export interface Message {
	jsonrpc: string;
}

/**
 * Request message
 */
export interface RequestMessage extends Message {

	/**
	 * The request id.
	 */
	id: number | string;

	/**
	 * The method to be invoked.
	 */
	method: string;

	/**
	 * The method's params.
	 */
	params?: any
}

/**
 * Predefined error codes.
 */
export namespace ErrorCodes {
	// Defined by JSON RPC
	export const ParseError: number = -32700;
	export const InvalidRequest: number = -32600;
	export const MethodNotFound: number = -32601;
	export const InvalidParams: number = -32602;
	export const InternalError: number = -32603;
	export const serverErrorStart: number = -32099;
	export const serverErrorEnd: number = -32000;
	export const ServerNotInitialized: number = -32002;
	export const UnknownErrorCode: number = -32001;

	// Defined by the protocol.
	export const RequestCancelled: number = -32800;
	export const ContentModified: number = -32801;

	// Defined by VSCode library.
	export const MessageWriteError: number = 1;
	export const MessageReadError: number = 2;
}

export interface ResponseErrorLiteral<D> {
	/**
	 * A number indicating the error type that occured.
	 */
	code: number;

	/**
	 * A string providing a short decription of the error.
	 */
	message: string;

	/**
	 * A Primitive or Structured value that contains additional
	 * information about the error. Can be omitted.
	 */
	data?: D;
}

/**
 * An error object return in a response in case a request
 * has failed.
 */
export class ResponseError<D> extends Error {

	public readonly code: number;
	public readonly data: D | undefined;

	constructor(code: number, message: string, data?: D) {
		super(message);
		this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
		this.data = data;
		Object.setPrototypeOf(this, ResponseError.prototype);
	}

	public toJson(): ResponseErrorLiteral<D> {
		return {
			code: this.code,
			message: this.message,
			data: this.data,
		};
	}
}

/**
 * A response message.
 */
export interface ResponseMessage extends Message {
	/**
	 * The request id.
	 */
	id: number | string | null;

	/**
	 * The result of a request. This member is REQUIRED on success.
	 * This member MUST NOT exist if there was an error invoking the method.
	 */
	result?: string | number | boolean | object | null;

	/**
	 * The error object in case a request fails.
	 */
	error?: ResponseErrorLiteral<any>;
}

/**
 * A LSP Log Entry.
 */
export type LSPMessageType =
	| 'send-request'
	| 'receive-request'
	| 'send-response'
	| 'receive-response'
	| 'send-notification'
	| 'receive-notification';

export interface LSPLogMessage {
	type: LSPMessageType;
	message: RequestMessage | ResponseMessage | NotificationMessage;
	timestamp: number;
}

/**
 * An interface to type messages.
 */
export interface MessageType {
	readonly method: string;
	readonly numberOfParams: number;
}

/**
 * An abstract implementation of a MessageType.
 */
export abstract class AbstractMessageType implements MessageType {
	constructor(private _method: string, private _numberOfParams: number) {
	}

	get method(): string {
		return this._method;
	}

	get numberOfParams(): number {
		return this._numberOfParams;
	}
}

/**
 * End marker interface for request and notification types.
 */
export interface _EM {
	_$endMarker$_: number;
}

/**
 * Classes to type request response pairs
 *
 * The type parameter RO will be removed in the next major version
 * of the JSON RPC library since it is a LSP concept and doesn't
 * belong here. For now it is tagged as default never.
 */
export class RequestType0<R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [R, E, RO, _EM];
	constructor(method: string) {
		super(method, 0);
	}
}

export class RequestType<P, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 1);
	}
}

export class RequestType1<P1, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 1);
	}
}

export class RequestType2<P1, P2, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 2);
	}
}

export class RequestType3<P1, P2, P3, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 3);
	}
}

export class RequestType4<P1, P2, P3, P4, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 4);
	}
}

export class RequestType5<P1, P2, P3, P4, P5, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 5);
	}
}

export class RequestType6<P1, P2, P3, P4, P5, P6, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 6);
	}
}

export class RequestType7<P1, P2, P3, P4, P5, P6, P7, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, P7, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 7);
	}
}

export class RequestType8<P1, P2, P3, P4, P5, P6, P7, P8, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, P7, P8, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 8);
	}
}

export class RequestType9<P1, P2, P3, P4, P5, P6, P7, P8, P9, R, E, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, P7, P8, P9, R, E, RO, _EM];
	constructor(method: string) {
		super(method, 9);
	}
}

/**
 * Notification Message
 */
export interface NotificationMessage extends Message {
	/**
	 * The method to be invoked.
	 */
	method: string;

	/**
	 * The notification's params.
	 */
	params?: any
}

/**
 * The type parameter RO will be removed in the next major version
 * of the JSON RPC library since it is a LSP concept and doesn't
 * belong here. For now it is tagged as default never.
 */
export class NotificationType<P, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P, RO, _EM];
	constructor(method: string) {
		super(method, 1);
		this._ = undefined;
	}
}

export class NotificationType0<RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [RO, _EM];
	constructor(method: string) {
		super(method, 0);
	}
}

export class NotificationType1<P1, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, RO, _EM];
	constructor(method: string) {
		super(method, 1);
	}
}

export class NotificationType2<P1, P2, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, RO, _EM];
	constructor(method: string) {
		super(method, 2);
	}
}

export class NotificationType3<P1, P2, P3, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, RO, _EM];
	constructor(method: string) {
		super(method, 3);
	}
}

export class NotificationType4<P1, P2, P3, P4, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, RO, _EM];
	constructor(method: string) {
		super(method, 4);
	}
}

export class NotificationType5<P1, P2, P3, P4, P5, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, RO, _EM];
	constructor(method: string) {
		super(method, 5);
	}
}

export class NotificationType6<P1, P2, P3, P4, P5, P6, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, RO, _EM];
	constructor(method: string) {
		super(method, 6);
	}
}

export class NotificationType7<P1, P2, P3, P4, P5, P6, P7, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, P7, RO, _EM];
	constructor(method: string) {
		super(method, 7);
	}
}

export class NotificationType8<P1, P2, P3, P4, P5, P6, P7, P8, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, P7, P8, RO, _EM];
	constructor(method: string) {
		super(method, 8);
	}
}

export class NotificationType9<P1, P2, P3, P4, P5, P6, P7, P8, P9, RO = never> extends AbstractMessageType {
	/**
	 * Clients must not use this property. It is here to ensure correct typing.
	 */
	public readonly _?: [P1, P2, P3, P4, P5, P6, P7, P8, P9, RO, _EM];
	constructor(method: string) {
		super(method, 9);
	}
}

/**
 * Tests if the given message is a request message
 */
export function isRequestMessage(message: Message | undefined): message is RequestMessage {
	let candidate = <RequestMessage>message;
	return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
}

/**
 * Tests if the given message is a notification message
 */
export function isNotificationMessage(message: Message | undefined): message is NotificationMessage {
	let candidate = <NotificationMessage>message;
	return candidate && is.string(candidate.method) && (<any>message).id === void 0;
}

/**
 * Tests if the given message is a response message
 */
export function isResponseMessage(message: Message | undefined): message is ResponseMessage {
	let candidate = <ResponseMessage>message;
	return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
}
