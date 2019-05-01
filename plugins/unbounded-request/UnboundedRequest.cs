using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace overwolf.plugins {
	public class UnboundedRequest {
		public void Request(string url, Action<object> callback) {
			if (callback == null) return;
			Task.Run(async () => {
				try {
					var client = new HttpClient();
					System.Net.ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
					System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;

					var res = await client.GetAsync(url);
					if (!res.IsSuccessStatusCode) {
						callback(new { value = res.ToString(), success = false });
						return;
					}
					callback(new { value = await res.Content.ReadAsStringAsync(), success = true });
				} catch (Exception e) {
					callback(new { value = e.ToString(), success = false });
				}
			});
		}

		public void DownloadFile(string url, string path, Action<object> callback) {
			if (callback == null) return;
			Task.Run(async () => {
				var client = new HttpClient();
				System.Net.ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
				System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;

				try {
					var res = await client.GetAsync(url);
					if (!res.IsSuccessStatusCode) {
						callback(false);
						return;
					}
					File.WriteAllBytes(path, await res.Content.ReadAsByteArrayAsync());
					callback(true);
				} catch {
					callback(false);
				}
			});
		}
	}
}
