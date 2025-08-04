# macOS Installation Troubleshooting

## The Problem

macOS will show warnings like:
- **"Roadmap Planner" is damaged and can't be opened. You should move it to the Bin.**
- **"Roadmap Planner" cannot be opened because the developer cannot be verified.**
- **"Roadmap Planner" cannot be opened because it is from an unidentified developer.**

This happens because the app isn't signed with an Apple Developer certificate.

## Solutions (Try in Order)

### ⭐ Solution 1: Complete Quarantine Removal (Most Effective)

1. **Download the .dmg file** from the GitHub releases page
2. **Open Terminal** (Applications → Utilities → Terminal)
3. **Run these commands one by one**:
   ```bash
   # Navigate to Downloads folder
   cd ~/Downloads
   
   # Remove quarantine from the DMG file
   sudo xattr -r -d com.apple.quarantine team-roadmap-planner*.dmg
   
   # Mount the DMG
   open team-roadmap-planner*.dmg
   
   # Wait for it to mount, then remove quarantine from the app inside
   sudo xattr -r -d com.apple.quarantine "/Volumes/Roadmap Planner/Roadmap Planner.app"
   
   # Copy to Applications
   cp -R "/Volumes/Roadmap Planner/Roadmap Planner.app" /Applications/
   
   # Remove quarantine from the copied app
   sudo xattr -r -d com.apple.quarantine "/Applications/Roadmap Planner.app"
   ```

### Solution 2: Bypass Gatekeeper Completely

1. **Download the .dmg file**
2. **Open Terminal**
3. **Temporarily disable Gatekeeper**:
   ```bash
   sudo spctl --master-disable
   ```
4. **Install the app normally** (double-click .dmg, drag to Applications)
5. **Re-enable Gatekeeper immediately**:
   ```bash
   sudo spctl --master-enable
   ```

### Solution 3: Manual Override with System Preferences

1. **Download and try to open** the .dmg file
2. **When you see "damaged" warning**, click "Move to Bin" 
3. **DON'T actually move it to bin** - click "Cancel" instead
4. **Go to Apple Menu** → System Preferences → Security & Privacy → General
5. **Look for "Allow apps downloaded from"** and temporarily select **"Anywhere"**
6. **Try opening the .dmg again**
7. **After installation, change back to "App Store and identified developers"**

### Solution 4: Force Allow in System Preferences

1. **Try to open the .dmg file** (it will be blocked)
2. **Immediately go to** Apple Menu → System Preferences → Security & Privacy → General
3. **You should see a message** like "team-roadmap-planner.dmg was blocked..." with an **"Open Anyway"** button
4. **Click "Open Anyway"**
5. **Confirm in the dialog that appears**

### Solution 5: Using Finder Info Panel

1. **Right-click the .dmg file** → Get Info
2. **In the "Open with" section**, click "Change All..."
3. **Select "DiskImageMounter"** if it's not already selected
4. **Try opening the file again**

### Solution 6: Terminal with Specific Attributes

```bash
# Check what security attributes are on the file
xattr -l ~/Downloads/team-roadmap-planner*.dmg

# Remove ALL extended attributes (more aggressive)
sudo xattr -c ~/Downloads/team-roadmap-planner*.dmg

# If the above doesn't work, try clearing the app after mounting:
sudo xattr -c "/Volumes/Roadmap Planner/Roadmap Planner.app"
sudo xattr -c -r "/Volumes/Roadmap Planner/Roadmap Planner.app"
```

### Solution 7: Download with Different Browser

Sometimes the browser adds additional security attributes:
1. **Try downloading with a different browser** (Safari, Firefox, Chrome)
2. **Try downloading with wget/curl in Terminal**:
   ```bash
   cd ~/Downloads
   curl -L -o roadmap-planner.dmg "https://github.com/your-username/repo/releases/download/v1.0.0/team-roadmap-planner_v1.0.0_universal.dmg"
   ```

## For Different macOS Versions

### macOS Monterey (12.0+) and Ventura (13.0+)
These versions are stricter. **Use Solution 1** (Complete Quarantine Removal) or **Solution 2** (Disable Gatekeeper).

### macOS Big Sur (11.0) and earlier
**Solution 3** (System Preferences) usually works.

## Still Not Working? Advanced Methods

### Method A: Create a New User Account
1. **Create a new user account** with admin privileges
2. **Log into that account**
3. **Try installing the app there**
4. **Copy the app to the main user's Applications folder**

### Method B: Boot from Recovery Mode
1. **Restart holding Cmd+R**
2. **Open Terminal from Utilities menu**
3. **Run**: `csrutil disable`
4. **Restart normally**
5. **Install the app**
6. **Boot to Recovery again and run**: `csrutil enable`

### Method C: Use a Different Installation Method
Try extracting the .dmg contents manually:
```bash
# Mount the DMG
hdiutil mount ~/Downloads/team-roadmap-planner*.dmg

# Copy the app
cp -R "/Volumes/Roadmap Planner/Roadmap Planner.app" ~/Desktop/

# Remove quarantine
sudo xattr -r -d com.apple.quarantine "~/Desktop/Roadmap Planner.app"

# Move to Applications
mv "~/Desktop/Roadmap Planner.app" /Applications/
```

## Check If It Worked

After installation, verify the app can run:
```bash
# Check if quarantine attributes are gone
xattr -l "/Applications/Roadmap Planner.app"

# Try running from Terminal (to see any error messages)
"/Applications/Roadmap Planner.app/Contents/MacOS/roadmap-planner"
```

## Emergency Fallback: Web Version

If absolutely nothing works, use the web version: [GitHub Pages URL]

## Why This Is So Difficult

- **macOS 12.0+ is extremely strict** about unsigned apps
- **Multiple security layers**: Gatekeeper, XProtect, System Integrity Protection
- **Each browser adds different attributes** to downloaded files
- **Apple actively makes this harder** to protect users from malware

## For Developers: Permanent Solution

The only way to eliminate this entirely:
1. **Apple Developer Account** ($99/year)
2. **Code signing certificate**
3. **Notarization process**
4. **Users get zero warnings**

---

**Still having issues?** Please [open a GitHub issue](https://github.com/your-username/roadmap-planner/issues) and tell us:
- Your exact macOS version
- Which methods you tried
- The exact error message you see
