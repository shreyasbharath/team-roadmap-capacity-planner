# macOS Installation Troubleshooting

## The Problem

macOS will show warnings like:
- **"Roadmap Planner" is damaged and can't be opened. You should move it to the Bin.**
- **"Roadmap Planner" cannot be opened because the developer cannot be verified.**
- **"Roadmap Planner" cannot be opened because it is from an unidentified developer.**

This happens because the app isn't signed with an Apple Developer certificate.

## Solutions (Try in Order)

### Solution 1: Terminal Command (Most Reliable)

1. **Download the .dmg file** from the GitHub releases page
2. **Open Terminal** (Applications → Utilities → Terminal)
3. **Run this command** (replace the filename if different):
   ```bash
   xattr -d com.apple.quarantine ~/Downloads/team-roadmap-planner*.dmg
   ```
4. **Double-click the .dmg file** - it should open normally now
5. **Drag the app to Applications folder**

### Solution 2: System Preferences Method

1. **Download and try to open** the .dmg file
2. **When you see the warning**, click "Move to Bin" or "Cancel"
3. **Go to System Preferences** → Security & Privacy → General tab
4. **Look for a message** about the blocked app with an "Open Anyway" button
5. **Click "Open Anyway"**
6. **Confirm** by clicking "Open" in the next dialog
7. **The .dmg should now open** - drag the app to Applications

### Solution 3: Right-Click Method

1. **Download the .dmg file**
2. **Right-click** (or Control+click) on the .dmg file
3. **Select "Open"** from the context menu
4. **Click "Open"** in the security dialog
5. **Drag the app to Applications folder**

### Solution 4: Temporarily Disable Gatekeeper

⚠️ **Use with caution** - only as a last resort:

1. **Open Terminal**
2. **Disable Gatekeeper temporarily**:
   ```bash
   sudo spctl --master-disable
   ```
3. **Install the app normally**
4. **Re-enable Gatekeeper immediately**:
   ```bash
   sudo spctl --master-enable
   ```

### Solution 5: Advanced Terminal Commands

If the basic `xattr` command doesn't work:

```bash
# More comprehensive quarantine removal
sudo xattr -r -d com.apple.quarantine ~/Downloads/team-roadmap-planner*.dmg

# If the app is already in Applications and won't run:
sudo xattr -r -d com.apple.quarantine /Applications/Roadmap\ Planner.app

# Check what attributes are set:
xattr -l ~/Downloads/team-roadmap-planner*.dmg
```

### Solution 6: Using Finder's Info Panel

1. **Right-click the .dmg file** → Get Info
2. **In the "Open with" section**, try changing the default application
3. **Try opening again**

## Different Error Messages & Solutions

### "Damaged and can't be opened"
- **Use Solution 1** (Terminal xattr command)
- This is the most common and usually works

### "From an unidentified developer"
- **Use Solution 2** (System Preferences)
- **Or Solution 3** (Right-click method)

### "Cannot be opened because Apple cannot check it for malicious software"
- **Use Solution 2** (System Preferences method)
- Look for the "Open Anyway" button

### App opens but then crashes immediately
- **The app itself might have an issue**
- Try running from Terminal to see error messages:
  ```bash
  /Applications/Roadmap\ Planner.app/Contents/MacOS/roadmap-planner
  ```

## Still Not Working?

### Check Your macOS Version
- **macOS 10.15+** (Catalina and newer) have stricter security
- **Try Solution 1** (Terminal method) - most reliable across versions

### Check System Integrity Protection (SIP)
```bash
# Check if SIP is enabled
csrutil status

# If SIP is disabled, some methods might not work as expected
```

### Alternative: Use the Web Version
If none of these work, you can always use the web version at: [GitHub Pages URL]

## Why This Happens

- **No Apple Developer Certificate**: The app isn't signed with a $99/year Apple Developer account
- **Gatekeeper Protection**: macOS blocks unsigned apps by default to protect users
- **Not Actually Damaged**: The app is perfectly safe - this is just a security measure

## For Developers

To avoid this issue entirely:
1. **Get Apple Developer Account** ($99/year)
2. **Generate certificates**
3. **Add code signing to CI/CD pipeline**
4. **Apps will install without warnings**

---

**Need more help?** [Open an issue on GitHub](https://github.com/your-username/roadmap-planner/issues)
