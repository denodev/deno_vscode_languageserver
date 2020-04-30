/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	ConfigurationItem, ConfigurationParams, ConfigurationRequest
} from 'vscode-languageserver-protocol';

import { Feature, _RemoteWorkspace } from './main';

import * as Is from './utils/is';

export interface Configuration {
	getConfiguration(): Promise<any>;
	getConfiguration(section: string): Promise<any>;
	getConfiguration(item: ConfigurationItem): Promise<any>;
	getConfiguration(items: ConfigurationItem[]): Promise<any[]>;
}

export const ConfigurationFeature: Feature<_RemoteWorkspace, Configuration> = (Base) => {
	return class extends Base {

		getConfiguration(arg?: string | ConfigurationItem | ConfigurationItem[]): Promise<any> {
			if (!arg) {
				return this._getConfiguration({});
			} else if (Is.string(arg)) {
				return this._getConfiguration({ section: arg });
			} else {
				return this._getConfiguration(arg);
			}
		}

		private _getConfiguration(arg: ConfigurationItem | ConfigurationItem[]): Promise<any> {
			let params: ConfigurationParams = {
				items: Array.isArray(arg) ? arg : [arg]
			};
			return this.connection.sendRequest(ConfigurationRequest.type, params).then((result) => {
				return Array.isArray(arg) ? result : result[0];
			});
		}
	};
};
