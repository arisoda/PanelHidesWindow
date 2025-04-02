/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* exported init */

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';

let signalId = null;

function init() {
  // Initialization code
}

export default class PanelHidesWindowExtension {

	enable() {
		let topPanel = Main.panel;
		let topMonitor = global.display.get_primary_monitor(); // Get the primary monitor

		// Attach the button-press-event to the top panel
		signalId = topPanel.connect('button-press-event', function (widget, event) {
		// Check if the middle mouse button was clicked
		if (event.get_button() === 2) {
			// Middle mouse click detected

			// Get the stack of windows
			let windows = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, null);
			
			// Find the topmost maximized window on the same monitor as the top panel
			let topmostMaximizedWindow = null;
			let topmostWindowLayer = -1;

			for (let i = 0; i < windows.length; i++) {
			  let window = windows[i];

			  // Check if the window is maximized and on the same monitor
			  if (
			    window.maximized_horizontally &&
			    window.maximized_vertically &&
			    window.get_monitor() === topMonitor
			  ) {
			    let windowLayer = window.get_layer();
			    
			    // Check if the window is at the top layer
			    if (windowLayer > topmostWindowLayer) {
			      topmostMaximizedWindow = window;
			      topmostWindowLayer = windowLayer;
			    }
			  }
			}

			// Hide the topmost maximized window on the same monitor, if found
			if (topmostMaximizedWindow) {
			  topmostMaximizedWindow.minimize();
			}
		}
		});
	}
	
	disable() {
		if (signalId) {
		  // Disconnect the signal connection if it exists
		  Main.panel.disconnect(signalId);
		  signalId = null;
		}
	}
}
