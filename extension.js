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

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class PanelHidesWindowExtension extends Extension {
    enable() {
        // Load custom schema from local schemas directory
        const schemaDir = GLib.build_filenamev([this.path, 'schemas']);
        const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
            schemaDir,
            Gio.SettingsSchemaSource.get_default(),
            false
        );

        const schemaObj = schemaSource.lookup('org.gnome.shell.extensions.panelhideswindow', true);
        this.settings = new Gio.Settings({ settings_schema: schemaObj });

        const topPanel = Main.panel;
        const topMonitor = global.display.get_primary_monitor(); // Get primary monitor

        // Attach middle-click event handler to the top panel
        this.signalId = topPanel.connect('button-press-event', (widget, event) => {
            if (event.get_button() === 2) { // Middle mouse click
                let windows = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, null);
                let targetWindow = null;

                if (this.settings.get_boolean('hide-focused-instead')) {
                    // Hide currently focused window if on primary monitor
                    const focused = global.display.get_focus_window();
                    if (focused && focused.get_monitor() === topMonitor)
                        targetWindow = focused;
                } else {
                    // Hide topmost maximized window on primary monitor
                    let topmostLayer = -1;
                    for (let window of windows) {
                        if (window.maximized_horizontally && window.maximized_vertically &&
                            window.get_monitor() === topMonitor) {
                            const windowLayer = window.get_layer();
                            if (windowLayer > topmostLayer) {
                                targetWindow = window;
                                topmostLayer = windowLayer;
                            }
                        }
                    }
                }

                if (targetWindow)
                    targetWindow.minimize(); // Minimize selected window
            }
        });
    }

    disable() {
        // Disconnect event handler on disable
        if (this.signalId) {
            Main.panel.disconnect(this.signalId);
            this.signalId = null;
        }
        this.settings = null;
    }
}

