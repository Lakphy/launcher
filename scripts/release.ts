#!/usr/bin/env bun

import { $ } from "bun";
import {
  access,
  mkdir,
  mkdtemp,
  readlink,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { defaultDownloadUrlPrefix, generateAppcast } from "./appcast";
import { extractReleaseNotes } from "./changelog";

const appName = "Launcher";
const executableName = "Launcher";
const jsReplExecutableName = "launcher_js_repl";
const daemonExecutableName = "launcher-daemon";
const computerUseHelperName = "Launcher Computer Use";
const packageName = "launcher";
const defaultNotaryProfile = "NOTARY";
const projectRoot = resolve(import.meta.dir, "..");

const help = `Build, notarize, and publish a production release of Launcher.

Usage:
  bun run release [options]

The default run builds a DMG and update archive under dist/ for the GitHub
Release workflow to attach. Developer ID signing, notarization, and the
Sparkle feed run only when their keys are configured; otherwise those steps
are skipped and the build is ad-hoc signed.

Options:
  --local                       Accepted for CI. Artifacts are always written
                                locally; nothing is uploaded
  --output <path>               DMG output path (default: dist/Launcher-<version>.dmg)
  --signing-identity <name>     Developer ID Application identity selector
                                (or LAUNCHER_SIGNING_IDENTITY; omitted means ad-hoc)
  --notary-profile <name>       notarytool keychain profile
                                (default: NOTARY; or LAUNCHER_NOTARY_PROFILE)
  --build-number <number>       CFBundleVersion override (or LAUNCHER_BUILD_NUMBER;
                                default derives a monotonic number from the
                                Cargo version)
  --volume-name <name>          Mounted DMG name (default: Launcher)
  --skip-build                  Reuse target/release/launcher, launcher_js_repl, and
                                launcher-daemon
  --skip-notarize               Unnotarized signed DMG (implies --local)
  --adhoc                       Ad-hoc sign, no notarization (implies --local)
  --help                        Show this help

Environment:
  LAUNCHER_SIGNING_IDENTITY         Developer ID identity; unset skips to ad-hoc
  LAUNCHER_ANALYTICS_ENDPOINT       optional analytics endpoint embedded at build
  LAUNCHER_ANALYTICS_WEBSITE_ID     optional analytics website ID embedded at build
  LAUNCHER_DOWNLOAD_URL_PREFIX      base URL for archive links
                                (default: ${defaultDownloadUrlPrefix})
  SPARKLE_BIN                   Sparkle tools dir (default: the bundle.sh cache
                                under .launcher-cache/sparkle)
  SPARKLE_PRIVATE_KEY           EdDSA private key; unset skips the update feed

See RELEASING.md for Apple notarization and the Sparkle key.
`;

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    adhoc: { type: "boolean" },
    "build-number": { type: "string" },
    help: { type: "boolean", short: "h" },
    local: { type: "boolean" },
    "notary-profile": { type: "string" },
    output: { type: "string", short: "o" },
    "signing-identity": { type: "string" },
    "skip-build": { type: "boolean" },
    "skip-notarize": { type: "boolean" },
    "volume-name": { type: "string" },
  },
  strict: true,
});

if (values.help) {
  console.log(help);
  process.exit(0);
}

if (process.platform !== "darwin") {
  throw new Error("DMG packaging must run on macOS.");
}

function requireTool(name: string): void {
  if (!Bun.which(name)) {
    throw new Error(`Required tool not found in PATH: ${name}`);
  }
}

function logStep(message: string): void {
  console.log(`\n==> ${message}`);
}

type CargoMetadata = {
  packages: Array<{
    name: string;
    version: string;
  }>;
};

/** CFBundleVersion derived from the Cargo version. Sparkle decides which of
 *  two builds is newer by comparing this value, so it must grow with every
 *  release: three digits per semver field keep 0.2.0 → 2000 ahead of
 *  0.1.9 → 1009, and every release ahead of the pre-Sparkle DMGs that
 *  shipped CFBundleVersion 1. */
function derivedBuildNumber(version: string): string {
  const match = version.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?:-|$)/);
  const major = Number(match?.[1]);
  const minor = Number(match?.[2]);
  const patch = Number(match?.[3]);
  if (![major, minor, patch].every(Number.isInteger)) {
    throw new Error(
      `Cannot derive a build number from version "${version}"; ` +
        "pass --build-number.",
    );
  }
  return String(major * 1_000_000 + minor * 1_000 + patch);
}

