#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|_app| {
      // Setup code can go here if needed
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}