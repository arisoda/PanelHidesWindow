import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PanelHidesWindowPreferences extends ExtensionPreferences {
    getPreferencesWidget() {
        const schemaDir = GLib.build_filenamev([this.path, 'schemas']);
        const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
            schemaDir,
            Gio.SettingsSchemaSource.get_default(),
            false
        );
        const schemaObj = schemaSource.lookup('org.gnome.shell.extensions.panelhideswindow', true);
        const settings = new Gio.Settings({ settings_schema: schemaObj });

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Panel-Hides-Window Settings',
        });

        const toggleRow = new Adw.SwitchRow({
            title: 'Hide focused window instead of maximized window',
        });

        settings.bind('hide-focused-instead', toggleRow, 'active', Gio.SettingsBindFlags.DEFAULT);

        group.add(toggleRow);
        page.add(group);
        page._settings = settings; // keep settings alive
        return page;
    }
}

