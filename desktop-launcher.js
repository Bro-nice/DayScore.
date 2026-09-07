// DayScore Desktop Standalone Launcher for Windows, Mac & Linux
const path = require('path');
const { exec } = require('child_process');

console.log(`
========================================================================
                    DayScore AI - Desktop Application
========================================================================
 [✓] Local Server initializing on http://localhost:3000 ...
`);

// Set production environment
process.env.NODE_ENV = 'production';

// Open browser helper function
function openBrowser(url) {
  const platform = process.platform;
  let command = '';
  
  if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  try {
    exec(command, (err) => {
      if (err) {
        console.log(`\n Note: Open ${url} manually in your web browser.\n`);
      }
    });
  } catch {
    console.log(`\n Note: Open ${url} manually in your web browser.\n`);
  }
}

// Load the full standalone server logic
try {
  require('./dist/standalone-server.cjs');
  
  // Wait 1.5 seconds for the server to bind, then launch the browser
  setTimeout(() => {
    console.log(`
========================================================================
 [✓] DayScore is now running!
 [✓] Opening your default browser to http://localhost:3000 ...

 Keep this window open while using DayScore.
 Press Ctrl + C at any time to safely shut down.
========================================================================
`);
    openBrowser('http://localhost:3000');
  }, 1200);
} catch (err) {
  console.error('Error starting DayScore Desktop:', err);
}
