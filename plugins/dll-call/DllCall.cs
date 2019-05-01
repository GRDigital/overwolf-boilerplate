using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace overwolf.plugins {
	public partial class DllCall {
		public static string StringFromNativeUtf8(IntPtr nativeUtf8) {
			var len = 0;
			while (Marshal.ReadByte(nativeUtf8, len) != 0) ++len;
			var buffer = new byte[len];
			Marshal.Copy(nativeUtf8, buffer, 0, buffer.Length);
			return Encoding.UTF8.GetString(buffer);
		}

		[StructLayout(LayoutKind.Sequential)]
		public struct ResultI32 {
			public Int32 value;
			public byte success;
		}

		[StructLayout(LayoutKind.Sequential)]
		public struct ResultU32 {
			public UInt32 value;
			public byte success;
		}

		[StructLayout(LayoutKind.Sequential)]
		public struct ResultCharPtr {
			public IntPtr value;
			public byte success;
		}

		[StructLayout(LayoutKind.Sequential)]
		public struct ResultVoid {
			public IntPtr value;
			public byte success;
		}

		public delegate void FFIActionString(IntPtr ptr);
	}
}
