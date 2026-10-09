// CottonBook desktop shell.
// The whole application is the bundled web page in ../src; this shell just
// gives it a native window, so there is no server and no network dependency.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running CottonBook");
}
