import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const keystoreSrc = path.join(rootDir, 'resources', 'keystore', 'nullnotes.keystore');
const keystoreDest = path.join(rootDir, 'android', 'app', 'nullnotes.keystore');
const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');

if (!fs.existsSync(keystoreSrc)) {
  console.error(`Keystore not found at ${keystoreSrc}`);
  process.exit(1);
}

if (fs.existsSync(path.join(rootDir, 'android', 'app'))) {
  fs.copyFileSync(keystoreSrc, keystoreDest);
  console.log(`Copied keystore to ${keystoreDest}`);
} else {
  console.warn(`Android directory not found. Skipping gradle configuration.`);
  process.exit(0);
}

if (!fs.existsSync(gradlePath)) {
  console.warn(`build.gradle not found at ${gradlePath}`);
  process.exit(0);
}

let gradleContent = fs.readFileSync(gradlePath, 'utf8');

if (!gradleContent.includes('nullnotes.keystore')) {
  const signingBlock = `
    signingConfigs {
        release {
            storeFile file('nullnotes.keystore')
            storePassword 'nullnotes123'
            keyAlias 'nullnotes'
            keyPassword 'nullnotes123'
        }
    }
`;

  if (gradleContent.includes('buildTypes {')) {
    gradleContent = gradleContent.replace('buildTypes {', `${signingBlock}    buildTypes {`);
  }

  gradleContent = gradleContent.replace(
    /buildTypes\s*\{([\s\S]*?)release\s*\{/,
    `buildTypes {
        debug {
            signingConfig signingConfigs.release
        }
        release {
            signingConfig signingConfigs.release`
  );

  const runNum = process.env.GITHUB_RUN_NUMBER ? parseInt(process.env.GITHUB_RUN_NUMBER, 10) + 100 : 100;
  const verName = process.env.APP_VERSION || '0.3.0';

  gradleContent = gradleContent.replace(/versionCode \d+/, `versionCode ${runNum}`);
  gradleContent = gradleContent.replace(/versionName "[^"]+"/, `versionName "${verName}"`);

  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
  console.log(`Successfully patched android/app/build.gradle with permanent signing and versionCode ${runNum}`);
} else {
  console.log(`android/app/build.gradle already contains signing configuration.`);
}
