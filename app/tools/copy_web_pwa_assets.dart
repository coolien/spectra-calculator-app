import 'dart:io';

void main() {
  final projectRoot = Directory.current;
  final source = File('${projectRoot.path}/web/spectra_service_worker.js');
  final target = File(
    '${projectRoot.path}/build/web/spectra_service_worker.js',
  );

  if (!source.existsSync()) {
    stderr.writeln('Missing ${source.path}');
    exitCode = 1;
    return;
  }

  target.parent.createSync(recursive: true);
  source.copySync(target.path);
  stdout.writeln('Copied ${source.path} to ${target.path}');
}
