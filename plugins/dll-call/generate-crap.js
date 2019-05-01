/* eslint-disable */
const fs = require("fs");

const modules = [
	{
		name: "logger",
		functions: [
			{
				name: "log",
				args: ["string", "UInt32", "string"],
				result: "void",
			},
			{
				name: "hook_up",
				args: [],
				result: "void",
			},
		],
	},
];

for (const module of modules) {
	console.log(`GENERATE ${module.name}.dll`);
	let moduleStr = `using System;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace overwolf.plugins {
	public partial class DllCall {
#if x86
		[DllImport("${module.name}.dll", EntryPoint="free_str")]
#elif x64
		[DllImport("${module.name}64.dll", EntryPoint="free_str")]
#else
#error undefined architecture
#endif
		static extern void ${module.name.replace(/-/g, "_")}_free_str(
			IntPtr ptr
		);
`;
	for (const fn of module.functions) {
		moduleStr += `#if x86
		[DllImport("${module.name}.dll")]
#elif x64
		[DllImport("${module.name}64.dll")]
#else
#error undefined architecture
#endif
		static extern ${fn.result} ${fn.name}(
			${fn.args.map((arg, i) => {
				switch (arg) {
					case "string": return `[MarshalAs(UnmanagedType.LPUTF8Str)] string arg${i}`;
					case "Int32": return `Int32 arg${i}`;
					case "UInt32": return `UInt32 arg${i}`;
					case "UInt64": return `UInt64 arg${i}`;
					case "Int32[]": return `[MarshalAs(UnmanagedType.LPArray)] Int32[] arg${i}, UInt64 arg${i}length`;
					case "UIntPtr[]": return `[MarshalAs(UnmanagedType.LPArray)] UIntPtr[] arg${i}, UInt64 arg${i}length`;
					case "bool": return `byte arg${i}`;
					case "FFIActionString": return `[MarshalAs(UnmanagedType.FunctionPtr)] FFIActionString arg${i}`;
					default: throw Error(arg);
				}
			}).join(",\n\t\t\t")}
		);

		${fn.args.map((arg, i) => {
			switch (arg) {
				case "string":
				case "Int32":
				case "UInt32":
				case "UInt64":
				case "Int32[]":
				case "UIntPtr[]":
				case "bool": return `// not a callback`;
				case "FFIActionString": return `public event Action<object> ${module.name.replace(/-/g, "_")}_${fn.name}_cb${i};`;
				default: throw Error(arg);
			}
		}).join(",\n\t\t")}

		public void ${module.name.replace(/-/g, "_")}_${fn.name}(
			${fn.args.length > 0 ? `${fn.args.map((arg, i) => {
				switch (arg) {
					case "string": return `string arg${i}`;
					case "Int32": return `int arg${i}`;
					case "UInt32": return `int arg${i}`;
					case "UInt64": return `int arg${i}`;
					case "Int32[]":
					case "UIntPtr[]": return `int[] arg${i}`;
					case "bool": return `bool arg${i}`;
					case "FFIActionString": return `// not a function argument`;
					default: throw Error(arg);
				}
			}).join(",\n\t\t\t")},
			Action<object> cb` :
			`Action<object> cb`
			}
		) {
			Task.Run(() => {
				try {
					${(fn.result === "void") ? "" : "var result = "}${fn.name}(
						${fn.args.map((arg, i) => {
							switch (arg) {
								case "string":
								case "Int32": return `arg${i}`;
								case "UInt32": return `(UInt32)arg${i}`;
								case "UInt64": return `(UInt64)arg${i}`;
								case "Int32[]": return `arg${i}.Select(i => (Int32)i).ToArray(), (UInt64)arg${i}.Length`;
								case "UIntPtr[]": return `arg${i}.Select(i => (UIntPtr)i).ToArray(), (UInt64)arg${i}.Length`;
								case "bool": return `arg${i} ? (byte)1 : (byte)0`
								case "FFIActionString": return `(textPtr => {
							if (${module.name.replace(/-/g, "_")}_${fn.name}_cb${i} == null) return;
							${module.name.replace(/-/g, "_")}_${fn.name}_cb${i}(StringFromNativeUtf8(textPtr));
							${module.name.replace(/-/g, "_")}_free_str(textPtr);
						})`;
								default: throw Error(arg);
							}
						}).join(",\n\t\t\t\t")}
					);

					${(() => {
						switch (fn.result) {
							case "void": return "cb(new { success = true });";
							case "ResultVoid": return "cb(new { success = (result.success == 1) });";
							case "ResultU32":
							case "ResultI32": return "cb(new { value = result.value, success = (result.success == 1) });";
							case "ResultCharPtr": return `if (result.success == 1) {
						cb(new { value = StringFromNativeUtf8(result.value), success = true });
						${module.name.replace(/-/g, "_")}_free_str(result.value);
					} else {
						cb(new { value = "", success = false });
					}`;
						}
					})()}
				} catch {
					cb(new { value = "", success = false });
				}
			});
		}
`;
	}

	moduleStr += `	}
}
`;

	fs.writeFileSync(`${module.name}.cs`, moduleStr);
}
