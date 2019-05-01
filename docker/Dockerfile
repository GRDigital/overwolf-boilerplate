# escape=`

FROM mcr.microsoft.com/dotnet/framework/runtime:4.8-windowsservercore-ltsc2016

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

ADD https://download.microsoft.com/download/E/E/D/EEDF18A8-4AED-4CE0-BEBE-70A83094FC5A/BuildTools_Full.exe C:\TEMP\BuildTools_Full.exe
RUN C:\TEMP\BuildTools_Full.exe /Silent /Full

RUN Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
RUN choco install windows-sdk-10 -y
RUN choco install vcredist140 -y

RUN choco install git.install -y --params '/GitAndUnixToolsOnPath /NoAutoCrlf /NoShellIntegration /NoGuiHereIntegration /NoShellHereIntegration /SChannel'
RUN choco install visualcppbuildtools -y
RUN choco install rustup.install --ignore-checksums -y
RUN rustup self update
RUN rustup set profile minimal
RUN choco install nodejs.install -y
RUN setx /M PATH $('C:\Program Files (x86)\Windows Kits\10\App Certification Kit;' + $Env:PATH)
RUN rustup toolchain install nightly-2019-12-12
RUN rustup target add --toolchain nightly-2019-12-12 i686-pc-windows-msvc
RUN rustup target add --toolchain nightly-2019-12-12 x86_64-pc-windows-msvc
RUN rustup target add --toolchain nightly-2019-12-12 wasm32-unknown-unknown
RUN rustup run nightly-2019-12-12 cargo install cargo-web --force --version 0.6.25
RUN Remove-Item -path 'C:\TEMP' -recurse

CMD ["powershell.exe", "-NoLogo", "-ExecutionPolicy", "Bypass"]
