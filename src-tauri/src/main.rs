// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You're running Roadmap Planner!", name)
}

// Custom command to save roadmap data to file
#[tauri::command]
async fn save_roadmap(data: String, path: String) -> Result<(), String> {
    use std::fs::File;
    use std::io::Write;
    
    match File::create(&path) {
        Ok(mut file) => {
            match file.write_all(data.as_bytes()) {
                Ok(_) => Ok(()),
                Err(e) => Err(format!("Failed to write file: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create file: {}", e)),
    }
}

// Custom command to load roadmap data from file
#[tauri::command]
async fn load_roadmap(path: String) -> Result<String, String> {
    use std::fs;
    
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, save_roadmap, load_roadmap])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