const skipNotarize = values["skip-notarize"] ?? false;
const configuredSigningIdentity = (
  values["signing-identity"] ??
  process.env.LAUNCHER_SIGNING_IDENTITY ??
  ""
).trim();
let adhoc = values.adhoc ?? false;
const notaryProfile =
  values["notary-profile"] ??
  process.env.LAUNCHER_NOTARY_PROFILE ??
  defaultNotaryProfile;
const explicitBuildNumber =
  values["build-number"] ?? process.env.LAUNCHER_BUILD_NUMBER;
const analyticsEndpoint = process.env.LAUNCHER_ANALYTICS_ENDPOINT?.trim();
const analyticsWebsiteId = process.env.LAUNCHER_ANALYTICS_WEBSITE_ID?.trim();
const localOnly = values.local ?? false;
const downloadUrlPrefix =
  process.env.LAUNCHER_DOWNLOAD_URL_PREFIX ?? defaultDownloadUrlPrefix;

if (adhoc && values["signing-identity"]) {
  throw new Error("Use either --adhoc or --signing-identity, not both.");
}
if (!adhoc && !configuredSigningIdentity) {
  console.warn(
    "No Developer ID signing identity configured. Ad-hoc signing this build and skipping notarization.",
  );
  adhoc = true;
}
// A full release is a Developer ID-signed, notarized DMG.
const fullRelease = !localOnly && !adhoc && !skipNotarize;
if (explicitBuildNumber && !/^\d+(?:\.\d+){0,2}$/.test(explicitBuildNumber)) {
  throw new Error(
    "--build-number must contain one to three period-separated integers.",
  );
}
if (!analyticsEndpoint || !analyticsWebsiteId) {
  console.warn(
    "Analytics endpoint is not configured. This build will not send usage data.",
  );
}

for (const tool of [
  "cargo",
  "codesign",
  "create-dmg",
  "diskutil",
  "ditto",
  "plutil",
  "xattr",
]) {
  requireTool(tool);
}
if (!adhoc && !skipNotarize) {
  requireTool("xcrun");
  requireTool("spctl");
}

process.chdir(projectRoot);

const metadata = JSON.parse(
  await $`cargo metadata --no-deps --format-version 1`.quiet().text(),
) as CargoMetadata;
const cargoPackage = metadata.packages.find(
  (candidate) => candidate.name === packageName,
);
if (!cargoPackage) {
  throw new Error(`Cargo package "${packageName}" was not found.`);
}

const version = cargoPackage.version;
const shortVersion = version.split("-", 1)[0];
const buildNumber = explicitBuildNumber ?? derivedBuildNumber(version);
const dmgName = `${appName}-${version}.dmg`;
const zipName = `${appName}-${version}.zip`;
if (fullRelease && version !== shortVersion) {
  throw new Error(
    `Version ${version} is a prerelease, and the appcast serves a single ` +
      "stable channel. Release a stable version, or build with --local.",
  );
}
if (!fullRelease) {
  const reason = localOnly ? "--local" : adhoc ? "--adhoc" : "--skip-notarize";
  console.log(`Building a local release (${reason}).`);
}

const outputPath = resolve(
  projectRoot,
  values.output ?? join("dist", dmgName),
);
const volumeName = values["volume-name"] ?? appName;
const releaseDirectory = resolve(
  projectRoot,
  process.env.CARGO_TARGET_DIR ?? "target",
  "release",
);
const releaseExecutable = join(releaseDirectory, packageName);
const releaseJsReplExecutable = join(
  releaseDirectory,
  jsReplExecutableName,
);
const releaseDaemonExecutable = join(releaseDirectory, daemonExecutableName);
const appBundle = join(releaseDirectory, `${appName}.app`);
const contentsDirectory = join(appBundle, "Contents");
const bundledJsReplExecutable = join(
  contentsDirectory,
  "Resources",
  jsReplExecutableName,
);
const bundledDaemonExecutable = join(
  contentsDirectory,
  "MacOS",
  daemonExecutableName,
);
const bundledComputerUseSkill = join(
  contentsDirectory,
  "Resources",
  "skills",
  "launcher-computer-use",
  "SKILL.md",
);
const bundledPiComputerUseExtension = join(
  contentsDirectory,
  "Resources",
  "computer-use",
  "pi-extension.ts",
);
const bundledComputerUseHelper = join(
  contentsDirectory,
  "Helpers",
  `${computerUseHelperName}.app`,
);
const bundledSparkleFramework = join(
  contentsDirectory,
  "Frameworks",
  "Sparkle.framework",
);

