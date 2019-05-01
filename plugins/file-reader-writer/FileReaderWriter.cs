using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace overwolf.plugins {
	public struct FileOptShape {
		public int? from;
		public int? to;
		public int? chunkSize;
		public string mode;
	}

	public struct FileOpt {
		public int from;
		public int to;
		public int chunkSize;
		public FileMode mode;
	}

	public class FileReaderWriter {
		readonly Dictionary<string, (FileStream, FileOpt)> streams = new Dictionary<string, (FileStream, FileOpt)>();
		readonly Encoding enc = new UTF8Encoding(false, false);

		public void Open(string filePath, string optionsJson, Action<object> cb) {
			var optionsShape = Newtonsoft.Json.JsonConvert.DeserializeObject<FileOptShape>(optionsJson);

			var (mode, access) = ((Func<(FileMode, FileAccess)>)(() => {
				switch (optionsShape.mode) {
					case "Append": return (FileMode.Append, FileAccess.Write);
					case "Create": return (FileMode.Create, FileAccess.ReadWrite);
					case "Open": return (FileMode.Open, FileAccess.ReadWrite);
					default: throw new Exception();
				}
			}))();
			try {
				var stream = File.Open(filePath, mode, access);
				var options = new FileOpt {
					from = optionsShape.from ?? 0,
					to = optionsShape.to ?? (int)stream.Length,
					chunkSize = optionsShape.chunkSize ?? 64 * 1000,
					mode = mode,
				};
				if (mode == FileMode.Open) stream.Seek(options.from, SeekOrigin.Begin);
				streams[filePath] = (stream, options);
				cb(true);
			} catch {
				cb(false);
			}
		}

		public void Read(string filePath, Action<object> cb) {
			var (stream, options)  = streams[filePath];
			var data = new byte[options.chunkSize];
			var readBytes = stream.Read(data, 0, options.chunkSize);

			// have read past the stop point
			var done = (int)stream.Position >= options.to;
			if (done) readBytes = (int)(options.to - (stream.Position - readBytes));
			cb(new { data = enc.GetString(data, 0, readBytes), done });
		}

		public void Write(string filePath, string msg, Action<object> done) {
			var (stream, _) = streams[filePath];
			var bytes = enc.GetBytes(msg);
			stream.Write(bytes, 0, bytes.Length);
			done(bytes.Length);
		}

		public void Close(string filePath, Action<object> done) {
			var (stream, _) = streams[filePath];
			stream.Close();
			if (!streams.Remove(filePath)) throw new Exception();
			done(null);
		}

		public void Move(string oldPath, string newPath, Action<object> done) {
			File.Delete(newPath);
			File.Move(oldPath, newPath);
			done(null);
		}

		public void MoveDirectory(string oldPath, string newPath, Action<object> done) {
			if (Directory.Exists(newPath)) {
				Directory.Delete(newPath, true);
			}
			Directory.Move(oldPath, newPath);
			done(null);
		}

		public void Length(string filePath, Action<object> cb) {
			var info = new FileInfo(filePath);
			cb(info.Length);
		}

		public void Delete(string filePath, Action<object> cb) {
			try {
				File.Delete(filePath);
				cb(true);
			} catch {
				cb(false);
			}
		}

		public void DeleteDirectory(string path, Action<object> done) {
			if (Directory.Exists(path)) {
				Directory.Delete(path, true);
			}
			done(null);
		}

		public void CreateDirectory(string path, Action<object> done) {
			if (!Directory.Exists(path)) {
				Directory.CreateDirectory(path);
			}
			done(null);
		}

		public void SetReadonly(string path, bool status, Action<object> done) {
			FileInfo fileInfo = new FileInfo(path);
			fileInfo.IsReadOnly = status;
			done(null);
		}

		public void FileExists(string path, Action<object> done) {
			done(File.Exists(path));
		}
	}
}
