using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Collections.Generic;
using System.Linq;

namespace overwolf.plugins {
	public class Bootstrapper {
		public enum Status {
			None = 0,
			Starting = 1,
			Downloading = 2,
			Unpacking = 3,
			Finished = 4,
			Error = 5,
		}
		public Status status;

		public event Action<object> progressChanged;

		public void StartDownload(string packageUri, string appPath, string version) {
			try {
				progressChanged?.Invoke(new {
					status = (int)Status.None,
				});

				var packagePath = appPath + "\\" + version;
				var bundlePath = packagePath + "\\bundle.js";

				if (!Directory.Exists(appPath)) {
					Directory.CreateDirectory(appPath);
				}

				if (Directory.Exists(packagePath)) {
					progressChanged?.Invoke(new {
						status = (int)Status.Finished,
						bundle = File.ReadAllText(bundlePath),
					});
					return;
				}

				var client = new WebClient();
				client.DownloadProgressChanged += (sender, e) => {
					progressChanged?.Invoke(new {
						status = (int)Status.Downloading,
						current = (int)e.BytesReceived,
						total = (int)e.TotalBytesToReceive,
					});
				};
				client.DownloadDataCompleted += (sender, e) => {
					progressChanged?.Invoke(new {
						status = (int)Status.Unpacking,
					});

					var archive = new ZipArchive(new MemoryStream(e.Result));
					Directory.CreateDirectory(packagePath);
					archive.ExtractToDirectory(packagePath);

					var fileArray = Directory.GetFiles(packagePath + "\\extension")
						.Select(fullPath => Path.GetFileName(fullPath))
						.Where(file =>
							(file != "bootstrapper.dll") &&
							(file != "bootstrapper64.dll") &&
							(file != "simple-io-plugin.dll") &&
							(file != "simple-io-plugin64.dll")
						)
						.ToList();

					foreach (var file in fileArray) {
						if (File.Exists(appPath + "\\" + file)) {
							File.Delete(appPath + "\\" + file);
						}
						File.Move(packagePath + "\\extension\\" + file, appPath + "\\" + file);
					}

					progressChanged?.Invoke(new {
						status = (int)Status.Finished,
						bundle = File.ReadAllText(bundlePath),
					});
				};

				progressChanged?.Invoke(new {
					status = (int)Status.Starting,
				});

				client.DownloadDataAsync(new Uri(packageUri));
			} catch (Exception e) {
				progressChanged?.Invoke(new {
					status = (int)Status.Error,
					message = e.ToString(),
				});
			}
		}
	}
}