async function verifyJavaScriptRepl(executable: string): Promise<void> {
  const child = Bun.spawn([executable], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  const requests = [
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "launcher-release", version: "1" },
      },
    },
    { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "js",
        arguments: { code: "jsRepl.write(typeof cua);" },
      },
    },
  ];
  child.stdin.write(
    `${requests.map((request) => JSON.stringify(request)).join("\n")}\n`,
  );
  child.stdin.end();
  const stdout = await new Response(child.stdout).text();
  const stderr = await new Response(child.stderr).text();
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(
      `Bundled JavaScript REPL exited with ${exitCode}: ${stderr.trim()}`,
    );
  }
  const responses = stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const tools = responses
    .find((response) => response.id === 2)
    ?.result?.tools?.map((tool: { name?: string }) => tool.name);
  if (JSON.stringify(tools) !== JSON.stringify(["js", "js_reset"])) {
    throw new Error(
      `Bundled JavaScript REPL exposed unexpected tools: ${stdout}`,
    );
  }
  const lazySky = responses.find((response) => response.id === 3)
    ?.result?.content?.[0]?.text;
  if (lazySky !== "undefined") {
    throw new Error(`Bundled JavaScript REPL initialized sky eagerly: ${stdout}`);
  }
}

if (extname(outputPath).toLowerCase() !== ".dmg") {
  throw new Error(`Output path must end in .dmg: ${outputPath}`);
}
if (
  !volumeName.trim() ||
  volumeName.includes("/") ||
  volumeName.length > 27
) {
  throw new Error(
    "--volume-name must be non-empty, at most 27 characters, and cannot contain '/'.",
  );
}

let temporaryDirectory: string | undefined;
let mountedDmg = false;
let mountDirectory: string | undefined;
const identity = adhoc ? "-" : configuredSigningIdentity!;

