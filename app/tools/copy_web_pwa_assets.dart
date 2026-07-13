import 'dart:io';

void main() {
  final projectRoot = Directory.current;
  final source = File('${projectRoot.path}/web/spectra_service_worker.js');
  final target = File(
    '${projectRoot.path}/build/web/spectra_service_worker.js',
  );
  final buildInfoTarget = File(
    '${projectRoot.path}/build/web/spectra_build.json',
  );

  if (!source.existsSync()) {
    stderr.writeln('Missing ${source.path}');
    exitCode = 1;
    return;
  }

  final buildId = _resolveBuildId(projectRoot);
  final cacheName = 'spectra-calculator-$buildId';
  final sourceText = source.readAsStringSync();
  final serviceWorkerText = sourceText
      .replaceAll('__SPECTRA_BUILD_ID__', buildId)
      .replaceAll('__SPECTRA_CACHE_NAME__', cacheName);

  target.parent.createSync(recursive: true);
  target.writeAsStringSync(serviceWorkerText);
  buildInfoTarget.writeAsStringSync(
    '{'
    '"buildId":"$buildId",'
    '"cacheName":"$cacheName",'
    '"builtAt":"${DateTime.now().toUtc().toIso8601String()}"'
    '}',
  );

  stdout.writeln('Copied ${source.path} to ${target.path}');
  stdout.writeln('Wrote ${buildInfoTarget.path}');
}

String _resolveBuildId(Directory projectRoot) {
  const environmentKeys = [
    'SPECTRA_BUILD_ID',
    'CF_PAGES_COMMIT_SHA',
    'GITHUB_SHA',
  ];

  for (final key in environmentKeys) {
    final environmentBuildId = Platform.environment[key];
    if (environmentBuildId != null && environmentBuildId.trim().isNotEmpty) {
      return _sanitizeBuildId(environmentBuildId);
    }
  }

  final gitBuildId = _gitShortSha(projectRoot.parent);
  if (gitBuildId != null && gitBuildId.isNotEmpty) {
    return _sanitizeBuildId(gitBuildId);
  }

  return _sanitizeBuildId(DateTime.now().toUtc().toIso8601String());
}

String? _gitShortSha(Directory repoRoot) {
  try {
    final result = Process.runSync('git', [
      'rev-parse',
      '--short',
      'HEAD',
    ], workingDirectory: repoRoot.path);

    if (result.exitCode == 0) {
      return result.stdout.toString().trim();
    }
  } on Object {
    return null;
  }

  return null;
}

String _sanitizeBuildId(String value) {
  final sanitized = value
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9._-]+'), '-')
      .replaceAll(RegExp(r'-+'), '-')
      .replaceAll(RegExp(r'^-|-$'), '');

  return sanitized.isEmpty ? 'dev' : sanitized;
}