try {
  if (values["skip-build"]) {
    for (const executable of [
      releaseExecutable,
      releaseJsReplExecutable,
      releaseDaemonExecutable,
    ]) {
      try {
        await access(executable);
      } catch {
        throw new Error(
          `Release executable not found at ${executable}. ` +
            "Run without --skip-build first.",
        );
      }
    }
  }

  logStep(
    values["skip-build"]
      ? "Assembling the app bundle"
      : "Building and assembling the app bundle",
  );
  await $`env LAUNCHER_CODESIGN_IDENTITY=${identity} LAUNCHER_ANALYTICS_ENDPOINT=${analyticsEndpoint ?? ""} LAUNCHER_ANALYTICS_WEBSITE_ID=${analyticsWebsiteId ?? ""} LAUNCHER_SKIP_CARGO_BUILD=${values["skip-build"] ? "1" : "0"} ${join(projectRoot, "scripts", "bundle.sh")} release`;
  for (const artifact of [
    join(contentsDirectory, "MacOS", executableName),
    bundledDaemonExecutable,
    bundledJsReplExecutable,
    bundledComputerUseSkill,
    bundledPiComputerUseExtension,
    bundledComputerUseHelper,
    join(bundledSparkleFramework, "Sparkle"),
  ]) {
    await access(artifact);
  }
  await $`plutil -replace CFBundleShortVersionString -string ${shortVersion} ${join(contentsDirectory, "Info.plist")}`;
  await $`plutil -replace CFBundleVersion -string ${buildNumber} ${join(contentsDirectory, "Info.plist")}`;
  await $`xattr -cr ${appBundle}`;

  await $`codesign --verify --strict --verbose=2 ${bundledJsReplExecutable}`;
  await $`codesign --verify --strict --verbose=2 ${bundledDaemonExecutable}`;
  await $`codesign --verify --deep --strict --verbose=2 ${bundledComputerUseHelper}`;
  await verifyJavaScriptRepl(bundledJsReplExecutable);
  logStep(
    adhoc
      ? "Ad-hoc signing the final app bundle"
      : `Signing the final app bundle as ${identity}`,
  );
  if (adhoc) {
    // No hardened runtime here: an ad-hoc identity carries no Team ID, so
    // library validation would refuse the embedded Sparkle framework and the
    // updater could never be exercised from an ad-hoc build.
    await $`codesign --force --sign - ${appBundle}`;
  } else {
    await $`codesign --force --options runtime --timestamp --sign ${identity} ${appBundle}`;
  }
  await $`codesign --verify --deep --strict --verbose=2 ${appBundle}`;

  temporaryDirectory = await mkdtemp(join(tmpdir(), "launcher-dmg-"));
  const stagingDirectory = join(temporaryDirectory, "root");
  mountDirectory = join(temporaryDirectory, "mount");
  await mkdir(stagingDirectory);
  // ditto, not fs.cp: fs.cp rewrites the Sparkle framework's relative
  // symlinks into absolute paths under target/, which breaks the framework
  // on any other machine and fails the deep verify below.
  await $`ditto ${appBundle} ${join(stagingDirectory, `${appName}.app`)}`;
  await mkdir(dirname(outputPath), { recursive: true });
  await rm(outputPath, { force: true });

  logStep(`Creating the styled DMG at ${outputPath}`);
  await $`create-dmg --volname ${volumeName} --window-pos 200 120 --window-size 660 400 --text-size 13 --icon-size 128 --icon ${`${appName}.app`} 180 178 --hide-extension ${`${appName}.app`} --app-drop-link 480 178 --filesystem APFS --format ULFO --no-internet-enable --overwrite ${outputPath} ${stagingDirectory}`;

  logStep(adhoc ? "Ad-hoc signing the DMG" : "Signing the DMG");
  if (adhoc) {
    await $`codesign --force --sign - ${outputPath}`;
  } else {
    await $`codesign --force --timestamp --sign ${identity} ${outputPath}`;
  }
  await $`codesign --verify --verbose=2 ${outputPath}`;

  logStep("Verifying the DMG contents");
  await mkdir(mountDirectory);
  await $`diskutil image attach --readOnly --mountOptions nobrowse --mountPoint ${mountDirectory} ${outputPath}`;
  mountedDmg = true;
  const mountedApp = join(mountDirectory, `${appName}.app`);
  const mountedContents = join(mountedApp, "Contents");
  const mountedJsRepl = join(
    mountedContents,
    "Resources",
    jsReplExecutableName,
  );
  const mountedDaemon = join(
    mountedContents,
    "MacOS",
    daemonExecutableName,
  );
  const mountedComputerUseHelper = join(
    mountedContents,
    "Helpers",
    `${computerUseHelperName}.app`,
  );
  const mountedSparkleFramework = join(
    mountedContents,
    "Frameworks",
    "Sparkle.framework",
  );
  for (const artifact of [
    join(mountedContents, "MacOS", executableName),
    mountedDaemon,
    mountedJsRepl,
    join(
      mountedContents,
      "Resources",
      "skills",
      "launcher-computer-use",
      "SKILL.md",
    ),
    join(
      mountedContents,
      "Resources",
      "computer-use",
      "pi-extension.ts",
    ),
    mountedComputerUseHelper,
    join(mountedSparkleFramework, "Sparkle"),
  ]) {
    await access(artifact);
  }
  await access(join(mountDirectory, ".DS_Store"));
  const applicationsTarget = await readlink(
    join(mountDirectory, "Applications"),
  );
  if (applicationsTarget !== "/Applications") {
    throw new Error(
      `DMG Applications link points to "${applicationsTarget}", expected "/Applications".`,
    );
  }
  await $`codesign --verify --strict --verbose=2 ${mountedJsRepl}`;
  await $`codesign --verify --strict --verbose=2 ${mountedDaemon}`;
  await $`codesign --verify --deep --strict --verbose=2 ${mountedComputerUseHelper}`;
  await $`codesign --verify --strict --verbose=2 ${mountedSparkleFramework}`;
  await $`codesign --verify --deep --strict --verbose=2 ${mountedApp}`;
  await verifyJavaScriptRepl(mountedJsRepl);
  await $`diskutil eject ${mountDirectory}`;
  mountedDmg = false;

  if (!adhoc && !skipNotarize) {
    logStep("Submitting the DMG for Apple notarization");
    const resultText =
      await $`xcrun notarytool submit ${outputPath} --keychain-profile ${notaryProfile!} --wait --output-format json`
        .quiet()
        .text();
    const result = JSON.parse(resultText) as {
      id?: string;
      message?: string;
      status?: string;
    };
    if (result.status !== "Accepted") {
      throw new Error(
        `Notarization ${result.status ?? "failed"}${result.id ? ` (${result.id})` : ""}: ` +
          (result.message ?? "inspect the submission with notarytool log"),
      );
    }
    console.log(`Notarization accepted: ${result.id ?? "unknown submission"}`);

    logStep("Stapling and assessing the notarized DMG");
    await $`xcrun stapler staple -v ${outputPath}`;
    await $`xcrun stapler validate -v ${outputPath}`;
    await $`spctl --assess --type open --context context:primary-signature --verbose=2 ${outputPath}`;
    // Notarizing the DMG also notarized the app's code, so the same
    // submission staples the app for the Sparkle archive.
    logStep("Stapling the app for the update archive");
    await $`xcrun stapler staple -v ${appBundle}`;
  } else if (adhoc) {
    console.warn(
      "\nCreated an ad-hoc signed DMG. It is suitable for local testing only.",
    );
  } else {
    console.warn(
      "\nCreated a Developer ID-signed DMG without notarization. " +
        "Gatekeeper will reject it on other Macs until it is notarized.",
    );
  }

  const zipPath = resolve(projectRoot, "dist", zipName);
  await mkdir(dirname(zipPath), { recursive: true });
  logStep(`Packaging ${zipName}`);
  await $`ditto -c -k --keepParent ${appBundle} ${zipPath}`;

  // This release's zip and notes. GitHub Releases keeps older assets, so the
  // appcast for this run covers the version being built.
  const updatesDirectory = join(projectRoot, "dist", "updates");
  await rm(updatesDirectory, { force: true, recursive: true });
  await mkdir(updatesDirectory, { recursive: true });

  await $`ditto ${zipPath} ${join(updatesDirectory, zipName)}`;

  // Release notes: this version's CHANGELOG.md section ships next to the
  // archive as Launcher-<version>.md; generate_appcast links it as the update's
  // release notes, which Sparkle renders in the prompt.
  const changelogFile = Bun.file(join(projectRoot, "CHANGELOG.md"));
  const notes = (await changelogFile.exists())
    ? extractReleaseNotes(await changelogFile.text(), version)
    : null;
  const notesName = `${appName}-${version}.md`;
  const notesContents = `${notes ?? "See CHANGELOG.md for details."}\n`;
  await Bun.write(join(updatesDirectory, notesName), notesContents);
  // The release workflow attaches dist/ files to the GitHub Release. Keep the
  // notes beside the appcast so the release-notes URL can resolve.
  await Bun.write(join(projectRoot, "dist", notesName), notesContents);
  console.log(
    notes
      ? `Attached release notes for ${version}.`
      : `No "${version}" section in CHANGELOG.md — attached fallback notes.`,
  );

  if (!process.env.SPARKLE_PRIVATE_KEY?.trim()) {
    console.warn(
      "No SPARKLE_PRIVATE_KEY configured. Skipping the signed update feed.",
    );
  } else {
    logStep("Generating the signed appcast");
    await generateAppcast(updatesDirectory, downloadUrlPrefix);
    await $`ditto ${join(updatesDirectory, "appcast.xml")} ${join(projectRoot, "dist", "appcast.xml")}`;
  }

  console.log(`\nDMG ready: ${outputPath}`);
  console.log(`ZIP ready: ${zipPath}`);
} finally {
  if (mountedDmg && mountDirectory) {
    const result = await $`diskutil eject ${mountDirectory}`.quiet().nothrow();
    if (result.exitCode === 0) {
      mountedDmg = false;
    } else {
      console.warn(`Unable to detach temporary mount at ${mountDirectory}.`);
    }
  }
  if (temporaryDirectory && !mountedDmg) {
    await rm(temporaryDirectory, { force: true, recursive: true });
  } else if (temporaryDirectory) {
    console.warn(`Temporary files retained at ${temporaryDirectory}.`);
  }
}
